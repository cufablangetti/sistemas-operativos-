// Verifica el motor unificado (motor_planificacion.js) de tres formas:
//  A) lo cruza contra el motor viejo YA VERIFICADO (verificar_planificacion.js)
//     sobre los dos ejemplos de parciales reales de la catedra;
//  B) comprueba propiedades que tienen que valer siempre;
//  C) comprueba la regla de desempate de la catedra y las prioridades.
const fs = require('fs'), path = require('path');
const { simular, metricas, ganttTxt } = require('./motor_planificacion.js');

// --- cargar las funciones del motor viejo sin ejecutar sus ejemplos ---
const src = fs.readFileSync(path.join(__dirname, 'verificar_planificacion.js'), 'utf8');
const viejoSrc = src.split('// ====================================================================')[0];
const V = {};
new Function('V', viejoSrc + '\nV.fcfs=fcfs;V.sjf=sjf;V.srtf=srtf;V.roundRobin=roundRobin;V.metricas=metricas;')(V);

let fallos = 0;
const chk = (c, t, extra) => {
  console.log((c ? '  OK   ' : '  FALLA') + '  ' + t + (c || extra === undefined ? '' : '\n           ' + extra));
  if (!c) fallos++;
};
const gTxtV = g => g.map(x => x.nom + '[' + x.ini + '-' + x.fin + ']').join(' ');
// los dos motores fusionan tramos distinto; normalizo a "quien ocupa la CPU"
// por unidad de tiempo, que es lo realmente comparable.
const aPorUnidad = g => {
  let s = '';
  for (const tr of g) for (let i = tr.ini; i < tr.fin; i++) s += tr.nom + ',';
  return s;
};

const EJ = {
  'ej1 (final de la catedra)': [
    { nom: 'A', llegada: 0, rafaga: 6 }, { nom: 'B', llegada: 2, rafaga: 5 },
    { nom: 'C', llegada: 4, rafaga: 3 }, { nom: 'D', llegada: 6, rafaga: 4 }],
  'ej2 (parcial de la catedra)': [
    { nom: 'A', llegada: 0, rafaga: 5 }, { nom: 'B', llegada: 1, rafaga: 6 },
    { nom: 'C', llegada: 2, rafaga: 5 }, { nom: 'D', llegada: 4, rafaga: 3 },
    { nom: 'E', llegada: 3, rafaga: 4 }],
  'clase (P1,P2,P3)': [
    { nom: 'P1', llegada: 0, rafaga: 8 }, { nom: 'P2', llegada: 1, rafaga: 4 },
    { nom: 'P3', llegada: 2, rafaga: 2 }],
};

console.log('\n=== A) cruce contra el motor viejo ya verificado ===');
for (const nombre of Object.keys(EJ)) {
  const datos = EJ[nombre];
  console.log('\n' + nombre);
  const casos = [
    ['FCFS  ', () => V.fcfs(datos), () => simular(datos, 'FCFS')],
    ['SJF   ', () => V.sjf(datos), () => simular(datos, 'SJF')],
    ['SRTF  ', () => V.srtf(datos), () => simular(datos, 'SRTF')],
    ['RR q=2', () => V.roundRobin(datos, 2), () => simular(datos, 'RR', 2)],
    ['RR q=3', () => V.roundRobin(datos, 3), () => simular(datos, 'RR', 3)],
    ['RR q=1', () => V.roundRobin(datos, 1), () => simular(datos, 'RR', 1)],
  ];
  for (const c of casos) {
    const etq = c[0], rv = c[1](), rn = c[2]();
    const okG = aPorUnidad(rv.gantt) === aPorUnidad(rn.gantt);
    chk(okG, etq + ': mismo Gantt',
      'viejo: ' + gTxtV(rv.gantt) + '\n           nuevo: ' + ganttTxt(rn.gantt));
    const mv = V.metricas(rv.ps), mn = metricas(rn.ps);
    const okM = mv.retornoProm.toFixed(6) === mn.retornoProm.toFixed(6)
      && mv.esperaProm.toFixed(6) === mn.esperaProm.toFixed(6);
    chk(okM, etq + ': mismas metricas (ret ' + mn.retornoProm.toFixed(2) + ' / esp ' + mn.esperaProm.toFixed(2) + ')',
      'viejo ret ' + mv.retornoProm + ' esp ' + mv.esperaProm + ' | nuevo ret ' + mn.retornoProm + ' esp ' + mn.esperaProm);
  }
}

console.log('\n=== B) propiedades que tienen que valer siempre ===');
const ALGOS = [['FCFS'], ['SJF'], ['SRTF'], ['RR', 2], ['RR', 3], ['RR', 1], ['PRIO'], ['PRIOP']];
let sem = 12345;
const rnd = n => { sem = (sem * 1103515245 + 12345) & 0x7fffffff; return sem % n; };
const malas = [];
for (let caso = 0; caso < 400; caso++) {
  const n = 2 + rnd(5), datos = [];
  for (let i = 0; i < n; i++)
    datos.push({ nom: 'P' + (i + 1), llegada: rnd(8), rafaga: 1 + rnd(7), prio: 1 + rnd(4) });
  for (const a of ALGOS) {
    const algo = a[0], q = a[1];
    const r = simular(datos, algo, q), m = metricas(r.ps);
    const ocupa = {};
    r.gantt.filter(x => x.nom !== '-').forEach(x => { ocupa[x.nom] = (ocupa[x.nom] || 0) + (x.fin - x.ini); });
    for (const p of datos)
      if (ocupa[p.nom] !== p.rafaga)
        malas.push(algo + ': ' + p.nom + ' ocupo ' + ocupa[p.nom] + ' != rafaga ' + p.rafaga);
    for (const f of m.filas) {
      if (f.espera < 0) malas.push(algo + ': ' + f.nom + ' espera negativa (' + f.espera + ')');
      if (f.retorno < f.rafaga) malas.push(algo + ': ' + f.nom + ' retorno < rafaga');
      if (f.respuesta < 0) malas.push(algo + ': ' + f.nom + ' respuesta negativa');
      if (f.respuesta > f.espera) malas.push(algo + ': ' + f.nom + ' respuesta > espera');
      if (f.fin === null) malas.push(algo + ': ' + f.nom + ' nunca termino');
    }
    for (const p of r.pasos) {
      if (p.enCPU && p.cola.indexOf(p.enCPU) >= 0)
        malas.push(algo + ': ' + p.enCPU + ' esta en CPU y en la cola en t=' + p.t);
      if (!p.enCPU && p.cola.length)
        malas.push(algo + ': CPU ociosa en t=' + p.t + ' con la cola [' + p.cola + ']');
    }
  }
}
chk(malas.length === 0, '400 juegos aleatorios x 8 algoritmos: ' + malas.length + ' anomalias',
  malas.slice(0, 5).join('\n           '));

// FCFS sin apropiacion: respuesta == espera
let okResp = true;
for (let caso = 0; caso < 200; caso++) {
  const n = 2 + rnd(4), datos = [];
  for (let i = 0; i < n; i++) datos.push({ nom: 'P' + (i + 1), llegada: rnd(6), rafaga: 1 + rnd(6) });
  if (!metricas(simular(datos, 'FCFS').ps).filas.every(f => f.respuesta === f.espera)) okResp = false;
}
chk(okResp, 'FCFS: tiempo de respuesta == tiempo de espera (no hay apropiacion)');

// SJF minimiza el retorno promedio con llegadas simultaneas
let okSjf = true, peor = undefined;
for (let caso = 0; caso < 200; caso++) {
  const n = 3 + rnd(4), datos = [];
  for (let i = 0; i < n; i++) datos.push({ nom: 'P' + (i + 1), llegada: 0, rafaga: 1 + rnd(9) });
  const s = metricas(simular(datos, 'SJF').ps).retornoProm;
  for (const a of [['FCFS'], ['RR', 2], ['PRIO']]) {
    const o = metricas(simular(datos, a[0], a[1]).ps).retornoProm;
    if (s > o + 1e-9) { okSjf = false; peor = 'SJF ' + s + ' > ' + a[0] + ' ' + o; }
  }
}
chk(okSjf, 'SJF es optimo en retorno promedio cuando todos llegan juntos', peor);

// SRTF nunca peor que SJF
let okSrtf = true, peor2 = undefined;
for (let caso = 0; caso < 300; caso++) {
  const n = 2 + rnd(5), datos = [];
  for (let i = 0; i < n; i++) datos.push({ nom: 'P' + (i + 1), llegada: rnd(8), rafaga: 1 + rnd(7) });
  const a = metricas(simular(datos, 'SRTF').ps).retornoProm;
  const b = metricas(simular(datos, 'SJF').ps).retornoProm;
  if (a > b + 1e-9) { okSrtf = false; peor2 = 'SRTF ' + a + ' > SJF ' + b + ' con ' + JSON.stringify(datos); }
}
chk(okSrtf, 'SRTF nunca da peor retorno promedio que SJF', peor2);

console.log('\n=== C) regla de desempate de la catedra y prioridades ===');
{
  const r = simular(EJ['ej2 (parcial de la catedra)'], 'RR', 2);
  const p11 = r.pasos.filter(p => p.t === 11)[0];
  console.log('    Gantt RR q=2: ' + ganttTxt(r.gantt));
  console.log('    En t=11 -> en la CPU: ' + p11.enCPU + ' | cola de preparados: [' + p11.cola.join(', ') + ']');
  const rv = V.roundRobin(EJ['ej2 (parcial de la catedra)'], 2);
  chk(aPorUnidad(rv.gantt) === aPorUnidad(r.gantt), 'RR q=2 del parcial: identico al motor viejo');
}
{
  // X ocupa [0-2) con q=2 y Y llega exactamente en t=2: al expirar el quantum
  // de X, Y tiene que quedar DELANTE de X en la cola.
  const r = simular([{ nom: 'X', llegada: 0, rafaga: 6 }, { nom: 'Y', llegada: 2, rafaga: 4 }], 'RR', 2);
  const esperado = 'X,X,Y,Y,X,X,Y,Y,X,X,';
  chk(aPorUnidad(r.gantt) === esperado,
    'el que LLEGA se encola antes que el que sale por fin de quantum',
    'esperado ' + esperado + ' / obtenido ' + aPorUnidad(r.gantt));
}
{
  const datos = [{ nom: 'L', llegada: 0, rafaga: 5, prio: 3 }, { nom: 'H', llegada: 2, rafaga: 3, prio: 1 }];
  chk(aPorUnidad(simular(datos, 'PRIO').gantt) === 'L,L,L,L,L,H,H,H,',
    'PRIO no apropiativo: H espera a que L termine', aPorUnidad(simular(datos, 'PRIO').gantt));
  chk(aPorUnidad(simular(datos, 'PRIOP').gantt) === 'L,L,H,H,H,L,L,L,',
    'PRIOP apropiativo: H desaloja a L en t=2', aPorUnidad(simular(datos, 'PRIOP').gantt));
}
{
  const m = metricas(simular(EJ['clase (P1,P2,P3)'], 'FCFS').ps);
  chk(m.retornoProm.toFixed(4) === (31 / 3).toFixed(4) && m.esperaProm.toFixed(4) === (17 / 3).toFixed(4),
    'ejemplo de la clase en FCFS: retorno 10,33 y espera 5,67',
    'ret ' + m.retornoProm + ' esp ' + m.esperaProm);
  const p3 = m.filas.filter(f => f.nom === 'P3')[0];
  chk(p3.retorno === 12 && p3.espera === 10 && p3.respuesta === 10,
    'P3: retorno 12, espera 10, respuesta 10', JSON.stringify(p3));
}

console.log('\n=== D) tabla comparativa del ejemplo de la clase ===');
for (const a of [['FCFS'], ['SJF'], ['SRTF'], ['RR', 2], ['RR', 1]]) {
  const r = simular(EJ['clase (P1,P2,P3)'], a[0], a[1]), m = metricas(r.ps);
  console.log('  ' + (a[0] + (a[1] ? ' q=' + a[1] : '')).padEnd(8) +
    ' Gantt: ' + ganttTxt(r.gantt).padEnd(34) +
    ' retorno ' + m.retornoProm.toFixed(2) + '  espera ' + m.esperaProm.toFixed(2));
}

console.log('\n' + (fallos === 0 ? '>>> MOTOR VERIFICADO: 0 fallos' : '>>> ATENCION: ' + fallos + ' fallo(s)') + '\n');
