const path = require('path');
const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
(async () => {
  const F = path.resolve(__dirname, '../unidades/u04-archivos/visuales/fsck.html');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errs = []; let ok = 0, mal = 0;
  const t = (n, c) => { c ? ok++ : mal++; console.log(c ? 'OK  ' : 'FALLA', n); };
  for (const w of [1200, 380]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///' + F.split(path.sep).join('/'));
    await p.click('#bFin');
    t(`${w}: 4-27d reparado muestra copia`, (await p.textContent('#bPq')).includes('se copia al bloque libre 2'));
    await p.selectOption('#bEsc', 'e8'); await p.click('#bSig'); await p.click('#bSig'); await p.click('#bSig'); await p.click('#bSig');
    t(`${w}: ej.8 cuarto paso = bloque 2 faltante`, (await p.textContent('#bPq')).includes('Bloque 2: uso = 0, libres = 0 → bloque faltante'));
    await p.click('#tabD'); await p.click('#dFin');
    t(`${w}: dirs baja reparado`, (await p.textContent('#dPq')).includes('cuenta 1 → 2'));
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    t(`${w}: sin scroll horizontal (${sw})`, sw <= w);
    await p.click('#tabC');
    t(`${w}: comparaciones visibles`, await p.isVisible('#secC'));
  }
  t('sin errores JS', errs.length === 0); if (errs.length) console.log(errs);
  await b.close(); console.log(`${ok} OK, ${mal} fallos`);
})();
