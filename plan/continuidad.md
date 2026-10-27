# Continuidad — dónde quedamos

> **Este archivo es para la IA que retoma la tutoría en otra computadora.**
> Leelo completo antes de responderle nada al estudiante.

Última actualización: **2026-10-27**

---

## 0. Instrucción obligatoria para la IA que lee esto

1. Leé primero `CLAUDE.md` (está en la raíz del proyecto). Ahí está el rol, las fases y los comandos rápidos. Este archivo **no lo reemplaza**: lo complementa diciendo en qué punto exacto quedó la clase.
2. Respondé siempre en **español rioplatense, de "vos"**.
3. **Mantené este archivo actualizado.** Cada vez que el estudiante diga *"lo sigo luego"*, *"me voy"*, *"cerramos"* o algo equivalente, **reescribí este archivo** con el estado nuevo: qué temas se cubrieron, qué preguntas se hicieron, qué respondió, qué le costó y qué sigue. El estudiante estudia alternando entre dos computadoras, así que este archivo es el único puente entre las dos sesiones.
4. Conservá la sección 0 tal cual al reescribirlo, para que la próxima IA reciba la misma instrucción.
5. **No le muestres `respuestas.md` de ninguna unidad** salvo que lo pida explícitamente.
6. **Al terminar la clase de cada unidad, antes del cuestionario, generá el PDF de repaso** `unidades/uNN-.../repaso_uNN.pdf` con todo el contenido que se vio en el chat. Es un pedido explícito del estudiante y ya está en `CLAUDE.md`. El método está en la sección 6.

---

## 1. El proyecto en dos líneas

El estudiante rinde **Sistemas Operativos** (UTN FRM, Ingeniería en Sistemas, programa 2026) en la **primera semana de diciembre de 2026**. La IA actúa como tutor: explica las unidades en el chat, prepara material para NotebookLM, arma cuestionarios difíciles y los corrige.

Material en `material_so/` (**nunca modificar los originales**). Libro principal: **Tanenbaum, Sistemas Operativos Modernos, 3ª ed.**

**Dato operativo clave:** `página PDF del Tanenbaum = página impresa + 30`. Verificado en los 11 inicios de capítulo.

---

## 2. ⭐ QUÉ HAY QUE HACER AHORA

**Está en la clase de la Unidad 2, en el tema 7 de 10.** El tema 6 quedó **cerrado y corregido**.

El tema 7 se dividió en cuatro sub-bloques y **se dio solamente el primero**:

```
7.1  sleep/wakeup y la señal de despertar perdida   ← DADO
7.2  SEMÁFOROS (down/up) + productor-consumidor     ← SIGUE ACÁ
7.3  MUTEX (semáforo binario), mutex en usuario
7.4  MONITORES, variables de condición
```

Quedaron **estas dos preguntas del 7.1 sin responder**:

> **1.** En la película del *wakeup* perdido, el consumidor se durmió **después** de que el productor ya había metido un elemento (`cuenta = 1`), o sea con comida disponible. ¿Por qué no se dio cuenta? ¿Qué fue lo que no volvió a hacer?
>
> **2.** `sleep()` y `wakeup()` son **llamadas al sistema**, no instrucciones de máquina como `TSL`. ¿Por qué tienen que ser llamadas al sistema? ¿Qué necesitan hacer que un programa en modo usuario no puede hacer por su cuenta?

**Respuestas esperadas:**

1. **No volvió a leer `cuenta`.** Ya la había leído antes de la interrupción (valía 0) y, al retomar, su siguiente instrucción era directamente `sleep()`. **Tomó la decisión de dormirse con un dato viejo.** Ahí está el hueco entre "leer la condición" y "actuar sobre la condición" — es el mismo hueco del tema 6, pero ahora entre el `if` y el `sleep`.
2. Porque **cambiar el estado de un proceso** (pasarlo de EJECUCIÓN a BLOQUEADO, sacarlo de la cola de listos, meterlo en la de bloqueados) significa **escribir en el BCP y en las colas del planificador**, que viven en memoria del kernel. Un programa en modo usuario no puede tocar estructuras del kernel ni invocar al planificador: necesita un **TRAP** y pasar a modo kernel. Conecta directo con el tema 6 de la Unidad 1 (llamadas al sistema vs llamadas de procedimiento).

Después de eso, seguir con **7.2 — semáforos**. El gancho ya está puesto en el chat y conviene aprovecharlo:

> El libro llama al bit de espera de despertar *"una alcancía para almacenar señales de despertar"*. Se le dijo: **un semáforo es exactamente esa alcancía, pero con un contador en vez de un bit.** Arrancar 7.2 desde ahí.

**Hay visualizaciones prometidas y NO entregadas** (ver sección 7). Conviene cumplirlo en 7.2.

---

## 3. Estado general del proyecto

| Fase | Estado |
|---|---|
| 0 — Inventario | Hecho → `plan/inventario.md` |
| 1 — Mapa de unidades | Hecho y aprobado → `plan/mapa_unidades.md` |
| **Unidad 1** | |
| 2 — Preparar | Hecho |
| 3 — Clase | **Terminada**: 9 temas + cierre |
| — PDF de repaso | Hecho → `unidades/u01-introduccion/repaso_u01.pdf` (18 págs.) |
| 4 — Cuestionario | Generado. **Empezado y pausado**: partes A y B respondidas, **23/28** |
| 5 — Corrección | Parcial → `unidades/u01-introduccion/correcciones/avance_cuestionario_u01.md` |
| **Unidad 2** | |
| 2 — Preparar | Hecho → `unidades/u02-procesos/` |
| 3 — Clase | **EN CURSO: 6 temas cerrados + el 7.1 del tema 7** |
| 4 y 5 | Pendientes |

**El cuestionario de la Unidad 1 quedó a medias por decisión del estudiante**, que prefirió avanzar con la Unidad 2. Le faltan las partes C (ejercicios prácticos, 34 p), D (desarrollo, 13 p), E (escenarios, 13 p) y F (integración, 12 p). Puede retomarlo diciendo "parte C", "parte D", etc., sin orden obligatorio. **No insistirle con esto**: fue su decisión.

**Decisiones ya tomadas:**

- Se estudia **en el orden del programa**, Unidad 1 a 9.
- Los temas que no están en el material se completan con desarrollo propio citando la bibliografía del programa, **siempre marcados como "complemento elaborado"**.
- **Antes de cada cuestionario va el PDF de repaso de la unidad.**
- Herramientas: **no hay** `pdftotext` ni `qpdf`. Se instaló **PyMuPDF**. Node disponible para verificar algoritmos.

---

## 4. UNIDAD 2 — dónde quedamos exactamente

La unidad se dividió en **10 temas**, organizados en tres actos:

| # | Tema | Estado |
|---|---|---|
| 1 | Qué es un proceso (creación, fork/exec, terminación, jerarquía) | Visto |
| 2 | Estados del proceso y el BCP | Visto |
| 3 | Hilos: modelo clásico, qué comparten y qué no | Visto |
| 4 | Implementación de hilos: usuario, kernel, híbrida | Visto (costó, ver sección 5) |
| 5 | Condiciones de carrera y regiones críticas | Visto |
| 6 | Exclusión mutua con espera ocupada | **Visto y cerrado** — costó muchísimo, ver sección 5 |
| **7** | **Sin espera ocupada: semáforos, mutexes, monitores** | **ACÁ QUEDAMOS** — dado el 7.1, faltan 7.2, 7.3 y 7.4 |
| **8** | **PLANIFICACIÓN** ★ | Pendiente — **el más importante de la materia** |
| 9 | Problemas clásicos (filósofos, lectores/escritores, barbero) | Pendiente |
| 10 | Multiprocesamiento | Pendiente |
| — | Cierre de la unidad | Pendiente |

### Resumen de lo cubierto, por si pregunta hacia atrás

- **Tema 1:** proceso vs programa; pseudoparalelismo vs paralelismo real; los 4 eventos de creación; **fork duplica / execve reemplaza** contra CreateProcess; el valor de retorno de fork (PID al padre, 0 al hijo, −1 si falla); **n fork seguidos = 2ⁿ procesos**; las 4 razones de terminación (2 voluntarias, 2 involuntarias); jerarquía con init en UNIX contra Windows sin jerarquía.
- **Tema 2:** los 3 estados y las **4 transiciones**, con quién provoca cada una; **no existe bloqueado → en ejecución**; tampoco listo → bloqueado; el BCP con sus tres grupos de campos; el cambio de contexto y su costo; comandos (`ps -ef`, `pstree`, `pgrep`, `kill -STOP`/`-CONT`, `/proc/PID/status`).
- **Tema 3:** proceso agrupa recursos / hilo ejecuta; **la tabla de qué es propio del hilo (contador de programa, registros, pila, estado) y qué del proceso**; por qué cada hilo necesita su pila; no hay protección entre hilos y es intencional; procesador de palabras y servidor web; las 3 formas de hacer el servidor (hilos / un hilo / máquina de estados finitos).
- **Tema 4:** hilos de usuario (tabla en el proceso, rapidísimos, **pero una llamada bloqueante bloquea todo el proceso**) contra hilos de kernel (tabla global, el kernel ejecuta otro hilo, pero conmutación costosa); híbrida **M:N**; activaciones del planificador y **upcalls**; hilos emergentes.
- **Tema 5:** las 3 cuestiones de IPC; definición de condición de carrera; **el spooler paso a paso**; región crítica y exclusión mutua; **las 4 condiciones** (textuales, se toman).
- **Tema 6:** espera ocupada y candado de giro; **deshabilitar interrupciones falla por la condición 2**; **variables de candado fallan por la 1**; **alternancia estricta falla por la 3**; **Peterson** (interesado + turno; el último que escribe turno cede) y **TSL/XCHG** (bloquean el **bus de memoria**, no "las otras CPU") funcionan; **inversión de prioridades**. Se mencionaron el Mars Pathfinder y la **herencia de prioridades** marcados como complemento fuera del libro.
- **Tema 7.1:** `sleep()`/`wakeup()` como **llamadas al sistema**; el **productor-consumidor** con búfer de N ranuras y la variable compartida `cuenta`; **la señal de despertar perdida** paso a paso (analogía de la panadería: el panadero grita cuando el vendedor todavía está en el pasillo, el grito se pierde, los dos terminan dormidos con la vitrina llena); las **dos causas** separadas (`cuenta` sin proteger + `wakeup` sin memoria); el parche del **bit de espera de despertar** ("alcancía") y por qué no escala (un bit recuerda "pasó algo", no "pasaron 5 cosas"). *(Tanenbaum 2.3.4, págs. 126–128, fig. 2-27.)*

### Lo que falta del tema 7

Ya está dado sleep/wakeup y el bit de espera. **Falta:**

- **7.2 Semáforos** de Dijkstra: `down` y `up` **atómicos**; cómo se implementan (el SO deshabilita brevemente las interrupciones; **en multiprocesador cada semáforo se protege además con TSL/XCHG**) y la aclaración del libro de que eso **no es espera ocupada**, porque la operación dura microsegundos mientras que llenar o vaciar el búfer puede durar cualquier cosa. **Productor-consumidor con tres semáforos** (`vacias = N`, `llenas = 0`, `mutex = 1`), **los dos usos distintos del semáforo** (mutex → exclusión mutua; vacias/llenas → sincronización) y **por qué invertir el orden de los `down` produce interbloqueo**. Semáforo binario. El uso de semáforos para ocultar interrupciones (un semáforo por dispositivo, `up` desde el manejador). *(2.3.5, págs. 128–130, fig. 2-28.)*
- **7.3 Mutexes:** versión simplificada sin contador; `mutex_lock`/`mutex_unlock`; **`thread_yield`** y por qué en espacio de usuario conviene ceder la CPU en vez de girar; variables de condición de Pthreads (**no tienen memoria**: si nadie espera, la señal se pierde). *(2.3.6, págs. 130–134.)*
- **7.4 Monitores:** construcción **del lenguaje**, **el compilador** garantiza que solo un proceso esté activo dentro; variables de condición con `wait`/`signal`; el problema de qué pasa después de `signal` (Hoare vs Brinch Hansen); por qué `signal` debe ser **la última instrucción**. Paso de mensajes (`send`/`receive`) y **RPC** con sus stubs; barreras. *(2.3.7 en adelante, págs. 134–139.)*

**Tema 8 — PLANIFICACIÓN. Es el tema más importante de la materia.** Conceptos: planificador y algoritmo; CPU-bound vs I/O-bound (**la ráfaga de CPU es lo que define**); cuándo planificar (5 situaciones); **apropiativa vs no apropiativa**; metas por tipo de sistema; **tiempo de retorno = fin − llegada** y **tiempo de espera = retorno − ráfaga**. Algoritmos: FCFS, SJF (óptimo solo con llegadas simultáneas), SRTF, **Round Robin y el problema del quantum**, prioridades (estáticas/dinámicas), múltiples colas, el más corto a continuación con **envejecimiento**, garantizada, **lotería**, partes equitativas, dos y tres niveles. Tiempo real y la **condición de planificabilidad** (suma de Ci/Pi ≤ 1). Política vs mecanismo. Planificación de hilos.

**Tema 9 — Problemas clásicos.** Filósofos (los 3 intentos que fallan y la solución con estados + semáforo por filósofo); lectores y escritores (**inanición de escritores**); barbero dormilón (**complemento elaborado, no está en el Tanenbaum 3ª ed.**).

**Tema 10 — Multiprocesamiento.** UMA vs NUMA; los 3 modelos de SO (uno por CPU, maestro-esclavo, **SMP**); sincronización (TSL con reintentos espaciados); planificación con **dos dimensiones** (qué proceso y en qué CPU), **afinidad de caché** y **planificación por pandillas**; concurrencia vs paralelismo.

---

## 5. Cómo dar la clase (probado con este estudiante)

- **Un tema por vez.** Al terminar, 1 o 2 preguntas y **esperar la respuesta**.
- Estructura: intuición o analogía → concepto formal con la terminología del examen → **esquema ASCII** → ejemplo concreto → referencia de página.
- **Párrafos cortos.** Prefiere el ida y vuelta al muro de texto.
- Corregir **con franqueza**: decir qué está mal y por qué. Lo acepta bien y le sirve.
- Marcarle el avance ("vas 6 de 10").
- **Pregunta mucho en el medio, y son buenas preguntas.** En la Unidad 2 preguntó qué es la pila, qué es un descriptor de archivo, qué es exactamente una transición, y objetó con razón la explicación de la implementación híbrida. **Responder esas digresiones en el momento y después retomar.**
- **También pregunta cuánto falta y cuánto va a tardar.** Responderle con el cronograma concreto (`plan/cronograma.md`), no en abstracto.
- **Cuando dice "no entendí", no repetir con otras palabras: cambiar de nivel.** Lo que funciona es tirar el formalismo, contar una película con reloj (`🕐 🕑 🕒`) y recién al final volver al código.
- **Reformula con sus propias palabras para chequear si entendió** ("entonces lo que hace el TSL es…"). **Siempre darle veredicto explícito** (✅ correcto / ⚠️ parcial / ❌) y, si hay que corregir, poner la frase mal y la frase bien una debajo de la otra. Eso le sirve mucho.

### Qué le costó en la Unidad 2 y cómo se destrabó

1. **La implementación híbrida (tema 4).** Objetó, con razón: *"si tiene un hilo kernel termina funcionando igual que los hilos de usuario, y si hay tantos HK como HU es lo mismo que hilos de kernel"*. Tenía razón: esos son los extremos (N:1 y 1:1) y la híbrida es **M:N**, el punto intermedio. Se destrabó con: hilos de usuario = cuántas tareas lógicas querés (miles); hilos de kernel = **cuánto paralelismo real podés tener (≈ cantidad de núcleos)**. Ejemplo de 1000 hilos sobre 4 núcleos.
2. **Y afinó más:** preguntó cómo se determina qué hilos se bloquean si la asignación es dinámica. **La primera explicación fue imprecisa** (decía "se bloquean 3 de 9", sugiriendo asignación fija). La corrección que funcionó: **lo que se bloquea no es un grupo de hilos, es un asiento**. Se pierde 1 hilo de kernel de N, o sea capacidad de ejecución; ningún hilo de usuario queda atrapado.
3. **Conceptos de base que hubo que explicar aparte:** qué es **la pila** (LIFO, marcos de pila, dirección de retorno + parámetros + variables locales), qué es un **descriptor de archivo** (índice en la tabla del proceso, los fd 0/1/2, la redirección del shell entre fork y exec), y qué es **una transición** (un solo cambio de estado, no un conjunto).
4. **⚠️ El tema 6 fue el más difícil hasta ahora. Llevó cinco explicaciones.** Lo que pasó y cómo se resolvió:
   - **Peterson:** no entendía cómo se sale del `while`. Pidió **todas las combinaciones enumeradas**. Lo que funcionó: la **tabla de verdad de `(turno == yo Y interesado[otro])`** con los 4 casos, mostrando que **de 4 combinaciones solo UNA hace esperar**, más los escenarios con los dos procesos a la vez, y la demostración de que **`turno` es una sola variable, así que los dos no pueden estar esperando**. Clave: lo que libera al que gira **no es un cambio de `turno`**, es que el otro ponga `interesado[otro] = false` al salir.
   - **TSL:** dijo *"no sé leer el código tampoco"*. **Hubo que enseñarle el assembler aparte**: que una etiqueta con `:` no es una instrucción, que `CMP` solo compara y anota el resultado, que `JNE` lee ese resultado y salta, que `CMP + JNE` juntos son un `if`. Y la idea con una analogía física (el robot que arranca el papel de la puerta y pega un 1 de un solo movimiento), explicando **las dos rarezas**: que TSL **escribe 1 siempre** (inofensivo si ya era 1) y que **lo que te dice si ganaste es el valor VIEJO que quedó en el registro**, no el de la puerta. Decirle que **el registro es "tu mano": privado de cada proceso.**
   - **Inversión de prioridades:** la primera analogía (jefe/empleado y un archivo) **le salió mal y lo confundió**: entendió que el empleado seguía ejecutándose adentro. **El problema era que fusionaba "tener el candado" con "tener la CPU".** Lo que funcionó: la **oficina con UNA SOLA SILLA** (la CPU) y una llave (el candado), con la regla *"para hacer cualquier cosa —incluso devolver la llave— hay que estar sentado"*; y sobre todo **la tabla de dos columnas separadas: quién tiene la CPU / quién tiene el candado**, mostrando la fila donde **L está en LISTO pero con el candado agarrado**. Esa combinación era la que no veía.
   - La frase que lo cerró: **"para liberar el candado, L tiene que EJECUTAR `candado = 0`, y para ejecutar cualquier instrucción necesita la CPU."**

### Errores que cometió y conviene vigilar

- **`fork` tres veces → contestó 4, son 8.** Pensaba que cada fork suma uno; en realidad **duplica todo lo que hay**.
- **Dijo "el servidor se cae"** cuando correspondía "se **bloquea**". Caerse = muere el proceso; bloquearse = está vivo esperando. Vale puntos en el examen.
- **Dijo que el proceso bloqueado "hace una interrupción".** No: la genera **el controlador del dispositivo**. El proceso bloqueado es pasivo, lo despiertan.
- **Atribuyó a "otro espacio de memoria" el que un hilo egoísta no afecte a otros procesos.** La razón correcta es que **el kernel sí tiene interrupciones de reloj**.
- **Dijo que la alternancia estricta viola la condición 2; viola la 3.** El truco que se le dio: *preguntate quién bloquea a quién, y si el que bloquea estaba usando la región crítica. Si no la estaba usando, es la condición 3.*
- **⚠️ Creía que en la inversión de prioridades "el de mayor prioridad nunca llega a ejecutarse".** Es al revés: **H consigue la CPU siempre, lo que no consigue es el candado**; el que queda afuera de la CPU es L. **La prioridad no falla: se respeta de más.** Vigilar que no vuelva a esta confusión.
- **⚠️ Creía que al acabarse el quantum H "pasa a bloqueado".** No: **fin de quantum → LISTO**, nunca BLOQUEADO. Y como H es el de mayor prioridad, el planificador **lo vuelve a elegir** enseguida. La distinción que hay que repetirle: *fin de quantum lo decide el planificador y va a LISTO; pasar a BLOQUEADO lo decide el proceso mismo pidiendo algo que no tiene.* **Con espera ocupada ninguna de las 4 instrucciones de TSL es una llamada al sistema, así que H no tiene con qué bloquearse.**
- **Tendió a culpar a TSL de la inversión de prioridades.** Hay que separarlo: **TSL garantiza exclusión mutua perfecta; el culpable es la espera ocupada**, que afecta igual a Peterson, XCHG y la variable candado.

### Lo que ya tiene sólido (preguntas respondidas bien)

- **TSL vs deshabilitar interrupciones en multiprocesador:** respondió correcto (TSL bloquea el bus, deshabilitar interrupciones es local a una CPU). Solo hubo que corregirle el vocabulario: no bloquea "a las otras CPU", bloquea **el acceso a la memoria**.
- **Peterson, quién entra cuando B escribe `turno` último:** respondió **A**, correcto, con la razón correcta (el último que escribe `turno` cede).
- **Reformuló TSL con sus palabras y le salió perfecto:** *"es lo mismo que la variable candado, solo que esa se hacía en dos pasos y había un hueco; TSL usa el hardware para hacer esos dos pasos en uno"*.
- **Entendió la inversión de prioridades** al final, y la reformuló bien: *"lo saca al proceso anterior pero lo saca con ese recurso, y el que entró no va a poder trabajar porque no tiene el recurso"*.
- **Parcial:** el arreglo de *"girar 1000 veces y después dormir un rato"*. Acertó el mecanismo (si H suelta la CPU, L puede liberar el candado) pero no vio los límites. Se le dieron los cuatro: no hay forma de elegir cuánto dormir sin suponer velocidades; se sacrifica la garantía de prioridad de H; sigue quemando 1000 vueltas; y **con un tercer proceso M de prioridad media vuelve a colgarse, porque dormir garantiza que H suelta la CPU pero no que L la reciba**. Cierre: **dormir por tiempo ≠ dormir por evento**, y lo segundo es el semáforo.

**Conclusión transferible: cuando se traba, el problema casi siempre es que se arrancó por el formalismo en vez de por el problema que ese formalismo resuelve. Y si un tema se da como lista de datos, hay que rehacerlo como una narración con hilo causal. Segundo aprendizaje del tema 6: antes de usar una analogía, chequear que no fusione dos variables distintas en una sola dimensión (acá, "estar adentro" = "estar activo"). Si la analogía mezcla dos cosas, separarlas en dos objetos explícitos.**

### Errores de la Unidad 1 que siguen abiertos

- Creía que la **estructura por capas da tolerancia a fallas** (falló esto en el cuestionario). En capas **todo sigue en modo kernel**.
- Creía que un **buffer más grande reduce la lectura de disco**. Reduce las **llamadas al sistema**, no los datos leídos.
- Confundió **la CMOS** (lista de dispositivos de arranque) con **el sector 0** (los 446 bytes de código).

---

## 6. Herramientas y scripts

Todos en `_trabajo/`:

| Script | Para qué |
|---|---|
| `extraer.py entrada.pdf salida.txt [ini] [fin]` | PDF → texto con marcadores de página |
| `recortar.py entrada.pdf salida.pdf ini-fin [...]` | Recorta rangos y **verifica el corte** mostrando primera y última línea |
| `render.py entrada.pdf prefijo pag1 ...` | PDF → PNG, para leer escaneados o revisar maquetación |
| `calibrar.py` | Verifica el desfase impresa/PDF del Tanenbaum |
| **`html2pdf.py entrada.html salida.pdf`** | **Genera el PDF de repaso.** CSS ya armado (cajas `.clave`, `.ojo`, `.err`, `.ej`, `<pre>` monoespaciado para los diagramas ASCII). Usa PyMuPDF Story |
| `verificar_u01.py`, `verificar_es.js`, `verificar_cuestionario_u01.py` | Ejercicios numéricos de la Unidad 1 |
| **`verificar_planificacion.js`** | **Simuladores de FCFS, SJF, SRTF y Round Robin**, con la **regla de desempate de la cátedra** (entre uno que llega y uno que sale, entra primero el que llega). Imprime Gantt, métricas y la cola de preparados en cada instante. **Indispensable para el tema 8** |

**Método para el PDF de repaso:** escribir `unidades/uNN-.../repaso_uNN.html` con el contenido completo de la clase (los mismos diagramas ASCII dentro de `<pre>`), correr `python -X utf8 -I "_trabajo\html2pdf.py" "ruta.html" "ruta.pdf"`, y revisar la maquetación renderizando un par de páginas con `render.py`.

**Texto del libro ya extraído para esta unidad:** `_trabajo/u02_tanenbaum.txt` (capítulo 2 completo + 8.1) y `_trabajo/u02_resumen.txt` (apunte de la cátedra). Los marcadores `===== [PDF pag N] =====` son del **PDF recortado**, no del original; las páginas impresas aparecen como números sueltos dentro del texto. Secciones del tema 7: **2.3.4 págs. 126–128, 2.3.5 págs. 128–130, 2.3.6 págs. 130–134, 2.3.7 págs. 134–139**.

---

## 7. Visualizaciones

Índice en `visuales/index.html`. Todas verificadas antes de entregarlas.

**Unidad 1** (en `unidades/u01-introduccion/visuales/`):

| Archivo | Qué hace |
|---|---|
| `es_programada_interrupciones_dma.html` | Las tres formas de E/S, con línea de tiempo y costo de CPU calculado |
| `arranque_y_sector_de_booteo.html` | BIOS → MBR → partición activa → cargador → SO, paso a paso |
| `interrupciones_8086.html` | Simulador de INT 10h/16h/17h/21h con pantalla de DOS y los 4 errores típicos |
| `estructuras_de_so.html` | Las cinco estructuras y qué pasa cuando falla un driver en cada una |

**Unidad 2** (en `unidades/u02-procesos/visuales/`):

| Archivo | Qué hace |
|---|---|
| `estados_de_proceso.html` | Diagrama de estados con las flechas clickeables; incluye la transición que no existe |
| `condicion_de_carrera.html` | El spooler paso a paso, con dos secuencias de conmutación a elegir |

### ⚠️ Deuda pendiente — visualizaciones prometidas y NO entregadas

Durante el tema 6 se le dijo **varias veces** "ahora te armo la visualización" y **nunca se entregó**. Conviene cumplirlo, porque además son los temas que más le costaron:

1. **Espera ocupada e inversión de prioridades** (la más prometida). Debería tener: dos columnas separadas **quién tiene la CPU / quién tiene el candado**, avance paso a paso, el fin de quantum visible (H → LISTO → lo vuelven a elegir), y un **interruptor "H gira" vs "H duerme"** para comparar el cuelgue eterno contra la solución. Opcionalmente, un panel de TSL paso a paso (variable candado en dos pasos vs TSL atómico, eligiendo dónde conmuta el planificador).
2. **Productor-consumidor con la cola de bloqueados** (prometida para el tema 7). Búfer de N ranuras, los tres semáforos, `down`/`up`, quién queda en la cola de bloqueados de cada semáforo, y un modo que reproduzca **el wakeup perdido** con sleep/wakeup para contrastar.
3. **Simulador de planificación con diagrama de Gantt para el tema 8.** FCFS, SJF, SRTF, Round Robin con quantum ajustable y prioridades, mostrando **la cola de preparados en cada instante** y los tiempos de espera y retorno. Debe respetar la **regla de desempate de la cátedra**. La lógica ya está escrita y verificada en `_trabajo/verificar_planificacion.js`: conviene portarla tal cual al HTML. **Esta es la más importante de las tres para el examen.**

Para abrirlas: `Start-Process "ruta\al\archivo.html"` desde PowerShell. Acordarse de agregar cada una a `visuales/index.html`.

---

## 8. Lo que más se toma en los exámenes

De las 29 fotos en `material_so/imagenes de examenes/` (Integrador 22/11/2024 y Final 17/12/2025):

- **Round Robin** con quantum 1 y 2: secuencia de ejecución, Gantt y **estado de la cola de preparados en un instante t**. Regla de desempate: *entre un proceso que llega y otro que sale de ejecución, se pone antes el que llega*.
- **SJN / SRTF.**
- **Traducción de direcciones virtuales a físicas** con marcos de 1 KB y 4 KB.
- **Reemplazo por segunda oportunidad** con tabla de páginas (bits R/M/Presente y Nº de marco).
- **Conteo de fallos de página** con N marcos.
- **FAT**: cadena de clusters y espacio ocupado.
- **i-nodos**: punteros directos e indirectos, tamaño máximo de archivo.
- **Banquero**: estado seguro o inseguro, justificado.
- **INT 21h** y comandos Linux (`strace`, `ps -ef`, `pgrep`, `kill -STOP`/`-CONT`, `vmstat`, `free`, `lsblk -f`, `/etc/fstab`).

Formato típico: 5-7 consignas, 60 minutos, se aprueba con 60 puntos.

---

## 9. Cronograma

Detalle completo en `plan/cronograma.md`. Rinde la **primera semana de diciembre de 2026**.

La Unidad 2 tiene asignados **5 días** (lun 26 de octubre a dom 1 de noviembre) y unas 12 horas de trabajo. Hay **8 días de colchón** en total hasta el examen.

**Estado al 27 de octubre:** van 2 días de los 5 y se cubrieron 6 temas y medio de 10. El tema 6 consumió bastante más de lo previsto porque hubo que enseñarle a leer assembler y rehacer la inversión de prioridades desde cero. **Ojo con el tema 8 (planificación): es el que más puntos vale en los exámenes prácticos y no conviene recortarlo.** Si hace falta recortar algo, que sea el tema 10 (multiprocesamiento), que casi no aparece en las fotos de exámenes.

Después de la Unidad 2 viene la **Unidad 3 — Administración de memoria** (Tanenbaum cap. 3 completo, impresas 175–254 → PDF 205–284, más 2.1.7 en impresas 93–95). Es la otra unidad pesada.
