// Extrae el motor que quedo PEGADO dentro del HTML y le corre las mismas
// pruebas, para asegurar que la copia del HTML no divergio del original.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..',
  'unidades', 'u02-procesos', 'visuales', 'productor_consumidor.html'), 'utf8');

const js = html.split('<script>')[1].split('</script>')[0];
const motor = js.split('// ===================== INTERFAZ')[0];

const ctx = {};
new Function('ctx', motor + '\nctx.PROG=PROG; ctx.crearEstado=crearEstado; ctx.paso=paso;' +
             'ctx.listos=listos; ctx.interbloqueado=interbloqueado; ctx.nom=nom;')(ctx);

const { crearEstado, paso, listos, interbloqueado, nom } = ctx;

let fallos = 0;
const chequear = (c, t) => { console.log((c ? '  OK   ' : '  FALLA') + '  ' + t); if (!c) fallos++; };

console.log('\n--- motor extraido del HTML ---\n');

// 1) orden correcto, 200 corridas aleatorias
{
  let trabo = false, errores = [], prod = 0, cons = 0;
  for (let s = 0; s < 200; s++) {
    const e = crearEstado('semaforos', 3);
    let x = s + 1;
    for (let i = 0; i < 100; i++) {
      const d = listos(e);
      if (d.length === 0) { trabo = true; break; }
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      paso(e, d[x % d.length]);
    }
    errores = errores.concat(e.errores); prod += e.producidos; cons += e.consumidos;
  }
  chequear(errores.length === 0, 'orden correcto: sin violaciones de exclusion mutua ni desbordes');
  chequear(!trabo, 'orden correcto: nunca se traba');
  chequear(prod === 2000 && cons === 1400, `mismos totales que el original (${prod} / ${cons})`);
}

// 2) down invertidos -> interbloqueo
{
  const e = crearEstado('invertido', 1);
  for (let i = 0; i < 6; i++) paso(e, 'P');
  paso(e, 'P'); paso(e, 'P'); paso(e, 'P');
  chequear(e.estado.P === 'bloqueado' && e.motivo.P === 'vacias' && e.sem.mutex === 0,
           'invertido: el productor se duerme con el mutex tomado');
  paso(e, 'C'); paso(e, 'C');
  chequear(interbloqueado(e), 'invertido: interbloqueo confirmado');
}

// 3) sleep/wakeup -> senal perdida
{
  const e = crearEstado('sleepwakeup', 2);
  paso(e, 'C');
  for (let i = 0; i < 5; i++) paso(e, 'P');
  chequear(e.senalesPerdidas === 1, 'sleep/wakeup: la senal de despertar se perdio');
  paso(e, 'C');
  chequear(e.estado.C === 'bloqueado', 'sleep/wakeup: el consumidor se duerme con comida en el buffer');
  let g = 0; while (e.estado.P === 'listo' && g++ < 40) paso(e, 'P');
  chequear(interbloqueado(e) && e.buffer.length === e.N,
           'sleep/wakeup: los dos dormidos y el buffer lleno');
}

// 4) orden correcto: bloquearse SIN el mutex
{
  const e = crearEstado('semaforos', 1);
  for (let i = 0; i < 6; i++) paso(e, 'P');
  paso(e, 'P'); paso(e, 'P');
  chequear(e.estado.P === 'bloqueado' && e.sem.mutex === 1,
           'orden correcto: se bloquea esperando lugar SIN quedarse el mutex');
  for (let i = 0; i < 6; i++) paso(e, 'C');
  chequear(e.estado.P === 'listo', 'orden correcto: el consumidor lo despierta');
}

console.log('\n' + (fallos === 0
  ? '>>> El motor del HTML es equivalente al verificado: 0 fallos'
  : `>>> ATENCION: ${fallos} fallo(s)`) + '\n');
