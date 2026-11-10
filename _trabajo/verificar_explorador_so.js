// Prueba visuales/explorador_so.html en un Chrome sin ventana.
// Uso: node _trabajo/verificar_explorador_so.js [carpeta_capturas]
const path = require("path"), fs = require("fs");
const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
const URL_E = require("url").pathToFileURL(path.resolve("visuales/explorador_so.html")).href;
const CAP = process.argv[2];

(async () => {
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errores = [];
  page.on("pageerror", e => errores.push(e.message));
  page.on("console", m => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(URL_E);
  await page.waitForTimeout(1500);
  let fallos = 0;
  const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + "  " + m); if (!c) fallos++; };

  // 1. datos
  const errs = await page.evaluate(() => window.__explorador.validar());
  ok(errs.length === 0, "datos válidos (rutas, focos de código, nodos, procesos)" + (errs.length ? "\n      " + errs.join("\n      ") : ""));
  const resumen = await page.evaluate(() => { const T = window.__explorador.TOPICS; return { temas: T.length, pasos: T.reduce((a, t) => a + t.steps.length, 0), u1: T.filter(t => t.u === "U1").length, u2: T.filter(t => t.u === "U2").length }; });
  console.log(`      ${resumen.temas} temas (U1 ${resumen.u1}, U2 ${resumen.u2}), ${resumen.pasos} pasos`);

  // 2. cada paso de cada tema: termina bien y muestra lo que corresponde
  const malos = await page.evaluate(async () => {
    const E = window.__explorador, out = [];
    const raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    for (let ti = 0; ti < E.TOPICS.length; ti++) for (let si = 0; si < E.TOPICS[ti].steps.length; si++) {
      E.go(ti, si); E.fin(); await raf();
      const St = E.TOPICS[ti].steps[si], id = `tema ${ti + 1} paso ${si + 1}`;
      if (document.querySelector("#detalle h2").textContent !== St.t) out.push(id + ": título del detalle");
      if (document.querySelectorAll("#logBody tr").length !== si + 1) out.push(id + ": filas de la bitácora " + document.querySelectorAll("#logBody tr").length);
      if (!document.querySelector("#code").textContent.trim()) out.push(id + ": código vacío");
      if (document.querySelector("#code .cursor")) out.push(id + ": quedó el cursor de tipeo");
      if (document.querySelector("#pkt").getAttribute("opacity") !== "0") out.push(id + ": paquete visible al terminar");
      if (!document.querySelectorAll("#procBody tr").length) out.push(id + ": tabla de procesos vacía");
      if (St.h && St.h.length) {
        const last = St.h[St.h.length - 1][1];
        const n = document.querySelector("#n-" + last);
        if (!/is-active|is-warn/.test(n.getAttribute("class"))) out.push(id + ": el destino final no quedó activo (" + last + ")");
        if (!document.querySelectorAll(".cable.is-used").length && St.h.length > 1) out.push(id + ": sin cables usados");
      }
      if (St.w && St.w.length && !document.querySelectorAll(".node.is-warn").length) out.push(id + ": no marcó la alerta");
      if (St.cf && !document.querySelector("#code .hl-done")) out.push(id + ": el foco del código no quedó marcado");
    }
    return out;
  });
  ok(malos.length === 0, "todos los pasos terminan con detalle, bitácora, código y nodo final correctos" + (malos.length ? "\n      " + malos.slice(0, 20).join("\n      ") : ""));

  // 3. a mitad de un salto: paquete visible, cable activo y código resaltado
  const mitad = await page.evaluate(async () => {
    const E = window.__explorador; E.go(3, 1);   // read: P1 → biblioteca, foco "read"
    E.S.speed = 0; const h = E.S.tl.hops[0]; E.S.el = (h.start + h.end) / 2;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const r = { pkt: document.querySelector("#pkt").getAttribute("opacity"), lbl: document.querySelector("#pktLbl").textContent,
      act: document.querySelectorAll(".cable.is-active").length, hl: (document.querySelector("#code .hl-now") || {}).textContent };
    E.S.speed = 1; return r;
  });
  ok(mitad.pkt === "1" && mitad.lbl === "call read", "a mitad del salto el paquete se ve con su carga (" + mitad.lbl + ")");
  ok(mitad.act >= 1, "a mitad del salto el cable está activo");
  ok(mitad.hl === "read", "a mitad del salto se resalta el código del salto (" + mitad.hl + ")");

  // 4. estado: fin de quantum deja al proceso en Listo
  const est = await page.evaluate(async () => {
    const E = window.__explorador; const ti = E.TOPICS.findIndex(t => t.title.startsWith("Los estados"));
    E.go(ti, 3); E.fin(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return [...document.querySelectorAll("#procBody tr")].map(tr => tr.textContent);
  });
  ok(est.some(t => /P2.*Listo/i.test(t)) && est.some(t => /P1.*Ejecuci/i.test(t)), "fin de quantum: P2 queda Listo y P1 en ejecución (" + est.join(" / ") + ")");

  // 5. modo progresivo: oculta los componentes que todavía no aparecieron
  const prog = await page.evaluate(async () => {
    const E = window.__explorador; document.querySelector("#visP").click(); E.go(0, 0);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const off = document.querySelectorAll(".node.is-off").length; E.fin();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const off2 = document.querySelectorAll(".node.is-off").length; document.querySelector("#visC").click();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { off, off2, off3: document.querySelectorAll(".node.is-off").length };
  });
  ok(prog.off > 10 && prog.off2 < prog.off && prog.off3 === 0, `modo progresivo (${prog.off} ocultos → ${prog.off2} al terminar → ${prog.off3} en completo)`);

  // 6. cámara libre: zoom con botón y arrastre
  const cam = await page.evaluate(async () => {
    document.querySelector("#camL").click(); const a = document.querySelector("#cam").style.transform;
    document.querySelector("#zIn").click(); const b = document.querySelector("#cam").style.transform;
    document.querySelector("#camG").click(); return { a, b, dis: document.querySelector("#zIn").disabled };
  });
  ok(cam.a !== cam.b && cam.dis, "cámara libre: el zoom cambia el encuadre y en guiado se deshabilita");

  // 7. tarjeta al pasar el mouse
  await page.hover("#n-sched .tilegrp");
  await page.waitForTimeout(300);
  const card = await page.evaluate(() => ({ on: document.querySelector("#hover").classList.contains("on"), t: document.querySelector("#hover h4").textContent }));
  ok(card.on && card.t === "PLANIFICADOR", "tarjeta flotante del planificador");

  // 8. navegación completa con el teclado y auto
  const nav = await page.evaluate(async () => {
    const E = window.__explorador; E.go(0, 0);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    const a = [E.S.ti, E.S.si]; const T = E.TOPICS[0]; E.go(0, T.steps.length - 1); E.next(); return { a, b: [E.S.ti, E.S.si] };
  });
  ok(nav.a[1] === 1 && nav.b[0] === 1 && nav.b[1] === 0, "→ avanza un paso y al final del tema pasa al siguiente");

  if (CAP) {
    fs.mkdirSync(CAP, { recursive: true });
    for (const [ti, si, n] of [[3, 3, "read_trap"], [16, 4, "semaforos"], [13, 3, "tsl"]]) {
      await page.evaluate(([ti, si]) => { window.__explorador.go(ti, si); }, [ti, si]);
      await page.waitForTimeout(400);
      await page.evaluate(() => { const E = window.__explorador; E.S.speed = 0; const h = E.S.tl.hops; E.S.el = h.length ? (h[h.length - 1].start + h[h.length - 1].end) / 2 : E.S.tl.end; });
      await page.waitForTimeout(1300);
      await page.screenshot({ path: path.join(CAP, n + ".png") });
      await page.evaluate(() => { window.__explorador.S.speed = 1; });
    }
    await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(CAP, "claro.png") });
    await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  }

  // 9. ancho de teléfono
  const tel = await browser.newPage({ viewport: { width: 375, height: 800 } });
  tel.on("pageerror", e => errores.push("tel: " + e.message));
  await tel.goto(URL_E); await tel.waitForTimeout(1500);
  const sw = await tel.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok(sw[0] <= sw[1], `a 375 px no hay scroll horizontal (${sw[0]} ≤ ${sw[1]})`);
  if (CAP) await tel.screenshot({ path: path.join(CAP, "telefono.png"), fullPage: false });

  // 10. movimiento reducido
  const rm = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
  rm.on("pageerror", e => errores.push("rm: " + e.message));
  await rm.goto(URL_E); await rm.waitForTimeout(500);
  const rmOk = await rm.evaluate(() => { const E = window.__explorador; return E.S.tl && E.S.el >= E.S.tl.end; });
  ok(rmOk, "con movimiento reducido el paso se muestra terminado al instante");

  ok(errores.length === 0, "sin errores de JavaScript" + (errores.length ? ": " + errores.join(" | ") : ""));
  await browser.close();
  console.log(fallos ? `\n${fallos} fallos` : "\n0 fallos");
  process.exit(fallos ? 1 : 0);
})();
