// Extrae el motor PEGADO dentro de filosofos_comelones.html y comprueba que sea
// equivalente al verificado en _trabajo/motor_filosofos.js.
const fs = require('fs'), path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'unidades', 'u02-procesos',
  'visuales', 'filosofos_comelones.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0];
const motor = js.split('// ===================== INTERFAZ')[0];

const ctx = {};
new Function('ctx', motor + '\nctx.M = {crear,puede,avanzar,comiendo,bloqueado,probar,izqDe,derDe,' +
  'PENSANDO,HAMBRIENTO,COMIENDO,FASES};')(ctx);
const H = ctx.M;                 // motor del HTML
const O = require('./motor_filosofos.js');   // motor original

let fallos = 0;
const chk = (c, t, extra) => {
  console.log((c ? '  OK   ' : '  FALLA') + '  ' + t + (c || extra === undefined ? '' : '\n           ' + extra));
  if (!c) fallos++;
};
const foto = st => st.fase.join('') + '|' + st.tenedor.join(',') + '|' + st.mutex + '|' +
                   st.s.join('') + '|' + st.estado.map(e => e[0]).join('');

console.log('\n--- motor extraido de filosofos_comelones.html ---\n');

// 1) las dos copias recorren EXACTAMENTE las mismas trayectorias
{
  let difs = 0, pasosTotales = 0;
  for (const modo of ['izq', 'asim', 'mutex', 'dijkstra']) {
    for (let caso = 0; caso < 300; caso++) {
      let sem = 1000 + caso * 7;
      const rnd = n => { sem = (sem * 1103515245 + 12345) & 0x7fffffff; return sem % n; };
      const a = H.crear(modo, 5), b = O.crear(modo, 5);
      for (let p = 0; p < 120; p++) {
        const lh = [0,1,2,3,4].filter(i => H.puede(a, i));
        const lo = [0,1,2,3,4].filter(i => O.puede(b, i));
        if (lh.join() !== lo.join()) { difs++; break; }
        if (!lh.length) break;
        const i = lh[rnd(lh.length)];
        const eh = H.avanzar(a, i), eo = O.avanzar(b, i);
        pasosTotales++;
        if (eh !== eo || foto(a) !== foto(b)) { difs++; break; }
      }
    }
  }
  chk(difs === 0, '1200 corridas x 4 esquemas: la copia del HTML da los mismos estados y los mismos eventos ' +
      '(' + pasosTotales + ' pasos comparados)', 'diferencias = ' + difs);
}

// 2) exploracion exhaustiva sobre la copia del HTML
const clonar = st => JSON.parse(JSON.stringify(st));
function explorar(modo) {
  const vistos = new Set(), cola = [H.crear(modo, 5)];
  let bloqueos = 0, maxCom = 0, vecinos = 0, tenedores = 0, dosEnMutex = 0;
  while (cola.length) {
    const st = cola.shift(), k = foto(st);
    if (vistos.has(k)) continue;
    vistos.add(k);
    const com = H.comiendo(st);
    if (com.length > maxCom) maxCom = com.length;
    if (modo === 'mutex' && com.length > 1) dosEnMutex++;
    for (const a of com) {
      for (const b of com) if (a !== b && (H.derDe(st, a) === b || H.izqDe(st, a) === b)) vecinos++;
      if (st.tenedor[a] !== a || st.tenedor[(a + 1) % 5] !== a) tenedores++;
    }
    let suc = 0;
    for (let i = 0; i < 5; i++) {
      if (!H.puede(st, i)) continue;
      const g = clonar(st); g.log = []; H.avanzar(g, i); suc++;
      if (!vistos.has(foto(g))) cola.push(g);
    }
    if (suc === 0) bloqueos++;
  }
  return { estados: vistos.size, bloqueos, maxCom, vecinos, tenedores, dosEnMutex };
}
const r = {};
['izq', 'asim', 'mutex', 'dijkstra'].forEach(m => r[m] = explorar(m));

chk(r.izq.bloqueos === 1, "HTML / 'izq': exactamente 1 estado de interbloqueo (" + r.izq.estados + ' estados)',
    'bloqueos = ' + r.izq.bloqueos);
chk(r.asim.bloqueos === 0, "HTML / 'asim': 0 interbloqueos (" + r.asim.estados + ' estados)');
chk(r.mutex.bloqueos === 0, "HTML / 'mutex': 0 interbloqueos (" + r.mutex.estados + ' estados)');
chk(r.dijkstra.bloqueos === 0, "HTML / 'dijkstra': 0 interbloqueos (" + r.dijkstra.estados + ' estados)',
    'bloqueos = ' + r.dijkstra.bloqueos);
chk(r.mutex.maxCom === 1, "HTML / 'mutex': nunca mas de 1 comiendo", 'max = ' + r.mutex.maxCom);
chk(r.asim.maxCom === 2 && r.dijkstra.maxCom === 2,
    "HTML / 'asim' y 'dijkstra': se alcanzan 2 comiendo (el maximo posible)",
    'asim=' + r.asim.maxCom + ' dijkstra=' + r.dijkstra.maxCom);
chk(['izq','asim','mutex','dijkstra'].every(m => r[m].vecinos === 0),
    'HTML / los 4 esquemas: NUNCA comen dos vecinos a la vez');
chk(['izq','asim','mutex','dijkstra'].every(m => r[m].tenedores === 0),
    'HTML / los 4 esquemas: el que come siempre tiene sus dos tenedores');

// 3) el boton "forzar el interbloqueo" hace lo que promete
{
  const a = H.crear('izq', 5);
  for (let i = 0; i < 5; i++) H.avanzar(a, i);
  for (let i = 0; i < 5; i++) H.avanzar(a, i);
  chk(H.bloqueado(a) && a.tenedor.every((t, i) => t === i),
      'boton forzar: con "izq" quedan los 5 trabados, cada Fi con el tenedor i',
      'tenedor=' + a.tenedor.join(',') + ' trabado=' + H.bloqueado(a));
  const b = H.crear('asim', 5);
  for (let i = 0; i < 5; i++) H.avanzar(b, i);
  for (let i = 0; i < 5; i++) H.avanzar(b, i);
  chk(!H.bloqueado(b) && b.tenedor.filter(t => t === null).length === 1,
      'boton forzar: con "asim" NO se traba y queda 1 tenedor libre',
      'tenedor=' + b.tenedor.join(',') + ' trabado=' + H.bloqueado(b));
}

// 4) la fase que la interfaz pinta como "comiendo" existe en los 4 esquemas
{
  let ok = true;
  for (const modo of ['izq', 'asim', 'mutex', 'dijkstra']) {
    const faseComiendo = modo === 'mutex' ? 4 : 3;
    if (H.FASES[modo] !== faseComiendo + 1) ok = false;
  }
  chk(ok, 'FASES coincide con la fase que comiendo() considera "comiendo" en los 4 esquemas',
      JSON.stringify(H.FASES));
}

console.log('\n' + (fallos === 0
  ? '>>> El motor del HTML es equivalente al verificado: 0 fallos'
  : '>>> ATENCION: ' + fallos + ' fallo(s)') + '\n');
