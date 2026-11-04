// ====================================================================
// MOTOR UNIFICADO DE PLANIFICACION DE CPU  —  Unidad 2, tema 8
// Simula tick a tick y deja una foto de la COLA DE PREPARADOS en cada
// instante, que es lo que piden los parciales de la catedra.
//
// REGLA DE DESEMPATE DE LA CATEDRA (de los examenes reales):
//   "entre un proceso que llega y otro que sale del estado de ejecucion,
//    el que se pone antes en la cola es el proceso que llega".
//   -> en cada instante se encolan PRIMERO las llegadas y DESPUES el
//      que sale de la CPU por fin de quantum o por desalojo.
//
// algo: 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIO' | 'PRIOP'
// prioridad: menor numero = mas prioritario.
// ====================================================================

function simular(entrada, algo, quantum) {
  const ps = entrada.map(p => ({
    nom: p.nom, llegada: +p.llegada, rafaga: +p.rafaga,
    prio: p.prio === undefined ? 0 : +p.prio,
    restante: +p.rafaga, fin: null, primerInicio: null
  }));

  const cola = [];      // cola de preparados (refs a ps)
  const gantt = [];     // [{nom, ini, fin}]
  const pasos = [];     // una foto por unidad de tiempo
  let t = 0, actual = null, usado = 0, terminados = 0;
  const LIMITE = 100000;

  const encolarLlegadas = inst => {
    ps.filter(p => p.llegada === inst && p.restante > 0 && p !== actual && !cola.includes(p))
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .forEach(p => cola.push(p));
  };

  // devuelve el indice del elegido dentro de la cola (-1 si esta vacia).
  // En empate gana el que entro antes a la cola (FIFO).
  const elegirIdx = () => {
    if (!cola.length) return -1;
    if (algo === 'FCFS' || algo === 'RR') return 0;
    let mejor = 0;
    for (let i = 1; i < cola.length; i++) {
      const a = cola[i], b = cola[mejor];
      let gana;
      if (algo === 'SJF')       gana = a.rafaga   < b.rafaga;
      else if (algo === 'SRTF') gana = a.restante < b.restante;
      else                      gana = a.prio     < b.prio;
      if (gana) mejor = i;
    }
    return mejor;
  };

  while (terminados < ps.length && t < LIMITE) {
    let evento = '';

    // 1) LLEGADAS primero (regla de la catedra)
    const antesCola = cola.length;
    encolarLlegadas(t);
    if (cola.length > antesCola)
      evento += 'llega ' + cola.slice(antesCola).map(p => p.nom).join(', ') + '. ';

    // 2) ¿sale el que esta en la CPU?
    if (actual) {
      let sale = false;
      if (algo === 'RR' && usado === quantum) {
        sale = true; evento += 'fin de quantum de ' + actual.nom + ' -> LISTO. ';
      } else if (algo === 'SRTF' || algo === 'PRIOP') {
        const i = elegirIdx();
        if (i >= 0) {
          const c = cola[i];
          const mejor = algo === 'SRTF' ? c.restante < actual.restante : c.prio < actual.prio;
          if (mejor) { sale = true; evento += c.nom + ' desaloja a ' + actual.nom + '. '; }
        }
      }
      if (sale) { cola.push(actual); actual = null; usado = 0; }
    }

    // 3) si la CPU esta libre, elegir
    if (!actual) {
      const i = elegirIdx();
      if (i >= 0) {
        actual = cola.splice(i, 1)[0];
        usado = 0;
        if (actual.primerInicio === null) actual.primerInicio = t;
        evento += 'entra a la CPU ' + actual.nom + '. ';
      }
    }

    // 4) ejecutar una unidad de tiempo
    pasos.push({ t, enCPU: actual ? actual.nom : null, cola: cola.map(x => x.nom),
                 restantes: ps.map(p => ({ nom: p.nom, restante: p.restante })), evento: evento.trim() });

    const ult = gantt[gantt.length - 1];
    const quien = actual ? actual.nom : '-';
    if (ult && ult.nom === quien && ult.fin === t) ult.fin = t + 1;
    else gantt.push({ nom: quien, ini: t, fin: t + 1 });

    if (actual) {
      actual.restante--; usado++;
      if (actual.restante === 0) {
        actual.fin = t + 1; terminados++;
        pasos[pasos.length - 1].evento = (pasos[pasos.length - 1].evento + ' ' + actual.nom + ' TERMINA en ' + (t + 1) + '.').trim();
        actual = null; usado = 0;
      }
    }
    t++;
  }
  return { gantt, ps, pasos, horizonte: t };
}

function metricas(ps) {
  const filas = ps.map(p => {
    const retorno = p.fin - p.llegada;
    return { nom: p.nom, llegada: p.llegada, rafaga: p.rafaga, prio: p.prio, fin: p.fin,
             retorno, espera: retorno - p.rafaga, respuesta: p.primerInicio - p.llegada };
  }).sort((a, b) => a.nom.localeCompare(b.nom));
  const n = filas.length, sum = k => filas.reduce((s, f) => s + f[k], 0);
  return { filas, retornoProm: sum('retorno') / n, esperaProm: sum('espera') / n,
           respuestaProm: sum('respuesta') / n };
}

const secuencia = g => g.filter(x => x.nom !== '-').map(x => x.nom).join(' ');
const ganttTxt  = g => g.map(x => `${x.nom}[${x.ini}-${x.fin}]`).join(' ');

if (typeof module !== 'undefined') module.exports = { simular, metricas, secuencia, ganttTxt };
