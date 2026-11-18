const { chromium } = require(process.env.APPDATA + "/npm/node_modules/@playwright/mcp/node_modules/playwright-core");
const path = require("path");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
  for (const w of [1200, 375]) {
    const pg = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; pg.on("pageerror", e => errs.push(e.message));
    await pg.goto("file:///" + path.resolve(__dirname, "../unidades/u03-memoria/visuales/tlb.html").split(path.sep).join("/"));
    ok(await pg.locator(".chip").count() === 12, w + "px: 12 referencias cargadas");
    for (let i = 0; i < 5; i++) await pg.click("#sig");
    ok((await pg.textContent("#contador")).startsWith("Paso 6"), w + "px: avanza con Siguiente paso");
    await pg.click("#fin");
    ok(await pg.locator(".chip.duro").count() === 4 && await pg.locator(".chip.acierto").count() === 2, w + "px: al final 4 duros, 2 aciertos coloreados");
    ok(/Protección\s*1/.test(await pg.textContent("#stats")), w + "px: 1 fallo de protección");
    await pg.click(".chip[data-i='6']");
    ok(/Referencia a la página 130/.test(await pg.textContent("#porque")), w + "px: clic en chip salta a la referencia 130w");
    await pg.click("#ejemplos button:nth-child(4)"); await pg.click("#fin");
    ok(/1 escritura/.test(await pg.textContent("#disco")), w + "px: ejemplo sucio, 1 escritura");
    const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, w + "px: sin scroll horizontal (" + sw + ")");
    ok(errs.length === 0, w + "px: sin errores JS " + errs.join("|"));
    if (w === 1200) { await pg.click("#ejemplos button:nth-child(1)"); for (let i = 0; i < 40; i++) await pg.click("#sig"); await pg.screenshot({ path: process.env.TEMP + "/tlb.png", fullPage: true }); }
  }
  await b.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
