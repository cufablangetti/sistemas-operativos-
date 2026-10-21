# Continuidad — dónde quedamos

> **Este archivo es para la IA que retoma la tutoría en otra computadora.**
> Leelo completo antes de responderle nada al estudiante.

Última actualización: **2026-10-21**

---

## 0. Instrucción obligatoria para la IA que lee esto

1. Leé primero `CLAUDE.md` (está en la raíz del proyecto). Ahí está el rol, las fases y los comandos rápidos. Este archivo **no lo reemplaza**: lo complementa diciendo en qué punto exacto quedó la clase.
2. Respondé siempre en **español rioplatense, de "vos"**.
3. **Mantené este archivo actualizado.** Cada vez que el estudiante diga *"lo sigo luego"*, *"me voy"*, *"cerramos"* o algo equivalente, **reescribí este archivo** con el estado nuevo: qué temas se cubrieron, qué preguntas se hicieron, qué respondió, qué le costó y qué sigue. El estudiante estudia alternando entre dos computadoras, así que este archivo es el único puente entre las dos sesiones.
4. Conservá la sección 0 tal cual al reescribirlo, para que la próxima IA reciba la misma instrucción.
5. No le muestres `respuestas.md` de ninguna unidad salvo que lo pida explícitamente.

---

## 1. El proyecto en dos líneas

El estudiante rinde **Sistemas Operativos** (UTN FRM, Ingeniería en Sistemas, programa 2026) en la **primera semana de diciembre de 2026**. La IA actúa como tutor: explica las unidades en el chat, prepara material para NotebookLM, arma cuestionarios difíciles y los corrige.

Material en `material_so/` (**nunca modificar los originales**). Libro principal: **Tanenbaum, Sistemas Operativos Modernos, 3ª ed.**

**Dato operativo clave:** `página PDF del Tanenbaum = página impresa + 30`. Verificado en los 11 inicios de capítulo.

---

## 2. Estado general del proyecto

| Fase | Estado |
|---|---|
| 0 — Inventario | Hecho → `plan/inventario.md` |
| 1 — Mapa de unidades | Hecho y aprobado → `plan/mapa_unidades.md` |
| 2 — Preparar Unidad 1 | Hecho → `unidades/u01-introduccion/` |
| 3 — Clase Unidad 1 | **EN CURSO** — 8 de 9 temas dados. Ver sección 4 |
| 4 — Cuestionario Unidad 1 | Pendiente |
| 5 — Corrección Unidad 1 | Pendiente |

**Decisiones ya tomadas con el estudiante:**

- Se estudia **en el orden del programa**, Unidad 1 a 9.
- Los temas del programa que no están en el material se completan con desarrollo propio citando la bibliografía del programa, **siempre marcados como "complemento elaborado"** para que se distingan de lo que sale del libro.
- Herramientas: **no hay** `pdftotext` ni `qpdf`. Se instaló **PyMuPDF** (`pip install pymupdf`). Node está disponible para verificar algoritmos. Scripts propios en `_trabajo/`: `extraer.py`, `recortar.py`, `render.py`, `calibrar.py`, `verificar_u01.py`, `verificar_es.js`.

---

## 3. Cómo dar la clase (lo que ya funciona con este estudiante)

Esto está probado y le funciona. Mantenerlo:

- **Un tema por vez.** Al terminar cada uno, 1 o 2 preguntas y **esperar la respuesta** antes de seguir.
- Estructura de cada tema: intuición o analogía → concepto formal con la terminología del examen → **esquema ASCII** → ejemplo concreto → referencia de página del libro.
- **Párrafos cortos.** Prefiere el ida y vuelta al muro de texto.
- Corregir las respuestas **con franqueza**: decirle qué está mal y por qué, no dar por buena una respuesta a medias. Le sirve y lo acepta bien.
- Irle marcando el avance ("vas 7 de 9").
- Pregunta cosas laterales en el medio (por ejemplo, pidió que le explicaran qué es `DS`, si el código se lee de abajo para arriba, y qué son las llamadas a procedimiento). **Responder esas digresiones en el momento y después retomar**: le ordenan el mapa mental.

### Qué le costó y cómo se destrabó

Esto es importante para no repetir el error:

1. **Particiones y cargadores de arranque (tema 4).** Dijo *"no logro verlo en forma continua"*. Se destrabó con la analogía del **galpón con paredes internas** y contando el arranque **como una historia seguida**, sin pasos numerados sueltos. Después, con la visualización.
2. **Confusión 446 / 64 bytes.** Creía que los 64 bytes "eran" las particiones. El nudo real: no distinguía **la descripción** del **contenido**. Se destrabó con *"el plano del galpón es una hoja A4; el galpón mide 2000 m²"*, y con que un renglón de 16 bytes describe cualquier tamaño de partición porque solo guarda números. **Verificar que esto siga firme — le costó dos intentos.** En la segunda pregunta de control contestó "16 bytes" para una tabla de 4 particiones: tenía el concepto pero no multiplicó por 4.
3. **Ensamblador e interrupciones (tema 5).** Primera explicación: dijo directamente *"no entendí el tema"*. El error fue **arrancar con tablas de funciones**. Se destrabó tirando todo y empezando por el problema de fondo: *"en ensamblador no existe la instrucción «mostrar texto»"* → alguien ya escribió esas rutinas → `INT` las llama → `AH` dice cuál → los otros registros llevan los datos. **Un solo ejemplo desmenuzado, cero tablas al principio.** Las tablas son material de consulta, no de comprensión, y conviene decírselo así.
4. **Historia (tema 7).** Pidió que se la reexplicaran entera. La primera versión fue un muro con las cuatro generaciones de golpe. La segunda **funcionó**: contarla como **una cadena de "agujeros de tiempo muerto"** que se van tapando (ver sección 4, resumen del tema 7). Con ese enfoque contestó bien las dos preguntas de control.

**Conclusión transferible: cuando se traba, el problema casi siempre es que se arrancó por el formalismo en vez de por el problema que ese formalismo resuelve. Y si un tema se da como lista de datos, hay que rehacerlo como una sola narración con un hilo causal.**

---

## 4. UNIDAD 1 — exactamente dónde quedamos

La unidad se dividió en **9 temas** (originalmente eran 8; el estudiante reclamó que faltaba el de ensamblador/interrupciones y tenía razón, se agregó como tema 5).

| # | Tema | Estado |
|---|---|---|
| 1 | Qué es un SO: máquina extendida + administrador de recursos | Visto |
| 2 | Hardware: CPU, registros, modo kernel/usuario, jerarquía de memoria | Visto |
| 3 | Las tres formas de hacer E/S: programada, interrupciones, DMA | Visto |
| 4 | Arranque y sector de booteo | Visto (costó, ver sección 3) |
| 5 | Ensamblador e interrupciones del 8086 (INT 10h/16h/17h/21h) | Visto (costó, ver sección 3) |
| 6 | Llamadas al sistema (TRAP, POSIX, strace) | Visto |
| 6b | Llamadas a procedimiento (CALL/RET y la pila) | Visto — lo pidió él como aclaración |
| 7 | Historia por generaciones | Visto (se reexplicó, ver sección 3) |
| **8** | **Tipos de sistemas operativos** | **ACÁ QUEDAMOS** |
| 9 | Estructuras de los SO | Pendiente |
| — | Cierre de la unidad (5-8 puntos clave + qué se toma) | Pendiente |

### El punto exacto de corte

Se explicó el **tema 8 completo** (tipos de sistemas operativos) y se hicieron **estas dos preguntas, que el estudiante todavía NO respondió**:

> **1.** El sistema de frenos ABS de un auto y Spotify. ¿Cuál es tiempo real duro y cuál suave? ¿Por qué?
>
> **2.** ¿Por qué un sistema operativo **integrado** puede darse el lujo de no implementar protección de memoria, y uno de **celular** no?

**Respuestas esperadas**, para corregirlo:

1. **ABS = tiempo real duro**: la acción tiene que ocurrir en el instante exacto, sin excepción; si frena 200 ms tarde hay un choque. Exige garantías absolutas. **Spotify = tiempo real suave**: si el audio se corta un instante, molesta pero no pasa nada grave; es aceptable fallar muy ocasionalmente.
2. Porque en un **integrado** todo el software viene en ROM y **el usuario no puede instalar nada**: hay certeza de que nunca correrá software no confiable, así que no hay de quién protegerse y el diseño se simplifica. En un **celular** se instalan apps de terceros, que pueden ser maliciosas o tener errores, así que la protección es indispensable.

Si el estudiante ya las respondió en la otra computadora, corregirlas y pasar al **tema 9**.

### Qué falta para cerrar la Unidad 1

**Tema 9 — Estructuras de los SO.** Las cinco organizaciones, de la más acoplada a la más distribuida:

- **Monolítica**: todo el SO en un solo programa en modo kernel. Estructura en tres niveles (programa principal → procedimientos de servicio → procedimientos utilitarios). Rápida, pero un error en cualquier módulo derriba el sistema. Linux, con módulos cargables como término medio.
- **Por capas**: jerarquía donde cada capa usa solo la de abajo. Sistema THE (6 capas), MULTICS (anillos concéntricos).
- **Microkernel**: solo el microkernel en modo kernel; los drivers corren como procesos de usuario. Alta confiabilidad, un driver que falla no tumba el sistema. MINIX 3. Regla de diseño: **mecanismo en el kernel, política en el espacio de usuario**. Costo: paso de mensajes en lugar de llamadas a procedimiento.
- **Cliente-servidor**: variación del microkernel; servidores que dan servicio y clientes que lo usan, comunicados por mensajes. Se extiende naturalmente a una red → base de los sistemas distribuidos (Unidad 8).
- **Máquinas virtuales**: el monitor corre sobre el hardware y ofrece copias exactas del hardware real. Hipervisor **tipo 1** (sobre el hardware) y **tipo 2** (como programa de usuario sobre un SO anfitrión). La JVM como variante. **Conecta directo con la Unidad 7.**
- (Opcional) **Exokernel**: reparte recursos reales en vez de dar máquinas virtuales completas.

Referencia: Tanenbaum cap. 1.7, impresas 62–72 → PDF 92–102. Está en el resumen de la cátedra, sección 1.7.

**Buen gancho para este tema**: es el intercambio entre **rendimiento y confiabilidad**. Monolítico = rápido y frágil; microkernel = lento y robusto. Y conviene cerrar mostrando que la pregunta "¿quién corre en modo kernel?" —que viene del tema 2— es la que define las cinco estructuras.

Después del tema 9 va el **cierre de la unidad**: 5 a 8 puntos clave y qué se toma más en los exámenes.

### Resumen de lo cubierto en cada tema (por si pregunta algo hacia atrás)

- **Tema 1:** las dos funciones no relacionadas; multiplexaje en tiempo (CPU, impresora) y en espacio (memoria, disco). Se le marcó que la frase del libro es *"asignación ordenada y controlada"*. En el disco entendió que la superficie se multiplexa en espacio y el brazo en tiempo.
- **Tema 2:** ciclo de la CPU; PC, SP y PSW; **modo kernel vs usuario** (bit del PSW); instrucciones privilegiadas y que **las detecta el hardware, no el SO** (acá tuvo un error: creía que el SO "dejaba de responder"; se corrigió explicando que el hardware rechaza la instrucción *antes* de ejecutarla); jerarquía de memoria; caché y localidad; MMU; dispositivos = dispositivo + controlador + driver. Ejemplo numérico: 1 ns / 10 ns / 95 % → 1,50 ns y 6,67×. Él resolvió solo el caso de 50 % → 6,00 ns y 1,67×.
- **Tema 3:** los tres métodos; **el tiempo total NO cambia, lo que cambia es el costo de CPU**; ejemplo 1000 bytes × 100 µs, interrupción 5 µs → 100 % / 5 % / 0,005 %. Entendió por qué el teclado usa interrupciones y el disco DMA.
- **Tema 4:** BIOS → MBR → partición activa → cargador secundario → SO. MBR = 446 código + 64 tabla + 2 firma 55AA. 4 particiones primarias porque 64/16 = 4. Límite de 2 TB del MBR por el campo de 4 bytes. Se le explicó además por qué el BIOS puede leer un sector pero no un archivo (el archivo es una abstracción construida por software; el sector es una operación nativa del hardware).
- **Tema 5:** `INT` elige la familia, `AH` la función, los demás registros los datos. `INT 21h`: `02h` un carácter en `DL`, `09h` cadena en `DS:DX` terminada en `$`, `4Ch` terminar (y `MOV AX, 4C00h`). `INT 10h`: `0Eh` avanza el cursor, `09h`/`0Ah` no. `INT 16h`: `00h` bloquea, `01h` sondea. Los 4 errores típicos de la cátedra. Qué es `DS` (segmento : desplazamiento, y por qué hay que pasar por AX para cargarlo). Que el código se ejecuta de arriba hacia abajo aunque se explique al revés. Resolvió el ejercicio del final práctica.
- **Tema 6:** `TRAP` vs llamada a procedimiento (cambia el modo / dirección fija); llamadas POSIX de procesos y archivos; `strace -o salida.txt ls -la` y las llamadas que aparecen (`openat`, `read`, `getdents64`, `newfstatat`, `write`, `close`); ejemplo del buffer 512 vs 4096 → 16 vs 2 llamadas. Contestó las dos preguntas perfectas.
- **Tema 6b:** `CALL` apila la dirección de retorno, `RET` la desapila; por qué hace falta la pila; `INT` es un `CALL` con control de seguridad y vuelve con `IRET`.
- **Tema 7:** contado como cadena de agujeros de tiempo muerto. (1) la máquina espera al programador → operadores; (2) espera al operador → **procesamiento por lotes**; (3) la CPU espera al disco → **multiprogramación** + spooling; (4) el usuario espera el resultado → **tiempo compartido**; (5) la máquina es barata → **computadora personal** y GUI. Clave: **lotes = uno en memoria por vez, en fila; multiprogramación = varios en memoria a la vez**. Y que la multiprogramación **exige hardware de protección**. Contestó bien las dos.
- **Tema 8:** los nueve tipos. Énfasis en **tiempo real duro vs suave** y en **integrados vs de bolsillo** (la certeza de que nunca correrá software no confiable elimina la necesidad de protección).

---

## 5. Visualizaciones ya creadas

Índice general en `visuales/index.html`. Todas verificadas antes de entregarlas.

| Archivo | Qué hace |
|---|---|
| `unidades/u01-introduccion/visuales/es_programada_interrupciones_dma.html` | Simulador de las tres formas de E/S. Línea de tiempo paso a paso, parámetros editables, costo de CPU calculado. Modelo verificado contra `_trabajo/verificar_es.js`. |
| `unidades/u01-introduccion/visuales/arranque_y_sector_de_booteo.html` | Arranque paso a paso: BIOS → MBR → partición activa → cargador → SO. Se puede cambiar cuál partición está activa y ver qué pasa si ninguna lo está. |
| `unidades/u01-introduccion/visuales/interrupciones_8086.html` | Simulador de INT 10h/16h/17h/21h. Resalta qué registros usa cada función, genera el código y lo ejecuta en una pantalla de DOS. Detecta los 4 errores típicos. |

Para abrirlas: `Start-Process "ruta\al\archivo.html"` desde PowerShell.

**Criterio:** crear visualizaciones por iniciativa propia cuando el tema se entienda mejor manipulándolo, y agregarlas siempre a `visuales/index.html`. Verificar los algoritmos con un script de Node o Python **antes** de dárselas. Para el tema 9 podría servir una que compare las cinco estructuras mostrando qué corre en modo kernel y qué pasa cuando falla un driver en cada una.

---

## 6. Lo que más se toma en los exámenes (vale para todas las unidades)

Sacado de las 29 fotos de exámenes reales en `material_so/imagenes de examenes/` (Integrador Práctica 22/11/2024 y Examen final práctica 17/12/2025). **Es la mejor guía de qué estudiar:**

- **Round Robin** con quantum 1 y 2: secuencia de ejecución, diagrama de Gantt y **estado de la cola de preparados en un instante t**. Regla de desempate de la cátedra: *entre un proceso que llega y otro que sale de ejecución, se pone antes el que llega*.
- **SJN / SRTF.**
- **Traducción de direcciones virtuales a físicas** con marcos de 1 KB y 4 KB, en binario y hexa.
- **Reemplazo por segunda oportunidad** con tabla de páginas (bits Referenciada / Modificada / Presente-ausente y Nº de marco): qué página se reemplaza, justificarlo y dejar el estado final de la cola.
- **Conteo de fallos de página** con N marcos.
- **FAT**: seguir la cadena de clusters, en qué cluster termina el archivo, espacio ocupado en disco.
- **i-nodos**: punteros directos + indirecto simple, doble y triple; tamaño máximo de archivo.
- **Banquero**: estado seguro o inseguro, justificado.
- **INT 21h** y comandos Linux de las cartillas (`strace`, `ps -ef`, `pgrep`, `kill -STOP`/`-CONT`, `vmstat`, `free`, `lsblk -f`, `/etc/fstab`).

Formato típico: 5-7 consignas, 60 minutos, se aprueba con 60 puntos.

---

## 7. Qué sigue después de la Unidad 1

1. Terminar el tema 9 + cierre de la unidad.
2. `cuestionario unidad 1` → generar `cuestionario.md` y `respuestas.md` por separado, **sin mostrarle las respuestas**. Verificar los ejercicios numéricos ejecutando un script.
3. `corregí la unidad 1` cuando entregue.
4. `prepará la unidad 2` — Procesos, hilos, concurrencia y planificación. **Es la unidad más pesada y la que más puntos vale en los prácticos.** Tanenbaum cap. 2 completo (impresas 83–174 → PDF 113–204) más 8.1 (impresas 526–548 → PDF 556–578).

Mapa completo de las 9 unidades con páginas impresas y de PDF: `plan/mapa_unidades.md`.
