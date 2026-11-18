// Prueba fat.html en Chrome real (playwright-core)
const path=require('path');
const {chromium}=require(path.join(process.env.APPDATA,'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const pg=await b.newPage({viewport:{width:1200,height:900}}); const errs=[];
  pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await pg.goto('file:///'+path.resolve('unidades/u04-archivos/visuales/fat.html').split(path.sep).join('/'));
  let ok=0,mal=0; const chk=(c,m)=>{c?(ok++,console.log('OK  ',m)):(mal++,console.log('FALLA',m));};
  chk(await pg.locator('.ent').count()===25,'25 entradas en la FAT del final');
  await pg.click('#sig'); chk((await pg.textContent('#porque')).includes('cluster 4'),'paso 1 lee el directorio');
  chk(await pg.locator('#codigo li.ahora').textContent().then(t=>t.includes('primer_cluster')),'línea 1 resaltada');
  await pg.fill('#tam','1900'); await pg.fill('#byte','1000'); await pg.click('#cargar');
  await pg.evaluate(()=>{while(!document.getElementById('sig').disabled) document.getElementById('sig').click();});
  const res=await pg.textContent('#res'); chk(res.includes('8 × 256 = 2048 B')&&res.includes('148 B'),'resultado 2048 B, frag 148');
  const est=await pg.textContent('#estado'); chk(est.includes('cluster 14')&&est.includes('desplazamiento 232'),'ubicación byte 1000');
  chk((await pg.textContent('#cadena')).includes('4 → 9 → 24 → 14 → 16 → 10 → 21 → 7'),'cadena completa');
  chk(await pg.locator('.ent.encad').count()===8,'8 entradas marcadas');
  await pg.selectOption('#esc','3'); await pg.click('#todo');
  chk((await pg.textContent('#estado')).includes('libre'),'escenario roto muestra error');
  await pg.selectOption('#esc','4'); await pg.click('#todo');
  chk((await pg.textContent('#estado')).includes('ciclo'),'escenario ciclo');
  await pg.click('#rei'); chk((await pg.textContent('#cont')).startsWith('Paso 0'),'reiniciar');
  await pg.setViewportSize({width:390,height:800});
  chk(await pg.evaluate(()=>document.documentElement.scrollWidth<=390),'sin scroll horizontal en móvil');
  chk(errs.length===0,'sin errores de consola '+errs.join('|'));
  await b.close(); console.log(`\n${ok} OK, ${mal} fallos`); process.exit(mal?1:0);
})();
