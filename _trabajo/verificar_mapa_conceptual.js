// Prueba la pagina interactiva del mapa conceptual en un Chrome sin ventana.
// Uso: node _trabajo/verificar_mapa_conceptual.js
const path = require("path");
const URL_MAPA = require("url").pathToFileURL(path.resolve("visuales/mapa_conceptual.html")).href;
const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));

(async () => {
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errores = [];
  page.on("pageerror", e => errores.push(e.message));
  page.on("console", m => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(URL_MAPA);
  let fallos = 0;
  const ok = (cond, msg) => { console.log((cond ? "OK   " : "FALLA") + "  " + msg); if (!cond) fallos++; };

  const secciones = await page.$$eval("section.u", s => s.length);
  ok(secciones === 4, `secciones de primer nivel = ${secciones} (guía, ideas, U1, U2)`);
  const temas = await page.$$eval("#indice a", a => a.length);
  ok(temas > 25, `entradas del índice = ${temas}`);

  // busqueda
  await page.fill("#buscar", "446");
  await page.waitForTimeout(400);
  const est = await page.textContent("#estado");
  const marcas = await page.$$eval("mark", m => m.length);
  ok(/coincidencias/.test(est) && marcas > 0, `buscar "446": ${est}, ${marcas} resaltados`);
  const visibleMBR = await page.isVisible("#u1-arranque");
  const visibleU2 = await page.$eval("#u2-rr", el => !el.closest(".oculto") && !el.classList.contains("oculto"));
  ok(visibleMBR && !visibleU2, "con '446' se ve el arranque y se oculta Round Robin");

  // busqueda sin acentos
  await page.fill("#buscar", "planificacion por pandillas");
  await page.waitForTimeout(400);
  ok(/coincidencias/.test(await page.textContent("#estado")) && await page.isVisible("#u2-pandillas"), "buscar sin acentos encuentra 'Planificación por pandillas'");

  // filtro de errores
  await page.fill("#buscar", "");
  await page.click('#filtros button[data-m="error"]');
  await page.waitForTimeout(300);
  const nErr = parseInt((await page.textContent("#estado")) || "0");
  ok(nErr >= 30, `filtro "Mis errores": ${nErr} nodos`);
  const ocultaGuia = await page.$eval("#guia", el => el.classList.contains("oculto"));
  ok(ocultaGuia, "el filtro oculta las ramas sin errores");
  await page.click('#filtros button[data-m="error"]');
  await page.waitForTimeout(300);
  ok((await page.textContent("#estado")) === "", "al soltar el filtro vuelve todo");

  // cruce entre unidades
  await page.click("#abrir");
  const destino = await page.$eval("#u1-es-programada a.x", a => a.dataset.ir);
  await page.click("#cerrar");
  await page.evaluate(() => document.querySelector("#u1").querySelector("details").open = true);
  await page.evaluate(() => { document.querySelector("#u1-es").open = true; document.querySelector("#u1-es-programada > details").open = true; });
  await page.click("#u1-es-programada a.x");
  await page.waitForTimeout(900);
  const abierto = await page.$eval("#" + destino, el => { let p = el; while (p) { if (p.tagName === "DETAILS" && !p.open) return false; p = p.parentElement; } return true; });
  const enPantalla = await page.$eval("#" + destino, el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; });
  ok(destino === "u2-espera-ocupada" && abierto && enPantalla, `el cruce de E/S programada salta a ${destino}, abierto y en pantalla`);

  // todos los enlaces apuntan a ids existentes
  const rotos = await page.$$eval("a[data-ir]", as => as.filter(a => !document.getElementById(a.dataset.ir)).map(a => a.dataset.ir));
  ok(rotos.length === 0, `enlaces rotos: ${rotos.length}`);

  // modo oscuro y telefono
  const oscuro = await browser.newPage({ colorScheme: "dark", viewport: { width: 375, height: 800 } });
  await oscuro.goto(URL_MAPA);
  const bg = await oscuro.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const desborde = await oscuro.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  ok(bg === "rgb(18, 20, 24)", `fondo en modo oscuro: ${bg}`);
  ok(!desborde, "sin scroll horizontal a 375 px");
  await oscuro.screenshot({ path: process.argv[2] || "mapa_movil.png" });
  await page.click("#abrir");
  await page.goto(page.url().split("#")[0] + "#u2-tres-semaforos");
  await page.waitForTimeout(600);
  await page.screenshot({ path: process.argv[3] || "mapa_escritorio.png" });

  ok(errores.length === 0, "errores de JavaScript: " + (errores.join(" | ") || "ninguno"));
  console.log(`\n${fallos} fallos`);
  await browser.close();
  process.exit(fallos ? 1 : 0);
})();
