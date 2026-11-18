// Verifica unidades/u03-memoria/visuales/copia_en_escritura.html (motor + navegador)
const fs = require("fs"), vm = require("vm"), path = require("path");
const archivo = path.resolve(__dirname, "../unidades/u03-memoria/visuales/copia_en_escritura.html");
const ctx = { module: { exports: {} }, JSON }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(fs.readFileSync(archivo, "utf8"))[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
let p = M.correr("cow", M.GUION), e = s => p[s].estado;
ok(e(1).copias === 0 && Object.values(e(1).tablas.hijo).every((x, i) => x.marco === i && x.prot === "R"), "COW fork: 0 copias, el hijo apunta a los mismos marcos 0–4, todo solo lectura");
ok(e(1).tablas.padre.D0.prot === "R" && e(1).marcos[2].refs === 2, "COW fork: el padre también queda en solo lectura; marco 2 compartido ×2");
ok(e(2).traps === 0, "hijo lee D0: sin trap");
ok(e(3).copias === 1 && e(3).tablas.padre.D0.marco === 5 && e(3).tablas.padre.D0.prot === "RW" && e(3).tablas.hijo.D0.prot === "RW" && e(3).tablas.hijo.D0.marco === 2, "padre escribe D0: trap, copia al marco 5; las dos copias en L-E");
ok(e(4).traps === 1 && e(4).copias === 1, "hijo escribe D0 después: ya es L-E, sin trap");
ok(e(5).copias === 2 && e(5).tablas.hijo.P0.marco === 6 && e(5).tablas.padre.P0.prot === "RW", "hijo escribe P0: segunda copia (marco 6)");
ok(e(6).traps === 2, "hijo lee T0: sin trap");
ok(e(7).errores === 1 && e(7).copias === 2 && e(7).tablas.hijo.T0.prot === "R", "hijo escribe T0: trap y violación real, no se copia");
ok(e(8).tablas.padre.D1.prot === "RW" && !e(8).tablas.padre.D1.cow && e(8).copias === 2, "hijo execve: D1 del padre vuelve a L-E; total 2 copias");
const s = M.correr("sin", M.GUION);
ok(s[1].estado.copias === 3 && s[s.length - 1].estado.copias === 3, "sin COW: el fork copia 3 páginas (D0, D1, P0) y se tiran con execve");
ok(s[3].estado.traps === 0, "sin COW: padre escribe D0 sin trap");
const b = M.bibliotecaAbs(36 * 1024, 12 * 1024, 16);
ok(b.absolutoP1 === 36 * 1024 + 16 && b.absolutoP2Real !== b.absolutoP2Esperado && b.relativoP2 === 12 * 1024 + 16, "fig. 3-27: absoluto falla en el proceso 2; relativo llega a 12K+16");
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
  const br = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const pg = await br.newPage({ viewport: { width: 1200, height: 900 } }); const err = []; pg.on("pageerror", x => err.push(x.message));
  await pg.goto("file:///" + archivo.split(path.sep).join("/"));
  for (let i = 0; i < 3; i++) await pg.click("#sig");
  ok((await pg.textContent("#porque")).includes("TRAP") && (await pg.textContent("#stats")).includes("1páginas copiadas"), "página: paso 4 muestra el trap y 1 copia");
  await pg.selectOption("#modo", "sin"); ok((await pg.textContent("#stats")).includes("3páginas copiadas"), "página: escenario sin COW → 3 copias");
  await pg.click("#vaciar"); await pg.click('[data-a="padre fork"]'); await pg.click('[data-a="hijo escribe T1"]');
  ok((await pg.textContent("#porque")).includes("violación"), "página: acciones libres funcionan");
  await pg.click("[data-tab=lib]"); ok((await pg.textContent("#b-res")).includes("Salta a cualquier lado"), "página: calculadora de la fig. 3-27");
  await pg.setViewportSize({ width: 390, height: 800 });
  for (const t of ["cow", "lib"]) { await pg.click(`[data-tab=${t}]`); const w = await pg.evaluate(() => document.documentElement.scrollWidth); ok(w <= 390, "celular sin scroll horizontal en " + t + " (" + w + ")"); }
  await pg.click("[data-tab=cow]"); await pg.screenshot({ path: process.env.SHOT, fullPage: true });
  ok(err.length === 0, "sin errores de JS " + err.join("; "));
  await br.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
