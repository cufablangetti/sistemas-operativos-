// Prueba visuales/mapa_grafico.html en un Chrome sin ventana.
// Uso: node _trabajo/verificar_mapa_grafico.js [captura_todo.png] [captura_zoom.png]
const path = require("path"), fs = require("fs");
const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
const URL_G = require("url").pathToFileURL(path.resolve("visuales/mapa_grafico.html")).href;
const ids = new Set([...fs.readFileSync("plan/mapa_conceptual.md", "utf8").matchAll(/\{#([\w-]+)\}/g)].map(m => m[1]));

(async () => {
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errores = [];
  page.on("pageerror", e => errores.push(e.message));
  page.on("console", m => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(URL_G);
  let fallos = 0;
  const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + "  " + m); if (!c) fallos++; };

  const info = await page.evaluate(() => {
    const { porClave, CRUCES } = window.__mapa;
    const ns = Object.values(porClave);
    const cajas = ns.map(n => ({ k: n.k, x: n.x, y: n.y, w: n.w, h: n.h, d: n.destino }));
    const solapes = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) solapes.push(a.k + "/" + b.k);
    }
    const crucesMalos = CRUCES.filter(([a, b]) => !porClave[a] || !porClave[b]).map(c => c.join(">"));
    return { n: ns.length, cajas, solapes, crucesMalos, cruces: CRUCES.length,
             dibujados: document.querySelectorAll("path.x").length };
  });
  ok(info.n >= 100, `cajas: ${info.n}`);
  ok(info.solapes.length === 0, `cajas superpuestas: ${info.solapes.length} ${info.solapes.slice(0, 5).join(" ")}`);
  const sinDestino = info.cajas.filter(c => !ids.has(c.d)).map(c => c.k + "→" + c.d);
  ok(sinDestino.length === 0, `destinos que no existen en el mapa conceptual: ${sinDestino.length} ${sinDestino.join(" ")}`);
  ok(info.crucesMalos.length === 0 && info.dibujados === info.cruces, `cruces dibujados: ${info.dibujados} de ${info.cruces}`);
  await page.screenshot({ path: process.argv[2] || "grafico_todo.png" });

  // vista de una sola unidad
  await page.selectOption("#unidad", "u1");
  await page.waitForTimeout(200);
  const vis = await page.$$eval(".n:not(.oculto)", e => e.length);
  ok(vis > 30 && vis < info.n, `solo la U1: ${vis} cajas visibles`);
  await page.selectOption("#unidad", "so");

  // búsqueda
  await page.fill("#buscar", "pandillas");
  await page.waitForTimeout(200);
  const hits = await page.$$eval(".n.hit", e => e.map(x => x.dataset.k));
  ok(hits.includes("u2aw"), `buscar "pandillas" resalta: ${hits.join(", ")}`);
  await page.screenshot({ path: process.argv[3] || "grafico_zoom.png" });
  await page.fill("#buscar", "");

  // clic en una caja → mapa conceptual en esa rama
  await page.fill("#buscar", "productor-consumidor");
  await page.waitForTimeout(300);
  const caja = await page.$('.n[data-k="u2x"]');
  const bb = await caja.boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.waitForURL(/mapa_conceptual\.html#u2-tres-semaforos/, { timeout: 5000 });
  await page.waitForTimeout(800);
  const abierto = await page.$eval("#u2-tres-semaforos", el => {
    let p = el; while (p) { if (p.tagName === "DETAILS" && !p.open) return false; p = p.parentElement; }
    const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight;
  });
  ok(abierto, "el clic en 'Productor-consumidor' abre el mapa completo en esa rama, visible");

  // arrastrar no navega
  await page.goto(URL_G);
  const c2 = await (await page.$('.n[data-k="u1"]')).boundingBox();
  await page.mouse.move(c2.x + 20, c2.y + 10); await page.mouse.down();
  await page.mouse.move(c2.x + 200, c2.y + 120, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(300);
  ok(page.url().includes("mapa_grafico.html"), "arrastrar sobre una caja mueve el mapa y no navega");

  // oscuro y celular
  const m = await browser.newPage({ colorScheme: "dark", viewport: { width: 375, height: 760 } });
  await m.goto(URL_G);
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "sin scroll horizontal de la página a 375 px");
  ok(errores.length === 0, "errores de JavaScript: " + (errores.join(" | ") || "ninguno"));
  console.log(`\n${fallos} fallos`);
  await browser.close();
  process.exit(fallos ? 1 : 0);
})();
