// Verifica el motor de asignacion_memoria.html (copiado del HTML tal cual).
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync("unidades/u03-memoria/visuales/asignacion_memoria.html", "utf8");
const src = html.split('<script id="motor">')[1].split("</script>")[0];
const ctx = {module: {exports: {}}}; vm.createContext(ctx); vm.runInContext(src, ctx);
const {correr} = ctx.module.exports;
let fallos = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) fallos++; };
const MEM = "H10 P4 H4 Q6 H20 R3 H18 S5 H7 T2 H9 U4 H12 V3 H15";
const esp = {primer: [20, 10, 18], mejor: [12, 10, 9], peor: [20, 18, 15], siguiente: [20, 18, 9]};
for (const [a, e] of Object.entries(esp)){
  const h = correr(MEM, "A12 B10 C9", a).slice(1).map(r => r.info.huecoTam);
  ok(JSON.stringify(h) === JSON.stringify(e), `${a}: ${h}`);
}
// fig. 3-6: P5 H3 P6 P4 H2 P6 P3 H3 ; pedido de 2
ok(correr("A5 H3 B6 C4 H2 D6 E3 H3", "X2", "primer")[1].info.huecoTam === 3, "fig 3-6 primer ajuste -> hueco de 3 en la 5");
ok(correr("A5 H3 B6 C4 H2 D6 E3 H3", "X2", "mejor")[1].info.huecoTam === 2, "fig 3-6 mejor ajuste -> hueco de 2 en la 18");
// fusiones (fig. 3-7)
const fin = (m, p) => { const h = correr(m, p, "primer"); return h[h.length - 1].est.mem.map(s => (s.t === "H" ? "H" : s.n) + s.tam).join(" "); };
ok(fin("A1 X2 B1", "-X") === "A1 H2 B1", "fusion (a): proceso a los dos lados");
ok(fin("A1 X2 H3", "-X") === "A1 H5", "fusion (b): hueco a la derecha");
ok(fin("H3 X2 B1", "-X") === "H5 B1", "fusion (c): hueco a la izquierda");
ok(fin("H3 X2 H4", "-X") === "H9", "fusion (d): huecos a los dos lados -> uno solo");
// no entra
const r = correr("H5 A3 H5", "B8", "primer")[1].info;
ok(!r.ok, "pedido de 8 con dos huecos de 5: no entra (fragmentacion externa)");
// liberar y reusar
ok(fin("H20", "A8 B4 -A C6") === "C6 H2 B4 H8", "crear, liberar y reusar el hueco");
console.log(fallos ? `\n${fallos} FALLOS` : "\n0 fallos");
