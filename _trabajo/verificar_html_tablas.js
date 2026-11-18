const { chromium } = require(process.env.APPDATA + "/npm/node_modules/@playwright/mcp/node_modules/playwright-core");
const path = require("path");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
  for (const w of [1200, 375]) {
    const pg = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; pg.on("pageerror", e => errs.push(e.message));
    await pg.goto("file:///" + path.resolve(__dirname, "../unidades/u03-memoria/visuales/tablas_paginas.html").split(path.sep).join("/"));
    ok(/4 MB/.test(await pg.textContent("#res")) && (await pg.textContent("#estado")) === "ok", w + ": calculadora 32 bits -> 4 MB, ok");
    await pg.click("[data-e=l64]");
    ok(/32 PB/.test(await pg.textContent("#res")) && (await pg.textContent("#estado")) === "saturado", w + ": 64 bits -> 32 PB, saturado");
    let sw1 = await pg.evaluate(() => document.documentElement.scrollWidth);
    await pg.click("[data-p=div]");
    ok(/TP2 \(10 bits\) = 3/.test(await pg.textContent("#campos")) && /Errata/.test(await pg.textContent("#nota-div")), w + ": 0x00403004 -> TP2=3 con aviso de errata");
    ok(/4 tablas × 4 KB = 16 KB/.test(await pg.textContent("#cuenta-reg")), w + ": regiones del libro -> 16 KB");
    await pg.click(".reg[data-r='2']");
    ok(/5 tablas/.test(await pg.textContent("#cuenta-reg")), w + ": clic en un trozo suma una tabla");
    await pg.fill("#dir", "0x0080500C");
    ok(/= 2/.test(await pg.textContent("#campos")) && /= 5/.test(await pg.textContent("#campos")), w + ": 0x0080500C -> 2 | 5");
    let sw2 = await pg.evaluate(() => document.documentElement.scrollWidth);
    await pg.click("[data-p=comp]");
    let sw3 = await pg.evaluate(() => document.documentElement.scrollWidth);
    ok(Math.max(sw1, sw2, sw3) <= w, w + ": sin scroll horizontal " + [sw1, sw2, sw3]);
    if (w === 1200) await pg.screenshot({ path: process.env.TEMP + "/tablas_comp.png", fullPage: true });
    ok(errs.length === 0, w + ": sin errores JS " + errs.join("|"));
  }
  await b.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
