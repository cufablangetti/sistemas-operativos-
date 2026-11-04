// Explora EXHAUSTIVAMENTE el espacio de estados de cada esquema y chequea invariantes.
const M = require('./motor_filosofos.js');

let fallos = 0;
const chk = (c, t, extra) => {
  console.log((c ? '  OK   ' : '  FALLA') + '  ' + t + (c || extra === undefined ? '' : '\n           ' + extra));
  if (!c) fallos++;
};

const clonar = st => JSON.parse(JSON.stringify(st));
const clave = st => st.fase.join('') + '|' + st.tenedor.join(',') + '|' + st.mutex + '|' +
                    st.s.join('') + '|' + st.estado.map(e => e[0]).join('');

function explorar(modo, N) {
  const inicial = M.crear(modo, N);
  const vistos = new Map();
  const cola = [inicial];
  const bloqueos = [];
  let maxComiendo = 0, violaVecinos = 0, violaTenedor = 0, violaMutexExcl = 0;

  while (cola.length) {
    const st = cola.shift();
    const k = clave(st);
    if (vistos.has(k)) continue;
    vistos.set(k, true);

    const com = M.comiendo(st);
    if (com.length > maxComiendo) maxComiendo = com.length;

    // invariante 1: dos filosofos que comen no pueden ser vecinos
    for (const a of com) for (const b of com)
      if (a !== b && (M.derDe(st, a) === b || M.izqDe(st, a) === b)) violaVecinos++;

    // invariante 2: el que come tiene SUS DOS tenedores
    for (const a of com) {
      const t1 = a, t2 = (a + 1) % st.N;
      if (st.tenedor[t1] !== a || st.tenedor[t2] !== a) violaTenedor++;
    }

    // invariante 3: con mutex global, nunca mas de uno comiendo
    if (modo === 'mutex' && com.length > 1) violaMutexExcl++;

    let sucesores = 0;
    for (let i = 0; i < st.N; i++) {
      if (!M.puede(st, i)) continue;
      const g = clonar(st); g.log = [];
      M.avanzar(g, i);
      sucesores++;
      if (!vistos.has(clave(g))) cola.push(g);
    }
    if (sucesores === 0) bloqueos.push(st);
  }
  return { estados: vistos.size, bloqueos, maxComiendo, violaVecinos, violaTenedor, violaMutexExcl };
}

console.log('\n--- filosofos: exploracion exhaustiva (N = 5) ---\n');

const A = explorar('izq', 5);
chk(A.bloqueos.length === 1, "esquema 'izq': existe EXACTAMENTE 1 estado de interbloqueo  (" +
    A.estados + ' estados explorados)', 'encontrados ' + A.bloqueos.length);
if (A.bloqueos.length) {
  const b = A.bloqueos[0];
  const esElDelLibro = b.fase.every(f => f === 2) &&
    b.tenedor.every((t, idx) => t === idx);
  chk(esElDelLibro, "esquema 'izq': el interbloqueo es el del libro (cada Fi tiene el tenedor i y espera el i+1)",
      'fase=' + b.fase.join(',') + ' tenedor=' + b.tenedor.join(','));
}
chk(A.violaTenedor === 0, "esquema 'izq': todo filosofo que come tiene sus dos tenedores");

const B = explorar('asim', 5);
chk(B.bloqueos.length === 0, "esquema 'asim' (el zurdo): CERO estados de interbloqueo  (" +
    B.estados + ' estados explorados)', 'encontrados ' + B.bloqueos.length);
chk(B.maxComiendo === 2, "esquema 'asim': se alcanzan 2 comiendo a la vez", 'max = ' + B.maxComiendo);
chk(B.violaVecinos === 0, "esquema 'asim': nunca comen dos vecinos a la vez");

const C = explorar('mutex', 5);
chk(C.bloqueos.length === 0, "esquema 'mutex': CERO interbloqueos  (" + C.estados + ' estados)');
chk(C.maxComiendo === 1, "esquema 'mutex': NUNCA come mas de 1 a la vez (el defecto del libro)",
    'max = ' + C.maxComiendo);
chk(C.violaMutexExcl === 0, "esquema 'mutex': se respeta la exclusion mutua global");

const D = explorar('dijkstra', 5);
chk(D.bloqueos.length === 0, "esquema 'dijkstra' (fig. 2-46): CERO interbloqueos  (" + D.estados + ' estados)',
    'encontrados ' + D.bloqueos.length);
chk(D.violaVecinos === 0, "esquema 'dijkstra': NUNCA comen dos vecinos a la vez");
chk(D.maxComiendo === 2, "esquema 'dijkstra': alcanza el maximo paralelismo posible (2 comiendo)",
    'max = ' + D.maxComiendo);
chk(D.violaTenedor === 0, "esquema 'dijkstra': el que come tiene sus dos tenedores");

// el interbloqueo del intento 1 se puede PRODUCIR con la secuencia del libro
{
  const st = M.crear('izq', 5);
  for (let i = 0; i < 5; i++) M.avanzar(st, i);   // los cinco tienen hambre
  for (let i = 0; i < 5; i++) M.avanzar(st, i);   // los cinco toman el izquierdo
  chk(M.bloqueado(st), "secuencia del libro: los cinco toman el izquierdo -> INTERBLOQUEO");
  chk(st.tenedor.every((t, i) => t === i), '   y cada tenedor i quedo en manos de Fi',
      st.tenedor.join(','));
}
// la misma secuencia con el zurdo NO se traba
{
  const st = M.crear('asim', 5);
  for (let i = 0; i < 5; i++) M.avanzar(st, i);
  for (let i = 0; i < 5; i++) M.avanzar(st, i);
  chk(!M.bloqueado(st), 'misma secuencia con el zurdo: NO se traba');
  const libres = st.tenedor.filter(t => t === null).length;
  chk(libres === 1, '   y queda 1 tenedor libre, que es el que desarma la cadena', 'libres = ' + libres);
}
// 2100 corridas al azar: nunca se viola una invariante y nunca se traba.
// OJO: NO se exige que todos coman, porque el elector es AZAROSO y no es justo.
// La ausencia de inanicion depende del planificador, no del algoritmo de los filosofos.
{
  let sem = 20261102;
  const rnd = n => { sem = (sem * 1103515245 + 12345) & 0x7fffffff; return sem % n; };
  let malas = 0, trabas = 0;
  for (const modo of ['asim', 'mutex', 'dijkstra']) {
    for (let caso = 0; caso < 700; caso++) {
      const st = M.crear(modo, 5);
      for (let paso = 0; paso < 400; paso++) {
        const libres = [0,1,2,3,4].filter(i => M.puede(st, i));
        if (!libres.length) { trabas++; break; }
        M.avanzar(st, libres[rnd(libres.length)]);
        const com = M.comiendo(st);
        if (modo === 'mutex' && com.length > 1) malas++;
        for (const a of com) for (const b of com)
          if (a !== b && (M.derDe(st, a) === b || M.izqDe(st, a) === b)) malas++;
        for (const a of com) if (st.tenedor[a] !== a || st.tenedor[(a+1)%5] !== a) malas++;
      }
    }
  }
  chk(malas === 0 && trabas === 0,
      '2100 corridas al azar x 3 esquemas: 0 violaciones de invariantes, 0 trabas',
      'violaciones=' + malas + ' trabas=' + trabas);
}

// Con un elector JUSTO (ciclico), los cinco llegan a comer en los tres esquemas buenos.
// Esto es lo que si se le puede exigir al algoritmo.
{
  let malas = 0; const detalle = [];
  for (const modo of ['asim', 'mutex', 'dijkstra']) {
    const st = M.crear(modo, 5);
    const comio = new Array(5).fill(0);
    let paso = 0, turno = 0;
    while (paso < 2000 && comio.some(c => c === 0)) {
      for (let k = 0; k < 5; k++) {              // recorre a todos, en orden, una vez
        const i = (turno + k) % 5;
        if (M.puede(st, i)) { M.avanzar(st, i); paso++; M.comiendo(st).forEach(x => comio[x] = 1); }
      }
      turno = (turno + 1) % 5;
    }
    if (comio.some(c => c === 0)) malas++;
    detalle.push(modo + ': ' + paso + ' pasos');
  }
  chk(malas === 0, 'con un elector JUSTO los cinco filosofos comen en los 3 esquemas correctos',
      detalle.join('  |  '));
}

console.log('\n' + (fallos === 0 ? '>>> MOTOR DE FILOSOFOS VERIFICADO: 0 fallos'
                                 : '>>> ATENCION: ' + fallos + ' fallo(s)') + '\n');
