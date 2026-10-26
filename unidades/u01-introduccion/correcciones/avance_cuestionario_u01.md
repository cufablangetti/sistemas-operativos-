# Cuestionario Unidad 1 — avance parcial

**Estado: PENDIENTE.** Se respondieron las partes A y B el 2026-10-23. Las partes C, D, E y F quedaron sin hacer.

## Puntaje hasta ahora: 23 / 28

| Parte | Puntos | Obtenidos |
|---|---|---|
| A — Opción múltiple | 18 | **18** |
| B — Verdadero/falso | 10 | **5** |
| C — Ejercicios prácticos | 34 | pendiente |
| D — Desarrollo | 13 | pendiente |
| E — Escenarios | 13 | pendiente |
| F — Integración | 12 | pendiente |

## Detalle

### Parte A — 18/18

Las seis correctas: 1b, 2c, 3c, 4c, 5b, 6b. Incluidas las que tenían los distractores más fuertes
(el DMA que supuestamente "acelera", el TRAP invertido, y la mezcla de la 09h de DOS con los parámetros
de la 13h de INT 10h).

### Parte B — 5/10

| Ítem | Respuesta | Puntos | Comentario |
|---|---|---|---|
| a | Falso | 1,5 / 2 | Correcto, pero no identificó **qué** se multiplexa de cada forma: la superficie en espacio, el brazo en tiempo. |
| b | Verdadero | **0 / 2** | **Es FALSO.** En la estructura por capas todo sigue corriendo en modo kernel: un driver que falla tumba el sistema igual que en la monolítica. Las capas dan claridad para depurar, no aislamiento. **Ya había fallado este concepto durante la clase.** |
| c | Falso | 2 / 2 | Perfecto: muestra la cadena y después basura. |
| d | Falso | 1,5 / 2 | La idea central está (el BIOS no lee archivos), pero confundió **la CMOS** (que guarda la lista de dispositivos de arranque) con **el sector 0** (donde están los 446 bytes de código). |
| e | Verdadero | **0 / 2** | **Es FALSO.** Se leen exactamente los mismos datos del disco; lo que se reduce es la cantidad de **llamadas al sistema**. |

## Diagnóstico parcial

Los dos ceros son del mismo tipo de error: **confundir "estar ordenado" o "ser más grande" con "funcionar distinto"**.
En b), ordenar en capas no protege. En e), un buffer más grande no cambia los datos que hay que leer.

**Temas a reforzar cuando retome:**

1. **Estructuras de SO** — que en capas *todo sigue en modo kernel*. Usar `visuales/estructuras_de_so.html`
   y hacerle apretar el botón de falla en la pestaña "Por capas".
2. **Buffers y llamadas al sistema** — lo que se ahorra es trabajo de kernel, no lectura de disco.
3. **La cadena de arranque** — distinguir CMOS (lista de dispositivos) de sector 0 (el código).

## Cómo retomarlo

El cuestionario completo está en `unidades/u01-introduccion/cuestionario.md`.
Decir **"parte C"**, **"parte D"**, **"parte E"** o **"parte F"** para seguir desde donde se quiera; no hace falta ir en orden.
La guía de corrección está en `unidades/u01-introduccion/respuestas.md` (**no mostrársela al estudiante**).
