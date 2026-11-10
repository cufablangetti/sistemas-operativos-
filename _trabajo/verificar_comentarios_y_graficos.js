// Prueba en Chrome sin ventana: comentarios del mapa grafico + los 4 graficos nuevos.
// Uso: node _trabajo/verificar_comentarios_y_graficos.js [carpeta_capturas]
const path = require("path"), fs = require("fs");
const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
const url = f => require("url").pathToFileURL(path.resolve(f)).href;
const CAP = process.argv[2];
let fallos = 0;
const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + "  " + m); if (!c) fallos++; };

async function abrir(browser, f, w = 1400, h = 900){
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.errores = [];
  page.on("pageerror", e => page.errores.push(e.message));
  page.on("console", m => { if (m.type() === "error") page.errores.push(m.text()); });
  await page.goto(url(f));
  return page;
}
const sinScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

(async () => {
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

  // ---------- mapa grafico: comentarios
  console.log("== mapa_grafico.html (comentarios)");
  let p = await abrir(browser, "visuales/mapa_grafico.html");
  const info = await p.evaluate(() => {
    const { lista, porNodo } = window.__comentarios, { porClave } = window.__mapa;
    return { n: lista.length, nodosMalos: Object.keys(porNodo).filter(k => !porClave[k]),
             burbujas: document.querySelectorAll(".cm-badge").length, nodos: Object.keys(porNodo).length,
             ojo: lista.filter(c => c.ojo).length };
  });
  ok(info.n >= 55, `comentarios cargados: ${info.n}`);
  ok(info.nodosMalos.length === 0, "todos los comentarios apuntan a una caja que existe " + info.nodosMalos.join(","));
  ok(info.burbujas === info.nodos, `una burbuja por caja comentada: ${info.burbujas}`);
  const links = await p.evaluate(() => [...new Set(window.__comentarios.lista.filter(c => c.graf).map(c => c.graf))]
      .concat([...document.querySelectorAll("#graf-lista a")].map(a => a.getAttribute("href"))));
  const faltan = links.filter(l => !fs.existsSync(path.resolve("visuales", l)));
  ok(faltan.length === 0, "todos los gráficos enlazados existen " + faltan.join(", "));
  const caja = await p.evaluate(() => { const n = window.__mapa.porClave.u2s; return [n.h, n.el.offsetHeight]; });
  ok(caja[0] === caja[1], "las burbujas no cambian el alto de las cajas");
  // clic en la burbuja: abre el panel filtrado y NO navega
  const antes = p.url();
  await p.evaluate(() => window.__comentarios.irA("u2u"));
  await p.click('.n[data-k="u2u"] .cm-badge');
  await p.waitForTimeout(150);
  const panel = await p.evaluate(() => ({ abierto: document.getElementById("cm-panel").classList.contains("abierto"),
     cards: document.querySelectorAll("#cm-lista .cm-card").length, aviso: document.getElementById("cm-aviso").textContent }));
  ok(p.url() === antes, "clic en la burbuja no navega al mapa completo");
  ok(panel.abierto && panel.cards === 2 && /Inversión/.test(panel.aviso), `panel abierto con los 2 comentarios de la caja (${panel.cards})`);
  ok(await p.$eval("#cm-lista", el => el.textContent.includes("No es un interbloqueo")), "la corrección del interbloqueo aparece");
  await p.click('#cm-filtros button[data-f="ojo"]');
  const nOjo = await p.$$eval("#cm-lista .cm-card", e => e.length);
  ok(nOjo === info.ojo, `filtro ⚠️: ${nOjo} comentarios con corrección`);
  await p.click('#cm-filtros button[data-f="todos"]');
  await p.fill("#cm-q", "hipervisor");
  const nBus = await p.$$eval("#cm-lista .cm-card", e => e.length);
  ok(nBus >= 1, `buscar "hipervisor": ${nBus}`);
  await p.click("#cm-lista .cm-card");
  const foco = await p.evaluate(() => { const el = document.querySelector(".n.cm-foco"); if (!el) return null;
     const r = el.getBoundingClientRect(), v = document.getElementById("vista").getBoundingClientRect();
     return { k: el.dataset.k, dentro: r.left >= v.left && r.right <= v.right && r.top >= v.top && r.bottom <= v.bottom }; });
  ok(foco && foco.k === "u1af" && foco.dentro, "clic en la tarjeta centra y resalta la caja del hipervisor");
  await p.click("#cm-lista .cm-card label input");
  ok(await p.$eval("#cm-lista .cm-card", el => el.classList.contains("resuelto")), "marcar «Resuelto» atenúa la tarjeta");
  await p.click("#cm-lista .cm-card label input");
  await p.click("#tab-graf");
  ok(await p.$$eval("#graf-lista a.graf", e => e.length) >= 12, "pestaña Gráficos con los enlaces");
  await p.click("#cm-cerrar");
  await p.click("#verburbujas");
  ok(await p.$eval('.n[data-k="u2u"] .cm-badge', el => getComputedStyle(el).display === "none"), "el tilde «Burbujas» las oculta");
  await p.click("#verburbujas");
  if (CAP){
    await p.evaluate(() => {
      document.getElementById("cm-q").value = ""; document.querySelector('.n[data-k="u2s"] .cm-badge').click(); window.__comentarios.irA("u2s"); });
    await p.waitForTimeout(200); await p.screenshot({ path: path.join(CAP, "mapa_comentarios.png") });
  }
  ok(p.errores.length === 0, "mapa: errores de JavaScript: " + (p.errores.join(" | ") || "ninguno"));
  const m = await abrir(browser, "visuales/mapa_grafico.html", 375, 800);
  await m.click("#btn-cm");
  ok(await sinScroll(m), "mapa a 375 px con el panel abierto: sin scroll horizontal");
  ok(await m.$eval("#cm-panel", el => el.getBoundingClientRect().width <= 376), "a 375 px el panel ocupa el ancho de la pantalla");
  if (CAP) await m.screenshot({ path: path.join(CAP, "mapa_comentarios_movil.png") });

  // ---------- exclusion mutua
  console.log("== exclusion_mutua.html");
  p = await abrir(browser, "unidades/u02-procesos/visuales/exclusion_mutua.html");
  for (let i = 0; i < 4; i++) await p.click("#sig");
  ok(await p.$eval("#rc", el => el.classList.contains("dos")), "candado: al paso 4 los dos en la región crítica (alerta roja)");
  ok(await p.$eval("#porque", el => el.textContent.includes("⚠️")), "candado: aparece la marca ⚠️");
  await p.click("#ant");
  ok(!(await p.$eval("#rc", el => el.classList.contains("dos"))), "Anterior vuelve un paso");
  await p.selectOption("#esc", "peterson");
  let dosPeterson = false;
  for (let i = 0; i < 20; i++) { if (await p.$eval("#sig", b => b.disabled)) break; await p.click("#sig"); if (await p.$eval("#rc", el => el.classList.contains("dos"))) dosPeterson = true; }
  ok(!dosPeterson, "peterson: en todo el guion nunca hay dos adentro");
  await p.click("#m-libre");
  ok(await p.$$eval(".ejecutar", e => e.length) === 2, "modo libre: un botón por proceso");
  await p.click('.ejecutar[data-p="B"]'); await p.click('.ejecutar[data-p="A"]');
  ok(await p.$eval("#cont", el => el.textContent.includes("2 pasos")), "modo libre ejecuta lo que elijo");
  await p.click("#m-guion");
  await p.selectOption("#esc", "inversion");
  for (let i = 0; i < 30; i++) { if (await p.$eval("#sig", b => b.disabled)) break; await p.click("#sig"); }
  ok(await p.$eval("#porque", el => el.textContent.includes("NO es interbloqueo")), "inversión: termina con la aclaración de que no es interbloqueo");
  if (CAP) await p.screenshot({ path: path.join(CAP, "exclusion_mutua.png"), fullPage: true });
  ok(p.errores.length === 0, "exclusión mutua: errores de JavaScript: " + (p.errores.join(" | ") || "ninguno"));
  const em = await abrir(browser, "unidades/u02-procesos/visuales/exclusion_mutua.html", 375, 800);
  ok(await sinScroll(em), "exclusión mutua a 375 px: sin scroll horizontal");

  // ---------- cambio de contexto
  console.log("== cambio_de_contexto.html");
  p = await abrir(browser, "unidades/u02-procesos/visuales/cambio_de_contexto.html");
  await p.click('.escs button[data-e="llamada"]');
  for (let i = 0; i < 9; i++) await p.click("#sig");
  ok(await p.$eval("#sig", b => b.disabled), "llamada: llega al paso 8 y se deshabilita Siguiente");
  ok(await p.$eval("#bcps", el => el.textContent.includes("Bloqueado")), "llamada: P1 termina Bloqueado");
  await p.click('.escs button[data-e="quantum"]');
  for (let i = 0; i < 6; i++) await p.click("#sig");
  ok(await p.$eval("#porque", el => el.textContent.includes("Fin de quantum → LISTO")), "quantum: en el paso 5 aparece la marca ⚠️ de LISTO");
  await p.click('#pasos li[data-i="3"]');
  ok(await p.$eval("#porque", el => el.textContent.includes("todo lo que hace el hardware")), "clic en un paso de la lista salta a ese paso");
  if (CAP) await p.screenshot({ path: path.join(CAP, "cambio_contexto.png"), fullPage: true });
  ok(p.errores.length === 0, "cambio de contexto: errores de JavaScript: " + (p.errores.join(" | ") || "ninguno"));
  const cc = await abrir(browser, "unidades/u02-procesos/visuales/cambio_de_contexto.html", 375, 800);
  ok(await sinScroll(cc), "cambio de contexto a 375 px: sin scroll horizontal");

  // ---------- comparaciones
  console.log("== comparaciones.html");
  p = await abrir(browser, "visuales/comparaciones.html");
  await p.click("#h-read");
  const h = await p.evaluate(() => ({ u: document.querySelectorAll('[data-h="u"].bloq').length, k: document.querySelectorAll('[data-h="k"].corre').length, k2: document.querySelector('[data-h="k2"]').classList.contains("bloq") }));
  ok(h.u === 2 && h.k === 2 && h.k2, "hilos: con read() se bloquea todo en usuario y solo T2 en kernel");
  for (const t of ["chrome", "hiper", "bufer", "mp"]) { await p.click(`#tabs button[data-t="${t}"]`); ok(await p.$eval("#s-" + t, el => el.classList.contains("on") && el.offsetHeight > 200), `pestaña ${t} visible`); }
  await p.click('#tabs button[data-t="hiper"]'); await p.click("#v-orden");
  ok(await p.$eval(".orden", el => getComputedStyle(el).display !== "none"), "hipervisores: muestra el orden de arranque");
  await p.click('#tabs button[data-t="chrome"]'); await p.click("#c-crash");
  ok(await p.$eval('[data-c="p1"]', el => el.classList.contains("corre")) && await p.$eval('[data-c="h1"]', el => el.classList.contains("caida")), "chrome: con hilos cae todo, con procesos solo la pestaña 2");
  await p.click('#tabs button[data-t="hilos"]');
  if (CAP) await p.screenshot({ path: path.join(CAP, "comparaciones.png"), fullPage: true });
  ok(p.errores.length === 0, "comparaciones: errores de JavaScript: " + (p.errores.join(" | ") || "ninguno"));
  const co = await abrir(browser, "visuales/comparaciones.html", 375, 800);
  ok(await sinScroll(co), "comparaciones a 375 px: sin scroll horizontal");

  // ---------- calculadoras
  console.log("== calculadoras.html");
  p = await abrir(browser, "visuales/calculadoras.html");
  await p.click("#mp-ej");
  ok(await p.$eval("#mp-num", el => el.textContent.includes("67,23")), "multiprogramación: ejemplo da 67,23 %");
  await p.click('#tabs button[data-t="cache"]'); await p.click("#ca-ej1");
  ok(await p.$eval("#ca-num", el => el.textContent.includes("1,50 ns") && el.textContent.includes("6,67")), "caché: 1,50 ns y 6,67 veces");
  await p.click('#tabs button[data-t="q"]'); await p.click("#q-ej1");
  ok(await p.$eval("#q-tx", el => el.textContent.includes("20,0")) && await p.$eval("#q-est", el => el.classList.contains("sat")), "quantum 4/1: 20 % y estado saturado");
  await p.click('#tabs button[data-t="tr"]'); await p.click("#tr-ej2");
  ok(await p.$eval("#tr-cta", el => el.textContent.includes("0,700")) && await p.$eval("#tr-max", el => el.textContent.includes("150,0")), "tiempo real (clase): 0,700 y 150 ms");
  await p.fill('#tr-filas input[data-i="0"][data-c="1"]', "60");
  ok(await p.$eval("#tr-est", el => el.classList.contains("sat")), "tiempo real: al subir C de A a 60 pasa a NO planificable");
  await p.click('#tabs button[data-t="me"]'); await p.click("#me-ej2");
  ok(await p.$eval("#me-est", el => el.classList.contains("sat")) && await p.$eval("#me-cta", el => el.textContent.includes("→ 6 CPU")), "maestro-esclavo: 8 × 15 % saturado, máximo 6");
  await p.click('#tabs button[data-t="lot"]'); await p.click("#lo-ej1");
  ok(await p.$eval("#lo-cta", el => el.textContent.includes("60,0 %")), "lotería: C 60 %");
  await p.click('#lo-filas input[data-b="2"]');
  ok(await p.$eval("#lo-cta", el => el.textContent.includes("C no participa") && el.textContent.includes("75,0 %")), "lotería: con C bloqueado, B pasa a 75 %");
  await p.click('#tabs button[data-t="mp"]');
  if (CAP) await p.screenshot({ path: path.join(CAP, "calculadoras.png"), fullPage: true });
  ok(p.errores.length === 0, "calculadoras: errores de JavaScript: " + (p.errores.join(" | ") || "ninguno"));
  const ca = await abrir(browser, "visuales/calculadoras.html", 375, 800);
  ok(await sinScroll(ca), "calculadoras a 375 px: sin scroll horizontal");

  await browser.close();
  console.log(fallos ? `\n${fallos} FALLOS` : "\n0 fallos");
  process.exit(fallos ? 1 : 0);
})();
