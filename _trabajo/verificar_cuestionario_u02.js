// Verifica los ejercicios numericos del cuestionario U2 con el motor del simulador.
const { simular, metricas, ganttTxt } = require('./motor_planificacion.js');
const D = [
  { nom: 'A', llegada: 0, rafaga: 5, prio: 3 },
  { nom: 'B', llegada: 1, rafaga: 3, prio: 1 },
  { nom: 'C', llegada: 2, rafaga: 1, prio: 4 },
  { nom: 'D', llegada: 4, rafaga: 4, prio: 2 },
  { nom: 'E', llegada: 6, rafaga: 2, prio: 1 },
];
for (const [algo, q] of [['FCFS'], ['SJF'], ['SRTF'], ['RR', 2], ['RR', 1], ['PRIOP']]) {
  const r = simular(D, algo, q || 0);
  const m = metricas(r.ps);
  console.log(`\n== ${algo}${q ? ' q=' + q : ''}`);
  console.log(ganttTxt(r.gantt));
  m.filas.forEach(f => console.log(`  ${f.nom} fin=${f.fin} ret=${f.retorno} esp=${f.espera} resp=${f.respuesta}`));
  console.log(`  prom ret=${m.retornoProm.toFixed(2)} esp=${m.esperaProm.toFixed(2)} resp=${(m.respuestaProm ?? 0).toFixed(2)}`);
  if (algo === 'RR') for (const t of [3, 6, 7, 9]) {
    const p = r.pasos.find(x => x.t === t);
    console.log(`  t=${t} CPU=${p.enCPU} cola=[${p.cola.join(',')}]`);
  }
}
