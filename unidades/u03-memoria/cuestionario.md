# Cuestionario — Unidad 3

**Sistemas Operativos — UTN FRM**
Administración de memoria

---

**Total: 100 puntos. Se aprueba con 60.**
**Tiempo sugerido: 120 minutos.**

En las preguntas de opción múltiple hay **una sola** respuesta correcta, salvo que se indique lo contrario.
En las de verdadero o falso, **una respuesta sin justificar no suma puntos**.
En los ejercicios numéricos, **mostrá el procedimiento**: el resultado solo vale la mitad.
Convención de la cátedra para la segunda oportunidad: la **cola final** se escribe **de la página más nueva (izquierda) a la más vieja (derecha)**, con el bit R de cada una entre paréntesis.

---

## Parte A — Opción múltiple (18 puntos)

### 1. (3 p)
Un proceso se ejecuta con **base = 20000** y **límite = 6000**. Ejecuta `MOV REG, [6000]`. ¿Qué pasa?

a) Se accede a la dirección física 26000, porque 6000 + 20000 = 26000.
b) Se accede a la dirección física 6000, porque el límite solo se controla en escrituras.
c) Se produce un trap, porque 6000 no es menor que el límite.
d) Se accede a la dirección física 25999, porque el hardware ajusta la última dirección válida.

### 2. (3 p)
Con un TLB administrado por hardware, un proceso accede a una página que **está en RAM** pero **no está en el TLB**, y el TLB está lleno. ¿Qué describe correctamente lo que ocurre?

a) Fallo duro: se trae la página del disco y la entrada desalojada del TLB se escribe al disco si tenía M = 1.
b) Fallo suave: se carga la entrada desde la tabla de páginas y el bit M de la entrada desalojada se copia a la tabla de páginas.
c) Fallo suave: se carga la entrada desde la tabla de páginas y la página de la entrada desalojada se escribe al disco si tenía M = 1.
d) Fallo de protección: el TLB no puede cargar una página que no tenía.

### 3. (3 p)
Huecos libres en orden de dirección: **15, 6, 22, 9, 30 KB**. Llega un pedido de **8 KB** y después uno de **7 KB**. ¿En qué huecos quedan los dos pedidos con **siguiente ajuste**?

a) 15 y 15 (el sobrante del primero).
b) 15 y 22.
c) 9 y 22.
d) 15 y 9.

### 4. (3 p)
Sobre la tabla de páginas invertida, ¿cuál afirmación es correcta?

a) Tiene una entrada por página virtual de cada proceso, y cada proceso tiene la suya.
b) Tiene una entrada por marco físico y guarda el par (proceso, página virtual); hay una sola en todo el sistema.
c) Traducir es inmediato porque se indexa por número de página virtual.
d) Se usa en 32 bits porque ocupa menos que una tabla de dos niveles.

### 5. (3 p)
¿Cuál de estos algoritmos **solo tiene sentido con una política de reemplazo local**?

a) FIFO.
b) LRU.
c) WSClock.
d) Segunda oportunidad.

### 6. (3 p)
En Windows, el administrador del conjunto de trabajo le sacó a un proceso una página **limpia** hace un segundo. El proceso la vuelve a usar. ¿Qué ocurre?

a) Un fallo duro: la página se lee del archivo de paginación.
b) Una violación de acceso, porque la página ya no pertenece al conjunto de trabajo.
c) Un fallo suave: la página se saca de la lista en espera y vuelve al conjunto de trabajo sin E/S.
d) Un fallo suave: la página se saca de la lista de modificadas y se escribe al disco antes de devolverla.

---

## Parte B — Verdadero o falso justificado (12 puntos)

### 7. (2 p cada ítem)
a) La dirección del disco donde está guardada una página figura en su entrada de la tabla de páginas.
b) Si todas las páginas tienen R = 1, la segunda oportunidad degenera en FIFO.
c) El algoritmo PFF decide qué página se reemplaza cuando hay un fallo.
d) Según la fig. 3-33, la paginación y la segmentación coinciden en que el espacio total puede exceder la memoria física.
e) En MULTICS, la dirección en disco de un segmento está en su descriptor de segmento.
f) Con copia en escritura, después de un `fork` las páginas de texto se copian la primera vez que el hijo las lee.

---

## Parte C — Ejercicios prácticos (36 puntos)

### 8. (10 p) Traducción y segunda oportunidad
Páginas de **1 KB**, direcciones virtuales de **16 bits**. En el instante **300** el proceso **escribe** en la dirección **0x1E9C**. La tabla de páginas es:

| Página | Llegada | R | M | P | Marco |
|---|---|---|---|---|---|
| 3 | 150 | 1 | 0 | 1 | 12 |
| 4 | 210 | 0 | 0 | 1 | 5 |
| 7 | — | 0 | 0 | 0 | — |
| 8 | 120 | 1 | 1 | 1 | 9 |
| 13 | 180 | 0 | 1 | 1 | 2 |
| 16 | 260 | 1 | 0 | 1 | 14 |

a) ¿Qué página y qué desplazamiento referencia? ¿Hay fallo de página? (2 p)
b) Aplicá **segunda oportunidad**: mostrá cada página que se inspecciona, qué se hace con ella y cuál es la víctima. ¿Hay que escribir algo al disco? (3 p)
c) Escribí la tabla de páginas modificada (todas las filas que cambian). (2 p)
d) Dirección física en hexa, con el control en decimal. (2 p)
e) Cola final en la notación de la cátedra. (1 p)

### 9. (8 p) Conteo de fallos
Cadena de referencias: **1 3 0 3 5 6 3 1 6 4 5 3**, con **3 marcos** inicialmente vacíos.

a) Cantidad de fallos con **FIFO**, **LRU** y **óptimo**. Mostrá el contenido de los marcos en cada paso. (6 p)
b) ¿Cuántos fallos da **FIFO con 4 marcos**? ¿Por qué ningún algoritmo realizable puede tener menos fallos que el óptimo? (2 p)

### 10. (6 p) Tablas multinivel
Máquina de 32 bits, páginas de 4 KB, entradas de 4 bytes, tabla de dos niveles **10 | 10 | 12**.

a) Dividí la dirección **0x0080A7F4**: TP1, TP2 y desplazamiento. ¿Qué trozo de 4 MB toca? (2 p)
b) ¿Cuánto ocupa la tabla de páginas de **un solo nivel** para un proceso? (1 p)
c) Un proceso usa **4 MB de texto** desde la dirección 0, **8 MB de datos** a continuación (desde los 4 MB) y **4 MB de pila** en los 4 MB más altos. ¿Cuántas tablas hacen falta con el esquema de dos niveles y cuánto ocupan en total? (3 p)

### 11. (6 p) Pentium
Un programa usa el selector **0x0035** con paginación habilitada. El descriptor correspondiente tiene Base = **0x00A00000**, Límite = **0x00003**, **G = 1**, P = 1.

a) Índice, tabla (LDT o GDT) y nivel de privilegio del selector. (1 p)
b) Tamaño del segmento. ¿Pasan el chequeo de límite los desplazamientos **0x2F10** y **0x3010**? (2 p)
c) Para el desplazamiento **0x2F10**: dirección lineal, y sus campos Dir, Página y Desp. (2 p)
d) Si la entrada de la tabla de páginas apunta al marco **0x01C3D**, ¿cuál es la dirección física? (1 p)

### 12. (3 p) Tamaño de página
El tamaño promedio de un proceso es **s = 2 MB** y cada entrada de la tabla ocupa **e = 4 bytes**.

a) Calculá el tamaño de página óptimo. (1 p)
b) Calculá la sobrecarga con ese tamaño y con páginas de **1 KB**. ¿Qué propiedad cumple el óptimo? (2 p)

### 13. (3 p) Segmentación
Tabla de segmentos de un proceso:

| Seg | Base | Límite | Protección |
|---|---|---|---|
| 0 | 1200 | 500 | X |
| 1 | 3000 | 2000 | RW |
| 2 | 800 | 300 | R |

Para cada acceso, dirección física o qué falla: **leer (2, 299)** · **escribir (1, 2000)** · **ejecutar (0, 120)** · **escribir (2, 10)**.

---

## Parte D — Desarrollo (12 puntos)

### 14. (4 p)
Explicá por qué el tamaño de página es siempre una potencia de 2 y qué operación se ahorra la MMU gracias a eso. Después explicá por qué en la segmentación (y en el Pentium, para la dirección lineal) la base **se suma** en lugar de **pegarse**.

### 15. (4 p)
Tres páginas con contadores de envejecimiento de **8 bits** que arrancan en 0. En cuatro pulsos de reloj, los bits R (página 0, página 1, página 2) fueron:

| Pulso | R₀ | R₁ | R₂ |
|---|---|---|---|
| 1 | 1 | 0 | 1 |
| 2 | 0 | 1 | 1 |
| 3 | 1 | 1 | 0 |
| 4 | 0 | 0 | 1 |

a) Valor de cada contador (en binario y en decimal) después del pulso 4, y víctima. (2 p)
b) ¿Qué víctima elegiría NFU? ¿Qué muestra este ejemplo sobre lo que mide cada algoritmo? (2 p)

### 16. (4 p)
Estos son los pasos del manejo de un fallo de página, **desordenados**. Ordenalos, decí **quién** ejecuta cada uno (hardware, rutina en ensamblador, SO, disco) y en qué paso el proceso pasa de BLOQUEADO a LISTO.

- Se respalda la instrucción: el PC vuelve a apuntar al inicio de la instrucción que falló.
- Se busca la dirección en disco de la página y se planifica su lectura.
- Se averigua qué página virtual se necesita.
- Trap al kernel; se guarda el contador de programa en la pila.
- Llega la interrupción de disco y se actualiza la tabla de páginas.
- Se recargan los registros y se vuelve a modo usuario.
- Se guardan los registros y se llama al SO.
- Si la víctima está sucia, se planifica su escritura y se cambia de proceso.
- Se valida la dirección y la protección, y se busca un marco (libre o por reemplazo).
- Se planifica el proceso y se vuelve a la rutina que llamó al SO.

---

## Parte E — Escenarios (12 puntos)

### 17. (4 p)
Un servidor anda lentísimo. `vmstat 1` muestra durante varios minutos `si` y `so` altos, `wa` alto, `us` muy bajo, y `r` bajo con `b` alto. El administrador propone **cambiar el algoritmo de reemplazo de FIFO a LRU** para que "elija mejores víctimas". ¿Qué fenómeno es? ¿Por qué la propuesta no lo resuelve? ¿Qué haría el SO (y con qué información) para resolverlo?

### 18. (4 p)
El proceso A inicia una lectura por **DMA** hacia un búfer que está en su página 12. Mientras la transferencia está en curso, el proceso B produce un fallo de página y el algoritmo de reemplazo elige como víctima justo el marco de la página 12 de A. ¿Qué sale mal y por qué el hardware no lo evita? Proponé dos formas de resolverlo.

### 19. (4 p)
WSClock con **τ = 500** y tiempo virtual actual **3000**. La manecilla apunta a A y recorre A → B → C → D:

| Página | Último uso | R | M |
|---|---|---|---|
| A | 2300 | 0 | 1 |
| B | 2900 | 1 | 0 |
| C | 2600 | 0 | 0 |
| D | 2200 | 0 | 0 |

¿Qué pasa con cada página por la que pasa la manecilla? ¿Cuál es la víctima? ¿Por qué A no sale, si es vieja y no se usó?

---

## Parte F — Integración (10 puntos)

### 20. (5 p) Unidades 2 y 3
Un shell ejecuta `fork()` y el hijo hace `execve("ls")` enseguida. El sistema usa copia en escritura.

a) ¿Qué páginas se copian entre el `fork` y el `execve`, y por qué copia en escritura ahorra trabajo en este caso? (2 p)
b) Durante la ejecución de `ls`, ocurre un fallo de página que requiere leer del disco. Recorré los **estados del proceso** (U2) desde el fallo hasta que vuelve a ejecutar, y decí qué hace el planificador mientras tanto. (2 p)
c) Cuando el planificador cambia de proceso, ¿qué tiene que hacer el SO con la MMU y el TLB, y por qué? (1 p)

### 21. (5 p) Unidades 1 y 3
a) ¿Por qué cargar los registros base y límite tiene que ser una instrucción **privilegiada**? Relacionalo con el modo kernel/usuario de la U1. (1 p)
b) En el Pentium, ¿qué relación hay entre los **anillos de protección** y los modos de la U1? ¿Para qué sirve una **compuerta de llamada** y con qué mecanismo de la U1 se corresponde? (2 p)
c) Una caché tiene **2048 líneas de 64 bytes** y las direcciones son de 32 bits. ¿En qué línea y en qué byte de la línea cae la dirección **0x00012345**? ¿Qué tienen en común la caché y el TLB? (2 p)
