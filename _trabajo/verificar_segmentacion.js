// Verifica unidades/u03-memoria/visuales/segmentacion.html (motor + navegador)
const fs = require("fs"), vm = require("vm"), path = require("path");
const archivo = path.resolve(__dirname, "../unidades/u03-memoria/visuales/segmentacion.html");
const ctx = { module: { exports: {} } }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(fs.readFileSync(archivo, "utf8"))[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const dibujo = mem => mem.map(b => b.hueco ? "(" + b.tam + ")" : b.seg + ":" + b.tam).join(" ");
const t = M.tablero("0 4\n1 8\n2 5\n3 8\n4 7", "1 -> 7 5\n4 -> 5 4\n3 -> 6 4\ncompactar");
const esp = ["0:4 1:8 2:5 3:8 4:7", "0:4 7:5 (3) 2:5 3:8 4:7", "0:4 7:5 (3) 2:5 3:8 5:4 (3)", "0:4 7:5 (3) 2:5 6:4 (4) 5:4 (3)", "0:4 7:5 2:5 6:4 5:4 (10)"];
t.pasos.forEach((p, i) => ok(dibujo(p.mem) === esp[i], `fig. 3-34 (${"abcde"[i]}): ${dibujo(p.mem)}`));
const n = M.tablero("0 4\n1 8\n2 5\n3 8\n4 7", "1 -> 7 5\n4 -> 5 4\n3 -> 6 4\n2 -> 8 9\ncompactar\n6 -> 9 9");
ok(n.pasos[4].tit.includes("NO entra") && n.pasos[4].ojo.includes("fragmentación externa"), "segmento de 9K no entra con huecos 3+5+4+3 = 15K libres → fragmentación externa");
ok(dibujo(n.pasos[5].mem) === "0:4 7:5 6:4 5:4 (15)" && dibujo(n.pasos[6].mem) === "0:4 7:5 (4) 5:4 9:9 (6)", "después de compactar sale el 6 (hueco de 4K, no alcanza): el 9 va al primer hueco que alcanza (" + dibujo(n.pasos[6].mem) + ")");
const tab = "0 1400 1000 X\n1 6300 400 RW\n2 4300 400 R\n3 3200 1100 RW\n4 4700 1000 RW";
let r = M.traducir(tab, 2, 53, "R"); ok(r.ok && r.fisica === 4353, "(2, 53) → 4300 + 53 = 4353");
r = M.traducir(tab, 3, 852, "W"); ok(r.ok && r.fisica === 4052, "(3, 852) → 3200 + 852 = 4052");
r = M.traducir(tab, 0, 1222, "X"); ok(!r.ok && r.motivo === "limite", "(0, 1222) con límite 1000 → fuera de límite");
r = M.traducir(tab, 0, 1000, "X"); ok(!r.ok && r.motivo === "limite", "d = límite exacto (1000) → fuera (es d < límite)");
r = M.traducir(tab, 2, 10, "W"); ok(!r.ok && r.motivo === "proteccion", "(2, 10) escribir en segmento R → protección");
r = M.traducir(tab, 0, 10, "R"); ok(!r.ok && r.motivo === "proteccion", "leer un segmento de solo ejecución → protección");
r = M.traducir(tab, 7, 5, "R"); ok(!r.ok && r.motivo === "segmento", "(7, 5) segmento inexistente");
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
  const br = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const pg = await br.newPage({ viewport: { width: 1200, height: 900 } }); const err = []; pg.on("pageerror", x => err.push(x.message));
  await pg.goto("file:///" + archivo.split(path.sep).join("/"));
  await pg.click("[data-tab=aje]"); for (let i = 0; i < 4; i++) await pg.click("#a-sig");
  ok((await pg.textContent("#a-mem")).includes("hueco 10K"), "página: compactación deja un hueco de 10K");
  await pg.click("[data-tab=tra]"); await pg.click('[data-t="0 1222 X"]'); ok((await pg.textContent("#t-res")).includes("fuera de límite"), "página: ejemplo fuera de límite");
  await pg.click('[data-t="2 53 R"]'); ok((await pg.textContent("#t-res")).includes("4353"), "página: (2, 53) → 4353");
  await pg.setViewportSize({ width: 390, height: 800 });
  for (const tb of ["cmp", "aje", "tra"]) { await pg.click(`[data-tab=${tb}]`); const w = await pg.evaluate(() => document.documentElement.scrollWidth); ok(w <= 390, "celular sin scroll horizontal en " + tb + " (" + w + ")"); }
  await pg.click("[data-tab=aje]"); await pg.screenshot({ path: process.env.SHOT, fullPage: true });
  ok(err.length === 0, "sin errores de JS " + err.join("; "));
  await br.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
