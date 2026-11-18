// Verifica que la U4 se dibuje en visuales/mapa_grafico.html (selector, cajas, cruces) sin errores
const path = require('path');
const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
const F = path.resolve(__dirname, '../visuales/mapa_grafico.html');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let ok = 0, mal = 0; const t = (n, c) => { c ? ok++ : mal++; console.log(c ? 'OK   ' : 'FALLA', n); };
  await p.goto('file:///' + F.split(path.sep).join('/'));
  await p.waitForTimeout(800);
  const html0 = await p.content();
  t('opción «Solo la Unidad 4» presente', html0.includes('value="u4"'));
  const sel = await p.$('select');
  if (sel) { await p.selectOption('select', 'u4').catch(() => {}); await p.waitForTimeout(600); }
  const txt = await p.evaluate(() => document.body.innerText);
  t('se ve la caja de la U4', txt.includes('U4 — Sistemas de archivos'));
  t('se ve «Las 3 tablas ★★»', txt.includes('Las 3 tablas'));
  t('se ve «FAT ★»', txt.includes('FAT ★'));
  await p.screenshot({ path: path.join(process.env.TEMP || '.', 'mapa_grafico_u04.png') });
  t('sin errores JS', errs.length === 0); if (errs.length) console.log(errs);
  await b.close(); console.log(`\n${ok} OK, ${mal} fallos`);
})();
