// Verifica el motor de unidades/u03-memoria/visuales/reemplazo_paginas.html
const fs = require("fs"), vm = require("vm"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../unidades/u03-memoria/visuales/reemplazo_paginas.html"), "utf8");
const ctx = { module: { exports: {} } }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(html)[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- implementaciones de referencia, escritas aparte ----
function ref(refs, n, algo) {
  let mem = [], victimas = [], fallos = 0, R = {}, mano = 0, ultimo = {};
  refs.forEach((p, i) => {
    ultimo[p] = i;
    if (mem.includes(p)) { R[p] = 1; return; }
    fallos++;
    if (mem.length < n) { mem.push(p); R[p] = 1; victimas.push(null); return; }
    let v;
    if (algo === "FIFO") { v = mem.shift(); mem.push(p); }
    else if (algo === "LRU") { v = mem.reduce((a, b) => ultimo[a] < ultimo[b] ? a : b); mem[mem.indexOf(v)] = p; }
    else if (algo === "OPT") {
      const prox = q => { const j = refs.indexOf(q, i + 1); return j < 0 ? Infinity : j; };
      v = mem[0]; for (const q of mem) if (prox(q) > prox(v)) v = q; mem[mem.indexOf(v)] = p;
    } else if (algo === "SO") {
      while (R[mem[0]]) { R[mem[0]] = 0; mem.push(mem.shift()); }
      v = mem.shift(); mem.push(p);
    } else if (algo === "RELOJ") {
      while (R[mem[mano]]) { R[mem[mano]] = 0; mano = (mano + 1) % n; }
      v = mem[mano]; mem[mano] = p; mano = (mano + 1) % n;
    }
    R[p] = 1; victimas.push(v);
  });
  return { fallos, victimas };
}

// 1) valores conocidos (cadena de clase, verificada en verificar_u03.py)
const C = "7 0 1 2 0 3 0 4 2 3 0 3 2";
for (const [a, e] of [["FIFO", 10], ["LRU", 9], ["OPT", 7]]) ok(M.contarFallos(C, 3, a) === e, `cadena de clase, ${a} = ${e}`);
const so = M.contarFallos(C, 3, "SO");
ok(so === M.contarFallos(C, 3, "RELOJ") && so === ref(C.split(" ").map(Number), 3, "SO").fallos, "cadena de clase: segunda oportunidad = reloj = " + so);

// 2) comparación aleatoria contra la referencia (fallos y secuencia de víctimas)
let semilla = 7; const rnd = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;
let todoBien = true, soIgualReloj = true;
for (let k = 0; k < 400; k++) {
  const len = 5 + Math.floor(rnd() * 30), pags = 2 + Math.floor(rnd() * 7), n = 2 + Math.floor(rnd() * 4);
  const refs = Array.from({ length: len }, () => Math.floor(rnd() * pags));
  const txt = refs.join(" ");
  for (const a of ["FIFO", "LRU", "OPT", "SO", "RELOJ"]) {
    const s = M.simularCadena(txt, n, a), r = ref(refs, n, a);
    const vict = s.columnas.filter(c => c.fallo).map(c => c.victima === undefined ? null : c.victima);
    if (s.fallos !== r.fallos || !eq(vict, r.victimas)) { todoBien = false; console.log("  difiere", a, n, txt, s.fallos, r.fallos); }
  }
  const a1 = M.simularCadena(txt, n, "SO").columnas.map(c => c.victima), a2 = M.simularCadena(txt, n, "RELOJ").columnas.map(c => c.victima);
  if (!eq(a1, a2)) soIgualReloj = false;
  if (M.contarFallos(txt, n, "OPT") > Math.min(M.contarFallos(txt, n, "FIFO"), M.contarFallos(txt, n, "LRU"), M.contarFallos(txt, n, "SO"))) todoBien = false;
}
ok(todoBien, "400 cadenas aleatorias: fallos y víctimas iguales a la referencia, y el óptimo nunca pierde");
ok(soIgualReloj, "400 cadenas: segunda oportunidad y reloj eligen las mismas víctimas");

// 3) segunda oportunidad: la salvada va al final con R = 0
let s = M.simularCadena("1 2 3 1 4", 3, "SO");
let ult = s.pasos[s.pasos.length - 1];
ok(s.columnas[4].victima === 1 && eq(ult.cola, [2, 3, 4]), "1 2 3 1 4 con 3 marcos: todas tienen R=1, da la vuelta y sale 1 (FIFO); cola 2 3 4");
s = M.simularCadena("1 2 3 4", 3, "RELOJ");
ok(s.columnas[3].victima === 1 && s.pasos[s.pasos.length - 1].mano === 1, "reloj 1 2 3 4: sale 1 y la manecilla queda en el marco 1");

// 4) ejercicio de examen (clase): 0x24C5, 1 KB, t = 150
let r = M.resolverExamen({ tabla: "3 120 1 0 1 8\n7 45 1 1 1 2\n9 - 0 0 0 -\n12 80 0 1 1 14\n21 30 1 0 1 5", dir: "0x24C5", tamPag: 1024, bitsV: 16, t: 150, escribe: false }).resultado;
const fila = (rr, p) => rr.filas.find(x => x.pag === p);
ok(r.pagina === 9 && r.desplazamiento === 197 && r.victima === 12 && r.escrituraDisco && r.marco === 14 && r.fisica === 0x38C5, "examen clase: página 9, víctima 12 (sucia), marco 14, física 0x38C5");
ok(eq(r.colaFinal, [3, 21, 7, 9]), "examen clase: cola final 3, 21, 7, 9 (" + r.colaFinal + ")");
ok(fila(r, 21).llegada === 150 && fila(r, 21).R === 0 && fila(r, 7).llegada === 150 && fila(r, 7).R === 0 && fila(r, 3).llegada === 120 && fila(r, 3).R === 1, "examen clase: 21 y 7 con R=0 y llegada 150; 3 sin tocar");
ok(fila(r, 9).P === 1 && fila(r, 9).R === 1 && fila(r, 9).M === 0 && fila(r, 9).llegada === 150 && fila(r, 12).P === 0 && fila(r, 12).marco === null, "examen clase: 9 entra con P=1 R=1 M=0; 12 queda ausente");

// 5) ejemplo de la cátedra: 21(1) → 3(1) → 7(0) → 27(1), entra 23
r = M.resolverExamen({ tabla: "3 30 1 0 1 4\n7 20 0 1 1 9\n21 40 1 0 1 1\n23 - 0 0 0 -\n27 10 1 0 1 6", dir: "0x5C20", tamPag: 1024, bitsV: 16, t: 50, escribe: false }).resultado;
ok(r.pagina === 23 && r.victima === 7 && r.marco === 9 && r.fisica === 9 * 1024 + 32, "cátedra: página 23, víctima 7, marco 9, física " + r.fisica.toString(16));
ok(eq(r.colaFinal.slice().reverse(), [23, 27, 21, 3]), "cátedra: notación nueva→vieja 23 → 27 → 21 → 3 (como en la resolución de la práctica)");
ok(fila(r, 27).R === 0 && fila(r, 21).R === 1 && fila(r, 3).R === 1, "cátedra: 27 (0), 21 (1), 3 (1)");

// 6) todas con R = 1
r = M.resolverExamen({ tabla: "1 10 1 0 1 3\n2 20 1 1 1 0\n4 30 1 0 1 2\n6 - 0 0 0 -", dir: "0x3207", tamPag: 2048, bitsV: 16, t: 40, escribe: true }).resultado;
ok(r.pagina === 6 && r.victima === 1 && !r.escrituraDisco && r.marco === 3 && r.fisica === 0x1A07 && fila(r, 6).M === 1, "todas R=1: da la vuelta, sale 1 (limpia), 6 al marco 3 con M=1, física 0x1A07");
ok(eq(r.colaFinal, [2, 4, 6]), "todas R=1: cola final 2, 4, 6");

// 7) sin fallo
r = M.resolverExamen({ tabla: "3 120 1 0 1 8\n7 45 1 1 1 2\n12 80 0 1 1 14", dir: "0x3010", tamPag: 1024, bitsV: 16, t: 150, escribe: true }).resultado;
ok(!r.fallo && r.pagina === 12 && r.fisica === 0x3810 && fila(r, 12).R === 1, "sin fallo: página 12 presente → R=1, física 0x3810");

// 8) NRU
let n = M.clasesNRU("A 1 1\nB 0 1\nC 1 0\nD 1 1\nE 0 1");
ok(n.claseMin === 1 && eq(n.candidatas, ["B", "E"]), "NRU: clase mínima 1, candidatas B y E");
n = M.clasesNRU("A 1 0\nB 0 0");
ok(n.claseMin === 0 && eq(n.candidatas, ["B"]), "NRU: la clase 0 gana");

// 9) lectura de direcciones y errores
ok(M.leerDireccion("0010 0100 1100 0101") === 0x24C5 && M.leerDireccion("24C5H") === 0x24C5 && M.leerDireccion("9413") === 9413, "lectura binario con espacios, H y decimal");
const tira = fn => { try { fn(); return false; } catch (e) { return true; } };
ok(tira(() => M.simularCadena("1 a 2", 3, "FIFO")) && tira(() => M.resolverExamen({ tabla: "1 2 3", dir: "0x1", tamPag: 1024, bitsV: 16, t: 1 })), "errores de entrada");

console.log(f ? `\n${f} fallos` : "\n0 fallos"); process.exit(f ? 1 : 0);
