// Verifica el motor de cambio_de_contexto.html (copiado del HTML tal cual).
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync("unidades/u02-procesos/visuales/cambio_de_contexto.html", "utf8");
const src = html.split('<script id="motor">')[1].split("</script>")[0];
const ctx = {module: {exports: {}}}; vm.createContext(ctx); vm.runInContext(src, ctx);
const {pasos, estadoEn, P1_PC_SIG} = ctx.module.exports;
let fallos = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) fallos++; };
for (const esc of ["disco", "llamada", "quantum"]){
  const ps = pasos(esc);
  ok(ps.length === 9, `${esc}: disparador + 8 pasos`);
  ok(ps[1].actor === "HARDWARE" && ps[2].actor === "HARDWARE" && ps.slice(3).every(p => p.actor !== "HARDWARE"), `${esc}: solo los pasos 1 y 2 son hardware`);
  const s2 = estadoEn(esc, 3); ok(s2.cpu.modo === "kernel" && s2.bcp.P1.PC === "—", `${esc}: tras el paso 2 modo kernel y el BCP todavia sin tocar`);
  const s3 = estadoEn(esc, 4); ok(s3.bcp.P1.PC === P1_PC_SIG && s3.bcp.P1.estado === "Ejecución", `${esc}: paso 3 guarda el PC en el BCP; el estado aun no cambia`);
  const f = estadoEn(esc, 9);
  ok(f.cpu.proceso === "P2" && f.cpu.modo === "usuario" && f.cpu.PC === f.bcp.P2.PC && f.bcp.P2.estado === "Ejecución", `${esc}: termina ejecutando P2 en modo usuario`);
  const esperado = {disco: "Listo", llamada: "Bloqueado", quantum: "Listo"}[esc];
  ok(f.bcp.P1.estado === esperado, `${esc}: P1 termina ${esperado}`);
}
ok(estadoEn("disco", 0).bcp.P2.estado === "Bloqueado" && estadoEn("disco", 6).bcp.P2.estado === "Listo", "disco: el paso 5 pasa a P2 de Bloqueado a Listo");
console.log(fallos ? `\n${fallos} FALLOS` : "\n0 fallos");
