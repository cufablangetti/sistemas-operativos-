// Verifica tres_tablas.html: los tres diseños de la fig. 10-34 y el explicador de fstab
const fs = require('fs'), vm = require('vm'), path = require('path');
const F = path.resolve(__dirname, '../unidades/u04-archivos/visuales/tres_tablas.html');
const src = fs.readFileSync(F, 'utf8').match(/<script id="motor">([\s\S]*?)<\/script>/)[1];
const ctx = {module:{exports:{}}, JSON}; vm.createContext(ctx); vm.runInContext(src, ctx);
const M = ctx.module.exports;
let ok = 0, mal = 0; const t = (n, c) => { c ? ok++ : mal++; console.log(c ? 'OK  ' : 'FALLA', n); };
const J = x => JSON.stringify(x);
// tabla de resultados esperados (libro: solo la tabla intermedia funciona en todos)
const esperado = {
  shell:  {ofd:true,  fd:false, inodo:true},
  noRel:  {ofd:true,  fd:true,  inodo:false},
  forkLee:{ofd:true,  fd:false, inodo:true},
  dosOpen:{ofd:true,  fd:true,  inodo:true}
};
for(const esc in esperado) for(const dis in esperado[esc])
  t(`${esc} / ${dis} → ${esperado[esc][dis] ? 'funciona' : 'falla'}`, M.simular(esc, dis).ok === esperado[esc][dis]);
const sh = M.simular('shell', 'fd').fin;
t('diseño 2: p2 pisa a p1 → p2 p2 p2 p2 p1 p1', sh.contenido.map(x => x.c).join(' ') === 'p2 p2 p2 p2 p1 p1');
t('diseño 1: B lee EFGH', J(M.simular('noRel', 'inodo').fin.lecturas) === J(['ABCD', 'EFGH']));
t('diseño 2: hijo relee ABC', J(M.simular('forkLee', 'fd').fin.lecturas) === J(['ABC', 'ABC']));
const st = M.simular('shell', 'ofd').estados;
t('fork sube refs de la descripción a 2', st[2].ofd[1].refs === 2);
t('al terminar p2 queda solo el shell (refs 1)', st[7].ofd[1].refs === 1 && !st[7].procs.p2);
t('open devuelve el menor fd libre (3, luego 4)', M.simular('dosOpen', 'ofd').estados[2].procs.A.fds[4] !== undefined && M.simular('dosOpen', 'ofd').estados[1].res.fd === 3);
t('dos open = dos descripciones', Object.keys(M.simular('dosOpen', 'ofd').estados[2].ofd).length === 2);
t('nodo-i x abierto por 2 en noRel', M.simular('noRel', 'ofd').estados[2].inodos.x.refs === 2);
// fstab
const c = M.explicarFstab(M.FSTAB_EJ.catedra.linea);
t('fstab cátedra: 6 campos, sin avisos', c.ok && c.campos.length === 6 && c.avisos.length === 0);
t('fstab cátedra: pass 2 = después de la raíz', c.ex[5].includes('después de la raíz'));
t('fstab cátedra: dump 0', c.ex[4].includes('No'));
t('fstab raíz pass 1 ok', M.explicarFstab(M.FSTAB_EJ.raiz.linea).avisos.length === 0);
t('fstab swap: no se monta en directorio', M.explicarFstab(M.FSTAB_EJ.swap.linea).ex[1].includes('No se monta'));
t('fstab con 5 campos → error', !M.explicarFstab('UUID=1 /home ext4 defaults 0').ok);
t('fstab /home con pass 1 → aviso', M.explicarFstab('UUID=1 /home ext4 defaults 0 1').avisos.length === 1);
(async () => {
  const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errs = [];
  for (const w of [1200, 380]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///' + F.split(path.sep).join('/'));
    await p.click('#fin');
    t(`${w}: shell/ofd funciona`, (await p.textContent('#vEstado')).includes('Funciona'));
    await p.selectOption('#dis', 'fd'); await p.click('#fin');
    t(`${w}: shell/fd falla`, (await p.textContent('#vEstado')).includes('Falla'));
    await p.click('#rei'); for (let i = 0; i < 6; i++) await p.click('#sig');
    t(`${w}: aviso de que p2 pisa`, (await p.textContent('#pq')).includes('pisa'));
    await p.click('#t2'); await p.selectOption('#fsEsc', 'imagen');
    t(`${w}: fstab loop explicado`, (await p.textContent('#fsCampos')).includes('dispositivo de bloques'));
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    t(`${w}: sin scroll horizontal (${sw})`, sw <= w);
  }
  t('sin errores JS', errs.length === 0); if (errs.length) console.log(errs);
  await b.close(); console.log(`\n${ok} OK, ${mal} fallos`);
})();
