const { chromium } = require(process.env.APPDATA + "/npm/node_modules/@playwright/mcp/node_modules/playwright-core");
const path = require("path");
const SP = "C:/Users/Usuario/AppData/Local/Temp/claude/505adbe42f4da886/909be17a-f4e2-47e1-be77-21fd572e4308/scratchpad/";
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
  for (const w of [1200, 375]) {
    const pg = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; pg.on("pageerror", e => errs.push(e.message));
    await pg.goto("file:///" + path.resolve(__dirname, "../unidades/u03-memoria/visuales/segmentacion_paginada.html").split(path.sep).join("/"));
    ok((await pg.textContent("#m-cont")) === "Paso 1 de 7", w + "px: MULTICS normal 7 pasos");
    await pg.evaluate(q => { const b = document.getElementById(q + "-sig"); while (!b.disabled) b.click(); }, "m");
    ok(/12388/.test(await pg.textContent("#m-celdas")), w + "px: MULTICS llega a 12388");
    if (w === 1200) await pg.screenshot({ path: SP + "segpag_m.png", fullPage: true });
    await pg.selectOption("#m-esc", "falloSeg"); await pg.evaluate(q => { const b = document.getElementById(q + "-sig"); while (!b.disabled) b.click(); }, "m");
    ok(/FALLO DE SEGMENTO/.test(await pg.textContent("#m-porque")), w + "px: escenario fallo de segmento");
    await pg.fill("#m-d", "5000");
    ok(/10 bits/.test(await pg.textContent("#m-err")), w + "px: error de rango visible");
    await pg.click("#pest button[data-t=pen]");
    await pg.evaluate(q => { const b = document.getElementById(q + "-sig"); while (!b.disabled) b.click(); }, "p");
    ok(/0x0002BA5C/.test(await pg.textContent("#p-celdas")), w + "px: Pentium llega a 0x0002BA5C");
    if (w === 1200) await pg.screenshot({ path: SP + "segpag_p.png", fullPage: true });
    await pg.selectOption("#p-esc", "libro"); await pg.evaluate(q => { const b = document.getElementById(q + "-sig"); while (!b.disabled) b.click(); }, "p");
    ok(/0x00100010/.test(await pg.textContent("#p-celdas")) && /SEGMENTACIÓN PURA/.test(await pg.textContent("#p-porque")), w + "px: selector 72 sin paginación");
    await pg.click("#pest button[data-t=ani]");
    ok(/TRAP/.test(await pg.textContent("#a-res")), w + "px: usuario a datos del kernel → TRAP");
    await pg.selectOption("#a-op", "compuerta");
    ok(/Permitido/.test(await pg.textContent("#a-res")), w + "px: compuerta permitida");
    if (w === 1200) await pg.screenshot({ path: SP + "segpag_a.png" });
    const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, w + "px: sin scroll horizontal (" + sw + ")");
    ok(errs.length === 0, w + "px: sin errores JS " + errs.join("|"));
  }
  await b.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
