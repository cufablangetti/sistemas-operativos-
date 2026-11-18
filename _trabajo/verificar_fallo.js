// Verifica unidades/u03-memoria/visuales/fallo_de_pagina.html (motor + navegador)
const fs = require("fs"), vm = require("vm"), path = require("path");
const archivo = path.resolve(__dirname, "../unidades/u03-memoria/visuales/fallo_de_pagina.html");
const ctx = { module: { exports: {} }, JSON }; vm.createContext(ctx);
vm.runInContext(/<script id="motor">([\s\S]*?)<\/script>/.exec(fs.readFileSync(archivo, "utf8"))[1], ctx);
const M = ctx.module.exports;
let f = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) f++; };
const numeros = ps => ps.map(p => p.paso);
let s = M.simular("sucia");
ok(JSON.stringify([...new Set(numeros(s))]) === JSON.stringify([0,1,2,3,4,5,6,7,8,9,10]), "víctima sucia: recorre los pasos 1 a 10 en orden");
ok(s.find(p => p.paso === 5).estado.estadoA === "BLOQUEADO" && s.find(p => p.paso === 6).estado.estadoA === "BLOQUEADO", "sucia: A BLOQUEADO durante la escritura y la lectura");
ok(s.find(p => p.paso === 7).estado.estadoA === "LISTO", "sucia: tras la interrupción de disco A pasa a LISTO (no a ejecución)");
const fin = s[s.length - 1].estado;
ok(fin.tabla[5].P === 1 && fin.tabla[5].marco === 7 && fin.tabla[3].P === 0 && fin.modo === "usuario" && fin.cpu === "A", "sucia: al final pág. 5 → marco 7, pág. 3 ausente, A en modo usuario");
ok(s.filter(p => p.actor === "DISCO").length === 2, "sucia: dos eventos de disco (escritura y lectura)");
s = M.simular("limpia");
ok(s.filter(p => p.actor === "DISCO").length === 1 && s[s.length - 1].estado.tabla[5].marco === 7, "limpia: solo la lectura; pág. 5 → marco 7");
s = M.simular("libre");
ok(s[s.length - 1].estado.tabla[5].marco === 4 && s[s.length - 1].estado.tabla[3].P === 1, "marco libre: pág. 5 → marco 4 y la 3 sigue presente");
for (const e of ["invalida", "proteccion"]) {
  s = M.simular(e);
  ok(Math.max(...numeros(s)) === 4 && s[s.length - 1].estado.senal.startsWith("SIGSEGV") && s[s.length - 1].estado.tabla[5].P === 0, e + ": termina en el paso 4 con señal, sin traer páginas");
}
ok(M.simular("sucia")[1].actor === "HARDWARE" && M.simular("sucia")[2].actor === "ENSAMBLADOR" && M.simular("sucia").slice(-1)[0].actor === "ENSAMBLADOR", "actores: paso 1 HW, paso 2 y 10 ensamblador");
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/@playwright/mcp/node_modules/playwright-core"));
  const br = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const pg = await br.newPage({ viewport: { width: 1200, height: 900 } }); const err = []; pg.on("pageerror", x => err.push(x.message));
  await pg.goto("file:///" + archivo.split(path.sep).join("/"));
  const n = Number((await pg.textContent("#cont")).match(/de (\d+)/)[1]);
  for (let i = 1; i < n; i++) await pg.click("#sig");
  ok((await pg.textContent("#porque")).includes("Paso 10") && await pg.isDisabled("#sig"), "página: llega al paso 10 y se deshabilita Siguiente");
  await pg.selectOption("#esc", "proteccion"); for (let i = 0; i < 4; i++) await pg.click("#sig");
  ok((await pg.textContent("#celdas")).includes("SIGSEGV"), "página: escenario de protección muestra la señal");
  await pg.setViewportSize({ width: 390, height: 800 });
  const w = await pg.evaluate(() => document.documentElement.scrollWidth); ok(w <= 390, "celular sin scroll horizontal (" + w + ")");
  await pg.selectOption("#esc", "sucia"); for (let i = 0; i < 5; i++) await pg.click("#sig");
  await pg.screenshot({ path: process.env.SHOT, fullPage: true });
  ok(err.length === 0, "sin errores de JS " + err.join("; "));
  await br.close(); console.log(f ? f + " fallos" : "0 fallos"); process.exit(f ? 1 : 0);
})();
