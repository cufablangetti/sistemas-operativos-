// Verifica el motor de unidades/u03-memoria/visuales/listas_paginas_windows.html (fig. 11-36)
const fs = require("fs"), vm = require("vm"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../unidades/u03-memoria/visuales/listas_paginas_windows.html"), "utf8");
const ctx = { module: { exports: {} } }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(html)[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const tira = fn => { try { fn(); return false; } catch (x) { return true; } };
const r = M.correr(M.GUION), listas = r.pasos.map(p => p.estado.lista).join(" ");
ok(listas === "CER CT CT MOD ESP CT ESP LIB CT", "recorrido guiado: " + listas);
ok(r.final.suaves === 2 && r.final.duros === 1 && r.final.escrituras === 1, "recorrido: 2 suaves (pila + lista), 1 duro, 1 escritura");
ok(M.correr(["referenciada", "desalojar"]).final.lista === "ESP", "(1) limpia → en espera");
ok(M.correr(["referenciada", "escribe", "desalojar"]).final.lista === "MOD", "(1) sucia → modificadas");
const t = M.correr(["referenciada", "escribe", "desalojar", "terminar"]);
ok(t.final.lista === "LIB" && t.final.escrituras === 0 && /NO se escribe/.test(t.pasos[3].ojo), "(3) sucia al terminar: a libres SIN escribir");
ok(M.correr(["referenciada", "escribe", "desalojar", "suave"]).final.sucia === true, "(2) desde modificadas sigue sucia");
ok(M.correr(["referenciada", "desasignar"]).final.lista === "LIB", "(5) desasignar → libres");
// transiciones prohibidas (fig. 11-36)
ok(tira(() => M.correr(["pila"])) && tira(() => M.correr(["suave"])) && tira(() => M.correr(["escritor"])), "desde libres: no hay (8), (2) ni (4)");
ok(tira(() => M.correr(["cero", "referenciada"])) && tira(() => M.correr(["referenciada", "cero"])), "(6) solo desde libres; (7) no desde el conjunto");
ok(tira(() => M.correr(["referenciada", "desalojar", "escritor"])), "(4) solo desde modificadas");
ok(M.posibles(M.inicial()).join() === "referenciada,cero", "desde libres: (6) y (7)");
ok(M.TRANS.filter(x => x.n).map(x => x.n).join() === "1,2,3,4,5,6,7,8", "las 8 transiciones del libro");
console.log(f ? `\n${f} fallos` : "\n0 fallos"); process.exit(f ? 1 : 0);
