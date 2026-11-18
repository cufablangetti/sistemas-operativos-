const { chromium } = require(process.env.APPDATA + "/npm/node_modules/@playwright/mcp/node_modules/playwright-core");
const path = require("path");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
  const pg = await b.newPage({ viewport: { width: 1300, height: 900 } });
  const errs = []; pg.on("pageerror", e => errs.push(e.message));
  await pg.goto("file:///" + path.resolve(__dirname, "../visuales/mapa_grafico.html").split(path.sep).join("/"));
  await pg.selectOption("#unidad", "u3");
  const vis = await pg.evaluate(() => [...document.querySelectorAll(".n")].filter(n => !n.classList.contains("oculto")).length);
  ok(vis === 60, "solo la U3: " + vis + " cajas visibles");
  await pg.fill("#buscar", "wsclock"); await pg.waitForTimeout(200);
  ok((await pg.evaluate(() => [...document.querySelectorAll(".n.hit")].map(n => n.dataset.k).join())).includes("u3ac"), "buscar 'wsclock' resalta u3ac");
  await pg.screenshot({ path: "C:/Users/Usuario/AppData/Local/Temp/claude/505adbe42f4da886/909be17a-f4e2-47e1-be77-21fd572e4308/scratchpad/mapa_grafico_u3.png" });
  ok(errs.length === 0, "sin errores JS " + errs.join("|"));
  await b.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
