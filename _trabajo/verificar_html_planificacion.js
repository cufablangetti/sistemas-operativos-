// Extrae el motor que quedo PEGADO dentro de planificacion_cpu.html y le corre
// las mismas pruebas que al original, para asegurar que la copia no divergio.
const fs = require('fs'), path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'unidades', 'u02-procesos',
  'visuales', 'planificacion_cpu.html'), 'utf8');

const js = html.split('<script>')[1].split('</script>')[0];
const motor = js.split('// ===================== INTERFAZ')[0];

const ctx = {};
new Function('ctx', motor +
  '\nctx.simular=simular; ctx.metricas=metricas; ctx.secuencia=secuencia; ctx.ganttTxt=ganttTxt;')(ctx);
const { simular, metricas, ganttTxt } = ctx;

// y el original, para comparar uno contra el otro
const O = require('./motor_planificacion.js');

let fallos = 0;
const chk = (c, t, extra) => {
  console.log((c ? '  OK   ' : '  FALLA') + '  ' + t + (c || extra === undefined ? '' : '\n           ' + extra));
  if (!c) fallos++;
};
const aPorUnidad = g => {
  let s = '';
  for (const tr of g) for (let i = tr.ini; i < tr.fin; i++) s += tr.nom + ',';
  return s;
};

console.log('\n--- motor extraido del HTML ---\n');

const EJ = {
  'ej1 (final)':   [{nom:'A',llegada:0,rafaga:6},{nom:'B',llegada:2,rafaga:5},
                    {nom:'C',llegada:4,rafaga:3},{nom:'D',llegada:6,rafaga:4}],
  'ej2 (parcial)': [{nom:'A',llegada:0,rafaga:5},{nom:'B',llegada:1,rafaga:6},
                    {nom:'C',llegada:2,rafaga:5},{nom:'D',llegada:4,rafaga:3},
                    {nom:'E',llegada:3,rafaga:4}],
  'clase':         [{nom:'P1',llegada:0,rafaga:8},{nom:'P2',llegada:1,rafaga:4},
                    {nom:'P3',llegada:2,rafaga:2}],
  'prioridades':   [{nom:'L',llegada:0,rafaga:6,prio:3},{nom:'M',llegada:2,rafaga:4,prio:2},
                    {nom:'H',llegada:4,rafaga:3,prio:1}],
};

// 1) la copia del HTML da exactamente lo mismo que el original
let difs = 0;
for (const nombre of Object.keys(EJ)) {
  const datos = EJ[nombre];
  for (const a of [['FCFS'],['SJF'],['SRTF'],['RR',1],['RR',2],['RR',3],['PRIO'],['PRIOP']]) {
    const rh = simular(datos, a[0], a[1]), ro = O.simular(datos, a[0], a[1]);
    if (aPorUnidad(rh.gantt) !== aPorUnidad(ro.gantt)) {
      difs++; console.log('      ' + nombre + ' / ' + a[0] + ': ' + ganttTxt(rh.gantt) + '  vs  ' + O.ganttTxt(ro.gantt));
    }
    const mh = metricas(rh.ps), mo = O.metricas(ro.ps);
    if (mh.retornoProm.toFixed(6) !== mo.retornoProm.toFixed(6) ||
        mh.esperaProm.toFixed(6)  !== mo.esperaProm.toFixed(6)  ||
        mh.respuestaProm.toFixed(6) !== mo.respuestaProm.toFixed(6)) difs++;
    // las fotos de la cola tambien tienen que coincidir
    if (JSON.stringify(rh.pasos.map(p => [p.t, p.enCPU, p.cola])) !==
        JSON.stringify(ro.pasos.map(p => [p.t, p.enCPU, p.cola]))) difs++;
  }
}
chk(difs === 0, '4 juegos x 8 algoritmos: la copia del HTML es identica al original (Gantt, metricas y colas)');

// 2) las mismas propiedades, sobre juegos aleatorios
let sem = 777;
const rnd = n => { sem = (sem * 1103515245 + 12345) & 0x7fffffff; return sem % n; };
const malas = [];
for (let caso = 0; caso < 300; caso++) {
  const n = 2 + rnd(5), datos = [];
  for (let i = 0; i < n; i++)
    datos.push({ nom:'P'+(i+1), llegada: rnd(8), rafaga: 1 + rnd(7), prio: 1 + rnd(4) });
  for (const a of [['FCFS'],['SJF'],['SRTF'],['RR',2],['RR',1],['PRIO'],['PRIOP']]) {
    const r = simular(datos, a[0], a[1]), m = metricas(r.ps);
    const ocupa = {};
    r.gantt.filter(x => x.nom !== '-').forEach(x => { ocupa[x.nom] = (ocupa[x.nom]||0) + (x.fin - x.ini); });
    for (const p of datos) if (ocupa[p.nom] !== p.rafaga)
      malas.push(a[0]+': '+p.nom+' ocupo '+ocupa[p.nom]+' != '+p.rafaga);
    for (const f of m.filas) {
      if (f.espera < 0 || f.retorno < f.rafaga || f.respuesta < 0 || f.respuesta > f.espera || f.fin === null)
        malas.push(a[0]+': metrica invalida en '+f.nom+' '+JSON.stringify(f));
    }
    for (const p of r.pasos) {
      if (p.enCPU && p.cola.indexOf(p.enCPU) >= 0) malas.push(a[0]+': '+p.enCPU+' en CPU y en cola, t='+p.t);
      if (!p.enCPU && p.cola.length)               malas.push(a[0]+': CPU ociosa con cola, t='+p.t);
    }
  }
}
chk(malas.length === 0, '300 juegos aleatorios x 7 algoritmos: ' + malas.length + ' anomalias',
    malas.slice(0,5).join('\n           '));

// 3) los casos puntuales que se usan en la clase
{
  const m = metricas(simular(EJ['clase'], 'FCFS').ps);
  chk(m.retornoProm.toFixed(4) === (31/3).toFixed(4) && m.esperaProm.toFixed(4) === (17/3).toFixed(4),
      'clase / FCFS: retorno 10,33 y espera 5,67');
  const s = metricas(simular(EJ['clase'], 'SJF').ps);
  chk(s.retornoProm.toFixed(4) === (29/3).toFixed(4),
      'clase / SJF: retorno 9,67', 'obtenido ' + s.retornoProm);
  const t = metricas(simular(EJ['clase'], 'SRTF').ps);
  chk(t.retornoProm.toFixed(4) === (22/3).toFixed(4),
      'clase / SRTF: retorno 7,33', 'obtenido ' + t.retornoProm);
  const rr = simular(EJ['clase'], 'RR', 2);
  chk(aPorUnidad(rr.gantt) === 'P1,P1,P2,P2,P3,P3,P1,P1,P2,P2,P1,P1,P1,P1,',
      'clase / RR q=2: la rodaja de P3 entra antes del reingreso de P1',
      aPorUnidad(rr.gantt));
}
{
  const r = simular(EJ['ej2 (parcial)'], 'RR', 2);
  const p11 = r.pasos.filter(p => p.t === 11)[0];
  chk(p11.enCPU === 'D' && p11.cola.join(',') === 'B,C,A,E',
      'parcial / RR q=2: en t=11 corre D y la cola es [B, C, A, E]',
      'obtenido CPU=' + p11.enCPU + ' cola=[' + p11.cola.join(',') + ']');
}
{
  const r = simular([{nom:'X',llegada:0,rafaga:6},{nom:'Y',llegada:2,rafaga:4}], 'RR', 2);
  chk(aPorUnidad(r.gantt) === 'X,X,Y,Y,X,X,Y,Y,X,X,',
      'regla de la catedra: el que llega se encola antes que el que sale por fin de quantum',
      aPorUnidad(r.gantt));
}
{
  const d = EJ['prioridades'];
  // L termina sus 6 completos; despues de los que esperan entra H (prio 1)
  // ANTES que M (prio 2), aunque M haya llegado primero: no es FIFO.
  chk(aPorUnidad(simular(d,'PRIO').gantt)  === 'L,L,L,L,L,L,H,H,H,M,M,M,M,',
      'prioridades no apropiativas: L termina sus 6 y despues entra H antes que M',
      aPorUnidad(simular(d,'PRIO').gantt));
  chk(aPorUnidad(simular(d,'PRIOP').gantt) === 'L,L,M,M,H,H,H,M,M,L,L,L,L,',
      'prioridades apropiativas: M desaloja a L en t=2 y H desaloja a M en t=4',
      aPorUnidad(simular(d,'PRIOP').gantt));
}

console.log('\n' + (fallos === 0
  ? '>>> El motor del HTML es equivalente al verificado: 0 fallos'
  : '>>> ATENCION: ' + fallos + ' fallo(s)') + '\n');
