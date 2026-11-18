// Verifica el motor de unidades/u03-memoria/visuales/lru_aproximaciones.html
const fs = require("fs"), vm = require("vm"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../unidades/u03-memoria/visuales/lru_aproximaciones.html"), "utf8");
const ctx = { module: { exports: {} } }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(html)[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1) Matriz LRU, fig. 3-17: estado (j) leído del libro por columnas (col0 = 0 0 1 1, col1 = 1 0 1 1, col2 = 0 0 0 1, col3 = 0 0 0 0)
let m = M.matrizLRU("0 1 2 3 2 1 0 3 2 3", 4);
let ult = m.pasos[m.pasos.length - 1];
ok(eq(ult.m, [[0,1,0,0],[0,0,0,0],[1,1,0,0],[1,1,1,0]]), "fig. 3-17 (j): matriz final igual a la del libro");
ok(ult.lru === 1 && eq(ult.orden, [1, 0, 2, 3]), "fig. 3-17 (j): LRU = página 1; orden 1 → 0 → 2 → 3");
// (a) después de referenciar 0: fila 0 = 0 1 1 1, resto en 0
ok(eq(m.pasos[1].m, [[0,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]]), "fig. 3-17 (a): fila 0 = 0111");
// La matriz coincide con un LRU de referencia en cadenas aleatorias
let s = 3, rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648, bien = true;
for (let k = 0; k < 300; k++) {
  const n = 2 + Math.floor(rnd() * 6), refs = Array.from({ length: 3 + Math.floor(rnd() * 20) }, () => Math.floor(rnd() * n));
  const r = M.matrizLRU(refs.join(" "), n), ultimo = {};
  refs.forEach((p, i) => ultimo[p] = i);
  // orden por recencia: nunca referenciadas primero (por número), después por último uso
  const esperado = Array.from({ length: n }, (_, p) => p).sort((a, b) => ((ultimo[a] ?? -1) - (ultimo[b] ?? -1)) || a - b);
  if (!eq(r.pasos[r.pasos.length - 1].orden, esperado)) { bien = false; console.log("  difiere", n, refs.join(" ")); }
}
ok(bien, "300 cadenas aleatorias: el orden de la matriz coincide con el LRU exacto");

// 2) Envejecimiento, fig. 3-18 (con la errata de la página 2 corregida)
const libro = "1 0 1 0 1 1\n1 1 0 0 1 0\n1 1 0 1 0 1\n1 0 0 0 1 0\n0 1 1 0 0 0";
const e = M.envejecer(libro, 8);
const esperado = [
  ["10000000","00000000","10000000","00000000","10000000","10000000"],
  ["11000000","10000000","01000000","00000000","11000000","01000000"],
  ["11100000","11000000","00100000","10000000","01100000","10100000"],
  ["11110000","01100000","00010000","01000000","10110000","01010000"],
  ["01111000","10110000","10001000","00100000","01011000","00101000"]];
e.pasos.forEach((p, i) => ok(eq(p.env.map(v => M.binario(v, 8)), esperado[i]), `fig. 3-18 (${"abcde"[i]}): ${p.env.map(v => M.binario(v, 8)).join(" ")}`));
ok(eq(e.pasos[4].vicEnv, [3]), "fig. 3-18 (e): sale la página 3 (texto del libro: se elimina la 3, no la 5)");
ok(eq(e.pasos[4].nfu, [4, 3, 2, 1, 3, 2]), "NFU tras 5 pulsos: 4 3 2 1 3 2");
const n2 = M.envejecer("1 0\n1 0\n1 0\n1 0\n1 0\n0 1\n0 1\n0 1", 8).pasos[7];
ok(eq(n2.vicNfu, [1]) && eq(n2.vicEnv, [0]), "NFU no olvida: NFU saca la 1 (la que se usa ahora); envejecimiento saca la 0");
ok(eq(M.envejecer("1 1 0\n0 0 1\n0 0 1", 8).pasos[2].vicEnv, [0, 1]), "empate: 0 y 1 con el mismo contador");
ok(M.envejecer("1\n1\n1\n1", 3).pasos[3].env[0] === 7, "3 bits: el contador satura en 111");

// 3) Conjunto de trabajo, fig. 3-20 con τ = 600
let c = M.conjuntoTrabajo("A 2084 1 0\nB 2003 1 0\nC 1980 1 0\nD 1213 0 0\nE 2014 1 0\nF 2020 1 0\nG 2032 1 0\nH 1620 0 0", 2204, 600);
ok(c.victima === "D" && c.motivo === "fuera", "fig. 3-20, τ = 600: sale la de 1213 (edad 991)");
ok(c.final.filter(p => p.R === 1).every(p => p.ultimo === 2204) && c.final[7].ultimo === 1620, "fig. 3-20: las de R = 1 pasan a 2204; la de 1620 queda igual");
c = M.conjuntoTrabajo("A 2084 1 0\nB 2003 1 0\nC 1980 1 0\nD 1213 0 0\nE 2014 1 0\nF 2020 1 0\nG 2032 1 0\nH 1620 0 0", 2204, 1000);
ok(c.victima === "D" && c.motivo === "masVieja", "fig. 3-20, τ = 1000: ninguna fuera → sale la más vieja con R = 0 (1213)");
c = M.conjuntoTrabajo("A 2084 1 1\nB 2003 1 0\nC 1980 1 0", 2204, 600);
ok(c.victima === "B" && c.motivo === "azar", "todas R = 1: se elige una limpia (B)");
c = M.conjuntoTrabajo("A 100 0 0\nB 50 0 0\nC 2000 1 0", 2204, 600);
ok(c.victima === "A", "dos fuera del CT: sale la primera encontrada (A), el recorrido sigue");

// 4) WSClock, fig. 3-21: la manecilla en la de 2014 (R = 1) → R = 0, avanza a 1213 → víctima
let w = M.wsclock("A 1213 0 0\nB 2084 1 0\nC 2032 1 0\nD 1620 0 0\nE 2020 1 0\nF 2003 1 0\nG 1980 1 0\nH 2014 1 0", 2204, 600, 8);
ok(w.victima === "A" && w.final[7].R === 0 && w.final[0].ultimo === 2204 && w.final[0].R === 1 && w.manoFin === 1, "fig. 3-21: 2014 queda con R = 0; la nueva entra en lugar de 1213 con 2204 y R = 1; la manecilla avanza");
w = M.wsclock("A 1213 0 1\nB 2084 1 0\nC 2032 1 0\nD 1500 0 0\nE 2020 1 0\nF 2003 1 0", 2204, 600, 1);
ok(w.victima === "D" && w.pasos[0].pags[0].esc === true, "vieja sucia: se planifica la escritura de A y sale D (vieja y limpia)");
w = M.wsclock("A 1000 0 1\nB 2100 1 0", 2204, 600, 1);
ok(w.victima === "A" && w.motivo === "fuera", "única vieja sucia: da la vuelta, termina la escritura de A y sale A");
w = M.wsclock("A 2100 0 1\nB 2150 1 0\nC 2180 0 1", 2204, 600, 1);
ok(w.victima === "B" && w.motivo === "limpiaVista", "todas en el CT, sin escrituras: se reclama una limpia (B)");
w = M.wsclock("A 2100 0 1\nB 2150 1 1", 2204, 600, 2);
ok(w.victima === "B" && w.motivo === "actual", "todas en el CT y sucias: sale la actual");

// 5) errores
const tira = fn => { try { fn(); return false; } catch (x) { return true; } };
ok(tira(() => M.matrizLRU("0 5", 4)) && tira(() => M.envejecer("1 0\n1", 8)) && tira(() => M.conjuntoTrabajo("A 1 2 0", 5, 1)) && tira(() => M.wsclock("A 1 0 0\nB 2 0 0", 5, 1, 9)), "errores de entrada");

console.log(f ? `\n${f} fallos` : "\n0 fallos"); process.exit(f ? 1 : 0);
