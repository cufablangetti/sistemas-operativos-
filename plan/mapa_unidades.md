# Mapa de unidades — Sistemas Operativos (UTN-FRM, ISI, 2026)

Fecha: 2026-10-19

**Regla de oro para ubicar cualquier página del libro:**

> **página del PDF = página impresa + 30**

Verificado en los 11 inicios de capítulo del Tanenbaum (ver `inventario.md`). Es constante en todo el libro.

**Abreviaturas de los apuntes:**

| Clave | Archivo |
|---|---|
| RES | `resumen so (5).pdf` — resumen del Tanenbaum, caps. 1–6 |
| PRA | `Practica SO_260728_223210 (1).pdf` — prácticos resueltos (págs. 17–30 escaneadas) |
| FIN | `Notes_260728_204823 (1).pdf` — examen final práctica resuelto (escaneado) |
| PAR | `Notes_260729_172210 (1).pdf` — parcial práctica + ejercitación resuelta (escaneado) |
| CMD | `Comandos_Linux-SO (1).pdf` + Google Doc "Com" |
| INT | `Interrupciones (1).pdf` + `Tp5 - Tabla Interrupciones.pdf` |
| EXA | `imagenes de examenes/` — 29 fotos de exámenes reales |

---

## Unidad 1 — Introducción, hardware y estructura de los SO

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 1.1 Repaso de hardware de cómputo | 1.3 Revisión del hardware de computadora | 19–33 | **49–63** | RES |
| 1.1 E/S programada, por interrupciones, DMA | 5.1.4 DMA · 5.1.5 Repaso de interrupciones · 5.2.2–5.2.4 | 336–348 | **366–378** | RES, INT |
| 1.1 Control de flujo, interrupciones | 5.1.5 Repaso de las interrupciones | 339–343 | **369–373** | INT |
| 1.1 Lenguaje ensamblador. Sector de booteo | 1.3.7 Arranque de la computadora | 33 | **63** | **INT** (INT 10h/14h/16h/21h), PRA, FIN |
| 1.2 SO como máquina extendida y administrador de recursos | 1.1 ¿Qué es un sistema operativo? | 3–7 | **33–37** | RES |
| 1.3 Historia: generaciones | 1.2 Historia de los sistemas operativos | 7–19 | **37–49** | RES |
| 1.4 Variedades de SO | 1.4 Los tipos de sistemas operativos | 33–37 | **63–67** | RES |
| (base) Conceptos: procesos, archivos, shell, llamadas al sistema | 1.5 Conceptos · 1.6 Llamadas al sistema | 37–62 | **67–92** | RES, **CMD** (`strace`, `openat`, `read`, `write`, `close`) |
| 1.5 Estructura: monolíticos, capas, máquinas virtuales, cliente-servidor | 1.7 Estructura de un sistema operativo | 62–72 | **92–102** | RES |
| 1.6–1.7 Caso de estudio: kernel de Linux | 10.2.5 Estructura del kernel | 736–739 | **766–769** | — |
| 1.6–1.7 Caso de estudio: arquitectura de Windows | 11.3.1 Estructura del sistema operativo | 832–847 | **862–877** | — |

**Recorte sugerido del libro:** impresas 1–80 → **PDF 31–110**, más 336–348 → **PDF 366–378**.

**Lo que más cae en el examen (EXA):** `strace -o salida.txt ls -la`, llamadas al sistema que aparecen en el rastreo, `ls -l /dev` para distinguir dispositivos de carácter (`c`) y de bloque (`b`), INT 21h (`09h` mostrar cadena, `4Ch` terminar) e INT 10h.

---

## Unidad 2 — Procesos, hilos, concurrencia y planificación

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 2.1 Modelo de procesos, creación, terminación, jerarquías, estados, implementación, BCP | 2.1 Procesos | 83–95 | **113–125** | RES, CMD |
| 2.1 Subprocesos: modelo e implementación | 2.2 Hilos | 95–117 | **125–147** | RES |
| 2.2 Concurrencia, condiciones de concurso, secciones críticas, exclusión mutua con espera ocupada | 2.3.1–2.3.3 | 117–125 | **147–155** | RES, **PAR** (condiciones de Tanenbaum) |
| 2.2 Soluciones sin espera ocupada: dormir/despertar, semáforos, mutexes, monitores | 2.3.4–2.3.7 | 125–140 | **155–170** | RES |
| 2.2 Llamada a procedimientos remotos | 8.2.4 Llamada a procedimiento remoto | 558–560 | **588–590** | — |
| 2.2 Filósofos comelones, lectores y escritores | 2.5 Problemas clásicos de IPC | 163–168 | **193–198** | RES |
| 2.2 El problema del barbero dormilón | — | — | — | **No está en el Tanenbaum 3ª ed.** |
| 2.3 Planificación: conceptos, tipos, apropiativa y no apropiativa | 2.4 Planificación | 145–163 | **175–193** | RES, **PRA, PAR, FIN, EXA** |
| 2.4 Multiprocesamiento, paralelismo, hardware multiprocesador | 8.1.1–8.1.2 | 526–538 | **556–568** | — |
| 2.4 SO de multiprocesadores, planificación | 8.1.3–8.1.4 | 538–548 | **568–578** | — |
| 2.5 Modelo clásico de hilos; implementación usuario/kernel/híbrida | 2.2.2–2.2.6 | 100–111 | **130–141** | RES |
| 2.6 Caso de estudio: `fork()` en Linux | 10.3.2–10.3.3 | 741–752 | **771–782** | CMD |
| 2.6 Caso de estudio: procesos e hilos en Windows | 11.4 (Procesos e hilos en Windows Vista) | 862 en adelante | **892 en adelante** | — |

**Recorte sugerido:** impresas 83–174 → **PDF 113–204**, más 526–548 → **PDF 556–578**.

**Lo que más cae (EXA/PAR/FIN):** Round Robin con quantum 1 y 2 — secuencia de ejecución, diagrama de Gantt y **estado de la cola de preparados en un instante t**; SJN/SJF; SRTF; regla de desempate de la cátedra ("entre un proceso que llega y otro que sale del estado de ejecución, se pone antes el que llega"); comandos `ps -ef`, `pgrep`, `kill -STOP`/`-CONT`, `htop`, `pidstat`, `/proc/PID`.

---

## Unidad 3 — Administración de memoria

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 3.1 Almacenamiento real, jerarquías | 1.3.2 Memoria · 3.1 Sin abstracción de memoria | 23–26 · 176–179 | **53–56 · 206–209** | RES |
| 3.2 Modelado de la multiprogramación y rendimiento | 2.1.7 Modelación de la multiprogramación | 93–95 | **123–125** | RES |
| 3.2 Particiones fijas. Recolocación y protección | 3.1 (particiones fijas, registros base/límite) | 176–181 | **206–211** | RES |
| 3.3 Intercambio. Particiones variables | 3.2.2 Intercambio | 181–184 | **211–214** | RES |
| 3.3 Mapa de bits, listas enlazadas, sistema compañero | 3.2.3 Administración de memoria libre | 184–188 | **214–218** | RES |
| 3.4 Paginación. Traducción de direcciones | 3.3.1 Paginación | 189–193 | **219–223** | RES, **PRA, PAR, EXA** |
| 3.4 Tablas de páginas. TLB. Tablas para memorias extensas | 3.3.2–3.3.4 | 193–201 | **223–231** | RES |
| 3.4 Algoritmos de reemplazo: óptimo, NRU, FIFO, 2ª oportunidad, reloj, LRU, conjunto de trabajo, WSClock | 3.4 | 201–216 | **231–246** | RES, **PRA, PAR, EXA** |
| 3.4 Aspectos de diseño. Hiperpaginación (thrashing) | 3.5 Cuestiones de diseño | 216–227 | **246–257** | RES |
| 3.4 Aspectos de implementación. Fallos de página | 3.6 Cuestiones de implementación | 227–234 | **257–264** | RES |
| 3.5 Segmentación | 3.7 Segmentación | 234–238 | **264–268** | RES |
| 3.6 Sistemas combinados paginación + segmentación | 3.7.2 MULTICS · 3.7.3 Intel Pentium | 238–247 | **268–277** | RES |
| 3.7 Caso de estudio: `malloc`, `free`, `calloc`, `realloc` | 10.4.2 Llamadas al sistema de memoria en Linux | 761–762 | **791–792** | CMD |
| 3.7 Caso de estudio: memorias caché | 1.3.2 Memoria (jerarquía y caché) | 23–26 | **53–56** | — |
| 3.7 Caso de estudio: administrador de memoria de Windows | 11.5 (Administración de memoria en Windows Vista) | — | — | Buscar en el índice del cap. 11 |

**Recorte sugerido:** impresas 175–254 → **PDF 205–284**, más 93–95 → **PDF 123–125**.

**Lo que más cae (EXA/PAR/PRA):** traducción de dirección virtual a física en binario/hexa con marcos de 1 KB y 4 KB; **reemplazo por segunda oportunidad** con tabla de páginas (bits Referenciada / Modificada / Presente-ausente y Nº de marco) — hay que decir qué página se reemplaza, justificarlo y dejar el estado final de la cola; conteo de fallos de página con N marcos; FIFO y LRU.

---

## Unidad 4 — Sistemas de archivos

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 4.1 Nombres, estructura, tipos, acceso, atributos, operaciones | 4.1 Archivos | 257–268 | **287–298** | RES |
| 4.1 Directorios. Niveles de directorios | 4.2 Directorios | 268–273 | **298–303** | RES |
| 4.2 Manejo del espacio de disco | 4.4.1 Administración del espacio en disco | 292–298 | **322–328** | RES, **PRA** (fragmentación interna) |
| 4.2 Almacenamiento de archivos: contigua, enlazada, FAT, nodo-i | 4.3.2 Implementación de archivos | 274–280 | **304–310** | RES, **PRA, PAR, FIN, EXA** |
| 4.2 Estructura de directorios | 4.3.3 Implementación de directorios | 280–283 | **310–313** | RES |
| 4.2 Links (enlace duro y simbólico) | 4.3.4 Archivos compartidos | 283–285 | **313–315** | RES, CMD (`ln`, `ln -s`) |
| 4.2 NTFS, VFS | 4.3.7 Sistemas de archivos virtuales · 11.8 (NTFS) | 288–292 | **318–322** | — |
| 4.2 Confiabilidad y consistencia. Respaldos | 4.4.2 Respaldos · 4.4.3 Consistencia | 298–307 | **328–337** | RES |
| 4.2 Rendimiento del sistema de archivos | 4.4.4–4.4.5 | 307–312 | **337–342** | RES |
| 4.3 Servidores de archivos, actualización atómica, transacciones | 4.3.6 Sistemas de archivos por bitácora · 8.4.4 Middleware basado en sistemas de archivos · 10.6.4 NFS | 287–288 · 591–596 · 796–803 | **317–318 · 621–626 · 826–833** | — |
| 4.4 Ejemplos: CD-ROM, MS-DOS (FAT), UNIX V7 | 4.5 Ejemplos de sistemas de archivos | 312–324 | **342–354** | RES |
| 4.5 Protección: dominios, ACL, capacidades, canales de conversión | 9.3 Mecanismos de protección | 622–641 | **652–671** | — |
| 4.6 Caso de estudio: `open`, `close`, `read`, `write`, `lseek` | 10.6.2 Llamadas al sistema de archivos en Linux | 785–788 | **815–818** | CMD |
| 4.6 Caso de estudio: ext3/ext4/xfs/btrfs/zfs | 10.6.3 Implementación del sistema de archivos de Linux | 788–796 | **818–826** | CMD (`mkfs.ext4`, `lsblk -f`, `/etc/fstab`) |

**Recorte sugerido:** impresas 255–328 → **PDF 285–358**, más 622–641 → **PDF 652–671**.

**Lo que más cae (EXA/FIN/PAR):** **FAT** — seguir la cadena de clusters, decir en qué cluster termina el archivo y calcular el espacio ocupado en disco; **i-nodos** — 10 ó 12 punteros directos más indirecto simple, doble y triple, calcular el tamaño máximo de archivo; fragmentación interna; `cat /etc/fstab` para el tamaño de bloque de una partición ext4.

---

## Unidad 5 — Entrada/salida

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 5.1 Dispositivos de E/S. Controladores. DMA | 5.1 Principios del hardware de E/S | 329–343 | **359–373** | RES, CMD (`ls -l /dev`) |
| 5.2 Objetivos del software de E/S | 5.2.1 | 343–344 | **373–374** | RES |
| 5.2 E/S programada, por interrupciones, con DMA | 5.2.2–5.2.4 | 344–348 | **374–378** | RES, INT |
| 5.2 Manejadores de interrupciones y de dispositivos | 5.3.1–5.3.2 | 348–353 | **378–383** | RES |
| 5.2 Software de E/S independiente del dispositivo y en espacio de usuario | 5.3.3–5.3.4 | 353–360 | **383–390** | RES |
| 5.3 Discos: hardware, formato, RAID | 5.4.1–5.4.2 | 361–379 | **391–409** | RES, **PRA** |
| 5.3 Planificación del brazo del disco (FCFS, SSTF, SCAN...) | 5.4.3 Algoritmos de programación del brazo | 379–382 | **409–412** | RES, PRA |
| 5.3 Manejo de errores. Discos de RAM | 5.4.4–5.4.5 | 382–388 | **412–418** | RES |
| 5.4 Relojes: hardware y software | 5.5 Relojes | 388–394 | **418–424** | RES |
| 5.4 Interfaces gráficas, terminales | 5.6 Interfaces de usuario · 5.7 Clientes delgados | 394–417 | **424–447** | — |
| 5.5 Caso de estudio: redirección y tuberías en Linux | 10.2.3 El shell | 731–734 | **761–764** | CMD |
| 5.5 Caso de estudio: componentes de E/S de Windows, KMDF/UMDF | 11.7 (E/S en Windows Vista) | — | — | Buscar en el índice del cap. 11 |

**Recorte sugerido:** impresas 329–432 → **PDF 359–462**.

**Lo que más cae (PRA/EXA):** tiempo medio de lectura/escritura en disco = tiempo de posicionamiento + retardo rotacional (media vuelta: 30000/rpm ms) + tiempo de transferencia + sobrecarga; `iostat`, `vmstat` (columna `id` = porcentaje de CPU inactiva); dispositivos de carácter vs. de bloque.

---

## Unidad 6 — Interbloqueos

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 6.1 Recursos apropiativos y no apropiativos. Adquisición | 6.1 Recursos | 434–437 | **464–467** | RES |
| 6.2 Introducción. Condiciones de Coffman. Modelado con grafos | 6.2 Introducción a los interbloqueos | 437–441 | **467–471** | RES |
| (extra) El algoritmo de la avestruz | 6.3 | 441–442 | **471–472** | RES |
| 6.3 Mecanismos de detección (uno y varios recursos de cada tipo) | 6.4.1–6.4.2 | 442–447 | **472–477** | RES |
| 6.4 Recuperación de bloqueos | 6.4.3 | 447–448 | **477–478** | RES |
| 6.5 Evasión: estados seguros, **algoritmo del banquero** | 6.5 Cómo evitar interbloqueos | 448–454 | **478–484** | RES, **FIN, PAR, EXA** |
| 6.6 Prevención: atacar las cuatro condiciones | 6.6 Cómo prevenir interbloqueos | 454–457 | **484–487** | RES |
| (extra) Bloqueo de dos fases, bloqueo activo, inanición | 6.7 Otras cuestiones | 457–461 | **487–491** | RES |
| 6.7 Caso de estudio: semáforos en Linux | 2.3.5 Semáforos | 128–130 | **158–160** | — |
| 6.7 Caso de estudio: interrupciones en Windows, DPC, APC | 11.4 (Trap dispatching en Windows Vista) | — | — | Buscar en el índice del cap. 11 |

**Recorte sugerido:** impresas 433–466 → **PDF 463–496**.

**Lo que más cae (FIN/EXA):** **algoritmo del banquero** — dada una tabla de créditos (máximos) y asignados, armar el diagrama/tabla de estado, decir si el estado es seguro o inseguro y justificar; qué pasa si dos procesos reclaman un recurso más; grafo de asignación de recursos.

---

## Unidad 7 — Virtualización

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 7.1 Concepto y requerimientos para virtualizar | 8.3 Virtualización · 8.3.1 Requerimientos | 568–571 | **598–601** | — |
| 7.2 Técnicas: hipervisores tipo 1 y 2, paravirtualización | 8.3.2–8.3.4 | 571–576 | **601–606** | — |
| 7.2 Virtualización de memoria, de E/S, dispositivos virtuales | 8.3.5–8.3.7 | 576–579 | **606–609** | — |
| 7.3 Máquinas virtuales | 1.7.5 Máquinas virtuales | 67–71 | **97–101** | RES |
| 7.4 VM en CPUs multinúcleo. Licencias | 8.3.8–8.3.9 | 579–580 | **609–610** | — |
| 7.4 Caso de estudio: lxc, qemu-kvm, VirtualBox, Hyper-V | — | — | — | **No está en el Tanenbaum 3ª ed.** |

**Recorte sugerido:** impresas 568–580 → **PDF 598–610**, más 67–71 → **PDF 97–101**.

> Esta unidad **no está cubierta por el resumen de la cátedra** (RES llega hasta el cap. 6). Hay que leerla del libro.

---

## Unidad 8 — Sistemas distribuidos y tiempo real

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 8.1 Introducción a los sistemas distribuidos. Objetivos, ventajas | 8.4 Sistemas distribuidos | 580–583 | **610–613** | — |
| 8.2 Comunicación y sincronización. RPC | 8.2.2–8.2.4 | 553–560 | **583–590** | — |
| 8.2 Memoria compartida distribuida | 8.2.5 | 560–565 | **590–595** | — |
| 8.2 Procesos: planificación y balanceo de carga | 8.2.6–8.2.7 | 565–568 | **595–598** | — |
| 8.2 Archivos en sistemas distribuidos | 8.4.4 Middleware basado en sistemas de archivos · 10.6.4 NFS | 591–596 · 796–803 | **621–626 · 826–833** | — |
| 8.3 Hardware: multiprocesadores y multicomputadoras | 8.1.1 · 8.2.1 | 526–534 · 549–553 | **556–564 · 579–583** | — |
| 8.3 Software: SO de redes. Protocolos y middleware | 8.4.1–8.4.7 | 583–604 | **613–634** | — |
| 8.4 Procesamiento en tiempo real. Planificación en tiempo real | 2.4.4 Planificación en sistemas de tiempo real · 7.5 Programación de procesos multimedia | 160–161 · 487–493 | **190–191 · 517–523** | RES (2.4.4) |
| 8.5 Caso de estudio: Plan 9, Minix, Amoeba | 10.1.6 MINIX | 725–726 | **755–756** | Plan 9 y Amoeba **no están** |

**Recorte sugerido:** impresas 523–610 → **PDF 553–640**, más 160–161 y 487–493.

> Tampoco está cubierta por RES. La bibliografía del programa remite acá al Tanenbaum *Sistemas Operativos Distribuidos* (ref. 6), que **no tenemos**.

---

## Unidad 9 — Seguridad

| Tema del programa | Tanenbaum | Pág. impresa | Pág. PDF | Apuntes |
|---|---|---|---|---|
| 9.1 Entorno de seguridad: amenazas, intrusos, pérdida de datos | 9.1 | 613–616 | **643–646** | — |
| 9.2 Autenticación por contraseñas y otros tipos | 9.4 Autenticación | 641–656 | **671–686** | — |
| 9.3 Ataques desde adentro: troyanos, falsificación de login, bombas lógicas | 9.5 Ataques desde el interior · 9.7.1 Troyanos | 656–659 · 670–672 | **686–689 · 700–702** | — |
| 9.3 Desbordamiento de buffer y ataques genéricos | 9.6 Cómo explotar los errores en el código | 659–667 | **689–697** | — |
| 9.3 Principios de diseño que proporcionan seguridad | 9.3.4–9.3.5 Sistemas confiables y TCB | 630–632 | **660–662** | — |
| 9.4 Ataques desde afuera: virus, técnicas antivirus | 9.7 Malware · 9.8.2 Antivirus | 667–692 · 695–701 | **697–722 · 725–731** | — |
| 9.5 Mecanismos de protección: ACL, dominios | 9.3.1–9.3.3 | 622–630 | **652–660** | — |
| 9.6 Sistemas de confianza, TCB, modelos formales, seguridad multinivel | 9.3.4–9.3.8 | 630–641 | **660–671** | — |
| 9.7 Caso de estudio: SELinux, AppArmor, iptables, cgroups | 10.7 La seguridad en Linux · 9.8.1 Firewalls | 803–806 · 693–695 | **833–836 · 723–725** | — |
| 9.7 Caso de estudio: seguridad en Windows, Active Directory | 11.9 (Seguridad en Windows Vista) | — | — | Buscar en el índice del cap. 11 |

**Recorte sugerido:** impresas 611–718 → **PDF 641–748**.

> Tampoco cubierta por RES.

---

## Temas del programa que NO están en el material

| Unidad | Tema | Dónde está en el programa | Comentario |
|---|---|---|---|
| 1 | Lenguajes, niveles y máquinas virtuales (Tanenbaum *Organización de Computadoras*) | 1.1 | Ref. 4, no la tenemos. Se cubre parcialmente con Tanenbaum SO 1.7.5. |
| 1 | Co-rutinas, canales de datos | 1.1 | No están en el Tanenbaum de SO. |
| 1 | Lenguaje ensamblador (definición y conceptos) | 1.1 | Lo cubren los apuntes INT, no el libro. |
| 2 | **El problema del barbero dormilón** | 2.2 | No está en la 3ª ed. del Tanenbaum (sí en ediciones anteriores y en Stallings). Lo armo yo si lo pedís. |
| 4 | Servidores de archivos: nivel de interfaz, control de concurrencia, archivos duplicados | 4.3 | Muy flojo en el Tanenbaum de SO; es tema del libro de Distribuidos (ref. 6), que no tenemos. |
| 7 | Comparación lxc vs. qemu-kvm vs. VirtualBox; Hyper-V | 7.4 | No está en el libro. Caso de estudio de la cátedra. |
| 8 | Plan 9, Amoeba | 8.5 | Ref. 6 (Distribuidos), que no tenemos. De MINIX sí hay algo. |
| 1–9 | Todos los casos de estudio de **Windows** | cierre de cada unidad | El cap. 11 del Tanenbaum (Windows Vista) los cubre, pero del índice solo extraje hasta 11.3. Si trabajamos alguno, extraigo el resto del índice. |

---

## Orden de estudio sugerido

Por lo que muestran los exámenes reales (`imagenes de examenes/`), el peso práctico está concentrado en las unidades 2, 3, 4 y 6. Propongo:

1. **U2** (planificación) y **U3** (memoria) primero: son la mitad de los puntos de todo examen práctico.
2. **U4** (FAT, i-nodos) y **U6** (banquero).
3. **U1** (llamadas al sistema, interrupciones, comandos Linux) y **U5** (disco, E/S).
4. **U7, U8, U9** al final: son más teóricas, no están en el resumen y casi no aparecen en los prácticos.

Si preferís seguir el orden del programa, lo hacemos así y listo.
