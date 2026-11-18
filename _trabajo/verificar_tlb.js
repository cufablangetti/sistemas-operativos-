// Verifica el motor de unidades/u03-memoria/visuales/tlb.html
const fs = require("fs"), vm = require("vm"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../unidades/u03-memoria/visuales/tlb.html"), "utf8");
const motor = /<script id="motor">([\s\S]*?)<\/script>/.exec(html)[1];
const ctx = { module: { exports: {} } }; vm.createContext(ctx); vm.runInContext(motor, ctx);
const { simular } = ctx.module.exports;
let fallos = 0;
const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) fallos++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function invariantes(sim, nombre) {
  let bien = true;
  for (const p of sim.pasos) {
    const { tlb, pags } = p.estado;
    const usados = {};
    for (const k in pags) if (pags[k].P) { if (usados[pags[k].marco] !== undefined) bien = false; usados[pags[k].marco] = k; }
    // toda entrada valida del TLB apunta a una pagina presente y a su marco
    for (const e of tlb) if (e && (!pags[e.pag].P || pags[e.pag].marco !== e.marco)) bien = false;
  }
  ok(bien, nombre + ": invariantes (TLB coherente con la tabla, sin marcos duplicados) en todos los pasos");
}

// 1) ejemplo de clase (resuelto a mano)
let s = simular({ refs: "19 129w 19 140 20 129 130w 19 860w 21 129 19w", tabla: "129 2 RW\n19 5 RX\n20 1 RX\n140 3 RW\n860 0 RW\n130 - RW\n21 - RX\n861 - RW", tamTLB: 4, marcos: 6, politica: "FIFO" });
ok(eq(s.resultados, ["suave","suave","acierto","suave","suave","acierto","duro","suave","suave","duro","duro","duro+proteccion"]), "clase: resultados " + s.resultados.join(","));
ok(eq(s.stats, { aciertos: 2, suaves: 6, duros: 4, proteccion: 1, escrituras: 1, lecturas: 4 }), "clase: estadisticas " + JSON.stringify(s.stats));
let fin = s.pasos[s.pasos.length - 1].estado;
ok(fin.pags[21].marco === 2 && fin.pags[129].marco === 5 && fin.pags[19].marco === 1 && fin.pags[130].marco === 4, "clase: 21->2, 129->5, 19->1, 130->4");
ok(fin.pags[130].M === 1, "clase: el M=1 de 130 se copio a la tabla al salir del TLB");
ok(eq(fin.tlb.map(e => e && e.pag), [19, 129, 860, 21]), "clase: TLB final 19,129,860,21");
// en la ref 2 (129w) la tabla tiene M=0 y el TLB M=1
const p129 = s.pasos.filter(p => p.ref === 1).pop().estado;
ok(p129.pags[129].M === 0 && p129.tlb[1].M === 1, "clase: tras 129w, M=1 solo en el TLB");
// en la ref 8 (19) sale 129 del TLB y su M pasa a la tabla, sin escritura al disco
const p8 = s.pasos.filter(p => p.ref === 7).pop().estado;
ok(p8.pags[129].M === 1 && p8.st.escrituras === 0, "clase: 129 sale del TLB -> M a la tabla, 0 escrituras a disco");
// la escritura al disco ocurre en la ref 10 (21 desaloja a 129 sucia)
const p10 = s.pasos.filter(p => p.ref === 9);
ok(p10.some(p => p.linea === 11 && /sucia/.test(p.tit)) && p10.pop().estado.st.escrituras === 1, "clase: 21 desaloja a 129 sucia -> 1 escritura");
const p11 = s.pasos.filter(p => p.ref === 10);
ok(p11.some(p => p.linea === 10 && /estaba en el TLB/.test(p.tit)), "clase: 129 desaloja a 19, que estaba en el TLB -> se invalida");
invariantes(s, "clase");

// 2) ciclo del libro: 8 paginas en un TLB de 8 -> 8 fallos suaves y despues todo aciertos
s = simular({ refs: "19 129 140 860 20 130 21 861 19 129w 140 860w 20 130w 21 861 19 129 20 21", tabla: "19 0 RX\n20 1 RX\n21 2 RX\n129 3 RW\n130 4 RW\n140 5 RW\n860 6 RW\n861 7 RW", tamTLB: 8, marcos: 8, politica: "FIFO" });
ok(s.stats.suaves === 8 && s.stats.aciertos === 12 && s.stats.duros === 0, "libro: 8 suaves + 12 aciertos");
invariantes(s, "libro");

// 3) TLB chico: 3 paginas en ciclo con 2 entradas -> nunca acierta (FIFO y LRU)
for (const pol of ["FIFO", "LRU"]) {
  s = simular({ refs: "1 2 3 1 2 3 1 2 3", tabla: "1 0 RW\n2 1 RW\n3 2 RW", tamTLB: 2, marcos: 4, politica: pol });
  ok(s.stats.suaves === 9 && s.stats.aciertos === 0, "chico " + pol + ": 9 suaves, 0 aciertos");
}
// LRU vs FIFO distinguibles: 1 2 1 3 1
s = simular({ refs: "1 2 1 3 1", tabla: "1 0\n2 1\n3 2", tamTLB: 2, marcos: 3, politica: "LRU" });
ok(eq(s.resultados, ["suave","suave","acierto","suave","acierto"]), "LRU 1 2 1 3 1: 3 saca a 2, y 1 acierta");
s = simular({ refs: "1 2 1 3 1", tabla: "1 0\n2 1\n3 2", tamTLB: 2, marcos: 3, politica: "FIFO" });
ok(eq(s.resultados, ["suave","suave","acierto","suave","suave"]), "FIFO 1 2 1 3 1: 3 saca a 1, y 1 falla");

// 4) pagina sucia desalojada
s = simular({ refs: "7w 8 9 10 7", tabla: "7 0 RW\n8 1 RW\n9 2 RW\n10 - RW", tamTLB: 2, marcos: 3, politica: "FIFO" });
ok(eq(s.resultados, ["suave","suave","suave","duro","duro"]) && s.stats.escrituras === 1, "sucio: s,s,s,d,d con 1 escritura");
invariantes(s, "sucio");

// 5) errores de entrada
const tira = (cfg) => { try { simular(cfg); return false; } catch (e) { return true; } };
ok(tira({ refs: "1", tabla: "1 0\n2 0", tamTLB: 2, marcos: 3 }), "error: marco repetido");
ok(tira({ refs: "1", tabla: "1 9", tamTLB: 2, marcos: 3 }), "error: marco fuera de rango");
ok(tira({ refs: "1q", tabla: "1 0", tamTLB: 2, marcos: 3 }), "error: referencia invalida");
s = simular({ refs: "5", tabla: "1 0", tamTLB: 2, marcos: 2 });
ok(s.resultados[0] === "duro", "pagina no listada se agrega como ausente -> fallo duro");

console.log(fallos ? `\n${fallos} fallos` : "\n0 fallos");
process.exit(fallos ? 1 : 0);
