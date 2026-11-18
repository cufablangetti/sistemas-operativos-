// Verifica el motor de ejemplos_fs.html (fig. 4-32, ejemplo 2 GB, fecha MS-DOS) y la página en Chrome
const fs = require('fs'), vm = require('vm'), path = require('path');
const F = path.resolve(__dirname, '../unidades/u04-archivos/visuales/ejemplos_fs.html');
const src = fs.readFileSync(F, 'utf8').match(/<script id="motor">([\s\S]*?)<\/script>/)[1];
const ctx = {module:{exports:{}}, Math}; vm.createContext(ctx); vm.runInContext(src, ctx);
const M = ctx.module.exports, {KB, MB, GB, TB} = M;
let ok = 0, mal = 0; const t = (n, c) => { c ? ok++ : mal++; console.log(c ? 'OK  ' : 'FALLA', n); };
// fig 4-32 completa
const fig = {12:{512:2*MB,1024:4*MB,2048:8*MB,4096:16*MB}, 16:{2048:128*MB,4096:256*MB,8192:512*MB,16384:1024*MB,32768:2048*MB}, 32:{4096:1*TB,8192:2*TB,16384:2*TB,32768:2*TB}};
for(const v of [12,16,32]) for(const b of M.TODOS_BLOQUES){
  const esp = fig[v][b] === undefined ? null : fig[v][b];
  t(`fig 4-32 FAT-${v} bloque ${b}: ${esp}`, M.particionMax(v, b) === esp);
}
t('FAT-16 en RAM: 64K entradas x 2 B = 128 KB', M.ramFAT(16, 32*KB, 2*GB).bytes === 128*KB);
t('FAT-32 2 GB/4 KB = 512K entradas, 2 MB', M.ramFAT(32, 4*KB, 2*GB).entradas === 512*1024 && M.ramFAT(32, 4*KB, 2*GB).bytes === 2*MB);
t('archivo 8 KB en bloque 32 KB -> 3/4 desperdicio', M.desperdicio(8*KB, 32*KB).frac === 0.75);
t('archivo 10 B en 32 KB ocupa 32 KB', M.desperdicio(10, 32*KB).ocupa === 32*KB);
t('archivo 8 KB en bloque 4 KB -> 0 desperdicio', M.desperdicio(8*KB, 4*KB).frac === 0);
const h = M.codHora(10, 30, 15); t('hora 10:30:15 -> 21447', h === 21447);
t('decodifica hora a 10:30:14 (+-2 s)', JSON.stringify(M.decHora(h)) === '{"h":10,"m":30,"s":14}');
const f = M.codFecha(2026, 12, 1); t('fecha 1/12/2026 -> 23937', f === 23937);
t('decodifica fecha', JSON.stringify(M.decFecha(f)) === '{"a":2026,"mes":12,"d":1}');
t('2107 entra, 2108 no', M.codFecha(2107, 12, 31) !== null && M.codFecha(2108, 1, 1) === null);
t('23:59:59 entra en 16 bits y se lee :58', M.codHora(23, 59, 59) < 65536 && M.decHora(M.codHora(23,59,59)).s === 58);
t('fmtB', M.fmtB(2*TB) === '2 TB' && M.fmtB(512) === '512 B' && M.fmtB(128*KB) === '128 KB');
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errs = [];
  for (const w of [1200, 380]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///' + F.split(path.sep).join('/'));
    t(`${w}: 4 paneles`, (await p.$$('#paneles .fs')).length === 4);
    await p.click('#t2'); await p.click('#eFig');
    t(`${w}: ejemplo 2 GB FAT-16 -> 75 %, 128 KB`, (await p.textContent('#rDesp')) === '75 %' && (await p.textContent('#rRam')) === '128 KB');
    await p.click('#eFig32');
    t(`${w}: FAT-32 4 KB -> 0 %, 2 MB`, (await p.textContent('#rDesp')) === '0 %' && (await p.textContent('#rRam')) === '2 MB');
    await p.click('#t3');
    t(`${w}: fecha codificada`, (await p.textContent('#dPaso')).includes('23937'));
    await p.click('#dLim');
    t(`${w}: limite 2107`, (await p.textContent('#dPaso')).includes('31/12/2107'));
    await p.click('#t4');
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    t(`${w}: sin scroll horizontal (${sw})`, sw <= w);
  }
  t('sin errores JS', errs.length === 0); if (errs.length) console.log(errs);
  await b.close(); console.log(`\n${ok} OK, ${mal} fallos`);
})();
