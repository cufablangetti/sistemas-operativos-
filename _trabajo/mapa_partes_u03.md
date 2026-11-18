# U3 — Administración de memoria {#u3}

> 📖 Tanenbaum, cap. 3 completo (págs. 175–247) + 1.3.2 (págs. 23–26) + 10.4.2–10.4.3 (págs. 761–767) + 11.5 (págs. 879–894) + apuntes de la cátedra (resumen U3, comandos de memoria, práctica de traducción y segunda oportunidad)
> 📄 Repaso U3, 47 págs. — la clase completa; mapa de la unidad en la pág. 1; cierre y lo que más se toma en las págs. 46–47

La pregunta que recorre la unidad: **¿cómo conviven varios programas que juntos no entran en la RAM, sin pisarse?** Es una escalera: cada tema resuelve el problema que dejó el anterior. Sin abstracción se pisan → **base y límite** → no entran todos → **intercambio** → los procesos enteros son lentos de mover → **paginación** → la tabla es lenta y enorme → **TLB y multinivel/invertida** → no hay marcos libres → **reemplazo** → el sistema colapsa → **diseño (control de carga)** → varios espacios lógicos → **segmentación**.

## Tema 1 — Jerarquía de memoria y administrador de memoria {#u3-jerarquia}

> 📖 cap. 1.3.2, págs. 23–26; introducción del cap. 3, págs. 175–176
> 📄 Repaso U3, pág. 1 — "Tema 1 — La jerarquía de memoria y el administrador de memoria"

- **Jerarquía** — registros (< 1 KB, ~1 ns) → caché (~4 MB, ~2 ns) → RAM (~GB, ~10 ns) → disco (~TB, ~10 ms) → cinta. Hacia abajo: más lenta, más barata por bit, más grande. La memoria ideal (infinita, rápida, no volátil, barata) **no existe**.
  - **Volátiles**: registros, caché, RAM. **No volátiles**: ROM, flash, disco (la CMOS es volátil pero tiene pila).
  - 🔗 Es la jerarquía de la U1 [[u1-jerarquia]]; acá vuelve porque **el SO administra la RAM**.
- **Administrador de memoria** — la parte del SO que (1) lleva el registro de qué partes están en uso, (2) asigna memoria cuando la piden y (3) la libera cuando terminan.
  - ⚖️ **Caché vs. RAM**: la caché la administra el **hardware**, sola, en nanosegundos; la RAM la administra el **SO**. Por eso la unidad estudia la RAM.
  - ⚠️ Dije que la caché era "más temporal" que la RAM: las dos son volátiles; la diferencia es **quién la administra**.
- **Localidad** — lo que se usó hace poco y lo que está al lado se va a volver a usar. Es lo que hace que la caché acierte.
  - Ejemplo: caché 1 ns, RAM 10 ns. Con 95 % de aciertos → 0,95·1 + 0,05·11 = **1,50 ns**; con 50 % → **6,00 ns**.
  - 📌 Frase de examen: *«La caché vale lo que vale la localidad del programa.»* ⚠️ Me faltó la palabra **localidad** al responder.
- 🧠 **La idea que se repite en toda la unidad** {#u3-idea-cache} — un nivel rápido y chico guarda lo más usado de uno lento y grande: la **RAM es caché del disco** (memoria virtual), el **TLB es caché de la tabla de páginas** [[u3-tlb]], y elegir qué página sacar es el mismo problema que elegir qué línea de caché sacar [[u3-reemplazo]].

## Tema 2 — Sin abstracción y el espacio de direcciones {#u3-espacio}

> 📖 cap. 3.1 y 3.2.1, págs. 176–181 (figs. 3-1 a 3-3)
> 📄 Repaso U3, pág. 3 — "Tema 2 — Sin abstracción de memoria y el espacio de direcciones"

- **Sin abstracción** — el programa ve la memoria **física** (`MOV REG, 1000` lee la celda 1000). No puede haber dos programas en memoria: se pisan.
- **IBM 360** — memoria en bloques de 2 KB con una **llave de protección** de 4 bits; la llave del proceso está en el **PSW**; si no coinciden → trap.
  - 🔗 La llave vive en el PSW, el mismo registro del bit de modo [[u1-modos]]: la protección la **impone el hardware** y la **configura el SO**.
- **Problema de la reubicación** (fig. 3-2) — el `JMP 28` del programa 2, cargado en 16384, salta a la física 28, dentro del programa 1.
  - **Reubicación estática** — sumar 16384 a todas las direcciones al cargar. Lenta, no general, y el cargador tiene que distinguir direcciones (`JMP 28`) de constantes (`MOV REG, 28`).
- **Espacio de direcciones** {#u3-espacio-dir} — el conjunto de direcciones que puede usar un proceso; cada proceso tiene el suyo. 🧠 **El proceso es una CPU abstracta y el espacio de direcciones es una memoria abstracta** [[u2-proceso]].
  - Resuelve **protección** (no tocar lo ajeno) y **reubicación** (funcionar en cualquier lugar).
- **Registros base y límite** {#u3-base-limite} — base = dónde empieza en la física; límite = cuánto mide. Reubicación **dinámica**: el programa no se modifica.
  - 🔢 **En cada acceso a memoria**
    1. El proceso genera la dirección d.
    2. ¿d ≥ límite? → **trap** (se sale de su espacio).
    3. Si no: física = d + base → al bus de memoria.
  - Desventaja: una **suma y una comparación en cada acceso** (la suma es lenta por el acarreo).
  - 📌 Solo el SO puede cambiar base y límite (instrucción privilegiada) [[u1-modos]].
  - ⚠️ Con base 40000 y límite 8000, la dirección **8000 es trap**, no 48000: las válidas van de 0 a **7999**. La condición es **≥**, no >.
  - ⚠️ El problema de distinguir `JMP 28` de `MOV REG, 28` desaparece porque **solo se reubica lo que efectivamente accede a memoria**, en el momento del acceso; no por la protección.
- 📌 **Particiones fijas** — el programa las nombra, pero esta edición del libro **no las desarrolla**; lo más cercano son las llaves de la IBM 360 y base/límite.

## Tema 3 — Intercambio y administración de la memoria libre {#u3-intercambio}

> 📖 cap. 3.2.2–3.2.3, págs. 181–187 (figs. 3-4 a 3-7); algoritmo de colegas: 10.4.3, págs. 765–767
> 📄 Repaso U3, pág. 5 — "Tema 3 — Intercambio y administración de la memoria libre"

- **Intercambio (swapping)** — traer cada proceso **completo**, ejecutarlo un rato y devolverlo al disco. Al volver puede quedar en **otro lugar** → hace falta base y límite [[u3-base-limite]].
  - **Huecos** → **compactación**: mover todo para juntarlos. Carísima (1 GB copiando 4 B cada 20 ns ≈ **5 s**).
  - **Los procesos crecen**: heap hacia arriba, pila hacia abajo; se deja **espacio para crecer** entre los dos.
- **Mapa de bits** — un bit por unidad de asignación (0 libre, 1 ocupado).
  - + simple; el tamaño depende solo de la memoria y la unidad (32 MB en unidades de 4 KB → 8192 bits = **1 KB**).
  - − para k unidades hay que **buscar k ceros seguidos**: lento.
- **Lista ligada** — nodos P (proceso) / H (hueco) con inicio y tamaño, ordenada por dirección.
  - 🔢 **Fusión al liberar X** (fig. 3-7)
    1. A X B → A · B (X se vuelve hueco).
    2. A X · → A ··· (se une con el de la derecha).
    3. · X B → ··· B (se une con el de la izquierda).
    4. · X · → ····· (los tres en uno; la lista pierde 2 nodos).
- **Algoritmos de asignación** {#u3-ajustes}
  - **Primer ajuste** — el primer hueco que alcance. **Rápido**.
  - **Siguiente ajuste** — igual, pero **retoma desde donde quedó**. Un poco peor que el primero.
  - **Mejor ajuste** — el hueco más chico que alcance. 📌 **Desperdicia MÁS**: deja sobras diminutas inútiles; y es lento (recorre toda la lista).
  - **Peor ajuste** — el más grande. Tampoco funciona bien.
  - **Ajuste rápido** — listas separadas por tamaño. Rapidísimo, pero fusionar vecinos es caro.
  - Ejemplo: huecos 10, 4, 20, 18, 7, 9, 12, 15; pedidos 12, 10, 9 → primer 20/10/18; mejor 12/10/9; peor 20/18/15; siguiente 20/18/9.
  - ⚠️ En el siguiente ajuste salté al hueco de 9 cuando lo correcto era el **sobrante del hueco recién usado** (6 KB del de 14): la búsqueda arranca **donde quedó**, incluido ese hueco.
- **Sistema de colegas (buddy)** {#u3-colegas} — "sistema compañero" en el programa; en el libro está en Linux. Todo en **potencias de 2**: se parte a la mitad hasta el tamaño pedido; dos **colegas** libres se vuelven a unir.
  - + encontrar y fusionar es rapidísimo. − **fragmentación interna** enorme (pedís 65 páginas, te dan 128).
  - 🔗 Linux lo usa para los marcos y encima pone el **asignador de losas** [[u3-linux]].

## Tema 4 — Memoria virtual y paginación ★ {#u3-paginacion}

> 📖 cap. 3.3 y 3.3.1, págs. 188–193 (figs. 3-8 a 3-10)
> 📄 Repaso U3, pág. 7 — "Tema 4 — Memoria virtual y paginación"

- **Por qué** — intercambiar procesos enteros es lento (1 GB a 100 MB/s = 10 s). Antes: **sobrepuestos (overlays)** hechos a mano por el programador.
- **Memoria virtual** (Fotheringham, 1961) — cada programa tiene su espacio dividido en **páginas**; **no todas tienen que estar en RAM**. Según la cátedra: nace porque los programas son más grandes que la memoria.
- **Términos** {#u3-terminos}
  - **Dirección virtual** — la que genera el programa.
  - **Página** — pedazo de tamaño fijo del espacio **virtual**.
  - **Marco de página** — pedazo del mismo tamaño de la memoria **física**.
  - **MMU** — hardware que traduce en cada acceso [[u1-cpu]]. Las transferencias RAM↔disco son de **páginas completas**.
  - **Fallo de página** — la página no está presente → **trap** al SO.
- **Fig. 3-9** — 16 bits (64 KB virtuales), 32 KB de RAM, páginas de 4 KB → **16 páginas, 8 marcos**.
- **Traducción** {#u3-traduccion}
  - 🧠 **Regla de oro**: se **reemplaza el número de página por el número de marco**; el desplazamiento **no se toca**.
  - 🧠 Bits de desplazamiento = log₂(página): **1 KB → 10 · 2 KB → 11 · 4 KB → 12**.
  - 🔢 **Traducir a mano (método de la cátedra)**
    1. Pasar la dirección a binario (cada dígito hexa = 4 bits).
    2. Cortar los n bits bajos = desplazamiento (n según el tamaño de página).
    3. Los bits altos = número de página → buscar en la tabla.
    4. ¿P = 0? → fallo de página.
    5. Reemplazar la página por el **marco** y pegar el desplazamiento.
    6. Pasar a hexa y controlar en decimal: marco × tamaño + desplazamiento.
  - Ejemplos: 8196 → pág. 2, desp 4, marco 6 → **24580**; 0x2C3A con 1 KB → pág. 11, desp 58, marco 5 → **0x143A**; 0x1D7B con 2 KB → pág. 3, marco 9 → **0x4D7B**.
  - 📌 **¿Por qué potencia de 2?** Porque así la MMU **no divide ni multiplica**: corta bits y reemplaza. ⚠️ Respondí "para adivinar la página": no sirve en el examen.
  - ⚠️ Con 2 KB el desplazamiento tiene **11 bits**, no 12: en el examen separá con una barra exactamente donde cortás.
- 🔗 Mientras se trae la página del disco, el proceso queda **BLOQUEADO** y la CPU pasa a otro [[u2-transiciones]]: la memoria virtual encaja con la multiprogramación.

## Tema 5 — La tabla de páginas por dentro y el TLB ★ {#u3-tabla}

> 📖 cap. 3.3.2–3.3.3, págs. 193–198 (figs. 3-11 y 3-12)
> 📄 Repaso U3, pág. 9 — "Tema 5 — La tabla de páginas por dentro y el TLB"

- **Entrada de la tabla** (fig. 3-11) {#u3-entrada} — caché deshabilitada · referenciada · modificada · protección · presente/ausente · **número de marco** (el campo más importante).
  - **P (presente/ausente)** — lo pone el SO; 0 → fallo de página.
  - **Protección** — R/W/X; violarla → fallo de protección.
  - **M (modificada, "sucia")** — la pone el **hardware** al escribir; al desalojar, si M = 1 se **escribe al disco**, si no se descarta.
  - **R (referenciada)** — la pone el **hardware** al leer o escribir; la usan los algoritmos de reemplazo [[u3-reemplazo]].
  - **Caché deshabilitada** — para páginas mapeadas a registros de dispositivos. 🔗 Existe por la **E/S mapeada a memoria** [[u1-es]].
  - 📌 **La dirección en disco NO está en la tabla de páginas**: la tabla tiene solo lo que el hardware necesita para traducir; el SO guarda la ubicación en disco en sus propias tablas. ⚠️ Respondí que sí estaba (V/F del tema 5, incorrecto).
- **Los dos problemas** — (1) la traducción debe ser **rápida** (cada referencia) → TLB; (2) la tabla puede ser **enorme** (32 bits y 4 KB → 2²⁰ entradas por proceso) → tema 6.
- **TLB** {#u3-tlb} — búfer de traducción adelantada o memoria asociativa: hardware **dentro de la MMU**, chico (8 a 64 entradas), busca en **todas las entradas en paralelo**. Funciona por **localidad**.
  - Entrada: válida · **página virtual** · modificada · protección · marco. ⚖️ A diferencia de la tabla, el TLB **sí guarda la página virtual** porque no está indexado por página.
  - 🔢 **Traducción con TLB**
    1. ¿La página está en el TLB? Sí → ¿protección ok? → marco → física (**acierto**). Si viola la protección → fallo de protección.
    2. No → buscar en la tabla de páginas (en RAM).
    3. P = 1 → cargar la entrada en el TLB (desalojando una, cuyo **M vuelve a la tabla**) y traducir: **fallo suave**.
    4. P = 0 → **fallo de página** → disco: **fallo duro**.
  - **TLB por software** (SPARC, MIPS, HP PA) — ante un fallo de TLB, trap y **el SO** carga la entrada; MMU más simple.
  - 🔗 Es una caché de traducciones: misma idea y mismo cálculo de tiempo medio que la caché de la U1 [[u1-jerarquia]] [[u3-idea-cache]].
- ⚖️ **Fallo suave vs. fallo duro (del TLB)** {#u3-suave-duro} — suave: la página está en RAM pero no en el TLB, se actualiza el TLB, **nanosegundos**; duro: no está en RAM, hay que ir al **disco**, **milisegundos** (≈ un millón de veces más lento).
  - ⚠️ **Cuando una entrada sale del TLB, su bit M va a la tabla de páginas, NO al disco.** Al disco se escribe recién cuando la **página sale de la RAM** con M = 1. Lo respondí mal.
  - 🔗 Windows usa "suave/duro" para los fallos de página con el mismo sentido: encontrado en memoria vs. leído del disco [[u3-windows]].

## Tema 6 — Tablas de páginas para memorias grandes {#u3-multinivel}

> 📖 cap. 3.3.4, págs. 198–201 (figs. 3-13 y 3-14); resumen de la cátedra, págs. 12–15
> 📄 Repaso U3, pág. 11 — "Tema 6 — Tablas de páginas para memorias grandes"

- **El problema** — 32 bits y 4 KB → 2²⁰ entradas = **4 MB por proceso**, aunque use 12 MB.
- **Tabla multinivel** (fig. 3-13) — la dirección de 32 bits se corta **TP1 (10) | TP2 (10) | desplazamiento (12)**. La tabla superior tiene 1024 entradas, cada una cubre **4 MB**; las de 2º nivel, 1024 páginas de 4 KB.
  - Ejemplo del libro: proceso de 12 MB (texto abajo, datos, pila arriba) → **4 tablas** (1 superior + 3) = **16 KB** contra 4 MB. Los trozos del **hueco** no tienen tabla de 2º nivel (P = 0 en la superior).
  - 🔢 **Dividir 0x00403004** → `0000000001 | 0000000011 | 000000000100` → **TP1 = 1, TP2 = 3, desp = 4**. ⚠️ **Errata**: el libro en español dice TP2 = 2; los bits dan 3 (4M + 3·4096 + 4 = 4.206.596).
  - 🧠 Con 10|10|12, los **3 últimos dígitos hexa** son el desplazamiento; TP1 y TP2 sí van en binario (10 bits no coinciden con dígitos hexa).
  - Más de 3 niveles rara vez conviene: sin TLB, cada nivel suma un acceso a memoria.
  - Ejemplo de clase: 0x01C0A2F0 → TP1 = 7, TP2 = 10, desp = 0x2F0 → trozo de 28 a 32 MB.
  - 🔗 Es lo mismo que el **directorio de páginas + tabla de páginas** del Pentium (Dir 10 | Pág 10 | Desp 12) [[u3-pentium]]; Linux usa **cuatro niveles** [[u3-linux]].
- **Tabla invertida** (fig. 3-14) {#u3-invertida} — con **64 bits** ni el multinivel alcanza (2⁵² entradas). Una entrada **por marco físico** (no por página virtual), con el par **(proceso, página virtual)**; **una sola para todo el sistema**.
  - − traducir requiere **buscar** (n, p) en toda la tabla en cada acceso → se usa el **TLB** y, cuando falla, una **tabla hash** sobre la página virtual, recorrida **por software**; con tantas ranuras como marcos, la cadena promedio tiene **una** entrada.
  - ❓ **¿Qué función de hash?** El libro no lo dice; solo que las páginas con el mismo hash quedan **encadenadas** y que se compara el **par completo** (por las colisiones).
  - 🧠 Según la cátedra: **32 bits → multinivel; 64 bits → invertida + TLB.**
  - 📌 V/F: "la invertida tiene una entrada por página virtual de cada proceso y cada proceso tiene la suya" → **falso**.

## Tema 7A — Reemplazo de páginas: óptimo, NRU, FIFO, segunda oportunidad, reloj ★ {#u3-reemplazo}

> 📖 cap. 3.4–3.4.5, págs. 201–206 (figs. 3-15 y 3-16)
> 📄 Repaso U3, pág. 14 — "Tema 7A — Algoritmos de reemplazo de páginas"

- **El problema** — hay un fallo de página y no hay marcos libres: hay que elegir una **víctima**. Si tiene **M = 1** se escribe primero al disco; si está limpia, se descarta.
- **Óptimo** {#u3-optimo} — saca la que se va a usar **más tarde**. **No se puede implementar** (requiere el futuro); sirve de **referencia** (cota inferior de fallos).
  - 🔗 Igual que SJF, necesita un dato del futuro [[u2-sjf]] [[ideas]].
- **NRU (no usada recientemente)** {#u3-nru} — usa R y M; **el SO borra R en cada interrupción de reloj**, nunca M.
  - Clases: **0** (R0 M0) → **1** (R0 M1) → **2** (R1 M0) → **3** (R1 M1). Saca **una al azar de la clase más baja no vacía**.
  - 🧠 La clase 1 parece imposible, pero aparece cuando el reloj borra R de una página de clase 3.
  - 📌 NRU prefiere sacar una **modificada no usada** (clase 1) antes que una **limpia muy usada** (clase 2).
- **FIFO** — saca la que **llegó primero** (el supermercado que tira la harina). Casi no se usa puro.
- **Segunda oportunidad** ★ {#u3-segunda} — FIFO mirando el bit R de la más vieja.
  - 🔢 **Algoritmo (como lo toma la cátedra)**
    1. Ordenar las páginas **presentes** por llegada, de la más vieja a la más nueva.
    2. Mirar la más vieja: si **R = 1** → R = 0, **llegada = instante actual**, va al final de la cola.
    3. Repetir hasta encontrar una con **R = 0** → esa es la **víctima**.
    4. Si la víctima tiene M = 1 → se escribe al disco.
    5. La nueva página entra en el **marco que liberó** la víctima: P = 1, R = 1, M = 0 si es lectura (1 si es escritura), llegada = ahora.
    6. Traducir la dirección con ese marco.
    7. Escribir la **cola final**: según la cátedra, **de la más nueva (izquierda) a la más vieja (derecha)**, con el R de cada una.
  - Si todas tienen R = 1, da la vuelta completa y saca la primera: **degenera en FIFO pero siempre termina**. 📌 V/F "entra en un ciclo infinito" → falso.
  - Ejemplo de clase: 2 KB, instante 200, lectura de 0x4B3A → pág. **9** (fallo); se salvan la 11 y la 5; víctima la **2** (sucia → disco); entra en el **marco 6** → física **0x333A**; cola final **9(1) → 5(0) → 11(0) → 14(1)**.
  - ⚠️ **Me dio 0x3CEE en vez de 0x333A** y no sabía qué era la "cola final". Es ★★★: repetir ejercicios. El marco **reemplaza** los 5 bits de página; el desplazamiento (11 bits) se copia igual.
  - ⚠️ Mostrar los pasos de las páginas salvadas: el examen pide **cómo se llega** a la víctima, no solo cuál es.
- **Reloj** {#u3-reloj} — segunda oportunidad **sin mover páginas**: lista **circular** y una **manecilla**. R = 1 → R = 0 y avanza; R = 0 → víctima, la nueva toma su lugar y la manecilla avanza. Mismas víctimas que la segunda oportunidad, más eficiente.
- Cadena 7 0 1 2 0 3 0 4 2 3 0 3 2 con 3 marcos: **óptimo 7, FIFO 10, segunda oportunidad 9, reloj 9, LRU 9**.

## Tema 7B — LRU, envejecimiento, conjunto de trabajo y WSClock ★ {#u3-lru}

> 📖 cap. 3.4.6–3.4.10, págs. 205–215 (figs. 3-17 a 3-22)
> 📄 Repaso U3, pág. 16 — "Tema 7B — LRU y sus aproximaciones; conjunto de trabajo y WSClock"

- 🧠 **En una línea**: LRU es el mejor algoritmo **realizable**, pero caro; todo lo demás son formas baratas de imitarlo.
- **LRU (menos usada recientemente)** — saca la que hace **más tiempo** que no se usa. Exacto: lista ordenada actualizada en **cada** referencia (carísimo) o hardware.
  - **Contador de 64 bits** por instrucción, copiado en la entrada al referenciar; sale la de menor contador.
  - **Matriz n × n** (fig. 3-17) — al referenciar la página k: **fila k en 1, columna k en 0**; sale la de **fila más chica** (en binario). 🧠 Para recitar: *«fila en 1, columna en 0; la fila más chica sale».*
- **NFU** — un contador por página; en cada pulso se le **suma R**. ⚠️ **Nunca olvida**: lo muy usado en el pasado le gana a lo que se usa ahora.
- **Envejecimiento** {#u3-envejecimiento} — en cada pulso: **desplazar a la derecha** y meter **R por la izquierda**; sale el **menor valor**.
  - Ejemplo de clase: contadores 80, 48, 160, 144 → sale la página **1**; con NFU las cuatro valen 2 (empate).
  - 🧠 NFU mide **frecuencia**; envejecimiento mide **recencia**, que es lo que aproxima a LRU. ⚠️ Me faltó esa conclusión.
  - 📌 Dos diferencias con LRU verdadero: (1) no distingue el orden **dentro de un mismo pulso** (empates); (2) tiene **horizonte finito** (8 bits: más allá de 8 pulsos no distingue).
  - ⚠️ **Errata** fig. 3-18, página 2: debe decir **00010000** y **10001000**.
  - ❓ **Las columnas de la fig. 3-18 son las páginas**; cada fila es un pulso. ❓ El contador **no cuenta unos**: es el número binario que se forma.
- **Conjunto de trabajo** {#u3-conjunto-trabajo} — las páginas que el proceso usa **en este momento**. **w(k, t)** = páginas usadas en las k referencias más recientes.
  - **Paginación bajo demanda** — arrancar sin páginas e ir fallando. **Prepaginación** — cargar el conjunto de trabajo antes de reanudar (modelo del conjunto de trabajo).
  - **Localidad de referencia** — en cada fase el proceso usa pocas páginas. Si el conjunto no entra → **sobrepaginación** [[u3-sobrepaginacion]].
  - Aproximación práctica: lo usado en los últimos **τ de tiempo virtual**. ⚠️ **Tiempo virtual** = CPU del **propio** proceso, no el tiempo real.
  - 🔢 **Algoritmo en el fallo (fig. 3-20)** — para cada página: edad = tiempo virtual actual − último uso.
    1. R = 1 → último uso = actual (está en el conjunto, no sale).
    2. R = 0 y edad > τ → **víctima** (fuera del conjunto); el recorrido sigue para actualizar.
    3. R = 0 y edad ≤ τ → se reserva; se anota la más vieja.
    4. Ninguna fuera → sale la **más vieja con R = 0**; si todas tienen R = 1 → una al azar, mejor limpia.
- **WSClock** ★ {#u3-wsclock} — el conjunto de trabajo **montado sobre el reloj**: anillo con manecilla.
  - 🔢 **Paso de la manecilla**
    1. R = 1 → R = 0 y avanza.
    2. R = 0, edad > τ y **limpia** → **víctima**; la nueva entra ahí.
    3. R = 0, edad > τ y **sucia** → se **planifica su escritura** y **avanza** (no sale todavía).
    4. R = 0, edad ≤ τ → avanza.
    5. Si da la vuelta entera: si hubo escrituras, sigue hasta que una quede limpia; si no hubo ninguna, sale cualquier limpia, y si no, la actual.
  - ⚠️ **Lo más preguntado**: la vieja **sucia no sale** ni se copia en ese momento; se **planifica la escritura** y la manecilla sigue, para no frenar el fallo esperando el disco. Lo respondí mal (dije que se copiaba y quedaba con M = 0).
- **Resumen (fig. 3-22)** — los dos mejores en la práctica: **envejecimiento** (basado en LRU) y **WSClock** (basado en el conjunto de trabajo).

## Tema 8A — Diseño: sobrepaginación, local/global, PFF, tamaño de página ★ {#u3-diseno}

> 📖 cap. 3.4.8 (pág. 209) y 3.5.1–3.5.3, págs. 216–220 (figs. 3-23 y 3-24)
> 📄 Repaso U3, pág. 21 — "Tema 8A — Cuestiones de diseño: sobrepaginación, local/global, tamaño de página"

- **Sobrepaginación (thrashing / hiperpaginación)** {#u3-sobrepaginacion} — el proceso pasa más tiempo **paginando** que ejecutando: falla cada pocas instrucciones porque su conjunto de trabajo no entra.
  - 🧠 **No es culpa del algoritmo de reemplazo**: si la **suma de los conjuntos de trabajo** supera la RAM, aparece igual.
  - ⚠️ En el escenario de la clase no la nombré ni di la causa ni la solución. Respuesta completa: **sobrepaginación → control de carga (swapping de un proceso entero)**.
  - 🔗 En `vmstat`: **si/so altos sostenidos y wa alto** [[u3-linux]].
- **Reemplazo local vs. global** (fig. 3-23) {#u3-local-global} — local: la víctima sale del **mismo proceso** (tamaño fijo); global: de **cualquier** proceso (tamaño variable). En la fig. 3-23, local saca **A5**, global saca **B3**.
  - En general **global funciona mejor**, sobre todo si el conjunto de trabajo varía.
  - 📌 FIFO y LRU sirven con las dos; **conjunto de trabajo y WSClock solo como locales**.
- **Asignación de marcos** — **equitativa** (iguales para todos) o **proporcional** al tamaño, con un **mínimo**. Ejemplo de clase: 12416 marcos / 10 procesos = 1241 cada uno y sobran 6.
- **PFF (frecuencia de fallos de página)** (fig. 3-24) {#u3-pff} — por encima de la línea **A** → darle más marcos; por debajo de **B** → sacarle marcos. Media móvil: (m + x) / 2.
  - ⚠️ **PFF decide CUÁNTOS marcos tiene cada proceso, NO CUÁL página sale.**
- **Control de carga** ★ {#u3-control-carga} — si todos están por encima de A y ninguno por debajo de B → **sacar procesos enteros al disco** (swapping) y repartir sus marcos.
  - 📌 *«PFF indica que algunos necesitan más memoria y ninguno necesita menos → la única solución real es reducir la cantidad de procesos en memoria.»*
  - 🧠 Por eso **el intercambio sigue existiendo aunque haya paginación**: no para conseguir páginas, sino para **bajar el grado de multiprogramación** [[u1-multiprog-modelo]]. Se parece a la **planificación de dos niveles** [[u2-dos-niveles]].
  - Tampoco hay que bajar demasiado la multiprogramación: la CPU queda ociosa.
- **Tamaño de página** ★ {#u3-tamano} — chica: menos **fragmentación interna** (½ página por segmento) pero tabla más grande; grande: al revés.
  - 🧠 **Sobrecarga = s·e/p + p/2** (s = tamaño promedio del proceso, e = bytes por entrada). **Óptimo: p = √(2se)**. En el óptimo **los dos términos son iguales**.
  - Ejemplos: s = 1 MB, e = 8 B → p = 4 KB; ejercicio de clase → 8 KB. ⚠️ No entendí que cada término valía 4 KB: es la marca del óptimo.

## Tema 8B — Compartir memoria: páginas compartidas, copia en escritura, DLL ★ {#u3-compartir}

> 📖 cap. 3.5.4–3.5.9, págs. 221–227 (figs. 3-25 a 3-27)
> 📄 Repaso U3, pág. 24 — "Tema 8B — Compartir memoria: páginas y bibliotecas compartidas, copia en escritura"

- **Espacios I y D separados** (fig. 3-25) — un espacio para instrucciones y otro para datos; duplica el espacio disponible. El enlazador debe saberlo (los datos arrancan en la virtual 0).
- **Páginas compartidas** (fig. 3-26) — varios procesos con el **mismo programa** comparten las páginas de **texto** (solo lectura): dos tablas de páginas apuntan a los mismos marcos.
  - ⚠️ Si se saca a A con todas sus páginas, **B empieza a fallar**; si A termina, las páginas **siguen en uso**: hacen falta estructuras que lleven la cuenta.
- **Copia en escritura (copy-on-write)** ★ {#u3-cow} — tras `fork`, padre e hijo comparten **todas** las páginas marcadas **solo lectura**; al escribir → **trap** → se copia **esa sola página** y las dos copias quedan L/E.
  - 🔢 **Escritura en una página compartida con COW**
    1. El proceso escribe en una página marcada de solo lectura.
    2. La MMU genera un **trap** (violación de protección).
    3. El SO ve que la página es copia en escritura (no un error real).
    4. Copia la página en un marco nuevo y actualiza la tabla de ese proceso.
    5. Marca las dos copias como lectura/escritura.
    6. Reinicia la instrucción, que ahora tiene éxito.
  - 🔗 En `fork` + `execve` el hijo descarta su espacio enseguida: sin COW, el fork habría copiado todo para tirarlo [[u2-fork]].
  - 📌 *«El texto se comparte siempre porque es de solo lectura; COW solo cambia qué pasa con los datos y la pila.»* Ejemplo de clase: 12 compartidas y 4 copiadas.
  - ⚠️ El mismo trap puede ser COW o un **error real** (escribir en el código) → en ese caso, **señal** al proceso.
- **Bibliotecas compartidas (DLL)** {#u3-dll} — una sola copia en RAM para todos; se **pagina bajo demanda**; se actualiza sin recompilar.
  - **Problema de la reubicación** (fig. 3-27): cada proceso la mapea en otra dirección virtual y **hay una sola copia física**, así que no se pueden reubicar las direcciones absolutas para cada uno.
  - Solución: **código independiente de la posición** (solo desplazamientos relativos). ⚠️ Me faltaron el porqué (una sola copia) y el término.
  - 🔗 Windows comparte EXE y DLL igual y marca COW las páginas escribibles de las imágenes [[u3-windows]].
- **Archivos asociados a memoria** — mapear un archivo en el espacio virtual y leerlo como memoria; las DLL son un caso particular. 🔗 `mmap` en Linux [[u3-linux]], `MapViewOfFile` en Windows.
- **Política de limpieza: demonio de paginación** {#u3-limpieza} — proceso en segundo plano que mantiene **marcos libres** y **escribe las páginas sucias** antes de que hagan falta. Funciona como un **reloj de dos manecillas** (la de adelante limpia, la de atrás reclama).
  - 🔗 Es el **escritor de páginas modificadas** de Windows [[u3-windows]].
- **Interfaz de memoria virtual** — dar al programador control sobre su mapa (memoria compartida distribuida, mensajes sin copiar).

## Tema 9 — Implementación: el fallo de página paso a paso ★ {#u3-fallo}

> 📖 cap. 3.6.1–3.6.6, págs. 227–234 (figs. 3-28 a 3-30)
> 📄 Repaso U3, pág. 28 — "Tema 9 — Cuestiones de implementación: el fallo de página paso a paso"

- **Los 4 momentos en que el SO trabaja con la paginación**
  - **Crear** un proceso — tamaño inicial, **crear e inicializar la tabla de páginas**, reservar el **área de intercambio** en disco, anotar en la tabla de procesos.
  - **Ejecutar** — **reiniciar la MMU**, **vaciar el TLB** (tiene restos del anterior), cargar la tabla del nuevo; opcionalmente prepaginar.
  - **Fallo de página** — los 10 pasos.
  - **Terminar** — liberar tabla, páginas y espacio en disco; las **compartidas** cuando termina el **último** que las usa.
- 🔢 **Manejo de un fallo de página: los 10 pasos** ★ {#u3-diez-pasos}
  1. **Hardware**: trap al kernel; se guarda el **PC** en la pila (y a veces el estado de la instrucción).
  2. **Rutina en ensamblador**: guarda los registros y llama al SO.
  3. **SO**: averigua qué **página virtual** se necesita (registro de hardware o analizando la instrucción).
  4. **SO**: ¿dirección válida y **protección** ok? Si no → **señal** o se elimina el proceso. Si sí, busca un **marco libre**; si no hay, corre el **algoritmo de reemplazo**.
  5. Si la víctima está **sucia**: se planifica su escritura al disco, **cambio de contexto** (el proceso queda **BLOQUEADO**) y el marco se marca **ocupado**.
  6. Cuando el marco está limpio: busca la **dirección en disco** de la página y planifica la lectura (el proceso sigue suspendido).
  7. **Interrupción de disco**: se actualiza la **tabla de páginas** (marco, P = 1) y el marco queda normal; el proceso pasa a **LISTO**.
  8. Se **respalda la instrucción**: el PC vuelve al inicio de la instrucción que falló.
  9. Se **planifica** el proceso y se vuelve a la rutina en ensamblador.
  10. La rutina **recarga los registros** y vuelve a modo usuario; la instrucción se reejecuta.
  - 🧠 **1–2 y 9–10 son espejo**: es el esquema del **tratamiento de una interrupción** [[u1-seq-interrupcion]] y del **cambio de contexto** [[u2-seq-interrupcion-so]].
  - 🧠 El fallo de página es un **trap** (sincrónico, lo causa la instrucción); la **interrupción** de dispositivo aparece recién en el paso 7.
  - ⚠️ El proceso pasa a **LISTO en el paso 7**, no en el 9; el paso 9 dice que se **planifica** [[u2-transiciones]].
  - ⚠️ La dirección en disco del paso 6 **no está en la tabla de páginas** [[u3-entrada]].
  - ⚠️ **Errata** del paso 4: el libro dice "no ha ocurrido un fallo de página"; tiene que decir "no hubo **violación de protección**".
  - ⚠️ Matiz de mi respuesta: con dirección inválida, el proceso recibe una **señal** o se elimina; y el marco se marca **ocupado** durante la E/S.
- **Respaldo de instrucción** (fig. 3-28) — al fallar, el PC puede valer 1000, 1002 o 1004 según qué operando falló, y puede haber **autoincrementos** a medio hacer. Algunas CPU guardan el PC de inicio en un **registro oculto**; si no, el SO lo deduce.
- **Bloqueo de páginas (pinning)** {#u3-pinning} — un proceso espera E/S con DMA a un búfer; otro proceso falla y el algoritmo elige justo ese marco → la E/S escribe sobre la página nueva y **corrompe las dos**.
  - Solución: **fijar** (pin) la página mientras dura la E/S, o hacer la E/S a **búferes del kernel** y copiar después.
  - 🔗 El **DMA** trabaja con **direcciones físicas** y no se entera de que el SO cambió el dueño del marco [[u1-dma]]. En Windows, `VirtualLock` [[u3-windows]].
- **Almacén de respaldo** (fig. 3-29) — (a) **área de intercambio estática**: cada proceso tiene su área y la página va en origen + número de página (cálculo trivial; − los datos y la pila crecen); (b) **dinámica**: lugar solo cuando se saca, con un **mapa de disco** por proceso.
  - 🔗 Windows usa la idea dinámica: archivo de paginación **justo a tiempo** [[u3-windows]].
- **Separación de política y mecanismo** (fig. 3-30, viene de Mach) — tres partes: **manejador de la MMU** (dependiente de la máquina), **manejador de fallos** (en el kernel) y **paginador externo** (en espacio de usuario). ⚠️ El libro dice "dos partes" y lista tres.
  - El algoritmo de reemplazo suele quedar en el kernel: el paginador externo **no ve los bits R y M**.
  - 🔗 Mecanismo contra política [[u1-mecanismo-politica]] [[u2-politica]].

## Tema 10A — Segmentación ★ {#u3-segmentacion}

> 📖 cap. 3.7 y 3.7.1, págs. 234–238 (figs. 3-31 a 3-34)
> 📄 Repaso U3, pág. 31 — "Tema 10A — Segmentación"

- **El problema** (fig. 3-31) — un compilador con 5 tablas que crecen (texto fuente, símbolos, constantes, árbol sintáctico, pila) en un espacio **unidimensional**: chocan aunque haya lugar en otra. Salidas malas: abortar o hacer de **Robin Hood**.
- **Segmento** {#u3-segmento} — espacio de direcciones **independiente**, de 0 a un máximo, de **longitud variable** que puede cambiar durante la ejecución. Es una **entidad lógica** que el programador conoce (procedimiento, arreglo, pila); en general no mezcla tipos.
  - **Dirección bidimensional**: (número de segmento, dirección dentro del segmento).
- **Ventajas** — (1) crecimiento independiente; (2) **vinculación más simple**: cada procedimiento en (n, 0), recompilar uno no cambia los demás; (3) **compartición** (una biblioteca gráfica en un segmento; con paginación solo se **simula**); (4) **protección por tipo** (procedimiento solo ejecución; arreglo L/E no ejecutable).
  - 🧠 La protección tiene sentido en segmentación porque **cada segmento tiene un solo tipo**; el contenido de una página es **accidental**.
- **Paginación vs. segmentación (fig. 3-33)** ★ {#u3-pag-vs-seg}
  - ¿El programador tiene que saber? Paginación **No** / segmentación **Sí**.
  - ¿Cuántos espacios lineales? **1** / **muchos**.
  - ¿Puede superar la memoria física? **Sí** / **Sí**. 📌 Es la única fila igual: no es una diferencia.
  - ¿Proteger procedimientos y datos por separado? No / Sí. ¿Tablas que cambian de tamaño? No / Sí. ¿Compartir procedimientos? No / Sí.
  - ¿Para qué se inventó? Paginación: un espacio lineal **grande** sin comprar RAM. Segmentación: espacios **lógicamente independientes** para **compartir y proteger**.
  - 🧠 La paginación es para **el tamaño**; la segmentación es para **la organización**.
- **Segmentación pura y tablero de ajedrez** (fig. 3-34) {#u3-tablero} — las páginas son de tamaño fijo y los segmentos no → con el tiempo quedan **segmentos y huecos alternados**: **efecto tablero de ajedrez** o **fragmentación externa**. Se arregla con **compactación** (según la cátedra, costosa).
  - ⚖️ **Paginación → fragmentación interna; segmentación pura → fragmentación externa.** 🔗 Mismo problema de huecos que el intercambio [[u3-intercambio]].
- **Traducción (s, d)** (complemento: el libro no da una cuenta) — tabla de segmentos[s] = {base, límite, protección}: ¿existe s? ¿d < límite? ¿la protección permite? → física = **base + d**.
  - ⚖️ Acá se **SUMA** la base; en paginación se **PEGAN** marco y desplazamiento [[u3-traduccion]]. 🔗 Es base/límite [[u3-base-limite]] con un par por segmento.
  - Ejemplo de clase: (1, 1300) escribir con base 5000, límite 1400, RW → **6300**; (0, 700) con límite 600 → trap (fuera del segmento); (2, 50) escribir en R → trap (protección). Los dos traps son distintos y los dos terminan en **SIGSEGV**.

## Tema 10B — Segmentación con paginación: MULTICS y Pentium ★ {#u3-seg-pag}

> 📖 cap. 3.7.2–3.7.3, págs. 238–247 (figs. 3-35 a 3-43)
> 📄 Repaso U3, pág. 34 — "Tema 10B — Segmentación con paginación: MULTICS y Pentium"

- **Idea** — **paginar cada segmento**: de la paginación, tamaño uniforme y no hace falta el segmento entero en RAM (se acaba el tablero de ajedrez); de la segmentación, modularidad, protección y compartición.
- **MULTICS** {#u3-multics} — hasta **2¹⁸ segmentos** de hasta **65.536 palabras** de 36 bits; páginas de **1024 palabras**.
  - **Dirección de 34 bits**: segmento **(18)** | página **(6)** | desplazamiento **(10)**.
  - **Tabla de segmentos** con un **descriptor** por segmento; es tan grande que **es un segmento y se pagina**.
  - **Descriptor** — si está en memoria; **puntero de 18 bits** a la tabla de páginas (físicas de 24 bits, alineadas a 64 bytes); longitud en páginas; protección.
  - 📌 **La dirección en disco NO está en el descriptor**: está en otra tabla, la del **manejador de fallos de segmento**. ⚠️ Me faltó decirlo así y hablé de "marcos en el disco" (los marcos son de la RAM).
  - 🔢 **Referencia a memoria en MULTICS**
    1. El número de segmento indexa el segmento de descriptores → descriptor.
    2. ¿La tabla de páginas del segmento está en memoria? No → **fallo de segmento**. ¿Violación de protección? → trap.
    3. Se examina la entrada de la página: no está → **fallo de página**; está → origen del marco.
    4. Origen del marco + desplazamiento = dirección física.
    5. Se hace la lectura o escritura.
  - ⚖️ **Fallo de segmento** (falta la **tabla de páginas** del segmento) vs. **fallo de página** (la tabla está; falta la **página**). Después de un fallo de segmento puede venir un fallo de página.
  - **TLB de 16 entradas**, compara (segmento, página) en paralelo; tiene protección y un campo **edad** para sacar la de uso menos reciente.
- **Intel Pentium** {#u3-pentium} — **16K segmentos** de hasta mil millones de palabras de 32 bits.
  - **LDT** (una **por programa**: código, datos, pila) y **GDT** (**una sola**: segmentos del sistema y del SO).
  - **Selector** de 16 bits en un registro de segmento (**CS** código, **DS** datos): **índice (13) | TI (1: 0 = GDT, 1 = LDT) | nivel de privilegio (2)** → 8K descriptores por tabla. El **descriptor 0 está prohibido**.
  - Truco: se ponen en 0 los 3 bits bajos del selector y se suma la dirección de la tabla (cada descriptor ocupa **8 bytes**). Ejemplo del libro: **selector 72** → índice 9, GDT, en **GDT + 72**.
  - 🔢 **Traducción (selector, desplazamiento)**
    1. Del selector se obtiene el **descriptor** (base 32 bits, límite 20 bits, G, P, DPL, tipo).
    2. ¿Selector 0 o **P = 0**? → trap.
    3. ¿Desplazamiento más allá del **Límite**? → trap. **G = 0**: límite en **bytes** (hasta 1 MB); **G = 1**: en **páginas de 4 KB** (hasta 2³² bytes).
    4. **Dirección lineal = Base + desplazamiento** (se **suma**).
    5. Paginación deshabilitada → física = lineal (**segmentación pura**).
    6. Habilitada → la lineal es virtual: **Dir (10) | Página (10) | Desp (12)** → directorio de páginas → tabla de páginas → marco + Desp. Antes se consulta el **TLB** de (Dir, Página).
  - Dos niveles porque un segmento podría tener 1 millón de páginas; cada tabla cubre **4 MB**, y un segmento chico paga solo **dos páginas**.
  - 🧠 **Paginación deshabilitada → segmentación pura. Todos los segmentos con Base 0 y Límite máximo → paginación pura**: así funcionan todos los SO actuales en el Pentium (solo OS/2 usó todo). Según la cátedra, "usan paginación y simulan segmentación mínima".
  - 🧠 Método para el ejercicio: selector **en binario** (13 | 1 | 2); límite **en decimal** (× 4096 si G = 1); lineal **sumando en hexa**; Desp = **3 últimos dígitos hexa**; Dir y Página: los 5 primeros hexa **en binario** cortados 10 | 10; física = **pegar** marco y Desp. Dar el resultado en hexa.
  - Ejemplo de clase: selector 0x002F → índice 5, LDT, nivel 3; base 0x00300000, límite 8 páginas (32 KB), desp 0x2345 → lineal **0x00302345** → Dir 0, Pág 0x302, Desp 0x345 → marco 0x0A1B0 → **0x0A1B0345**.
- **Anillos de protección** (fig. 3-43) {#u3-anillos} — 4 niveles: **0 kernel · 1 llamadas al sistema · 2 bibliotecas compartidas · 3 usuario**. El nivel actual está en **2 bits del PSW**.
  - Se puede acceder a **datos de un nivel más alto** (menos privilegiado); a uno inferior → trap.
  - Llamar a otro nivel: el CALL lleva un selector de **compuerta de llamada**, que da un **punto de entrada oficial**. Vienen de los anillos de MULTICS.
  - 🔗 Los anillos 0 y 3 son el **modo kernel y el modo usuario** [[u1-modos]]; la compuerta es la forma controlada del **TRAP** de una llamada al sistema [[u1-trap]].

## Tema 11 — Casos de estudio: caché, Linux y Windows {#u3-casos}

> 📖 cap. 1.3.2, págs. 23–25; 10.4.2–10.4.3, págs. 761–767; 11.5, págs. 879–894; apunte de comandos de memoria
> 📄 Repaso U3, pág. 39 — "Tema 11 — Casos de estudio: caché y Linux"; pág. 42 — "Tema 11C — El administrador de memoria de Windows"

- **Caché** {#u3-cache} — la RAM se divide en **líneas de 64 bytes**; **acierto** ≈ 2 ciclos; **fallo** → a la RAM con castigo de tiempo. La controla el **hardware** de manera parcial.
  - 🔢 **Las 4 preguntas de cualquier caché**
    1. **Cuándo** se pone un elemento nuevo.
    2. **En qué línea** se pone.
    3. **Qué elemento se saca** cuando falta lugar.
    4. **Dónde se escribe** el desalojado en la memoria más grande.
  - Ejemplo del libro: **4096 líneas de 64 B** → bits **6 a 17** = línea, bits **0 a 5** = byte. Ejemplo de clase: 0x0000A1C5 → línea **647 (0x287)**, byte **5**.
  - **L1** dentro de la CPU (16 KB; una de instrucciones y otra de datos); **L2** de varios MB (1–2 ciclos más). L2 **compartida** (Intel, controlador más complejo) o **por núcleo** (AMD, más difícil la consistencia) [[u2-coherencia]].
  - 🧠 El SO cachea también bloques de archivos, traducciones de rutas y URL → IP.
- **Linux** {#u3-linux}
  - **`malloc`** es un procedimiento de **biblioteca de ANSI C**, no una llamada al sistema; **POSIX no especifica** llamadas de memoria ("pasar la cubeta").
  - `brk(direc)` — cambia el tamaño del **segmento de datos**. `mmap(direc, lon, prot, banderas, fd, despl)` — **mapea un archivo** (direc y lon múltiplos de página; el archivo tiene que estar abierto). `munmap(direc, lon)` — desmapea.
  - 📌 **`free`, `calloc` y `realloc` no están en el material** (solo `malloc`). Lo estándar de C, como complemento: free devuelve, calloc pide e inicializa en cero, realloc cambia el tamaño.
  - 3 GB de usuario + 1 GB de kernel (32 bits); tablas de **cuatro niveles**; **algoritmo de colegas** [[u3-colegas]] + **asignador de losas** + **vmalloc**.
  - **Comandos de la cátedra**:
    - `free -h` — mirar **available**, no free: Linux usa la RAM libre como **buff/cache**.
    - `smem -r -k` — **USS** = exclusiva; **PSS** = privada + parte proporcional de la compartida (la mejor para comparar); **RSS** = cuenta la compartida entera (**exagera**). 🔗 RSS vs. PSS es la compartición de páginas [[u3-compartir]].
    - `vmstat 1` — `r` alto: esperan CPU; `b`/`wa` altos: esperan E/S; **`si`/`so` altos: swap intenso** (sobrepaginación) [[u3-sobrepaginacion]]; `cs`: cambios de contexto.
    - `cat /proc/meminfo` — MemAvailable, **Dirty** (= bit M), Active/Inactive, **PageTables**.
  - ⚠️ En vmstat, **`id` bajo NO es "CPU ociosa"**: en la sobrepaginación el tiempo se va a **wa** (espera de disco) y **sy** (kernel atendiendo fallos), y casi nada a **us**.
- **Windows** {#u3-windows}
  - **Espacio** (x86): 4 GB = **2 GB usuario + 2 GB kernel** (3/1 opcional en servidores); los **64 KB de abajo y de arriba son inválidos** (atrapan punteros nulos); el kernel está en el espacio de cada proceso para que la **llamada al sistema no cambie el mapa**. Páginas de 4 KB (y de 4 MB para el TLB). **No usa segmentación** [[u3-pentium]].
  - **Estados de una página virtual**: **inválida** (referencia → violación de acceso), **reservada** (no se usa para otra cosa; ej.: la pila, páginas de guardia) y **confirmada** (tiene código o datos).
  - **Archivo de paginación "justo a tiempo"**: el lugar se asigna recién al **sacar** la página; permite **agrupar** escrituras contiguas; si todo entra en RAM, no hace falta. Hasta 16 archivos. El código (EXE, DLL) se relee del archivo del programa.
  - **API Win32**: VirtualAlloc/Free/Protect/Query, **VirtualLock** (= pinning [[u3-pinning]]), CreateFileMapping/MapViewOfFile (= mmap). Regiones en límites de **64 KB**. **VAD** por región, en un **árbol balanceado**.
  - **Fallos de página: 5 categorías** — (1) no confirmada → violación de acceso; (2) violó permisos → violación de acceso; (3) **copia en escritura** → copia privada y reintenta [[u3-cow]]; (4) **crece la pila** → página en ceros; (5) confirmada pero no asignada → fallo normal.
  - 📌 (2) y (3) tienen el **mismo síntoma** (escribir en solo lectura), pero la 3 no es un error.
  - ⚖️ **Fallo suave** (la página se encuentra en memoria: lista en espera o de modificadas, compartida, página en ceros) vs. **fallo duro** (hay que leer del disco). **SuperFetch** prepagina a la lista en espera y convierte duros en suaves.
  - **PTE x86**: 20 bits de marco + P, R/W, U/S, **A** (= R), **D** (= M), G, PCD, PWT, AVL. A y D los pone el hardware → aproximación de LRU [[u3-envejecimiento]].
  - **Reemplazo**: conjunto de trabajo **por proceso** con **mínimo** (20–50) y **máximo** (45–345), no son límites duros; actúa solo si escasea la memoria, cada 1 s, en **3 niveles**: mucha memoria → envejece con el bit A; empieza a escasear → reemplaza las más viejas; escasa → recorta por debajo del máximo. 🔗 Local con tamaño variable + envejecimiento + conjunto de trabajo [[u3-local-global]] [[u3-conjunto-trabajo]].
  - **Las 5 listas** (base de datos **PFN**): **modificadas**, **en espera**, **libres**, **en ceros**, **defectuosas**.
  - 🔢 **Transiciones de la fig. 11-36**
    1. Desalojo del conjunto de trabajo → **modificadas** (sucia) o **en espera** (limpia). No se escribe al disco en ese momento.
    2. **Fallo suave**: de modificadas o en espera vuelve al conjunto de trabajo, sin E/S.
    3. Termina el proceso → **libres** (sus páginas sucias **no** se escriben).
    4. **Escritor de páginas modificadas** → escribe al disco y pasa a **en espera** [[u3-limpieza]].
    5. Desasignación → **libres** (salvo compartidas).
    6. Página referenciada que hay que leer del disco (**fallo duro**) → toma un marco **libre** (se sobrescribe entero).
    7. Hilo **ZeroPage** (prioridad **mínima**) → **en ceros**, por **seguridad**.
    8. Se necesita una página cero (crece la pila, página nueva) → del conjunto **en ceros**.
  - ⚠️ Para copiar una página COW alcanza una **libre**: se sobrescribe entera; las páginas **en ceros** son para cuando el contenido no se sobrescribe.

## Cierre de la U3 y lo que más se toma {#u3-examen}

> 📄 Repaso U3, pág. 46 — "Cierre de la Unidad 3"

- **Los 8 puntos**
  1. **Abstraer la memoria**: base y límite, intercambio, huecos, mapa de bits y listas, primer/siguiente/mejor/peor ajuste [[u3-espacio]] [[u3-ajustes]].
  2. **Paginación**: página | desplazamiento, MMU, tabla (P, R, M, protección, marco), se **pega** el marco [[u3-traduccion]].
  3. **Rápida y chica**: TLB, fallo suave/duro, multinivel e invertida [[u3-tlb]] [[u3-multinivel]].
  4. **Reemplazo**: óptimo, NRU, FIFO (Belady), segunda oportunidad, reloj, LRU, envejecimiento, conjunto de trabajo, WSClock [[u3-reemplazo]] [[u3-lru]].
  5. **Diseño**: local/global, PFF, sobrepaginación y control de carga, p = √(2se), compartición y COW, limpieza [[u3-diseno]] [[u3-compartir]].
  6. **Fallo de página en 10 pasos**, respaldo de instrucción, pinning [[u3-diez-pasos]].
  7. **Segmentación**: fig. 3-33, fragmentación externa; MULTICS y Pentium [[u3-pag-vs-seg]] [[u3-seg-pag]].
  8. **Casos reales**: caché, Linux (brk/mmap, comandos), Windows (suave/duro, 5 listas) [[u3-casos]].
- **Lo que más se toma** (parciales, prácticos y exámenes del material)
  - ★★★ **Traducción de dirección virtual a física** en binario o hexa, con páginas de 1 KB y 4 KB [[u3-traduccion]].
  - ★★★ **Segunda oportunidad con la tabla de páginas** (R, M, P, marco): víctima, justificación, tabla modificada y **cola final** [[u3-segunda]].
  - ★★ **Contar fallos** con N marcos en FIFO, LRU y óptimo [[u3-reemplazo]].
  - ★★ Teoría: los **10 pasos**, la **sobrepaginación** y su solución, **paginación vs. segmentación** [[u3-diez-pasos]] [[u3-sobrepaginacion]] [[u3-pag-vs-seg]].
- **Simuladores de la unidad** (en `unidades/u03-memoria/visuales/`) — `asignacion_memoria.html`, `traduccion_direcciones.html`, `tlb.html`, `tablas_paginas.html`, `reemplazo_paginas.html` (con la pestaña 📝 Examen), `lru_aproximaciones.html`, `diseno_paginacion.html`, `copia_en_escritura.html`, `fallo_de_pagina.html`, `segmentacion.html`, `segmentacion_paginada.html`, `listas_paginas_windows.html`.
