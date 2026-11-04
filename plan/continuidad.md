# Continuidad — dónde quedamos

> **Este archivo es para la IA que retoma la tutoría en otra computadora.**
> Leelo completo antes de responderle nada al estudiante.

Última actualización: **2026-11-03**

---

## 0. Instrucción obligatoria para la IA que lee esto

1. Leé primero `CLAUDE.md` (está en la raíz del proyecto). Ahí está el rol, las fases y los comandos rápidos. Este archivo **no lo reemplaza**: lo complementa diciendo en qué punto exacto quedó la clase.
2. Respondé siempre en **español rioplatense, de "vos"**.
3. **Mantené este archivo actualizado.** Cada vez que el estudiante diga *"lo sigo luego"*, *"me voy"*, *"cerramos"* o algo equivalente, **reescribí este archivo** con el estado nuevo: qué temas se cubrieron, qué preguntas se hicieron, qué respondió, qué le costó y qué sigue. El estudiante estudia alternando entre dos computadoras, así que este archivo es el único puente entre las dos sesiones.
4. Conservá la sección 0 tal cual al reescribirlo, para que la próxima IA reciba la misma instrucción.
5. **No le muestres `respuestas.md` de ninguna unidad** salvo que lo pida explícitamente.
6. **Al terminar la clase de cada unidad, antes del cuestionario, generá el PDF de repaso** `unidades/uNN-.../repaso_uNN.pdf` con todo el contenido que se vio en el chat. Es un pedido explícito del estudiante y ya está en `CLAUDE.md`. El método está en la sección 6.
7. **⭐ Al cerrar cada unidad, después del PDF de repaso, ampliá el mapa conceptual acumulativo** `plan/mapa_conceptual.md` (+ el PDF y el HTML interactivo). Es un pedido explícito del estudiante del **29 de octubre de 2026** y está especificado en `CLAUDE.md`, en la Fase 4. **Es acumulativo: nunca se reemplaza, se le agrega la unidad nueva y se reconectan los conceptos con los de las unidades anteriores.** Arranca al cerrar la Unidad 2.
   - **Ampliación del 1 de noviembre de 2026:** cada rama lleva **referencia doble** — la página del Tanenbaum **y la página real del `repaso_uNN.pdf`** con el título de la sección, para que el mapa funcione como índice de lo que ya leyó. El índice título → página se saca con **`_trabajo/indice_repaso.py`** (ya probado sobre `repaso_u01.pdf`: 63 títulos, 0 sin ubicar). Si se regenera un PDF de repaso, hay que volver a correr el índice y actualizar el mapa.

---

## 1. El proyecto en dos líneas

El estudiante rinde **Sistemas Operativos** (UTN FRM, Ingeniería en Sistemas, programa 2026) en la **primera semana de diciembre de 2026**. La IA actúa como tutor: explica las unidades en el chat, prepara material para NotebookLM, arma cuestionarios difíciles y los corrige.

Material en `material_so/` (**nunca modificar los originales**). Libro principal: **Tanenbaum, Sistemas Operativos Modernos, 3ª ed.**

**Dato operativo clave:** `página PDF del Tanenbaum = página impresa + 30`. Verificado en los 11 inicios de capítulo.

---

## 2. ⭐ QUÉ HAY QUE HACER AHORA

**🏁 LA UNIDAD 2 ESTÁ CERRADA EN CLASE** (3 de noviembre): los 10 temas + el cierre. Ese mismo día se generaron:

- **`unidades/u02-procesos/repaso_u02.pdf`** — 168 páginas, la clase completa tal como se dio (armada desde el historial del chat con `_trabajo/armar_repaso_u02.py`; índice de páginas en `_trabajo/indice_repaso_u02.md`).
- **El mapa conceptual acumulativo, U1 + U2** — fuente única `plan/mapa_conceptual.md`; salidas `plan/mapa_conceptual.pdf` (50 págs., con anexos de errores, cruces y trampas) y `visuales/mapa_conceptual.html` (buscador, filtros por tipo de marca, cruces clickeables). Las dudas que el estudiante anotó en **`googleia.md`** (raíz del proyecto, su chat con otro asistente) están incorporadas como ❓.

**⭐ QUÉ QUIERE AHORA EL ESTUDIANTE (pedido explícito del 3/11):** *repasar y ordenar bien las Unidades 1 y 2 con el mapa conceptual antes de empezar la Unidad 3*, "para tener todo fresco". Lo que más le importa es **el mapa**. Si pide ayuda con el repaso, conviene recorrer el mapa rama por rama, hacerle recitar las 🔢 secuencias y repasar juntos los ⚠️ errores y 📌 trampas (el HTML tiene filtros para cada uno).

**Cuestionarios: POSPUESTOS por decisión del estudiante.** El de la U2 **ya está generado** (2026-11-03: `unidades/u02-procesos/cuestionario.md`, 21 preguntas, 100 p, y `respuestas.md`, que NO se le muestra; numéricos verificados con `_trabajo/verificar_cuestionario_u02.js` y `.py`); el de la U1 está pausado (partes C–F). Quiere hacerlos **los dos juntos, más adelante**. No insistirle; cuando los pida, tomárselos y corregir con la Fase 5.

**Después del repaso viene la Unidad 3 — Administración de memoria.** Al cerrarla, **agregarle su rama al mapa** (`plan/mapa_conceptual.md`, a mano), reconectar con U1/U2 (TLB ↔ caché U1, MMU U1, protección de memoria ↔ multiprogramación U1, reemplazo óptimo ↔ SJF/retrospección U2) y regenerar con `python -X utf8 -I _trabajo/mapa_conceptual.py` + `html2pdf.py` (ver sección 6).

**Ojo:** el estudiante usa en paralelo **otro asistente de IA** y a veces pega sus respuestas (se reconocen por las marcas `[1.1]`, `[3.1]`). Se le pidió que **el cuestionario lo responda solo**. Esas respuestas suelen estar bien pero traen errores que hay que marcar (ver sección 5).

---

## 3. Estado general del proyecto

| Fase | Estado |
|---|---|
| 0 — Inventario | Hecho → `plan/inventario.md` |
| 1 — Mapa de unidades | Hecho y aprobado → `plan/mapa_unidades.md` |
| **Unidad 1** | |
| 2 — Preparar | Hecho |
| 3 — Clase | **Terminada**: 9 temas + cierre |
| — PDF de repaso | Hecho → `unidades/u01-introduccion/repaso_u01.pdf` (56 págs.: la clase completa + anexo con el resumen condensado; rehecho el 3/11 con `_trabajo/armar_repaso_u01.py`. La versión resumida vieja quedó en `_trabajo/repaso_u01_version_resumida.pdf`) |
| 4 — Cuestionario | Generado. **Empezado y pausado**: partes A y B respondidas, **23/28** |
| 5 — Corrección | Parcial → `unidades/u01-introduccion/correcciones/avance_cuestionario_u01.md` |
| **Unidad 2** | |
| 2 — Preparar | Hecho → `unidades/u02-procesos/` |
| 3 — Clase | **Terminada**: 10 temas + cierre (3/11) |
| — PDF de repaso | Hecho → `unidades/u02-procesos/repaso_u02.pdf` (168 págs.) |
| — Mapa conceptual | Hecho con U1 + U2 → `plan/mapa_conceptual.md` / `.pdf` / `visuales/mapa_conceptual.html` |
| 4 y 5 | **Pospuestos por el estudiante** (junto con el de la U1) |

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
| 7 | Sin espera ocupada: semáforos, mutexes, monitores, mensajes | **Visto y cerrado** (7.1 a 7.4b) |
| **8** | **PLANIFICACIÓN** ★ | **Visto** (8.1 a 8.6) |
| 9 | Problemas clásicos (filósofos, lectores/escritores) | **Visto** (9.1, 9.2) — barbero dormilón NO está en el libro |
| 10 | Multiprocesamiento | **Visto** (10.1 a 10.4) |
| — | Cierre de la unidad | **Dado** (8 puntos + lo que más se toma) |

### Resumen de lo cubierto, por si pregunta hacia atrás

- **Tema 1:** proceso vs programa; pseudoparalelismo vs paralelismo real; los 4 eventos de creación; **fork duplica / execve reemplaza** contra CreateProcess; el valor de retorno de fork (PID al padre, 0 al hijo, −1 si falla); **n fork seguidos = 2ⁿ procesos**; las 4 razones de terminación (2 voluntarias, 2 involuntarias); jerarquía con init en UNIX contra Windows sin jerarquía.
- **Tema 2:** los 3 estados y las **4 transiciones**, con quién provoca cada una; **no existe bloqueado → en ejecución**; tampoco listo → bloqueado; el BCP con sus tres grupos de campos; el cambio de contexto y su costo; comandos (`ps -ef`, `pstree`, `pgrep`, `kill -STOP`/`-CONT`, `/proc/PID/status`).
- **Tema 3:** proceso agrupa recursos / hilo ejecuta; **la tabla de qué es propio del hilo (contador de programa, registros, pila, estado) y qué del proceso**; por qué cada hilo necesita su pila; no hay protección entre hilos y es intencional; procesador de palabras y servidor web; las 3 formas de hacer el servidor (hilos / un hilo / máquina de estados finitos).
- **Tema 4:** hilos de usuario (tabla en el proceso, rapidísimos, **pero una llamada bloqueante bloquea todo el proceso**) contra hilos de kernel (tabla global, el kernel ejecuta otro hilo, pero conmutación costosa); híbrida **M:N**; activaciones del planificador y **upcalls**; hilos emergentes.
- **Tema 5:** las 3 cuestiones de IPC; definición de condición de carrera; **el spooler paso a paso**; región crítica y exclusión mutua; **las 4 condiciones** (textuales, se toman).
- **Tema 6:** espera ocupada y candado de giro; **deshabilitar interrupciones falla por la condición 2**; **variables de candado fallan por la 1**; **alternancia estricta falla por la 3**; **Peterson** (interesado + turno; el último que escribe turno cede) y **TSL/XCHG** (bloquean el **bus de memoria**, no "las otras CPU") funcionan; **inversión de prioridades**. Se mencionaron el Mars Pathfinder y la **herencia de prioridades** marcados como complemento fuera del libro.
- **Tema 7.1:** `sleep()`/`wakeup()` como **llamadas al sistema**; el **productor-consumidor** con búfer de N ranuras y la variable compartida `cuenta`; **la señal de despertar perdida** paso a paso (analogía de la panadería: el panadero grita cuando el vendedor todavía está en el pasillo, el grito se pierde, los dos terminan dormidos con la vitrina llena); las **dos causas** separadas (`cuenta` sin proteger + `wakeup` sin memoria); el parche del **bit de espera de despertar** ("alcancía") y por qué no escala (un bit recuerda "pasó algo", no "pasaron 5 cosas"). *(Tanenbaum 2.3.4, págs. 126–128, fig. 2-27.)*
- **Tema 7.2:** **semáforos** de Dijkstra (1965) como "la alcancía con contador"; analogía de la **lata de fichas**; `down` = pedir una ficha o bloquearse, `up` = dejar una ficha y, si hay alguien en la cola, despertarlo para que **complete su `down`**; la frase que cerró el tema: **un `up` sin destinatario SE GUARDA, un `wakeup` sin destinatario SE PIERDE**; atomicidad (llamada al sistema con interrupciones deshabilitadas brevemente + **TSL/XCHG en multiprocesador**) y por qué eso **no es espera ocupada** (la operación dura microsegundos, la región crítica dura lo que dure); **productor-consumidor con tres semáforos** (`mutex = 1`, `vacias = N`, `llenas = 0`), el invariante **`vacias + llenas = N`**, **los dos usos distintos** (mutex → exclusión mutua; vacias/llenas → sincronización) y el **interbloqueo por invertir el orden de los `down`** (el productor se duerme esperando lugar **con el mutex puesto**). Regla: **primero el `down` de sincronización, después el de exclusión mutua.** Semáforo binario. Se le dio además la lectura conceptual de `down`/`up` (**`down` = pido una unidad del recurso y puede bloquear; `up` = entrego una unidad y nunca bloquea**) y el esquema cruzado: cada proceso consume de un semáforo y repone en el otro. *(Tanenbaum 2.3.5, págs. 128–130, fig. 2-28.)*
- **Tema 7.3:** **mutex** como semáforo sin contador, dos estados (0 abierto / distinto de 0 cerrado); `mutex_lock` y `mutex_unlock`; **la comparación línea por línea con `enter_region`**, idéntica hasta la tercera instrucción, donde cambia el `JNE` por **`CALL thread_yield`** — y con ese solo cambio se cae la inversión de prioridades; **`thread_yield` es el planificador de hilos en espacio de usuario, sin TRAP ni modo kernel**, de ahí que el caso sin conflicto sean tres instrucciones de máquina y que los mutexes de usuario sean baratos; `mutex_trylock` (no bloquea, devuelve código de falla); las llamadas de **Pthreads** (`init`, `destroy`, `lock`, `trylock`, `unlock`) y las **variables de condición** (`cond_wait`, `cond_signal`, `cond_broadcast`), con el remate de que **no tienen memoria** —la señal sin oyente se pierde, igual que el `wakeup`— y que por eso van siempre con un mutex, y que `cond_wait` **suelta el mutex atómicamente al dormirse**. Mutex vs semáforo binario; **marcado como complemento elaborado** (no está en el Tanenbaum) que el mutex real tiene **dueño** —solo lo abre quien lo cerró— y que eso es lo que habilita la herencia de prioridades. *(Tanenbaum 2.3.6, págs. 130–134.)*
- **Tema 7.4a — Monitores:** construcción **del lenguaje** (Pidgin Pascal en el libro, porque C no los tiene); **el compilador** garantiza que *"sólo puede haber un proceso activo en un monitor en cualquier instante"*; la tabla de niveles (TSL→hardware, down/up→SO, monitor→compilador); variables de condición con `wait`/`signal`, y que **`wait` te saca del monitor** dejando entrar a otro; **Hoare** (corre el despertado) vs **Brinch Hansen** (el que señaliza sale ya → `signal` es la última instrucción) y la tercera solución; **las variables de condición no son contadores → la señal sin oyente se pierde → `wait` debe ir antes de `signal`**; por qué **no es sleep/wakeup otra vez** (cita clave: la exclusión mutua automática garantiza que el `wait` se completa porque *"al consumidor ni siquiera se le va a permitir entrar al monitor"*) — se le dio como **tercera forma de lograr atomicidad**: hardware / kernel / **el compilador impide que otro entre**; el código de la fig. 2-34 con traza de 8 pasos; por qué el `signal` está condicionado a `if cuenta = 1`; **Java `synchronized`** con `wait`/`notify`. *(Tanenbaum 2.3.7, págs. 136–141.)*
- **Tema 7.4b — Paso de mensajes y barreras:** `send`/`receive` son **llamadas al sistema** (como los semáforos, **no** construcciones del lenguaje como los monitores) y **no requieren memoria compartida**: es el único mecanismo que sirve en máquinas distribuidas; los problemas de diseño (mensajes perdidos → **acuse de recibo**; acuse perdido → duplicados → **números de secuencia**; nomenclatura; autenticación; y el **rendimiento**, porque *"copiar mensajes es siempre más lento que una operación con un semáforo o entrar a un monitor"*); **productor-consumidor con N mensajes vacíos iniciales** (el total de mensajes es constante = N; el vacío es la ficha de `vacias` y el lleno la de `llenas`); direccionamiento a procesos vs **buzones**, y el extremo sin búfer = **rendezvous**; **MPI**. **Barreras**: para **grupos** de procesos en fases, el que llega se bloquea hasta que llegue el último (fig. 2-37). Se cerró con **la tabla comparativa de las 11 primitivas** y las tres preguntas que la resumen: *¿gira o se bloquea? ¿la señal se guarda o se pierde? ¿necesita memoria compartida?* *(Tanenbaum 2.3.8 y 2.3.9, págs. 140–146.)*
- **Tema 8.1 — Conceptos y métricas de planificación:** qué es el planificador y que **solo elige entre los LISTOS**; por qué importa poco en una PC y mucho en un servidor; **el costo del cambio de contexto** (7 pasos, incluida la invalidación de la caché) como justificación anticipada del quantum; **ráfagas de CPU y E/S**, CPU-bound vs I/O-bound y la trampa: **el factor clave es la longitud de la ráfaga de CPU, no la de E/S**; que copiar a la RAM de video **cuenta como cálculo**; que con CPU más rápidas los procesos tienden a ser más limitados a E/S; **las 4 situaciones en que hay que planificar** + la interrupción de reloj; **apropiativa vs no apropiativa** (sin reloj, la no apropiativa es la única opción; fin de quantum → LISTO); los **3 entornos** y las **metas de la fig. 2-39** (incluida **proporcionalidad**); y **las métricas**: **retorno = fin − llegada**, **espera = retorno − ráfaga**, **respuesta = primer arranque − llegada**. Ejemplo resuelto de FCFS con P1(0,8) P2(1,4) P3(2,2) → retorno promedio 10,33 y espera promedio 5,67, **verificado con script**. Se le marcó que **`retorno − ráfaga` sirve siempre** mientras que `inicio − llegada` solo sin apropiación. *(Tanenbaum 2.4.1, págs. 145–152, figs. 2-38 y 2-39. Apunte de la cátedra: mismas metas y métricas; la cátedra llama **SRTN** al SRTF y los parciales dicen **SJN**.)*

- **Tema 8.2–8.6 — Algoritmos de planificación:** FCFS, SJF, SRTF (2.4.2, págs. 152–156); **Round Robin** y el quantum (2.4.3, págs. 156–157); prioridades, múltiples colas, el más corto a continuación con **envejecimiento** (promedio exponencial), garantizada, **lotería**, partes equitativas (2.4.4, págs. 157–161); tiempo real y **Σ Cᵢ/Pᵢ ≤ 1**, política vs mecanismo (2.4.5, págs. 161–162); planificación de hilos (2.4.6, págs. 162–163). **Se entregó el simulador de Gantt.**
- **Tema 9 — Problemas clásicos:** filósofos (2.5.1, págs. 163–166): los intentos que fallan y Dijkstra con `estado[]` + semáforo por filósofo, máximo 2 comiendo; lectores y escritores (2.5.2, págs. 166–168): inanición del escritor ⟺ **I ≤ D**, y la regla *"dormirse con un candado tomado es interbloqueo SOLO SI el que te despierta necesita ese candado"*. **Se entregó el simulador de filósofos.**
- **Tema 10 — Multiprocesadores (cap. 8.1, págs. 526–548):** 10.1 hardware (UMA de bus único 16–32 CPUs, caché + coherencia: copia limpia **se descarta**, barras cruzadas, NUMA con sus 3 características, NC vs CC-NUMA, directorios); 10.2 los 3 modelos de SO (cada CPU su SO con los 4 problemas — el 4º, la caché de búfer, es **corrupción**; maestro-esclavo con `n × fracción ≤ 1`; SMP y la granularidad de los candados); 10.3 sincronización (TSL exige **bloquear el bus**, por eso Peterson; thrashing de caché; lectura pura antes de TSL, backoff exponencial, candado privado de Mellor-Crummey y Scott; girar vs conmutar, la lista de listos obliga a girar, Karlin 1991); 10.4 planificación (**dos dimensiones**; tiempo compartido fig. 8-12 y sus 2 desventajas; planificación inteligente con bandera; afinidad y **dos niveles con sus 3 beneficios**; espacio compartido fig. 8-13, FCFS difícil de vencer; **pandillas** con sus 3 partes, figs. 8-14 y 8-15).

**Números verificados de la unidad (usar en el repaso y el cuestionario, no recalcular):**
- Juego P1(0,8) P2(1,4) P3(2,2): FCFS ret 10,33 / esp 5,67. RR q=1 → ret 9,33, resp 0,33; **q=2 → `P1[0-2] P2[2-4] P3[4-6] P1[6-8] P2[8-10] P1[10-14]`, ret 9,00, esp 4,33, resp 1,00**; q=3 → ret 10,33, resp 2,00; q=4 → ret 9,67, resp 3,00; q=8 = FCFS.
- Prioridades L(0,6,p3) M(2,4,p2) H(4,3,p1): no apropiativa `L[0-6] H[6-9] M[9-13]` ret 7,33 esp 3,00; apropiativa `L[0-2] M[2-4] H[4-7] M[7-9] L[9-13]` ret 7,67 esp 3,33 resp 0.
- Envejecimiento a=½ desde 10 con ráfagas 6,4,14,6 → 8, 6, 10, 8. Garantizada A10 B30 C20 D25 E15 de 20 c/u → razones 0,50 1,50 1,00 1,25 0,75 → corre A. Lotería A5 B15 C30 → 10/30/60 %; tras C→A 20 boletos → 50/30/20 %.
- Tiempo real 50/100 + 30/200 + 100/500 = 0,85 (15 % libre). Maestro-esclavo 8 CPUs al 15 % → 1,20 saturado; máximo n = 6. Girar vs conmutar con 3000 µs: 400 µs → girar.

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
- **⚠️ Dijo que en el interbloqueo los dos procesos quedan "ocupando tiempo de CPU".** No: **bloqueado = fuera de la cola de listos**, el planificador no lo elige y no consume ni un ciclo. La distinción que hay que repetirle: **espera ocupada = no avanza Y gasta CPU; interbloqueo = no avanza pero NO gasta CPU.** Si escribe "interbloqueo consumiendo CPU" en el examen, se lo marcan.
- **⚠️ Piensa `up` y `down` como "sumar" y "restar", no como "entregar" y "pedir".** Por eso, cuando se le preguntó dónde estaba el error del compañero que quería `up(&vacias)`, acertó el mecanismo (el productor hace `down(vacias)` y `up(llenas)`) pero no pudo nombrar el concepto. Lo que hay que dejarle fijo: **`down` = pido una unidad del recurso y PUEDE bloquear; `up` = entrego una unidad y NUNCA bloquea.** Y el argumento mecánico, que es el más fuerte: **no hay forma de esperar con un `up`**, así que un `up` jamás puede servir para pedir lugar. Frase a repetir: **`vacias` y `llenas` cuentan recursos, no eventos.**

- **🔴 Invirtió la asimetría `up` / `signal`, que es la clave del tema 7.** Se le preguntó si, con semáforos, haría falta condicionar el `up` como la fig. 2-34 condiciona el `signal`, y dijo que sí. **Es exactamente al revés:** el `signal` del monitor **se pierde** si no hay oyente, así que conviene condicionarlo; el `up` del semáforo **se guarda**, así que va **siempre, incondicional** — condicionarlo rompe el invariante `vacias + llenas = N`. La frase que hay que repetirle: **un `up` sin destinatario se guarda, un `signal` sin destinatario se pierde.** Después lo reformuló bien solo (*"el monitor se fija si hay alguien dormido, el semáforo depende de los números"*), pero **vigilar que no vuelva a invertirlo**.
- **⚠️ Creyó que una señal perdida es, por sí misma, un error.** Al preguntarle qué se rompe si se saca el `if cuenta = 1` del `signal`, contestó que se rompe algo. **No se rompe nada**: la señal se pierde pero nadie la necesitaba. La distinción: **señal perdida con alguien esperándola = desastre (el wakeup perdido); señal perdida sin nadie esperando = solo trabajo al vacío.** El `if` es una **optimización, no una condición de correctitud**.
- **⚠️ Creyó que el paso de mensajes exige procesos separados** y que no se puede usar entre hilos ni dentro de una sola máquina. Lee la tabla al revés: **`send`/`receive` NO NECESITA memoria compartida, pero funciona igual si la hay** — es el mecanismo **más general** de todos. La razón para no usarlo con memoria compartida no es que no se pueda, es el **costo de copiar** (*"copiar mensajes es siempre más lento que una operación con un semáforo o entrar a un monitor"*).
- **Vocabulario:** dijo *"las llamadas perdidas acumuladas"* hablando del contador del semáforo. Si se acumulan **no están perdidas**: están **guardadas**. Es justo lo contrario y conviene corregírselo cada vez.
- **⚠️ Patrón general de los temas 8–10: fusiona o invierte dos cosas parecidas.** Casos ya corregidos: retorno/espera, respuesta/espera, **boletos/porcentajes** (leyó los boletos como porcentajes sin dividir por el total), los **dos "envejecimientos"** homónimos (subir prioridad vs estimar la ráfaga), la copia de caché que "se actualiza" (**se descarta**). Lo que le sirve: **tabla de dos columnas** que separe el par.
- **Convención de prioridades:** la cátedra usa **1 = más prioritario**; la fórmula `1/f` del libro va al revés. Regla que se le dio: **declarar siempre la convención en la respuesta**.
- **SMP con un solo mutex global NO resuelve el cuello de botella** del maestro-esclavo (lo creyó en 10.2). Lo que lo resuelve es la **granularidad** de los candados.
- **🔴 Volvió a escribir que al terminar el quantum el hilo "se va a dormir"** (respuesta 2a del 10.4, 3/11). Es el mismo error del tema 6: **fin de quantum → LISTO**. En esa respuesta también atribuyó el 100 % de uso de CPU a "cambios de contexto inútiles": en la fig. 8-14 las CPUs hacen **trabajo útil de otros hilos**; el problema es la **latencia**, no la utilización.

### Lo que ya tiene sólido (preguntas respondidas bien)

- **TSL vs deshabilitar interrupciones en multiprocesador:** respondió correcto (TSL bloquea el bus, deshabilitar interrupciones es local a una CPU). Solo hubo que corregirle el vocabulario: no bloquea "a las otras CPU", bloquea **el acceso a la memoria**.
- **Peterson, quién entra cuando B escribe `turno` último:** respondió **A**, correcto, con la razón correcta (el último que escribe `turno` cede).
- **Reformuló TSL con sus palabras y le salió perfecto:** *"es lo mismo que la variable candado, solo que esa se hacía en dos pasos y había un hueco; TSL usa el hardware para hacer esos dos pasos en uno"*.
- **Entendió la inversión de prioridades** al final, y la reformuló bien: *"lo saca al proceso anterior pero lo saca con ese recurso, y el que entró no va a poder trabajar porque no tiene el recurso"*.
- **Parcial:** el arreglo de *"girar 1000 veces y después dormir un rato"*. Acertó el mecanismo (si H suelta la CPU, L puede liberar el candado) pero no vio los límites. Se le dieron los cuatro: no hay forma de elegir cuánto dormir sin suponer velocidades; se sacrifica la garantía de prioridad de H; sigue quemando 1000 vueltas; y **con un tercer proceso M de prioridad media vuelve a colgarse, porque dormir garantiza que H suelta la CPU pero no que L la reciba**. Cierre: **dormir por tiempo ≠ dormir por evento**, y lo segundo es el semáforo.
- **El interbloqueo por invertir los `down`: lo explicó entero y solo.** Dijo que el productor se duerme llevándose el mutex, que el consumidor es el único que puede liberar una ranura y que para eso necesita el mutex que el otro tiene. Razonamiento completo. **Solo hubo que sacarle "ocupando tiempo de CPU"** (ver errores). Se le dio la regla general: *nunca te quedes inactivo —ni girando ni dormido— teniendo tomado un recurso que otro necesita para desbloquearte*, y notó que es la misma de la inversión de prioridades.
- **El monitor, bien entendido de entrada.** Captó que *"el monitor es automático"* y que la diferencia con el semáforo pasa por el contador. Al final reformuló la asimetría con sus palabras y le salió exacta: **"el monitor se fija en el caso que alguien esté dormido; en semáforo depende de los números existentes en el búfer"**. Ésa es la frase que hay que devolverle si vuelve a dudar.
- **La imagen de los N mensajes vacíos: "caja de transporte".** Muy buena intuición, se la acepté tal cual. Lo que le faltó fue la **función**: esos vacíos son **fichas de `vacias`**, o sea **control de flujo** y **memoria acotada** (el total de mensajes es constante = N). Si no, el productor podría enviar 10.000 mensajes y el SO tendría que almacenarlos todos.

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
| **`indice_repaso.py repaso.html repaso.pdf [salida.md]`** | **Saca el índice título → página del PDF de repaso ya generado.** Imprescindible para las referencias dobles del mapa conceptual. Probado sobre `repaso_u01.pdf`: 63 títulos, 18 páginas, 0 sin ubicar |
| `verificar_u01.py`, `verificar_es.js`, `verificar_cuestionario_u01.py` | Ejercicios numéricos de la Unidad 1 |
| `verificar_cuestionario_u02.js`, `verificar_cuestionario_u02.py` | Ejercicios numéricos del cuestionario de la Unidad 2 |
| **`verificar_planificacion.js`** | **Simuladores de FCFS, SJF, SRTF y Round Robin**, con la **regla de desempate de la cátedra** (entre uno que llega y uno que sale, entra primero el que llega). Imprime Gantt, métricas y la cola de preparados en cada instante. **Indispensable para el tema 8** |

| **`armar_repaso_u02.py clase.md salida.html`** | Arma el HTML del repaso desde los mensajes de la clase extraídos del historial del chat (`_trabajo/u02_clase_chat.md`): saca la logística, ordena los temas en h2 y convierte el Markdown. Sirve de modelo para las próximas unidades |
| **`mapa_conceptual.py`** | **Genera el mapa conceptual** desde `plan/mapa_conceptual.md`: escribe `visuales/mapa_conceptual.html` (usa `_trabajo/mapa_conceptual_plantilla.html`) y `_trabajo/mapa_conceptual_imprimir.html`, que se pasa a PDF con `html2pdf.py … plan/mapa_conceptual.pdf`. Falla si hay un `[[id]]` que no existe o un id repetido |
| **`verificar_mapa_conceptual.js`** | Prueba la página interactiva en Chrome sin ventana (playwright-core del MCP global): búsqueda, filtros, cruces, modo oscuro y ancho de 375 px. 13 pruebas |

**Sintaxis del mapa** (`plan/mapa_conceptual.md`): `#` unidad, `##` tema, `###` concepto, cada uno con `{#id}`; líneas `>` debajo del título = referencias (📖 libro, 📄 repaso); listas con sangria de 2 espacios; `1.` = paso de una secuencia; `[[id]]` = enlace a otra rama. Marcas al principio del ítem: 🔢 ⚠️ 📌 ⚖️ 🔗 🧠 ❓. **Páginas del Tanenbaum verificadas contra el texto** (`impresa = pág. del recorte u02 + 82`): 2.4.3 interactivos 154–160 (RR 154, prioridad 155, múltiples colas 156, SPN y garantizada 158, lotería 159, partes equitativas 160), 2.4.4 tiempo real 160–161, 2.4.5 política 161–162, 2.4.6 hilos 162–163, 2.5.1 filósofos 164–167, 2.5.2 lectores 167–168. **Algunas referencias que se dieron en la clase del tema 8 estaban corridas 1 o 2 páginas; las del mapa son las buenas.**

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
| **`productor_consumidor.html`** | **Entregada el 28/10.** Productor-consumidor con tres modos: semáforos en el orden correcto, `down` invertidos (interbloqueo) y sleep/wakeup (señal perdida). El usuario elige a quién le da la CPU en cada paso. Muestra el búfer, las tres latas de fichas, la cola de bloqueados de cada semáforo, el PC de cada proceso y, en modo sleep/wakeup, **el valor viejo de `cuenta` que cada proceso tiene guardado**. Motor verificado con `_trabajo/verificar_semaforos.js` (4 pruebas) y la copia pegada en el HTML con `_trabajo/verificar_html_semaforos.js` |

| **`planificacion_cpu.html`** ★ | Simulador de Gantt: FCFS, SJF, SRTF, RR con quantum ajustable, prioridades; cola de preparados en cada instante; desempate de la cátedra; trae los ejercicios del parcial y del final. Verificado con `_trabajo/verificar_motor_planificacion.js` y `verificar_html_planificacion.js` |
| **`filosofos_comelones.html`** | Los cuatro esquemas (todos el izquierdo, zurdo, mutex de mesa, Dijkstra). Verificado por BFS exhaustivo con `_trabajo/verificar_motor_filosofos.js` y `verificar_html_filosofos.js` |

**Repaso** (en `visuales/`): **`mapa_conceptual.html`** — el mapa conceptual acumulativo, primera entrada de `visuales/index.html`. **`mapa_grafico.html`** (pedido del 3/11: "como un mapa conceptual de papel") — grafo de 103 cajas con nota técnica, flechas rotuladas y 20 cruces punteados; cada caja abre `mapa_conceptual.html#id`. Los datos (`NODOS`, `CRUCES`) están escritos a mano dentro del HTML: **al agregar una unidad, sumarle sus cajas y cruces ahí también**, con destinos que existan en `plan/mapa_conceptual.md`. Se prueba con `node _trabajo/verificar_mapa_grafico.js` (sin superposiciones, destinos válidos, clic → rama correcta). **El estudiante pidió no modificar `mapa_conceptual.html`** para esto: el gráfico va en un archivo aparte.

### ⚠️ Deuda pendiente — visualizaciones prometidas y NO entregadas

**Cumplir lo que se promete en el mismo turno, o no prometerlo.** Falta:

1. **Espera ocupada e inversión de prioridades.** Debería tener: dos columnas separadas **quién tiene la CPU / quién tiene el candado**, avance paso a paso, el fin de quantum visible (H → LISTO → lo vuelven a elegir), y un **interruptor "H gira" vs "H duerme"**. Opcional, no bloquea el cierre de la unidad.

**Método que funcionó para la de productor-consumidor y conviene repetir:** escribir primero el motor en un `.js` de `_trabajo/` con pruebas que afirmen las propiedades (nunca dos en la región crítica, el interbloqueo aparece, etc.), correrlo, pegarlo en el HTML, y después **extraer el `<script>` del HTML y correrle las mismas pruebas** para confirmar que la copia no divergió.

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

**Estado al 3 de noviembre:** la clase de la Unidad 2 terminó con **2 días de atraso** sobre el plan (estaba prevista hasta el 1/11). PDF de repaso, mapa conceptual y cuestionario de la U2 ya están hechos (el cuestionario, sin tomar); después, la Unidad 3. El colchón restante es de unos 6 días.

**Historia — estado al 29 de octubre:** van 4 días de los 5 y se cubrieron **8 temas de 10 más el bloque 8.1**. El ritmo se recuperó fuerte: el 28 se dieron 7.2 y 7.3 con la visualización de productor-consumidor, y el 29 se cerró el tema 7 completo (monitores, paso de mensajes y barreras) y se arrancó el 8. **Queda el tema 8 (que es largo y es el que más vale), el 9 y el 10.** Se va a pasar un día o dos del plan, y está bien: el colchón de 8 días existe para esto. Lo que NO hay que recortar es el tema 8. El tema 6 consumió bastante más de lo previsto porque hubo que enseñarle a leer assembler y rehacer la inversión de prioridades desde cero. **Ojo con el tema 8 (planificación): es el que más puntos vale en los exámenes prácticos y no conviene recortarlo.** Si hace falta recortar algo, que sea el tema 10 (multiprocesamiento), que casi no aparece en las fotos de exámenes.

Después de la Unidad 2 viene la **Unidad 3 — Administración de memoria** (Tanenbaum cap. 3 completo, impresas 175–254 → PDF 205–284, más 2.1.7 en impresas 93–95). Es la otra unidad pesada.
