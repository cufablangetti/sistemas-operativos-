

<<<<<< MENSAJE 0 >>>>>>

# Unidad 3: Administración de memoria

## Mapa de la unidad

La pregunta que recorre toda la unidad: **¿cómo hacen varios programas, que juntos no entran en la RAM, para convivir sin pisarse?**

```
 1. Jerarquía de memoria ── "no hay memoria ideal, hay capas"
        │
        ▼
 2. Sin abstracción ──► problema: se pisan y no se pueden reubicar
        │                 solución: ESPACIO DE DIRECCIONES (base y límite)
        ▼
 3. Intercambio ──► procesos ENTEROS van y vienen del disco
        │            hay que anotar los huecos (mapa de bits, listas,
        │            primer/mejor/peor ajuste, colegas)
        ▼
 4. MEMORIA VIRTUAL ★ ──► páginas: solo está en RAM lo que se usa
        │
        ├─ 5. Tabla de páginas y TLB ──► traducir RÁPIDO
        ├─ 6. Multinivel e invertidas ──► tablas que no ocupen todo
        ├─ 7. Reemplazo de páginas ★ ──► ¿qué página saco?
        ├─ 8. Diseño ──► local/global, sobrepaginación, tamaño de página
        └─ 9. El fallo de página, paso a paso
        │
        ▼
10. Segmentación ──► varios espacios lógicos (MULTICS, Pentium)
        │
        ▼
11. Casos de estudio y comandos (Linux, Windows, free, smem, vmstat)
```

Los ★ son lo que más se toma: **traducir direcciones** (tema 4) y **segunda oportunidad con la tabla de páginas** (tema 7). En los dos casos te voy a armar un simulador.

La lógica de la unidad es una escalera: cada tema resuelve el problema que dejó el anterior y abre uno nuevo. Si te perdés, preguntate qué problema venía a resolver ese tema.

---

## Tema 1 de 11: La jerarquía de memoria y el administrador de memoria

### La intuición

Imaginá una cocina. Lo que estás usando ahora está en la mano (los **registros**). Lo que vas a usar enseguida está sobre la mesada (la **caché**). Los ingredientes del día están en la heladera (la **RAM**). El resto está en la despensa del fondo (el **disco**). Nadie guarda todo en la mano, porque no entra, ni va a la despensa por cada cucharada, porque tardaría una eternidad.

Esto ya lo viste en la U1. Acá vuelve porque **el sistema operativo administra la heladera**: qué entra, de quién es cada estante y qué se tira cuando no hay lugar.

### Lo formal

La memoria ideal sería infinita, rapidísima, no volátil y barata. **No existe.** Por eso se construye una **jerarquía**:

```
            ┌────────────┐  1 ns     < 1 KB     ▲ más rápida
            │ Registros  │                      │ más cara por bit
            ├────────────┤                      │ más chica
            │   Caché    │  2 ns      4 MB      │
            ├────────────┤                      │
            │    RAM     │  10 ns     ~GB       │
            ├────────────┤                      │
            │   Disco    │  10 ms     ~TB       │ más lenta
            ├────────────┤                      │ más barata
            │   Cinta    │  100 s               ▼ más grande
            └────────────┘
   (números del libro, fig. 1-9: valen las proporciones)
```

- **Volátil** (se pierde al apagar): registros, caché y RAM.
- **No volátil**: ROM, flash y disco. La CMOS es volátil, pero tiene una pila que la mantiene.

**El administrador de memoria** es la parte del SO que:
1. lleva el registro de qué partes de la memoria están en uso,
2. asigna memoria a los procesos cuando la piden,
3. la libera cuando terminan.

La caché la maneja el **hardware**, así que la unidad se concentra en la **RAM**.

### La caché, en una línea (repaso de la U1)

La RAM se divide en **líneas de 64 bytes**. Si la línea que pedís está en la caché, hay un **acierto**. Si no está, hay un **fallo**: se va a la RAM y se trae la línea entera. Funciona por la **localidad**: lo que usaste hace poco y lo que está al lado lo vas a volver a usar.

### Ejemplo: por qué importa la localidad

Caché de 1 ns, RAM de 10 ns.

| Aciertos | Cuenta | Tiempo medio |
|---|---|---|
| 95 % | 0,95 × 1 + 0,05 × (1 + 10) | **1,50 ns** (6,67 veces más rápido) |
| 50 % | 0,50 × 1 + 0,50 × (1 + 10) | **6,00 ns** (apenas 1,67 veces más rápido) |

La caché vale lo que vale la localidad del programa. Lo podés mover con deslizadores en la [calculadora](visuales/calculadoras.html), en la pestaña «Tiempo con caché».

### La idea que se repite en toda la unidad

> La caché es un caso de algo más general: **un nivel rápido y chico que guarda lo más usado de un nivel lento y grande.**

Vas a ver la misma idea en el resto de la unidad:
- la **RAM** funciona como caché del **disco** (eso es la memoria virtual);
- el **TLB** es una caché de la **tabla de páginas**;
- elegir qué página sacar de la RAM es el mismo problema que elegir qué línea sacar de la caché.

📖 Tanenbaum, cap. 1.3.2, págs. 23–26, y la introducción del cap. 3, págs. 175–176.

---

### Dos preguntas rápidas

**1.** Te dicen: «agregar más caché siempre hace al programa mucho más rápido». ¿Es verdad? ¿De qué depende?

**2.** ¿Por qué la unidad se concentra en administrar la RAM y no la caché, si las dos son memoria?

Respondé con tus palabras y después seguimos con el tema 2: qué pasa cuando no hay ninguna abstracción y dos programas se pisan.

<<<<<< MENSAJE 1 >>>>>>

**Respuesta corta:** la U3 lleva unas **15 horas**, es decir, **5 o 6 días a 2,5–3 horas por día**. Es la otra unidad pesada, junto con la U2.

| Ritmo | Días para la U3 | Terminarías |
|---|---|---|
| 3 h por día | 5 días | sábado 14/11 |
| 2,5 h por día | 6 días | domingo 15/11 |
| 2 h por día | 7–8 días | lunes 16 o martes 17/11 |

Un día típico, igual que en la U2:
1. **20 minutos** de video de NotebookLM (lo podés escuchar mientras hacés otra cosa).
2. **60 a 90 minutos** de clase acá, de 2 a 3 temas por día.
3. **20 a 30 minutos** practicando con los simuladores. En esta unidad es clave, porque la traducción de direcciones y la segunda oportunidad salen con práctica, no leyendo.

**Cómo estás con el calendario:** el plan original ponía la U3 entre el 2 y el 8 de noviembre. Hoy es 9, así que vas **una semana atrasado**, y de los 8 días de colchón te queda más o menos 1. No es grave, pero ya no hay margen para estirarse.

Lo que te propongo para llegar bien al 1 de diciembre:

| Fechas | Qué |
|---|---|
| 9 al 14/11 | **U3** a 3 horas por día (no recortar: es la que más ejercicios tiene) |
| 15 al 19/11 | U4 y U5 |
| 20 al 24/11 | U6 y U7 |
| 25 al 28/11 | U8 y U9 (las más teóricas: se pueden comprimir) |
| 29 y 30/11 | Repaso final y cuestionarios pendientes (U1, U2 y los nuevos) |

Si un día solo podés 2 horas, no pasa nada. Pero en promedio necesitás **unas 3 horas por día** de acá al final.

Cuando quieras, respondé las dos preguntas del tema 1 y seguimos.

<<<<<< MENSAJE 2 >>>>>>

### Corrección

**1. Correcta en la idea, pero falta la palabra clave.** Lo que dijiste, que la caché sirve si guarda lo que se busca repetidamente, tiene nombre: **localidad**. Y la respuesta a «¿siempre?» es **no**. Si el programa tiene mala localidad (salta por toda la memoria sin repetir), la caché casi no acierta y agrandarla ayuda poco: con 50 % de aciertos pasás de 10 ns a 6 ns, no a 1,5 ns.

> Frase de examen: «La caché vale lo que vale la localidad del programa».

**2. No.** La caché no es «más temporal» que la RAM: las dos son volátiles y las dos guardan datos de los procesos. La diferencia es **quién la administra**:

| | ¿Quién decide qué guarda? |
|---|---|
| Caché | el **hardware**, solo, en nanosegundos |
| RAM | el **sistema operativo** (el administrador de memoria) |

La unidad estudia la RAM porque es la que maneja el SO. La caché ocurre «debajo» del SO, sin que este intervenga.

---

## Tema 2 de 11: Sin abstracción de memoria y el espacio de direcciones

### La intuición

Imaginá un edificio donde las oficinas no tienen número propio: cada inquilino usa la dirección de la calle. Si el inquilino A dice «dejá el paquete en el 28» y el inquilino B también dice «el 28», los dos paquetes van a la misma puerta. Se pisan.

La solución es que cada inquilino tenga su **numeración interna** («mi oficina 28»), y que un conserje la traduzca a la dirección real según dónde está ubicado cada uno. Ese conserje es el hardware de **base y límite**.

### Paso 1: sin abstracción

En las primeras computadoras (mainframes antes de 1960, PC antes de 1980), **el programa veía la memoria física directamente**. `MOV REGISTRO1, 1000` leía la celda física 1000, sin traducción.

Consecuencia: **no podía haber dos programas en memoria**. Si el primero escribía en la 2000, borraba lo que el segundo tenía ahí.

### Paso 2: el truco de la IBM 360 y el problema que quedó

La IBM 360 dividió la memoria en bloques de 2 KB con una **llave de protección** de 4 bits. El PSW del proceso también tenía una llave: si no coincidían, había un trap. Así los programas ya no se pisaban los datos.

Pero quedaba el **problema de la reubicación** (fig. 3-2):

```
  Programa 1 (16 KB)          Programa 2 (16 KB)
  0:  JMP 24                  0:  JMP 28
  24: MOV                     28: CMP

  Cargados uno tras otro en la memoria física:

  0      JMP 24    ┐
  24     MOV       │ programa 1
  28     ADD   ◄───┼──── ¡el JMP 28 del programa 2 cae ACÁ!
  ...              ┘
  16384  JMP 28    ┐
  16412  CMP       │ programa 2 (su CMP está en 16384 + 28)
  ...              ┘
```

El programa 2 se escribió pensando que empezaba en 0. Su `JMP 28` salta a la dirección **física** 28, que está dentro del programa 1. Falla en menos de un segundo.

**Parche: la reubicación estática.** Al cargar el programa en 16384, se le suma 16384 a todas sus direcciones. Funciona, pero tiene tres problemas: es lento, no es general, y el cargador tiene que saber qué números son direcciones (`JMP 28`: reubicar) y cuáles son constantes (`MOV REG, 28`, que carga el número 28: no reubicar).

### Paso 3: la solución, el espacio de direcciones

> **Espacio de direcciones:** el conjunto de direcciones que puede usar un proceso para direccionar la memoria. Cada proceso tiene el suyo.

Es la misma jugada que en la U2: **el proceso es una CPU abstracta y el espacio de direcciones es una memoria abstracta**. La dirección 28 de un proceso no tiene nada que ver con la dirección 28 de otro.

Hay que resolver dos problemas a la vez: la **protección** (no tocar lo ajeno) y la **reubicación** (funcionar en cualquier lugar).

### Registros base y límite

Son dos registros de hardware de la CPU (se usaron desde la CDC 6600 hasta el 8088):
- **base** = dónde empieza el proceso en la memoria física;
- **límite** = cuánto mide.

En **cada** acceso a memoria, el hardware hace esto:

```
  dirección del proceso (d)
          │
          ▼
   ¿d ≥ límite? ──sí──► FALLO (trap): se sale de su espacio
          │ no
          ▼
     d + base ──────────► dirección física ──► bus de memoria
```

### Ejemplo resuelto

El programa 2 se ejecuta con **base = 16384** y **límite = 16384**.

| El proceso pide | ¿Menor que el límite? | Física = d + base | Resultado |
|---|---|---|---|
| `JMP 28` | 28 < 16384 ✅ | 16412 | llega a su CMP ✔ |
| `MOV REG, 100` | 100 < 16384 ✅ | 16484 | correcto |
| dirección 20000 | 20000 ≥ 16384 ❌ | — | **trap**: protección |

El programa no se modificó al cargarlo: se escribió suponiendo que empieza en 0, y el hardware lo reubica en cada acceso. Por eso se llama **reubicación dinámica**.

- **Ventaja:** simple, y cada proceso tiene su espacio privado.
- **Desventaja:** una **suma y una comparación en cada acceso** a memoria. La suma es lenta por la propagación del acarreo.
- 📌 Solo el SO puede cambiar los registros base y límite. Si el proceso pudiera tocarlos, se saldría de su espacio. Es la misma lógica que el bit de modo del PSW en la U1.

🔗 **Conexión con la U1:** la IBM 360 guardaba la llave en el **PSW**, el mismo registro donde vive el bit de modo kernel/usuario. La protección de memoria la impone el **hardware** y la configura el **SO**: la misma regla de la U1.

> Sobre las **particiones fijas** del programa: esta edición del libro no las desarrolla como tema propio. Lo más cercano son las llaves de la IBM 360 y los registros base y límite.

📖 Tanenbaum, cap. 3.1 y 3.2.1, págs. 176–181 (figs. 3-1, 3-2 y 3-3).

---

### Dos preguntas rápidas

**1.** Un proceso tiene **base = 40000** y **límite = 8000**. Ejecuta tres accesos: a la dirección **500**, a la **7999** y a la **8000**. ¿Qué dirección física sale en cada caso, o qué pasa?

**2.** Con la reubicación estática, el cargador tiene que distinguir entre `JMP 28` y `MOV REG, 28`. ¿Por qué con base y límite ese problema **desaparece**?

<<<<<< MENSAJE 3 >>>>>>

### Corrección

**1. Dos bien y una mal.** 500 → **40500** ✅ y 7999 → **47999** ✅.

La de **8000 es un trap**, no 48000. La condición es «¿d ≥ límite?», y 8000 ≥ 8000. El límite es el **tamaño**: con 8000 direcciones válidas, van **de 0 a 7999**. La 8000 ya es la primera dirección **afuera**.

```
  direcciones válidas: 0 … 7999   (8000 en total)
  8000 ──► ya no es del proceso ──► TRAP
```

⚠️ Es la trampa típica del «uno de más». Fijate que la condición es **≥**, no **>**.

**2. Parcial.** Es cierto que hay un control de protección, pero esa no es la razón. La razón es que **el programa no se toca**: queda escrito tal cual, como si empezara en 0. La suma la hace el hardware **en el momento de cada acceso a memoria**.

- `JMP 28`: el 28 se usa como **dirección**, así que pasa por el hardware y se le suma la base → 16412.
- `MOV REG, 28`: el 28 es un **número** que va a un registro, no un acceso a memoria. Nunca pasa por la suma, así que queda 28.

Nadie tiene que distinguir de antemano qué es dirección y qué es constante: **solo se reubica lo que efectivamente se usa para acceder a memoria.**

---

## Tema 3 de 11: Intercambio y administración de la memoria libre

### La intuición

Pensá en un estacionamiento sin lugares marcados, donde cada auto ocupa lo que mide. Entran y salen autos todo el día, y van quedando **huecos** de distintos tamaños. Cuando llega un auto nuevo, el cuidacoches tiene que (1) saber dónde hay huecos y (2) decidir en cuál lo pone. Y si un auto no entra en ningún lado, alguno tiene que irse un rato a la calle: eso es el **intercambio**.

### Intercambio (swapping)

La RAM no alcanza para todos (un Windows arranca con 40 a 60 procesos). La solución más simple:

> **Intercambio:** traer cada proceso **completo** a memoria, ejecutarlo un rato y devolverlo al disco.

```
 (a)    (b)    (c)    (d)    (e)    (f)    (g)        fig. 3-4
 ┌──┐   ┌──┐   ┌──┐   ┌──┐   ┌──┐   ┌──┐   ┌──┐
 │  │   │  │   │C │   │C │   │C │   │C │   │C │
 │  │   │B │   │B │   │B │   │B │   │  │   │A │◄ A vuelve en OTRO lugar
 │A │   │A │   │A │   │  │◄  │D │   │D │   │D │   (hay que reubicarlo:
 │SO│   │SO│   │SO│   │SO│   │SO│   │SO│   │SO│    base y límite)
 └──┘   └──┘   └──┘   └──┘   └──┘   └──┘   └──┘
                      sale A  entra D sale B
```

Problemas que aparecen:
- **Quedan huecos.** Juntarlos moviendo todo hacia abajo se llama **compactación**, y casi no se hace porque es carísima. Con 1 GB, copiando 4 bytes cada 20 ns, tarda unos **5 segundos**.
- **Los procesos crecen.** El heap crece hacia arriba y la pila hacia abajo. Por eso se les deja un **espacio para crecer** entre los dos. Si se llena, el proceso se mueve, se intercambia o se elimina.

### Cómo anotar qué está libre

**1. Mapa de bits:** un bit por unidad de asignación (0 = libre, 1 = ocupado).

```
 memoria:  [A A A A A][· · ·][B B B B B B][C C C C][· ·][D D D D D D][E E E][· · ·]
 bits:      1 1 1 1 1  0 0 0  1 1 1 1 1 1  1 1 1 1  0 0  1 1 1 1 1 1  1 1 1  0 0 0
```

- + Simple. El tamaño del mapa depende solo del tamaño de la memoria y de la unidad.
- − Para meter un proceso de k unidades hay que **buscar k ceros seguidos**, y esa búsqueda es lenta.
- 🔢 Ejemplo: 32 MB en unidades de 4 KB son 8192 unidades, o sea 8192 bits = **1 KB de mapa**.

**2. Lista ligada** (ordenada por dirección): cada nodo dice P (proceso) o H (hueco), dónde empieza y cuánto mide.

```
 P 0,5 → H 5,3 → P 8,6 → P 14,4 → H 18,2 → P 20,6 → P 26,3 → H 29,3
```

Cuando un proceso X termina, se **fusiona** con los huecos vecinos (fig. 3-7):

```
 A X B  →  A · B        (X se vuelve hueco)
 A X ·  →  A ···        (se une con el de la derecha)
 · X B  →  ··· B        (se une con el de la izquierda)
 · X ·  →  ·····        (los tres en uno; la lista pierde 2 nodos)
```

### ¿En qué hueco lo pongo? Los algoritmos de asignación

| Algoritmo | Regla | Lo que hay que saber |
|---|---|---|
| **Primer ajuste** | el **primer** hueco que alcance | **rápido**: busca lo menos posible |
| **Siguiente ajuste** | igual, pero sigue **desde donde quedó** | un poco **peor** que el primer ajuste |
| **Mejor ajuste** | el hueco **más chico** que alcance | ⚠️ **desperdicia MÁS**: deja huecos diminutos inútiles, y es lento (recorre toda la lista) |
| **Peor ajuste** | el hueco **más grande** | tampoco funciona bien |
| **Ajuste rápido** | listas separadas por tamaño (4 KB, 8 KB…) | rapidísimo, pero fusionar vecinos es caro y se fragmenta |

📌 **Trampa de examen:** «el mejor ajuste es el que menos memoria desperdicia» es **falso**. Por elegir siempre el hueco justo, va dejando sobras chiquitas en las que no entra nadie.

### Ejemplo resuelto

Huecos en orden de dirección: **10, 4, 20, 18, 7, 9, 12 y 15 KB**. Llegan pedidos de **12, 10 y 9 KB**.

| | Pedido de 12 | Pedido de 10 | Pedido de 9 |
|---|---|---|---|
| Primer ajuste | 20 (sobran 8) | 10 (exacto) | 18 (sobran 9) |
| Mejor ajuste | 12 (exacto) | 10 (exacto) | 9 (exacto) |
| Peor ajuste | 20 (sobran 8) | 18 (sobran 8) | 15 (sobran 6) |
| Siguiente ajuste | 20 (sobran 8) | 18 (sigue desde el 20) | 9 (sigue desde el 18) |

El caso del siguiente ajuste: después del 12, el hueco de 20 quedó en 8 y no alcanza para 10, así que sigue al 18. Para el 9 arranca desde el 18 (que quedó en 8, no alcanza) y el siguiente que sirve es el 9.

### El sistema de colegas (buddy system)

El programa lo llama «sistema compañero». En el libro está en el caso de estudio de Linux, no en esta sección. La regla es **todo en potencias de 2**:

```
 pedido de 8 páginas sobre un bloque de 64:
 [              64              ]
 [      32      ][      32      ]
 [  16  ][  16  ][      32      ]
 [ 8][ 8][  16  ][      32      ]   ← se asigna uno de 8
```

Cuando se liberan dos **colegas** (dos mitades que salieron del mismo bloque), se vuelven a unir.

- + Encontrar y fusionar bloques es rapidísimo.
- − **Fragmentación interna** enorme: si pedís 65 páginas, te dan 128 y se desperdician 63.

📖 Tanenbaum, cap. 3.2.2 y 3.2.3, págs. 181–187 (figs. 3-4 a 3-7). Algoritmo de colegas: cap. 10.4.3, págs. 765–767.

Ahora te armo un simulador de asignación para que pruebes los cuatro algoritmos con tus propios datos, como pide el formato.

<<<<<< MENSAJE 4 >>>>>>

Ahora verifico el motor del simulador con el ejemplo de la clase y con los cuatro casos de fusión.

<<<<<< MENSAJE 5 >>>>>>

Las 12 comprobaciones del motor pasaron. La pruebo en Chrome y la agrego al índice y a la pestaña de gráficos del mapa.

<<<<<< MENSAJE 6 >>>>>>

Te dejé abierto el **[simulador de asignación de memoria](unidades/u03-memoria/visuales/asignacion_memoria.html)**. Lo comprobé con un script (los cuatro algoritmos y los cuatro casos de fusión) y en Chrome, también en vista de celular. Ya está en el índice y en la pestaña 🎛 del mapa gráfico, que por lo demás quedó igual que antes.

Cómo usarlo:
- Elegí un algoritmo y andá con **Siguiente paso**: ves qué huecos mira (✗ no alcanza, ✓ el elegido) y cuánto sobra.
- En «Pedidos» probá `A12 B10 -A C9`: el `-A` libera A y muestra la fusión con sus vecinos.
- Abajo, la tabla compara los cuatro algoritmos con tus mismos datos.

---

### Dos preguntas rápidas del tema 3

**1.** Huecos en orden de dirección: **6, 14, 3, 9 y 20 KB**. Llegan pedidos de **8 KB** y después de **5 KB**. ¿Qué hueco elige cada uno de los cuatro algoritmos para cada pedido? Resolvelo a mano y después comprobalo en el simulador.

**2.** Un compañero dice: «El mejor ajuste es el mejor algoritmo porque elige el hueco justo y no desperdicia memoria». ¿Qué le contestás?

<<<<<< MENSAJE 7 >>>>>>

### Corrección

**1. Siete de ocho bien.** Primer, mejor y peor ajuste están perfectos ✅.

En el **siguiente ajuste**, el pedido de 5 KB **no** va al de 9. Hay que mirar bien desde dónde arranca la búsqueda:

```
 antes:       [6] [14] [3] [9] [20]
 pide 8 ──►   [6] [8 ocupado|6 libre] [3] [9] [20]
                          ▲
                quedó acá ─┘
 pide 5 ──►   arranca desde ACÁ: lo que sobró del 14 (6 KB) ¿alcanza? SÍ
```

El siguiente ajuste **retoma donde quedó**. Lo primero que encuentra es el sobrante de 6 KB del hueco de 14, que alcanza para 5. Vos saltaste al 9, como si la búsqueda empezara *después* del hueco usado. Lo chequeé con el motor del simulador: da «hueco de 6», el que sobró del 14.

**2. Correcta** ✅. Es exactamente así: al elegir siempre el hueco justo, deja sobras diminutas (en tu ejercicio, el 9 queda en 1 KB) donde no entra nadie. Para redondearla, agregale que además es **lento**, porque recorre toda la lista cada vez.

---

## Tema 4 de 11: Memoria virtual y paginación ★

### La intuición

Estás estudiando un libro de 1000 páginas, pero en el escritorio te entran 20. No necesitás las 1000 a la vez: tenés sobre la mesa las que estás leyendo y el resto en la biblioteca. Si necesitás una que no está, vas a buscarla y devolvés una que ya no usás.

- el libro entero = el **programa** (está completo en el disco),
- el escritorio = la **RAM**,
- ir a la biblioteca = el **fallo de página**.

### Por qué hace falta

El intercambio mueve procesos **enteros**. Con un disco de 100 MB/s, sacar un programa de 1 GB tarda **10 segundos** y traer otro, otros 10. Inviable.

Antes, en los años sesenta, se usaban los **sobrepuestos (overlays)**: el programador partía el programa a mano en pedazos que se cargaban de a uno. Era tedioso y propenso a errores.

> **Memoria virtual** (Fotheringham, 1961): cada programa tiene su propio espacio de direcciones dividido en **páginas**. **No todas tienen que estar en RAM** para que el programa corra. Si se usa una que no está, el SO la trae y reintenta la instrucción.

Según la cátedra: «la memoria virtual nace por la necesidad de que los programas sean más grandes que la memoria».

### Lo formal: páginas, marcos y la MMU

```
       CPU ──(dirección VIRTUAL)──► MMU ──(dirección FÍSICA)──► RAM
       └──────── chip de la CPU ────────┘
```

- **Dirección virtual:** la que genera el programa (`MOV REG, 1000`).
- **Página:** un pedazo de tamaño fijo del espacio **virtual**.
- **Marco de página:** un pedazo del mismo tamaño de la memoria **física**.
- **MMU** (unidad de administración de memoria): hardware que traduce de virtual a física en cada acceso.
- Las transferencias entre RAM y disco son siempre de **páginas completas**.

### El ejemplo central del libro (fig. 3-9)

Direcciones de 16 bits (64 KB virtuales), solo **32 KB de RAM** y páginas de **4 KB**. Eso da **16 páginas y 8 marcos**.

```
 Página virtual        Marco          Página virtual       Marco
  0 (0–4095)      ──►   2              8  (32768–…)    ──►  X  (no está)
  1 (4096–8191)   ──►   1              9               ──►  5
  2 (8192–…)      ──►   6             10               ──►  X
  3               ──►   0             11               ──►  7
  4               ──►   4             12 a 15          ──►  X
  5 (20480–…)     ──►   3
  6, 7            ──►   X
```

Solo 8 de las 16 páginas están en RAM: las de la X están en el disco.

### Cómo traduce la MMU: cortar los bits

Como el tamaño de página es **potencia de 2**, no hay que hacer divisiones: alcanza con **cortar la dirección en dos**.

```
 dirección virtual de 16 bits, página de 4 KB = 2¹² → 12 bits de desplazamiento

   ┌────────┬──────────────────────┐
   │ 4 bits │       12 bits        │
   │ PÁGINA │    DESPLAZAMIENTO    │
   └───┬────┴──────────┬───────────┘
       │ índice        │ se copia TAL CUAL
       ▼               │
   tabla de páginas    │
   ¿presente? ─ no ─► FALLO DE PÁGINA (trap al SO)
       │ sí            │
       ▼               ▼
   ┌────────┬──────────────────────┐
   │ MARCO  │    DESPLAZAMIENTO    │  = dirección FÍSICA
   └────────┴──────────────────────┘
```

> **La regla de oro:** se **reemplaza el número de página por el número de marco** y el desplazamiento **no se toca**.

Bits de desplazamiento = log₂(tamaño de página): **1 KB → 10 bits · 2 KB → 11 · 4 KB → 12.**

### Ejemplo resuelto 1 (del libro, fig. 3-10): la dirección 8196

1. En binario: `0010 0000 0000 0100`.
2. Corto 4 | 12: página `0010` = **2**; desplazamiento `0000 0000 0100` = **4**.
3. Tabla: la página 2 está en el **marco 6** (`110`), presente.
4. Física: `110` + `0000 0000 0100` = **24580** (= 6 × 4096 + 4). ✔

### Ejemplo resuelto 2 (estilo examen de la cátedra)

**0x2C3A** con páginas de **1 KB**; la tabla dice que la página 11 está en el marco 5.

1. Hexa a binario (cada dígito son 4 bits): `0010 1100 0011 1010`.
2. 1 KB son 10 bits de desplazamiento, así que corto 6 | 10: `001011 | 00 0011 1010`.
3. Página = `001011` = **11**; desplazamiento = `00 0011 1010` = **58**.
4. La página 11 está en el marco 5, que en 6 bits es `000101`.
5. Física: `000101 | 00 0011 1010` = `0001 0100 0011 1010` = **0x143A**.
6. Comprobación: 5 × 1024 + 58 = **5178** = 0x143A ✔.

### Y si la página no está: el fallo de página (versión corta)

`MOV REG, 32780` cae en la **página 8** (32768 + 12), que tiene una X.

1. La MMU ve que la página no está presente y la CPU hace un **trap** al SO.
2. El SO elige un marco poco usado. Supongamos el **marco 1**.
3. Si ese marco fue modificado, lo escribe al disco.
4. Trae la página 8 al marco 1.
5. Actualiza la tabla: la página 1 queda «no presente» y la página 8 pasa a estar en el marco 1.
6. **Reintenta** la instrucción: ahora 32780 se traduce a 4096 + 12 = **4108**.

Los diez pasos completos los vemos en el tema 9.

🔗 **Conexión con la U2:** mientras se trae la página del disco, el proceso queda **BLOQUEADO** y el planificador le da la CPU a otro. La memoria virtual encaja perfecto con la multiprogramación.

📖 Tanenbaum, cap. 3.3 y 3.3.1, págs. 188–193 (figs. 3-8, 3-9 y 3-10).

Ahora te armo el simulador de traducción, porque es el ejercicio que más se toma.

<<<<<< MENSAJE 8 >>>>>>

Lo verifico con los ejemplos del libro y de la práctica, y lo pruebo en Chrome.

<<<<<< MENSAJE 9 >>>>>>

Se ve bien y el resultado coincide con la figura 3-10 del libro. Lo agrego al índice y a la pestaña 🎛, y te lo abro.

<<<<<< MENSAJE 10 >>>>>>

Te dejé abierto el **[simulador de traducción de direcciones](unidades/u03-memoria/visuales/traduccion_direcciones.html)**. Lo comprobé con los ejemplos del libro (fig. 3-9 y 3-10), de la práctica (`0x6047` → `0x8847`) y de la clase (`0x2C3A` → `0x143A`). También lo probé en Chrome y en vista de celular.

Cómo usarlo:
- Escribí cualquier dirección: `0x2C3A`, `6047H`, binario con espacios como en los exámenes, o decimal.
- Avanzá con **Siguiente paso**: lo pasa a binario, lo corta con colores (azul = página, verde = desplazamiento), busca la página en la tabla y arma la física con el marco (naranja).
- La tabla de la derecha se puede **editar**: cambiá marcos o destildá «P» para provocar un fallo de página.
- Arriba tenés botones con los ejemplos del libro, la práctica y el examen.

Ya está en el índice y en la pestaña 🎛 del mapa gráfico, que por lo demás quedó igual que antes.

---

### Dos preguntas rápidas del tema 4

**1.** Traducí a mano la dirección **0x1D7B** con páginas de **2 KB** (direcciones de 16 bits). La tabla dice que la página 3 está en el **marco 9**. Dame el número de página, el desplazamiento y la dirección física en hexa. Después comprobalo en el simulador.

**2.** ¿Por qué el tamaño de página es siempre una potencia de 2? ¿Qué se ahorra la MMU gracias a eso?

<<<<<< MENSAJE 11 >>>>>>

## Corrección del tema 4

**1. ✅ Correcta.** Página 3, desplazamiento 0x57B y dirección física **0x4D7B**. Tuviste un solo detalle de forma:

```
0x1D7B = 0001 1 | 101 0111 1011
         página  | desplazamiento (11 bits, porque 2 KB = 2^11)
         00011=3 | 101 0111 1011 = 0x57B
```

El desplazamiento tiene **11 bits**, no 12. Escribiste `0101 0111 1011`, y ese 0 de adelante no le corresponde al desplazamiento. El valor te dio igual por casualidad. En el examen, separá con una barra exactamente donde cortás: si cortás mal, la página te sale mal (por ejemplo, con 12 bits te daría página 1 en vez de 3).

Con marco 9 queda `01001 | 101 0111 1011` = 0100 1101 0111 1011 = **0x4D7B** ✔

**2. 🟡 Parcial.** La idea va bien encaminada, pero "adivinar qué página es" no lo podés poner en el examen. Lo que tenés que decir es esto:

> Como el tamaño es 2ⁿ, la página son los bits altos y el desplazamiento son los n bits bajos. La MMU **no divide ni multiplica**: corta los bits, usa los de arriba como índice de la tabla y **reemplaza** el número de página por el número de marco. El desplazamiento pasa sin tocarse.

Si la página fuera de 3000 bytes, cada traducción necesitaría una división (dirección ÷ 3000) y una multiplicación más una suma. Eso habría que hacerlo en **cada** acceso a memoria, y es demasiado lento.

---

# Tema 5 — La tabla de páginas por dentro y el TLB ★

### La intuición
La tabla de páginas es la **agenda** donde la MMU busca "la página 3 está en el marco 9". El problema es que esa agenda vive en la RAM, así que cada acceso a memoria se convierte en **dos**: uno para leer la agenda y otro para buscar el dato. El rendimiento cae a la mitad.

El **TLB** es como tener anotados en un post-it los 5 o 6 números que más usás: no abrís la agenda para eso.

### 5.1 Qué tiene una entrada de la tabla (fig. 3-11)

```
┌──────────┬───────┬───────┬──────────┬─────────┬──────────┐
│ caché    │ refe- │ modi- │ protec-  │presente/│ Nº de    │
│ deshabil.│ renc. │ ficada│ ción     │ ausente │ MARCO    │
└──────────┴───────┴───────┴──────────┴─────────┴──────────┘
                                                 ↑ el campo más importante
```

| Bit | Quién lo pone | Para qué sirve |
|---|---|---|
| **Presente/ausente** | el SO | Si vale 0 → **fallo de página** |
| **Protección** | el SO | Permisos R / W / X. Violarlos → fallo de protección |
| **Modificada (bit sucio)** | el **hardware**, al escribir | Al desalojar: si está sucia **se escribe al disco**; si está limpia se descarta |
| **Referenciada** | el **hardware**, al leer o escribir | Para elegir la víctima en los algoritmos de reemplazo (tema 7) |
| **Caché deshabilitada** | el SO | Para páginas mapeadas a registros de dispositivos, así no se lee una copia vieja de la caché |

⚠️ **Trampa de examen:** la **dirección en disco** de la página **NO** está en la tabla de páginas. La tabla solo guarda lo que el hardware necesita para traducir. Dónde está la página en el disco lo guarda el SO en sus propias tablas de software.

🧠 Conexión con U1: el bit de caché deshabilitada existe por la **E/S mapeada a memoria**.

### 5.2 Los dos problemas de la paginación
1. **La traducción debe ser rápida**, porque se hace en *cada* referencia a memoria.
2. **La tabla puede ser enorme**: 32 bits con páginas de 4 KB dan 2²⁰ = **1 millón de entradas**, y **cada proceso tiene la suya**.

El TLB resuelve el problema 1. El problema 2 se resuelve con las tablas multinivel e invertidas, que son el tema 6.

### 5.3 El TLB (búfer de traducción adelantada o memoria asociativa)
- Es **hardware**, está **dentro de la MMU** y es chico: el ejemplo del libro tiene 8 entradas, y "raras veces más de 64".
- Funciona porque los programas usan **muchas veces pocas páginas** (localidad).
- Cada entrada tiene: **válida · página virtual · modificada · protección · marco**. A diferencia de la tabla de páginas, el TLB **sí guarda el número de página virtual**, porque no está indexado por página.
- Busca en **todas las entradas a la vez**, en paralelo.

```
          dirección virtual
                │
                ▼
      ┌──────────────────────┐
      │ ¿página en el TLB?   │── SÍ (acierto) ──► ¿protección OK? ──► marco → física
      │ (compara en paralelo)│                         └─ NO → fallo de protección
      └──────────────────────┘
                │ NO (fallo de TLB)
                ▼
      buscar en la tabla de páginas (en RAM)
                │
        ┌───────┴────────┐
     presente=1       presente=0
        │                 │
 cargar la entrada en  FALLO DE PÁGINA → disco
 el TLB (desalojando   (fallo duro)
 una; su bit M vuelve
 a la tabla) y traducir
 (fallo suave)
```

**TLB por software** (en RISC como SPARC, MIPS y HP PA): ante un fallo de TLB, la MMU no recorre la tabla sino que genera un trap y **el SO** carga la entrada. Con unas 64 entradas la eficiencia es aceptable, y a cambio la MMU es más simple, lo que libera espacio en el chip para caché.

### 5.4 Fallo suave vs. fallo duro ★

| | Fallo **suave** | Fallo **duro** |
|---|---|---|
| ¿Dónde está la página? | En **RAM**, pero no en el TLB | **No está en RAM** (tampoco en el TLB) |
| ¿Qué hay que hacer? | Actualizar el TLB | Traerla del **disco** |
| Costo | 10–20 instrucciones, **nanosegundos** | **milisegundos** |
| Relación | — | ≈ **un millón de veces más lento** |

### Ejemplo
Un proceso recorre un arreglo en un ciclo. El código está en las páginas 19–21, el arreglo en 129–130, los índices en 140 y la pila en 860–861. Esas **8 páginas** entran en un TLB de 8 entradas. Así casi todas las referencias son **aciertos** y la tabla en RAM ni se toca. Es el ejemplo del libro (fig. 3-12): fijate que el código tiene protección R-X y los datos RW.

📖 *Tanenbaum, 3.3.2–3.3.3, págs. 193–198.*

---

### Preguntas rápidas

**1.** Un proceso hace un acceso y la página **está en RAM** (presente = 1) pero **no está en el TLB**. ¿Qué tipo de fallo es? ¿Interviene el disco? ¿Qué pasa con el bit M de la entrada del TLB que se desaloja para hacerle lugar?

**2.** Verdadero o falso, y justificá: *"Cuando una página sucia se desaloja, el SO saca de la tabla de páginas la dirección de disco donde tiene que escribirla."*

Cuando me contestes, te armo el **simulador del TLB** paso a paso: vas a ver aciertos, fallos suaves y fallos duros con su costo.

<<<<<< MENSAJE 12 >>>>>>

El motor del simulador del TLB ya pasó las 22 verificaciones. Ahora lo pruebo en el navegador y lo agrego al índice.

<<<<<< MENSAJE 13 >>>>>>

Se ve bien. Ahora lo agrego al índice y a la pestaña 🎛 del mapa gráfico.

<<<<<< MENSAJE 14 >>>>>>

## Corrección del tema 5

**1. 🟡 Parcial.** La primera parte está perfecta: es un **fallo suave**, se actualiza el TLB y no interviene el disco porque la página ya está en RAM ✔.

Lo del bit M está mal, y es la trampa más común de este tema:

> Cuando una entrada **sale del TLB**, su M se copia **a la tabla de páginas en RAM**, no al disco. La página **sigue en memoria**: solo perdió su "post-it".
> Al disco se escribe recién cuando la **página sale de la RAM** (en un fallo duro sin marcos libres) y tiene M = 1.

```
sale del TLB   →  M viaja a la TABLA DE PÁGINAS   (no hay disco)
sale de la RAM →  si M = 1, se ESCRIBE AL DISCO    (cuesta milisegundos)
```

¿Por qué tiene que viajar? Porque al escribir, el hardware pone M = 1 **solo en el TLB**. Si al desalojar la entrada no se copiara, la tabla quedaría con M = 0, y más adelante el SO descartaría una página sucia y perdería los cambios.

**2. ❌ Incorrecta: es FALSO.** La dirección de disco **no está en la tabla de páginas**. La tabla solo guarda lo que el **hardware** necesita para traducir (marco, P, M, R, protección, caché). La ubicación en disco la necesita el **SO**, y la guarda en sus propias tablas de software. Esto es textual del libro, pág. 194, y es una pregunta típica de V/F.

---

## 🎛 Simulador del TLB

Te dejé abierto el **[simulador del TLB](unidades/u03-memoria/visuales/tlb.html)**. Lo verifiqué con 22 casos resueltos a mano y lo probé en Chrome y en vista de celular. Ya está en el índice y en la pestaña 🎛 del mapa gráfico; lo demás del mapa quedó igual.

Lo armé justo con tus dos dudas:
- Cargás páginas como `19 129w 140` (la `w` significa que el acceso escribe).
- A la izquierda se resalta la línea que se ejecuta y **quién** la ejecuta: **MMU** (hardware) o **SO** (software).
- Abajo ves el **TLB**, la **tabla de páginas** y los **marcos**. Fijate en el **M rojo**: aparece primero en el TLB, y en la tabla recién cuando la entrada sale del TLB.
- Cada referencia queda coloreada: acierto en verde, fallo suave en amarillo, fallo duro en rojo y protección en violeta.

**Probalo así:** en el *Ejemplo de clase*, andá a la referencia **8** (`19`) y mirá cómo sale `129` del TLB: su M = 1 pasa a la tabla y hay **0 escrituras a disco**. Después andá a la referencia **10** (`21`): ahí `129` sale de la **RAM**, y recién en ese momento se escribe al disco.

Cuando lo hayas mirado, decime **"seguí"** y pasamos al **tema 6: tablas multinivel e invertidas**, que resuelven el problema de las tablas gigantes.

<<<<<< MENSAJE 15 >>>>>>

Arranco el tema 6. Ya leí la sección 3.3.4 del libro y el resumen de la cátedra. Primero te armo la calculadora y los paneles comparativos, que es el formato que corresponde a este tema.

<<<<<< MENSAJE 16 >>>>>>

Browser test:

<<<<<< MENSAJE 17 >>>>>>

Hay dos detalles visuales: la palabra «marco» queda cortada y falta espacio debajo de los paneles. Los corrijo:

<<<<<< MENSAJE 18 >>>>>>

Ahora lo agrego al índice y al mapa gráfico, y lo abro:

<<<<<< MENSAJE 19 >>>>>>

# Tema 6 — Tablas de páginas para memorias grandes

### La intuición
El TLB resolvió la **velocidad**, pero queda el otro problema: **el tamaño**. Con 32 bits y páginas de 4 KB, la tabla tiene 2²⁰ entradas, o sea **4 MB por proceso**, aunque el proceso use apenas 12 MB.

Es como imprimir una guía telefónica con todos los números posibles del país, incluidos los que no existen. Hay dos salidas:
- **Multinivel:** se arma un índice por zona, y las zonas vacías ni se imprimen.
- **Invertida:** en vez de listar todos los números posibles, se lista una vez cada casa que existe (cada **marco**) con quién vive ahí.

### 6.1 Tablas multinivel (fig. 3-13)

La dirección de 32 bits se corta en **tres** partes:

```
 31          22 21          12 11            0
┌──────────────┬──────────────┬──────────────┐
│  TP1 (10)    │  TP2 (10)    │  desp (12)   │
└──────────────┴──────────────┴──────────────┘
      │               │
      ▼               ▼
 tabla SUPERIOR   tabla de 2º NIVEL  ──►  marco ∥ desp
 (1024 entradas,  (1024 entradas,
  cada una cubre   cada una es
  un trozo de 4 MB) una página de 4 KB)
```

El ejemplo del libro es un proceso de 12 MB: el **texto** en los 4 MB de abajo, los **datos** en los 4 MB siguientes y la **pila** en los 4 MB de arriba. En el medio queda un hueco enorme.

```
Tabla superior          Tablas de 2º nivel
 [0]    ──────────────► tabla del texto
 [1]    ──────────────► tabla de los datos
 [2]    P=0  ┐
  ...   P=0  ├ el hueco: NO tiene tabla de 2º nivel
 [1022] P=0  ┘
 [1023] ──────────────► tabla de la pila
```

Solo hacen falta **4 tablas**: 1 superior más 3 de 2º nivel. Son 4 × 4 KB = **16 KB**, contra **4 MB** de la tabla de un nivel. Si el proceso toca una dirección del hueco, la entrada superior tiene P = 0 y se produce un fallo. El SO ve que es memoria que el proceso no debe usar, y le manda una señal o lo termina.

**Ejemplo resuelto: 0x00403004** (págs. 199–200)
```
0x00403004 = 0000 0000 01 | 00 0000 0011 | 0000 0000 0100
              TP1 = 1     |   TP2 = 3    |   desp = 4
```
- TP1 = 1 cae en la entrada 1 de la tabla superior, que cubre el trozo de 4 MB a 8 MB (los datos).
- TP2 = 3 cae en la entrada 3 de esa tabla, que cubre los bytes 12288 a 16383 del trozo, y de ahí sale el marco.
- La dirección física es ese marco seguido del desplazamiento 4.

⚠️ **Errata:** el libro en español dice "TP2 = 2", pero los bits dan **TP2 = 3**, y el mismo párrafo después dice "extrae la entrada 3". Comprobación: 4M + 3 × 4096 + 4 = 4.206.596 ✔.

🧠 **Truco:** con un corte 10|10|12, los **3 últimos dígitos hexa** son el desplazamiento. Para TP1 y TP2 sí tenés que pasar a binario, porque 10 bits no coinciden con dígitos hexa.

Se puede hacer con 3 o más niveles, pero **más de 3 rara vez conviene**. Costo: sin TLB, cada nivel agrega un acceso a memoria.

### 6.2 Tabla invertida (fig. 3-14)

Con **64 bits** ni el multinivel alcanza: 2⁵² entradas × 8 B = **32 PB** (el libro dice "30 millones de GB").

| | Tabla común | **Invertida** |
|---|---|---|
| Entradas | una por **página virtual** | una por **marco físico** |
| ¿Cuántas? | 2⁵² (64 bits, 4 KB) | RAM / página: 1 GB / 4 KB = **262.144** |
| Contenido | el marco | **(proceso, página virtual)** que ocupa ese marco |
| ¿Cuántas tablas? | una por proceso | **una para todo el sistema** |
| Traducir | indexar: inmediato | **buscar** (n, p) en toda la tabla: lento |

**El problema:** la búsqueda habría que hacerla en **cada** acceso a memoria. **La solución** es usar el **TLB** para las páginas frecuentes y, cuando el TLB falla, una **tabla hash** sobre la página virtual, recorrida **por software**. Si el hash tiene tantas ranuras como marcos, la cadena promedio tiene una sola entrada.

**Según la cátedra**, para fijar: **32 bits → multinivel; 64 bits → invertida + TLB.**

📖 *Tanenbaum, 3.3.4, págs. 198–201 · Resumen de la cátedra, págs. 12–15.*

---

## 🧮 La calculadora y los paneles

Te abrí **[tablas_paginas.html](unidades/u03-memoria/visuales/tablas_paginas.html)**, que tiene tres pestañas:
1. **¿Cuánto ocupa la tabla?** Con los deslizadores cambiás los bits, la página, la entrada, la RAM y la cantidad de procesos. Ves los tres tamaños y una barra que dice **ok / al límite / saturado**. Probá el botón *64 bits* y mirá cómo explota.
2. **Dividir una dirección.** Pinta TP1, TP2 y el desplazamiento con colores. Abajo podés hacer clic en los trozos de 4 MB que usa el proceso y ver cuántas tablas hacen falta.
3. **Comparar las 3 tablas**, lado a lado, con sus + y −.

Pasó las 15 verificaciones y lo probé en Chrome y en el celular. Ya está en el índice y en la pestaña 🎛 del mapa gráfico; lo existente del mapa quedó igual.

---

### Preguntas rápidas

**1.** Con una tabla de 2 niveles 10|10|12, dividí la dirección **0x01C0A2F0**: dame TP1, TP2 y el desplazamiento. ¿Qué trozo de 4 MB toca?

**2.** Verdadero o falso, y justificá: *"La tabla de páginas invertida tiene una entrada por cada página virtual de cada proceso, y por eso cada proceso tiene la suya."*

<<<<<< MENSAJE 20 >>>>>>

Cuando me respondas, sigue el **tema 7: algoritmos de reemplazo de páginas ★**. Es el más largo de la unidad y el que más se toma en los exámenes.

Responde a la pregunta de qué página sacar cuando hay un fallo de página y no quedan marcos libres. Vamos a ver:
- **Óptimo:** el ideal teórico, que no se puede implementar.
- **NRU:** usa los bits R y M que viste en el tema 5.
- **FIFO**.
- **Segunda oportunidad:** es el que se toma en el examen, con la tabla de páginas a modificar al estilo de la cátedra.
- **Reloj**.
- **LRU** y su aproximación por software, **envejecimiento**.
- **Conjunto de trabajo** y **WSClock**.

Para este tema te armo un **simulador de reemplazo**. Vas a cargar una cadena de referencias y la cantidad de marcos, y vas a ver paso a paso la víctima de cada algoritmo, con el conteo de fallos.

Después del tema 7 quedan:
8. Sobrepaginación, asignación local/global y tamaño de página.
9. Los 10 pasos del manejo de un fallo de página.
10. Segmentación (MULTICS y Pentium).
11. Memoria en Linux, con los comandos.

Y al final, el cierre de la unidad.

<<<<<< MENSAJE 21 >>>>>>

Buena pregunta. **El libro no dice qué función de hash se usa.** Solo dice que es "un hash de la dirección virtual" y que las páginas virtuales con el mismo valor de hash quedan **encadenadas** (pág. 201). El resumen de la cátedra tampoco lo especifica. O sea: **en el examen no te van a pedir una fórmula**, sino la idea.

Tu propuesta es razonable como ejemplo: el módulo por la cantidad de ranuras es una de las funciones de hash más comunes. Pero es un ejemplo mío, no del material.

### Cómo funciona (ejemplo inventado, con 8 ranuras)
Supongamos que la función es `h = (proceso + página) mod 8`:

```
Proceso 2 busca la página 13 → h = (2 + 13) mod 8 = 7

Tabla hash                Entradas (una por marco)
ranura 7 ──► [proc 1, pág 14, marco 3] ──► [proc 2, pág 13, marco 9] ──► fin
              (1+14) mod 8 = 7 también:      ¡coincide! → marco 9
              no es la que busco, sigo
```

1. Se calcula el hash de (proceso, página) y se va a esa **ranura**.
2. Se recorre la **cadena** comparando el par **completo** (proceso, página). Por eso cada entrada guarda el par: dos pares distintos pueden caer en la misma ranura (una **colisión**).
3. Si se encuentra el par, se obtiene el marco y se carga en el **TLB**. Si se llega al final de la cadena sin encontrarlo, es un **fallo de página**.

🧠 Lo que sí dice el libro: si la tabla hash tiene **tantas ranuras como marcos**, la cadena promedio tiene **una sola entrada**, y la búsqueda es casi tan rápida como indexar. Esto pasa solo cuando el TLB falla y lo hace **el software**.

---

Te quedan pendientes las dos preguntas del tema 6:

**1.** Dividí **0x01C0A2F0** con 10|10|12: dame TP1, TP2 y el desplazamiento, y decime qué trozo de 4 MB toca.

**2.** Verdadero o falso: *"La tabla invertida tiene una entrada por cada página virtual de cada proceso, y por eso cada proceso tiene la suya."*

<<<<<< MENSAJE 22 >>>>>>

Corrijo dos detalles antes de verificar: el orden de la cola cuando varias páginas quedan con la misma llegada, y la dirección del ejemplo 3.

<<<<<< MENSAJE 23 >>>>>>

El motor pasó las 22 verificaciones, incluidas 400 cadenas aleatorias comparadas contra una implementación aparte. Ahora lo pruebo en Chrome:

<<<<<< MENSAJE 24 >>>>>>

La prueba que falló estaba mal planteada: al hacer clic se salta al último paso de esa referencia, y ese texto dice «Entra la página 2». Corrijo la prueba:

<<<<<< MENSAJE 25 >>>>>>

Se ve bien. Ahora lo agrego al índice y al mapa gráfico, y lo abro:

<<<<<< MENSAJE 26 >>>>>>

## Corrección del tema 6

**1. ✅ Correcta.** TP1 = 7, TP2 = 10 y desplazamiento = 752 (0x2F0). Toca el trozo de **28 MB a 32 MB** ✔.

Y tu pregunta extra está muy bien pensada: **sí**. Si el proceso es el del ejemplo del libro (texto en 0–4 MB, datos en 4–8 MB, pila arriba de todo), la entrada 7 de la tabla superior cae **en el hueco**. Tiene P = 0 y no hay tabla de 2º nivel, así que se produce un **fallo**. El SO ve que el proceso tocó memoria que no le corresponde y le manda una **señal** o lo termina. En otro proceso que sí use ese trozo, la traducción seguiría normal.

**2. ✅ Correcta.** Es FALSO: hay **una sola tabla para todo el sistema**, con **una entrada por marco**, y cada entrada guarda el par (proceso, página virtual). Un detalle de vocabulario: la tabla **sí está indexada, pero por número de marco**. Lo que no se puede hacer es indexarla **por página virtual**, y por eso hay que **buscar** el par, con TLB y hash.

---

# Tema 7 (parte A) — Algoritmos de reemplazo de páginas ★

Este tema es largo y lo parto en dos:
- **Parte A (ahora):** óptimo, NRU, FIFO, segunda oportunidad y reloj.
- **Parte B (después):** LRU, envejecimiento, conjunto de trabajo y WSClock.

### La intuición
Hay un **fallo de página**, la RAM está llena y tiene que salir alguien. Si sacás una página que se usa mucho, vuelve a fallar enseguida. El objetivo es **sacar la que menos falta va a hacer**.

Si la víctima tiene **M = 1**, primero se escribe al disco. Si está limpia, se descarta.

### 7.1 Óptimo (págs. 202–203)
Saca la página que se va a usar **más tarde** en el futuro.
- **No se puede implementar**: el SO no conoce el futuro. Es lo mismo que pasaba con SJF en la U2.
- Sirve como **referencia**: se corre el programa una vez, se registran las referencias, y en una segunda corrida se compara cada algoritmo contra el óptimo.

### 7.2 NRU, no usada recientemente (págs. 203–204)
Usa los bits **R** y **M** que pone el hardware. **En cada interrupción de reloj el SO borra R**, pero nunca borra M.

| Clase | R | M | Significado |
|---|---|---|---|
| 0 | 0 | 0 | no referenciada, no modificada → **la mejor víctima** |
| 1 | 0 | 1 | no referenciada, modificada |
| 2 | 1 | 0 | referenciada, no modificada |
| 3 | 1 | 1 | referenciada, modificada |

NRU saca **una al azar de la clase más baja que no esté vacía**.
- 🧠 La clase 1 parece imposible, pero aparece cuando el reloj borra R de una página de clase 3.
- ⚠️ NRU prefiere sacar una **modificada que no se usó** (clase 1) antes que una **limpia que se usa mucho** (clase 2).

### 7.3 FIFO (pág. 204)
Mantiene una cola en orden de llegada y saca **la que llegó primero**. El ejemplo del libro es el supermercado que saca el producto más antiguo: puede ser la gomina para bigote, pero también la harina. Por eso **casi no se usa puro**.

### 7.4 Segunda oportunidad ★ (págs. 204–205)
Es FIFO, pero **mirando el bit R** de la más vieja:

```
cola (vieja → nueva):   A(R=1) → B(R=0) → C(R=1)
                         │
mirar A: R=1 → R=0, llegada = AHORA, va al final
cola:                   B(R=0) → C(R=1) → A(R=0)
mirar B: R=0 → VÍCTIMA ✔
```

- Si **todas** tienen R = 1, da la vuelta completa y vuelve a la primera, que ahora tiene R = 0. **Degenera en FIFO, pero siempre termina.**
- ⚠️ La salvada **cambia su llegada al instante actual**. En el examen hay que actualizarlo en la tabla.

### 7.5 Reloj (págs. 205–206, fig. 3-16)
Es la segunda oportunidad **sin mover páginas**: una lista **circular** y una **manecilla** que apunta a la más vieja.

```
        ┌──► A(1) ──► B(0) ──┐        fallo: mira donde apunta ◀
        │                    ▼        R=1 → R=0 y avanza
       F(1)                C(1)       R=0 → víctima, la nueva toma
        ▲                    │              su lugar y avanza
        └─── E(0) ◀── D(1) ◀─┘
```

Saca **exactamente las mismas víctimas** que la segunda oportunidad. Es más eficiente porque no mueve nodos de la lista.

### Ejemplo con la cadena de clase
Cadena 7 0 1 2 0 3 0 4 2 3 0 3 2 con 3 marcos:

| Óptimo | FIFO | Segunda oportunidad | Reloj | LRU |
|---|---|---|---|---|
| **7** | 10 | 9 | 9 | 9 |

El óptimo es el **piso**: ningún algoritmo puede tener menos fallos.

📖 *Tanenbaum, 3.4–3.4.5, págs. 201–206, figs. 3-15 y 3-16.*

---

## 🎛 El simulador

Te abrí **[reemplazo_paginas.html](unidades/u03-memoria/visuales/reemplazo_paginas.html)**, que tiene tres pestañas:
1. **Cadena de referencias:** elegís el algoritmo y los marcos. La grilla pinta en **azul** la página inspeccionada y en **naranja** la víctima. En segunda oportunidad ves la cola con los bits R, y en el reloj, la manecilla ◀. Abajo compara los cinco algoritmos.
2. **📝 Examen:** es el ejercicio de la cátedra. Cargás la tabla (página, llegada, R, M, P, marco), la dirección y el instante. Te lo resuelve paso a paso, marca **en violeta cada casilla que cambia** y muestra la cola en las dos notaciones, incluida la de la cátedra (nueva → vieja). Trae el ejemplo de la práctica, `27(1) → 7(0)`.
3. **Clases de NRU.**

Pasó 22 verificaciones, incluidas 400 cadenas aleatorias comparadas contra una implementación independiente. También lo probé en Chrome y en el celular. Ya está en el índice y en la pestaña 🎛 del mapa.

---

### Preguntas (resolvelas a mano primero; después comprobalas en la pestaña 📝)

**1. Ejercicio de examen.** Páginas de **2 KB**, direcciones de 16 bits. En el instante **200** se lee la dirección **0x4B3A**. La tabla es:

| Página | Llegada | R | M | P | Marco |
|---|---|---|---|---|---|
| 2 | 90 | 0 | 1 | 1 | 6 |
| 5 | 60 | 1 | 0 | 1 | 3 |
| 9 | — | 0 | 0 | 0 | — |
| 11 | 40 | 1 | 1 | 1 | 1 |
| 14 | 120 | 1 | 0 | 1 | 4 |

a) ¿Qué página es y hay fallo? b) Aplicá segunda oportunidad: ¿qué página sale? ¿Hay que escribir al disco? c) La dirección física en hexa. d) La cola final en la notación de la cátedra.

**2. V o F:** *"Si todas las páginas tienen R = 1, la segunda oportunidad entra en un ciclo infinito."*

<<<<<< MENSAJE 27 >>>>>>

## Corrección

**1a) ✅** Es la página **9** y hay **fallo** porque P = 0.

Para el examen conviene mostrar cómo sale el 9. Con páginas de 2 KB = 2¹¹ el desplazamiento tiene **11 bits**, y con direcciones de 16 bits quedan **5 bits** para la página:

```
0x4B3A = 0100 1011 0011 1010
         └─┬─┘└──────┬──────┘
         01001   011 0011 1010
         pág 9   desp = 0x33A = 826
```

**1b) ✅ (falta mostrar los pasos)** La víctima es la **2**, y como tiene M = 1 hay que escribirla al disco ✔. En el examen piden también **cómo se llega**: hay que pasar por las páginas salvadas. Se ordenan por llegada, de la más vieja a la más nueva:

| Paso | Página (llegada) | R | Qué pasa |
|---|---|---|---|
| 1 | 11 (40) | 1 | se salva: R → 0, llegada → **200**, va al final |
| 2 | 5 (60) | 1 | se salva: R → 0, llegada → **200**, va al final |
| 3 | 2 (90) | **0** | **víctima** ✔, sucia → se escribe al disco |

La página 9 entra en el **marco que liberó la 2, que es el 6**, con P = 1, R = 1, M = 0 (es una lectura) y llegada 200.

**1c) ❌** La respuesta correcta es **0x333A**, no 0x3CEE. Se arma así: el marco **reemplaza** a los 5 bits de página y el desplazamiento se copia sin cambios.

```
marco 6 = 00110        desp = 011 0011 1010
física  = 00110 011 0011 1010 = 0011 0011 0011 1010 = 0x333A
control en decimal: 6 × 2048 + 826 = 13114 = 0x333A ✔
```

¿Cómo llegaste a 0x3CEE? Contame qué marco usaste y cómo armaste la dirección, así vemos dónde se desvió. Sospecho que se cortó mal el desplazamiento, o que se usó otro marco.

**1d) La cola final** es cómo queda la **cola FIFO** de segunda oportunidad después del reemplazo, con el bit R de cada página. La cátedra la pide así, de la más **nueva** a la más **vieja**:

```
9(1) → 5(0) → 11(0) → 14(1)
```

La 9 acaba de entrar con R = 1. La 5 y la 11 fueron salvadas, así que quedan con R = 0 y llegada 200; la 11 se salvó primero y por eso queda detrás de la 5. La 14 no se tocó y ahora es la más vieja: va a ser la primera candidata en el próximo fallo.

**2. ✅ Correcta.** Es falso: da la vuelta completa poniendo todas las R en 0, vuelve a la primera (que ahora tiene R = 0) y la saca. **Degenera en FIFO pero siempre termina.**

---

📝 Si cargás este ejercicio en la pestaña **Examen** de [reemplazo_paginas.html](unidades/u03-memoria/visuales/reemplazo_paginas.html), te muestra cada uno de estos pasos con las casillas que cambian en violeta.

Antes de seguir, respondeme cómo armaste el 0x3CEE. Después escribí **"seguí"** y pasamos al **tema 7 parte B**: LRU, envejecimiento, conjunto de trabajo y WSClock.

<<<<<< MENSAJE 28 >>>>>>

Leí la sección 3.4.6–3.4.10 del libro. Antes de darte la clase armo el simulador de esta parte, porque estos algoritmos se entienden mucho mejor viendo los bits moverse.

<<<<<< MENSAJE 29 >>>>>>

Las 25 verificaciones del motor pasan. Ahora lo pruebo en Chrome, haciendo clic en todas las pestañas, ejemplos y botones.

<<<<<< MENSAJE 30 >>>>>>

Fue un error del test, que intentaba escribir antes de cambiar de pestaña. Lo corrijo y lo vuelvo a correr:

<<<<<< MENSAJE 31 >>>>>>

La vista de celular se ve bien. Ahora lo agrego al índice y a la pestaña 🎛 del mapa, sin tocar nada de lo que ya está:

<<<<<< MENSAJE 32 >>>>>>

# Tema 7 (parte B): LRU y sus aproximaciones ★

Lo que importa de esta parte, en una línea: **LRU es el mejor algoritmo realizable, pero es caro; todo lo demás son formas baratas de imitarlo.**

```
            Óptimo (imposible, solo sirve de referencia)
               │  "el pasado reciente predice el futuro"
               ▼
             LRU ── exacto, necesita HARDWARE (contador C, matriz n×n)
               │  imitarlo por SOFTWARE con el bit R
       ┌───────┴────────┐
      NFU ──mejora──► ENVEJECIMIENTO ★        ← aproxima LRU
                                               
   CONJUNTO DE TRABAJO ──mejora──► WSClock ★   ← otra idea: τ y edad
```

---

## 7.6 LRU, menos usada recientemente (págs. 205–207)

**Intuición:** lo que usaste recién lo vas a volver a usar; lo que hace mucho que no tocás, probablemente tampoco lo uses ahora. Es lo que hacés con la ropa del placard: al fondo va lo que no te pusiste hace meses.

**Regla:** en un fallo sale la página que **hace más tiempo que no se usa**.

**El problema** es que hay que registrar algo **en cada referencia a memoria**, no en cada fallo. Una lista ordenada que se actualice en cada instrucción es demasiado lenta, incluso hecha en hardware. El libro da dos variantes con **hardware especial**:

1. **Contador C de 64 bits.** Se incrementa en cada instrucción, y en cada referencia se copia en la entrada de la página. En un fallo sale la que tiene el **menor** valor.
2. **Matriz n × n de bits**, con n = cantidad de marcos. Al referenciar la página k:

```
   fila k    ← todo 1
   columna k ← todo 0        →  la fila con MENOR valor binario es la LRU

   Ej. fig. 3-17, refs 0 1 2 3 2 1 0 3 2 3 → al final:
        0 1 2 3   valor
   0 │ 0 1 0 0 │  4
   1 │ 0 0 0 0 │  0   ← LRU (la 1 es la que hace más que no se usa)
   2 │ 1 1 0 0 │ 12
   3 │ 1 1 1 0 │ 14   ← la más reciente
```

🧠 **Para recitar:** «fila en 1, columna en 0; la fila más chica sale».

---

## 7.7 Simular LRU por software: NFU y envejecimiento (págs. 207–209)

Casi ninguna máquina tiene ese hardware, así que **el SO lo imita con el bit R** en cada interrupción de reloj.

**NFU (no usada frecuentemente).** Cada página tiene un contador, y en cada pulso se hace `contador += R`. En un fallo sale la de menor contador.
- ⚠️ **NFU nunca olvida.** En un compilador de varias pasadas, las páginas de la pasada 1 acumulan una cuenta altísima. Después le ganan a las páginas de la pasada actual, que son las que se están usando.

**Envejecimiento (aging) ★.** Cambia dos cosas respecto de NFU:
1. el contador **se desplaza 1 bit a la derecha**;
2. R entra **por el bit de la izquierda**, no se suma por la derecha.

```
   pág. 0, R = 1 0 1 1:   10000000 → 01000000 → 10100000 → 11010000
                             ▲ R entra acá       lo viejo se corre y pierde peso
```

Un 1 reciente, a la izquierda, **vale más que todos los viejos juntos**. En un fallo sale la de **menor** contador.

Ejemplo del libro (fig. 3-18): después del pulso 4 sale la **página 3**.
- ⚠️ **Errata del libro en español:** en la fig. 3-18, para la página 2, imprime 00100000 y 10010000. Lo correcto es **00010000** y **10001000**. El simulador lo marca.

🧠 **Dos diferencias con LRU verdadero (se toman):**
1. **Pierde el orden dentro del pulso.** Si dos páginas se usaron en el mismo intervalo, no sabe cuál fue la última.
2. **Horizonte finito.** Con 8 bits, dos contadores en 00000000 empatan aunque una página se haya usado hace 9 pulsos y la otra hace 1000. En la práctica alcanza: 8 pulsos de unos 20 ms son 160 ms.

---

## 7.8 Conjunto de trabajo (págs. 209–213)

**Paginación bajo demanda:** el proceso arranca sin páginas en memoria y las va trayendo fallo a fallo.

**Localidad de referencia:** en cada fase de ejecución, el proceso usa solo una fracción chica de sus páginas.

**Conjunto de trabajo:** son las páginas que el proceso usa **en este momento**.
- Si entra completo en memoria, el proceso casi no da fallos.
- Si no entra, falla cada pocas instrucciones. Eso es **sobrepaginación (thrashing)**, el tema 8.

**Definición formal:** **w(k, t)** es el conjunto de páginas usadas en las k referencias más recientes. La curva sube rápido y después se aplana; por eso el valor exacto de k casi no importa.

**Prepaginación:** cargar el conjunto de trabajo **antes** de volver a correr el proceso. Lo que se usa en la práctica se llama **modelo del conjunto de trabajo**.

**Aproximación práctica.** En vez de contar k referencias, se toma lo usado en los últimos **τ de tiempo virtual**.
- ⚠️ El **tiempo virtual** es el tiempo de **CPU del propio proceso**, no el tiempo real. Si un proceso tuvo 40 ms de CPU en 100 ms reales, su tiempo virtual es 40 ms.

**Algoritmo (fig. 3-20).** En el fallo se recorre **toda** la tabla, y para cada página se calcula `edad = tiempo virtual actual − último uso`:

```
   R = 1            → último uso ← actual (está en el CT, no sale)
   R = 0, edad > τ  → VÍCTIMA (fuera del CT); el recorrido sigue para actualizar
   R = 0, edad ≤ τ  → se reserva; se anota la más vieja
   ninguna fuera    → sale la más vieja con R = 0
   todas con R = 1  → una al azar, mejor limpia
```

Ejemplo: tiempo actual 2204 y τ = 600 (el libro no da τ; lo elegí yo).
- La página de **1213** tiene R = 0 y edad 991 > 600 → **sale**.
- La de **1620** tiene R = 0 pero edad 584 ≤ 600 → **se queda**.

---

## 7.9 WSClock (págs. 213–214) ★

Es el conjunto de trabajo **montado sobre el reloj**: un anillo con manecilla, así no hay que recorrer toda la tabla.

```
   mira la de la manecilla:
   R = 1                    → R ← 0, avanza (como el reloj)
   R = 0, edad > τ, LIMPIA  → VÍCTIMA, la nueva entra ahí
   R = 0, edad > τ, SUCIA   → ✎ planifica escritura y AVANZA (no la saca todavía)
   R = 0, edad ≤ τ          → avanza
   si da la vuelta entera:
     hubo escrituras   → sigue girando hasta encontrar una que ya quedó limpia
     no hubo ninguna   → cualquier limpia; si no hay, la actual (y se escribe)
```

⚠️ **Lo más preguntado:** la sucia **no sale**; se planifica su escritura y la manecilla sigue. Así el SO no se queda esperando el disco, porque más adelante puede haber una vieja y limpia.

Otro detalle: la primera que se limpia no tiene por qué ser la primera que se planificó, porque el controlador de disco puede reordenar las escrituras.

---

## 7.10 Resumen del libro (fig. 3-22, pág. 215)

| Algoritmo | Comentario del libro |
|---|---|
| Óptimo | No se puede implementar; sirve de comparación |
| NRU | Aproximación muy burda de LRU |
| FIFO | Puede descartar páginas importantes |
| Segunda oportunidad | Gran mejora sobre FIFO |
| Reloj | Realista |
| LRU | Excelente, pero difícil de implementar con exactitud |
| NFU | Aproximación a LRU bastante burda |
| **Envejecimiento** | **Eficiente, se aproxima bien a LRU** |
| Conjunto de trabajo | Muy costoso de implementar |
| **WSClock** | **Eficientemente bueno** |

🧠 **Los dos mejores en la práctica:** **envejecimiento**, basado en LRU, y **WSClock**, basado en el conjunto de trabajo.

📖 *Tanenbaum 3.4.6–3.4.10, págs. 205–215, figs. 3-17 a 3-22.*

---

## 🎛 El simulador

Te abrí **[lru_aproximaciones.html](unidades/u03-memoria/visuales/lru_aproximaciones.html)**, con tres pestañas:
1. **Matriz LRU:** se ve cómo se llena la fila y se borra la columna, y cuál es la fila más chica.
2. **Envejecimiento vs. NFU:** los contadores en binario, uno al lado del otro. Hay un ejemplo donde NFU y envejecimiento eligen víctimas distintas, y la errata aparece marcada con ⚠️.
3. **Conjunto de trabajo y WSClock:** τ se mueve con un deslizador. Muestra la edad de cada página, si está o no en el conjunto de trabajo, el anillo con la manecilla y las escrituras planificadas ✎.

Lo verifiqué contra las figs. 3-17, 3-18, 3-20 y 3-21 del libro y contra 300 cadenas aleatorias comparadas con un LRU exacto: pasaron las 25 verificaciones. En Chrome y en tamaño celular corre sin errores. Ya está en el índice y en la pestaña 🎛 del mapa.

---

### Preguntas (a mano primero; después podés comprobarlas en el simulador)

**1. Envejecimiento con contadores de 8 bits.** Hay 4 páginas (0 a 3), todas arrancan en 00000000. Los bits R en cada pulso son:

```
pulso 0:  1 1 0 1
pulso 1:  0 1 1 0
pulso 2:  1 0 0 0
pulso 3:  0 0 1 1
```

a) Escribí los contadores después del pulso 3. b) Si ahora hay un fallo, ¿qué página saca el envejecimiento? c) ¿Y NFU? ¿Qué te muestra la diferencia?

**2. WSClock.** El tiempo virtual actual es 2200 y τ = 400. El anillo es A → B → C → D → (vuelve a A), y la manecilla está en A:

| Página | Último uso | R | M |
|---|---|---|---|
| A | 1700 | 0 | 1 |
| B | 2150 | 1 | 0 |
| C | 1500 | 0 | 0 |
| D | 1900 | 0 | 0 |

¿Qué pasa con A? ¿Qué página sale finalmente y por qué?

<<<<<< MENSAJE 33 >>>>>>

**Sí.** Cada **fila es un pulso de reloj** y cada **columna es una página**. Es el mismo formato que la fig. 3-18 del libro.

```
            pág 0  pág 1  pág 2  pág 3
pulso 0:      1      1      0      1
pulso 1:      0      1      1      0
pulso 2:      1      0      0      0
pulso 3:      0      0      1      1
```

Por ejemplo, en el pulso 0 se usaron las páginas 0, 1 y 3, y la 2 no. Si leés una columna **de arriba hacia abajo**, ves la historia de esa página. La página 0, por ejemplo, tuvo R = 1, 0, 1, 0.

Para que veas el mecanismo, hago **solo el primer pulso de la página 0**:

```
contador inicial:     00000000
desplazo a la derecha: 00000000
meto R = 1 a la izq.:  10000000   ← después del pulso 0
```

Seguí vos desde ahí con los pulsos 1, 2 y 3, y después con las otras páginas. En cada pulso repetís lo mismo: **desplazar a la derecha y poner el R de ese pulso como bit de más a la izquierda**.

Si querés comprobarlo después, en la pestaña **2 · Envejecimiento vs. NFU** del simulador podés pegar esas cuatro líneas tal cual en el cuadro de bits R, y te muestra pulso por pulso.

<<<<<< MENSAJE 34 >>>>>>

Depende del algoritmo, y justamente esa diferencia es la que busca la pregunta.

**En envejecimiento** el «contador» es el **registro de 8 bits completo**. Hay que escribir el número binario que queda después de los desplazamientos, por ejemplo `10100000`. Para elegir la víctima comparás esos números como binarios: el más chico sale. Si te resulta más fácil, pasalos a decimal para compararlos (`10100000` = 160), pero lo que importa es el patrón de bits.

```
10000000 = 128   ← 1 reciente (bit de la izquierda)
00000011 =   3   ← dos 1, pero viejos
```

Por eso en envejecimiento **no importa cuántos 1 hay, sino dónde están**: un 1 a la izquierda (reciente) pesa más que todos los de la derecha (viejos).

**En NFU** el contador **sí** es la cantidad de veces que R estuvo en 1, porque cada pulso hace `contador = contador + R`. Ahí no hay bits que se corran: es una suma.

| | Qué se anota | Qué sale en un fallo |
|---|---|---|
| **Envejecimiento** | el registro de 8 bits (posición de los 1) | el menor valor binario |
| **NFU** | cuántas veces R = 1 (suma) | la de menor cuenta |

Entonces, en la pregunta:
- **a)** los 4 registros de 8 bits del envejecimiento;
- **b)** cuál es el menor de esos números;
- **c)** la cuenta de NFU de cada página (cuántos 1 tiene su columna) y qué página sacaría.

<<<<<< MENSAJE 35 >>>>>>

## Corrección

**1a) ✅** Los contadores son 0 = **01010000** (80), 1 = **00110000** (48), 2 = **10100000** (160) y 3 = **10010000** (144). Están todos bien.

**1b) ✅** Sale la **página 1**, que tiene el menor valor, 48.

**1c) ✅ (le falta la conclusión)** Es cierto que en NFU los cuatro contadores valen **2** y hay un empate total. La idea que pide la pregunta es esta:
> Las cuatro páginas se usaron **la misma cantidad de veces**, pero **no en el mismo momento**. NFU solo cuenta, así que no puede distinguirlas. El envejecimiento mira **cuándo** se usaron: la página 1 se usó en los pulsos 0 y 1, y hace dos pulsos que no se toca. Por eso es la que se parece más a la LRU.

🧠 En el examen: NFU mide **frecuencia** y el envejecimiento mide **recencia**, que es lo que aproxima a LRU.

**2. ✅ La víctima es correcta (C), pero hay un matiz importante con A.**

Lo que escribiste sobre A da a entender que se hace la copia a disco y A queda con M = 0. **No es así, al menos no en ese momento:**

```
A: R=0, edad 2200−1700 = 500 > 400, SUCIA
   → se PLANIFICA la escritura ✎ y la manecilla AVANZA
     (A sigue sucia y en memoria; el SO no espera al disco)
B: R=1 → R=0, avanza
C: R=0, edad 2200−1500 = 700 > 400, LIMPIA → VÍCTIMA ✔
```

- ⚠️ La escritura de A queda **en cola**. Cuando el disco termine, A va a quedar limpia, y en una vuelta futura podrá salir sin escribir nada. El objetivo es **no frenar el fallo esperando el disco**.
- Te faltó calcular la **edad de A**, que es 500 > τ. Ese dato es el que justifica la escritura: si A estuviera dentro del conjunto de trabajo (edad ≤ τ), la manecilla avanzaría sin planificar nada.
- Tampoco mencionaste a **B**: tenía R = 1, así que se le borra R y la manecilla sigue.

En la pestaña 3 del [simulador](unidades/u03-memoria/visuales/lru_aproximaciones.html) se ve así: elegí **WSClock**, pegá la tabla `A 1700 0 1 / B 2150 1 0 / C 1500 0 0 / D 1900 0 0`, poné tiempo 2200, τ 400 y manecilla 1. A queda marcada con ✎.

---

Con esto cerramos los **algoritmos de reemplazo**, el corazón de la unidad. Escribí **"seguí"** y pasamos al **tema 8, cuestiones de diseño**: sobrepaginación, asignación local vs. global, PFF y tamaño de página óptimo. Para el tamaño de página voy a armar una calculadora.

<<<<<< MENSAJE 36 >>>>>>

La curva queda aplanada arriba porque recorté los valores en el techo. La dejo salir del gráfico, que se ve más natural, y después la agrego al índice y al mapa:

<<<<<< MENSAJE 37 >>>>>>

# Tema 8A: Cuestiones de diseño. Sobrepaginación ★

Hasta ahora vimos **qué página sacar**. Ahora vienen las preguntas de diseño: **de quién** sacarla, **cuántos marcos** darle a cada proceso, **qué hacer cuando no alcanza** y **de qué tamaño** hacer las páginas. El libro lo compara con saber mover las piezas de ajedrez y saber jugar.

```
   reemplazo (tema 7): ¿QUÉ página sale?
        │
        ├─ ¿de QUIÉN?        → local vs. global
        ├─ ¿CUÁNTOS marcos?  → partes iguales / proporcional / PFF
        ├─ ¿y si no alcanza? → sobrepaginación → CONTROL DE CARGA
        └─ ¿de qué TAMAÑO?   → p = √(2se)
```

---

## 8.1 Sobrepaginación (thrashing / hiperpaginación) (pág. 209)

**Intuición:** es un escritorio tan chico que, para abrir un libro, tenés que guardar el que estabas usando, y un minuto después lo necesitás de nuevo. Te pasás el día guardando y sacando libros y no leés nada.

**Definición:** un proceso **sobrepagina** cuando produce **fallos de página cada pocas instrucciones**. Le pasa porque su **conjunto de trabajo no entra** en los marcos que tiene.

```
 instrucción ≈ nanosegundos      leer página ≈ 10 milisegundos
 → 1 o 2 instrucciones cada 10 ms = "una eternidad"
 CPU ociosa, disco al 100%
```

🧠 La sobrepaginación **no es culpa del algoritmo de reemplazo**: si la suma de los conjuntos de trabajo supera la RAM, aparece igual.

---

## 8.2 Reemplazo local vs. global (págs. 216–217, fig. 3-23)

El proceso **A** tiene un fallo. Hay dos opciones:

```
 edades (fig. 3-23):  A0 10  A1 7  A2 5  A3 4  A4 6  A5 3
                      B0 9   B1 4  B2 6  B3 2  B4 5  B5 6  B6 12
                      C1 3   C2 5  C3 6

 LOCAL  → busca solo entre las de A → sale A5 (3)    A sigue con 6 marcos
 GLOBAL → busca en toda la memoria  → sale B3 (2)    A pasa a 7, B a 6
```

| | Local | Global |
|---|---|---|
| Qué es | cada proceso tiene una **fracción fija** de memoria | los marcos se **reparten dinámicamente** |
| + | un proceso no le saca marcos a otro | **en general funciona mejor** |
| − | si el conjunto de trabajo **crece** → sobrepaginación **aunque haya marcos libres**; si **se achica** → desperdicia memoria | el SO tiene que decidir todo el tiempo cuántos marcos tiene cada proceso |

- ⚠️ **FIFO y LRU** sirven con las dos políticas.
- ⚠️ El **conjunto de trabajo y WSClock solo tienen sentido como locales**: no existe un conjunto de trabajo de la máquina entera.

---

## 8.3 ¿Cuántos marcos le doy a cada proceso? (págs. 217–218)

- **Partes iguales.** Con 12 416 marcos y 10 procesos, son **1241** para cada uno y **6** a una reserva para los fallos. El problema es que no tiene sentido darle lo mismo a un proceso de 10 KB que a uno de 300 KB.
- **Proporcional al tamaño.** El de 300 KB recibe **30 veces** lo del de 10 KB.
- **Con un mínimo.** En algunas máquinas, una instrucción de dos operandos puede tocar **hasta 6 páginas**: la instrucción y los dos operandos, cada uno cruzando un límite de página. Con 5 marcos, ese programa **no se puede ejecutar nunca**.

Eso fija **el arranque**. Con una política global, la asignación se ajusta en marcha con PFF.

---

## 8.4 PFF, frecuencia de fallos de página (págs. 217–218, fig. 3-24)

**La idea:** si das más marcos, la tasa de fallos baja; en LRU y muchos otros algoritmos se cumple. Se fijan **dos líneas**:

```
 fallos/seg
   │╲
 A ┤-╲------------------  por encima: le faltan marcos → DARLE
   │  ╲___
 B ┤------╲______________  por debajo: le sobran → QUITARLE
   └──────────────────────► marcos asignados
```

**Cómo se mide:** se cuentan los fallos por segundo con una media móvil, `media nueva = (media actual + fallos del último segundo) / 2`.
- Ejemplo: 20, 40, 10 → media 20 → (20+40)/2 = **30** → (30+10)/2 = **20**.

⚠️ **PFF decide CUÁNTOS marcos tiene cada proceso, NO CUÁL página sale.** La víctima la sigue eligiendo el algoritmo de reemplazo.

---

## 8.5 Control de carga (págs. 218–219) ★

**El síntoma:** PFF dice que **algunos procesos necesitan más memoria y ninguno necesita menos**. No hay de dónde sacar marcos sin perjudicar a otro proceso.

**La única solución real** es **sacar procesos de memoria temporalmente**:
1. **intercambiar (swap) un proceso entero al disco** y repartir sus marcos entre los que sobrepaginan;
2. si la sobrepaginación sigue, intercambiar otro, y así hasta que pare.

🧠 Por eso **el intercambio de la U3 sigue existiendo aunque haya paginación**. Ya no se usa para conseguir páginas, sino para **bajar la demanda de memoria**. Es parecido a la **planificación de dos niveles** de la U2.

⚠️ Tampoco hay que bajar demasiado el **grado de multiprogramación**, porque la CPU queda ociosa. Para elegir qué proceso sacar se mira:
- el tamaño del proceso;
- su tasa de fallos;
- si está **ligado a la CPU o a la E/S**, junto con cómo son los demás procesos.

---

## 8.6 Tamaño de página (págs. 219–220) ★

No hay un tamaño óptimo en general: hay que equilibrar.

| Páginas **chicas** | Páginas **grandes** |
|---|---|
| + menos **fragmentación interna**: en promedio se desperdicia ½ página por segmento, **n·p/2** | + **tabla de páginas** más chica |
| + menos parte del programa en memoria sin usar (8 fases de 4 KB con páginas de 32 KB ocupan 32 KB todo el tiempo) | + menos transferencias: casi todo el tiempo de disco es búsqueda y rotación. **64 × 10 ms** para cargar 64 páginas de 512 B vs. **4 × 12 ms** para 4 páginas de 8 KB |
| − tabla grande y más registros que cargar en cada cambio de proceso | − más fragmentación interna |

**La fórmula (se toma):** con un proceso promedio de **s** bytes, páginas de **p** bytes y **e** bytes por entrada:

```
 sobrecarga = s·e/p   +   p/2
              └tabla┘    └frag. interna de la última página┘

 derivo e igualo a 0:  −s·e/p² + 1/2 = 0   →   p = √(2·s·e)

 Ej. libro: s = 1 MB = 2²⁰, e = 8 = 2³
            p = √(2 · 2²⁰ · 2³) = √2²⁴ = 2¹² = 4 KB ✔
```

🧠 En el óptimo **los dos términos son iguales** (2 KB y 2 KB en el ejemplo).

Datos reales del libro: se usaron páginas de 512 B a 64 KB, y hoy es común **4 KB u 8 KB**. Cuando la RAM crece, el tamaño de página también crece, pero no en forma lineal: cuadruplicar la RAM rara vez duplica la página.

📖 *Tanenbaum 3.4.8 (pág. 209) y 3.5.1–3.5.3 (págs. 216–220), figs. 3-23 y 3-24.*

---

## 🎛 La calculadora

Te abrí **[diseno_paginacion.html](unidades/u03-memoria/visuales/diseno_paginacion.html)**, con cuatro pestañas:
1. **Tamaño de página:** deslizadores para s, e y p. Muestra la barra con los dos términos, la curva con el óptimo y el estado ok / al límite / saturado.
2. **Local vs. global:** la fig. 3-23 en dos paneles con sus + y −. Podés editar las edades.
3. **Asignación:** partes iguales y proporcional, con mínimo.
4. **PFF:** procesos contra las líneas A y B, la media móvil y la alarma de control de carga.

Pasó 21 verificaciones: ejemplos del libro, barrido numérico del mínimo, pruebas en Chrome y en celular. Ya está en el índice y en la pestaña 🎛 del mapa.

---

### Preguntas

**1.** Un sistema tiene procesos de **4 MB** en promedio y entradas de tabla de **8 bytes**. a) ¿Cuál es el tamaño de página óptimo? b) ¿Cuánto vale cada término de la sobrecarga en ese punto? *(Pista: trabajá con potencias de 2.)*

**2. Escenario.** El administrador ve la **CPU casi ociosa** y el **disco al 100 %**. PFF muestra que P1, P2 y P3 están por encima de la línea A y ninguno por debajo de B. Un compañero propone cambiar FIFO por WSClock para arreglarlo. ¿Qué está pasando? ¿Alcanza con la propuesta del compañero? ¿Qué hace el SO?

<<<<<< MENSAJE 38 >>>>>>

## Corrección

**1a) ✅** El óptimo es **8 KB**. La cuenta, por si te la piden escrita:

```
s = 4 MB = 2²²     e = 8 = 2³
p = √(2 · 2²² · 2³) = √(2¹ · 2²² · 2³) = √2²⁶ = 2¹³ = 8 KB
```

**1b) Te lo explico.** La fórmula de sobrecarga tiene **dos términos**, y la pregunta pide **reemplazar p = 8 KB en cada uno**:

```
sobrecarga =   s·e/p        +      p/2
              (lo que ocupa        (lo que se pierde por
               la tabla)            fragmentación interna)
```

- **Tabla de páginas:** s/p = 2²² / 2¹³ = 2⁹ = **512 páginas**. Cada una necesita una entrada de 8 B, así que la tabla ocupa 512 × 8 = **4096 B = 4 KB**.
- **Fragmentación interna:** en promedio la última página queda medio vacía, p/2 = 8 KB / 2 = **4 KB**.
- **Total:** 4 KB + 4 KB = **8 KB** de sobrecarga por proceso.

🧠 **Los dos términos dan lo mismo (4 KB y 4 KB), y esto no es casualidad: es la marca del óptimo.**
- Con una página más chica, la tabla crecería: con 4 KB, s·e/p = 8 KB y p/2 = 2 KB, en total 10 KB.
- Con una más grande, crecería la fragmentación: con 16 KB, 2 KB + 8 KB = 10 KB.
- En los dos casos queda peor que 8 KB.

En la pestaña 1 de la [calculadora](unidades/u03-memoria/visuales/diseno_paginacion.html) podés poner s = 4 MB, e = 8 y mover p a 4, 8 y 16 KB. La barra muestra cómo se equilibran los dos colores.

---

**2. 🟡 Parcial.** Tenés bien que les faltan marcos, y que lo del compañero no alcanza. Te faltan **el nombre del problema, el porqué y la solución concreta**.

**Qué está pasando:** es **sobrepaginación (thrashing)**. El síntoma de manual es CPU ociosa con el disco saturado: los procesos se pasan el tiempo esperando páginas.

**Por qué no alcanza cambiar a WSClock:** el problema no es **qué** página se saca, sino que **la suma de los conjuntos de trabajo no entra en la RAM**. Con cualquier algoritmo, aunque fuera el óptimo, alguien se queda sin sus páginas. Tu observación de que WSClock es local es correcta, pero no es el motivo.

**Por qué «hacerlo de forma dinámica» no basta:** eso es justamente lo que ya hace PFF, que reparte marcos en marcha. Para darle a uno hay que **quitarle a otro**, y acá **nadie está por debajo de B**: no hay de dónde sacar.

**Qué hace el SO: control de carga.**
1. **Intercambia un proceso entero al disco (swap)** y reparte sus marcos entre los demás.
2. Si la sobrepaginación sigue, intercambia otro, hasta que pare.
3. Elige cuál según el tamaño, la tasa de fallos y si está ligado a CPU o a E/S, **sin bajar tanto la multiprogramación que la CPU quede ociosa**.

📌 Frase de examen: *«PFF indica que algunos procesos necesitan más memoria y ninguno necesita menos → la única solución real es reducir la cantidad de procesos en memoria intercambiando alguno al disco.»*

---

Para ver si quedó el 1b, una rápida: con **s = 1 MB** y **e = 4 B**, ¿cuál es el p óptimo y cuánto vale cada término?

Cuando la contestes, seguimos con el **tema 8B**: espacios I y D, páginas compartidas, bibliotecas compartidas y política de limpieza.

<<<<<< MENSAJE 39 >>>>>>

Funciona bien. Lo agrego al índice y al mapa:

<<<<<< MENSAJE 40 >>>>>>

# Tema 8B: Más cuestiones de diseño: compartir memoria

El tema 8A trataba de **repartir** la memoria. Este trata de **compartirla**: que varios procesos usen **los mismos marcos** sin pisarse.

```
   ESPACIOS I y D ──► PÁGINAS COMPARTIDAS ──► COPIA EN ESCRITURA (fork)
                          │
                          └──► BIBLIOTECAS COMPARTIDAS ──► ARCHIVOS ASOCIADOS
                                    (código indep. de la posición)

   y aparte: POLÍTICA DE LIMPIEZA (demonio de paginación) · INTERFAZ DE MV
```

---

## 8.7 Espacios I y D separados (pág. 221, fig. 3-25)

Se usó por primera vez en la **PDP-11**. El proceso tiene **dos espacios de direcciones**, los dos empezando en 0:
- el **espacio I**, para las instrucciones;
- el **espacio D**, para los datos.

Cada uno tiene **su propia tabla de páginas**. El hardware sabe cuál usar: si busca una instrucción, va al espacio I; si es un dato, al espacio D.

- **+** Se **duplica** el espacio de direcciones disponible, sin otra complicación.
- ⚠️ El **enlazador** tiene que saberlo, porque los datos se reubican a partir de la dirección virtual 0 y no a continuación del programa.

---

## 8.8 Páginas compartidas (págs. 221–223, fig. 3-26)

**Intuición:** si 20 usuarios abren el mismo editor, tener 20 copias del código en RAM es absurdo.

- **Solo se comparten directamente las páginas de SOLO LECTURA**, como el **texto** del programa. Las páginas de datos no.
- Con espacios I y D, es fácil: los dos procesos usan **la misma tabla del espacio I** y **una tabla propia para el espacio D**. Cada proceso tiene en la tabla de procesos dos apuntadores, uno por tabla.

Hay dos problemas:
- ⚠️ Si el planificador **saca a A** de memoria con todas sus páginas, **B empieza a dar fallos**, porque esas páginas también eran suyas.
- ⚠️ Cuando **A termina**, hay que saber que las páginas **siguen en uso** para no liberarlas. Recorrer todas las tablas es caro, así que se necesitan **estructuras especiales** que lleven la cuenta.

### Copia en escritura (copy-on-write) ★ (págs. 222–223)

Después de un `fork`, padre e hijo tienen que tener **los mismos datos**. La forma obvia es copiar todo, y es carísima. La copia en escritura funciona así:

```
 fork()
   │  cada uno tiene SU tabla, pero apuntan a LOS MISMOS marcos
   │  TODAS las páginas → SOLO LECTURA (en las dos tablas)
   ▼
 mientras solo lean ──► nada que hacer, sigue compartido
   │
 alguien ESCRIBE una palabra
   ▼
 MMU: escritura en página de solo lectura → TRAP al SO
   ▼
 SO: copia ESA página → cada uno con su copia privada
     ambas copias → LECTURA-ESCRITURA → reinicia la instrucción
```

- **+** Las páginas que nunca se modifican, incluido **todo el programa**, **no se copian nunca**.
- 🧠 **Conexión con la U2:** en `fork` + `execve`, el hijo descarta su espacio casi enseguida. Sin copia en escritura, el `fork` habría copiado todo para tirarlo después.
- ⚠️ El mismo trap, «escritura en página de solo lectura», puede deberse a copia en escritura o a un **error real**, como escribir en el código. El SO los distingue: en el segundo caso le manda una **señal** al proceso.

---

## 8.9 Bibliotecas compartidas (DLL) (págs. 223–225)

**Enlazado estático** (`ld *.o -lc -lm`): las funciones que faltan, llamadas **externas indefinidas** (por ejemplo `printf`, que a su vez necesita `write`), se **copian dentro del ejecutable**. Con bibliotecas gráficas de 20–50 MB en cientos de programas, se desperdicia disco **y** RAM.

**Biblioteca compartida (en Windows, DLL):** el enlazador pone una **rutina auxiliar chica** que se vincula con la función **en tiempo de ejecución**. Hay **una sola copia en RAM**, que se reutiliza si otro programa ya la cargó.
- ⚠️ **No se carga entera**: se **pagina bajo demanda**, una página a la vez.
- **+** Si se corrige un error en la DLL (por ejemplo, con Windows Update), todos los programas usan la versión nueva **sin recompilar**.

**El «pequeño problema»** (fig. 3-27): la biblioteca queda en **una dirección virtual distinta en cada proceso**.

```
 proceso 1: biblioteca en 36K    proceso 2: biblioteca en 12K
 instrucción "JMP 36K+16"  ✔ en P1   ✘ en P2 (tendría que ser 12K+16)
```

- Reubicar al cargar no sirve, porque **el código es uno solo** para los dos procesos.
- Hacer copia en escritura y reubicar cada copia anula el propósito de compartir.
- ✅ **La solución es el código independiente de la posición**: se compila sin direcciones absolutas, **solo con saltos relativos** («saltar n bytes»).
- 🧠 La **dirección física** no importa: esa la resuelve la MMU.

---

## 8.10 Archivos asociados a memoria (pág. 225)

Una llamada al sistema **asocia un archivo a una parte del espacio virtual**. Desde ahí, el archivo se usa **como un arreglo en memoria**, sin `read` ni `write`.
- Se pagina **bajo demanda**, con el archivo como almacén de respaldo.
- Al desasociarlo o al terminar el proceso, las páginas **modificadas se escriben** en el archivo.
- Si **dos procesos asocian el mismo archivo**, se comunican por **memoria compartida**, con mucho ancho de banda.
- 🧠 Las bibliotecas compartidas son **un caso particular** de esto.

---

## 8.11 Política de limpieza: el demonio de paginación (pág. 226)

**Idea:** la paginación anda mejor si **siempre hay marcos libres**. Así, ante un fallo no hay que escribir una sucia al disco con apuro.

El **demonio de paginación** es un proceso en segundo plano que se despierta periódicamente:
1. si hay **pocos marcos libres**, elige víctimas con un algoritmo de reemplazo;
2. si están **sucias**, las escribe al disco;
3. **recuerda su contenido**: si la página se vuelve a pedir antes de que se pise el marco, **se recupera** de la reserva de libres.

**Implementación con reloj de dos manecillas:**
- la **principal**, del demonio, va **limpiando**: si la página está sucia la escribe y avanza, y si está limpia solo avanza;
- la **secundaria** hace el **reemplazo**, como en el reloj común, y ahora encuentra páginas limpias con más frecuencia.

---

## 8.12 Interfaz de memoria virtual (págs. 226–227)

Algunos sistemas le dan al programador control sobre su mapa de memoria:
- **Memoria compartida con nombre:** un proceso le pasa a otro el nombre de una región para que la asocie.
- **Mensajes sin copiar:** el emisor desasocia las páginas y el receptor las asocia. Se copian **los nombres de las páginas**, no los datos.
- **Memoria compartida distribuida:** las páginas se comparten **por la red**. Un fallo de página hace que se pida la página a otra máquina; el libro la desarrolla en el cap. 8.

📖 *Tanenbaum 3.5.4–3.5.9, págs. 221–227, figs. 3-25 a 3-27.*

---

## 🎛 El simulador

Te abrí **[copia_en_escritura.html](unidades/u03-memoria/visuales/copia_en_escritura.html)**, con dos pestañas:
1. **fork y copia en escritura:**
   - muestra las tablas de padre e hijo y los marcos de RAM, con un contador de copias y traps;
   - el guion de ejemplo recorre el fork, una lectura, las escrituras con su trap y su copia, la escritura en texto (que es un error real) y el `execve`;
   - con el selector lo comparás contra un fork **sin** copia en escritura: **3 copias vs. 2**;
   - también podés armar tus propias acciones con los botones.
2. **Bibliotecas compartidas:** paneles con +/− de enlazado estático, DLL y código independiente de la posición, y una calculadora del salto de la fig. 3-27, donde movés dónde queda la biblioteca en cada proceso.

Pasó 19 verificaciones, incluidas las pruebas en Chrome y en celular. Ya está en el índice y en la pestaña 🎛.

---

### Preguntas

**1.** Un proceso tiene **4 páginas de texto, 10 de datos y 2 de pila**. Hace `fork()`. El hijo **escribe en 3 páginas de datos y en 1 de pila**, y después hace `execve()`. ¿Cuántas páginas se copiaron **sin** copia en escritura y cuántas **con** copia en escritura? ¿Por qué el texto no cuenta en ninguno de los dos casos?

**2.** ¿Por qué en una biblioteca **compartida** no alcanza con reubicar las direcciones al cargarla, como se hace con una biblioteca estática? ¿Cómo se resuelve?

<<<<<< MENSAJE 41 >>>>>>

Te queda bastante menos de lo que ya hicimos. Lo más pesado de la unidad, los **algoritmos de reemplazo**, ya está. Lo que sigue:

| Tema | Qué entra | Libro | Largo |
|---|---|---|---|
| **9. Implementación: manejo del fallo de página** | qué hace el SO en cada momento, los **10 pasos del fallo** (se toman para recitar), respaldo de instrucción, bloqueo de páginas, almacén de respaldo (swap), política vs. mecanismo | 3.6, págs. 227–234 | 🟡 **medio** (1 bloque) |
| **10. Segmentación** | segmentación pura, paginación vs. segmentación, segmentación con paginación en **MULTICS** y en el **Pentium** (GDT/LDT, selectores) | 3.7, págs. 234–247 | 🔴 **el más largo que queda**. Lo parto en 2: pura + comparación, y después MULTICS/Pentium |
| **11. Casos de estudio** | Linux: `malloc`, `free`, `calloc`, `realloc` y los comandos de la cátedra; caché (ya visto en la U1, es un repaso corto); administrador de memoria de Windows (todavía tengo que ubicarlo en el cap. 11) | 10.4.2, 1.3.2, 11.5 | 🟢 **corto** |
| **Cierre de la unidad** | los 5–8 puntos clave y lo que más se toma | — | 🟢 corto |

Son unos **4 o 5 bloques de clase** más. Con el ritmo que venimos llevando, entra en tu plan de terminar la U3 el **14/11**, y vamos bien.

Después del cierre quedan los pasos fijos: el **PDF de repaso de la U3**, sumar la U3 al **mapa conceptual** y el **cuestionario**.

Antes de seguir, ¿respondés las dos preguntas del tema 8B (copia en escritura y bibliotecas compartidas)? Si preferís dejarlas, escribí «seguí» y arrancamos con el **tema 9**.

<<<<<< MENSAJE 42 >>>>>>

## Corrección

**1. ✅ Los números están bien: 12 sin copia en escritura y 4 con copia en escritura.**

```
sin COW: el fork copia TODO lo escribible → 10 datos + 2 pila = 12
         (y con el execve se tiran las 12; 8 de ellas ni se tocaron)
con COW: se copia solo lo que se escribió → 3 datos + 1 pila  = 4
```

Al explicar por qué el texto no cuenta, decís «porque no se escribió». Es correcto, pero incompleto. La razón de fondo es que **el texto es de solo lectura siempre**: no se puede escribir, así que **se comparte en los dos casos**, incluso en un fork sin copia en escritura. Si alguien intentara escribirlo, no habría copia: habría un **trap por violación real** y una señal al proceso.

📌 Frase de examen: *«El texto se comparte siempre porque es de solo lectura; la copia en escritura solo cambia qué pasa con los datos y la pila.»*

Un detalle de redacción: no uses «quedaron en lectura» para describir el estado final. Después del `execve` el hijo **descarta todo** su espacio. Lo que importa es **cuántas copias se hicieron en el camino**.

---

**2. 🟡 Parcial.** La parte de cómo se comparte está bien: cada proceso la ve en **una dirección virtual distinta**, sus tablas apuntan **a los mismos marcos** y es código de solo lectura. Te faltan dos cosas.

**El porqué de que reubicar no alcance.** Reubicar significa **escribir la dirección final dentro del código**, por ejemplo `JMP 36K+16`. Pero hay **una sola copia del código en RAM** para los dos procesos:

```
 marcos compartidos:  JMP 36K+16   ← reubicado para P1
 P1 (biblioteca en 36K) → salta bien ✔
 P2 (biblioteca en 12K) → salta a 36K+16 ✘  (tendría que ser 12K+16)
```

Una página compartida no puede tener **dos contenidos distintos**, uno para cada proceso. Hacer una copia por proceso, con copia en escritura, arruina justamente la idea de compartir.

**La solución, con su nombre.** Tu frase «pegan saltos según dónde esté» va por buen camino, pero el examen pide el término: **código independiente de la posición**. La biblioteca se compila con una **bandera especial** para que **no use direcciones absolutas, solo saltos relativos** («saltar +16 bytes»). Ese salto funciona igual en 36K que en 12K.

En la pestaña 2 de [copia_en_escritura.html](unidades/u03-memoria/visuales/copia_en_escritura.html) podés mover dónde queda la biblioteca en cada proceso y ver cómo el salto absoluto falla y el relativo no.

---

Escribí **«seguí»** y pasamos al **tema 9: el manejo del fallo de página**, con los 10 pasos para recitar.

<<<<<< MENSAJE 43 >>>>>>

Funciona. Lo agrego al índice y al mapa:

<<<<<< MENSAJE 44 >>>>>>

# Tema 9: Cuestiones de implementación. El fallo de página paso a paso ★

Hasta acá vimos **qué** decide el SO. Ahora vemos **cómo lo hace por dentro**.

```
   ¿CUÁNDO trabaja el SO en la paginación? (4 momentos)
        │
        └─ en el FALLO ──► los 10 PASOS ★
                              ├─ paso 8: RESPALDO DE INSTRUCCIÓN
                              └─ y mientras espera el disco:
                                   BLOQUEO DE PÁGINAS (E/S)
   ¿DÓNDE van las páginas en el disco? → ALMACÉN DE RESPALDO
   ¿cómo se ORGANIZA el código? → POLÍTICA vs. MECANISMO
```

---

## 9.1 Los 4 momentos en que el SO trabaja con la paginación (págs. 227–228)

| Momento | Qué hace el SO |
|---|---|
| **Crear** un proceso | decide su tamaño inicial, **crea e inicializa la tabla de páginas**, reserva el **área de intercambio** en disco y la carga con el texto y los datos; anota todo en la **tabla de procesos** |
| **Ejecutar** un proceso | **reinicia la MMU**, **vacía la TLB** (tiene restos del proceso anterior) y carga la tabla del nuevo; opcionalmente prepagina, por ejemplo la página a la que apunta el PC |
| **Fallo** de página | los 10 pasos (abajo) |
| **Terminar** un proceso | libera la tabla, las páginas y su espacio en disco. ⚠️ Las **compartidas** se liberan recién cuando **termina el último** proceso que las usa (lo vimos en el tema 8B) |

---

## 9.2 Manejo de un fallo de página: los 10 pasos ★ (págs. 228–229)

**Intuición:** es como cuando estás leyendo y te falta un libro. Marcás la página donde quedaste (pasos 1–2). Fijás qué libro te falta (3). Verificás que sea un libro tuyo (4). Hacés lugar en el escritorio (5). Lo pedís y, mientras llega, hacés otra cosa (6). Cuando llega, lo acomodás (7). Volvés al principio del párrafo (8). Retomás donde estabas (9–10).

```
 ┌ HARDWARE ─── 1. TRAP al kernel; guarda el PC en la pila
 │                 (+ info de la instrucción a medias en registros especiales)
 ├ ENSAMBLADOR  2. guarda registros generales e info volátil; llama al SO
 ├ SO ───────── 3. ¿qué página virtual? (registro de HW, o analiza la instrucción)
 │              4. ¿dirección válida y protección ok?  NO → señal / eliminar
 │                 ¿hay marco libre?  NO → algoritmo de REEMPLAZO
 │              5. víctima SUCIA → planifica escritura + CAMBIO DE CONTEXTO
 │                 (A suspendido, corre otro; el marco se marca OCUPADO)
 │              6. marco limpio → busca la dirección de disco y planifica la LECTURA
 │                 (A sigue suspendido, corre otro)
 ├ DISCO ────── 7. interrupción: llegó → actualiza la TABLA, marco en estado normal
 ├ SO ───────── 8. RESPALDA la instrucción; PC → inicio de la instrucción
 │              9. planifica a A; vuelve a la rutina en ensamblador
 └ ENSAMBLADOR 10. recarga registros → modo usuario → "como si nada"
```

**Notas de memoria:**
- 🧠 **1–2 y 9–10 son espejo**: lo que se guarda al entrar se restaura al salir. Es el mismo esquema que el **tratamiento de una interrupción** de la U1 y el **cambio de contexto** de la U2.
- 🧠 El fallo de página es un **trap**: lo provoca la propia instrucción, de forma sincrónica. No es una interrupción de un dispositivo; esa aparece recién en el paso 7, cuando el disco avisa.
- ⚠️ Mientras espera el disco, el proceso está **BLOQUEADO** y la CPU la usa **otro proceso**. Cuando llega la página pasa a **LISTO**, no directamente a ejecución: el paso 9 dice que **se planifica**.
- ⚠️ El paso 6 **busca la dirección de disco**. Ese dato **no está en la tabla de páginas** (lo viste en el tema 5): lo guarda el SO aparte.
- ⚠️ **Errata del libro en español, paso 4:** dice «si la dirección es válida y no ha ocurrido un **fallo de página**». Tiene que decir «y no hubo una **violación de protección**», porque el fallo de página ya ocurrió.

La cátedra copia estos 10 pasos textuales en su resumen: **se toman para recitar**.

---

## 9.3 Respaldo de instrucción (págs. 229–230, fig. 3-28)

El paso 8 parece fácil y no lo es. Hay que **volver al inicio de la instrucción**, pero el PC puede haber quedado en el medio.

```
 MOV.L #6(A1), 2(A0)   (Motorola 680x0, 6 bytes)
 1000 │ código de operación │
 1002 │ 1er operando: 6     │   ← según QUÉ referencia falló, el PC
 1004 │ 2do operando: 2     │     puede valer 1000, 1002 o 1004
```

- Si el PC vale 1002, el SO **no puede saber** si esa palabra es un operando de la instrucción de 1000 o el código de operación de otra instrucción.
- **Peor todavía:** con **autoincremento o autodecremento**, un registro pudo haberse modificado antes del fallo, y hay que deshacerlo. Depende de cada instrucción y de cada modelo de CPU.
- **Solución de hardware:** un **registro interno oculto** donde se copia el PC antes de cada instrucción, y otro que indica qué registros se autoincrementaron y en cuánto. Sin eso, el SO tiene que deducirlo («hacer peripecias», dice el libro).

---

## 9.4 Bloqueo de páginas en memoria (pinning) (págs. 230–231)

Es un escenario con trampa:
1. el proceso A pide leer del disco a **un búfer suyo** y queda bloqueado;
2. corre B y tiene un fallo de página;
3. con **reemplazo global**, la víctima puede ser **justo la página del búfer de A**;
4. el **DMA** sigue escribiendo, y parte de los datos cae en el búfer y parte **encima de la página nueva de B**.

**Soluciones:**
- **fijar (pin)** en memoria las páginas que participan en una E/S, para que no se puedan desalojar;
- hacer toda la E/S a **búferes del kernel** y después copiar los datos al usuario.

🧠 **Conexión con la U1:** el DMA trabaja con **direcciones físicas** y no se entera de que el SO cambió la página de lugar.

---

## 9.5 Almacén de respaldo: ¿dónde van las páginas en el disco? (págs. 231–232, fig. 3-29)

Se usa una **partición de intercambio**: sin sistema de archivos, con bloques numerados desde su inicio, mejor si está en otro disco. La mayoría de los UNIX funcionan así. Cada proceso tiene en la **tabla de procesos** la dirección de su área de intercambio.

| (a) Área **estática** | (b) Respaldo **dinámico** |
|---|---|
| cada página tiene un **lugar fijo**: `inicio del área + n.º de página` | se asigna lugar **recién al sacar** la página |
| una página en RAM siempre tiene una **copia sombra** en disco (obsoleta si M = 1) | una página en RAM **no tiene** copia en disco |
| **+** cálculo trivial | **+** los procesos en memoria no acaparan disco |
| **−** problema: los datos y la pila **crecen** → conviene usar áreas separadas para texto, datos y pila | **−** necesita un **mapa de disco** por proceso: una dirección de disco por página virtual |

Hay otras opciones:
- Usar **archivos** dentro del sistema de archivos común en lugar de una partición; es lo que hace **Windows**.
- Usar el **propio ejecutable** como respaldo del **texto**. Como es de solo lectura, cuando hace falta lugar las páginas de texto **se descartan** y después se vuelven a leer del ejecutable. Las bibliotecas compartidas también pueden trabajar así.

---

## 9.6 Separación de política y mecanismo (págs. 233–234, fig. 3-30)

La idea viene de **Mach**: sacar la **política** del kernel. El administrador de memoria queda en tres partes (⚠️ el libro dice «dos partes» y después lista tres):

```
 ESPACIO DE USUARIO:  proceso de usuario          PAGINADOR EXTERNO (política)
                            │1. fallo                ▲2. pág. necesaria │3. la pide
 ESPACIO DE KERNEL:   MANEJADOR DE FALLOS (mecanismo) ◄─5. aquí está─────┘ al disco
                            │6. asocia la página     (4. llega del disco)
                      MANEJADOR DE LA MMU (dependiente de la máquina)
```

- **+** Es más **modular y flexible**.
- **−** Hay que **cruzar varias veces el límite entre usuario y kernel** y mandar muchos mensajes.
- ⚠️ El algoritmo de reemplazo es difícil de ubicar en el paginador externo, porque este **no tiene acceso a los bits R y M**. Por eso suele quedar en el kernel.

📖 *Tanenbaum 3.6.1–3.6.6, págs. 227–234, figs. 3-28 a 3-30.*

---

## 🎛 El simulador

Te abrí **[fallo_de_pagina.html](unidades/u03-memoria/visuales/fallo_de_pagina.html)**:
- Recorre los 10 pasos con **quién ejecuta cada uno**, en colores: hardware, ensamblador, SO, disco.
- Muestra casillas para el modo de la CPU, el PC, la pila, los registros, el **estado de A**, **quién usa la CPU**, el disco y la tabla de páginas.
- Tiene 5 escenarios: víctima sucia, víctima limpia, marco libre, **dirección inválida** y **violación de protección**. Los dos últimos cortan en el paso 4 con una señal.
- Marca la errata del paso 4 y el respaldo de instrucción.

Pasó 14 verificaciones, incluidas las pruebas en Chrome y en celular. Ya está en el índice y en la pestaña 🎛.

---

### Preguntas

**1.** Recitá los **10 pasos** del manejo de un fallo de página. En cada uno indicá **quién lo ejecuta**: hardware, rutina en ensamblador, SO o disco.

**2. Escenario.** Un proceso A queda bloqueado esperando una lectura de disco por **DMA** a un búfer suyo. Mientras tanto, B tiene un fallo de página, el SO usa **reemplazo global** y la víctima elegida es justo la página del búfer de A. ¿Qué pasa? ¿Cómo se evita?

<<<<<< MENSAJE 45 >>>>>>

## Corrección

**1. ✅ Muy bien.** Están los 10 pasos, en orden y cada uno con su actor. Para dejarlo redondo en el examen, ajustá tres detalles:

- **Paso 4.** «Lo mata» es incompleto. El libro dice que el proceso **recibe una señal o es eliminado**. Con una señal, el proceso puede tener un manejador que la atienda; no siempre muere.
- **Paso 5.** Te faltó que **el marco se marca como ocupado** mientras se escribe, para que nadie lo use para otra cosa. Es corto, pero el libro lo dice.
- **Paso 7 vs. paso 9: cuándo pasa A a LISTO.** Lo pusiste en el paso 9. El cambio de BLOQUEADO a LISTO lo provoca **la interrupción de disco del paso 7**, que es el evento que A esperaba (U2: termina la E/S, el proceso pasa a LISTO). En el paso 9 el libro dice «el proceso fallido **se planifica**»: el planificador lo elige y vuelve a correr. No es un error grave, porque el libro no lo dice explícitamente, pero es lo coherente con el diagrama de estados.

```
 paso 5–6: A BLOQUEADO (espera al disco)
 paso 7:   interrupción de disco → A pasa a LISTO
 paso 9:   el planificador elige a A → EJECUCIÓN
```

Tu observación de que el paso 6 busca la dirección de disco en las **tablas de software del SO** está muy bien: es la trampa del tema 5.

---

**2. ✅ Correcta.** La solución tiene el nombre justo: **fijar la página (pinning)**.

Te ajusto dos cosas de la explicación:
- **Qué se rompe:** el DMA sigue escribiendo en **ese marco físico**. Los datos de la lectura terminan **una parte en el búfer de A** (antes del reemplazo) y **otra parte encima de la página nueva de B**. Se arruinan **las dos cosas**: B pierde su página y A recibe sus datos incompletos.
- **La segunda solución del libro:** hacer toda la E/S a **búferes del kernel**, que no se paginan, y después **copiar** los datos a la página de A.

🧠 La raíz del problema es que el DMA trabaja con **direcciones físicas** y no se entera de que el SO le cambió el dueño al marco (conexión con la U1).

---

Vamos bien con el plan: **ya hiciste 9 de los 11 temas de la U3**. Escribí **«seguí»** y pasamos al **tema 10: segmentación**. Es el último tema largo y lo voy a partir en dos: primero segmentación pura y la comparación con paginación, después MULTICS y el Pentium.

<<<<<< MENSAJE 46 >>>>>>

Antes de probarlo limpio el bloque de ubicación, que me quedó desprolijo:

<<<<<< MENSAJE 47 >>>>>>

El motor está bien: me equivoqué en la expectativa del test. El hueco que deja el 6 es de 4K, así que el 9 va al primer hueco que alcanza, el de 15K. Corrijo el test:

<<<<<< MENSAJE 48 >>>>>>

Saco del aviso de compactación un agregado mío que no está en el material, y después lo agrego al índice y al mapa:

<<<<<< MENSAJE 49 >>>>>>

# Tema 10A: Segmentación ★

Hasta ahora la memoria virtual era **unidimensional**: un solo espacio de 0 al máximo. La segmentación propone **muchos espacios independientes**.

```
   problema: tablas que crecen y CHOCAN en un espacio lineal (fig. 3-31)
        ▼
   SEGMENTOS: muchos espacios independientes, longitud variable
        ├─ ventajas: crecer sin chocar · vincular · compartir · proteger
        ├─ vs. PAGINACIÓN (fig. 3-33) ★
        └─ problema: tamaño variable → TABLERO DE AJEDREZ → compactación
                                   → solución real: PAGINAR los segmentos (10B)
```

---

## 10.1 El problema y la idea (págs. 234–236, figs. 3-31 y 3-32)

**El ejemplo del libro es un compilador**, que maneja cinco tablas:
- el texto fuente;
- la tabla de símbolos;
- las constantes;
- el árbol sintáctico;
- la pila de llamadas.

Las cuatro primeras **crecen todo el tiempo** y la pila crece y se achica.

```
 espacio LINEAL (fig. 3-31):
 ┌──────────┬──────────┬──────────┬──────────┬──────┐
 │ texto    │ símbolos▶│▶ ¡choca! │ árbol    │ pila │   ← hay lugar libre en otra
 └──────────┴──────────┴──────────┴──────────┴──────┘     tabla, pero no sirve
```

Las salidas posibles en un espacio lineal son malas:
- abortar con «demasiadas variables», que «no parece muy deportivo»;
- hacer de **Robin Hood**: sacarle espacio a una tabla para dárselo a otra. Es tedioso, como manejar overlays a mano.

**La solución** es darle a la máquina **muchos espacios de direcciones independientes**, llamados **segmentos**:
- cada uno va de **0 a un máximo**;
- cada uno tiene **su propia longitud**, que **puede cambiar** durante la ejecución;
- cada uno crece sin afectar a los demás.

**La dirección es bidimensional:** `(número de segmento, dirección dentro del segmento)`.

🧠 **Un segmento es una entidad LÓGICA** que el programador conoce: un procedimiento, un arreglo, una pila. Por lo general **no mezcla tipos**.

---

## 10.2 Ventajas de la segmentación (págs. 236–237)

1. **Crecimiento independiente.** Una tabla crece sin chocar con las otras.
2. **Vinculación más simple.** Si cada procedimiento está en su propio segmento, se lo llama con `(n, 0)`. Si se recompila y queda más grande, **no cambia la dirección de ningún otro**. En memoria lineal, los procedimientos van uno al lado del otro, y agrandar uno corre a todos los demás.
3. **Compartición.** Una biblioteca gráfica entera va en **un segmento** que comparten muchos procesos. Con paginación pura también se puede, pero el libro dice que eso se hace «**simulando la segmentación**».
4. **Protección por tipo.** Un procedimiento puede ser de **solo ejecución** (no se puede leer ni escribir), y un arreglo de **lectura/escritura pero no ejecutable** (si se intenta saltar a él, se atrapa).

🧠 **¿Por qué la protección tiene sentido en segmentación y no en paginación?** Porque **cada segmento contiene un solo tipo de objeto**. El contenido de una página es **accidental**: una página puede tener el final del código y el principio de los datos. Para proteger por páginas, el programador tendría que saber dónde caen los límites de página, y la paginación se inventó justamente para que no tuviera que saberlo.

---

## 10.3 Paginación vs. segmentación (fig. 3-33, pág. 238) ★ se toma tal cual

| Consideración | Paginación | Segmentación |
|---|---|---|
| ¿El programador tiene que saber que se usa? | **No** | **Sí** |
| ¿Cuántos espacios lineales hay? | **1** | **Muchos** |
| ¿El espacio total puede superar la memoria física? | **Sí** | **Sí** ⚠️ |
| ¿Se pueden proteger por separado procedimientos y datos? | No | Sí |
| ¿Se acomodan las tablas que cambian de tamaño? | No | Sí |
| ¿Se facilita compartir procedimientos? | No | Sí |
| ¿Para qué se inventó? | espacio lineal **grande** sin comprar RAM | espacios **lógicamente independientes** → **compartir y proteger** |

⚠️ **La trampa:** todo es No/Sí **salvo** «¿puede superar la memoria física?», que es **Sí en las dos**. No es una diferencia.

🧠 **Mnemotecnia:** la paginación es para **el tamaño** (la memoria «parece» más grande); la segmentación es para **la organización** (la memoria «parece» ordenada como el programa).

---

## 10.4 Implementación de la segmentación pura: el tablero de ajedrez (págs. 237–238, fig. 3-34)

**La diferencia esencial:** **las páginas tienen tamaño fijo y los segmentos no.** Eso trae el mismo problema que la asignación con particiones variables del tema 3.

```
 (a)          (b) sale 1,     (c) sale 4,     (d) sale 3,     (e) COMPACTACIÓN
               entra 7 (5K)    entra 5 (4K)    entra 6 (4K)
 ┌──────┐     ┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐
 │ 4 7K │     │ 4 7K │        │ (3K) │        │ (3K) │        │      │
 │      │     │      │        │ 5 4K │        │ 5 4K │        │(10K) │
 ├──────┤     ├──────┤        ├──────┤        │ (4K) │        │      │
 │ 3 8K │     │ 3 8K │        │ 3 8K │        │ 6 4K │        ├──────┤
 ├──────┤     ├──────┤        ├──────┤        ├──────┤        │ 5 4K │
 │ 2 5K │     │ 2 5K │        │ 2 5K │        │ 2 5K │        │ 6 4K │
 ├──────┤     │ (3K) │        │ (3K) │        │ (3K) │        │ 2 5K │
 │ 1 8K │     │ 7 5K │        │ 7 5K │        │ 7 5K │        │ 7 5K │
 ├──────┤     ├──────┤        ├──────┤        ├──────┤        ├──────┤
 │ 0 4K │     │ 0 4K │        │ 0 4K │        │ 0 4K │        │ 0 4K │
 └──────┘     └──────┘        └──────┘        └──────┘        └──────┘
```

- Después de un rato la memoria queda con **segmentos y huecos alternados**. Eso es el **efecto tablero de ajedrez**, o **fragmentación externa**.
- En (d) hay **10K libres en total**, pero en huecos de 3K, 4K y 3K. Un segmento de 5K **no entra**.
- Se arregla con **compactación** (e): se mueven todos los segmentos hacia un extremo. Según la cátedra, **es costosa**.

⚠️ **Par que se confunde:**

| | Paginación | Segmentación pura |
|---|---|---|
| Fragmentación | **interna** (½ página por segmento, tema 8) | **externa** (huecos entre segmentos) |

🧠 **Conexión con temas anteriores de la U3:** es el mismo problema de **huecos** que la asignación con particiones variables y el intercambio (temas 2–3), y la misma solución de **compactación**.

---

## 10.5 Traducción de una dirección (s, d): complemento

⚠️ **El libro no da una cuenta numérica para la segmentación pura.** Te muestro la lógica porque es el mismo **base/límite** del tema 2, pero **con un par por segmento**:

```
 (s, d) ──► tabla de segmentos[s] = { base, límite, protección }
              │
              ├─ ¿existe s?        NO → trap
              ├─ ¿d < límite?      NO → trap (fuera del segmento)
              ├─ ¿prot. permite?   NO → trap (violación de protección)
              └─ física = base + d

 Ej.: seg 2 = {base 4300, límite 400, R}    (2, 53) leer → 4300 + 53 = 4353
```

🧠 **Diferencia con paginación:** acá se **SUMA** la base, porque un segmento puede empezar en cualquier dirección. En paginación se **PEGAN** los bits del marco y del desplazamiento, porque los marcos están alineados a potencias de 2.

📖 *Tanenbaum 3.7 y 3.7.1, págs. 234–238, figs. 3-31 a 3-34.*

---

## 🎛 La visualización

Te abrí **[segmentacion.html](unidades/u03-memoria/visuales/segmentacion.html)**, con tres pestañas:
1. **Paginación vs. segmentación:** paneles lado a lado con +/− y la tabla de la fig. 3-33, con la trampa marcada.
2. **Tablero de ajedrez:** la fig. 3-34 paso a paso, con huecos rayados, la estadística de «libre total vs. hueco más grande» y la compactación. Podés editar los eventos; el botón «Uno que no entra» te muestra la fragmentación externa en acción.
3. **Traducción (s, d):** una calculadora con base, límite y protección, marcada como complemento.

Pasó 21 verificaciones: las cinco etapas de la fig. 3-34, los casos borde de límite y protección, y las pruebas en Chrome y en celular. Ya está en el índice y en la pestaña 🎛.

---

### Preguntas

**1. Ejercicio.** La tabla de segmentos de un proceso es:

| Seg | Base | Límite | Protección |
|---|---|---|---|
| 0 | 2000 | 600 | X (solo ejecución) |
| 1 | 5000 | 1400 | RW |
| 2 | 900 | 100 | R |

¿Qué pasa con cada acceso? Si es válido, dá la dirección física; si no, decí qué falla.
- a) **escribir** en (1, 1300)
- b) **ejecutar** en (0, 700)
- c) **escribir** en (2, 50)

**2. V o F, justificá:** *«La segmentación pura sufre fragmentación interna y la paginación sufre fragmentación externa.»*

<<<<<< MENSAJE 50 >>>>>>

# Corrección del tema 10A

**1. Ejercicio: 3/3 ✅**

| Acceso | Chequeo | Resultado |
|---|---|---|
| a) escribir (1, 1300) | 1300 < 1400 ✓ · RW permite escribir ✓ | **5000 + 1300 = 6300** ✅ |
| b) ejecutar (0, 700) | 700 ≥ 600 ✗ | **trap: fuera del segmento** ✅ |
| c) escribir (2, 50) | 50 < 100 ✓ · R no permite escribir ✗ | **trap: violación de protección** ✅ |

Dos detalles para que la respuesta quede de final:
- **En b), la X no importa.** Ejecutar en el segmento 0 está permitido, pero el acceso falla antes, en el límite. Si te piden «qué falla», nombrá el primer chequeo que no pasa.
- **En b) y c) el trap es distinto.** En b) el desplazamiento está fuera del segmento; en c) la dirección es válida pero la operación no está permitida. Es la misma distinción del tema 9 entre dirección inválida y violación de protección, y en los dos casos el proceso recibe **SIGSEGV**.

**2. V/F: correcto ✅.** Es **falso**, porque está al revés.
- La **paginación** tiene fragmentación **interna**: la última página queda a medio llenar, en promedio ½ página por segmento del programa.
- La **segmentación pura** tiene fragmentación **externa**: el tablero de ajedrez, con huecos entre segmentos que se arreglan compactando.

Para sumar en la justificación: *«…y la paginación no tiene externa porque cualquier marco libre sirve para cualquier página»*.

---

El tema 10A queda firme. Sigue el **10B: segmentación con paginación**, con **MULTICS** y el **Pentium**. Ahí se resuelve el tablero de ajedrez: se paginan los segmentos para tener lo bueno de las dos técnicas.

Escribí **«seguí»** cuando quieras.

<<<<<< MENSAJE 51 >>>>>>

Ya leí el libro (3.7.2–3.7.3, págs. 238–247) y el apunte. Ahora armo el simulador de la traducción de direcciones en MULTICS y en el Pentium, y después te paso la clase.

<<<<<< MENSAJE 52 >>>>>>

El simulador ya pasó todas las pruebas. Ahora corrijo dos detalles visuales: los anillos se pintaban como discos llenos y la etiqueta de la dirección física estaba mal.

<<<<<< MENSAJE 53 >>>>>>

Now link into the index and the 🎛 tab. Let me check the anchors used last time.

<<<<<< MENSAJE 54 >>>>>>

# Tema 10B: Segmentación con paginación ★

**El problema del 10A**: los segmentos son de tamaño variable, así que aparece el tablero de ajedrez. Además, un segmento grande puede no entrar entero en memoria.

**La solución es paginar cada segmento.** Así solo tienen que estar en memoria las páginas que se usan, y se combina lo mejor de las dos técnicas:

```
   de la PAGINACIÓN:   tamaño uniforme · no hace falta el segmento entero en RAM
                       (se acaba la fragmentación externa)
   de la SEGMENTACIÓN: programación modular · protección · compartición
```

El libro presenta dos casos: **MULTICS** (el primero) y el **Intel Pentium** (uno más moderno).

---

## 10.6 MULTICS (págs. 238–242, figs. 3-35 a 3-38)

**Números de MULTICS:**
- hasta **2¹⁸ segmentos**, más de 250.000;
- cada uno de hasta **65.536 palabras** de 36 bits;
- páginas de **1024 palabras**.

**La dirección virtual tiene 34 bits** (fig. 3-36):

```
 ┌──────────────────────┬─────────┬──────────────┐
 │  nº de segmento (18) │ pág (6) │  desp. (10)  │
 └──────────────────────┴─────────┴──────────────┘
                         └─ dirección dentro del segmento ─┘
   6 bits de página × 10 bits de desplazamiento = 2^16 = 65.536 palabras ✓
```

**El descriptor de segmento** (fig. 3-35b). Cada programa tiene una tabla de segmentos con un descriptor por segmento. 🧠 Como puede tener más de 250.000 entradas, **la tabla de segmentos es en sí un segmento, y se pagina**. Cada descriptor contiene:
- si el segmento está en memoria; se considera que está si **cualquier parte** de él está;
- un **puntero de 18 bits** a su tabla de páginas. Alcanza con 18 bits porque las direcciones físicas son de 24 y las tablas se alinean a 64 bytes, así que los 6 bits bajos siempre valen 000000;
- la **longitud** del segmento en páginas, los **bits de protección** y algunos bits más.

⚠️ **Trampa de examen:** la **dirección del segmento en el disco NO está en el descriptor**. Está en otra tabla, la que usa el **manejador de fallos de segmento**.

**El algoritmo de referencia (pág. 240), para recitar:**
```
 1. El nº de segmento indexa el segmento de descriptores → descriptor
 2. ¿La tabla de páginas del segmento está en memoria?
        no → FALLO DE SEGMENTO
    ¿Hay violación de protección? → TRAP
 3. Se examina la entrada de la página:
        no está → FALLO DE PÁGINA
        está    → se obtiene el origen del marco
 4. origen del marco + desplazamiento = dirección física
 5. Se hace la lectura o escritura
```

⚠️ **Hay dos fallos distintos.** El **fallo de segmento** ocurre cuando falta **la tabla de páginas** del segmento; el **fallo de página** ocurre cuando falta **la página**.

**TLB (fig. 3-38).** Hacer ese recorrido en cada instrucción sería lentísimo, así que el hardware tiene un **TLB de 16 entradas** que compara **(segmento, página)** en paralelo y guarda también la protección. Si no hay acierto, se recorren las tablas y se carga la entrada; sale la de uso menos reciente, según un campo **edad**. Los programas cuyo conjunto de trabajo entra en 16 páginas andan muy rápido.

---

## 10.7 Intel Pentium (págs. 242–247, figs. 3-39 a 3-43)

**Números del Pentium:** **16K segmentos**, de hasta **mil millones de palabras** de 32 bits. Tiene menos segmentos que MULTICS pero mucho más grandes, porque pocos programas usan más de 1000 segmentos y muchos necesitan segmentos grandes.

**Hay dos tablas:**

| | **LDT** (Local Descriptor Table) | **GDT** (Global Descriptor Table) |
|---|---|---|
| ¿Cuántas? | **una por programa** | **una sola**, compartida por todos |
| ¿Qué describe? | código, datos, pila… del programa | segmentos del **sistema**, incluido el SO |

**El selector (fig. 3-39)** es un número de 16 bits que se carga en un registro de segmento, como **CS** (código) o **DS** (datos):
```
 ┌─────────────────────┬────┬──────┐
 │     índice (13)     │ TI │ RPL  │   TI: 0 = GDT, 1 = LDT
 └─────────────────────┴────┴──────┘   RPL: nivel de privilegio (0 a 3)
     13 bits → 8K descriptores por tabla
```
- El **descriptor 0 está prohibido**: se puede cargar para indicar «registro no disponible», pero usarlo da trap.
- **El truco del libro:** se ponen en 0 los 3 bits bajos del selector y se le suma la dirección de la tabla. El resultado apunta justo al descriptor, porque cada descriptor ocupa **8 bytes**.
  - **Ejemplo del libro:** selector **72** = `0000000001001 0 00` → índice **9**, **GDT**, nivel 0 → el descriptor está en **GDT + 72**.

**La traducción, en orden (figs. 3-41 y 3-42):**
```
 (selector, desplazamiento)
   1. descriptor (8 bytes): Base 32 bits · Límite 20 bits · G · P · DPL · Tipo
   2. ¿selector 0 o P = 0 (segmento paginado afuera)? → TRAP
   3. ¿desplazamiento > Límite? → TRAP
        G = 0 → Límite en BYTES  (hasta 1 MB)
        G = 1 → Límite en PÁGINAS de 4 KB (hasta 2^32 bytes)
   4. DIRECCIÓN LINEAL = Base + desplazamiento         ← se SUMA
   5. ¿paginación deshabilitada? → física = lineal      (SEGMENTACIÓN PURA)
      ¿habilitada? → la lineal es VIRTUAL y se pagina en DOS niveles:
        ┌──────────┬───────────┬──────────────┐
        │ Dir (10) │ Pág (10)  │  Desp (12)   │   1024 × 1024 × 4 KB = 4 GB
        └──────────┴───────────┴──────────────┘
        Dir → directorio de páginas → tabla de páginas → marco + Desp
   (antes de todo esto se consulta un TLB de (Dir, Pág) → marco)
```
- **¿Por qué dos niveles?** Con 32 bits y páginas de 4 KB, un segmento podría tener **1 millón de páginas**. Cada tabla cubre **4 MB**, así que un segmento chico paga solo **dos páginas** (directorio y tabla) y no una tabla de un millón de entradas.
- Cada entrada de la tabla tiene 32 bits: **20 para el marco**, y el resto para los bits de acceso, sucio y protección.

🧠 **Las dos frases que se toman siempre:**
- **Paginación deshabilitada → segmentación pura.** El hardware no impide que los segmentos se superpongan.
- **Todos los segmentos con Base 0 y Límite máximo → paginación pura.** El desplazamiento ya es la dirección lineal. **Así funcionan todos los SO actuales en el Pentium**; según el libro, OS/2 fue el único que usó toda la potencia de la arquitectura.

**Protección: los anillos (fig. 3-43)**
```
        ┌─────────── 3 · programas de usuario ───────────┐
        │   ┌─────── 2 · bibliotecas compartidas ────┐   │
        │   │   ┌─── 1 · llamadas al sistema ───┐    │   │
        │   │   │       0 · KERNEL              │    │   │
```
- El nivel actual está en **2 bits del PSW**, y cada segmento tiene su nivel.
- Se permite acceder a **datos de un nivel más alto**, es decir, menos privilegiado. Acceder a **datos de un nivel inferior** da **trap**.
- Para **llamar a otro nivel**, el CALL tiene que llevar un selector de **compuerta de llamada**, no una dirección. Así solo se entra por **puntos de entrada oficiales**. Los traps y las interrupciones usan un mecanismo parecido.
- Las compuertas y los niveles vienen de los **anillos de protección de MULTICS**.

🧠 **Conexión con la U1:** los anillos 0 y 3 son el **modo kernel y el modo usuario**. La compuerta de llamada es la forma controlada de hacer el **TRAP de una llamada al sistema**.

📖 *Tanenbaum 3.7.2 y 3.7.3, págs. 238–247.* Según la cátedra, «todos los SO modernos en Pentium usan paginación y simulan segmentación mínima».

---

## 🎛 La visualización

Te abrí **[segmentacion_paginada.html](unidades/u03-memoria/visuales/segmentacion_paginada.html)**, con tres pestañas:
1. **MULTICS:** el algoritmo de 5 pasos con la línea resaltada y los bits 18 | 6 | 10 coloreados. Tiene escenarios para acierto en el TLB, fallo de segmento, fallo de página, protección y página fuera del segmento.
2. **Pentium:** el selector partido en 13 | 1 | 2, el descriptor, el límite con G, la dirección lineal y la partición Dir | Pág | Desp. Incluye el ejemplo del selector 72 del libro y un selector para habilitar o deshabilitar la paginación.
3. **Anillos:** elegís el nivel del programa, el del destino y la operación, y te dice si está permitido o si hay trap.

Todos los datos se pueden editar. Pasó **25 verificaciones del motor**, entre ellas 400 casos aleatorios contrastados con el cálculo directo, y **20 pruebas en Chrome** en escritorio y celular. Ya está en el índice y en la pestaña 🎛.

---

### Preguntas

**1. Ejercicio Pentium.** Un programa usa el selector **0x002F** y el desplazamiento **0x2345**. El descriptor correspondiente tiene Base = **0x00300000**, Límite = **0x00008**, **G = 1** y P = 1. La paginación está habilitada, y la entrada que corresponde en la tabla de páginas apunta al marco **0x0A1B0**.
- a) ¿Qué índice, qué tabla (LDT o GDT) y qué nivel de privilegio indica el selector?
- b) ¿Pasa el chequeo de límite? Justificá con el tamaño del segmento.
- c) ¿Cuál es la dirección lineal? ¿Cuánto valen Dir, Página y Desp?
- d) ¿Cuál es la dirección física?

**2. MULTICS.** Un proceso referencia `(7, 3, 12)`. El descriptor del segmento 7 indica que su tabla de páginas **no está en memoria**. ¿Qué tipo de fallo ocurre, en qué se diferencia de un fallo de página, y de dónde saca el SO la ubicación del segmento en el disco?

<<<<<< MENSAJE 55 >>>>>>

Sí, pero **no hace falta pasar todo a binario**. Hay partes que convienen en binario y partes que salen directo en hexa. Te muestro el método con **otros números** para no resolverte el ejercicio.

---

### a) El selector: conviene en binario

Pasás los 16 bits a binario, **un dígito hexa = 4 bits**, y cortás desde la derecha en **2 | 1 | 13**:

```
 0x000F = 0000 0000 0000 1111
          └──── 13 ────┘ │ └┘
        0000000000001   1  11
          índice = 1   TI=1  RPL = 3
                       (LDT)
```

🧠 **Atajo sin binario:** índice = selector ÷ 8 (sin decimales), TI = el bit de valor 4, RPL = selector mod 4. Igual el binario se ve más claro.

### b) El límite: en decimal, sin binario

- Si **G = 1**, el límite está en **páginas de 4 KB**: tamaño = Límite × 4096.
- Si **G = 0**, el límite está en bytes, tal cual.

Después pasás el desplazamiento a decimal y comparás: **desplazamiento < tamaño**, y si no, trap.

### c) La lineal y la partición: hexa y después binario solo donde hace falta

1. **Lineal = Base + desplazamiento.** Es una suma en hexa y se hace directo.
2. **Desp (12 bits) = los últimos 3 dígitos hexa**, porque 12 bits son justo 3 dígitos hexa. Sale sin binario.
3. **Dir y Página (10 + 10 bits)** son los otros 5 dígitos hexa. ⚠️ Como 10 no es múltiplo de 4, **no podés cortar en hexa**: esos 5 dígitos los pasás a binario (20 bits) y cortás 10 | 10.

Ejemplo con lineal **0x00C05ABC**:
```
 0x00C05ABC
   └─────┘└─┘
   00C05   ABC  → Desp = 0xABC
     │
     ▼ a binario (20 bits)
 0000 0000 1100 0000 0101
 └── 10 bits ──┘└── 10 bits ──┘
  0000000011     0000000101
   Dir = 3        Pág = 5
```

### d) La física: en hexa, pegando

**Física = marco (5 dígitos hexa) seguido del Desp (3 dígitos hexa).** No se suma: se **pega**, porque el marco está alineado a 4 KB.
- Ejemplo: marco 0x12345 y Desp 0xABC → **0x12345ABC**.
- Es lo mismo que marco × 4096 + Desp.

---

**Resumen:**

| Parte | Cómo |
|---|---|
| Selector | **binario**, cortar 13 \| 1 \| 2 |
| Límite | **decimal** (× 4096 si G = 1) |
| Lineal | **suma en hexa** |
| Desp | últimos **3 dígitos hexa** |
| Dir y Pág | primeros 5 hexa → **binario** → 10 \| 10 |
| Física | **pegar** marco y Desp en hexa |

Probalo con tus números. Si querés comprobar el resultado, en la pestaña **Pentium** del simulador cargás el descriptor `L 5 0x00300000 0x00008 1 1` y la página que te dé, y lo recorrés paso a paso. Hacelo **después** de resolverlo vos 😉

<<<<<< MENSAJE 56 >>>>>>

# Corrección del tema 10B

## 1. Ejercicio Pentium: 4/4 ✅

Todo correcto, y lo resolviste en **decimal**, que es válido. Lo paso a hexa para que veas que coincide:

| | Tu respuesta | En hexa | ✓ |
|---|---|---|---|
| a) | índice 5, LDT, nivel 3 | 0x002F = `0000000000101 1 11` | ✅ |
| b) | 32768 B; 9029 < 32768 | 8 páginas × 4 KB = 32 KB; 0x2345 < 0x8000 | ✅ |
| c) | lineal 3154757; Dir 0, Pág 770, Desp 837 | **0x00302345** → Dir 0, Pág **0x302**, Desp **0x345** | ✅ |
| d) | 169542469 | **0x0A1B0345** (se pegan marco y Desp) | ✅ |

**Consejo de examen:** dá el resultado **en hexa**, o en las dos bases. Si el enunciado viene en hexa, el docente corrige más rápido mirando `0x0A1B0345`, y ves enseguida que la física es el marco pegado al Desp. En decimal tuviste que hacer 41392 × 4096 + 837, que es una cuenta larga y donde es fácil equivocarse.

🧠 Un detalle lindo de tu c): **Dir = 0** porque la lineal (0x00302345) es menor que 4 MB (0x00400000). Todo el segmento cae en la **primera tabla de páginas**: eso es el «segmento chico que paga solo dos páginas» del libro.

---

## 2. MULTICS: parcial (≈ 2/3)

**✅ Fallo de segmento:** correcto.

**🟡 La diferencia** está bien encaminada, pero conviene decirla completa, porque falta el contraste:
> En el **fallo de segmento** falta **la tabla de páginas** del segmento, así que ni siquiera se puede mirar si la página está. En el **fallo de página** la tabla **sí** está en memoria, pero la entrada de esa página dice que la página no está.

Además, después de resolver el fallo de segmento puede venir **otro fallo**, el de página, si la página 3 tampoco está cargada.

**⚠️ De dónde saca la ubicación en disco:** acá está lo que se toma.
- La respuesta de examen es: **«de otra tabla que usa el manejador de fallos de segmento; la dirección en disco NO está en el descriptor»**. La trampa clásica es justamente decir que está en el descriptor, así que esa negación tiene que aparecer.
- Ojo con «**marcos** en el disco»: los **marcos** son de la **RAM**. En el disco no hay marcos.

📖 *Tanenbaum 3.7.2, pág. 239.*

---

**El tema 10 queda firme.** Te falla un poco la precisión del vocabulario, no el concepto.

Sigue el **tema 11, el último: casos de estudio**. Es corto: la gestión de memoria en **Linux** (`malloc` / `free` / `calloc` / `realloc` y los comandos de la cátedra), **caché** y el administrador de memoria de **Windows**. Después viene el **cierre** con los puntos clave de la U3.

Escribí **«seguí»** cuando quieras.

<<<<<< MENSAJE 57 >>>>>>

Ya leí casi todo el material del tema 11 (caché, Linux, comandos de la cátedra y Windows). Me falta un pedazo corto de Windows y armo la clase.

<<<<<< MENSAJE 58 >>>>>>

Me queda armar un simulador chico para la parte de Windows que más se toma, las listas de páginas de la fig. 11-36. Después te paso la clase.

<<<<<< MENSAJE 59 >>>>>>

# Tema 11: Casos de estudio, último tema de la U3

Son tres casos cortos, y te los paso en dos tandas:
- **11A:** caché
- **11B:** Linux (llamadas al sistema y comandos de la cátedra)
- **11C:** Windows, en la próxima tanda

---

## 11A. Memoria caché (Tanenbaum 1.3.2, págs. 23–25)

**La intuición:** la caché es el «escritorio» de la CPU. Lo que usás seguido lo tenés a mano, y lo demás queda en el «archivo» (la RAM).

```
 registros  <1 KB · sin retraso          ▲ más rápido, más caro, más chico
 caché L1   16 KB · dentro de la CPU     │
 caché L2   varios MB · 1–2 ciclos más   │
 RAM        "el caballo de batalla"      │
 disco                                   ▼ más lento, más barato, más grande
```

**Cómo funciona:**
- La RAM se divide en **líneas de caché de 64 bytes**: la línea 0 va de la dirección 0 a la 63, la línea 1 de la 64 a la 127, y así.
- **Acierto de caché:** la línea está en la caché y se resuelve en unos **2 ciclos**, sin usar el bus.
- **Fallo de caché:** hay que ir a la RAM, con un **castigo de tiempo considerable**.
- La caché la controla **el hardware, de manera parcial**.

**Las 4 preguntas de cualquier caché**, que el libro lista y conviene saber de memoria:
1. **Cuándo** se pone un elemento nuevo. En la caché de CPU, en cada fallo.
2. **En qué línea** se pone.
3. **Qué elemento se saca** cuando falta lugar.
4. **Dónde se escribe** el desalojado en la memoria más grande.

**Ejemplo del libro (en qué línea):** con **4096 líneas de 64 B** y direcciones de 32 bits:
```
 31 ............ 18 │ 17 .......... 6 │ 5 ..... 0
       (resto)      │ LÍNEA (12 bits) │ BYTE (6 bits)
                      2^12 = 4096        2^6 = 64
```
Ejemplo propio: la dirección **0x12345678**.
- Byte = 6 bits bajos: 0x78 = `0111 1000`, los últimos 6 son `111000` = **56**.
- Línea = bits 6 a 17: (0x12345678 ÷ 64) mod 4096 = 0x48D159 mod 0x1000 = **0x159 = 345**.

**L1, L2 y multinúcleo:**
- La **L1** está siempre dentro de la CPU. Suele haber dos: una para **instrucciones** y otra para **datos**.
- La **L2** puede ser **compartida** entre núcleos (Intel), lo que necesita un controlador más complejo, o **una por núcleo** (AMD), lo que hace más difícil mantener las cachés **consistentes**.

🧠 **La caché es una idea general, no solo de hardware.** El SO cachea:
- bloques de **archivos** en RAM;
- la **traducción de rutas** a direcciones de disco;
- la traducción **URL → IP**.

🧠 **Conexiones:**
- El **TLB** (tema 5) es una **caché de traducciones**.
- El **conjunto de trabajo** y la **localidad de referencia** son la misma idea que hace que la caché acierte.
- El **algoritmo óptimo** (tema 6) aparece en la U3 justamente porque «este problema aparece también en memorias caché», según el apunte de la cátedra.

---

## 11B. Linux: llamadas al sistema de memoria y comandos (Tanenbaum 10.4.2, págs. 761–762, y apunte de comandos)

**`malloc`** es un **procedimiento de biblioteca de ANSI C**, no una llamada al sistema. **POSIX no especifica llamadas para administrar memoria**, porque se consideró algo demasiado dependiente de la máquina; el libro le dice a eso «**pasar la cubeta**». `malloc` usa por debajo estas llamadas reales (fig. 10-14):

| Llamada | Qué hace |
|---|---|
| `s = brk(direc)` | Cambia el tamaño del **segmento de datos**: le das la dirección del primer byte después del final. Si es mayor, el segmento crece; si es menor, se achica. |
| `a = mmap(direc, lon, prot, banderas, fd, despl)` | **Mapea un archivo** en memoria. `direc` y `lon` tienen que ser **múltiplos del tamaño de página**; si `direc` = 0, la elige el SO. `prot` es L/E/X; `banderas` dice si es privado o compartido; `fd` es el archivo (**tiene que estar abierto**); `despl` es desde dónde del archivo, en un límite de página. |
| `s = munmap(direc, lon)` | Desmapea. Si se desmapea solo una parte, el resto sigue mapeado. |

⚠️ **Lo que no está en el material:** el programa pide `free`, `calloc` y `realloc`, pero **el libro y los apuntes solo nombran `malloc`**. Lo que sigue es lo estándar de C, **no sale de las fuentes**, así que preguntale a la cátedra si lo toman:
- `free(p)` devuelve un bloque pedido con malloc;
- `calloc(n, tam)` pide n × tam bytes **inicializados en cero**;
- `realloc(p, tam)` cambia el tamaño de un bloque y puede moverlo.

**Cómo administra Linux la memoria por dentro** (10.4.3, como contexto):
- En 32 bits, cada proceso tiene **3 GB de usuario** y **1 GB para el kernel**, que solo es visible en modo kernel.
- Los marcos se asignan con el **algoritmo de colegas** (el *sistema compañero*, fig. 10-17). Sobre él trabaja el **asignador de losas** para objetos chicos como `task_struct`, y **vmalloc** se usa para memoria contigua solo en lo virtual.

**Comandos de la cátedra**, que se toman como lectura de salida:

| Comando | Para qué | Qué mirar |
|---|---|---|
| `free -h` | Resumen de RAM y swap | ⚠️ **`available`**, no `free`. Linux usa la RAM libre como `buff/cache`, así que `free` siempre parece bajo. |
| `smem -r -k` | Memoria por proceso | **USS** = exclusiva (lo que se liberaría al cerrarlo); **PSS** = privada + parte proporcional de la compartida (**la mejor para comparar**); **RSS** = cuenta la compartida entera, así que **exagera**. |
| `vmstat 1` | Estado general cada 1 s | `r` alto = esperan CPU; `b` o `wa` altos = esperan E/S; **`si`/`so` altos = uso intenso de swap**; `cs` = cambios de contexto por segundo. |
| `cat /proc/meminfo` | Detalle completo, que `free` resume | `MemAvailable`, `Dirty` (sucias por escribir), `Active`/`Inactive`, **`PageTables`**. |

🧠 **Conexiones:**
- **RSS vs. PSS** es la **compartición de páginas** del tema 8B: las DLL y el texto compartido se cuentan una vez por cada proceso en RSS.
- **`Dirty`** es el **bit M**.
- **`si`/`so` altos y sostenidos** son la pista de algo que ya viste en la unidad… (ver la pregunta 2 😉).

📖 *Tanenbaum 1.3.2, págs. 23–25; 10.4.2–10.4.3, págs. 761–767; apunte `comandos_linux_memoria.pdf`.*

---

### Preguntas

**1. Caché.** Con 4096 líneas de 64 bytes y direcciones de 32 bits, ¿en qué **línea** de caché y en qué **byte** de la línea cae la dirección **0x0000A1C5**?

**2. Escenario Linux.** Un compañero corre `free -h` y ve `free = 300Mi` y `available = 9Gi`, y dice: *«me quedé sin RAM»*.
- a) ¿Tiene razón? ¿Qué columna tiene que mirar y por qué `free` da tan bajo?
- b) Otro día, `vmstat 1` muestra durante minutos **`si` y `so` altos**, **`wa` alto** e **`id` bajo**, y todo anda lentísimo. ¿Qué fenómeno de la U3 es, y qué lo causa?

<<<<<< MENSAJE 60 >>>>>>

# Corrección de 11A y 11B

## 1. Caché: correcto ✅

**Línea 647 (0x287) y byte 5.** Lo hiciste bien en binario: los últimos 6 bits dan el byte, y los 12 siguientes la línea.

## 2. Escenario Linux: casi todo correcto (≈ 95 %)

**a) ✅** Está perfecto: hay que mirar **`available`**, y `free` da bajo porque Linux usa la RAM libre como `buff/cache` y la devuelve cuando un programa la pide.

**b) ✅ Sobrepaginación (thrashing)**, con la causa correcta: la suma de los **conjuntos de trabajo** supera la RAM. Una sola corrección:

⚠️ **«dejando la CPU ociosa (id bajo)» se contradice.** `id` es el **porcentaje de tiempo que la CPU está ociosa**, así que **`id` bajo significa que la CPU *no* figura como ociosa**. En la sobrepaginación pasa esto:
- casi todo el tiempo se va a **`wa`**, esperando el disco;
- y otra parte a **`sy`**, el kernel atendiendo fallos de página;
- y casi nada queda en **`us`**, que es el trabajo útil.

La frase correcta es: *«la CPU casi no hace trabajo útil (`us` bajo): su tiempo se va en esperar E/S (`wa`) y en el kernel (`sy`)»*. Lo de «CPU ociosa» viene del gráfico clásico de la sobrepaginación (tema 8A), donde el **uso útil** de la CPU se desploma. En `vmstat` eso **no** aparece como `id`.

🧠 **Para sumar en el final**, porque en el tema 8A te faltó: la solución es el **control de carga**. Se hace **swapping de un proceso entero** al disco para bajar el grado de multiprogramación, o se usa **PFF** para repartir marcos. Comprar más RAM también funciona, pero no es la respuesta de SO.

---

Queda **11C: el administrador de memoria de Windows**, y con eso termina la teoría de la U3. Ya te abrí su simulador, **[listas_paginas_windows.html](unidades/u03-memoria/visuales/listas_paginas_windows.html)**, que sigue la vida de un marco por las listas de la fig. 11-36. Está verificado y ya figura en el índice y en 🎛.

Escribí **«seguí»** y te paso la clase.

<<<<<< MENSAJE 61 >>>>>>

# Tema 11C: El administrador de memoria de Windows (Tanenbaum 11.5, págs. 879–894)

Es el componente **más grande** del ejecutivo de Windows. Te lo cuento en orden y con las conexiones a lo que ya viste, que es lo que más rinde en el examen.

```
 11C ── espacio de direcciones (2 GB + 2 GB)
     ├─ estados de una página virtual: inválida / reservada / confirmada
     ├─ archivo de paginación "justo a tiempo"
     ├─ API Win32 (VirtualAlloc…) y VADs
     ├─ fallos de página: 5 categorías · suave vs. duro ★
     ├─ reemplazo: conjunto de trabajo con mín./máx., 3 niveles
     └─ memoria física: las 5 listas y la base PFN ★ (simulador)
```

---

## 1. El espacio de direcciones (fig. 11-30)

En x86 cada proceso tiene **4 GB virtuales**: **2 GB de usuario** y **2 GB de kernel**. En servidores se puede configurar 3 GB y 1 GB. La página es de **4 KB**, y también hay **páginas grandes de 4 MB** que mejoran el TLB.

```
 4 GB ┌──────────────────────────┐ ← últimos 64 KB inválidos
      │ SO + HAL, datos sistema   │  ┐ COMPARTIDO por todos los procesos
      │ reservas (con/sin pagin.) │  │ (salvo tablas de páginas y listas
      │ tablas de páginas de A    │  ┘  del conj. de trabajo: por proceso)
 2 GB ├──────────────────────────┤
      │ código y datos PRIVADOS   │
      │ del proceso A             │
   0  └──────────────────────────┘ ← primeros 64 KB inválidos
```

- **¿Por qué los 64 KB de abajo y de arriba son inválidos?** Para atrapar errores: un puntero 0 o 1 da **trap inmediato** en vez de leer basura.
- **¿Por qué el kernel está en el espacio de cada proceso?** Para que una **llamada al sistema no cambie el mapa de memoria**: el kernel lee los parámetros y los búferes del usuario directamente. La desventaja es que queda **menos espacio privado** por proceso; a cambio, las llamadas son **más rápidas**.

🧠 **Conexión con el 10B:** según el libro, Windows **no admite la segmentación de ninguna forma** en x86. Es el «Base 0, Límite máximo» del Pentium, es decir, paginación pura.

---

## 2. Los tres estados de una página virtual (págs. 881–882)

| Estado | Qué es | Qué pasa si se referencia |
|---|---|---|
| **Inválida** | No está asignada a nada | Fallo de página → **violación de acceso** |
| **Reservada** | Inválida, pero esas direcciones **no se usan para otra cosa** | Fallo de página (ej.: crecimiento de la pila) |
| **Confirmada** | Tiene código o datos asignados | Fallo de página → se trae la página |

**El ejemplo del libro es la pila.** Al crear el proceso se **reservan muchas páginas** de pila pero se **confirma una sola**. A medida que la pila crece, el administrador confirma más. Las reservadas funcionan como **páginas de guardia**, para que la pila no pise otros datos.

---

## 3. Archivo de paginación: «justo a tiempo» (págs. 881–882)

- Una página confirmada **no recibe lugar en el archivo de paginación hasta que hay que sacarla** de memoria. Si la memoria virtual total entra en la RAM, **no hace falta archivo de paginación**.
- **Ventaja:** las páginas modificadas se **agrupan y se escriben en trozos grandes**, en lugares contiguos del archivo, con menos búsquedas en el disco.
- Una página leída del archivo **conserva su lugar allí hasta que se modifica**. Para detectar la primera escritura, se carga como **solo lectura**: al escribir, el SO libera el lugar en el archivo, da permiso de escritura y el hilo reintenta. Es el mismo truco del trap que la **copia en escritura** (tema 8B).
- Hay hasta **16 archivos de paginación**, conviene repartirlos en varios discos, y es mejor crearlos con el tamaño máximo desde el principio, porque si crecen después quedan fragmentados.
- **El código** (EXE, DLL) y los datos de solo lectura **no van al archivo de paginación**: si hacen falta otra vez, **se releen del archivo del programa**.

---

## 4. API Win32 y VADs (fig. 11-31, págs. 884–886)

| Función | Qué hace |
|---|---|
| `VirtualAlloc` / `VirtualFree` | Reserva o confirma / libera o desconfirma una región |
| `VirtualProtect` / `VirtualQuery` | Cambia la protección L/E/X / consulta el estado |
| `VirtualLock` / `VirtualUnlock` | **Fija** la región en memoria (sin paginación) / la vuelve paginable |
| `CreateFileMapping`, `MapViewOfFile`, `UnmapViewOfFile`, `OpenFileMapping` | **Archivos mapeados** y memoria compartida entre procesos |

- Las regiones empiezan siempre en **límites de 64 KB**, por portabilidad a arquitecturas con páginas más grandes.
- 🧠 **`VirtualLock` es el *pinning* del tema 9**: lo usa un programa de tiempo real para no tener fallos en momentos críticos. Hay un límite para que nadie acapare memoria.
- 🧠 **`CreateFileMapping` y `MapViewOfFile` son el `mmap` de Linux.**
- Por cada región asignada, el administrador crea un **VAD** (*Virtual Address Descriptor*) con el rango, el archivo de respaldo, el desplazamiento y los permisos. Los VAD forman un **árbol balanceado**, así que los huecos entre regiones **no gastan nada**.

---

## 5. Fallos de página: 5 categorías ★ (págs. 887–889)

El fallo produce un **trap al kernel**. El administrador de memoria valida el acceso, busca en los **VAD** y arma o completa la entrada de la tabla de páginas.

| # | Categoría | Qué hace Windows |
|---|---|---|
| 1 | La página **no está confirmada** | **Violación de acceso** → en general, el proceso termina (error de programación) |
| 2 | **Violó los permisos** | **Violación de acceso** (ej.: escribir en una página de solo lectura) |
| 3 | Escritura en una página **de copia en escritura** | Mismo síntoma que la 2, **pero no es un error**: hace una **copia privada** y el hilo reintenta |
| 4 | **La pila necesita crecer** | Da una **página en ceros** dentro de la reserva de la pila |
| 5 | Confirmada pero **no asignada a un marco** | El fallo normal; la busca en memoria o en disco |

⚠️ **Las 2 y la 3 se confunden.** Son el mismo síntoma (escribir en solo lectura), pero la 3 se resuelve copiando y la 2 termina el proceso.

**Fallo suave vs. fallo duro** ★ se toma seguro:
- **Suave:** la página **se encuentra en memoria**. Puede estar compartida con otro proceso, en la lista **en espera o de modificadas** (se la había sacado del conjunto de trabajo y se pide de vuelta), o puede que solo haga falta una **página en ceros**. **Tiene poco costo.**
- **Duro:** hay que **leerla del disco**.

**SuperFetch:** Windows recuerda el patrón de referencias de un programa y **prepagina** al iniciarlo. Las páginas se ponen en la **lista en espera**, no en la tabla de páginas, así que los fallos que iban a ser duros se vuelven suaves.

**La PTE de x86 (fig. 11-33)** tiene 32 bits:
- **20 para el número de página física**;
- los bits **P** (presente), **R/W**, **U/S** (usuario o supervisor), **A** (accedida = R), **D** (sucia = M), **G**, **PCD** y **PWT** (caché);
- y **AVL**, libres para el SO.

🧠 **A y D los pone el hardware.** Son los **bits R y M** de los temas 6 y 7, y con ellos Windows aproxima el **LRU**.

---

## 6. Reemplazo: conjunto de trabajo con mínimo y máximo (págs. 890–891)

- **Cada proceso**, no cada hilo, tiene un conjunto de trabajo con un **mínimo** (al principio, 20–50 páginas) y un **máximo** (al principio, 45–345). **No son límites duros.**
- **Solo actúa cuando escasea la memoria.** Si sobra, los procesos pueden pasarse del máximo.
- El **administrador del conjunto de trabajo** corre **cada 1 segundo** y tiene **3 niveles**:

```
 1. MUCHA memoria      → explora, limpia los bits A y estima la EDAD de cada página
 2. EMPIEZA A ESCASEAR → los procesos con muchas páginas sin usar dejan de crecer
                          y reemplazan sus páginas MÁS VIEJAS
 3. ESCASA             → RECORTA los conjuntos por debajo del máximo (saca las más viejas)
```

🧠 **Conexiones:** es **política local con tamaño variable** (tema 8A), **envejecimiento** (tema 7B) y **conjunto de trabajo** (tema 7B), todo junto. El libro cierra con esto: *«la administración de memoria en sistemas reales es mucho más que un simple algoritmo de paginación»*.

---

## 7. Memoria física: las 5 listas y la base PFN ★ (figs. 11-35 y 11-36, págs. 891–894)

Todo marco está en algún **conjunto de trabajo** o en una de estas **5 listas**. Juntas forman la **base de datos PFN**, indexada por número de marco:
- **modificadas** (sucias);
- **en espera** (limpias, todavía con su contenido);
- **libres**;
- **en ceros**;
- **defectuosas** (con errores de hardware).

```
                    (1) desalojo del CT
  ┌───────────────┐ ───────────────► ┌─────────────┐  (4) escritor de    ┌───────────┐
  │   CONJUNTOS   │   (sucia)        │ MODIFICADAS │ ─── páginas mod. ─► │ EN ESPERA │
  │   DE TRABAJO  │ ◄─── (2) fallo SUAVE (sin E/S) ── desde las dos ──── │ (limpias) │
  └───────────────┘ ───────────────────────────────────────────────────► └───────────┘
     ▲      ▲   │ (5) desasignación / (3) termina el proceso                   │ (3)
     │      │   ▼                                                              ▼
     │      │  ┌─────────┐  (7) hilo ZeroPage   ┌──────────┐      ┌──────────────┐
     │      └──│ LIBRES  │ ───────────────────► │ EN CEROS │      │ DEFECTUOSAS  │
     │ (6)     └─────────┘                      └──────────┘      └──────────────┘
     │ página referenciada                           │
     │ (fallo DURO, lee del disco)                   │
     └────────────── (8) se necesita página cero ────┘
```

- **(1)** Al sacar una página del conjunto de trabajo, **no se escribe al disco**: va a **modificadas** o a **en espera**, según el bit D.
- **(4)** El **escritor de páginas modificadas** (y el **de páginas asignadas**, para archivos mapeados) las escribe en segundo plano y las pasa a en espera. 🧠 Es el **demonio de paginación** y la **política de limpieza** del tema 8A.
- **(3)** Cuando termina un proceso, sus páginas van a libres **sin escribirse**, aunque estén sucias.
- **(7)** El hilo **ZeroPage** tiene la **prioridad más baja** y pone en ceros páginas libres cuando la CPU está ociosa. Se hace **por seguridad**: una página nueva no puede tener datos de otro proceso.
- **(6) vs. (8):** para **leer del disco** se usa una página **libre**, porque igual se va a sobrescribir entera. Para la **pila** o una **página nueva** se usa una **en ceros**.

En **[listas_paginas_windows.html](unidades/u03-memoria/visuales/listas_paginas_windows.html)** seguís un marco por todo el ciclo. Tiene un recorrido guiado de 9 pasos o modo libre, en el que solo se habilitan las transiciones válidas, y cuenta fallos suaves, duros y escrituras.

📖 *Tanenbaum 11.5.1–11.5.3, págs. 879–894.* El apunte de la cátedra no desarrolla Windows; todo esto sale del libro.

---

### Preguntas

**1. Clasificá cada fallo.** Para cada caso, decí en qué categoría de las 5 cae, si es **suave**, **duro** o **violación de acceso**, y qué hace Windows.
- a) Un hilo hace `push` y toca una página **reservada** de su pila.
- b) Un proceso escribe en una página de datos de una **DLL** cargada como **copia en escritura**.
- c) Un proceso desreferencia un puntero **NULL**.
- d) Un proceso vuelve a usar una página que el administrador del conjunto de trabajo le sacó hace un segundo. Estaba **limpia**.

**2. V o F, justificá:**
- a) *«Cuando el administrador del conjunto de trabajo saca una página sucia del conjunto de un proceso, Windows la escribe inmediatamente en el archivo de paginación.»*
- b) *«En Windows, cada página confirmada recibe su lugar en el archivo de paginación en el momento en que se confirma.»*

<<<<<< MENSAJE 62 >>>>>>

# Corrección del tema 11C: 6/6 ✅

Todo está bien. Es tu mejor tanda de la unidad.

| | Categoría | Tipo | Comentario |
|---|---|---|---|
| 1a) push en pila reservada | 4 ✅ | suave ✅ | ✅ |
| 1b) DLL con copia en escritura | 3 ✅ | suave ✅ | ✅, con un matiz abajo |
| 1c) puntero NULL | 1 ✅ | violación de acceso ✅ | ✅ Bien usado lo de los 64 KB inferiores |
| 1d) página limpia recién recortada | 5 ✅ | suave ✅ | ✅ Lista en espera, sin disco |
| 2a) | **F** ✅ | | Perfecto: lista de modificadas, escritor en segundo plano y posible fallo suave |
| 2b) | **F** ✅ | | Perfecto: justo a tiempo, con las dos ventajas |

**El matiz de 1b:** para la copia no hace falta una página **en ceros**. Se va a **sobrescribir entera** con el contenido original, así que alcanza con una **libre**. Es la misma lógica que la transición (6) del libro: *«no importa que contenga información confidencial, ya que está a punto de ser sobrescrita por completo»*. Las páginas en ceros se guardan para cuando el contenido **no** se sobrescribe, como la pila o una página nueva.

---

# 🎓 Cierre de la Unidad 3: Administración de memoria

## Los 8 puntos más importantes

1. **Abstraer la memoria.** Sin abstracción, dos programas chocan. Con **registros base y límite**, cada proceso tiene su espacio. El **intercambio** deja **huecos**, que se administran con **mapa de bits** o **listas**, y se asignan con primer, siguiente, mejor o peor ajuste.
2. **Paginación.** La dirección virtual es **página | desplazamiento**. La **MMU** busca el **marco** en la tabla de páginas (P, R, M, protección, marco) y **pega** marco y desplazamiento. Si la página no está, hay **fallo de página**.
3. **Hacerla rápida y chica.** El **TLB** es una caché de traducciones, y existen fallos suaves y duros del TLB. Para que las tablas no sean enormes, se usan **tablas multinivel** o **invertidas**.
4. **Reemplazo.** El **óptimo** es la cota, imposible de implementar. Después vienen **NRU** (4 clases R/M), **FIFO** (anomalía de Belady), **segunda oportunidad** y **reloj**, **LRU** (matriz o envejecimiento) y **conjunto de trabajo** y **WSClock**.
5. **Diseño.** Asignación **local o global**; **PFF**; **hiperpaginación**, que se resuelve con **control de carga** (swapping); tamaño de página óptimo **p = √(2se)**; **compartición** y **copia en escritura**; **limpieza** con el demonio de paginación.
6. **El fallo de página en 10 pasos.** Quién hace cada uno, el **respaldo de instrucción** y el **pinning** de páginas en E/S.
7. **Segmentación.** Muchos espacios lógicos, la tabla de la **fig. 3-33** y la **fragmentación externa** que se arregla con compactación. Después, **segmentación paginada**: **MULTICS** (18 | 6 | 10, fallo de segmento) y **Pentium** (selector, LDT/GDT, lineal, dos niveles, anillos).
8. **Casos reales.** **Caché** (líneas de 64 B, L1/L2); **Linux** (`brk`/`mmap`, `free -h` → available, PSS, `si`/`so`); **Windows** (inválida/reservada/confirmada, fallo **suave vs. duro**, las 5 listas).

## Lo que más se toma en los exámenes de la cátedra

Según los parciales, prácticos y exámenes del material:
- ★★★ **Traducción de dirección virtual a física** en binario o hexa, con páginas de 1 KB y 4 KB.
- ★★★ **Segunda oportunidad con la tabla de páginas** (bits R, M, P y marco). Hay que decir la **víctima**, **justificar** y dejar el **estado final de la cola**.
- ★★ **Contar fallos de página** con N marcos en **FIFO, LRU y óptimo**.
- ★★ Teoría: los **10 pasos del fallo**, la **hiperpaginación** y su solución, y **paginación vs. segmentación**.

## ⚠️ Tus errores de esta unidad, para no repetirlos

- **Tema 7A:** la dirección física te dio **0x3CEE** y era **0x333A**. Nunca vimos dónde estuvo el error: **conviene repetir un ejercicio de traducción** antes del cuestionario. Tampoco sabías qué era la **«cola final»** de la segunda oportunidad, y eso cae ★★★.
- **WSClock:** una página vieja y **sucia** **no se copia en ese momento**: **se planifica la escritura** y la manecilla avanza.
- **Hiperpaginación:** te faltó nombrarla y dar la solución, que es el **control de carga** (swapping de un proceso entero) o **PFF**.
- **DLL:** la reubicación falla porque hay **una sola copia compartida**. La solución se llama **código independiente de la posición**.
- **Vocabulario:** los **marcos son de la RAM**, no del disco; la ubicación en disco **no está en el descriptor**; y **`id` bajo** no significa «CPU ociosa».

---

## Lo que sigue (Fase 4)

1. **`repaso_u03.pdf`**: todo lo de la clase en orden, con esquemas, ejemplos y referencias.
2. **Mapa conceptual acumulativo**: se agrega la U3 y se reconecta con la U1 y la U2.
3. **Cuestionario U3** de nivel final, con las respuestas guardadas aparte.

Escribí **«cuestionario unidad 3»** y arranco con los tres en ese orden. Si antes querés practicar la traducción de direcciones y la segunda oportunidad, que son ★★★ y donde tuviste tropiezos, decime **«otro ejemplo»** y te armo un ejercicio integrador.

<<<<<< MENSAJE 63 >>>>>>

Estoy juntando los mensajes de la clase de la U3 desde el historial del chat, para armar el PDF de repaso igual que hicimos con la U2.