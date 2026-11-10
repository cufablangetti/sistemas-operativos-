// Verifica el motor de exclusion_mutua.html (copiado del HTML tal cual).
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync("unidades/u02-procesos/visuales/exclusion_mutua.html", "utf8");
const src = html.split('<script id="motor">')[1].split("</script>")[0];
const ctx = {module: {exports: {}}}; vm.createContext(ctx); vm.runInContext(src, ctx);
const {ESCENARIOS, nuevoEstado, ejecutar, correr, enRC} = ctx.module.exports;
let fallos = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) fallos++; };

// 1) guiones
const ambos = (id, s) => enRC(id, s, "A") && enRC(id, s, "B");
let h = correr("candado"); ok(h.some(s => ambos("candado", s)), "candado: el guion mete a los dos en la region critica");
h = correr("alternancia"); ok(!h.some(s => ambos("alternancia", s)), "alternancia: nunca dos adentro");
ok(h.some(s => s.pc.B === 0 && s.mem.turno === 0 && !enRC("alternancia", s, "A") && s.ultimo && s.ultimo.p === "B" && s.ultimo.linea === 0),
   "alternancia: B gira con A afuera (condicion 3)");
h = correr("peterson"); ok(!h.some(s => ambos("peterson", s)), "peterson: guion sin violacion");
ok(h.some(s => s.ultimo && s.ultimo.p === "B" && s.ultimo.linea === 2 && s.pc.B === 2), "peterson: B gira en el while");
ok(h[h.length - 1].pc.B >= 4 || enRC("peterson", h[h.length - 1], "B"), "peterson: B termina entrando");
h = correr("tsl"); ok(!h.some(s => ambos("tsl", s)), "tsl: guion sin violacion");
ok(h.some(s => enRC("tsl", s, "B")), "tsl: B termina entrando");
h = correr("inversion"); const f = h[h.length - 1];
ok(f.pc.A === 4 && f.mem.CANDADO === 1 && !enRC("inversion", f, "B") && f.estado.A === "Listo" && f.estado.B === "Ejecución",
   "inversion: L queda listo con el candado y H gira sin entrar");

// 2) busqueda exhaustiva de entrelazados (hasta 14 pasos)
function explorar(id, prof){
  let viol = false, n = 0;
  (function rec(s, d){
    n++;
    if (ambos(id, s)) { viol = true; return; }
    if (d === prof || viol) return;
    for (const p of ["A", "B"]) rec(ejecutar(id, s, {quien: p}), d + 1);
  })(nuevoEstado(id), 0);
  return {viol, n};
}
for (const [id, esperado] of [["candado", true], ["alternancia", false], ["peterson", false], ["tsl", false]]){
  const r = explorar(id, 14);
  ok(r.viol === esperado, `${id}: ${r.n} estados explorados, violacion = ${r.viol} (se esperaba ${esperado})`);
}
console.log(fallos ? `\n${fallos} FALLOS` : "\n0 fallos");
