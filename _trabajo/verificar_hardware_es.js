// Verifica hardware_es.html: a dónde va cada acceso en los tres esquemas y el ciclo de sondeo con caché
const fs = require('fs'), vm = require('vm'), path = require('path');
const F = path.resolve(__dirname, '../unidades/u05-entrada-salida/visuales/hardware_es.html');
const src = fs.readFileSync(F, 'utf8').match(/<script id="motor">([\s\S]*?)<\/script>/)[1];
const ctx = {module:{exports:{}}}; vm.createContext(ctx); vm.runInContext(src, ctx);
const M = ctx.module.exports;
let ok = 0, mal = 0; const t = (n, c) => { c ? ok++ : mal++; console.log(c ? 'OK  ' : 'FALLA', n); };
t('sep: IN al registro de control = ok', M.acceso('sep','IN','ctrl').ok);
t('sep: MOV al registro de control = mal (lee RAM)', !M.acceso('sep','MOV','ctrl').ok);
t('sep: MOV a la RAM = ok', M.acceso('sep','MOV','ram').ok);
t('map: MOV al registro = ok', M.acceso('map','MOV','ctrl').ok);
t('map: IN no existe', !M.acceso('map','IN','ctrl').ok && M.acceso('map','IN','ctrl').espacio === null);
t('hib: MOV al búfer de video = ok', M.acceso('hib','MOV','buf').ok);
t('hib: IN al registro = ok', M.acceso('hib','IN','ctrl').ok);
t('hib: MOV al registro = mal', !M.acceso('hib','MOV','ctrl').ok);
const sin = M.cicloSondeo(false, 8), con = M.cicloSondeo(true, 8);
t('sin caché sale en la lectura 3', sin.listo && sin.ev.length === 3);
t('con caché no sale nunca (ciclo infinito)', !con.listo && con.ev.length === 8);
t('con caché: el dispositivo vale 0 pero la CPU lee 1', con.ev[5].dev === 0 && con.ev[5].leido === 1 && con.ev[5].deCache);
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errs = [];
  for (const w of [1200, 380]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///' + F.split(path.sep).join('/'));
    t(`${w}: 3 paneles`, (await p.$$('.esq')).length === 3);
    await p.selectOption('#esq', 'map'); await p.selectOption('#ins', 'IN');
    t(`${w}: avisa que IN no existe`, (await p.textContent('#res')).includes('no existe'));
    await p.click('#t2'); for (let i = 0; i < 8; i++) await p.click('#cSig').catch(() => {});
    t(`${w}: ciclo infinito con caché`, (await p.textContent('#cEst')).includes('Ciclo infinito'));
    await p.selectOption('#cache', 'no'); for (let i = 0; i < 3; i++) await p.click('#cSig');
    t(`${w}: sin caché sale`, (await p.textContent('#cEst')).includes('Salió'));
    await p.click('#t3');
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    t(`${w}: sin scroll horizontal (${sw})`, sw <= w);
  }
  t('sin errores JS', errs.length === 0); if (errs.length) console.log(errs);
  await b.close(); console.log(`\n${ok} OK, ${mal} fallos`);
})();
