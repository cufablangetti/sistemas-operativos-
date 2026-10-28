// Verificacion del motor del simulador productor-consumidor.
// El mismo motor va pegado dentro de visuales/productor_consumidor.html.
// Comprueba: 1) con semaforos bien usados nunca se rompe nada,
//            2) invirtiendo los down aparece interbloqueo,
//            3) con sleep/wakeup aparece la senal de despertar perdida.

const PROG = {
  semaforos: {
    P: [
      { t: 'producir',  txt: 'elemento = producir_elemento()' },
      { t: 'down',      s: 'vacias', txt: 'down(&vacias)' },
      { t: 'down',      s: 'mutex',  txt: 'down(&mutex)' },
      { t: 'insertar',  txt: 'insertar_elemento(elemento)' },
      { t: 'up',        s: 'mutex',  txt: 'up(&mutex)' },
      { t: 'up',        s: 'llenas', txt: 'up(&llenas)' }
    ],
    C: [
      { t: 'down',      s: 'llenas', txt: 'down(&llenas)' },
      { t: 'down',      s: 'mutex',  txt: 'down(&mutex)' },
      { t: 'quitar',    txt: 'elemento = quitar_elemento()' },
      { t: 'up',        s: 'mutex',  txt: 'up(&mutex)' },
      { t: 'up',        s: 'vacias', txt: 'up(&vacias)' },
      { t: 'consumir',  txt: 'consumir_elemento(elemento)' }
    ]
  },
  invertido: {
    P: [
      { t: 'producir',  txt: 'elemento = producir_elemento()' },
      { t: 'down',      s: 'mutex',  txt: 'down(&mutex)   <-- INVERTIDO' },
      { t: 'down',      s: 'vacias', txt: 'down(&vacias)  <-- INVERTIDO' },
      { t: 'insertar',  txt: 'insertar_elemento(elemento)' },
      { t: 'up',        s: 'mutex',  txt: 'up(&mutex)' },
      { t: 'up',        s: 'llenas', txt: 'up(&llenas)' }
    ],
    C: [
      { t: 'down',      s: 'llenas', txt: 'down(&llenas)' },
      { t: 'down',      s: 'mutex',  txt: 'down(&mutex)' },
      { t: 'quitar',    txt: 'elemento = quitar_elemento()' },
      { t: 'up',        s: 'mutex',  txt: 'up(&mutex)' },
      { t: 'up',        s: 'vacias', txt: 'up(&vacias)' },
      { t: 'consumir',  txt: 'consumir_elemento(elemento)' }
    ]
  },
  sleepwakeup: {
    P: [
      { t: 'producir',   txt: 'elemento = producir_elemento()' },
      { t: 'leer',       txt: 'lee cuenta' },
      { t: 'sleepLleno', txt: 'if (cuenta == N) sleep()' },
      { t: 'insertarSimple', txt: 'insertar_elemento(elemento); cuenta++' },
      { t: 'wakeupC',    txt: 'if (cuenta == 1) wakeup(consumidor)' }
    ],
    C: [
      { t: 'leer',       txt: 'lee cuenta' },
      { t: 'sleepVacio', txt: 'if (cuenta == 0) sleep()' },
      { t: 'quitarSimple', txt: 'elemento = quitar_elemento(); cuenta--' },
      { t: 'wakeupP',    txt: 'if (cuenta == N-1) wakeup(productor)' },
      { t: 'consumir',   txt: 'consumir_elemento(elemento)' }
    ]
  }
};

function crearEstado(modo, N) {
  return {
    modo, N,
    buffer: [],
    sem: { mutex: 1, vacias: N, llenas: 0 },
    colas: { mutex: [], vacias: [], llenas: [] },
    cuenta: 0,
    leido: { P: null, C: null },
    pc: { P: 0, C: 0 },
    estado: { P: 'listo', C: 'listo' },
    motivo: { P: null, C: null },
    enRC: null,
    sigId: 1,
    producidos: 0,
    consumidos: 0,
    senalesPerdidas: 0,
    log: [],
    errores: []
  };
}

function nom(q) { return q === 'P' ? 'PRODUCTOR' : 'CONSUMIDOR'; }

function anotar(e, q, txt, clase) {
  e.log.push({ quien: q, txt, clase: clase || '' });
}

function listos(e) {
  return ['P', 'C'].filter(q => e.estado[q] === 'listo');
}

function interbloqueado(e) {
  return e.estado.P !== 'listo' && e.estado.C !== 'listo';
}

// Ejecuta UNA instruccion del proceso q. Devuelve false si no pudo.
function paso(e, q) {
  if (e.estado[q] !== 'listo') return false;
  const prog = PROG[e.modo][q];
  const ins = prog[e.pc[q]];
  const otro = q === 'P' ? 'C' : 'P';

  switch (ins.t) {

    case 'producir':
      anotar(e, q, 'produce un elemento (fuera de la region critica)');
      e.pc[q]++;
      break;

    case 'consumir':
      anotar(e, q, 'consume el elemento (fuera de la region critica)');
      e.pc[q]++;
      break;

    case 'down': {
      const s = ins.s;
      if (e.sem[s] > 0) {
        e.sem[s]--;
        anotar(e, q, `down(${s}) pasa. ${s} = ${e.sem[s]}`, 'ok');
        if (s === 'mutex') {
          if (e.enRC !== null) {
            e.errores.push(`EXCLUSION MUTUA VIOLADA: ${nom(q)} entro con ${nom(e.enRC)} adentro`);
          }
          e.enRC = q;
        }
        e.pc[q]++;
      } else {
        e.estado[q] = 'bloqueado';
        e.motivo[q] = s;
        e.colas[s].push(q);
        anotar(e, q, `down(${s}) con ${s} = 0 -> SE BLOQUEA en la cola de ${s}`, 'bloq');
        // el pc NO avanza: completa el down cuando lo despierten
      }
      break;
    }

    case 'up': {
      const s = ins.s;
      e.sem[s]++;
      if (s === 'mutex') e.enRC = null;
      let extra = '';
      if (e.colas[s].length > 0) {
        const desp = e.colas[s].shift();
        e.sem[s]--;                 // el despertado completa su down
        e.estado[desp] = 'listo';
        e.motivo[desp] = null;
        e.pc[desp]++;               // su down quedo completado
        if (s === 'mutex') e.enRC = desp;
        extra = ` y DESPIERTA al ${nom(desp)}, que completa su down`;
      }
      anotar(e, q, `up(${s}). ${s} = ${e.sem[s]}${extra}`, 'ok');
      e.pc[q]++;
      break;
    }

    case 'insertar':
      if (e.buffer.length >= e.N) e.errores.push('DESBORDE: inserto en un buffer lleno');
      e.buffer.push(e.sigId++);
      e.producidos++;
      anotar(e, q, `inserta en el buffer (${e.buffer.length}/${e.N})`);
      e.pc[q]++;
      break;

    case 'quitar':
      if (e.buffer.length === 0) e.errores.push('SUBDESBORDE: saco de un buffer vacio');
      e.buffer.shift();
      e.consumidos++;
      anotar(e, q, `saca del buffer (${e.buffer.length}/${e.N})`);
      e.pc[q]++;
      break;

    // ---- modo sleep / wakeup ----

    case 'leer':
      e.leido[q] = e.cuenta;
      anotar(e, q, `lee cuenta y se guarda ${e.cuenta}`, 'aviso');
      e.pc[q]++;
      break;

    case 'sleepLleno':
      e.pc[q]++;                            // retoma despues del sleep
      if (e.leido[q] === e.N) {
        e.estado[q] = 'bloqueado';
        e.motivo[q] = 'sleep';
        anotar(e, q, `vio cuenta = ${e.leido[q]} = N -> sleep()`, 'bloq');
      } else {
        anotar(e, q, `vio cuenta = ${e.leido[q]}, no esta lleno, sigue`);
      }
      break;

    case 'sleepVacio':
      e.pc[q]++;
      if (e.leido[q] === 0) {
        e.estado[q] = 'bloqueado';
        e.motivo[q] = 'sleep';
        anotar(e, q, `vio cuenta = 0 -> sleep()  (con el dato que leyo ANTES)`, 'bloq');
      } else {
        anotar(e, q, `vio cuenta = ${e.leido[q]}, hay algo, sigue`);
      }
      break;

    case 'insertarSimple':
      if (e.buffer.length >= e.N) e.errores.push('DESBORDE: inserto en un buffer lleno');
      e.buffer.push(e.sigId++);
      e.cuenta++;
      e.producidos++;
      anotar(e, q, `inserta. cuenta = ${e.cuenta}`);
      e.pc[q]++;
      break;

    case 'quitarSimple':
      if (e.buffer.length === 0) e.errores.push('SUBDESBORDE: saco de un buffer vacio');
      e.buffer.shift();
      e.cuenta--;
      e.consumidos++;
      anotar(e, q, `saca. cuenta = ${e.cuenta}`);
      e.pc[q]++;
      break;

    case 'wakeupC':
    case 'wakeupP': {
      const dest = ins.t === 'wakeupC' ? 'C' : 'P';
      const cond = ins.t === 'wakeupC' ? (e.cuenta === 1) : (e.cuenta === e.N - 1);
      if (cond) {
        if (e.estado[dest] === 'bloqueado' && e.motivo[dest] === 'sleep') {
          e.estado[dest] = 'listo';
          e.motivo[dest] = null;
          anotar(e, q, `wakeup(${nom(dest)}): estaba dormido, lo despierta`, 'ok');
        } else {
          e.senalesPerdidas++;
          anotar(e, q, `wakeup(${nom(dest)}) PERO NO ESTA DORMIDO -> LA SENAL SE PIERDE`, 'err');
        }
      } else {
        anotar(e, q, `no corresponde despertar a nadie (cuenta = ${e.cuenta})`);
      }
      e.pc[q]++;
      break;
    }

    default:
      throw new Error('instruccion desconocida: ' + ins.t);
  }

  if (e.pc[q] >= prog.length) e.pc[q] = 0;   // ciclo infinito del while(TRUE)
  return true;
}

// ---------------------------------------------------------------- pruebas

let fallos = 0;
function chequear(cond, txt) {
  console.log((cond ? '  OK   ' : '  FALLA') + '  ' + txt);
  if (!cond) fallos++;
}

console.log('\n=== 1) SEMAFOROS BIEN USADOS: 20.000 pasos aleatorios, N = 3 ===\n');
{
  let peorInterbloqueo = false;
  let totalProd = 0, totalCons = 0, errores = [];
  for (let semilla = 0; semilla < 200; semilla++) {
    const e = crearEstado('semaforos', 3);
    let x = semilla + 1;
    for (let i = 0; i < 100; i++) {
      const dis = listos(e);
      if (dis.length === 0) { peorInterbloqueo = true; break; }
      x = (x * 1103515245 + 12345) & 0x7fffffff;      // PRNG simple
      paso(e, dis[x % dis.length]);
    }
    totalProd += e.producidos; totalCons += e.consumidos;
    errores = errores.concat(e.errores);
  }
  chequear(errores.length === 0, 'ningun error de exclusion mutua ni de desborde del buffer');
  chequear(!peorInterbloqueo, 'nunca se llego a un interbloqueo');
  chequear(totalProd > 0 && totalCons > 0, `hubo trabajo real: ${totalProd} producidos, ${totalCons} consumidos`);
  if (errores.length) console.log('   ', errores.slice(0, 3));
}

console.log('\n=== 2) DOWN INVERTIDOS: busco el interbloqueo, N = 1 ===\n');
{
  const e = crearEstado('invertido', 1);
  // primera vuelta completa del productor, para llenar el buffer
  for (let i = 0; i < 6; i++) paso(e, 'P');
  console.log('   despues de la 1a vuelta del productor: buffer =', e.buffer.length + '/' + e.N,
              ' vacias =', e.sem.vacias, ' llenas =', e.sem.llenas, ' mutex =', e.sem.mutex);
  // segunda vuelta: agarra el mutex y se duerme esperando lugar
  paso(e, 'P');   // producir
  paso(e, 'P');   // down(mutex)  -> pasa
  chequear(e.sem.mutex === 0 && e.enRC === 'P', 'el productor se guardo el mutex');
  paso(e, 'P');   // down(vacias) -> se bloquea CON el mutex
  chequear(e.estado.P === 'bloqueado' && e.motivo.P === 'vacias',
           'el productor se durmio esperando "vacias"');
  chequear(e.sem.mutex === 0, 'y se durmio SIN DEVOLVER el mutex  <-- el pecado');
  paso(e, 'C');   // down(llenas) -> pasa
  paso(e, 'C');   // down(mutex)  -> se bloquea
  chequear(e.estado.C === 'bloqueado' && e.motivo.C === 'mutex',
           'el consumidor se bloqueo esperando el mutex');
  chequear(interbloqueado(e), 'INTERBLOQUEO confirmado: los dos bloqueados');
  console.log('\n   traza final:');
  e.log.slice(-6).forEach(l => console.log('     ' + nom(l.quien).padEnd(11) + ' ' + l.txt));
}

console.log('\n=== 3) SLEEP / WAKEUP: busco la senal perdida, N = 2 ===\n');
{
  const e = crearEstado('sleepwakeup', 2);
  paso(e, 'C');   // el consumidor lee cuenta = 0 ... y lo interrumpen aca
  chequear(e.leido.C === 0, 'el consumidor leyo cuenta = 0 y todavia NO se durmio');
  paso(e, 'P');   // producir
  paso(e, 'P');   // leer
  paso(e, 'P');   // sleepLleno -> no
  paso(e, 'P');   // insertarSimple -> cuenta = 1
  chequear(e.cuenta === 1, 'el productor inserto: cuenta = 1, hay comida disponible');
  paso(e, 'P');   // wakeupC -> el consumidor NO esta dormido
  chequear(e.senalesPerdidas === 1, 'LA SENAL DE DESPERTAR SE PERDIO');
  paso(e, 'C');   // sleepVacio con el dato viejo
  chequear(e.estado.C === 'bloqueado',
           'el consumidor se durmio igual, con cuenta = 1 y el buffer con comida');
  // el productor sigue hasta llenar y dormirse tambien
  let guardia = 0;
  while (e.estado.P === 'listo' && guardia++ < 40) paso(e, 'P');
  chequear(interbloqueado(e), 'INTERBLOQUEO: los dos dormidos para siempre');
  chequear(e.buffer.length === e.N, `y el buffer quedo LLENO (${e.buffer.length}/${e.N}): comida que nadie consume`);
  console.log('\n   traza:');
  e.log.forEach(l => console.log('     ' + nom(l.quien).padEnd(11) + ' ' + l.txt));
}

console.log('\n=== 4) EL ORDEN CORRECTO no se cuelga ni con el buffer lleno, N = 1 ===\n');
{
  const e = crearEstado('semaforos', 1);
  for (let i = 0; i < 6; i++) paso(e, 'P');            // llena el buffer
  paso(e, 'P'); paso(e, 'P');                           // producir + down(vacias) -> se bloquea
  chequear(e.estado.P === 'bloqueado' && e.motivo.P === 'vacias',
           'el productor se bloquea esperando lugar');
  chequear(e.sem.mutex === 1, 'pero se bloqueo SIN el mutex: el mutex sigue libre  <-- la clave');
  for (let i = 0; i < 6; i++) paso(e, 'C');            // el consumidor puede trabajar
  chequear(e.estado.P === 'listo', 'el consumidor libero una ranura y DESPERTO al productor');
  chequear(e.consumidos === 1, 'el consumidor consumio 1 elemento');
}

console.log('\n' + (fallos === 0
  ? '>>> TODO VERIFICADO: 0 fallos'
  : `>>> ATENCION: ${fallos} fallo(s)`) + '\n');
