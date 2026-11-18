// Verifica el motor de unidades/u03-memoria/visuales/segmentacion_paginada.html
const fs = require("fs"), vm = require("vm"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../unidades/u03-memoria/visuales/segmentacion_paginada.html"), "utf8");
const ctx = { module: { exports: {} } }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(html)[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const E = M.ESC_M, P = M.ESC_P;
const mu = k => { const [s, p, d, op] = E.casos[k]; return M.multics(E.desc, E.tlb, s, p, d, op); };
const pe = k => { const [s, o, pg] = P.casos[k]; return M.pentium(P.desc, P.pag, P.tlb, !!pg, s, o); };

// MULTICS
let r = mu("normal"); ok(r.tipo === "ok" && r.fisica === 12 * 1024 + 100, "MULTICS (3,2,100): marco 12 → 12388");
ok(r.pasos.map(p => p.linea).join() === "0,1,2,3,5,6,7", "MULTICS normal recorre las líneas 0-1-2-3-5-6-7");
r = mu("tlb"); ok(r.tipo === "ok" && r.fisica === 9 * 1024 + 40 && r.pasos.length === 3, "TLB acierto (0,1,40) → 9256 sin leer descriptor");
ok(mu("tlbProt").tipo === "trap", "TLB acierto con X y escritura → trap");
ok(mu("falloSeg").tipo === "falloSeg", "segmento 1 sin tabla en memoria → fallo de segmento");
ok(mu("falloPag").tipo === "falloPag", "(3,1) página '-' → fallo de página");
ok(mu("prot").tipo === "trap", "escribir en segmento X → trap");
ok(mu("long").tipo === "trap", "página 5 en segmento de 4 → trap");
ok(M.multics(E.desc, E.tlb, 3, 3, 1023, "leer").fisica === 2 * 1024 + 1023, "(3,3,1023) → 3071");
ok(M.multics(E.desc, E.tlb, 9, 0, 0, "leer").tipo === "trap", "segmento inexistente → trap");
const tira = fn => { try { fn(); return false; } catch (x) { return true; } };
ok(tira(() => M.multics(E.desc, E.tlb, 0, 64, 0, "leer")) && tira(() => M.multics(E.desc, E.tlb, 0, 0, 1024, "leer")) && tira(() => M.multics(E.desc, E.tlb, 2 ** 18, 0, 0, "leer")), "MULTICS: rangos 18/6/10 bits");
ok(tira(() => M.parseDescM("3 1 4 RW : 7 12")) && tira(() => M.parseDescM("3 1 2 Q : 1 2")) && tira(() => M.parseDescM("3 1 2 R")), "MULTICS: errores de descriptores");

// PENTIUM
r = pe("normal"); ok(r.tipo === "ok" && r.lineal === 0x403A5C && r.fisica === 0x2BA5C && r.tabla === "LDT" && r.idx === 1 && r.rpl === 3, "Pentium 0x000F:0x3A5C → LDT[1], lineal 0x00403A5C, Dir 1 Pág 3 → 0x0002BA5C");
r = pe("tlb"); ok(r.tipo === "ok" && r.fisica === 0x51123 && r.pasos.some(p => p.linea === 6 && /acierto/.test(p.tit)) && !r.pasos.some(p => p.linea === 7), "TLB acierto 0x0017:0x0123 → 0x00051123 sin directorio");
r = pe("libro"); ok(r.tabla === "GDT" && r.idx === 9 && r.rpl === 0 && r.fisica === 0x100010 && /GDT \+ 72/.test(r.pasos[1].celdas.desc), "selector 72 → GDT entrada 9, en GDT + 72; sin paginación física = lineal");
ok(pe("nulo").tipo === "trap", "selector 0 → trap");
ok(pe("noPres").tipo === "trap", "P = 0 → trap");
ok(pe("limite").tipo === "trap" && M.pentium(P.desc, P.pag, P.tlb, true, "0x0017", "0x0FFF").fisica === 0x51FFF, "G = 0: 0x1000 fuera, 0x0FFF adentro");
ok(M.pentium(P.desc, P.pag, P.tlb, false, "0x000F", "0xFFFF").tipo === "ok" && M.pentium(P.desc, P.pag, P.tlb, false, "0x000F", "0x10000").tipo === "trap", "G = 1: 16 páginas = 64 KB exactos");
ok(pe("falloPag").tipo === "falloPag", "0x000F:0x4000 → Dir 1 Pág 4 no presente → fallo de página");
ok(M.pentium("L 1 0 0xFFFFF 1 1", "", "", true, "0x000C", "0x5000").tipo === "falloPag", "directorio sin tabla → fallo de página");
// plano: base 0, límite máximo → lineal = desplazamiento
r = M.pentium("L 1 0 0xFFFFF 1 1", "0 5 0x00777", "", true, "0x000C", "0x5ABC"); ok(r.lineal === 0x5ABC && r.fisica === 0x777ABC, "modelo plano (base 0): lineal = desplazamiento");
// aleatorio: comparar con cálculo directo
let s = 7, rnd = n => (s = (s * 1103515245 + 12345) % 2147483648) % n, bien = true;
for (let k = 0; k < 400; k++) {
  const base = rnd(2 ** 31) * 2 % 2 ** 32, lim = 1 + rnd(2 ** 20 - 1), G = rnd(2), off = rnd(G ? 2 ** 31 : 2 ** 20);
  const lin = (base + off) % 2 ** 32, dir = Math.floor(lin / 2 ** 22), pg = Math.floor(lin / 4096) % 1024, marco = rnd(2 ** 20);
  const r2 = M.pentium(`L 5 ${base} ${lim} ${G} 1`, `${dir} ${pg} ${marco}`, "", true, String(5 * 8 + 4 + 3), String(off));
  const dentro = off < (G ? lim * 4096 : lim);
  const esp = dentro ? marco * 4096 + lin % 4096 : null;
  if ((dentro ? r2.tipo !== "ok" || r2.fisica !== esp : r2.tipo !== "trap")) { bien = false; console.log(" difiere", base, lim, G, off); }
}
ok(bien, "400 casos aleatorios: límite y traducción en dos niveles coinciden con el cálculo directo");

// ANILLOS
ok(M.anillos(3, 3, "datos").ok && M.anillos(1, 3, "datos").ok && !M.anillos(3, 0, "datos").ok, "datos: nivel más alto sí, inferior no");
ok(!M.anillos(3, 1, "call").ok && M.anillos(3, 1, "compuerta").ok && M.anillos(2, 2, "call").ok, "CALL a otro nivel solo por compuerta");
console.log(f ? `\n${f} fallos` : "\n0 fallos"); process.exit(f ? 1 : 0);
