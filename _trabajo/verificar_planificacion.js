// Simuladores de planificacion de CPU para la Unidad 2.
// Regla de desempate de la catedra (de los examenes reales):
// "entre un proceso que llega y otro que sale del estado de ejecucion,
//  el que se pone antes en la cola es el proceso que llega".

function clonar(ps) { return ps.map(p => ({ ...p, restante: p.rafaga })); }

// ---------- FCFS ----------
function fcfs(procs) {
  const ps = clonar(procs).sort((a, b) => a.llegada - b.llegada || a.nom.localeCompare(b.nom));
  let t = 0; const gantt = [];
  for (const p of ps) {
    if (t < p.llegada) { gantt.push({ nom: "-", ini: t, fin: p.llegada }); t = p.llegada; }
    gantt.push({ nom: p.nom, ini: t, fin: t + p.rafaga });
    t += p.rafaga;
    p.fin = t;
  }
  return { gantt, ps };
}

// ---------- SJF no apropiativo ----------
function sjf(procs) {
  const ps = clonar(procs); let t = 0; const gantt = []; const hechos = [];
  while (hechos.length < ps.length) {
    const listos = ps.filter(p => !p.fin && p.llegada <= t);
    if (!listos.length) {
      const prox = Math.min(...ps.filter(p => !p.fin).map(p => p.llegada));
      gantt.push({ nom: "-", ini: t, fin: prox }); t = prox; continue;
    }
    listos.sort((a, b) => a.rafaga - b.rafaga || a.llegada - b.llegada || a.nom.localeCompare(b.nom));
    const p = listos[0];
    gantt.push({ nom: p.nom, ini: t, fin: t + p.rafaga });
    t += p.rafaga; p.fin = t; hechos.push(p);
  }
  return { gantt, ps };
}

// ---------- SRTF (SRTN) apropiativo ----------
function srtf(procs) {
  const ps = clonar(procs); let t = 0; const gantt = []; let terminados = 0;
  while (terminados < ps.length) {
    const listos = ps.filter(p => p.restante > 0 && p.llegada <= t);
    if (!listos.length) { t++; continue; }
    listos.sort((a, b) => a.restante - b.restante || a.llegada - b.llegada || a.nom.localeCompare(b.nom));
    const p = listos[0];
    const ult = gantt[gantt.length - 1];
    if (ult && ult.nom === p.nom) ult.fin = t + 1;
    else gantt.push({ nom: p.nom, ini: t, fin: t + 1 });
    p.restante--; t++;
    if (p.restante === 0) { p.fin = t; terminados++; }
  }
  return { gantt, ps };
}

// ---------- Round Robin ----------
// cola: al expirar el quantum, PRIMERO entran los que llegaron en ese instante
// y DESPUES se reencola el que sale. Es la regla de la catedra.
function roundRobin(procs, q) {
  const ps = clonar(procs);
  let t = 0; const gantt = []; const cola = []; let terminados = 0;
  const colaEn = {};   // foto de la cola de preparados en cada instante

  const encolarLlegadas = (desde, hasta) => {
    ps.filter(p => p.llegada > desde && p.llegada <= hasta && p.restante > 0)
      .sort((a, b) => a.llegada - b.llegada || a.nom.localeCompare(b.nom))
      .forEach(p => cola.push(p));
  };

  ps.filter(p => p.llegada === 0).forEach(p => cola.push(p));

  while (terminados < ps.length) {
    if (!cola.length) {
      const pend = ps.filter(p => p.restante > 0);
      const prox = Math.min(...pend.map(p => p.llegada));
      gantt.push({ nom: "-", ini: t, fin: prox });
      encolarLlegadas(t, prox); t = prox; continue;
    }
    const p = cola.shift();
    const usa = Math.min(q, p.restante);
    gantt.push({ nom: p.nom, ini: t, fin: t + usa });
    const antes = t; t += usa; p.restante -= usa;
    encolarLlegadas(antes, t);          // 1) los que llegaron durante la rodaja
    if (p.restante > 0) cola.push(p);   // 2) recien ahi se reencola el que sale
    else { p.fin = t; terminados++; }
    colaEn[t] = cola.map(x => x.nom);
  }
  return { gantt, ps, colaEn };
}

// ---------- utilidades ----------
function metricas(ps) {
  const filas = ps.map(p => {
    const retorno = p.fin - p.llegada;
    return { nom: p.nom, llegada: p.llegada, rafaga: p.rafaga, fin: p.fin,
             retorno, espera: retorno - p.rafaga };
  }).sort((a, b) => a.nom.localeCompare(b.nom));
  const n = filas.length;
  return { filas,
    retornoProm: filas.reduce((s, f) => s + f.retorno, 0) / n,
    esperaProm: filas.reduce((s, f) => s + f.espera, 0) / n };
}

function mostrar(titulo, r) {
  console.log("\n--- " + titulo + " ---");
  console.log("  Gantt: " + r.gantt.map(g => `${g.nom}[${g.ini}-${g.fin}]`).join(" "));
  const sec = r.gantt.filter(g => g.nom !== "-").map(g => g.nom).join(" - ");
  console.log("  Secuencia: " + sec);
  const m = metricas(r.ps);
  console.log("  Proc | lleg | raf | fin | retorno | espera");
  m.filas.forEach(f => console.log(
    `   ${f.nom}   |  ${String(f.llegada).padStart(2)}  |  ${String(f.rafaga).padStart(2)} |  ${String(f.fin).padStart(2)} |   ${String(f.retorno).padStart(3)}   |  ${String(f.espera).padStart(3)}`));
  console.log(`  Retorno promedio: ${m.retornoProm.toFixed(2)}   Espera promedio: ${m.esperaProm.toFixed(2)}`);
}

// ====================================================================
// EJEMPLO 1 — el del examen final practica de la catedra
// llegadas: A=0, B=2, C=4, D=6 ; rafagas: A=6, B=5, C=3, D=4 ; RR q=2
// ====================================================================
console.log("=".repeat(72));
console.log("EJEMPLO 1 (examen final practica): A(0,6) B(2,5) C(4,3) D(6,4)");
const ej1 = [
  { nom: "A", llegada: 0, rafaga: 6 },
  { nom: "B", llegada: 2, rafaga: 5 },
  { nom: "C", llegada: 4, rafaga: 3 },
  { nom: "D", llegada: 6, rafaga: 4 },
];
mostrar("FCFS", fcfs(ej1));
mostrar("SJF (no apropiativo)", sjf(ej1));
mostrar("SRTF (apropiativo)", srtf(ej1));
const rr1 = roundRobin(ej1, 2);
mostrar("Round Robin q=2", rr1);

// ====================================================================
// EJEMPLO 2 — el del parcial: A(0,5) B(1,6) C(2,5) D(4,3) E(3,4), RR q=2
// la consigna real pide la cola de preparados en t=11
// ====================================================================
console.log("\n" + "=".repeat(72));
console.log("EJEMPLO 2 (parcial practica): A(0,5) B(1,6) C(2,5) D(4,3) E(3,4), RR q=2");
const ej2 = [
  { nom: "A", llegada: 0, rafaga: 5 },
  { nom: "B", llegada: 1, rafaga: 6 },
  { nom: "C", llegada: 2, rafaga: 5 },
  { nom: "D", llegada: 4, rafaga: 3 },
  { nom: "E", llegada: 3, rafaga: 4 },
];
const rr2 = roundRobin(ej2, 2);
mostrar("Round Robin q=2", rr2);
console.log("  Cola de preparados en cada instante de conmutacion:");
Object.keys(rr2.colaEn).map(Number).sort((a, b) => a - b)
  .forEach(t => console.log(`    t=${String(t).padStart(2)} -> [${rr2.colaEn[t].join(", ")}]`));

// ====================================================================
// Comprobacion: SJF minimiza el tiempo de retorno promedio
// cuando todos los procesos llegan juntos
// ====================================================================
console.log("\n" + "=".repeat(72));
console.log("COMPROBACION: con llegadas simultaneas, SJF minimiza el retorno promedio");
const ej3 = [
  { nom: "A", llegada: 0, rafaga: 8 },
  { nom: "B", llegada: 0, rafaga: 4 },
  { nom: "C", llegada: 0, rafaga: 9 },
  { nom: "D", llegada: 0, rafaga: 5 },
];
const mF = metricas(fcfs(ej3).ps), mS = metricas(sjf(ej3).ps);
console.log(`  FCFS -> retorno promedio ${mF.retornoProm.toFixed(2)}`);
console.log(`  SJF  -> retorno promedio ${mS.retornoProm.toFixed(2)}`);
console.log(`  ${mS.retornoProm < mF.retornoProm ? "OK: SJF es mejor, como dice la teoria" : "ERROR"}`);
