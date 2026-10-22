# Continuidad — dónde quedamos

> **Este archivo es para la IA que retoma la tutoría en otra computadora.**
> Leelo completo antes de responderle nada al estudiante.

Última actualización: **2026-10-22**

---

## 0. Instrucción obligatoria para la IA que lee esto

1. Leé primero `CLAUDE.md` (está en la raíz del proyecto). Ahí está el rol, las fases y los comandos rápidos. Este archivo **no lo reemplaza**: lo complementa diciendo en qué punto exacto quedó la clase.
2. Respondé siempre en **español rioplatense, de "vos"**.
3. **Mantené este archivo actualizado.** Cada vez que el estudiante diga *"lo sigo luego"*, *"me voy"*, *"cerramos"* o algo equivalente, **reescribí este archivo** con el estado nuevo: qué temas se cubrieron, qué preguntas se hicieron, qué respondió, qué le costó y qué sigue. El estudiante estudia alternando entre dos computadoras, así que este archivo es el único puente entre las dos sesiones.
4. Conservá la sección 0 tal cual al reescribirlo, para que la próxima IA reciba la misma instrucción.
5. **No le muestres `respuestas.md` de ninguna unidad** salvo que lo pida explícitamente.
6. **Al terminar la clase de cada unidad, antes del cuestionario, generá el PDF de repaso** `unidades/uNN-.../repaso_uNN.pdf` con todo el contenido que se vio en el chat. Es un pedido explícito del estudiante y ya está anotado en `CLAUDE.md`. El método está en la sección 5.

---

## 1. El proyecto en dos líneas

El estudiante rinde **Sistemas Operativos** (UTN FRM, Ingeniería en Sistemas, programa 2026) en la **primera semana de diciembre de 2026**. La IA actúa como tutor: explica las unidades en el chat, prepara material para NotebookLM, arma cuestionarios difíciles y los corrige.

Material en `material_so/` (**nunca modificar los originales**). Libro principal: **Tanenbaum, Sistemas Operativos Modernos, 3ª ed.**

**Dato operativo clave:** `página PDF del Tanenbaum = página impresa + 30`. Verificado en los 11 inicios de capítulo.

---

## 2. ⭐ QUÉ HAY QUE HACER AHORA

**La Unidad 1 está terminada y el cuestionario está generado.** El estudiante se fue justo después de pedirlo, así que **todavía no lo respondió**.

El orden que él mismo planteó es:

1. **Que haga el cuestionario de la Unidad 1** → `unidades/u01-introduccion/cuestionario.md` (22 preguntas, 100 puntos, se aprueba con 60). Ya lo tiene disponible; puede responder en el chat o dejarlo en `unidades/u01-introduccion/correcciones/mis_respuestas_u01.md`.
2. **Corregirlo** cuando diga *"corregí la unidad 1"* → la guía completa está en `unidades/u01-introduccion/respuestas.md` (**no mostrársela**). Ese archivo incluye, al final, una tabla de "preguntas que marcan temas débiles" con qué reexplicar y qué visualización usar en cada caso.
3. **Después arrancar la Unidad 2** con `prepará la unidad 2` y luego `enseñame la unidad 2`.

Si llega y dice directamente que quiere arrancar la Unidad 2, está bien: el cuestionario de la 1 puede darlo más adelante como repaso. **Es su decisión, no insistir.**

### Lo que le queda disponible para repasar la Unidad 1

- **`unidades/u01-introduccion/repaso_u01.pdf`** — 18 páginas con **toda la clase**: los 9 temas, los esquemas, los ejemplos resueltos, el cierre y la lista de lo que más se toma. Es el documento que él pidió para repasar antes de rendir.
- Las 4 visualizaciones interactivas (sección 5).
- `notebooklm_u01.md` y `prompt_video.txt` para el video de NotebookLM.

---

## 3. Estado general del proyecto

| Fase | Estado |
|---|---|
| 0 — Inventario | Hecho → `plan/inventario.md` |
| 1 — Mapa de unidades | Hecho y aprobado → `plan/mapa_unidades.md` |
| **Unidad 1** | |
| 2 — Preparar | Hecho → `unidades/u01-introduccion/` |
| 3 — Clase | **Terminada**: 9 temas + cierre |
| — PDF de repaso | Hecho → `repaso_u01.pdf` (18 págs.) |
| 4 — Cuestionario | **Generado, sin responder** |
| 5 — Corrección | Pendiente |
| **Unidad 2** | Sin empezar |

**Decisiones ya tomadas con el estudiante:**

- Se estudia **en el orden del programa**, Unidad 1 a 9.
- Los temas del programa que no están en el material se completan con desarrollo propio citando la bibliografía del programa, **siempre marcados como "complemento elaborado"**.
- **Antes de cada cuestionario va el PDF de repaso de la unidad.** Pedido explícito, ya incorporado a `CLAUDE.md`.
- Herramientas: **no hay** `pdftotext` ni `qpdf`. Se instaló **PyMuPDF** (`pip install pymupdf`). Node disponible para verificar algoritmos.

---

## 4. Cómo dar la clase (lo que ya funciona con este estudiante)

Esto está probado y le funciona. Mantenerlo:

- **Un tema por vez.** Al terminar cada uno, 1 o 2 preguntas y **esperar la respuesta** antes de seguir.
- Estructura de cada tema: intuición o analogía → concepto formal con la terminología del examen → **esquema ASCII** → ejemplo concreto → referencia de página del libro.
- **Párrafos cortos.** Prefiere el ida y vuelta al muro de texto.
- Corregir **con franqueza**: decirle qué está mal y por qué, no dar por buena una respuesta a medias. Le sirve y lo acepta bien.
- Irle marcando el avance ("vas 7 de 9").
- Pregunta cosas laterales en el medio (qué es `DS`, si el código se lee de abajo hacia arriba, qué son las llamadas a procedimiento). **Responder esas digresiones en el momento y después retomar**: le ordenan el mapa mental. También pidió más de una vez el listado de temas que faltaban.
- **Es buen detector de huecos:** reclamó, con razón, que faltaba el tema de ensamblador en el mapa de la Unidad 1. Si reclama algo, revisarlo en serio antes de responder.

### Qué le costó y cómo se destrabó

1. **Particiones y cargadores de arranque.** Dijo *"no logro verlo en forma continua"*. Se destrabó con la analogía del **galpón con paredes internas** y contando el arranque **como una historia seguida**.
2. **Confusión 446 / 64 bytes.** Creía que los 64 bytes "eran" las particiones. El nudo: no distinguía **la descripción** del **contenido**. Se destrabó con *"el plano del galpón es una hoja A4; el galpón mide 2000 m²"*. **Le costó dos intentos** — la pregunta 11 del cuestionario vuelve sobre esto a propósito.
3. **Ensamblador e interrupciones.** Dijo *"no entendí el tema"*. El error fue **arrancar con tablas de funciones**. Se destrabó empezando por el problema de fondo: *"en ensamblador no existe la instrucción «mostrar texto»"* → alguien ya escribió esas rutinas → `INT` las llama → `AH` dice cuál → los otros registros llevan los datos. **Un solo ejemplo desmenuzado, cero tablas al principio.**
4. **Historia.** Pidió que se la reexplicaran entera. La primera versión fue un muro con las cuatro generaciones. La segunda funcionó: contarla como **una cadena de "agujeros de tiempo muerto"** que se van tapando.

**Conclusión transferible: cuando se traba, el problema casi siempre es que se arrancó por el formalismo en vez de por el problema que ese formalismo resuelve. Si un tema se da como lista de datos, hay que rehacerlo como una sola narración con hilo causal.**

### Errores conceptuales que ya cometió y conviene vigilar

- Creía que ante una instrucción privilegiada **"el SO deja de responder"** → es el **hardware** el que la rechaza *antes* de ejecutarla.
- Confundió **cliente-servidor como estructura del SO** con **cliente-servidor como arquitectura de aplicación** (eligió esa estructura para algo sensible a la latencia, cuando es la más lenta).
- Creyó que **la estructura por capas da tolerancia a fallas** → en capas todo sigue en modo kernel.
- Al calcular la tabla de particiones dijo "16 bytes" para 4 particiones: **tenía el concepto pero no multiplicó por 4**.

---

## 5. Herramientas y scripts del proyecto

Todos en `_trabajo/`:

| Script | Para qué |
|---|---|
| `extraer.py entrada.pdf salida.txt [ini] [fin]` | PDF → texto, con marcadores de página |
| `recortar.py entrada.pdf salida.pdf ini-fin [ini2-fin2 ...]` | Recorta rangos de páginas y **verifica el corte** mostrando la primera y última línea de cada rango |
| `render.py entrada.pdf prefijo pag1 pag2 ...` | PDF → PNG, para leer escaneados o revisar maquetación |
| `calibrar.py` | Calcula y verifica el desfase impresa/PDF del Tanenbaum |
| **`html2pdf.py entrada.html salida.pdf`** | **Genera el PDF de repaso de cada unidad.** Tiene el CSS ya armado (cajas de color `.clave`, `.ojo`, `.err`, `.ej`, bloques `<pre>` monoespaciados para los diagramas ASCII). Usa PyMuPDF Story |
| `verificar_u01.py`, `verificar_es.js`, `verificar_cuestionario_u01.py` | Verificación de los ejercicios numéricos |

**Método para el PDF de repaso:** escribir `unidades/uNN-.../repaso_uNN.html` con el contenido completo de la clase (los mismos diagramas ASCII dentro de `<pre>`), y después correr `python -X utf8 -I "_trabajo\html2pdf.py" "ruta.html" "ruta.pdf"`. Conviene renderizar un par de páginas con `render.py` y mirarlas para comprobar la maquetación antes de dárselo.

---

## 6. Visualizaciones ya creadas

Índice general en `visuales/index.html`. Todas verificadas antes de entregarlas.

| Archivo (en `unidades/u01-introduccion/visuales/`) | Qué hace |
|---|---|
| `es_programada_interrupciones_dma.html` | Simulador de las tres formas de E/S. Línea de tiempo paso a paso, parámetros editables, costo de CPU calculado. Verificado contra `_trabajo/verificar_es.js` |
| `arranque_y_sector_de_booteo.html` | Arranque paso a paso: BIOS → MBR → partición activa → cargador → SO. Se puede cambiar cuál partición está activa y ver qué pasa si ninguna lo está |
| `interrupciones_8086.html` | Simulador de INT 10h/16h/17h/21h. Resalta qué registros usa cada función, genera el código y lo ejecuta en una pantalla de DOS. Detecta los 4 errores típicos |
| `estructuras_de_so.html` | Las cinco estructuras y qué pasa en cada una cuando falla un driver. Barras de rendimiento y confiabilidad |

Para abrirlas: `Start-Process "ruta\al\archivo.html"` desde PowerShell.

**Criterio:** crear visualizaciones por iniciativa propia cuando el tema se entienda mejor manipulándolo, y agregarlas siempre a `visuales/index.html`. **Verificar los algoritmos con un script de Node o Python antes de dárselas.**

---

## 7. Lo que más se toma en los exámenes (vale para todas las unidades)

Sacado de las 29 fotos de exámenes reales en `material_so/imagenes de examenes/` (Integrador Práctica 22/11/2024 y Examen final práctica 17/12/2025). **Es la mejor guía de qué estudiar:**

- **Round Robin** con quantum 1 y 2: secuencia de ejecución, diagrama de Gantt y **estado de la cola de preparados en un instante t**. Regla de desempate de la cátedra: *entre un proceso que llega y otro que sale de ejecución, se pone antes el que llega*.
- **SJN / SRTF.**
- **Traducción de direcciones virtuales a físicas** con marcos de 1 KB y 4 KB, en binario y hexa.
- **Reemplazo por segunda oportunidad** con tabla de páginas (bits Referenciada / Modificada / Presente-ausente y Nº de marco).
- **Conteo de fallos de página** con N marcos.
- **FAT**: seguir la cadena de clusters, en qué cluster termina el archivo, espacio ocupado.
- **i-nodos**: punteros directos + indirecto simple, doble y triple; tamaño máximo de archivo.
- **Banquero**: estado seguro o inseguro, justificado.
- **INT 21h** y comandos Linux de las cartillas (`strace`, `ps -ef`, `pgrep`, `kill -STOP`/`-CONT`, `vmstat`, `free`, `lsblk -f`, `/etc/fstab`).

Formato típico: 5-7 consignas, 60 minutos, se aprueba con 60 puntos.

---

## 8. La Unidad 2, cuando llegue el momento

**Procesos, hilos, concurrencia y planificación. Es la unidad más pesada y la que más puntos vale en los prácticos.**

Páginas: Tanenbaum **cap. 2 completo** (impresas 83–174 → **PDF 113–204**) más **8.1** (impresas 526–548 → **PDF 556–578**). El resumen de la cátedra la cubre (`resumen so (5).pdf`, secciones 2.1, 2.4 y 2.5 — ojo que **2.2 hilos y 2.3 IPC están flojos** en el resumen, hay que ir al libro).

Temas del programa (punto 2 del programa analítico): modelo de procesos, jerarquías, estados, creación y terminación, BCP; subprocesos e hilos; comunicación entre procesos, condiciones de carrera, secciones críticas, exclusión mutua con y sin espera ocupada, semáforos, monitores, RPC; problemas clásicos (filósofos, lectores y escritores, **barbero dormilón — este NO está en el Tanenbaum 3ª ed., hay que complementarlo**); planificación y sus tipos; multiprocesamiento; modelo clásico de hilos; casos de estudio `fork()` en Linux y Windows.

**Visualizaciones casi obligatorias para esta unidad** (son las que más le van a servir y las que más se toman):
- **Simulador de planificación con diagrama de Gantt**: FCFS, SJF, SRTF, Round Robin con quantum ajustable y prioridades, mostrando **la cola de preparados en cada instante** y los tiempos de espera y retorno promedio. Tiene que respetar la **regla de desempate de la cátedra**.
- Diagrama de estados de un proceso con transiciones clickeables.
- Condición de carrera animada y semáforos con productor-consumidor.

Mapa completo de las 9 unidades con páginas impresas y de PDF: `plan/mapa_unidades.md`.
