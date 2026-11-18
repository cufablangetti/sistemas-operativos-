const { chromium } = require(process.env.APPDATA + "/npm/node_modules/@playwright/mcp/node_modules/playwright-core");
const path = require("path");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
  for (const w of [1200, 375]) {
    const pg = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; pg.on("pageerror", e => errs.push(e.message));
    await pg.goto("file:///" + path.resolve(__dirname, "../unidades/u03-memoria/visuales/reemplazo_paginas.html").split(path.sep).join("/"));
    await pg.click("#fin");
    ok(/Fallos de página\s*10/.test(await pg.textContent("#stats")), w + ": FIFO cadena de clase -> 10 fallos");
    const comp = await pg.textContent("#comparacion");
    ok(/Fallos\s*710999/.test(comp.replace(/\s+/g, "")), w + ": comparación OPT 7, FIFO 10, SO 9, Reloj 9, LRU 9 (" + comp.replace(/\s+/g, "").slice(0, 80) + ")");
    await pg.selectOption("#algo", "SO");
    let n = 0; while (n++ < 12) await pg.click("#sig");
    ok((await pg.locator("#codigo li.ahora").count()) === 1 && (await pg.textContent("#porque")).length > 20, w + ": segunda oportunidad avanza con línea resaltada");
    await pg.selectOption("#algo", "RELOJ"); await pg.click("#fin");
    ok(await pg.locator(".mano").count() >= 1, w + ": reloj muestra la manecilla");
    await pg.click("th.ref[data-i='3']");
    ok(/referencia 4 de 13/.test(await pg.textContent("#contador")), w + ": clic en una referencia salta");
    const sw1 = await pg.evaluate(() => document.documentElement.scrollWidth);
    await pg.click("[data-p=ex]"); await pg.click("#fin-ex");
    ok(/0x38C5/.test(await pg.textContent("#porque-ex")), w + ": examen -> 0x38C5");
    ok((await pg.textContent("#cola-cat")).replace(/\s+/g, "") === "9(1)→7(0)→21(0)→3(1)", w + ": notación cátedra 9(1)→7(0)→21(0)→3(1)");
    ok(await pg.locator("#tabla-ex td.cambio").count() > 5, w + ": cambios de la tabla marcados");
    await pg.click("#ej-ex button:nth-child(2)"); await pg.click("#fin-ex");
    ok((await pg.textContent("#cola-cat")).replace(/\s+/g, "") === "23(1)→27(0)→21(1)→3(1)", w + ": ejemplo cátedra 23(1)→27(0)→21(1)→3(1)");
    const sw2 = await pg.evaluate(() => document.documentElement.scrollWidth);
    await pg.click("[data-p=nru]");
    ok(/B, E/.test(await pg.textContent("#res-nru")), w + ": NRU candidatas B, E");
    const sw3 = await pg.evaluate(() => document.documentElement.scrollWidth);
    ok(Math.max(sw1, sw2, sw3) <= w, w + ": sin scroll horizontal de página " + [sw1, sw2, sw3]);
    ok(errs.length === 0, w + ": sin errores JS " + errs.join("|"));
    if (w === 1200) {
      await pg.click("[data-p=cad]"); await pg.selectOption("#algo", "SO"); for (let i = 0; i < 9; i++) await pg.click("#sig");
      await pg.screenshot({ path: process.env.TEMP + "/reemplazo1.png", fullPage: true });
      await pg.click("[data-p=ex]"); await pg.click("#ej-ex button:nth-child(1)"); for (let i = 0; i < 4; i++) await pg.click("#sig-ex");
      await pg.screenshot({ path: process.env.TEMP + "/reemplazo2.png" });
    }
  }
  await b.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
