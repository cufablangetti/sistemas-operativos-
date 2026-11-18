// Prueba inodos.html en Chrome real
const path=require('path');
const {chromium}=require(path.join(process.env.APPDATA,'npm/node_modules/@playwright/mcp/node_modules/playwright-core'));
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const pg=await b.newPage({viewport:{width:1200,height:900}}); const errs=[];
  pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await pg.goto('file:///'+path.resolve('unidades/u04-archivos/visuales/inodos.html').split(path.sep).join('/'));
  let ok=0,mal=0; const chk=(c,m)=>{c?(ok++,console.log('OK  ',m)):(mal++,console.log('FALLA',m));};
  chk((await pg.textContent('#totMax')).includes('4.402.345.713.664'),'máximo cátedra');
  chk((await pg.textContent('#estMax')).includes('OK'),'estado ok');
  await pg.click('[data-pre=practica2k]');
  chk((await pg.textContent('#estIdx')).includes('2816 bloques de datos')&&(await pg.textContent('#estIdx')).includes('7 bloques índice'),'práctica 7 índice');
  await pg.click('[data-pre=ext2]'); await pg.click('#todo');
  chk((await pg.textContent('#cLec'))==='3'&&(await pg.textContent('#cNiv'))==='doble','ext2 byte 300000 doble, 3 lecturas');
  chk(await pg.locator('#arbol .on').count()>=5,'camino resaltado');
  await pg.click('#rei'); await pg.click('#sig'); chk((await pg.textContent('#cont')).startsWith('Paso 1'),'paso a paso');
  await pg.click('[data-pre=chico]'); chk((await pg.textContent('#estMax')).includes('Saturado'),'punteros 2B saturado');
  await pg.setViewportSize({width:390,height:800});
  chk(await pg.evaluate(()=>document.documentElement.scrollWidth<=390),'sin scroll horizontal en móvil');
  chk(errs.length===0,'sin errores '+errs.join('|'));
  await b.close(); console.log(`\n${ok} OK, ${mal} fallos`); process.exit(mal?1:0);
})();
