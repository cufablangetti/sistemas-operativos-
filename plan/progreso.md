# Progreso — Sistemas Operativos

Última actualización: 2026-10-19

## Estado de las fases

| Fase | Estado |
|---|---|
| 0 — Inventario | ✅ Hecho (`plan/inventario.md`) |
| 1 — Mapa de unidades | ✅ Hecho y **aprobado** (`plan/mapa_unidades.md`) |

**Decisiones tomadas:**

- Se estudia **en el orden del programa**, de la Unidad 1 a la 9.
- Los temas del programa que no están en el material se completan con desarrollo propio, citando la bibliografía del programa (Stallings, Carretero, Tanenbaum *Organización de Computadoras*, Windows Internals) y **marcados siempre como complemento elaborado**, para que se distingan de lo que sale del libro.

## Estado por unidad

| # | Unidad | Preparada (F2) | Clase (F3) | Cuestionario (F4) | Nota (F5) | Temas débiles |
|---|---|---|---|---|---|---|
| 1 | Introducción, hardware y estructura de los SO | ✅ | — | — | — | — |
| 2 | Procesos, hilos, concurrencia y planificación | — | — | — | — | — |
| 3 | Administración de memoria | — | — | — | — | — |
| 4 | Sistemas de archivos | — | — | — | — | — |
| 5 | Entrada/salida | — | — | — | — | — |
| 6 | Interbloqueos | — | — | — | — | — |
| 7 | Virtualización | — | — | — | — | — |
| 8 | Sistemas distribuidos y tiempo real | — | — | — | — | — |
| 9 | Seguridad | — | — | — | — | — |

## Bitácora

- **2026-10-19** — Inventario completo de `material_so/`. Se instaló PyMuPDF (no había `pdftotext` ni `qpdf`). Se calculó y verificó el desfase del Tanenbaum (**PDF = impresa + 30**) en los 11 inicios de capítulo. Se leyó el Google Doc del link. Se identificaron 3 PDF escaneados (manuscritos) y 29 fotos de exámenes reales. Mapa de las 9 unidades armado.

- **2026-10-19** — Fase 2 de la Unidad 1. Recorte del libro (impresas 1–80 y 332–349, verificado en los dos extremos), apuntes copiados a `fuentes/`, texto extraído a `_trabajo/`, y generados `notebooklm_u01.md` (12.900 palabras) y `prompt_video.txt` (255 palabras). Los cinco ejemplos numéricos se verificaron con `_trabajo/verificar_u01.py`.

- **2026-10-21** — Clase de la Unidad 1 en el chat: temas 1 a 8 de 9 dados (se agregó el tema de ensamblador e interrupciones, que faltaba en el mapa original). Tres visualizaciones creadas: las tres formas de E/S, el arranque paso a paso y el simulador de interrupciones del 8086. Se creó `plan/continuidad.md` para poder alternar entre dos computadoras.

## Cronograma

Rinde la **primera semana de diciembre de 2026**. Hay 42 dias desde el 19 de octubre. La materia necesita unos 34 dias de trabajo (29 de unidades + 5 de repaso), asi que hay **8 dias de colchon**. Detalle en `plan/cronograma.md`.

## Pendientes

- Subir la Unidad 1 a NotebookLM y generar el video.
- Dar la clase de la Unidad 1 en el chat ("enseñame la unidad 1").
- Si hiciera falta, instalar `tesseract` + `ocrmypdf` para los escaneados (rinde poco sobre manuscrito).
