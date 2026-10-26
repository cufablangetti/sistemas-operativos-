# Continuidad — dónde quedamos

> **Este archivo es para la IA que retoma la tutoría en otra computadora.**
> Leelo completo antes de responderle nada al estudiante.

Última actualización: **2026-10-26**

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

**Está en el medio de la clase de la Unidad 2, en el tema 6 de 10.**

Se explicó el **tema 6 completo** (exclusión mutua con espera ocupada) y quedaron **estas dos preguntas sin responder**:

> **1.** ¿Por qué TSL funciona en un multiprocesador y deshabilitar interrupciones no? Respondé diciendo **qué bloquea cada uno**.
>
> **2.** En Peterson, los dos procesos quieren entrar a la vez. A escribe `turno = A` y después B escribe `turno = B`. ¿Cuál entra? ¿Por qué resulta contraintuitivo?

**Respuestas esperadas:**

1. **TSL bloquea el BUS DE MEMORIA**: mientras se ejecuta, ningún otro procesador puede acceder a esa variable. **Deshabilitar interrupciones solo afecta a la CPU que ejecutó la instrucción**; las demás CPU siguen corriendo y pueden entrar igual a la región crítica. Por eso deshabilitar interrupciones viola la condición 2 (suposiciones sobre la cantidad de CPU) y TSL no.
2. **Entra A.** Contraintuitivo porque **el último que escribe `turno` es el que cede el paso**: B escribió último, así que la condición de espera (`turno == yo && interesado[otro]`) se cumple para B y lo deja girando, mientras que para A no se cumple y entra. Uno esperaría que "anotarse último" fuera una ventaja, y es al revés.

Después seguir con el **tema 7**.

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
| 3 — Clase | **EN CURSO: 6 de 10 temas** |
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
| **6** | **Exclusión mutua con espera ocupada** | **ACÁ QUEDAMOS** — explicado, faltan las 2 preguntas |
| 7 | Sin espera ocupada: semáforos, mutexes, monitores | Pendiente |
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
- **Tema 6:** espera ocupada y candado de giro; **deshabilitar interrupciones falla por la condición 2**; **variables de candado fallan por la 1**; **alternancia estricta falla por la 3**; **Peterson** (interesado + turno; el último que escribe turno cede) y **TSL/XCHG** (bloquean el bus de memoria) funcionan; **inversión de prioridades** con el caso del Mars Pathfinder.

### Lo que falta de la unidad

**Tema 7 — Sin espera ocupada.** sleep/wakeup y **la condición de carrera fatal de la señal perdida**; el bit de espera de despertar; **semáforos** de Dijkstra (down/up atómicos); **productor-consumidor con tres semáforos** (vacias=N, llenas=0, mutex=1) y **por qué invertir el orden de los down produce interbloqueo**; **mutexes** y `thread_yield`; variables de condición de Pthreads (**no tienen memoria**, la señal se pierde); **monitores** (construcción del lenguaje, **el compilador** garantiza la exclusión mutua) y el problema de qué pasa después de signal (Hoare vs Brinch Hansen); paso de mensajes y **RPC** con sus stubs; barreras.

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

### Qué le costó en la Unidad 2 y cómo se destrabó

1. **La implementación híbrida (tema 4).** Objetó, con razón: *"si tiene un hilo kernel termina funcionando igual que los hilos de usuario, y si hay tantos HK como HU es lo mismo que hilos de kernel"*. Tenía razón: esos son los extremos (N:1 y 1:1) y la híbrida es **M:N**, el punto intermedio. Se destrabó con: hilos de usuario = cuántas tareas lógicas querés (miles); hilos de kernel = **cuánto paralelismo real podés tener (≈ cantidad de núcleos)**. Ejemplo de 1000 hilos sobre 4 núcleos.
2. **Y afinó más:** preguntó cómo se determina qué hilos se bloquean si la asignación es dinámica. **La primera explicación fue imprecisa** (decía "se bloquean 3 de 9", sugiriendo asignación fija). La corrección que funcionó: **lo que se bloquea no es un grupo de hilos, es un asiento**. Se pierde 1 hilo de kernel de N, o sea capacidad de ejecución; ningún hilo de usuario queda atrapado. Con N=1 eso es catastrófico, con N=4 es el 25 % de la capacidad. **Ese es el motivo real por el que la híbrida funciona: no evita el bloqueo, diluye su impacto.**
3. **Conceptos de base que hubo que explicar aparte:** qué es **la pila** (LIFO, marcos de pila, dirección de retorno + parámetros + variables locales, dónde vive en el mapa de memoria), qué es un **descriptor de archivo** (índice en la tabla del proceso, los fd 0/1/2, y cómo el shell implementa la redirección entre fork y exec), y qué es **una transición** (un solo cambio de estado, no un conjunto; 4 de los 6 pares posibles).

### Errores que cometió y conviene vigilar

- **`fork` tres veces → contestó 4, son 8.** Pensaba que cada fork suma uno; en realidad **duplica todo lo que hay**.
- **Dijo "el servidor se cae"** cuando correspondía "se **bloquea**". Caerse = muere el proceso; bloquearse = está vivo esperando. Vale puntos en el examen.
- **Dijo que el proceso bloqueado "hace una interrupción".** No: la genera **el controlador del dispositivo**. El proceso bloqueado es pasivo, lo despiertan.
- **Atribuyó a "otro espacio de memoria" el que un hilo egoísta no afecte a otros procesos.** La razón correcta es que **el kernel sí tiene interrupciones de reloj** y le quita la CPU al proceso por apropiación.
- **Dijo que la alternancia estricta viola la condición 2; viola la 3.** El truco que se le dio: *preguntate quién bloquea a quién, y si el que bloquea estaba usando la región crítica. Si no la estaba usando, es la condición 3.*

### Errores de la Unidad 1 que siguen abiertos

- Creía que la **estructura por capas da tolerancia a fallas** (falló esto en el cuestionario). En capas **todo sigue en modo kernel**.
- Creía que un **buffer más grande reduce la lectura de disco**. Reduce las **llamadas al sistema**, no los datos leídos.
- Confundió **la CMOS** (lista de dispositivos de arranque) con **el sector 0** (los 446 bytes de código).

**Conclusión transferible: cuando se traba, el problema casi siempre es que se arrancó por el formalismo en vez de por el problema que ese formalismo resuelve. Y si un tema se da como lista de datos, hay que rehacerlo como una narración con hilo causal.**

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

---

## 7. Visualizaciones ya creadas

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
| `estados_de_proceso.html` | Diagrama de estados con las flechas clickeables; explica por qué cada transición se puede o no aplicar; incluye la que no existe |
| `condicion_de_carrera.html` | El spooler paso a paso, con dos secuencias de conmutación a elegir: en una no pasa nada, en la otra se pierde un archivo |

**Pendiente y muy importante: el simulador de planificación con diagrama de Gantt para el tema 8.** FCFS, SJF, SRTF, Round Robin con quantum ajustable y prioridades, mostrando **la cola de preparados en cada instante** y los tiempos de espera y retorno. Debe respetar la **regla de desempate de la cátedra**. La lógica ya está escrita y verificada en `_trabajo/verificar_planificacion.js`: conviene portarla tal cual al HTML.

Para abrirlas: `Start-Process "ruta\al\archivo.html"` desde PowerShell.

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

La Unidad 2 tiene asignados **5 días** (lun 26 de octubre a dom 1 de noviembre) y unas 12 horas de trabajo. Hay **8 días de colchón** en total hasta el examen. Si la Unidad 2 se estira, se come del colchón: **no conviene recortarla**, porque las unidades 2, 3, 4 y 6 concentran casi todos los puntos de los exámenes prácticos.

Después de la Unidad 2 viene la **Unidad 3 — Administración de memoria** (Tanenbaum cap. 3 completo, impresas 175–254 → PDF 205–284, más 2.1.7 en impresas 93–95). Es la otra unidad pesada.
