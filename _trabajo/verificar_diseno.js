// Verifica el motor y la página de unidades/u03-memoria/visuales/diseno_paginacion.html
const fs = require("fs"), vm = require("vm"), path = require("path");
const archivo = path.resolve(__dirname, "../unidades/u03-memoria/visuales/diseno_paginacion.html");
const html = fs.readFileSync(archivo, "utf8");
const ctx = { module: { exports: {} }, Math }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(html)[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// 1) tamaño de página
let t = M.tamanoPagina(2 ** 20, 8, 4096);
ok(t.pOpt === 4096 && t.estado === "ok" && t.tabla === 2048 && t.frag === 2048, "libro: s = 1 MB, e = 8 → p óptimo 4 KB; los dos términos valen 2 KB");
// mínimo numérico
let best = Infinity, bp = 0; for (let p = 100; p < 100000; p++) { const v = 2 ** 20 * 8 / p + p / 2; if (v < best) { best = v; bp = p; } }
ok(Math.abs(bp - 4096) <= 1, "barrido numérico: el mínimo está en p ≈ 4096 (" + bp + ")");
ok(M.tamanoPagina(2 ** 20, 8, 512).estado === "sat" && M.tamanoPagina(2 ** 20, 8, 8192).estado === "lim", "512 B → saturado; 8 KB → al límite (razón " + M.tamanoPagina(2 ** 20, 8, 8192).razon.toFixed(2) + ")");
ok(Math.abs(M.tamanoPagina(2 ** 24, 4, 1).pOpt - Math.sqrt(2 * 2 ** 24 * 4)) < 1e-9, "fórmula √(2se) con s = 16 MB, e = 4 → " + M.tamanoPagina(2 ** 24, 4, 1).pOpt);
// 2) local vs global fig 3-23
let lg = M.localGlobal("A0 10\nA1 7\nA2 5\nA3 4\nA4 6\nA5 3\nB0 9\nB1 4\nB2 6\nB3 2\nB4 5\nB5 6\nB6 12\nC1 3\nC2 5\nC3 6", "A");
ok(lg.local === "A5" && lg.global === "B3", "fig. 3-23: local saca A5 (edad 3), global saca B3 (edad 2)");
ok(eq(lg.marcosLocal, { A: 6, B: 7, C: 3 }) && eq(lg.marcosGlobal, { A: 7, B: 6, C: 3 }), "fig. 3-23: con global A pasa de 6 a 7 marcos y B de 7 a 6");
// 3) asignación
let a = M.asignar(12416, "1 1 1 1 1 1 1 1 1 1", 6);
ok(a.igual === 1241 && a.reservaIgual === 6, "libro: 12 416 marcos / 10 procesos = 1241 y 6 a la reserva");
a = M.asignar(12416, "10 300", 6);
ok(a.prop[1] / a.prop[0] > 29.9 && a.prop[1] / a.prop[0] < 30.1, "proporcional: el de 300 KB recibe ~30 veces el de 10 KB (" + a.prop + ")");
a = M.asignar(1000, "1 300 500 700", 6);
ok(a.prop[0] === 0 && a.conMin[0] === 6 && a.subieron[0], "mínimo: el proceso de 1 KB sube de 0 a 6 marcos");
// 4) PFF
ok(M.pff("P1 40\nP2 12\nP3 3", 30, 5).veredicto === "repartir", "PFF: uno pide y otro sobra → repartir");
ok(M.pff("P1 45\nP2 38\nP3 20", 30, 5).veredicto === "sobrepaginacion", "PFF: piden y nadie sobra → sobrepaginación / control de carga");
ok(M.pff("P1 15\nP2 12", 30, 5).veredicto === "estable", "PFF: todos entre A y B → estable");
ok(eq(M.mediaMovil("20 40 10 30").map(x => x.media), [20, 30, 20, 25]), "media móvil (m + último)/2: 20 → 30 → 20 → 25");
const tira = fn => { try { fn(); return false; } catch (e) { return true; } };
ok(tira(() => M.pff("P1 3", 5, 10)) && tira(() => M.localGlobal("A0 1", "Z")) && tira(() => M.asignar(10, "a", 1)), "errores de entrada");
// 5) navegador
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const pg = await b.newPage({ viewport: { width: 1200, height: 900 } }); const err = []; pg.on("pageerror", e => err.push(e.message));
  await pg.goto("file:///" + archivo.split(path.sep).join("/"));
  ok((await pg.textContent("#t-res")).includes("4 KB") && (await pg.getAttribute("#t-res", "class")).includes("ok"), "página: ejemplo del libro carga ok y muestra 4 KB");
  await pg.fill("#t-p", "9"); await pg.dispatchEvent("#t-p", "input");
  ok((await pg.getAttribute("#t-res", "class")).includes("sat"), "página: p = 512 B → saturado");
  await pg.click("[data-tab=lg]"); ok((await pg.textContent("#l-paneles")).includes("B3"), "página: panel global muestra B3");
  await pg.click("[data-tab=asig]"); await pg.click("#a-libro1"); ok((await pg.textContent("#a-vista")).includes("1241"), "página: 1241 marcos");
  await pg.click("[data-tab=pff]"); await pg.click("#p-ej2"); ok((await pg.textContent("#p-res")).includes("Control de carga"), "página: escenario de sobrepaginación");
  await pg.setViewportSize({ width: 390, height: 800 });
  for (const tb of ["tam", "lg", "asig", "pff"]) { await pg.click(`[data-tab=${tb}]`); const w = await pg.evaluate(() => document.documentElement.scrollWidth); if (w > 390) ok(false, "celular: scroll horizontal en " + tb + " (" + w + ")"); }
  ok(true, "celular: revisadas las 4 pestañas");
  await pg.click("[data-tab=tam]"); await pg.screenshot({ path: process.env.SHOT, fullPage: true });
  ok(err.length === 0, "sin errores de JS " + err.join("; "));
  await b.close(); console.log(f ? "\n" + f + " fallos" : "\n0 fallos"); process.exit(f ? 1 : 0);
})();
