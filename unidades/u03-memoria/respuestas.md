# Respuestas — Cuestionario Unidad 3

> Solo para corregir. Los ejercicios numéricos están verificados con `_trabajo/verificar_cuestionario_u03.py` (0 fallos).

---

## Parte A — Opción múltiple

### 1. **c)**
La condición es «¿d ≥ límite?». Con límite 6000, las direcciones válidas van de **0 a 5999**; 6000 ya está afuera → **trap**. (a) es el error clásico del «uno de más»; (b) es falsa: el control se hace en **todo** acceso; (d) no existe.
*(Tanenbaum 3.2.1, págs. 179–181 · Repaso U3, pág. 4)*

### 2. **b)**
Es un **fallo suave**: la página está en RAM, solo falta la traducción en el TLB. Al desalojar una entrada del TLB, su **M viaja a la tabla de páginas**, no al disco. Al disco se escribe recién cuando la **página sale de la RAM** con M = 1. (a) confunde con fallo duro; (c) confunde salir del TLB con salir de la RAM.
*(3.3.3, págs. 194–198 · Repaso U3, págs. 10–11)*

### 3. **a)**
El de 8 KB va al **15** (el primero que alcanza; sobran 7). El siguiente ajuste **retoma donde quedó**, es decir, en el sobrante de 7 KB de ese mismo hueco, que alcanza justo para el de 7. (b) es el error de arrancar la búsqueda *después* del hueco usado. (c) y (d) mezclan con mejor ajuste.
*(3.2.3, págs. 186–187 · Repaso U3, págs. 6–7)*

### 4. **b)**
Una entrada **por marco**, con el par (proceso, página virtual), y **una sola tabla** para todo el sistema. Traducir exige **buscar** (por eso TLB + hash), y se usa en **64 bits**.
*(3.3.4, págs. 200–201 · Repaso U3, pág. 12)*

### 5. **c)**
El conjunto de trabajo es **de un proceso**: no existe un conjunto de trabajo de la máquina entera, así que WSClock solo tiene sentido como **local**. FIFO, LRU y segunda oportunidad funcionan con las dos políticas.
*(3.5.1, págs. 216–217 · Repaso U3, págs. 21–22)*

### 6. **c)**
La página sacada del conjunto de trabajo, al estar **limpia**, va a la **lista en espera** y sigue en memoria. Si se vuelve a pedir, es un **fallo suave** (transición 2 de la fig. 11-36), sin E/S. (d) es incorrecta: estaba limpia, no va a modificadas, y aunque estuviera ahí, volver al conjunto no requiere escribirla.
*(11.5.3, págs. 889–893 · Repaso U3, págs. 44–45)*

---

## Parte B — Verdadero o falso

### 7.
a) **Falso.** La tabla de páginas guarda solo lo que el **hardware** necesita para traducir (marco, P, R, M, protección, caché). La ubicación en disco la guarda el **SO** en sus propias estructuras (3.3.2; ver también el paso 6 de 3.6.2).
b) **Verdadero.** Da la vuelta completa poniendo R = 0 a todas, vuelve a la primera y la saca: el resultado es el de FIFO, y **siempre termina** (3.4.4).
c) **Falso.** PFF decide **cuántos marcos** tiene cada proceso (más si está por encima de A, menos si está por debajo de B). La víctima la sigue eligiendo el algoritmo de reemplazo (3.5.2).
d) **Verdadero.** Es la única fila de la fig. 3-33 en la que las dos dicen **Sí**; todas las demás son No/Sí (3.7, pág. 238).
e) **Falso.** La dirección en disco **no está en el descriptor**: está en otra tabla, la del **manejador de fallos de segmento** (3.7.2, pág. 239).
f) **Falso.** El texto es de **solo lectura**: se comparte siempre y **nunca** se copia por leerlo. Con COW se copia **una página** solo cuando alguien **escribe** en ella (datos o pila) (3.5.5, págs. 222–223).

---

## Parte C — Ejercicios prácticos

### 8. (10 p)
**a)** 1 KB = 2¹⁰ → 10 bits de desplazamiento; quedan 6 bits de página.
```
0x1E9C = 0001 1110 1001 1100
         000111 | 10 1001 1100
         pág 7  | desp 0x29C = 668
```
Página **7**, desplazamiento **668**; P = 0 → **fallo de página**.

**b)** Presentes ordenadas por llegada (vieja → nueva): 8 (120) → 3 (150) → 13 (180) → 4 (210) → 16 (260).

| Paso | Página (llegada) | R | Qué pasa |
|---|---|---|---|
| 1 | 8 (120) | 1 | se salva: R → 0, llegada → 300, al final |
| 2 | 3 (150) | 1 | se salva: R → 0, llegada → 300, al final |
| 3 | 13 (180) | 0 | **víctima** |

La 13 tiene **M = 1** → **se escribe al disco** antes de reusar su marco (el 2).

**c)** Filas que cambian:

| Página | Llegada | R | M | P | Marco |
|---|---|---|---|---|---|
| 3 | **300** | **0** | 0 | 1 | 12 |
| 7 | **300** | **1** | **1** | **1** | **2** |
| 8 | **300** | **0** | 1 | 1 | 9 |
| 13 | — | 0 | 0* | **0** | **—** |

La 7 entra con **M = 1** porque el acceso es una **escritura**. *La M de la 13 se puede dejar en 0 (ya se escribió) o considerarse irrelevante porque P = 0; cualquiera de las dos se acepta si se explica.

**d)** Marco 2 = `000010` → `000010 | 10 1001 1100` = `0000 1010 1001 1100` = **0x0A9C**. Control: 2 × 1024 + 668 = **2716** = 0x0A9C ✔.

**e)** Cola (vieja → nueva) después del reemplazo: 4 (210) → 16 (260) → 8 (300) → 3 (300) → 7 (300). En la notación de la cátedra (nueva → vieja):
```
7(1) → 3(0) → 8(0) → 16(1) → 4(0)
```
*(3.4.4, págs. 204–205 · método de la práctica de la cátedra · Repaso U3, págs. 15–16)*

### 9. (8 p)
**a)**
FIFO (3 marcos) — **10 fallos**:
```
1:F [1] · 3:F [1 3] · 0:F [1 3 0] · 3:✓ · 5:F sale 1 [5 3 0] · 6:F sale 3 [5 6 0] ·
3:F sale 0 [5 6 3] · 1:F sale 5 [1 6 3] · 6:✓ · 4:F sale 6 [1 4 3] · 5:F sale 3 [1 4 5] · 3:F sale 1 [3 4 5]
```
LRU (3 marcos) — **9 fallos**:
```
1:F · 3:F · 0:F · 3:✓ · 5:F sale 1 [5 3 0] · 6:F sale 0 [5 3 6] · 3:✓ · 1:F sale 5 [1 3 6] ·
6:✓ · 4:F sale 3 [1 4 6] · 5:F sale 1 [5 4 6] · 3:F sale 6 [5 4 3]
```
Óptimo (3 marcos) — **7 fallos**:
```
1:F · 3:F · 0:F · 3:✓ · 5:F sale 0 (no se vuelve a usar) [1 3 5] · 6:F sale 5 (se usa más tarde) [1 3 6] ·
3:✓ · 1:✓ · 6:✓ · 4:F sale 1 (o 6: ninguna se vuelve a usar) [4 3 6] · 5:F sale 4 (o 6) [5 3 6] · 3:✓
```
(En los empates del óptimo cualquiera de las dos da 7.)

**b)** FIFO con 4 marcos: **8 fallos**. Ningún algoritmo realizable baja del óptimo porque el óptimo saca **siempre** la página que se usa más tarde (o nunca), usando el conocimiento **del futuro**: es una **cota inferior**. Por eso solo sirve como referencia.
*(3.4.1–3.4.3 y 3.4.6 · Repaso U3, págs. 14–17)*

### 10. (6 p)
**a)** `0x0080A7F4` = `0000 0000 10 | 00 0000 1010 | 0111 1111 0100` → **TP1 = 2**, **TP2 = 10**, **desp = 0x7F4 = 2036**. TP1 = 2 → trozo de **8 MB a 12 MB**.
**b)** 2²⁰ entradas × 4 B = **4 MB** por proceso.
**c)** Una tabla superior + 1 para el texto (0–4 MB) + **2** para los datos (4–8 y 8–12 MB) + 1 para la pila (la entrada 1023) = **5 tablas** × 4 KB = **20 KB** (contra 4 MB).
*(3.3.4, págs. 198–200 · Repaso U3, pág. 12)*

### 11. (6 p)
**a)** `0x0035` = `0000000000110 | 1 | 01` → índice **6**, TI = 1 → **LDT**, nivel de privilegio **1**.
**b)** G = 1 → límite en páginas: 3 × 4096 = **12288 bytes**. 0x2F10 = 12048 < 12288 → **pasa**. 0x3010 = 12304 ≥ 12288 → **trap**.
**c)** Lineal = 0x00A00000 + 0x2F10 = **0x00A02F10**. Desp = 3 últimos hexa = **0xF10**. Los 5 primeros, `00A02` = `0000 0000 10 | 10 0000 0010` → **Dir = 2**, **Página = 0x202 = 514**.
**d)** Se pegan marco y desplazamiento: **0x01C3DF10**.
*(3.7.3, págs. 242–245 · Repaso U3, págs. 35–38)*

### 12. (3 p)
**a)** p = √(2se) = √(2 × 2²¹ × 4) = √(2²⁴) = **4096 B = 4 KB**.
**b)** Sobrecarga = s·e/p + p/2. Con 4 KB: 2048 + 2048 = **4096 B**. Con 1 KB: 8192 + 512 = **8704 B**. En el óptimo **los dos términos son iguales** (tabla = fragmentación interna).
*(3.5.3, págs. 219–220 · Repaso U3, pág. 23)*

### 13. (3 p)
- leer (2, 299): 299 < 300, R permite leer → 800 + 299 = **1099**.
- escribir (1, 2000): 2000 ≥ 2000 → **trap (fuera del segmento)**.
- ejecutar (0, 120): 120 < 500, X → 1200 + 120 = **1320**.
- escribir (2, 10): 10 < 300, pero R no permite escribir → **trap (violación de protección)**.
*(Complemento sobre 3.7: base/límite por segmento · Repaso U3, pág. 33)*

---

## Parte D — Desarrollo

### 14. (4 p)
Con página 2ⁿ, la dirección se parte en **bits altos = número de página** y **n bits bajos = desplazamiento**. La MMU **no divide ni multiplica**: corta los bits, usa los altos como índice de la tabla y **reemplaza** el número de página por el de marco, pegando el desplazamiento. Si la página no fuera potencia de 2, cada acceso necesitaría dirección ÷ tamaño y marco × tamaño + resto.
En la segmentación (y en el Pentium) un segmento puede **empezar en cualquier dirección**: la base no está alineada a una potencia de 2, así que hay que **sumarla**. Los marcos sí están alineados, por eso en paginación se pegan.
*(3.3.1 y 3.7 · Repaso U3, págs. 8–9 y 33)*

### 15. (4 p)
**a)**
| Página | Pulso 1 | Pulso 2 | Pulso 3 | Pulso 4 | Decimal |
|---|---|---|---|---|---|
| 0 | 10000000 | 01000000 | 10100000 | **01010000** | **80** |
| 1 | 00000000 | 10000000 | 11000000 | **01100000** | **96** |
| 2 | 10000000 | 11000000 | 01100000 | **10110000** | **176** |
Víctima: la **página 0** (menor valor).
**b)** NFU suma los R: 0 → 2, 1 → 2, 2 → 3. Empate entre 0 y 1: **no puede distinguirlas**. El envejecimiento sí: la 1 se usó en los pulsos 2 y 3, la 0 en los pulsos 1 y 3, así que la 0 tiene el uso **más viejo**. NFU mide **frecuencia** (cuántas veces); el envejecimiento mide **recencia** (cuándo), que es lo que aproxima a LRU.
*(3.4.7, págs. 207–209 · Repaso U3, págs. 17–20)*

### 16. (4 p)
1. **Hardware**: trap al kernel; se guarda el PC en la pila.
2. **Rutina en ensamblador**: guarda los registros y llama al SO.
3. **SO**: averigua qué página virtual se necesita.
4. **SO**: valida la dirección y la protección, y busca un marco (libre o por reemplazo).
5. **SO**: si la víctima está sucia, planifica su escritura y cambia de proceso (el proceso queda **BLOQUEADO**; el marco, ocupado).
6. **SO**: busca la dirección en disco y planifica la lectura (**DISCO** trabaja; el proceso sigue bloqueado).
7. **Interrupción de disco** → **SO** actualiza la tabla de páginas. Acá el proceso pasa de **BLOQUEADO a LISTO**.
8. **SO**: respalda la instrucción (PC al inicio).
9. **SO**: planifica el proceso y vuelve a la rutina en ensamblador.
10. **Rutina en ensamblador**: recarga los registros y vuelve a modo usuario.
*(3.6.2, págs. 228–229 · Repaso U3, págs. 28–29)*

---

## Parte E — Escenarios

### 17. (4 p)
Es **sobrepaginación (thrashing)**: los procesos pasan el tiempo paginando (`si`/`so` altos), esperan el disco (`wa` y `b` altos) y casi no hacen trabajo útil (`us` bajo).
Cambiar el algoritmo **no lo resuelve** porque la causa no es la elección de la víctima: la **suma de los conjuntos de trabajo supera la RAM**, y cualquier víctima se va a necesitar enseguida.
Solución: **control de carga**. Con **PFF** el SO ve que muchos procesos están por encima de la línea A y ninguno por debajo de B (ninguno puede ceder marcos), entonces **saca procesos enteros al disco (swapping)** y reparte sus marcos, bajando el **grado de multiprogramación** (sin bajarlo tanto que la CPU quede ociosa).
*(3.4.8, 3.5.2 y 3.5.3 · comandos de la cátedra · Repaso U3, págs. 21–23 y 40–42)*

### 18. (4 p)
El DMA escribe en la **dirección física** del marco que se le indicó al iniciar la transferencia. Si el SO le da ese marco a la página de B, el DMA sigue escribiendo ahí: **corrompe la página de B** y los datos que esperaba A **no llegan a A**. El hardware no lo evita porque el DMA **no pasa por la MMU** y no sabe que el marco cambió de dueño (U1).
Soluciones: (1) **fijar (pin) la página** en memoria mientras dura la E/S, para que el algoritmo no la elija; (2) hacer la E/S a **búferes del kernel** y copiar después al proceso.
*(3.6.4, págs. 230–231 · Repaso U3, pág. 29)*

### 19. (4 p)
- **A**: R = 0, edad 3000 − 2300 = 700 > 500, **sucia** → se **planifica su escritura** y la manecilla **avanza**.
- **B**: R = 1 → R = 0 y avanza (se usó en este intervalo: está en el conjunto de trabajo).
- **C**: R = 0, edad 400 ≤ 500 → está en el conjunto de trabajo, avanza.
- **D**: R = 0, edad 800 > 500, **limpia** → **víctima**; la nueva página entra en su marco.
A no sale porque está **sucia**: sacarla obligaría a esperar la escritura al disco. WSClock planifica la escritura y sigue buscando una vieja **limpia**, para no frenar el fallo; en una vuelta futura A va a estar limpia y podrá salir sin E/S.
*(3.4.9, págs. 213–214 · Repaso U3, pág. 18)*

---

## Parte F — Integración

### 20. (5 p)
**a)** Entre el `fork` y el `execve`, padre e hijo comparten **todas** las páginas marcadas de solo lectura. Se copia una página **solo si alguno escribe** en ella (por ejemplo, la pila del hijo antes de llamar a `execve`): una o muy pocas. Sin COW, `fork` habría copiado todo el espacio del shell para que `execve` lo tire enseguida (U2: `fork` duplica, `execve` reemplaza).
**b)** EN EJECUCIÓN → fallo (trap) → el SO planifica la lectura del disco y el proceso pasa a **BLOQUEADO** → el **planificador elige otro proceso LISTO** (cambio de contexto) → llega la interrupción de disco, se actualiza la tabla y el proceso pasa a **LISTO** → cuando el planificador lo elige, vuelve a **EN EJECUCIÓN** y reintenta la instrucción. No existe BLOQUEADO → EN EJECUCIÓN directo.
**c)** Cargar en la MMU la tabla de páginas del proceso nuevo y **vaciar (invalidar) el TLB**, porque sus entradas son traducciones del proceso anterior: si no, el nuevo proceso usaría marcos ajenos.
*(3.5.5, 3.6.1–3.6.2; U2 temas 1–2 · Repaso U3, págs. 25 y 28)*

### 21. (5 p)
**a)** Si un proceso pudiera cargar base y límite, podría poner base = 0 y límite = toda la memoria y leer o escribir lo de otros: se acabaría la protección. Por eso solo se pueden cargar en **modo kernel**; en modo usuario el hardware rechaza la instrucción privilegiada (misma regla que el bit de modo del PSW, U1).
**b)** Los anillos generalizan los dos modos de la U1: el **0 es el modo kernel** y el **3 el modo usuario** (el nivel actual está en el PSW). La **compuerta de llamada** permite pasar a un nivel más privilegiado solo por un **punto de entrada oficial**, sin poder saltar al medio del código del kernel: es la versión del Pentium del **TRAP** de una llamada al sistema.
**c)** 2048 líneas = 2¹¹ → 11 bits de línea (bits 6 a 16); 64 B = 2⁶ → 6 bits de byte. 0x00012345: byte = 0x45 & 0x3F = **5**; línea = (0x12345 >> 6) & 0x7FF = 0x48D = **1165**. En común: los dos son **un nivel chico y rápido que guarda lo más usado** de uno grande y lento (la caché, líneas de RAM; el TLB, traducciones de la tabla de páginas), y los dos funcionan gracias a la **localidad**.
*(1.3.2; 3.2.1; 3.7.3 · Repaso U3, págs. 4, 37 y 39)*
