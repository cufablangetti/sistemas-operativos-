# Inventario de `material_so/`

Fecha: 2026-10-19
Total: 10 PDF + 1 TXT + 29 imágenes.

---

## 1. El programa de la materia

| Archivo | `Programa y Planificación UTN-FRM-ISI 2026 Sistemas Operativos.pdf` |
|---|---|
| Páginas | 33 |
| Texto | Extraíble (OK) |
| Qué es | Programa analítico oficial, ciclo lectivo 2026. UTN Facultad Regional Mendoza, Ingeniería en Sistemas de Información, 2° nivel. Titular: Mag. Ing. Paula Martínez. |
| Contenido útil | **9 unidades temáticas** con sus contenidos (págs. PDF 6–11), distribución horaria, metodología, evaluación y referencias bibliográficas (pág. PDF 20). |

**Bibliografía que fija el programa (las referencias numéricas de cada unidad):**

| Nro | Autor | Título | Año | Carácter |
|---|---|---|---|---|
| 1 | TANENBAUM, Andrew | Modern Operating Systems (Pearson) | 2014 | **Principal** |
| 2 | STALLINGS, William | Sistemas Operativos. Principios de diseño | 2007 | Principal |
| 3 | CARRETERO PÉREZ y otros | Sistemas Operativos, una visión aplicada | 2021 | Complementaria |
| 4 | TANENBAUM | Organización de Computadoras | 2001 | Complementaria |
| 5 | RUSSINOVICH y SOLOMON | Windows Internals | 2009 | Complementaria |
| 6 | TANENBAUM | Sistemas Operativos Distribuidos | 1996 | Principal |
| 7 | SIEVER y otros | Linux in a Nutshell | 2009 | Complementaria |
| 8 | LOVE, Robert | Linux Kernel Development | 2010 | Complementaria |
| 9 | Apuntes de la cátedra | — | — | Complementaria |

> Todas las unidades citan la referencia 1 (Tanenbaum). Es el libro que tenemos y el eje del estudio.

---

## 2. El libro principal

| Archivo | `2-Sistemas operativos moderno 3ed Tanenbaum.pdf` |
|---|---|
| Páginas PDF | 1106 |
| Texto | Extraíble (OK, ~1500 caracteres por página) |
| Qué es | Tanenbaum, *Sistemas Operativos Modernos*, 3ª edición en español. |
| Índice general | Páginas PDF 9–28 |
| **Desfase** | **página PDF = página impresa + 30** |

El desfase se verificó en los **11 inicios de capítulo** (no solo en 3), y es constante en todo el libro:

| Cap | Título | Pág. impresa | Pág. PDF |
|---|---|---|---|
| 1 | Introducción | 1 | 31 |
| 2 | Procesos e hilos | 83 | 113 |
| 3 | Administración de memoria | 175 | 205 |
| 4 | Sistemas de archivos | 255 | 285 |
| 5 | Entrada/salida | 329 | 359 |
| 6 | Interbloqueos | 433 | 463 |
| 7 | Sistemas operativos multimedia | 467 | 497 |
| 8 | Sistemas de múltiples procesadores | 523 | 553 |
| 9 | Seguridad | 611 | 641 |
| 10 | Caso de estudio 1: Linux | 719 | 749 |
| 11 | Caso de estudio 2: Windows Vista | 813 | 843 |

---

## 3. Apuntes y archivos de la cátedra

### 3.1 `resumen so (5).pdf` — **el apunte más importante**

- 109 páginas, texto extraíble.
- Es un **resumen fiel del Tanenbaum**, capítulos 1 a 6, siguiendo la misma numeración de secciones del libro.
- Secciones que cubre: 1.1, 1.3, 1.5, 1.6, 1.7 · 2.1, 2.4, 2.5 · 3.1, 3.2, 3.3, 3.4, 3.7 · 4.1, 4.2, 4.3, 4.4 · 5.1, 5.2, 5.3, 5.4, 5.5 · 6.1, 6.2, 6.4, 6.5, 6.6.
- **No cubre**: virtualización (U7), distribuidos (U8) ni seguridad (U9).
- Sirve de atajo: donde esté, se puede leer el resumen en vez del libro, y usar el libro para profundizar.

### 3.2 `Practica SO_260728_223210 (1).pdf` — ejercicios prácticos resueltos

- 30 páginas. **Mixto**: las páginas 1–16 tienen texto extraíble; las **17 a 30 son imágenes escaneadas** (enunciados fotografiados + resolución manuscrita).
- Contenido identificado: reemplazo de páginas (segunda oportunidad, FIFO, LRU), traducción de direcciones virtuales a físicas en hexa/binario, tiempo medio de lectura/escritura en disco (rpm, latencia, transferencia, sobrecarga), FAT32 y fragmentación interna, Round Robin con diagrama de Gantt, i-nodos, ejercicio de interrupciones.

### 3.3 `Notes_260728_204823 (1).pdf` — **examen final práctica, resuelto a mano**

- 9 páginas. **Escaneado completo, sin texto extraíble.**
- Es un examen final práctica de la cátedra con la resolución manuscrita del alumno. Temas: Round Robin con q=2 y movimientos de la cola de preparados, comandos Linux (`ps -ef`, `kill -STOP`, `kill -CONT`), FAT32 (cluster final y espacio ocupado), fallos de página con 4 marcos, INT 21h (mostrar cadena, `09h`), algoritmo del banquero con diagrama de estado y análisis de estado seguro/inseguro.

### 3.4 `Notes_260729_172210 (1).pdf` — **parciales y prácticos resueltos a mano**

- 26 páginas. **Escaneado completo, sin texto extraíble.**
- Primer parcial práctica + ejercitación. Temas: fallos de página con 8 marcos, Round Robin con time slice=1 y con time slice=2 (secuencia de ejecución y cola de preparados en un instante t), SRTF, reemplazo de segunda oportunidad con tabla de páginas (bits R/M/presente, marco), condiciones de Tanenbaum para exclusión mutua, i-nodos (10 directos + indirecto simple/doble/triple, cálculo del tamaño máximo de archivo = 4 TB), banquero (estado inseguro), traducción de direcciones.

### 3.5 `Comandos_Linux-SO (1).pdf`

- 19 páginas, texto extraíble.
- Cartilla de comandos Linux con el significado de cada columna: `ps`, `ps -e`, `ps -ef`, `pstree`, `top`, `htop`, `pgrep`, `pkill`, `watch`, `pidstat`, `/proc/PID/*`, `free`, `smem`, `vmstat`, `/proc/meminfo`, `mount`, `findmnt`, `/etc/fstab`, `lsblk -f`, `dd`, `mkfs.ext4`, `df -h`, `umount`, `ln`/`ln -s`.

### 3.6 `Interrupciones (1).pdf`

- 13 páginas, texto extraíble.
- Apunte explicado de interrupciones del BIOS/DOS: lógica `INT xxh` + `AH` = función. Cubre INT 10h (video), 14h (puerto serie), 16h (teclado), 21h (servicios DOS), con ejemplos en ensamblador y "machetes".

### 3.7 `Tp5 - Tabla Interrupciones.pdf` y `Tp5 - Tabla Interrupciones-1.pdf`

- 24 páginas cada uno, texto extraíble. **Son el mismo archivo duplicado** (idéntico recuento de páginas y contenido).
- "Cartilla de Interrupciones" oficial de la UTN-FRM: tabla completa de INT 10h, 14h, 16h, 21h con AH, propósito, entradas, retorno y registros destruidos.

### 3.8 `link e info.txt`

- Link a un Google Doc de la cátedra/apunte propio (`Com`) con tablas de comandos Linux agrupados **por unidad** (Unidad 1: strace y llamadas al sistema; Unidad 2: procesos; Unidad 3: memoria; Unidad 4: sistemas de archivos).
- Además trae un machete de interrupciones (INT 10h/14h/16h/21h) y respuestas sueltas de examen.
- El contenido del Doc ya fue leído e incorporado a este inventario.

### 3.9 `imagenes de examenes/` — 29 fotos (.jpeg)

- Exámenes **reales** de la cátedra, fotografiados y en su mayoría resueltos y corregidos (con puntaje del docente).
- Identificados: *Integrador Práctica 22/11/2024* (docente Italo A. Ortiz) y *Examen final práctica 17/12/2025*.
- Temas que se repiten en los enunciados: `strace`, `ls -l /dev`, `/proc`, `pgrep`, `htop`, `free`/`smem`/`/proc/meminfo`, `lsblk -f`, `vmstat` (columna `id`), `/etc/fstab` (tamaño de bloque ext4); traducción de direcciones virtuales con marcos de 1 KB y 4 KB; reemplazo por **segunda oportunidad** con tabla de páginas; Round Robin con time slice 1 y 2; **SJN**; fallos de página; FAT; i-nodos; banquero; INT 21h.
- **Son la mejor guía de qué se toma.** Formato típico: 5–7 consignas, 60 minutos, se aprueba con 60 puntos.

---

## Archivos escaneados — hace falta OCR

Estos tres no tienen texto extraíble, así que hoy solo se pueden leer como imagen:

| Archivo | Páginas sin texto |
|---|---|
| `Notes_260728_204823 (1).pdf` | 9 de 9 |
| `Notes_260729_172210 (1).pdf` | 26 de 26 |
| `Practica SO_260728_223210 (1).pdf` | 14 de 30 (págs. 17–30) |

Son manuscritos sobre papel cuadriculado y fotos con fondo, así que **el OCR va a rendir poco** sobre la letra a mano. Para estos conviene leerlos página por página como imagen, que es lo que se hizo acá.

Si igual querés intentar el OCR, en Windows:

```powershell
winget install UB-Mannheim.TesseractOCR
pip install ocrmypdf
# y después, sobre una COPIA (nunca sobre el original):
ocrmypdf -l spa --force-ocr "copia.pdf" "copia_ocr.pdf"
```

## Herramientas disponibles en esta máquina

| Herramienta | Estado |
|---|---|
| Python 3.14.3 | Instalado |
| **PyMuPDF 2.0** | **Instalado en esta sesión** (`pip install pymupdf`) — con esto alcanza para extraer texto y recortar páginas |
| Node.js | Instalado (para verificar algoritmos) |
| `pdftotext`, `qpdf` | **No instalados** — no hacen falta, los reemplaza PyMuPDF |
| `ocrmypdf`, `tesseract` | No instalados |

Scripts propios ya creados en `_trabajo/`: `extraer.py` (PDF → txt), `render.py` (PDF → PNG), `calibrar.py` (desfase de páginas), `inspeccionar.py` (diagnóstico de PDFs).
