// Verificacion del modelo de costo de CPU de las tres formas de hacer E/S.
// Debe dar exactamente lo mismo que el simulador HTML de la Unidad 1.

function simular(nBytes, tByteUs, tIntUs, tSetupUs) {
  const total = nBytes * tByteUs;              // lo impone el dispositivo
  return {
    total,
    programada:    { cpu: total,                   ints: 0 },
    interrupciones:{ cpu: nBytes * tIntUs,         ints: nBytes },
    dma:           { cpu: tSetupUs + tIntUs,       ints: 1 },
  };
}

function pct(x, total) { return (100 * x / total); }

const casos = [
  { n: 1000, tB: 100, tI: 5, tS: 0,  esperado: { prog: 100, intr: 5, dma: 0.005 } },
  { n: 10,   tB: 100, tI: 5, tS: 0,  esperado: { prog: 100, intr: 5, dma: 0.5   } },
  { n: 4096, tB: 10,  tI: 4, tS: 20, esperado: null },
];

let ok = true;
for (const c of casos) {
  const r = simular(c.n, c.tB, c.tI, c.tS);
  const p = {
    prog: pct(r.programada.cpu, r.total),
    intr: pct(r.interrupciones.cpu, r.total),
    dma:  pct(r.dma.cpu, r.total),
  };
  console.log(`\nn=${c.n} bytes, ${c.tB} us/byte, int=${c.tI} us, setup DMA=${c.tS} us`);
  console.log(`  duracion total de la transferencia : ${r.total} us = ${r.total/1000} ms`);
  console.log(`  E/S programada  : CPU ${r.programada.cpu} us -> ${p.prog.toFixed(3)} %`);
  console.log(`  Interrupciones  : CPU ${r.interrupciones.cpu} us (${r.interrupciones.ints} int) -> ${p.intr.toFixed(3)} %`);
  console.log(`  DMA             : CPU ${r.dma.cpu} us (${r.dma.ints} int) -> ${p.dma.toFixed(3)} %`);

  if (c.esperado) {
    for (const k of ["prog", "intr", "dma"]) {
      const diff = Math.abs(p[k] - c.esperado[k]);
      if (diff > 1e-9) { ok = false; console.log(`  ERROR en ${k}: esperaba ${c.esperado[k]}, dio ${p[k]}`); }
    }
  }
}

// Invariante que el simulador debe respetar siempre:
// el tiempo TOTAL de la transferencia no cambia entre metodos.
const a = simular(500, 50, 3, 0);
const b = simular(500, 50, 999, 0);
console.log(`\nInvariante: el metodo no cambia la duracion -> ${a.total} us == ${b.total} us : ${a.total === b.total ? "OK" : "ERROR"}`);
if (a.total !== b.total) ok = false;

console.log(`\n${ok ? "TODAS LAS VERIFICACIONES OK" : "HAY ERRORES"}`);
