# Respuestas — Cuestionario Unidad 2

> **NO MOSTRAR AL ESTUDIANTE** salvo que lo pida explícitamente.
> Los ejercicios numéricos están verificados con `_trabajo/verificar_cuestionario_u02.js` (planificación, con el mismo motor del simulador) y `_trabajo/verificar_cuestionario_u02.py` (fork, carrera, lotería y tiempo real).

Total: 100 puntos.

---

## Parte A — Opción múltiple (18 p)

### 1. (3 p) → **b)**
Al agotar el quantum, el proceso **puede seguir ejecutando**: no espera ningún evento, solo le falta la CPU. Pasa a **Listo** y va al final de la cola.
- **a) y c)** son el error que ya cometió ("se va a dormir"). Bloqueado es solo para quien espera un evento externo (E/S, semáforo, mensaje).
- **d)** Si no hay otros, sigue en Ejecución, pero si los hay no pasa a Bloqueado.

*(Tanenbaum, cap. 2.1.5, pág. 90; cap. 2.4.3, pág. 154)*

### 2. (3 p) → **c)**
El kernel no conoce los hilos de usuario: ve **un solo proceso**. Un `read` bloqueante bloquea el proceso entero, con los 4 hilos. Es la desventaja principal de los hilos de usuario. La solución es `select` (jacket o wrapper) o pasar a hilos de kernel.
- **a)** Sería cierto solo si la biblioteca envolviera la llamada con `select` y no la hiciera bloqueante.
- **b)** Confunde con hilos de kernel.
- **d)** Falso: `read` es una llamada al sistema, con TRAP.

*(Tanenbaum, cap. 2.2.4, págs. 106–108)*

### 3. (3 p) → **c)**
Peterson garantiza exclusión mutua solo por software, sin instrucciones especiales, pero el que espera **gira en un `while`**. Por eso es espera ocupada y sufre inversión de prioridades (el mismo problema que TSL).
- **a)** Falso: es espera ocupada.
- **b)** Falso: sin `turno` puede haber interbloqueo, porque los dos quedan interesados y esperan.
- **d)** Falso: es la ventaja de Peterson. TSL y XCHG son la solución por hardware.

*(Tanenbaum, cap. 2.3.3, págs. 123–125)*

### 4. (3 p) → **b)**
Las variables de condición **no son contadores**: un `signal` sin nadie esperando se pierde. Por eso el `signal` va condicionado (`if (cuenta == 1) signal(vacio)`), al revés de lo que pasa con el `up` del semáforo, que se acumula. Esta es la asimetría `up`/`signal` que tuvo invertida.
- **a) y c)** describen un semáforo.
- **d)** No es un error.

*(Tanenbaum, cap. 2.3.7, págs. 134–140)*

### 5. (3 p) → **b)**
La lotería es **probabilística**: a largo plazo, la fracción tiende a la proporción de boletos, pero en un intervalo corto no hay garantía.
- **a)** Error ya cometido: boletos ≠ porcentaje exacto.
- **c)** Si termina el de 10 boletos, quedan 90 boletos. El de 60 pasa a 60/90 ≈ 67 %.
- **d)** Los boletos no son prioridad estricta: el de menos boletos también puede ganar.

*(Tanenbaum, cap. 2.4.3, págs. 159–160)*

### 6. (3 p) → **b)**
Es la **afinidad de caché** (Vaswani y Zahorjan). La CPU donde ejecutó el hilo todavía puede tener sus bloques en caché. En otra CPU, el hilo arranca con la caché "fría".
- **a)** El BCP se carga igual en cualquier CPU.
- **c)** Falso en SMP: todas comparten la memoria.
- **d)** Eso describe el candado global del kernel, que no tiene que ver con la afinidad.

*(Tanenbaum, cap. 8.1.4, págs. 542–548)*

---

## Parte B — Verdadero o falso (12 p, 2 p por ítem)

**a) FALSO.** Un proceso bloqueado sale de la cola de listos y espera en la cola del semáforo. El planificador no lo elige, así que **no consume CPU**. Consumir CPU mientras se espera es lo que hace la espera ocupada. *(2.3.5, pág. 128)*

**b) FALSO.** Se produce un **interbloqueo**. Si el búfer está lleno, el productor toma el `mutex` y se bloquea en `vacias`. El consumidor nunca puede entrar a sacar elementos, porque el `mutex` lo tiene el productor dormido. No es "más lento": se cuelga para siempre. *(2.3.6, págs. 130–131)*

**c) FALSO.** `send` y `receive` son llamadas al sistema y sirven igual en una misma máquina, entre procesos o entre hilos. Su ventaja es que **no necesitan memoria compartida**, por eso **también** sirven entre máquinas. Error ya cometido en la clase. *(2.3.8, pág. 140)*

**d) FALSO.** SJF es óptimo **solo si todos los procesos están disponibles al mismo tiempo**. Si llegan en momentos distintos, puede no serlo. Contraejemplo del libro: A=2 y B=4 llegan en 0; C, D y E (1 cada uno) llegan en 3. SJF da A, B, C, D, E: retorno promedio 4,6 (espera 2,8). El orden B, C, D, E, A da retorno 4,4 (espera 2,6). El libro lo da con el retorno. *(2.4.2, págs. 152–153)*

**e) FALSO.** Es verdad que con bloqueo no se da el cuelgue de la espera ocupada: H se bloquea, entonces L ejecuta y libera. Pero con un tercer proceso **M de prioridad media** que siempre esté listo, L nunca ejecuta y H espera indefinidamente: la inversión sigue existiendo. La solución es la **herencia de prioridades**. El caso Mars Pathfinder se vio en clase como complemento, fuera del libro.

**f) FALSO.** Las otras copias se **invalidan**, no se actualizan. La próxima lectura trae el bloque de nuevo. Error ya cometido. *(8.1.1, págs. 527–528)*

---

## Parte C — Ejercicios prácticos (36 p)

Datos: A(0,5,p3), B(1,3,p1), C(2,1,p4), D(4,4,p2), E(6,2,p1).

### 8. (10 p) Round Robin, q = 2

**a) Gantt (4 p)**
```
| A | B | C | A | D | B | E | A | D |
0   2   4   5   7   9  10  12  13  15
```

Traza con la regla de la cátedra (se encola primero el que llega):
- t=0: A ejecuta.
- t=1: llega B → cola [B].
- t=2: llega C y A termina su quantum. Se encola C y después A: [B, C, A]. Ejecuta B → cola [C, A].
- t=4: llega D y B termina su quantum (le queda 1): [C, A, D, B]. Ejecuta C.
- t=5: C termina. Ejecuta A → cola [D, B].
- t=6: llega E → [D, B, E].
- t=7: A termina su quantum (le queda 1): [D, B, E, A]. Ejecuta D.
- t=9: D termina su quantum (le quedan 2): [B, E, A, D]. Ejecuta B y termina en 10.
- t=10: ejecuta E y termina en 12. t=12: ejecuta A y termina en 13. t=13: ejecuta D y termina en 15.

**b) Cola de listos (2 p)**
- **t = 3**: CPU = **B**, cola = **[C, A]**.
- **t = 7**: CPU = **D**, cola = **[B, E, A]**. A quedó último porque terminó su quantum en t=7.

**c) Tiempos (4 p)**

| Proceso | Fin | Retorno | Espera | Respuesta |
|---|---|---|---|---|
| A | 13 | 13 | 8 | 0 |
| B | 10 | 9 | 6 | 1 |
| C | 5 | 3 | 2 | 2 |
| D | 15 | 11 | 7 | 3 |
| E | 12 | 6 | 4 | 4 |
| **Promedio** | | **8,40** | **5,40** | **2,00** |

Errores típicos: en t=2, poner A antes que C (viola el desempate), y confundir la respuesta (primer arranque − llegada) con la espera.

### 9. (8 p) SJF y SRTF

**SJF (3 p)**
```
| A | C | E | B | D |
0   5   6   8  11  15
```
En t=0 solo está A, y es no apropiativo, así que corre hasta 5. En t=5 están B(3), C(1) y D(4): elige C. En t=6 llega E(2), y E es la más corta entre B(3), D(4) y E(2). Siguen B y después D.

Esperas: A 0, B 7, C 3, D 7, E 0 → **promedio 3,40**. (Retorno promedio: 6,40.)

**SRTF (3 p)**
```
| A | B | C | B | A | E | A | D |
0   1   2   3   5   6   8  11  15
```
- t=1: llega B(3) < A restante (4) → desaloja.
- t=2: llega C(1) < B restante (2) → desaloja.
- t=3: C termina. B(2), A(4) → B.
- t=5: B termina. Quedan A(4) y D(4).
- t=6: llega E(2) < A restante (3) → desaloja. E termina en 8; A termina en 11; D termina en 15.

Esperas: A 6, B 1, C 0, D 7, E 0 → **promedio 2,80**. (Retorno 5,80; respuesta 1,40.)

**c) (2 p)** En t=5 hay **empate**: A y D tienen 4 de tiempo restante. Se desempata por orden de llegada a la cola (FIFO): A está en la cola desde t=1 y D desde t=4, así que gana **A**. Si elige D, también vale, siempre que lo declare y sea coherente. Cambia el Gantt, no el criterio.

### 10. (5 p) Prioridades apropiativas
```
| A | B | D | E | D | A | C |
0   1   4   6   8  10  14  15
```
- t=1: llega B (p1) y desaloja a A (p3).
- t=4: B termina; D (p2) gana sobre A (p3).
- t=6: llega E (p1) y desaloja a D (p2).
- t=8: vuelve D. t=10: vuelve A. t=14: entra C.

Retornos: A 14, B 3, C 13, D 6, E 2 → **promedio 7,60**.

**C** sufre más: espera 12 de sus 13 unidades por tener la peor prioridad. Es la **inanición**. La solución es el **envejecimiento**: subir la prioridad con el tiempo de espera, o bajar la del que ejecuta en cada tic. Otra opción es usar clases de prioridad con Round Robin dentro de cada una. *(2.4.3, págs. 155–156)*

### 11. (5 p) `fork`

**Programa 1 → 6 "X" (2,5 p).**
- El primer `fork()` deja 2 procesos: P y H1.
- Cada uno hace el segundo `fork()`. El padre recibe un valor distinto de 0 y no entra al `if`. El hijo recibe 0 y hace un `fork()` más. Así, cada uno de los 2 procesos se convierte en 3: el padre, su hijo y su nieto.
- Total: 2 × 3 = **6 procesos**, y cada uno imprime una vez.

```
P ── H1 ── (H1b ── H1b')
│
├── Pb ── Pb'
```

**Programa 2 → 7 "H" y 8 procesos (2,5 p).**
Los hijos **no terminan**: siguen el bucle desde el i siguiente. En cada vuelta se duplican los procesos (1 → 2 → 4 → 8), así que hay **2³ = 8 procesos**.
Imprime solo quien acaba de nacer: 1 + 2 + 4 = **7 "H"**. Solo el original no imprime nunca.

Error típico: contar 3 "H" (pensar que solo el original hace los `fork`) o 8 (contar al original).

### 12. (4 p) Condición de carrera
Valores posibles: **2, 3 y 4**. Se verificó con todos los entrelazados posibles.

Entrelazado que da **2** (2 p):
1. Hilo A carga x=0.
2. Hilo B hace su primera vuelta completa (x=1) y carga x=1 para su segunda vuelta.
3. A guarda 1 → x=1. A hace su segunda vuelta: carga 1 y guarda 2 → x=2.
4. B guarda su registro (1+1=2) → **x=2**.

Cada hilo pisa el trabajo del otro: se pierden dos incrementos. El patrón es **leer → modificar → escribir** sin exclusión mutua. El 4 sale si las operaciones no se mezclan, y el 3 si se pierde una sola. *(2.3.1, págs. 117–119)*

### 13. (4 p)

**a) (2 p)** Mientras C está bloqueado **no participa de los sorteos**. Solo compiten A (20 + 10 = 30 boletos) y B (30 boletos): **A ½ y B ½**, y C recibe 0.

Distractor: calcular sobre 100 boletos (A 30 %, B 30 %, C 40 %). Los boletos de un proceso bloqueado no cuentan.

**b) (2 p)** Condición de planificabilidad: la suma de Cᵢ / Pᵢ tiene que ser ≤ 1.
10/40 + 30/100 + 50/200 = 0,25 + 0,30 + 0,25 = 0,80.
Queda 0,20 → C₄ / 500 ≤ 0,20 → **C₄ ≤ 100 ms**.

*(2.4.3, págs. 159–160; 2.4.4, págs. 160–161)*

---

## Parte D — Desarrollo (12 p)

### 14. (4 p)

| | Hilos de usuario | Hilos de kernel |
|---|---|---|
| Conmutación | Muy rápida: sin TRAP, sin cambio de modo, procedimiento local | Más cara: llamada al sistema |
| Llamada bloqueante | Bloquea todo el proceso | Bloquea solo ese hilo |
| Fallo de página | Bloquea todo el proceso | Solo el hilo afectado |
| Varias CPU | No: el kernel ve un proceso | Sí |
| Planificación propia | Sí, cada proceso tiene su algoritmo | La decide el kernel |

Además, en los hilos de usuario, si un hilo no cede la CPU con `thread_yield`, los demás del proceso no corren, porque no hay interrupciones de reloj dentro del proceso.

**Híbrida:** multiplexa varios hilos de usuario sobre algunos hilos de kernel. Busca la conmutación barata de los primeros con el bloqueo selectivo y el paralelismo de los segundos. Las activaciones del planificador lo hacen con llamadas ascendentes (upcalls). *(2.2.4–2.2.6, págs. 106–111)*

### 15. (4 p)
- **Señal perdida:** el consumidor lee `cuenta == 0`, y **antes de que se duerma** el planificador pasa al productor. El productor inserta, ve `cuenta == 1` y hace `wakeup` a alguien que todavía no duerme: la señal se pierde. El consumidor se duerme con un valor viejo, el productor llena el búfer y se duerme también. Los dos quedan dormidos para siempre. (1,5 p)
- **Semáforos:** el semáforo **guarda** los despertares pendientes en su valor. Un `up` sin nadie esperando no se pierde: el próximo `down` lo consume. (1 p)
- **Atomicidad:** comprobar el valor, modificarlo y dormirse tiene que ser **una sola acción indivisible**. Si no, se vuelve a la ventana de la señal perdida. En un monoprocesador se logra deshabilitando las interrupciones durante las pocas instrucciones del `down` o el `up`. En un multiprocesador eso no alcanza, porque solo afecta a una CPU: se protege con un candado con TSL o XCHG. Esa espera ocupada es aceptable porque dura muy poco. (1,5 p)

*(2.3.4–2.3.5, págs. 125–130)*

### 16. (4 p)
- **Interbloqueo:** si los 5 toman el izquierdo a la vez, todos esperan el derecho. Hay espera circular. (1 p)
- **Espera al azar:** baja la probabilidad del problema, pero no lo elimina, y se pierde tiempo. No sirve en sistemas donde no se tolera ni una falla, como el control de una planta nuclear. (1 p)
- **`estado[]`:** registra si cada filósofo está pensando, hambriento o comiendo. Un filósofo come **solo si ninguno de sus vecinos está comiendo**, y toma los dos tenedores "de una" dentro de la región crítica, protegida por `mutex`. (1 p)
- **`s[i]`:** el semáforo propio de cada filósofo, que arranca en 0. Si `probar(i)` falla, el filósofo se bloquea en `s[i]`. Cuando un vecino deja de comer, llama a `probar` sobre él y hace `up(&s[i])`. Así se bloquea solo el filósofo que no puede comer, y la solución admite el máximo paralelismo, con hasta 2 filósofos comiendo a la vez. (1 p)

*(2.5.1, págs. 164–167)*

---

## Parte E — Escenarios (12 p)

### 17. (4 p)
- **q = 1 ms:** si el cambio de proceso cuesta, por ejemplo, 1 ms, se pierde la mitad de la CPU en conmutaciones administrativas (sobrecarga). La respuesta a cada tecla mejora un poco, pero el trabajo útil cae a la mitad. (1,5 p)
- **q = 2 s:** el cambio de contexto pesa poco, pero un proceso interactivo que queda detrás de varios procesos limitados por CPU espera varios segundos para ejecutar. La respuesta es pésima: tiende a FCFS. (1,5 p)
- **Valor razonable:** el libro propone un quantum de **entre 20 y 50 ms**. También conviene que el quantum sea un poco más largo que la ráfaga típica, para que la mayoría de las ráfagas termine antes de que se agote. (1 p)

*(2.4.3, págs. 154–155)*

### 18. (4 p)
Es la **inversión de prioridades** con espera ocupada:
- H siempre está **listo**, porque gira en el `while` y nunca se bloquea. Como el planificador elige siempre al de más prioridad, **L nunca ejecuta** y no puede salir de la región ni liberar el candado.
- H gira para siempre con la CPU al 100 %. (2 p)

Soluciones (2 p):
- reemplazar la espera ocupada por **bloqueo** (semáforo o mutex), para que H duerma y L pueda ejecutar;
- y, si además hay procesos de prioridad media, **herencia de prioridades**: L toma la prioridad de H mientras tenga el candado (complemento, Mars Pathfinder).

Error del estudiante a vigilar: no fusionar "tener el candado" con "tener la CPU". *(2.3.3–2.3.4, págs. 124–125)*

### 19. (4 p)
- **Causa (2 p):** la solución da **prioridad a los lectores**. Mientras quede al menos un lector adentro, `cl` no llega a 0 y la base no se libera. Los lectores nuevos entran directo, sin esperar. Si siempre llegan lectores, el escritor sufre **inanición**.
- **Solución (1 p):** cuando llega un escritor, los lectores que lleguen después esperan detrás de él (un "torniquete"). El escritor solo espera a los lectores que ya estaban.
- **Costo (1 p):** se pierde **concurrencia**, porque los lectores ya no pueden pasar libremente y el rendimiento baja. El libro lo plantea como el trade-off: rendimiento contra equidad.

*(2.5.2, págs. 167–168)*

---

## Parte F — Integración (10 p)

### 20. (5 p)
1. P1 llama a `read` en la biblioteca, que pone los parámetros y ejecuta **TRAP**.
2. El hardware cambia el **bit de modo del PSW a kernel** y salta a la dirección fija del manejador. El despachador usa el número de llamada para ejecutar el código de `read`.
3. El driver le programa la operación al **controlador de disco**. Como el dato no está, P1 tiene que esperar.
4. Se guarda el contexto de P1 en su **BCP** (PC, PSW, registros, puntero de pila) y su estado pasa a **Bloqueado**: Ejecución → Bloqueado.
5. El **planificador** elige a P2 entre los **Listos**. Se cargan los registros desde el BCP de P2, el modo vuelve a usuario y P2 pasa a **Ejecución**.

Cuando el disco termina:
6. El controlador genera una **interrupción**. El hardware guarda el PC y el PSW de P2, pasa a modo kernel y salta al manejador por el vector de interrupciones.
7. El manejador marca a P1 como **Listo** (Bloqueado → Listo), y P1 entra en la cola de listos.
8. El planificador decide quién sigue. Puede volver P2 o, si la política lo dice, P1. Recién ahí P1 recupera su contexto y `read` retorna al programa.

Puntaje: 1 p por cada bloque bien ordenado (TRAP y modo, BCP y bloqueo, planificador, interrupción, Bloqueado → Listo). Error a vigilar: confundir el bit de modo del PSW con el campo de estado del BCP. *(Tanenbaum 1.6.1, 2.1.5–2.1.6, 5.1.5)*

### 21. (5 p)
**a) (1,5 p)** En los dos casos la CPU **gira consultando una condición** (el registro de estado del dispositivo, o el candado) sin hacer trabajo útil. Gasta ciclos que podría usar otro proceso.

**b) (1,5 p)** En E/S, se reemplaza por la **E/S por interrupciones** o el **DMA**: la CPU hace otra cosa y el dispositivo avisa cuando termina. En concurrencia, por **bloquear** al proceso (sleep/wakeup, semáforos, mutex, monitores): se despierta cuando el recurso se libera. Es la misma idea en las dos unidades: "avisame cuando esté" en lugar de "¿ya está? ¿ya está?".

**c) (2 p)** En un multiprocesador, quien tiene el candado **está ejecutando en otra CPU** y lo va a liberar enseguida. Bloquearse implica dos cambios de contexto y alterar la caché, y eso puede costar más que girar unos pocos ciclos. Por eso se usan spinlocks para esperas cortas, o la estrategia mixta: girar un rato y después bloquearse. En un monoprocesador, en cambio, girar es inútil, porque quien tiene el candado no puede avanzar mientras yo gire. *(8.1.3, págs. 538–542; 2.3.3)*
