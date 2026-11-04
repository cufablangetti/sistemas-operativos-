// ===== Motor de los filosofos comelones =====
// Cuatro esquemas:
//   'izq'      intento 1 del libro: todos toman el IZQUIERDO primero -> interbloqueo
//   'asim'     el filosofo N-1 invierte el orden ("el zurdo") -> sin interbloqueo
//   'mutex'    todo el acto de comer protegido por un semaforo binario -> correcto, sin paralelismo
//   'dijkstra' figura 2-46: arreglo estado[] + un semaforo por filosofo -> correcto y con paralelismo
//
// El avance es paso a paso y lo decide quien usa el motor (click del usuario o azar),
// igual que el simulador de productor-consumidor.

const PENSANDO = 'PENSANDO', HAMBRIENTO = 'HAMBRIENTO', COMIENDO = 'COMIENDO';

function crear(modo, N) {
  N = N || 5;
  const orden = [];
  for (let i = 0; i < N; i++) {
    const izq = i, der = (i + 1) % N;
    orden.push(modo === 'asim' && i === N - 1 ? [der, izq] : [izq, der]);
  }
  return {
    modo, N, orden,
    fase: new Array(N).fill(0),
    estado: new Array(N).fill(PENSANDO),
    tenedor: new Array(N).fill(null),   // tenedor[t] = filosofo que lo tiene, o null
    mutex: 1,
    s: new Array(N).fill(0),
    log: [],
    pasos: 0,
  };
}

const izqDe = (st, i) => (i + st.N - 1) % st.N;   // vecino izquierdo
const derDe = (st, i) => (i + 1) % st.N;          // vecino derecho

// probar(i) de la figura 2-46
function probar(st, i) {
  if (st.estado[i] === HAMBRIENTO &&
      st.estado[izqDe(st, i)] !== COMIENDO &&
      st.estado[derDe(st, i)] !== COMIENDO) {
    st.estado[i] = COMIENDO;
    st.s[i] = 1;                                   // up(&s[i])
    return true;
  }
  return false;
}

// cuantas fases tiene el programa de cada esquema
const FASES = { izq: 4, asim: 4, mutex: 5, dijkstra: 4 };

// Puede el filosofo i ejecutar su proximo paso?
function puede(st, i) {
  const f = st.fase[i];
  if (st.modo === 'izq' || st.modo === 'asim') {
    if (f === 0) return true;                                   // tener hambre
    if (f === 1) return st.tenedor[st.orden[i][0]] === null;     // tomar el primero
    if (f === 2) return st.tenedor[st.orden[i][1]] === null;     // tomar el segundo
    return true;                                                 // terminar de comer
  }
  if (st.modo === 'mutex') {
    if (f === 0) return true;                                   // tener hambre
    if (f === 1) return st.mutex === 1;                          // down(mutex)
    if (f === 2 || f === 3) return true;                         // los tenedores estan garantizados
    return true;                                                 // terminar: suelta todo y up(mutex)
  }
  // dijkstra
  if (f === 0) return true;                                      // tener hambre
  if (f === 1) return st.mutex === 1;                             // tomar_tenedores (entra al mutex)
  if (f === 2) return st.s[i] === 1;                              // down(&s[i])
  return st.mutex === 1;                                          // poner_tenedores (entra al mutex)
}

// Ejecuta un paso del filosofo i. Devuelve el texto del evento, o null si esta bloqueado.
function avanzar(st, i) {
  if (!puede(st, i)) return null;
  const f = st.fase[i], N = st.N;
  let ev = '';

  if (st.modo === 'izq' || st.modo === 'asim') {
    if (f === 0) { st.estado[i] = HAMBRIENTO; st.fase[i] = 1; ev = 'F' + i + ' tiene hambre'; }
    else if (f === 1) { const t = st.orden[i][0]; st.tenedor[t] = i; st.fase[i] = 2;
      ev = 'F' + i + ' toma el tenedor ' + t + (t === i ? ' (izquierdo)' : ' (derecho)'); }
    else if (f === 2) { const t = st.orden[i][1]; st.tenedor[t] = i; st.fase[i] = 3;
      st.estado[i] = COMIENDO;
      ev = 'F' + i + ' toma el tenedor ' + t + ' y EMPIEZA A COMER'; }
    else { st.tenedor[st.orden[i][0]] = null; st.tenedor[st.orden[i][1]] = null;
      st.estado[i] = PENSANDO; st.fase[i] = 0;
      ev = 'F' + i + ' deja los tenedores ' + st.orden[i][0] + ' y ' + st.orden[i][1] + ' y piensa'; }
  }
  else if (st.modo === 'mutex') {
    if (f === 0) { st.estado[i] = HAMBRIENTO; st.fase[i] = 1; ev = 'F' + i + ' tiene hambre'; }
    else if (f === 1) { st.mutex = 0; st.fase[i] = 2; ev = 'F' + i + ' hace down(mutex): la mesa queda para el solo'; }
    else if (f === 2) { st.tenedor[i] = i; st.fase[i] = 3; ev = 'F' + i + ' toma el tenedor ' + i; }
    else if (f === 3) { st.tenedor[(i + 1) % N] = i; st.fase[i] = 4; st.estado[i] = COMIENDO;
      ev = 'F' + i + ' toma el tenedor ' + ((i + 1) % N) + ' y EMPIEZA A COMER'; }
    else { st.tenedor[i] = null; st.tenedor[(i + 1) % N] = null; st.estado[i] = PENSANDO;
      st.mutex = 1; st.fase[i] = 0; ev = 'F' + i + ' deja los tenedores y hace up(mutex)'; }
  }
  else { // dijkstra
    if (f === 0) { st.fase[i] = 1; ev = 'F' + i + ' tiene hambre'; }
    else if (f === 1) {
      st.estado[i] = HAMBRIENTO;
      const ok = probar(st, i);
      st.fase[i] = 2;
      ev = 'F' + i + ' tomar_tenedores: estado=HAMBRIENTO, probar(' + i + ') -> ' +
           (ok ? 'puede, up(s[' + i + '])' : 'un vecino come, NO puede');
    }
    else if (f === 2) {
      st.s[i] = 0;
      st.tenedor[i] = i; st.tenedor[(i + 1) % N] = i;
      st.fase[i] = 3;
      ev = 'F' + i + ' pasa down(s[' + i + ']) y EMPIEZA A COMER (tenedores ' + i + ' y ' + ((i + 1) % N) + ')';
    }
    else {
      st.estado[i] = PENSANDO;
      st.tenedor[i] = null; st.tenedor[(i + 1) % N] = null;
      const a = probar(st, izqDe(st, i)), b = probar(st, derDe(st, i));
      st.fase[i] = 0;
      ev = 'F' + i + ' poner_tenedores: estado=PENSANDO, probar(' + izqDe(st, i) + ')' +
           (a ? ' DESPIERTA' : ' nada') + ', probar(' + derDe(st, i) + ')' + (b ? ' DESPIERTA' : ' nada');
    }
  }
  st.log.push(ev); st.pasos++;
  return ev;
}

const comiendo = st => st.fase.map((f, i) => ({ f, i }))
  .filter(x => x.f === (st.modo === 'mutex' ? 4 : 3)).map(x => x.i);

const bloqueado = st => {
  for (let i = 0; i < st.N; i++) if (puede(st, i)) return false;
  return true;
};

if (typeof module !== 'undefined') module.exports =
  { crear, puede, avanzar, comiendo, bloqueado, probar, izqDe, derDe, PENSANDO, HAMBRIENTO, COMIENDO, FASES };
