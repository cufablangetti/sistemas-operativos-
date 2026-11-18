const { chromium } = require(process.env.APPDATA + "/npm/node_modules/@playwright/mcp/node_modules/playwright-core");
const path = require("path");
const SP = "C:/Users/Usuario/AppData/Local/Temp/claude/505adbe42f4da886/909be17a-f4e2-47e1-be77-21fd572e4308/scratchpad/";
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
  for (const w of [1200, 375]) {
    const pg = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; pg.on("pageerror", e => errs.push(e.message));
    await pg.goto("file:///" + path.resolve(__dirname, "../unidades/u03-memoria/visuales/listas_paginas_windows.html").split(path.sep).join("/"));
    ok(await pg.locator("#eventos button:not([disabled])").count() === 2, w + "px: desde libres, 2 eventos habilitados");
    for (let i = 0; i < 4; i++) await pg.click("#sig");
    ok(/modificadas/.test(await pg.textContent("#celdas")) && /\(1\)/.test(await pg.textContent("#cod li.ahora")), w + "px: paso 4 en modificadas, resalta (1)");
    if (w === 1200) await pg.screenshot({ path: SP + "listas_win.png", fullPage: true });
    for (let i = 0; i < 5; i++) await pg.click("#sig");
    ok(/Fallosduros1/.test((await pg.textContent("#celdas")).replace(/\s/g, "")), w + "px: fin del recorrido con 1 fallo duro");
    await pg.click("#ant");
    ok(/libres/.test(await pg.textContent("#celdas")), w + "px: deshacer vuelve a libres");
    await pg.click("#rei"); await pg.click("#eventos button[data-id=referenciada]"); await pg.click("#eventos button[data-id=escribe]");
    ok(/D = 1/.test(await pg.textContent("#dia")), w + "px: modo libre, marco sucio");
    const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, w + "px: sin scroll horizontal (" + sw + ")");
    ok(errs.length === 0, w + "px: sin errores JS " + errs.join("|"));
  }
  await b.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
