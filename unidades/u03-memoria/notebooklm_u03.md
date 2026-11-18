# Sistemas Operativos — Unidad 3: Administración de memoria

Documento fuente para NotebookLM. Sigue el orden del programa de la materia (UTN FRM, Ingeniería en Sistemas de Información, 2026). Está basado en el libro de Andrew Tanenbaum, *Sistemas Operativos Modernos*, 3.ª edición en español, capítulo 3, secciones 1.3.2 y 2.1.7, y los casos de estudio 10.4 (Linux) y 11.5 (Windows Vista). También usa el resumen de la cátedra, la cartilla de comandos Linux de la cátedra y los prácticos resueltos. Todos los ejemplos numéricos fueron verificados con un programa.

Mapa de la unidad, en una frase por tema:

1. La memoria es una jerarquía, y el administrador de memoria es la parte del sistema operativo que la reparte.
2. Sin abstracción, los programas ven la memoria física y no pueden convivir; con registros base y límite, cada proceso tiene su propio espacio de direcciones.
3. Cuando no entran todos, se intercambian procesos completos con el disco, y hay que llevar la cuenta de los huecos libres.
4. La memoria virtual divide el programa en páginas y deja en RAM solo las que se usan; la MMU traduce cada dirección, el TLB acelera la traducción y los algoritmos de reemplazo eligen qué página sacar.
5. La segmentación da varios espacios de direcciones lógicos, uno por cada estructura del programa.
6. MULTICS y el Intel Pentium combinan segmentación con paginación.
7. Casos de estudio: las llamadas de memoria de Linux, la caché y el administrador de memoria de Windows.

---

## 1. Almacenamiento real y jerarquía de memoria (programa 3.1)

### 1.1 El problema de fondo

La memoria principal (RAM) es un recurso importante que hay que administrar con cuidado. Una computadora doméstica tiene diez mil veces más memoria que la IBM 7094, la computadora más grande del mundo a principios de los años sesenta, pero los programas crecen todavía más rápido que las memorias. El libro parafrasea la ley de Parkinson: "los programas se expanden para llenar la memoria disponible para contenerlos".

Lo que todo programador quisiera es una memoria privada, infinitamente grande, infinitamente rápida, no volátil (que no pierda su contenido al cortarse la energía) y barata. Esa memoria no existe. La solución que se adoptó es la jerarquía de memoria.

### 1.2 La jerarquía de memoria

La memoria se construye como una jerarquía de capas. Las capas de arriba son más rápidas, más chicas y más caras por bit; las de abajo, más lentas, más grandes y más baratas, a menudo por factores de mil millones.

Descripción de la figura 1-9 del libro (una pirámide de cinco niveles, de arriba hacia abajo, con tiempo de acceso y capacidad típicos):

| Nivel | Tiempo de acceso típico | Capacidad típica |
|---|---|---|
| Registros | 1 nanosegundo | menos de 1 KB |
| Caché | 2 nanosegundos | 4 MB |
| Memoria principal (RAM) | 10 nanosegundos | 512 a 2048 MB |
| Disco magnético | 10 milisegundos | 200 a 1000 GB |
| Cinta magnética | 100 segundos | 400 a 800 GB |

Los números son aproximados y de la época del libro, pero la relación entre niveles se mantiene.

- **Registros:** están dentro de la CPU, hechos del mismo material, así que no tienen retraso. Son 32 registros de 32 bits en una CPU de 32 bits, o 64 de 64 bits en una de 64: menos de 1 KB en total. Los administra el software (el compilador decide qué guardar en ellos).
- **Caché:** la controla en parte el hardware. La memoria principal se divide en **líneas de caché**, por lo general de 64 bytes: las direcciones 0 a 63 forman la línea 0, de 64 a 127 la línea 1, y así. Las líneas más usadas se guardan en la caché, dentro o muy cerca de la CPU. Si la línea pedida está en la caché, hay un **acierto de caché** y no hace falta ir por el bus a la memoria (unos dos ciclos de reloj). Si no está, hay un **fallo de caché**, con una penalidad de tiempo considerable. Hay máquinas con dos o tres niveles de caché, cada uno más grande y más lento que el anterior. La **caché L1** está dentro de la CPU (suele haber una para instrucciones y otra para datos, de unos 16 KB cada una) y no tiene retraso; la **caché L2** tiene varios megabytes y un retraso de uno o dos ciclos. En los chips multinúcleo, Intel usa una L2 compartida por todos los núcleos (controlador más complicado) y AMD una L2 por núcleo (más difícil mantenerlas consistentes).
- **Memoria principal (RAM, memoria de acceso aleatorio):** es el caballo de batalla. Todo lo que no se resuelve en la caché va a la RAM. Los usuarios antiguos la llamaban memoria de núcleo, por los núcleos de ferrita de los años cincuenta y sesenta.
- **Memorias no volátiles chicas:** la **ROM** (memoria de solo lectura) se programa en fábrica y no se puede cambiar; es rápida y barata, y en algunas computadoras contiene el cargador de arranque. La **EEPROM** y la **memoria flash** también son no volátiles pero se pueden borrar y reescribir (más lento que la RAM); la flash es el "disco" de cámaras y reproductores, y se desgasta si se borra muchas veces. La **CMOS** es volátil, pero está alimentada por una pila: guarda la fecha, la hora y parámetros de configuración, como el disco desde el que se arranca.
- **Disco:** dos órdenes de magnitud más barato por bit que la RAM y dos más grande, pero unas mil veces más lento en acceso aleatorio, porque es mecánico.

Regla para recordar: cuanto más arriba, más rápido, más caro por bit y menos capacidad. La caché funciona porque los programas tienen **localidad**: tienden a volver a usar lo que usaron hace poco y lo que está cerca.

Volátil quiere decir que pierde el contenido al apagarse (registros, caché, RAM, CMOS sin pila). No volátil quiere decir que lo conserva (ROM, flash, disco, cinta).

### 1.3 La caché como idea general

El libro destaca que la caché es una idea que aparece en toda la informática, no solo entre la CPU y la RAM: siempre que hay un recurso grande dividido en piezas, de las cuales unas se usan mucho más que otras, conviene guardar las más usadas en un lugar rápido. Ejemplos: el sistema operativo guarda en RAM partes de los archivos usados con frecuencia; guarda la conversión de rutas largas (como /home/ast/proyectos/minix3/src/kernel/reloj.c) a direcciones de disco; y guarda la conversión de nombres de páginas web a direcciones IP.

En todo sistema de caché surgen cuatro preguntas:

1. Cuándo poner un elemento nuevo en la caché.
2. En qué línea de caché ponerlo.
3. Qué elemento sacar cuando hace falta lugar.
4. Dónde poner, en la memoria más grande, el elemento que se saca.

Para la caché de la CPU, por lo general se trae un elemento nuevo en cada fallo, y la línea se calcula con algunos bits de la dirección. Ejemplo del libro: con 4096 líneas de 64 bytes y direcciones de 32 bits, los bits 6 a 17 indican la línea y los bits 0 a 5 el byte dentro de la línea.

Ejemplo resuelto: tiempo medio de acceso con caché (tema que se vio en la Unidad 1 y que vuelve acá). Supongamos caché de 1 nanosegundo, RAM de 10 nanosegundos y 95 % de aciertos.

1. El 95 % de las veces el dato está en la caché: cuesta 1 ns.
2. El 5 % de las veces hay fallo: se mira la caché (1 ns) y después se va a la RAM (10 ns), en total 11 ns.
3. Promedio ponderado: 0,95 × 1 + 0,05 × 11 = 0,95 + 0,55 = 1,50 ns.
4. Sin caché serían 10 ns, así que la caché hace el acceso 6,67 veces más rápido.
5. Con mala localidad, por ejemplo 50 % de aciertos: 0,5 × 1 + 0,5 × 11 = 6,00 ns, solo 1,67 veces más rápido.

Conclusión: la caché vale lo que vale la localidad del programa.

### 1.4 El administrador de memoria

El trabajo del sistema operativo es abstraer la jerarquía en un modelo útil y después administrarla. La parte del sistema operativo que administra (parte de) la jerarquía se llama **administrador de memoria**. Su trabajo es llevar el registro de qué partes de la memoria están en uso, asignar memoria a los procesos cuando la necesitan y liberarla cuando terminan.

Como el hardware administra el nivel más bajo de caché, el capítulo se concentra en la memoria principal. El disco es tema de la unidad siguiente.

Según la cátedra, el sistema operativo crea abstracciones de memoria y las administra para tres cosas: asignar memoria a los procesos, evitar interferencias entre ellos y usarla de forma eficiente.

(Tanenbaum, cap. 1.3.2, págs. 23–26, y cap. 3, págs. 175–176) (Apunte: resumen de la cátedra, Unidad 3, introducción)

---

## 2. Sin abstracción de memoria (programa 3.1)

### 2.1 El modelo

La abstracción más simple es ninguna. Las primeras mainframes (antes de 1960), minicomputadoras (antes de 1970) y computadoras personales (antes de 1980) no tenían abstracción de memoria: cada programa veía directamente la memoria física. Si un programa ejecutaba la instrucción MOV REGISTRO1, 1000, la computadora movía el contenido de la posición física 1000 al registro. El programador veía un conjunto de direcciones desde 0 hasta un máximo, cada una con una celda de, por lo general, 8 bits.

Consecuencia principal: no se podían tener dos programas en memoria a la vez. Si el primero escribía un valor en la posición 2000, borraba lo que el segundo tuviera ahí, y los dos fallaban.

Descripción de la figura 3-1 (tres formas de organizar la memoria con un sistema operativo y un solo proceso de usuario, dibujadas como columnas con la dirección 0 abajo):

- (a) El sistema operativo en RAM, en la parte baja; el programa de usuario arriba. Se usaba en mainframes y minicomputadoras; hoy casi no.
- (b) El sistema operativo en ROM, en la parte alta; el programa abajo. Se usa en algunas computadoras de bolsillo y sistemas integrados.
- (c) Los drivers de dispositivos en ROM arriba, el resto del sistema en RAM abajo y el programa en el medio. Lo usaban las primeras PC con MS-DOS; la parte en ROM es el **BIOS** (sistema básico de entrada y salida).

En (a) y (c), un error del programa de usuario puede borrar el sistema operativo. Con esta organización se ejecuta un proceso a la vez: el usuario escribe un comando, el sistema copia el programa del disco a la memoria y lo ejecuta; cuando termina, carga otro encima.

Una forma limitada de paralelismo sin abstracción es programar con varios hilos, porque los hilos de un proceso comparten la memoria de todos modos. Pero no sirve para correr programas independientes, y un sistema tan primitivo difícilmente ofrezca hilos.

### 2.2 Varios programas sin abstracción

Hay dos formas históricas:

1. **Intercambio:** guardar todo el contenido de la memoria en un archivo de disco y traer el programa siguiente. Mientras haya un solo programa en memoria a la vez, no hay conflictos.
2. **Protección por hardware (IBM 360):** la memoria se dividía en bloques de 2 KB, y cada bloque tenía una **llave de protección** de 4 bits guardada en registros especiales de la CPU. Una máquina de 1 MB necesitaba 512 de esos registros (256 bytes en total). El PSW también tenía una llave de 4 bits. El hardware generaba un trap si un proceso intentaba acceder a memoria con una llave distinta de la de su PSW. Como solo el sistema operativo podía cambiar las llaves, los procesos no podían dañarse entre sí ni dañar al sistema.

### 2.3 El problema de la reubicación

La protección por llaves resolvía que los procesos se pisaran, pero quedaba otro problema. Descripción de la figura 3-2: hay dos programas de 16 KB cada uno. El primero empieza con JMP 24, que salta a una instrucción MOV en la dirección 24. El segundo empieza con JMP 28, que salta a una instrucción CMP en la dirección 28. Si se cargan uno detrás del otro, el primero desde la dirección 0 y el segundo desde la 16.384, el primero funciona. Pero cuando arranca el segundo, su JMP 28 salta a la dirección física 28, que está dentro del primer programa (una instrucción ADD), y no a su propia instrucción CMP, que quedó en la 16.412. El programa falla en menos de un segundo.

El problema es que los dos programas hacen referencia a direcciones físicas absolutas. Lo que se quiere es que cada programa use un conjunto de direcciones privado.

**Reubicación estática:** la solución de emergencia de la IBM 360 era modificar el programa mientras se cargaba: si se cargaba en la dirección 16.384, se sumaba 16.384 a todas las direcciones del programa. Funciona, pero no es general, hace más lenta la carga y requiere información extra en el ejecutable para saber qué palabras son direcciones (y hay que reubicar) y cuáles son constantes (y no). Por ejemplo, el 28 de JMP 28 hay que reubicarlo, pero el 28 de MOV REGISTRO1, 28, que carga el número 28, no.

Hoy, la falta de abstracción sigue siendo común en sistemas integrados y tarjetas inteligentes: radios, lavarropas y microondas tienen software en ROM que direcciona memoria absoluta. Funciona porque todos los programas se conocen de antemano y el usuario no puede correr su propio software en la tostadora. En algunos de esos sistemas el sistema operativo es solo una biblioteca enlazada con el programa (por ejemplo, e-cos).

(Tanenbaum, cap. 3.1, págs. 176–179) (Apunte: resumen de la cátedra, 3.1)

---

## 3. Modelado de la multiprogramación y rendimiento (programa 3.2)

La multiprogramación mejora el uso de la CPU. El modelo crudo dice: si un proceso calcula solo el 20 % del tiempo, con cinco procesos en memoria la CPU estaría ocupada todo el tiempo. Ese modelo es demasiado optimista, porque supone que los cinco nunca esperan E/S al mismo tiempo.

**Modelo probabilístico:** si un proceso pasa una fracción p de su tiempo esperando E/S, y hay n procesos en memoria, la probabilidad de que los n estén esperando E/S a la vez (y la CPU quede inactiva) es p elevado a la n. Entonces:

Uso de la CPU = 1 − pⁿ

A n se lo llama **grado de multiprogramación**.

Descripción de la figura 2-6: un gráfico con el grado de multiprogramación (1 a 10) en el eje horizontal y el uso de la CPU (0 a 100 %) en el vertical. Hay tres curvas que suben y se aplanan: la de 20 % de espera de E/S llega casi al 100 % con muy pocos procesos; la de 50 % sube más despacio; la de 80 % es la más lenta. El gráfico muestra que, con 80 % de espera, hacen falta por lo menos 10 procesos para que el desperdicio de CPU baje del 10 %. Y 80 % de espera no es raro: un proceso interactivo que espera que el usuario escriba está esperando E/S.

El modelo es una aproximación: supone que los procesos son independientes, cuando en realidad, con una sola CPU, no pueden correr tres a la vez. Se podría hacer un modelo más exacto con teoría de colas, pero la idea central sigue valiendo: la multiprogramación permite usar la CPU cuando de otra forma estaría inactiva.

Ejemplo resuelto del libro (cuánto conviene comprar memoria):

1. La computadora tiene 512 MB; el sistema operativo ocupa 128 MB y cada programa de usuario otros 128 MB. Entran 3 programas a la vez.
2. Con 80 % de espera de E/S: uso = 1 − 0,8³ = 1 − 0,512 = 0,488, unos 49 %.
3. Si se agregan 512 MB, entran 7 programas: 1 − 0,8⁷ = 0,790, unos 79 %. La primera compra sube el rendimiento un 30 %.
4. Si se agregan otros 512 MB, entran 11: 1 − 0,8¹¹ = 0,914, unos 91 %. La segunda compra suma solo un 12 %.
5. Conclusión: la primera ampliación es una buena inversión; la segunda, no tanto. Cada proceso nuevo aporta menos que el anterior.

(Tanenbaum, cap. 2.1.7, págs. 93–95, fig. 2-6) (Apunte: resumen de la cátedra)

---

## 4. Espacios de direcciones, reubicación y protección (programa 3.2)

### 4.1 Por qué hace falta una abstracción

Exponer la memoria física tiene dos desventajas graves. Primero, un programa puede estropear el sistema operativo, a propósito o sin querer, aunque haya un solo programa corriendo. Segundo, es muy difícil tener varios programas a la vez, cosa normal en una PC (un procesador de texto, el correo y un navegador abiertos al mismo tiempo).

Para que varias aplicaciones convivan en memoria sin interferirse hay que resolver dos problemas: **protección** y **reubicación**.

### 4.2 El espacio de direcciones

Así como el proceso es una CPU abstracta para ejecutar programas, el **espacio de direcciones** es una memoria abstracta para que los programas vivan. Definición del libro: "un espacio de direcciones es el conjunto de direcciones que puede utilizar un proceso para direccionar la memoria". Cada proceso tiene el suyo, independiente de los demás (salvo cuando quieren compartir a propósito). Así, la dirección 28 de un programa indica un lugar físico distinto de la dirección 28 de otro.

El concepto es general. Ejemplos del libro: los números de teléfono de 7 dígitos (de 0.000.000 a 9.999.999), los puertos de E/S del Pentium (de 0 a 16.383), las direcciones IPv4 (de 0 a 2³² − 1) y los dominios .com (cadenas de 2 a 63 caracteres seguidas de .com).

### 4.3 Registros base y límite

Es la solución simple, una forma de **reubicación dinámica**, que se usó desde la CDC 6600 (la primera supercomputadora) hasta el Intel 8088 (el corazón de la IBM PC original). Cada CPU tiene dos registros especiales:

- **Registro base:** se carga con la dirección física donde empieza el programa.
- **Registro límite:** se carga con la longitud del programa.

Los programas se cargan en posiciones consecutivas, donde haya lugar, sin modificarlos al cargarlos. Cada vez que el proceso hace referencia a la memoria (para traer una instrucción o leer o escribir un dato), el hardware de la CPU, en forma automática:

1. suma el valor del registro base a la dirección que generó el proceso;
2. comprueba si la dirección generada es mayor o igual que el límite; si lo es, genera un fallo y aborta el acceso;
3. si está bien, manda la dirección resultante al bus de memoria.

Descripción de la figura 3-3: los dos programas de 16 KB de la figura 3-2 cargados uno detrás del otro. Mientras se ejecuta el segundo, el registro base vale 16.384 y el registro límite vale 16.384.

Ejemplo resuelto:

1. El segundo programa ejecuta JMP 28.
2. El hardware suma la base: 28 + 16.384 = 16.412.
3. 28 es menor que el límite (16.384), así que el acceso es válido.
4. El salto llega a la instrucción CMP del segundo programa, como se esperaba.
5. Si el mismo programa intentara acceder a su dirección 20.000, el hardware vería que 20.000 es mayor o igual que el límite y generaría un fallo: el proceso no puede salirse de su espacio.

Para el primer programa los valores serían base 0 y límite 16.384; para un tercer programa de 16 KB cargado encima del segundo, base 32.768 y límite 16.384. (Que base y límite valgan lo mismo en el segundo programa es una casualidad del ejemplo, porque los programas miden lo mismo que la posición donde empieza el segundo.)

En muchas implementaciones, solo el sistema operativo puede modificar estos registros. En la CDC 6600 era así; el 8088 ni siquiera tenía registro límite (tenía varios registros base, para reubicar texto y datos por separado, pero sin protección contra accesos fuera de rango).

**Desventaja:** hay que hacer una suma y una comparación en cada referencia a memoria. La comparación es rápida, pero la suma es lenta por la propagación del acarreo, salvo que se usen circuitos especiales.

**Sobre las particiones fijas:** el programa de la materia nombra las particiones fijas. Esta edición del Tanenbaum no las desarrolla como tema propio. Lo más cercano que trae son los bloques de 2 KB con llaves de protección de la IBM 360 y los registros base y límite. Según la cátedra, los esquemas que se estudian son: sin abstracción, espacios de direcciones con base y límite, intercambio y memoria virtual.

(Tanenbaum, cap. 3.2.1, págs. 179–181, figs. 3-2 y 3-3) (Apunte: resumen de la cátedra, 3.2 y 3.2.1)

---

## 5. Intercambio y particiones variables (programa 3.3)

### 5.1 El intercambio

En la práctica, la RAM no alcanza para todos los procesos. En un Windows o Linux común se inician entre 40 y 60 procesos al arrancar (por ejemplo, procesos que solo buscan actualizaciones y ocupan de 5 a 10 MB), y una aplicación seria ocupa de 50 a 200 MB o más.

Hay dos estrategias para la sobrecarga de memoria:

1. **Intercambio (swapping):** traer cada proceso completo a la memoria, ejecutarlo un tiempo y devolverlo al disco. Los procesos inactivos quedan en disco y no ocupan memoria.
2. **Memoria virtual:** permite que los programas se ejecuten aunque estén solo en parte en la memoria (sección 7).

Descripción de la figura 3-4 (siete instantes de la memoria, cada uno una columna con el sistema operativo abajo):

- (a) Solo está el proceso A.
- (b) Se crea o se trae del disco el proceso B, encima de A.
- (c) Llega C, encima de B.
- (d) A se intercambia al disco: queda un hueco abajo.
- (e) Llega D y se ubica en ese hueco.
- (f) Sale B: queda otro hueco.
- (g) A vuelve, pero ahora en otra posición (donde estaba B).

Como A vuelve en una ubicación distinta, sus direcciones hay que reubicarlas: con software al traerlo o, más probablemente, con hardware durante la ejecución, por ejemplo con registros base y límite.

### 5.2 Huecos y compactación

El intercambio crea varios huecos. Se pueden juntar todos en uno grande moviendo los procesos lo más abajo posible: eso es la **compactación de memoria**. Casi no se hace, porque consume mucho tiempo de CPU.

Ejemplo resuelto del libro: una máquina con 1 GB que copia 4 bytes cada 20 nanosegundos.

1. Hay que copiar 1 GB = 1.073.741.824 bytes, de a 4 bytes: 268.435.456 copias.
2. Cada copia tarda 20 ns: 268.435.456 × 20 ns = 5,37 segundos.
3. El libro lo redondea: compactar toda la memoria lleva unos 5 segundos.

### 5.3 Procesos que crecen

Si los procesos tienen tamaño fijo, la asignación es simple: se les da exactamente lo que necesitan. Pero si el segmento de datos puede crecer (por ejemplo, con memoria dinámica tomada de un heap), hay un problema:

- si hay un hueco al lado del proceso, crece en ese hueco;
- si el vecino es otro proceso, hay que moverlo a un hueco más grande o intercambiar otros procesos para hacer lugar;
- si no puede crecer en memoria y el área de intercambio del disco está llena, el proceso se suspende hasta que se libere espacio (o se elimina).

Si se espera que los procesos crezcan, conviene darles un poco de memoria extra cada vez que se cargan o se mueven. Al intercambiarlos al disco, se copia solo la parte que realmente se usa.

Descripción de la figura 3-5:

- (a) Dos procesos, A y B, cada uno con un "espacio para crecer" arriba de lo que realmente usa.
- (b) Cada proceso tiene, de abajo hacia arriba: el programa, los datos (que crecen hacia arriba), un espacio libre en el medio y la pila (que crece hacia abajo). El espacio libre del medio lo puede usar cualquiera de los dos. Si se agota, el proceso se mueve, se intercambia o se elimina.

### 5.4 Administración de memoria libre

Cuando la memoria se asigna en forma dinámica, el sistema tiene que llevar la cuenta de qué está libre. Hay dos formas: mapas de bits y listas.

Descripción de la figura 3-6: una franja de memoria dividida en unidades de asignación, con cinco procesos (A, B, C, D y E) y tres huecos. (a) es la franja; (b) es el mapa de bits; (c) es la misma información como lista. La lista dice: proceso desde 0 de largo 5 (A); hueco desde 5 de largo 3; proceso desde 8 de largo 6 (B); proceso desde 14 de largo 4 (C); hueco desde 18 de largo 2; proceso desde 20 de largo 6 (D); proceso desde 26 de largo 3 (E); hueco desde 29 de largo 3.

**Mapas de bits.** La memoria se divide en unidades de asignación, de unas pocas palabras a varios kilobytes. Cada unidad tiene un bit: 0 si está libre y 1 si está ocupada (o al revés).

- El tamaño de la unidad es una decisión de diseño. Cuanto más chica, más grande el mapa. Con unidades de 4 bytes, 32 bits de memoria necesitan 1 bit de mapa: el mapa ocupa 1/33 de la memoria. Si la unidad es grande, el mapa es chico, pero se desperdicia memoria en la última unidad de cada proceso si su tamaño no es múltiplo exacto.
- Ventaja: es simple y su tamaño depende solo de la memoria y de la unidad.
- Desventaja: para traer un proceso de k unidades hay que buscar k ceros consecutivos en el mapa, y esa búsqueda es lenta (la serie puede cruzar límites de palabra).

Ejemplo resuelto: memoria de 32 MB con unidades de 4 KB.

1. Cantidad de unidades: 32 MB / 4 KB = 33.554.432 / 4096 = 8192 unidades.
2. Un bit por unidad: 8192 bits.
3. En bytes: 8192 / 8 = 1024 bytes = 1 KB de mapa.

**Listas ligadas.** Se mantiene una lista de segmentos asignados y libres. Cada entrada dice si es hueco (H) o proceso (P), dónde empieza, su longitud y un puntero a la siguiente.

- Si la lista está ordenada por dirección, actualizarla cuando termina un proceso es simple. Descripción de la figura 3-7: el proceso X que termina tiene cuatro combinaciones de vecinos. (a) Proceso, X, proceso: X se convierte en un hueco. (b) Proceso, X, hueco: X se fusiona con el hueco de la derecha. (c) Hueco, X, proceso: se fusiona con el de la izquierda. (d) Hueco, X, hueco: se fusionan los tres en un solo hueco y la lista pierde dos entradas.
- Conviene una lista doblemente ligada, para encontrar fácilmente la entrada anterior y ver si se puede fusionar.

### 5.5 Algoritmos de asignación

Con la lista ordenada por dirección, para ubicar un proceso nuevo:

- **Primer ajuste (first fit):** recorre la lista hasta el primer hueco suficientemente grande. Lo divide en dos: una parte para el proceso y otra que queda libre. Es rápido porque busca lo menos posible.
- **Siguiente ajuste (next fit):** igual que el primer ajuste, pero empieza a buscar desde donde quedó la vez anterior. Las simulaciones de Bays (1977) muestran que rinde un poco peor que el primer ajuste.
- **Mejor ajuste (best fit):** recorre toda la lista y elige el hueco más chico que alcance. Es más lento, porque busca en toda la lista, y, sorprendentemente, desperdicia más memoria que el primer y el siguiente ajuste, porque llena la memoria de huecos diminutos e inútiles. El primer ajuste deja huecos más grandes en promedio.
- **Peor ajuste (worst fit):** elige siempre el hueco más grande, para que lo que sobre sea útil. Las simulaciones mostraron que tampoco es buena idea.
- **Ajuste rápido (quick fit):** mantiene listas separadas para los tamaños más pedidos (por ejemplo, una lista de huecos de 4 KB, otra de 8 KB, otra de 12 KB; un hueco de 21 KB podría ir a la de 20 KB o a una lista especial). Encontrar un hueco es rapidísimo, pero, como todos los esquemas ordenados por tamaño, buscar los vecinos para fusionar cuando un proceso termina es caro. Si no se fusionan, la memoria se fragmenta en muchos huecos chicos.

Mejoras: se pueden tener listas separadas para procesos y huecos, para que los algoritmos solo miren huecos (a costa de que liberar sea más lento). Si la lista de huecos se ordena por tamaño, el mejor ajuste termina apenas encuentra uno que sirva, y el primer y el mejor ajuste se vuelven igual de rápidos. Además, la información de la lista de huecos se puede guardar dentro de los propios huecos: la primera palabra, el tamaño; la segunda, el puntero al siguiente.

Ejemplo del libro con la figura 3-6: si se pide un bloque de tamaño 2, el primer ajuste usa el hueco que empieza en 5 (de largo 3) y el mejor ajuste usa el que empieza en 18 (de largo 2, que encaja justo).

Ejemplo resuelto con datos nuevos. La memoria tiene huecos, en orden de dirección, de 10, 4, 20, 18, 7, 9, 12 y 15 KB. Llegan pedidos de 12 KB, 10 KB y 9 KB, en ese orden.

| Algoritmo | Pedido de 12 KB | Pedido de 10 KB | Pedido de 9 KB |
|---|---|---|---|
| Primer ajuste | hueco de 20 (quedan 8) | hueco de 10 (queda 0) | hueco de 18 (quedan 9) |
| Mejor ajuste | hueco de 12 (exacto) | hueco de 10 (exacto) | hueco de 9 (exacto) |
| Peor ajuste | hueco de 20 (quedan 8) | hueco de 18 (quedan 8) | hueco de 15 (quedan 6) |
| Siguiente ajuste | hueco de 20 (quedan 8) | hueco de 18 (busca desde el 20 en adelante) | hueco de 9 (sigue desde el 18) |

Razonamiento del siguiente ajuste: el primer pedido toma el hueco de 20; el segundo empieza a buscar desde ahí, y el 20 (que ahora mide 8) no alcanza, así que toma el 18; el tercero sigue desde el 18 y el primero que alcanza es el 9.

### 5.6 El sistema de colegas (buddy system o sistema compañero)

El programa de la materia nombra el sistema compañero. En esta edición del libro no está en la sección 3.2.3, sino en el caso de estudio de Linux, donde se lo llama **algoritmo de colegas** (buddy algorithm). Linux lo usa para asignar marcos de página de memoria física, porque necesita poder obtener trozos contiguos de tamaño arbitrario (por ejemplo, para módulos del kernel como drivers).

Funcionamiento:

1. Al principio, la memoria es un solo trozo contiguo; en el ejemplo, de 64 páginas.
2. Cada pedido se redondea hacia arriba a una potencia de 2.
3. Si el trozo disponible es demasiado grande, se divide a la mitad, y la mitad se vuelve a dividir, hasta tener el tamaño justo.
4. Cuando se liberan dos trozos vecinos que salieron de la misma división (dos "colegas"), se vuelven a unir en el trozo original.

Descripción de la figura 10-17 (nueve estados de la memoria):

- (a) Un trozo de 64 páginas.
- (b) Llega un pedido de 8 páginas: se divide en 32 y 32.
- (c) La mitad de abajo se divide en 16 y 16.
- (d) Se divide de nuevo en 8 y 8, y uno de los de 8 se asigna.
- (e) Llega un segundo pedido de 8: se asigna el otro de 8.
- (f) Llega un pedido de 4: el trozo más chico libre (16) se divide en 8 y 8.
- (g) Uno de esos 8 se divide en 4 y 4, y se asigna uno de 4.
- (h) Se libera el segundo trozo de 8.
- (i) Se libera el primer trozo de 8. Como los dos trozos de 8 salieron del mismo trozo de 16, se unen y vuelve a haber un trozo de 16.

Linux agrega un arreglo donde el primer elemento es la cabeza de la lista de bloques de 1 unidad, el segundo la de bloques de 2, el siguiente la de 4, y así: se encuentra rápido un bloque de cualquier potencia de 2.

Desventaja: mucha **fragmentación interna**. Si se piden 65 páginas, hay que dar 128 (se desperdician 63). Para eso Linux tiene un segundo mecanismo, el **asignador de losas** (slab allocator), que toma trozos del sistema de colegas y los divide en unidades más chicas para objetos del kernel del mismo tipo (por ejemplo, los descriptores de proceso task_struct), organizados en cachés de objetos. Sobre él se construye kmalloc. Un tercer asignador, vmalloc, da memoria contigua solo en el espacio virtual, no en el físico.

(Tanenbaum, cap. 3.2.2, págs. 181–184, y 3.2.3, págs. 184–187, figs. 3-4 a 3-7; algoritmo de colegas: cap. 10.4.3, págs. 765–767, fig. 10-17) (Apunte: resumen de la cátedra, 3.2.2 y 3.2.3)

---

## 6. Memoria virtual (programa 3.4)

### 6.1 Por qué hace falta

Los registros base y límite crean espacios de direcciones, pero queda otro problema: el software crece más rápido que la memoria (el libro lo llama bloatware). En los ochenta, docenas de usuarios compartían una VAX de 4 MB; en la época del libro, Microsoft recomendaba al menos 512 MB para Vista.

Hay que poder correr programas que no entran en memoria, y varios programas que juntos no entran. El intercambio no sirve: con un disco SATA de 100 MB/s, sacar un programa de 1 GB tarda 10 segundos, y traer otro, otros 10.

Ejemplo resuelto: 1 GB a 100 MB por segundo es 1000 MB / 100 MB/s = 10 segundos de ida, y otros 10 de vuelta.

**Sobrepuestos (overlays):** la solución de los años sesenta fue dividir los programas en partes. Al arrancar, se cargaba solo el administrador de sobrepuestos, que cargaba y ejecutaba el sobrepuesto 0; al terminar, cargaba el 1 encima (o al lado, si había lugar). El intercambio de sobrepuestos lo hacía el sistema, pero dividir el programa lo tenía que hacer el programador a mano: era lento, aburrido y propenso a errores.

**Memoria virtual (Fotheringham, 1961):** la idea es pasarle todo ese trabajo a la computadora. Cada programa tiene su propio espacio de direcciones, dividido en trozos llamados **páginas**. Cada página es un rango contiguo de direcciones. Las páginas se asocian a la memoria física, pero no todas tienen que estar en memoria para que el programa corra. Si el programa usa una parte que está en memoria, el hardware hace la traducción al instante. Si usa una parte que no está, el sistema operativo recibe un aviso, trae la parte que falta y vuelve a ejecutar la instrucción que falló.

En cierto sentido, la memoria virtual generaliza los registros base y límite: en vez de reubicar por separado el texto y los datos, todo el espacio de direcciones se asocia a la memoria física en unidades chicas e iguales.

La memoria virtual funciona muy bien con multiprogramación: mientras un programa espera que se lea una de sus partes, la CPU se le da a otro proceso.

Según la cátedra: "La memoria virtual nace por la necesidad de que los programas sean más grandes que la memoria", y se explica a partir de los sobrepuestos. La cátedra lo resume así: cada proceso tiene su propio espacio de direcciones, dividido en partes chicas; solo las necesarias están en RAM y el resto queda en disco, y el sistema operativo mueve las partes automáticamente. El programa cree que toda su memoria está disponible.

### 6.2 Paginación

Los programas generan direcciones (con indexado, registros base, registros de segmento, etc.). Esas direcciones se llaman **direcciones virtuales** y forman el **espacio de direcciones virtuales**.

Sin memoria virtual, la dirección se pone directamente en el bus de memoria. Con memoria virtual, las direcciones virtuales van a la **MMU** (unidad de administración de memoria), que las traduce a direcciones físicas.

Descripción de la figura 3-8: dentro del paquete de la CPU están la CPU y la MMU. La CPU le manda direcciones virtuales a la MMU; la MMU manda direcciones físicas por el bus a la memoria. En el mismo bus están la memoria y el controlador de disco. La MMU suele estar dentro del chip de la CPU, aunque antes era un chip aparte.

El espacio de direcciones virtuales se divide en unidades de tamaño fijo llamadas **páginas**. Las unidades correspondientes de la memoria física se llaman **marcos de página**. Páginas y marcos tienen el mismo tamaño; se han usado tamaños desde 512 bytes hasta 64 KB. Las transferencias entre la RAM y el disco son siempre de páginas completas.

Descripción de la figura 3-9 (el ejemplo central del capítulo): una computadora con direcciones de 16 bits (de 0 a 64 K) pero solo 32 KB de memoria física, con páginas de 4 KB. Hay 16 páginas virtuales y 8 marcos. A la izquierda, las 16 páginas virtuales (0K–4K, 4K–8K, … 60K–64K); a la derecha, los 8 marcos (0K–4K … 28K–32K). La tabla de páginas del ejemplo es:

| Página virtual | Rango virtual | Marco |
|---|---|---|
| 0 | 0 a 4095 | 2 |
| 1 | 4096 a 8191 | 1 |
| 2 | 8192 a 12.287 | 6 |
| 3 | 12.288 a 16.383 | 0 |
| 4 | 16.384 a 20.479 | 4 |
| 5 | 20.480 a 24.575 | 3 |
| 6, 7, 8 | — | no está en memoria (X) |
| 9 | 36.864 a 40.959 | 5 |
| 10 | — | X |
| 11 | 45.056 a 49.151 | 7 |
| 12 a 15 | — | X |

Ojo con la notación: "de 4K a 8K" significa de 4096 a 8191. Cada página empieza en un múltiplo de 4096 y termina 4095 direcciones más arriba.

Una copia completa del programa (de hasta 64 KB) tiene que estar en el disco, para traer las partes cuando hagan falta.

Ejemplos resueltos del libro:

1. MOV REG, 0: la dirección virtual 0 está en la página 0, que está en el marco 2 (de 8192 a 12.287). La MMU la convierte en 8192 y manda 8192 al bus. La memoria no sabe nada de la MMU: solo ve un pedido a la dirección 8192.
2. MOV REG, 8192: la dirección 8192 está en la página virtual 2, que está en el marco 6. Se convierte en 6 × 4096 = 24.576.
3. La dirección virtual 20.500: la página 5 empieza en 20.480, así que 20.500 está 20 bytes adentro. La página 5 está en el marco 3, que empieza en 12.288. Dirección física: 12.288 + 20 = 12.308.
4. MOV REG, 32780: la página 8 empieza en 32.768, así que es el byte 12 de la página 8. La página 8 está marcada con X: no está en memoria. La MMU hace que la CPU genere un trap al sistema operativo: eso es un **fallo de página**.

### 6.3 El fallo de página (visión general)

Cuando ocurre un fallo de página, el sistema operativo:

1. elige un marco de página que se use poco;
2. si su contenido fue modificado, lo escribe de vuelta al disco;
3. trae la página que se pidió a ese marco;
4. cambia la asociación en la tabla de páginas;
5. reinicia la instrucción que causó el trap.

Continuación del ejemplo: si el sistema decide desalojar el marco 1 (donde está la página virtual 1), carga la página 8 en la dirección física 4096 y hace dos cambios en la MMU. Marca la página virtual 1 como no asociada (cualquier acceso entre 4096 y 8191 dará trap), y pone un 1 en la entrada de la página 8. Al reintentar la instrucción, la dirección 32.780 se traduce a 4096 + 12 = 4108.

En la tabla real, un **bit de presente/ausente** dice qué páginas están en memoria.

Según la cátedra, el fallo de página es: la CPU hace un trap al sistema operativo, este elige un marco para liberar, guarda la página vieja en disco si fue modificada, trae la página necesaria y reintenta la instrucción. Todo esto es transparente para el programa.

### 6.4 Cómo traduce la MMU (por qué el tamaño de página es potencia de 2)

La dirección virtual se divide en dos partes:

- **número de página virtual:** los bits de mayor orden;
- **desplazamiento:** los bits de menor orden, la posición dentro de la página.

Descripción de la figura 3-10: la dirección virtual 8196 (en binario 0010 0000 0000 0100) entra por abajo. Los 4 bits de arriba (0010 = 2) son el número de página; los 12 de abajo (0000 0000 0100 = 4) son el desplazamiento. El número de página se usa como índice en la tabla de páginas (16 entradas, cada una con un número de marco de 3 bits y un bit de presente/ausente). La entrada 2 tiene el marco 110 (6) y el bit en 1. Si el bit fuera 0, habría un trap. Como es 1, el número de marco (110) se copia en los 3 bits de mayor orden del registro de salida, y el desplazamiento de 12 bits se copia sin cambios. Resultado: 110 0000 0000 0100 en 15 bits, que es 24.580. Esa dirección sale al bus.

Ejemplo resuelto (8196):

1. 8196 en binario de 16 bits: 0010 0000 0000 0100.
2. Página = 0010 = 2; desplazamiento = 0000 0000 0100 = 4.
3. Tabla: la página 2 está en el marco 6, presente.
4. Dirección física = marco 6 seguido del desplazamiento: 110 0000 0000 0100 = 6 × 4096 + 4 = 24.580.

Con una página de tamaño potencia de 2, dividir la dirección en página y desplazamiento es simplemente cortar los bits: no hay que hacer ninguna división. La cantidad de bits del desplazamiento es el logaritmo en base 2 del tamaño de página: 1 KB son 10 bits, 2 KB son 11, 4 KB son 12.

### 6.5 Ejercicios de traducción como los de la cátedra

Los exámenes de la cátedra dan una dirección virtual en binario o en hexadecimal, el tamaño de página y una tabla, y piden el número de página y la dirección física. El método, paso a paso:

1. Pasar la dirección a binario (si está en hexadecimal, cada dígito son 4 bits).
2. Calcular los bits de desplazamiento: log₂ del tamaño de página (1 KB → 10 bits; 2 KB → 11; 4 KB → 12).
3. Separar: los bits de la derecha son el desplazamiento; los de la izquierda, el número de página.
4. Buscar la página en la tabla. Si el bit de presente/ausente es 0, hay fallo de página (y, si lo piden, se aplica el algoritmo de reemplazo).
5. Reemplazar el número de página por el número de marco, sin tocar el desplazamiento. Eso da la dirección física. También se puede calcular como marco × tamaño de página + desplazamiento.

Ejemplo resuelto 1 (páginas de 1 KB). Dirección virtual 0x2C3A; la tabla dice que la página 11 está en el marco 5.

1. 0x2C3A en binario: 0010 1100 0011 1010.
2. Páginas de 1 KB: 10 bits de desplazamiento.
3. Desplazamiento (10 bits de la derecha): 00 0011 1010 = 58. Página (6 bits de la izquierda): 001011 = 11.
4. La página 11 está en el marco 5 (000101 en 6 bits).
5. Dirección física: 000101 seguido de 00 0011 1010 = 0001 0100 0011 1010 = 0x143A. Comprobación: 5 × 1024 + 58 = 5178 = 0x143A.

Ejemplo resuelto 2 (de la práctica de la cátedra, páginas de 2 KB). Dirección 0x6047; la tabla dice que la página 12 está en el marco 17 (0x11).

1. 0x6047 en binario: 0110 0000 0100 0111.
2. Páginas de 2 KB: 11 bits de desplazamiento y quedan 5 para la página.
3. Página: 01100 = 12. Desplazamiento: 000 0100 0111.
4. La página 12 está en el marco 17 = 10001.
5. Dirección física: 10001 seguido de 000 0100 0111 = 1000 1000 0100 0111 = 0x8847. Comprobación: 17 × 2048 + 71 = 34.887 = 0x8847.

Otros datos de la práctica: 0xB915 con páginas de 2 KB es la página 10111 = 23; 0x30AE con páginas de 4 KB (12 bits de desplazamiento) es la página 3. En un examen real se dio la dirección 0101 0101 0010 1001 con páginas de 1 KB: con 10 bits de desplazamiento, la página es 010101 = 21.

### 6.6 Tablas de páginas

La tabla de páginas asocia páginas virtuales con marcos. En términos matemáticos, es una función: el número de página virtual es el argumento y el número de marco es el resultado. El número de página se usa como índice; en esa entrada está el número de marco (si lo hay), que se pega al desplazamiento en el lugar del número de página para formar la dirección física. Con 16 bits y páginas de 4 KB, 4 bits son la página (16 páginas) y 12 el desplazamiento (de 0 a 4095), pero se pueden usar 3, 5 u otra cantidad de bits: cada división implica otro tamaño de página.

**Estructura de una entrada.** Descripción de la figura 3-11: una entrada típica de 32 bits con, de izquierda a derecha, el bit de uso de caché deshabilitado, el bit de modificada, el bit de referenciada, los bits de protección, el bit de presente/ausente y el número de marco de página.

- **Número de marco de página:** el campo más importante; el objetivo de todo es encontrarlo.
- **Bit de presente/ausente:** 1 si la entrada es válida y la página está en memoria; 0 si no está. Acceder a una entrada con el bit en 0 provoca un fallo de página.
- **Bits de protección:** qué accesos se permiten. En su forma más simple es 1 bit (0 lectura/escritura, 1 solo lectura); más sofisticado, 3 bits: lectura, escritura y ejecución.
- **Bit de modificada (bit sucio):** el hardware lo pone en 1 automáticamente cuando se escribe en la página. Si la página está sucia, hay que escribirla al disco antes de reusar el marco; si está limpia, se puede abandonar, porque la copia del disco sigue siendo válida.
- **Bit de referenciada:** se pone en 1 cada vez que la página se usa, para leer o escribir. Ayuda a elegir qué página desalojar: las que no se usan son mejores candidatas. Es clave en varios algoritmos de reemplazo.
- **Bit de caché deshabilitada:** importante para páginas asociadas a registros de dispositivos. Si el sistema está esperando que un dispositivo responda, el hardware tiene que leer el dispositivo y no una copia vieja de la caché. Las máquinas con espacio de E/S separado no lo necesitan.

Ojo: la **dirección de disco** donde se guarda la página cuando no está en memoria **no** está en la tabla de páginas. La tabla guarda solo lo que el hardware necesita para traducir. Lo que el sistema necesita para manejar los fallos está en tablas de software del sistema operativo.

Idea de fondo: la memoria virtual crea una abstracción (el espacio de direcciones) de la memoria física, igual que el proceso es una abstracción de la CPU.

(Tanenbaum, cap. 3.3, 3.3.1 y 3.3.2, págs. 188–194, figs. 3-8 a 3-11) (Apunte: resumen de la cátedra, 3.3, 3.3.1 y 3.3.2) (Apunte: práctica resuelta, págs. 1 y 14)

---

## 7. Aceleración de la paginación: el TLB (programa 3.4)

### 7.1 Los dos problemas

En todo sistema de paginación hay que resolver dos cuestiones:

1. **La traducción debe ser rápida**, porque se hace en cada referencia a memoria, y cada instrucción hace una, dos o más. Si una instrucción tarda 1 ns, la búsqueda en la tabla tiene que tardar menos de 0,2 ns para no ser un cuello de botella.
2. **Si el espacio virtual es grande, la tabla es grande.** Con páginas de 4 KB, un espacio de 32 bits tiene un millón de páginas, y cada proceso necesita su propia tabla.

Ejemplo resuelto: 2³² / 2¹² = 2²⁰ = 1.048.576 páginas. Si cada entrada ocupa 4 bytes, la tabla de un nivel de cada proceso ocupa 4 MB.

Dos diseños extremos:

- **Toda la tabla en registros de hardware rápidos:** simple y sin referencias a memoria durante la traducción, pero carísimo si la tabla es grande, y hay que cargar toda la tabla en cada cambio de contexto.
- **Toda la tabla en memoria principal:** el hardware solo necesita un registro que apunte al inicio de la tabla, y cambiar de proceso es recargar ese registro. Pero cada instrucción necesita una o más referencias extra a memoria. Una instrucción que copia un registro a otro, que sin paginación hace una sola referencia (traer la instrucción), pasa a hacer dos: el rendimiento se reduce a la mitad. "Bajo estas condiciones, nadie utilizaría la paginación."

### 7.2 El TLB

La solución se basa en una observación: la mayoría de los programas hacen muchísimas referencias a pocas páginas. Solo una pequeña fracción de la tabla se lee seguido.

El **TLB** (Translation Lookaside Buffer, búfer de traducción adelantada), también llamado **memoria asociativa**, es un pequeño dispositivo de hardware dentro de la MMU que traduce direcciones sin pasar por la tabla de páginas. Tiene pocas entradas (8 en el ejemplo del libro, rara vez más de 64). Cada entrada tiene:

- el número de página virtual (en la tabla de páginas no hace falta, porque ahí es el índice);
- un bit de válida (si la entrada está en uso);
- el bit de modificada;
- el código de protección (lectura, escritura, ejecución);
- el marco de página físico.

Descripción de la figura 3-12: una tabla de 8 filas con columnas Válida, Página virtual, Modificada, Protección y Marco de página. El ejemplo es un proceso en un ciclo que usa las páginas virtuales 19, 20 y 21 (código, con protección de lectura y ejecución), datos en las páginas 129 y 130 (un arreglo), índices en la 140, y la pila en las páginas 860 y 861.

**Funcionamiento, paso a paso:**

1. La CPU genera una dirección virtual y la MMU la recibe.
2. El hardware compara el número de página con **todas** las entradas del TLB **a la vez** (en paralelo).
3. Si hay coincidencia válida y el acceso no viola la protección, el marco sale directamente del TLB, sin ir a la tabla de páginas.
4. Si hay coincidencia pero se intenta escribir en una página de solo lectura, hay un **fallo de protección**.
5. Si no hay coincidencia (fallo de TLB), la MMU busca en la tabla de páginas en memoria, desaloja una entrada del TLB y pone la nueva. La próxima vez que se use esa página habrá un acierto.
6. Cuando se saca una entrada del TLB, el bit de modificada se copia de vuelta a la tabla de páginas en memoria (los demás valores ya están ahí, salvo el bit de referenciada).

Según la cátedra: gracias al principio de localidad, la mayoría de las referencias se resuelven en el TLB y se evitan los accesos costosos a la tabla de páginas.

### 7.3 Administración del TLB por software

En el diseño clásico, el hardware de la MMU maneja todo el TLB, y el sistema operativo solo interviene cuando una página no está en memoria. Pero muchas máquinas RISC modernas (SPARC, MIPS, HP PA) administran el TLB por software. En ellas, cuando no hay coincidencia en el TLB, la MMU genera un **fallo de TLB** y le pasa el problema al sistema operativo, que busca la página, saca una entrada del TLB, pone la nueva y reinicia la instrucción. Todo en pocas instrucciones, porque los fallos de TLB son mucho más frecuentes que los fallos de página.

Sorprendentemente, con un TLB razonablemente grande (por ejemplo, 64 entradas), la administración por software es aceptablemente eficiente. La ventaja es una MMU mucho más simple, que libera espacio en el chip para cachés. Mejoras: precargar entradas (por ejemplo, cuando un cliente le manda un mensaje a un servidor, cargar de antemano las páginas del servidor) y mantener una caché de software de entradas del TLB en una página que siempre esté en el TLB.

### 7.4 Fallos suaves y fallos duros

- **Fallo suave:** la página no está en el TLB pero sí en memoria. Solo hay que actualizar el TLB; no hace falta E/S de disco. Requiere de 10 a 20 instrucciones y unos nanosegundos.
- **Fallo duro:** la página no está en memoria (ni, por supuesto, en el TLB). Hay que traerla del disco, lo que tarda varios milisegundos.

Un fallo duro es, según el libro, "un millón de veces más lento" que uno suave. El objetivo principal es minimizar los fallos duros.

(Tanenbaum, cap. 3.3.3, págs. 194–198, fig. 3-12) (Apunte: resumen de la cátedra, 3.3.3)

---

## 8. Tablas de páginas para memorias extensas (programa 3.4)

El TLB acelera la traducción, pero no resuelve el tamaño de las tablas.

### 8.1 Tablas de páginas multinivel

El secreto es no mantener en memoria todas las tablas, en especial las que no se usan.

Descripción de la figura 3-13: (a) una dirección virtual de 32 bits dividida en tres campos: TP1 de 10 bits, TP2 de 10 bits y desplazamiento de 12 bits (páginas de 4 KB, 2²⁰ páginas en total). (b) A la izquierda, la tabla de páginas de nivel superior, de 1024 entradas (una por cada valor de TP1). Cada entrada representa 4 MB del espacio de 4 GB. La entrada 0 apunta a la tabla de segundo nivel del texto del programa, la entrada 1 a la de los datos y la entrada 1023 a la de la pila. Las demás no se usan. Cada tabla de segundo nivel tiene a su vez 1024 entradas, que apuntan a las páginas.

El ejemplo: un proceso de 12 MB, con 4 MB de texto abajo, 4 MB de datos y 4 MB de pila arriba de todo. Entre los datos y la pila hay un hueco gigantesco sin usar.

Funcionamiento: la MMU extrae TP1 y lo usa como índice en la tabla de nivel superior. Esa entrada da la dirección (o el número de marco) de una tabla de segundo nivel. Con TP2 se indexa esa tabla y se obtiene el marco de la página. El marco se combina con el desplazamiento.

Ejemplo resuelto del libro: la dirección virtual 0x00403004 (4.206.596 en decimal), que está 12.292 bytes adentro de los datos.

1. En binario, 32 bits: 0000 0000 0100 0000 0011 0000 0000 0100.
2. TP1 = los 10 bits de arriba = 00 0000 0001 = 1. Se usa la entrada 1 de la tabla de nivel superior, que cubre de 4 MB a 8 MB.
3. TP2 = los 10 bits del medio = 00 0000 0011 = 3. Se usa la entrada 3 de esa tabla de segundo nivel, que cubre de 12.288 a 16.383 dentro de su trozo de 4 MB (direcciones absolutas de 4.206.592 a 4.210.687).
4. Desplazamiento = los 12 bits de abajo = 0000 0000 0100 = 4.
5. Comprobación: 4 MB + 3 × 4096 + 4 = 4.194.304 + 12.288 + 4 = 4.206.596.
6. Si el bit de presente/ausente de esa entrada es 0, hay fallo de página. Si es 1, el marco se combina con el desplazamiento 4 y la dirección física sale al bus.

Ojo, errata de la edición en español: el texto dice "TP2 = 2", pero la cuenta da TP2 = 3, y el mismo libro, dos líneas después, dice que se extrae "la entrada 3". Lo correcto es TP2 = 3.

Lo importante: aunque el espacio tiene más de un millón de páginas, solo hacen falta **cuatro tablas**: la de nivel superior y las de segundo nivel de 0 a 4 MB (texto), de 4 a 8 MB (datos) y de los 4 MB de arriba (pila). Las otras 1021 entradas de la tabla superior tienen el bit de presente/ausente en 0. Si el proceso intenta usarlas, hay un fallo de página; el sistema ve que el proceso referencia memoria que no debe y toma una acción (enviarle una señal o eliminarlo).

El esquema se puede extender a tres, cuatro o más niveles. Más niveles dan más flexibilidad, pero más de tres probablemente no valga la pena. (Linux usa tablas de cuatro niveles en su diseño general: directorio global, superior, intermedio y tabla de páginas.)

### 8.2 Tablas de páginas invertidas

Para 32 bits, la multinivel funciona bien. Con 64 bits la situación cambia por completo.

Ejemplo resuelto: espacio de 2⁶⁴ bytes con páginas de 4 KB.

1. Cantidad de páginas: 2⁶⁴ / 2¹² = 2⁵² entradas.
2. Con entradas de 8 bytes: 2⁵² × 8 = 2⁵⁵ bytes = 32 PB (petabytes). El libro dice "más de 30 millones de gigabytes".
3. Eso no es razonable solo para la tabla de páginas.

La **tabla de páginas invertida** tiene una entrada por cada **marco de página de la memoria real**, en vez de una por página virtual. Cada entrada dice quién está en ese marco: el par (proceso, página virtual).

Ejemplo resuelto: con 1 GB de RAM y páginas de 4 KB, la tabla invertida tiene 2³⁰ / 2¹² = 2¹⁸ = 262.144 entradas, sin importar que el espacio virtual sea de 64 bits.

Desventaja seria: la traducción se vuelve difícil. Cuando el proceso n usa la página virtual p, ya no se puede usar p como índice: hay que buscar el par (n, p) en toda la tabla, y en cada referencia a memoria, no solo en los fallos.

Solución: usar el TLB. Si contiene las páginas de uso frecuente, la traducción es igual de rápida que con tablas normales. En un fallo de TLB, la tabla invertida se busca por software con una **tabla de hash** indexada por el hash de la dirección virtual. Las páginas virtuales con el mismo hash se encadenan. Si la tabla de hash tiene tantas ranuras como marcos, la cadena promedio tiene una sola entrada. Una vez encontrado el marco, el par (virtual, física) se mete en el TLB.

Descripción de la figura 3-14: a la izquierda, una tabla de páginas tradicional con una entrada para cada una de las 2⁵² páginas, indexada por página virtual. A la derecha, la memoria física de 1 GB con 2¹⁸ marcos de 4 KB, y una tabla de hash indexada por el hash de la página virtual, con entradas que tienen el par página virtual y marco.

Las tablas invertidas son comunes en máquinas de 64 bits: incluso con páginas de 4 MB, una tabla normal necesitaría 2⁴² entradas.

Según la cátedra, para fijar: la paginación necesita aceleración para ser usable; el TLB es clave para el rendimiento; y para memorias grandes, en 32 bits se usan tablas multinivel y en 64 bits, tablas invertidas con TLB.

(Tanenbaum, cap. 3.3.4, págs. 198–201, figs. 3-13 y 3-14) (Apunte: resumen de la cátedra, 3.3.4)

---

## 9. Algoritmos de reemplazo de páginas (programa 3.4)

### 9.1 El problema

Cuando hay un fallo de página, el sistema tiene que elegir una página para desalojar y hacerle lugar a la nueva. Si la página que sale fue modificada, hay que escribirla al disco; si no (por ejemplo, si es texto del programa), la copia del disco ya está actualizada y la nueva simplemente la sobrescribe.

Se podría elegir al azar, pero el rendimiento es mucho mejor si se saca una página que no se use seguido: si se saca una muy usada, habrá que traerla de vuelta enseguida.

El mismo problema aparece en otros lugares: en la caché de la CPU (bloques de 32 o 64 bytes, en nanosegundos en vez de milisegundos) y en la caché de un servidor web (las páginas web en caché nunca se modifican, así que siempre hay una copia fresca; en memoria virtual, las páginas pueden estar sucias o limpias).

Una pregunta que aparece en todos los algoritmos: la página que se saca, ¿tiene que ser del proceso que falló o puede ser de otro? En el primer caso cada proceso tiene un número fijo de páginas; en el segundo, no. Las dos opciones existen (sección 10.1).

Cómo se resuelven los ejercicios de conteo de fallos: se da una **cadena de referencias** (la secuencia de páginas que el proceso usa) y una cantidad de marcos. Se recorre la cadena; cada vez que la página pedida no está en los marcos, hay un fallo; si los marcos están llenos, el algoritmo elige la víctima. Los primeros fallos, con marcos vacíos, también cuentan.

### 9.2 Algoritmo óptimo

Es el mejor posible y es imposible de implementar. En el momento del fallo, cada página en memoria se puede etiquetar con cuántas instrucciones faltan hasta que se la vuelva a usar. **El óptimo saca la página con la etiqueta más alta**, la que se va a usar más lejos en el futuro: así el próximo fallo se posterga lo más posible. "Al igual que las personas, las computadoras tratan de posponer los eventos indeseables el mayor tiempo posible."

El problema: el sistema no conoce el futuro (la misma situación que con SJF en planificación: ¿cómo saber cuál trabajo es más corto?). Sí se puede simular: se corre el programa una vez registrando las referencias, y en una segunda corrida se aplica el óptimo. Sirve para comparar: si un algoritmo real rinde solo 1 % peor que el óptimo, no vale la pena buscar uno mejor. Ese registro vale solo para ese programa y esos datos de entrada.

### 9.3 NRU (no usadas recientemente)

La mayoría de las computadoras con memoria virtual tienen dos bits por página en la tabla de páginas:

- **R (referenciada):** se pone en 1 cada vez que se usa la página (lectura o escritura).
- **M (modificada):** se pone en 1 cuando se escribe en la página.

Se actualizan en cada referencia, así que los tiene que poner el hardware. Una vez en 1, quedan así hasta que el sistema operativo los borra. Si el hardware no los tiene, se pueden simular con fallos de página: todas las páginas empiezan como "no en memoria"; al primer acceso, el sistema pone R en sus tablas y mapea la página como SOLO LECTURA; si después se escribe, otro fallo le permite poner M y cambiar a LECTURA/ESCRITURA.

El algoritmo: al iniciar un proceso, R y M valen 0. El bit R se borra periódicamente, en cada interrupción de reloj, para distinguir las páginas usadas recientemente. En un fallo, las páginas se dividen en cuatro clases:

| Clase | R | M | Significado |
|---|---|---|---|
| 0 | 0 | 0 | no referenciada, no modificada |
| 1 | 0 | 1 | no referenciada, modificada |
| 2 | 1 | 0 | referenciada, no modificada |
| 3 | 1 | 1 | referenciada, modificada |

**NRU saca una página al azar de la clase de menor número que no esté vacía.**

La clase 1 parece imposible (¿modificada sin ser referenciada?), pero ocurre cuando una interrupción de reloj borra el R de una página de clase 3. El reloj no borra M, porque hace falta para saber si hay que escribirla al disco.

La idea implícita: es mejor sacar una página modificada que no se usó en al menos un pulso de reloj (unos 20 ms) que una página limpia muy usada. NRU es fácil de entender, moderadamente eficiente y da un rendimiento adecuado, aunque no óptimo. El libro lo califica de "aproximación muy burda del LRU".

Ejemplo resuelto: en el momento del fallo hay cuatro páginas: A (R = 1, M = 1), B (R = 0, M = 1), C (R = 1, M = 0) y D (R = 1, M = 1).

1. Clases: A es clase 3, B es clase 1, C es clase 2 y D es clase 3.
2. No hay ninguna de clase 0.
3. La clase más baja no vacía es la 1: se saca B. Como está modificada, hay que escribirla al disco antes de reusar su marco.

### 9.4 FIFO (primera en entrar, primera en salir)

Analogía del libro: un supermercado con lugar para exactamente k productos. Llega un producto nuevo de éxito (un yogur orgánico instantáneo liofilizado) y hay que sacar uno. Se saca el que se vende hace más tiempo. El problema es que podría ser la gomina para bigotes, pero también la harina, la sal o la manteca.

El sistema mantiene una lista de las páginas en memoria en el orden en que llegaron: la más reciente al final y la más antigua al frente. En un fallo se saca la del frente y la nueva va al final. **Problema:** puede sacar una página muy usada solo porque llegó primero. Por eso casi no se usa en su forma pura.

### 9.5 Segunda oportunidad

Es una modificación simple de FIFO. Se inspecciona el bit R de la página más antigua:

- si R = 0, la página es vieja y no se usó: se reemplaza de inmediato;
- si R = 1, se le borra el bit, se la pone al final de la lista y se actualiza su tiempo de carga como si acabara de llegar. La búsqueda sigue con la siguiente.

Descripción de la figura 3-15: (a) ocho páginas, de la A a la H, en una lista ordenada por tiempo de carga: A (0), B (3), C (7), D (8), E (12), F (14), G (15), H (18). A es la que se cargó primero y H la más reciente. (b) Hay un fallo en el tiempo 20 y A tiene R = 1: A se pasa al final con tiempo de carga 20 y R = 0. La lista queda B (3), C (7), D (8), E (12), F (14), G (15), H (18), A (20), y la búsqueda sigue con B.

Lo que busca es una página antigua que no se haya usado en el intervalo de reloj más reciente. Si todas tienen R = 1, el algoritmo da una vuelta entera poniendo todos los R en 0, vuelve a A (ahora con R = 0) y la saca: **se degenera en FIFO puro, pero siempre termina.**

### 9.6 Algoritmo del reloj

Segunda oportunidad es razonable pero ineficiente, porque mueve páginas en la lista todo el tiempo. El reloj mantiene los marcos en una **lista circular**, como un reloj, con una **manecilla** que apunta a la página más antigua.

Descripción de la figura 3-16: doce páginas, de la A a la L, en círculo, con una manecilla en el centro. Al lado, la regla: cuando hay un fallo, se inspecciona la página a la que apunta la manecilla. Si R = 0, se desaloja la página. Si R = 1, se pone R en 0 y se avanza la manecilla.

Cuando se desaloja una página, la nueva se inserta en su lugar y la manecilla avanza una posición. El proceso se repite hasta encontrar una página con R = 0. Hace exactamente lo mismo que segunda oportunidad, pero sin mover páginas: por eso es más eficiente. El libro lo califica de "realista", y los sistemas reales usan variantes del reloj.

### 9.7 LRU (menos usadas recientemente)

Se basa en una observación: las páginas usadas mucho en las últimas instrucciones probablemente se vuelvan a usar mucho; las que no se usan hace tiempo probablemente sigan sin usarse. **LRU saca la página que no se usó durante más tiempo.** Es una muy buena aproximación al óptimo.

Es realizable pero caro. Implementarlo completo requiere una lista de todas las páginas, con la de uso más reciente al frente y la menos reciente al final, y actualizarla **en cada referencia a memoria**: buscar la página, sacarla y pasarla al frente lleva mucho tiempo, incluso con hardware.

Dos implementaciones con hardware especial:

1. **Contador de 64 bits (C):** se incrementa después de cada instrucción. Cada entrada de la tabla de páginas tiene un campo para guardar el contador. Después de cada referencia, el valor actual de C se guarda en la entrada de la página usada. En un fallo, se busca el menor contador: esa es la menos usada recientemente.
2. **Matriz de n × n bits** (para n marcos), inicialmente en 0. Cada vez que se usa la página k, el hardware pone en 1 toda la fila k y después en 0 toda la columna k. En todo momento, **la fila con el menor valor binario es la menos usada recientemente**. Descripción de la figura 3-17: diez matrices de 4 × 4 para la secuencia de referencias 0, 1, 2, 3, 2, 1, 0, 3, 2, 3 con cuatro marcos.

Ejemplo resuelto de la matriz (primeros pasos, filas y columnas de la 0 a la 3):

1. Se usa la página 0: fila 0 = 1111, después columna 0 en 0, así que la fila 0 queda 0111 y las demás 0000.
2. Se usa la página 1: fila 1 = 1111 y después columna 1 en 0. La fila 0 pasa a 0011, la fila 1 a 1011 y las filas 2 y 3 siguen en 0000.
3. La fila menor es la de una página que nunca se usó (2 o 3). Entre las usadas, la 0 (0011) es menor que la 1 (1011): la 0 es la menos reciente, lo cual es correcto.

Muy pocas máquinas tienen ese hardware, así que se usan simulaciones por software (sección 9.8).

### 9.8 Simulación de LRU por software: NFU y envejecimiento

**NFU (no utilizadas frecuentemente):** cada página tiene un contador de software que empieza en 0. En cada interrupción de reloj, el sistema recorre las páginas y le suma a cada contador su bit R. Los contadores llevan la cuenta aproximada de cuánto se usó cada página. En un fallo se saca la de menor contador.

Problema: **nunca olvida.** En un compilador de varias pasadas, las páginas muy usadas en la pasada 1 pueden seguir teniendo cuentas altas en las siguientes. Si la pasada 1 fue la más larga, las páginas de las pasadas siguientes pueden tener siempre cuentas menores y ser sacadas aunque se estén usando.

**Envejecimiento (aging):** una pequeña modificación de NFU que simula muy bien a LRU. Tiene dos partes:

1. Antes de agregar el bit R, cada contador se desplaza un bit a la derecha.
2. El bit R se agrega en el bit de más a la izquierda, no en el de más a la derecha.

Así, las referencias viejas pierden peso con el tiempo. En un fallo se saca la página con el menor contador: una página no usada durante cuatro pulsos tiene cuatro ceros a la izquierda, y por lo tanto un valor menor que una no usada durante tres.

Ejemplo resuelto (figura 3-18): seis páginas (de la 0 a la 5), contadores de 8 bits, cinco pulsos de reloj. Los bits R de cada pulso son:

| Pulso | Página 0 | Página 1 | Página 2 | Página 3 | Página 4 | Página 5 |
|---|---|---|---|---|---|---|
| 0 | 1 | 0 | 1 | 0 | 1 | 1 |
| 1 | 1 | 1 | 0 | 0 | 1 | 0 |
| 2 | 1 | 1 | 0 | 1 | 0 | 1 |
| 3 | 1 | 0 | 0 | 0 | 1 | 0 |
| 4 | 0 | 1 | 1 | 0 | 0 | 0 |

Contadores después de cada pulso (correr a la derecha y poner R a la izquierda):

| Página | Tras pulso 0 | Tras pulso 1 | Tras pulso 2 | Tras pulso 3 | Tras pulso 4 |
|---|---|---|---|---|---|
| 0 | 10000000 | 11000000 | 11100000 | 11110000 | 01111000 |
| 1 | 00000000 | 10000000 | 11000000 | 01100000 | 10110000 |
| 2 | 10000000 | 01000000 | 00100000 | 00010000 | 10001000 |
| 3 | 00000000 | 00000000 | 10000000 | 01000000 | 00100000 |
| 4 | 10000000 | 11000000 | 01100000 | 10110000 | 01011000 |
| 5 | 10000000 | 01000000 | 10100000 | 01010000 | 00101000 |

Ejemplo de un paso: la página 2 tiene 00100000 después del pulso 2; en el pulso 3 su R es 0, así que se corre: 00010000; en el pulso 4 su R es 1: se corre (00001000) y se pone un 1 a la izquierda: 10001000.

Errata de la edición en español: en la figura 3-18, la página 2 aparece con 00100000 tras el pulso 3 y 10010000 tras el pulso 4. La cuenta correcta da 00010000 y 10001000. No cambia el resultado del ejemplo.

Si hay un fallo después del pulso 4, se saca la página con el menor contador: la página 3 (00100000, que es 32 en decimal).

Dos diferencias con LRU verdadero:

1. **Se pierde el orden dentro de un pulso.** Las páginas 3 y 5 no se usaron en los dos últimos pulsos y las dos se usaron en el anterior. LRU tendría que elegir entre ellas según cuál se usó último dentro de ese intervalo, pero eso no se registró. Lo único que se puede hacer es sacar la 3, porque la 5 también se usó dos pulsos antes y la 3 no.
2. **El horizonte es finito.** Con 8 bits, dos páginas con contador 0 pueden haberse usado hace 9 pulsos o hace 1000: no hay forma de saberlo. En la práctica alcanza: si un pulso dura unos 20 ms, una página no usada en 160 ms probablemente no sea importante.

### 9.9 Comparación de FIFO, LRU y Óptimo con un mismo ejercicio

Ejemplo resuelto: cadena de referencias 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2 con 3 marcos. Notación: contenido de los tres marcos después de cada referencia; F marca un fallo.

FIFO (sale la que llegó primero):

| Ref. | 7 | 0 | 1 | 2 | 0 | 3 | 0 | 4 | 2 | 3 | 0 | 3 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Marcos | 7 | 7 0 | 7 0 1 | 2 0 1 | 2 0 1 | 2 3 1 | 2 3 0 | 4 3 0 | 4 2 0 | 4 2 3 | 0 2 3 | 0 2 3 | 0 2 3 |
| Fallo | F | F | F | F (sale 7) | – | F (sale 0) | F (sale 1) | F (sale 2) | F (sale 3) | F (sale 0) | F (sale 4) | – | – |

Total FIFO: 10 fallos. Ejemplo del problema de FIFO: en la referencia 3 saca la página 0, que se vuelve a pedir enseguida.

LRU (sale la que hace más tiempo que no se usa):

| Ref. | 7 | 0 | 1 | 2 | 0 | 3 | 0 | 4 | 2 | 3 | 0 | 3 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Marcos | 7 | 7 0 | 7 0 1 | 2 0 1 | 2 0 1 | 2 0 3 | 2 0 3 | 4 0 3 | 4 0 2 | 4 3 2 | 0 3 2 | 0 3 2 | 0 3 2 |
| Fallo | F | F | F | F (sale 7) | – | F (sale 1) | – | F (sale 2) | F (sale 3) | F (sale 0) | F (sale 4) | – | – |

Total LRU: 9 fallos. Razonamiento de la referencia 3: los últimos usos son 0 (recién), 2 (antes) y 1 (hace más tiempo), así que sale la 1.

Óptimo (sale la que se usará más lejos en el futuro, o nunca):

| Ref. | 7 | 0 | 1 | 2 | 0 | 3 | 0 | 4 | 2 | 3 | 0 | 3 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Marcos | 7 | 7 0 | 7 0 1 | 2 0 1 | 2 0 1 | 2 0 3 | 2 0 3 | 2 4 3 | 2 4 3 | 2 4 3 | 2 0 3 | 2 0 3 | 2 0 3 |
| Fallo | F | F | F | F (sale 7) | – | F (sale 1) | – | F (sale 0) | – | – | F (sale 4) | – | – |

Total óptimo: 7 fallos. Razonamiento de la referencia 4: después vienen 2, 3, 0, 3, 2; de las páginas en memoria (2, 0, 3), la que se usa más lejos es la 0, así que sale la 0. En la referencia 2 (la primera de todas), 7 y 1 no se vuelven a usar; se saca la 7.

Conclusión del ejemplo: Óptimo (7) es mejor que LRU (9), y LRU es mejor que FIFO (10). Es el orden esperado.

### 9.10 Segunda oportunidad con tabla de páginas, como en los exámenes de la cátedra

Es el ejercicio que más se toma. Se da una dirección virtual, el tamaño de página y una tabla con estas columnas: N.º de página, tiempo de llegada (de carga), Referenciada (R), Modificada (M), Presente/ausente (P) y N.º de marco. Se pide:

a) Calcular la página de la dirección y, si no está presente, aplicar segunda oportunidad e indicar qué página se reemplaza.
b) Modificar la tabla para reflejar todos los cambios.

Método:

1. Calcular el número de página de la dirección (como en la sección 6.5).
2. Si la página tiene P = 1, no hay fallo: se pone R = 1 y se calcula la dirección física.
3. Si tiene P = 0, hay fallo de página. Se toman **solo las páginas presentes** (P = 1) y se ordenan por tiempo de llegada, de la más vieja a la más nueva.
4. Se mira la más vieja: si R = 1, se le pone R = 0, su tiempo de llegada pasa a ser el actual y va al final de la cola. Se repite con la siguiente.
5. La primera con R = 0 es la víctima. Si su M = 1, hay que escribirla al disco. En la tabla, su P pasa a 0 (y su marco queda libre).
6. La página nueva entra en el marco de la víctima, con P = 1, R = 1 (se la acaba de usar), tiempo de llegada actual, y M = 0 si solo se leyó (M = 1 si la instrucción escribe).
7. Se calcula la dirección física con el marco nuevo.

Según la cátedra, en las resoluciones de la práctica la cola se escribe de la página más nueva (a la izquierda) a la más vieja (a la derecha). Por ejemplo: "21 (1) → 3 (1) → 7 (0) → 27 (1)". La más vieja, 27, tiene R = 1: pasa adelante con R = 0. La siguiente más vieja, 7, tiene R = 0: es la víctima, y la página nueva (23) entra adelante. La cola queda "23 (1) → 27 (0) → 21 (1) → 3 (1)".

Ejemplo resuelto con datos nuevos. Páginas de 1 KB. En el instante 150 se accede a la dirección virtual 0x24C5. La tabla es:

| Página | Llegada | R | M | P | Marco |
|---|---|---|---|---|---|
| 3 | 120 | 1 | 0 | 1 | 8 |
| 7 | 45 | 1 | 1 | 1 | 2 |
| 9 | — | 0 | 0 | 0 | — |
| 12 | 80 | 0 | 1 | 1 | 14 |
| 21 | 30 | 1 | 0 | 1 | 5 |

Resolución:

1. 0x24C5 en binario: 0010 0100 1100 0101. Con 1 KB hay 10 bits de desplazamiento: página = 001001 = 9; desplazamiento = 00 1100 0101 = 197.
2. La página 9 tiene P = 0: hay fallo de página.
3. Páginas presentes ordenadas de más vieja a más nueva: 21 (llegada 30, R = 1), 7 (45, R = 1), 12 (80, R = 0), 3 (120, R = 1).
4. Se mira la 21: R = 1. Se pone R = 0, llegada = 150, y pasa al final.
5. Se mira la 7: R = 1. Se pone R = 0, llegada = 150, y pasa al final.
6. Se mira la 12: R = 0. **Es la víctima.** Como tiene M = 1, hay que escribirla al disco antes de reusar el marco 14. Su P pasa a 0.
7. La página 9 entra en el marco 14 con P = 1, R = 1, M = 0 y llegada 150.
8. Dirección física: marco 14 seguido del desplazamiento: 001110 00 1100 0101 = 0011 1000 1100 0101 = 0x38C5. Comprobación: 14 × 1024 + 197 = 14.533.

Tabla final:

| Página | Llegada | R | M | P | Marco |
|---|---|---|---|---|---|
| 3 | 120 | 1 | 0 | 1 | 8 |
| 7 | 150 | 0 | 1 | 1 | 2 |
| 9 | 150 | 1 | 0 | 1 | 14 |
| 12 | — | 0 | 0 | 0 | — (escrita al disco) |
| 21 | 150 | 0 | 0 | 1 | 5 |

Cola final, de la más vieja a la más nueva: 3, 21, 7, 9. En la notación de la cátedra (de la más nueva a la más vieja): 9 (1) → 7 (0) → 21 (0) → 3 (1).

Errores típicos: considerar páginas ausentes como candidatas; olvidarse de actualizar el tiempo de llegada de las que reciben la segunda oportunidad; olvidarse de que la víctima modificada se escribe al disco; y dar como dirección física el número de página en vez del marco.

### 9.11 Conjunto de trabajo

**Paginación bajo demanda:** en la forma más pura, los procesos arrancan sin ninguna página en memoria. Al buscar la primera instrucción hay un fallo, después otros por las variables globales y la pila, y después de un rato el proceso tiene la mayoría de las páginas que necesita. Las páginas se cargan solo cuando se piden, no por adelantado.

**Localidad de referencia:** la mayoría de los procesos, en cada fase, usan solo una fracción chica de sus páginas (por ejemplo, cada pasada de un compilador usa una parte distinta).

**Conjunto de trabajo** (Denning, 1968): el conjunto de páginas que usa un proceso en un momento dado. Si todo el conjunto de trabajo está en memoria, el proceso corre con pocos fallos hasta que pasa a otra fase. Si la memoria no alcanza para el conjunto de trabajo, el proceso produce muchos fallos y corre lentísimo: una instrucción tarda unos nanosegundos y leer una página del disco unos 10 milisegundos. A una o dos instrucciones cada 10 ms, tardaría una eternidad. **Un programa que produce fallos de página cada pocas instrucciones está sobrepaginando (thrashing, hiperpaginación).**

Cuando un proceso se intercambia al disco y vuelve, técnicamente no hay que hacer nada: dará fallos hasta cargar su conjunto de trabajo. Pero 20, 100 o 1000 fallos cada vez que se carga es lento y desperdicia CPU (procesar un fallo lleva unos milisegundos de CPU). Por eso muchos sistemas llevan la cuenta del conjunto de trabajo de cada proceso y lo cargan **antes** de dejarlo correr: es el **modelo del conjunto de trabajo** (Denning, 1970). Cargar las páginas antes de que se pidan se llama **prepaginación**. El conjunto de trabajo cambia con el tiempo.

**Definición formal:** en un instante t, el conjunto de trabajo w(k, t) es el conjunto de páginas usadas por las k referencias a memoria más recientes. Descripción de la figura 3-19: un gráfico de w(k, t) en función de k que sube muy rápido al principio y después se aplana, casi horizontal, para k grande. La función es no decreciente y tiene un límite finito (un programa no puede usar más páginas de las que tiene). Por eso el contenido del conjunto de trabajo es poco sensible al valor de k: hay un rango amplio de k para el cual no cambia.

Ejemplo del libro: un programa con un ciclo que ocupa dos páginas y datos en cuatro páginas puede usar las seis cada 1000 instrucciones, aunque la última referencia a otra página haya sido un millón de instrucciones antes, en la inicialización.

**Aproximación práctica:** mantener un registro de las últimas k referencias sería carísimo, así que se usa el tiempo de ejecución. El conjunto de trabajo es el conjunto de páginas usadas en los **últimos τ segundos de tiempo virtual**. El **tiempo virtual actual** de un proceso es el tiempo de CPU que usó desde que empezó; solo cuenta su propio tiempo de ejecución. Si un proceso empezó en T y tuvo 40 ms de CPU hasta el tiempo real T + 100 ms, su tiempo virtual es 40 ms.

**Algoritmo de reemplazo basado en el conjunto de trabajo.** Descripción de la figura 3-20: una tabla de páginas donde cada entrada tiene el tiempo de último uso y el bit R. El tiempo virtual actual es 2204. Al costado, el procedimiento: se recorren todas las páginas examinando el bit R; si R = 1, se pone el tiempo de último uso igual al tiempo virtual actual; si R = 0 y la edad es mayor que τ, se elimina la página; si R = 0 y la edad es menor o igual que τ, se recuerda el menor tiempo.

Se supone que el hardware pone R y M y que en cada pulso de reloj se borran los R. En cada fallo se recorre la tabla:

1. Si R = 1, la página se usó en el pulso actual: está en el conjunto de trabajo. Se anota el tiempo virtual actual como tiempo de último uso. No es candidata.
2. Si R = 0, se calcula su **edad** = tiempo virtual actual − tiempo de último uso.
   - Si la edad es mayor que τ, la página ya no está en el conjunto de trabajo: se reemplaza. (La exploración sigue, para actualizar las demás entradas.)
   - Si la edad es menor o igual que τ, sigue en el conjunto, pero se recuerda la de mayor edad.
3. Si se recorre toda la tabla sin candidatas, todas están en el conjunto de trabajo. Si había alguna con R = 0, se saca la más vieja. Si todas tienen R = 1, se saca una al azar, de preferencia limpia.

Ejemplo resuelto. Tiempo virtual actual 2204 y τ = 600. Entradas (tiempo de último uso, R): (2084, 1), (2003, 1), (1980, 1), (1213, 0), (2014, 1), (2020, 1), (2032, 1), (1620, 0).

1. Las seis páginas con R = 1 están en el conjunto de trabajo: su tiempo de último uso pasa a 2204.
2. La página de 1213 tiene R = 0 y edad 2204 − 1213 = 991, mayor que 600: está fuera del conjunto de trabajo y se reemplaza.
3. La página de 1620 tiene R = 0 pero edad 2204 − 1620 = 584, menor o igual que 600: sigue en el conjunto de trabajo.

### 9.12 WSClock

El algoritmo básico del conjunto de trabajo es incómodo, porque recorre toda la tabla en cada fallo. **WSClock** (Carr y Hennessey, 1981) se basa en el reloj pero usa la información del conjunto de trabajo. Por su simplicidad y buen rendimiento, es muy usado en la práctica.

Estructura: una lista circular de marcos, como en el reloj. Al principio está vacía; cada página que se carga se agrega al anillo. Cada entrada tiene el tiempo de último uso, el bit R y el bit M.

En cada fallo se examina la página a la que apunta la manecilla:

1. Si R = 1, la página se usó en el pulso actual: no es buena candidata. Se pone R = 0, se avanza la manecilla y se repite.
2. Si R = 0, la edad es mayor que τ y la página está **limpia**: no está en el conjunto de trabajo y hay una copia válida en disco. Se reclama el marco y la nueva página se pone ahí.
3. Si R = 0, la edad es mayor que τ pero la página está **sucia**: no se puede reclamar de inmediato. Se **planifica la escritura al disco** (sin bloquear al proceso), se avanza la manecilla y se sigue buscando, porque más adelante podría haber una página vieja y limpia.

Para no saturar el disco, se puede limitar la cantidad de escrituras planificadas a n páginas.

Si la manecilla vuelve al punto de partida:

- Si se planificó al menos una escritura, la manecilla sigue moviéndose hasta encontrar una página limpia: en algún momento terminará una escritura y su página quedará limpia. No necesariamente es la primera planificada, porque el controlador de disco puede reordenar las escrituras.
- Si no se planificó ninguna escritura, todas las páginas están en el conjunto de trabajo. Se reclama cualquier página limpia (se puede ir anotando durante el recorrido). Si no hay ninguna limpia, se elige la página actual como víctima y se escribe al disco.

Descripción de la figura 3-21: cuatro estados de un anillo de ocho páginas con (tiempo de último uso, R) y tiempo virtual actual 2204. (a) La manecilla apunta a una página con 2014 y R = 1. (b) Se pone su R en 0 y la manecilla avanza. (c) La manecilla apunta a una página con 1213 y R = 0, vieja. (d) Esa página se reemplaza por la nueva, que queda con 2204 y R = 1.

### 9.13 Resumen de los algoritmos

Descripción de la figura 3-22, una tabla de dos columnas:

| Algoritmo | Comentario |
|---|---|
| Óptimo | No se puede implementar, pero es útil como punto de comparación |
| NRU (no usadas recientemente) | Una aproximación muy burda del LRU |
| FIFO | Podría descartar páginas importantes |
| Segunda oportunidad | Gran mejora sobre FIFO |
| Reloj | Realista |
| LRU (menos usadas recientemente) | Excelente, pero difícil de implementar con exactitud |
| NFU (no utilizadas frecuentemente) | Aproximación a LRU bastante burda |
| Envejecimiento | Algoritmo eficiente que se aproxima bien a LRU |
| Conjunto de trabajo | Muy costoso de implementar |
| WSClock | Algoritmo eficientemente bueno |

Conclusión del libro: los dos mejores algoritmos son el **envejecimiento** (basado en LRU) y **WSClock** (basado en el conjunto de trabajo). Los dos rinden bien y se implementan con eficiencia.

Según la cátedra: el óptimo es solo una referencia teórica; NRU es simple, barato pero burdo; FIFO casi no se usa; segunda oportunidad degenera en FIFO si todas tienen R = 1; el reloj hace lo mismo sin mover páginas; LRU es una excelente aproximación al óptimo pero difícil de implementar exactamente; NFU no olvida el pasado; envejecimiento es eficiente y realista; el conjunto de trabajo es conceptualmente muy bueno pero costoso; WSClock es eficiente, realista y muy usado.

(Tanenbaum, cap. 3.4, págs. 201–215, figs. 3-15 a 3-22) (Apunte: resumen de la cátedra, 3.4.1 a 3.4.9) (Apunte: práctica resuelta, págs. 1 y 14; exámenes de la cátedra)

---

## 10. Cuestiones de diseño y sobrepaginación (programa 3.4)

Conocer los algoritmos es como saber mover las piezas de ajedrez; diseñar un buen sistema de paginación es como saber jugar.

### 10.1 Asignación local contra global

Descripción de la figura 3-23: tres procesos (A, B y C) con sus páginas y la edad de cada una. (a) La configuración original: A tiene seis páginas (A0 a A5), B siete (B0 a B6) y C tres (C1 a C3). (b) Reemplazo local: A tiene un fallo por la página A6, y se saca la página de menor edad de A, que es A5. (c) Reemplazo global: se saca la página de menor edad de toda la memoria, que es B3 (edad 2), y A6 ocupa su lugar.

- **Algoritmo local:** le da a cada proceso una fracción fija de la memoria.
- **Algoritmo global:** reparte los marcos dinámicamente; la cantidad de marcos de cada proceso varía con el tiempo.

En general, los algoritmos globales funcionan mejor, sobre todo cuando el conjunto de trabajo varía. Con un algoritmo local, si el conjunto de trabajo crece, hay sobrepaginación aunque haya muchos marcos libres; si se achica, se desperdicia memoria.

Con un algoritmo global hay que decidir continuamente cuántos marcos tiene cada proceso:

- Supervisar el conjunto de trabajo con los bits de envejecimiento no evita la sobrepaginación necesariamente, porque el conjunto de trabajo cambia en microsegundos y los bits son una medida burda.
- **Partes iguales.** Ejemplo resuelto: 12.416 marcos disponibles y 10 procesos. 12.416 / 10 = 1241 marcos cada uno, y sobran 6 para una reserva usada en los fallos.
- **Proporcional al tamaño:** no tiene sentido darle lo mismo a un proceso de 10 KB que a uno de 300 KB; con asignación proporcional, el de 300 KB recibe 30 veces más.
- Conviene un **mínimo** por proceso: en algunas máquinas, una instrucción de dos operandos puede necesitar hasta seis páginas (la instrucción, el origen y el destino pueden cruzar límites de página). Con cinco páginas, el programa no podría ejecutarse.

**Algoritmo PFF (Page Fault Frequency, frecuencia de fallos de página):** indica cuándo aumentar o disminuir la asignación de un proceso, pero no dice qué página reemplazar. Se basa en que, para muchos algoritmos (incluido LRU), la tasa de fallos baja cuando se dan más marcos. Descripción de la figura 3-24: una curva decreciente de fallos por segundo en función de los marcos asignados, con dos líneas horizontales punteadas. La línea A marca una tasa demasiado alta: el proceso recibe más marcos. La línea B marca una tasa tan baja que el proceso tiene memoria de más: se le pueden quitar marcos. La tasa se mide contando fallos por segundo, por ejemplo promediando el último segundo con la media anterior y dividiendo por dos.

Algunos algoritmos sirven con las dos políticas: FIFO o LRU pueden sacar la página más vieja (o la menos usada) de toda la memoria o solo del proceso. En cambio, el conjunto de trabajo y WSClock solo tienen sentido como locales, porque se refieren a un proceso: no hay un conjunto de trabajo de la máquina entera.

### 10.2 Control de carga

Aun con el mejor algoritmo y una asignación óptima, el sistema puede sobrepaginar: pasa siempre que **la suma de los conjuntos de trabajo de todos los procesos supera la memoria**. Síntoma: el PFF indica que algunos procesos necesitan más memoria y ninguno necesita menos.

La única solución real es **deshacerse temporalmente de algunos procesos**: intercambiar algunos al disco y repartir sus marcos entre los que sobrepaginan. Si la sobrepaginación sigue, se intercambia otro, y así hasta que se detenga. Así, incluso con paginación sigue haciendo falta el intercambio, pero ahora para reducir la demanda de memoria, no para reclamar páginas. Es parecido a la planificación de dos niveles: algunos procesos van al disco y un planificador de corto plazo planifica a los demás.

Pero también hay que cuidar el **grado de multiprogramación**: si quedan muy pocos procesos en memoria, la CPU puede quedar inactiva mucho tiempo. Para elegir qué proceso intercambiar, hay que mirar su tamaño, su tasa de paginación y si está limitado por CPU o por E/S.

### 10.3 Tamaño de página

El sistema operativo a menudo puede elegir el tamaño de página: con páginas de hardware de 512 bytes, puede tratar los pares 0 y 1, 2 y 3, etc., como páginas de 1 KB.

A favor de páginas **chicas**:

- **Fragmentación interna:** un segmento de texto, datos o pila no llena un número entero de páginas; en promedio, la mitad de la última página queda vacía. Con n segmentos en memoria y páginas de p bytes, se desperdician n × p / 2 bytes.
- Un programa de ocho fases de 4 KB cada una necesita 32 KB todo el tiempo con páginas de 32 KB, 16 KB con páginas de 16 KB, y solo 4 KB con páginas de 4 KB o menos. Las páginas grandes dejan más partes sin usar en memoria.

A favor de páginas **grandes**:

- Las páginas chicas implican tablas de páginas grandes: un programa de 32 KB necesita 4 páginas de 8 KB, pero 64 de 512 bytes.
- Las transferencias de disco son de a una página, y casi todo el tiempo es búsqueda y rotación: transferir una página chica tarda casi lo mismo que una grande. Cargar 64 páginas de 512 bytes puede tardar 64 × 10 ms, y cuatro páginas de 8 KB, 4 × 12 ms.
- En algunas máquinas la tabla se carga en registros en cada cambio de proceso, y con páginas chicas tarda más.

Análisis matemático: con procesos de s bytes, páginas de p bytes y entradas de e bytes, cada proceso necesita s / p páginas, que ocupan s × e / p bytes de tabla. La fragmentación interna de la última página es p / 2. La sobrecarga total es:

sobrecarga = s × e / p + p / 2

El primer término es grande con páginas chicas; el segundo, con páginas grandes. Derivando con respecto a p e igualando a cero: −s × e / p² + 1/2 = 0, de donde el tamaño de página óptimo es:

p = √(2 × s × e)

Ejemplo resuelto del libro: s = 1 MB y e = 8 bytes.

1. 2 × s × e = 2 × 1.048.576 × 8 = 16.777.216.
2. Raíz cuadrada: 4096. El tamaño óptimo es 4 KB.
3. Comprobación de la sobrecarga con p = 4096: s × e / p = 8.388.608 / 4096 = 2048 bytes de tabla, más p / 2 = 2048 bytes de fragmentación: 4096 bytes en total.

Las computadoras comerciales usaron de 512 bytes a 64 KB. Antes era común 1 KB; hoy, 4 KB u 8 KB. Las páginas crecen con la memoria, pero no en forma lineal: cuadruplicar la RAM rara vez duplica el tamaño de página.

### 10.4 Espacios separados de instrucciones y datos

Descripción de la figura 3-25: (a) un solo espacio de direcciones de 0 a 2³² con el programa abajo y los datos arriba. (b) Dos espacios separados, cada uno de 0 a 2³²: el espacio I (instrucciones, con el programa) y el espacio D (datos).

La PDP-11 introdujo los espacios I y D separados. Cada uno se pagina por separado, con su propia tabla de páginas. El hardware usa la tabla del espacio I para traer instrucciones y la del espacio D para los datos. El enlazador tiene que saberlo, porque los datos se reubican a partir de la dirección virtual 0. No agrega complicaciones y duplica el espacio de direcciones disponible.

### 10.5 Páginas compartidas y copiar en escritura

Si varios usuarios ejecutan el mismo programa, conviene compartir sus páginas para no tener dos copias. Pero solo se pueden compartir las páginas de solo lectura, como el texto del programa, no las de datos.

Con espacios I y D separados es fácil: los procesos comparten la tabla de páginas del espacio I y cada uno tiene su propia tabla para el espacio D. Descripción de la figura 3-26: la tabla de procesos tiene dos entradas; las dos apuntan a la misma tabla de páginas del programa, y cada una apunta a su propia tabla de datos (Datos 1 y Datos 2). Cada proceso tiene en la tabla de procesos dos punteros, uno a la tabla del espacio I y otro a la del espacio D.

Problemas: si los procesos A y B comparten el editor y el planificador saca a A de la memoria, B tendrá muchos fallos para traer las páginas de vuelta. Y cuando A termina, hay que saber que las páginas siguen en uso para no liberar su espacio de disco. Se necesitan estructuras especiales para llevar la cuenta de las páginas compartidas.

**Copiar en escritura:** después de un fork en UNIX, padre e hijo tienen que compartir el texto y los datos. En un sistema paginado, cada uno recibe su propia tabla de páginas, pero las dos apuntan al mismo conjunto de páginas: no se copia nada en el fork. Todas las páginas de datos se mapean como SOLO LECTURA en los dos procesos. Mientras solo lean, todo sigue así. Cuando uno escribe, la violación de la protección produce un trap; el sistema hace una copia de esa página para que cada uno tenga la suya, y las dos copias pasan a LECTURA-ESCRITURA. Las páginas que nunca se modifican (incluidas todas las del programa) nunca se copian. Mejora el rendimiento porque reduce el copiado.

### 10.6 Bibliotecas compartidas

Si un programa se inicia dos veces, la mayoría de los sistemas comparten automáticamente sus páginas de texto. Lo mismo se puede hacer con las bibliotecas.

Enlace tradicional (estático): un comando como ld *.o -lc -lm enlaza todos los archivos objeto del directorio y busca en las bibliotecas /usr/lib/libc.a y /usr/lib/libm.a las funciones que se llaman pero no están (las **externas indefinidas**, como printf, que a su vez necesita write). Las funciones encontradas se incluyen en el ejecutable. Si cientos de programas se enlazaran estáticamente con 20 a 50 MB de bibliotecas gráficas, se desperdiciaría muchísimo disco y RAM.

**Bibliotecas compartidas** (DLL, bibliotecas de enlace dinámico, en Windows): el enlazador incluye una pequeña rutina auxiliar que enlaza la función en tiempo de ejecución. La biblioteca se carga al cargar el programa o la primera vez que se llama a una función. Si otro programa ya la cargó, no se vuelve a cargar. Y no se carga entera: se pagina de a una página a medida que se necesita.

Ventajas: ejecutables más chicos, ahorro de memoria, y si se corrige un error en una función de la biblioteca no hay que recompilar los programas (por ejemplo, Windows Update reemplaza una DLL y todos los programas la usan la próxima vez que se inician).

Problema: descripción de la figura 3-27: dos procesos comparten una biblioteca de 20 KB. En el proceso 1 empieza en la dirección 36 K y en el proceso 2 en la 12 K. Si la primera función salta a la dirección 16 de la biblioteca, en el proceso 1 el salto debería ir a 36 K + 16 y en el proceso 2 a 12 K + 16. Si se reubicara al cargarla, no se podría compartir. La solución es compilar la biblioteca con una bandera especial para que use solo direcciones relativas ("saltar n bytes hacia adelante"). Ese código se llama **código independiente de la posición**.

### 10.7 Archivos asociados a memoria

Las bibliotecas compartidas son un caso de una herramienta más general: un proceso puede hacer una llamada al sistema para **asociar un archivo a una parte de su espacio de direcciones virtuales**. Las páginas no se traen al asociar, sino bajo demanda, usando el archivo como almacén de respaldo. Cuando el proceso termina o desasocia el archivo, las páginas modificadas se escriben de vuelta. Es un modelo alternativo de E/S: el archivo se accede como un gran arreglo en memoria. Si dos procesos asocian el mismo archivo, se pueden comunicar por memoria compartida con mucho ancho de banda.

### 10.8 Política de limpieza

La paginación funciona mejor si hay muchos marcos libres. Si todos están ocupados y modificados, antes de traer una página hay que escribir otra al disco.

Por eso muchos sistemas tienen un **demonio de paginación**, un proceso en segundo plano que duerme casi siempre y se despierta periódicamente. Si hay pocos marcos libres, empieza a seleccionar páginas para desalojar con algún algoritmo de reemplazo y escribe al disco las modificadas. Se recuerda el contenido anterior de cada página liberada: si se vuelve a necesitar antes de que se sobrescriba, se recupera de la reserva. Así, los marcos libres están limpios y no hay que escribirlos con apuro.

Implementación con un **reloj de dos manecillas**: la manecilla principal la mueve el demonio; si apunta a una página sucia, la escribe al disco y avanza; si apunta a una limpia, solo avanza. La manecilla secundaria reemplaza páginas como en el reloj estándar, y ahora tiene más probabilidad de encontrar páginas limpias.

### 10.9 Interfaz de memoria virtual

En algunos sistemas avanzados, el programador tiene cierto control sobre el mapa de memoria:

- **Memoria compartida con nombre:** un proceso le da a otro el nombre de una región para que también la asocie. Permite compartir con mucho ancho de banda.
- **Mensajes de alto rendimiento:** en vez de copiar los datos, el emisor desasocia las páginas del mensaje y el receptor las asocia. Solo se copian los nombres de las páginas.
- **Memoria compartida distribuida:** varios procesos comparten páginas a través de la red. Un fallo de página hace que el manejador localice la máquina que tiene la página y se la pida por la red.

(Tanenbaum, cap. 3.5, págs. 215–227, figs. 3-23 a 3-27)

---

## 11. Cuestiones de implementación y manejo del fallo de página (programa 3.4)

### 11.1 Cuándo trabaja el sistema operativo con la paginación

Hay cuatro momentos:

1. **Al crear un proceso:** determinar el tamaño inicial del programa y los datos, crear e inicializar la tabla de páginas (tiene que estar en memoria cuando el proceso corre, no cuando está intercambiado), reservar espacio en el área de intercambio del disco e inicializarla con el texto y los datos (algunos sistemas paginan el texto directamente desde el ejecutable), y registrar todo en la tabla de procesos.
2. **Al ejecutar un proceso:** restablecer la MMU para el nuevo proceso, **vaciar el TLB** de los restos del anterior y cargar su tabla de páginas (copiándola o con un puntero en un registro). Opcionalmente, prepaginar algunas páginas (la que apunta el PC seguro hará falta).
3. **Al ocurrir un fallo de página:** leer los registros de hardware para saber qué dirección falló, calcular la página, ubicarla en el disco, buscar un marco (desalojando si hace falta), leer la página, retroceder el PC a la instrucción que falló y reejecutarla.
4. **Al terminar un proceso:** liberar su tabla de páginas, sus páginas y su espacio en disco. Las páginas compartidas se liberan solo cuando termina el último proceso que las usa.

### 11.2 Manejo de un fallo de página, paso a paso

Esta secuencia se toma en los exámenes y conviene saberla en orden:

1. **El hardware hace un trap al kernel**, guardando el contador de programa en la pila. En la mayoría de las máquinas, también guarda información sobre el estado de la instrucción actual en registros especiales.
2. **Una rutina en ensamblador guarda los registros generales** y demás información volátil, para que el sistema no la destruya. Esta rutina llama al sistema operativo como un procedimiento.
3. **El sistema descubre que hubo un fallo de página y averigua qué página virtual se necesita.** A menudo un registro de hardware lo dice; si no, el sistema toma el PC, busca la instrucción y la analiza por software.
4. **El sistema comprueba si la dirección es válida y si la protección es consistente con el acceso.** Si no, el proceso recibe una señal o se elimina. Si es válida, busca un marco libre; si no hay, ejecuta el algoritmo de reemplazo para elegir una víctima.
5. **Si el marco elegido está sucio, se planifica su escritura al disco** y hay un cambio de contexto: el proceso que falló se suspende y corre otro hasta que termina la transferencia. En cualquier caso, el marco se marca como ocupado.
6. **Cuando el marco está limpio, el sistema busca la dirección de disco de la página necesaria y planifica su lectura.** Mientras se carga, el proceso sigue suspendido y corre otro si hay.
7. **Cuando la interrupción de disco avisa que llegó la página, se actualizan las tablas de páginas** y el marco vuelve a estado normal.
8. **La instrucción que falló se retrocede** al estado en que estaba cuando empezó, y el PC se restablece para apuntar a ella.
9. **El proceso que falló se planifica** y el sistema vuelve a la rutina en ensamblador que lo llamó.
10. **La rutina recarga los registros** y demás información de estado y vuelve al espacio de usuario, como si no hubiera ocurrido el fallo.

Según la cátedra, en una línea: trap, identificar la página, validar, elegir el marco, escribir si está sucio, leer la página, actualizar las tablas y reintentar la instrucción.

Relación con la Unidad 2: los pasos 1 y 2 son los mismos que en cualquier interrupción (fig. 2-5): el hardware guarda el PC y una rutina en ensamblador guarda los registros. Y mientras se espera el disco, el proceso queda bloqueado y el planificador elige a otro.

### 11.3 Respaldo de instrucción

Reiniciar la instrucción que falló es más fácil de decir que de hacer. Descripción de la figura 3-28: una instrucción del Motorola 680x0, MOVE.L #6(A1), 2(A0), de 6 bytes, que empieza en la dirección 1000: en 1000 está el código de operación, en 1002 el primer operando (6) y en 1004 el segundo (2). Hace tres referencias a memoria.

Según cuál de las tres provocó el fallo, el PC puede valer 1000, 1002 o 1004, y a menudo el sistema no puede saber dónde empezaba la instrucción: si vale 1002, ¿esa palabra es un operando de la instrucción de 1000 o el código de operación de otra? Peor todavía con los modos de **autoincremento** y **autodecremento**: según el microcódigo, el registro se pudo haber incrementado antes o después de la referencia que falló, y el sistema tiene que deshacerlo o no.

Algunas CPU resuelven esto con un **registro interno oculto** donde se copia el PC antes de cada instrucción, y otro que indica qué registros ya se incrementaron o decrementaron y cuánto. Si no, el sistema tiene que hacer peripecias.

### 11.4 Bloqueo de páginas en memoria (pinning)

Un proceso pide leer un archivo a un búfer en su espacio de direcciones y se suspende. Otro proceso tiene un fallo de página. Con un algoritmo global, existe una pequeña probabilidad de que se elija como víctima justo la página del búfer. Si un dispositivo estaba haciendo una transferencia por DMA a esa página, parte de los datos irían al búfer y parte a la página nueva.

Soluciones: **bloquear (fijar) en memoria** las páginas involucradas en E/S para que no se desalojen, o hacer toda la E/S a búferes del kernel y después copiar a las páginas del usuario.

### 11.5 Almacén de respaldo

Dónde se guarda una página en el disco cuando sale de la memoria:

- **Partición de intercambio:** lo más simple, en un disco separado del sistema operativo si se puede (para balancear la E/S). La mayoría de los UNIX funcionan así. No tiene un sistema de archivos normal: se usan números de bloque relativos al inicio de la partición. Se administra como una lista de trozos libres. Cada proceso tiene asociada la dirección de su área de intercambio (en la tabla de procesos). La dirección de una página es el inicio del área más el desplazamiento de la página dentro del espacio virtual.
- El área se puede inicializar copiando toda la imagen del proceso, o cargando todo el proceso en memoria y dejando que se pagine hacia afuera.
- Como los datos y la pila pueden crecer, puede convenir reservar áreas separadas para texto, datos y pila.
- El otro extremo es no reservar nada de antemano: asignar espacio en el disco a cada página cuando sale y liberarlo cuando vuelve. Requiere una tabla por proceso que diga dónde está cada página en el disco.

Descripción de la figura 3-29: (a) **Área de intercambio estática:** una tabla de páginas de ocho páginas; las páginas 0, 3, 4 y 6 están en memoria y las 1, 2, 5 y 7 en disco. El área de intercambio es tan grande como el espacio virtual (ocho páginas) y cada página tiene una posición fija en ella. Una página en memoria siempre tiene una copia sombra en el disco, que puede estar desactualizada si se modificó. (b) **Respaldo dinámico:** las páginas no tienen posición fija; cuando una sale, se elige un lugar vacío y se actualiza un **mapa del disco** con una dirección por página virtual. Una página en memoria no tiene copia en disco.

Si no hay partición disponible, se usan archivos dentro del sistema de archivos normal (así lo hace Windows). Optimización: como el texto del programa es de solo lectura, sus páginas no se escriben al disco: se descartan y se vuelven a leer del ejecutable. Lo mismo con las bibliotecas compartidas.

### 11.6 Separación de política y mecanismo

El principio de separar política de mecanismo (visto en la Unidad 1 y en la Unidad 2) se aplica a la memoria haciendo que la mayor parte del administrador corra como un proceso de usuario. Se hizo por primera vez en Mach.

El sistema se divide en tres partes:

1. Un **manejador de la MMU** de bajo nivel: dependiente de la máquina, hay que reescribirlo para cada plataforma.
2. Un **manejador de fallos de página** dentro del kernel: independiente de la máquina, tiene la mayor parte del mecanismo.
3. Un **paginador externo** en espacio de usuario: determina la política.

Descripción de la figura 3-30 (seis pasos numerados): (1) el proceso de usuario tiene un fallo de página y entra al manejador de fallos en el kernel; (2) el manejador le pide la página necesaria al paginador externo, en espacio de usuario; (3) el paginador pide la página al disco; (4) llega la página; (5) el paginador le dice al manejador "aquí está la página"; (6) el manejador le pide al manejador de la MMU que asocie la página en el espacio del proceso.

Problema: dónde poner el algoritmo de reemplazo. Sería más limpio en el paginador externo, pero este no tiene acceso a los bits R y M. Ventaja: código más modular y flexible. Desventaja: la sobrecarga de cruzar varias veces la frontera usuario-kernel y de los mensajes. A medida que las computadoras son más rápidas, sacrificar algo de rendimiento por confiabilidad probablemente sea aceptable.

(Tanenbaum, cap. 3.6, págs. 227–234, figs. 3-28 a 3-30) (Apunte: resumen de la cátedra, 3.6.2)

---

## 12. Segmentación (programa 3.5)

### 12.1 El problema de una memoria unidimensional

La memoria virtual vista hasta ahora es unidimensional: las direcciones van de 0 a un máximo, una detrás de otra. Para muchos problemas es mejor tener varios espacios separados.

Ejemplo del libro: un compilador tiene varias tablas que crecen durante la compilación:

1. el texto del código fuente (para el listado impreso);
2. la tabla de símbolos, con los nombres y atributos de las variables;
3. la tabla de constantes enteras y de punto flotante;
4. el árbol de análisis sintáctico;
5. la pila de llamadas a procedimientos del compilador.

Las cuatro primeras crecen continuamente; la pila crece y se achica de forma impredecible. Descripción de la figura 3-31: un único espacio de direcciones virtuales dividido en cinco trozos contiguos, de abajo hacia arriba: texto del código fuente, tabla de símbolos, tabla de constantes, árbol de análisis sintáctico y pila de llamadas. La tabla de símbolos creció hasta toparse con la tabla del texto fuente, mientras que el espacio asignado al árbol todavía tiene lugar libre.

Si un programa tiene muchas más variables de lo normal, la tabla de símbolos se llena aunque sobre lugar en las otras. El compilador podría dar un error ("demasiadas variables"), lo cual "no parece muy deportivo". O podría "jugar a Robin Hood", sacándoles espacio a las tablas que sobran para dárselo a las que faltan: es como administrar sobrepuestos a mano.

### 12.2 La solución: segmentos

Se le dan a la máquina muchos espacios de direcciones completamente independientes, llamados **segmentos**. Cada segmento es una secuencia lineal de direcciones desde 0 hasta un máximo. Los segmentos pueden tener longitudes distintas (y en general las tienen), y la longitud puede cambiar durante la ejecución: la pila crece cuando se mete algo y se achica cuando se saca. Como cada segmento es un espacio aparte, pueden crecer o achicarse sin afectarse.

Una dirección en una memoria segmentada (bidimensional) tiene **dos partes: número de segmento y dirección dentro del segmento**.

Descripción de la figura 3-32: cinco segmentos independientes, uno para cada tabla del compilador: segmento 0, tabla de símbolos; segmento 1, texto fuente; segmento 2, constantes; segmento 3, árbol de análisis sintáctico; segmento 4, pila de llamadas. Cada uno tiene su propia escala desde 0K (hasta 4K, 8K, 12K, 16K o 20K según el tamaño).

Un segmento es una **entidad lógica que el programador conoce**: puede contener un procedimiento, un arreglo, una pila o un conjunto de variables, pero por lo general no una mezcla.

### 12.3 Ventajas de la segmentación

1. **Crecimiento independiente** de las estructuras de datos, sin choques.
2. **Vinculación más simple:** si cada procedimiento está en su propio segmento, empezando en 0, la llamada al procedimiento del segmento n usa la dirección (n, 0). Si el procedimiento se modifica y se recompila, aunque crezca, no hay que cambiar los demás. En una memoria unidimensional, los procedimientos están pegados uno al lado del otro; si uno cambia de tamaño, cambian las direcciones de inicio de otros, y hay que modificar a todos los que los llaman.
3. **Compartición:** por ejemplo, una biblioteca gráfica en un segmento compartido por varios procesos. Con paginación pura también se puede, pero es más complicado: en realidad se simula la segmentación.
4. **Protección por tipo de contenido:** un segmento de procedimiento puede ser de solo ejecución (no se puede leer ni escribir); un arreglo de punto flotante, de lectura y escritura pero no ejecutable (saltar a él produce un trap). Sirve para atrapar errores de programación.

¿Por qué la protección tiene sentido con segmentos y no con páginas? Porque en una memoria segmentada el usuario sabe qué hay en cada segmento: un segmento tiene un solo tipo de objeto. **El contenido de una página es, en cierto sentido, accidental**: el programador ni siquiera sabe que hay paginación. Para proteger por página tendría que saber dónde caen los límites de página, que es justamente lo que la paginación quería evitar.

### 12.4 Paginación contra segmentación

Descripción de la figura 3-33, una tabla comparativa:

| Consideración | Paginación | Segmentación |
|---|---|---|
| ¿El programador tiene que saber que se usa esta técnica? | No | Sí |
| ¿Cuántos espacios de direcciones lineales hay? | 1 | Muchos |
| ¿El espacio total puede superar la memoria física? | Sí | Sí |
| ¿Se pueden distinguir y proteger por separado procedimientos y datos? | No | Sí |
| ¿Se acomodan fácilmente las tablas que cambian de tamaño? | No | Sí |
| ¿Se facilita compartir procedimientos entre usuarios? | No | Sí |
| ¿Para qué se inventó? | Para tener un gran espacio lineal sin comprar más memoria física | Para dividir programas y datos en espacios lógicamente independientes, ayudando a compartir y proteger |

### 12.5 Implementación de la segmentación pura y fragmentación externa

La diferencia esencial con la paginación: **las páginas tienen tamaño fijo y los segmentos no.**

Descripción de la figura 3-34 (cinco estados de la memoria física):

- (a) Cinco segmentos: 0 (4 K), 1 (8 K), 2 (5 K), 3 (8 K) y 4 (7 K).
- (b) Se desaloja el segmento 1 y en su lugar entra el 7 (5 K), más chico: queda un hueco de 3 K entre el 7 y el 2.
- (c) El segmento 4 (7 K) se reemplaza por el 5 (4 K): queda otro hueco de 3 K.
- (d) El segmento 3 (8 K) se reemplaza por el 6 (4 K): queda un hueco de 4 K.
- (e) Compactación: se mueven los segmentos y los huecos se juntan en uno de 10 K.

Con el tiempo, la memoria queda dividida en trozos, unos con segmentos y otros con huecos. Ese fenómeno se llama **efecto de tablero de ajedrez** o **fragmentación externa**: se desperdicia memoria en los huecos. Se puede resolver con **compactación**, que es costosa.

Para distinguir bien:

- **Fragmentación interna:** desperdicio dentro de lo asignado. Pasa con páginas (la última página de un segmento queda a medio llenar, en promedio p / 2) y con el sistema de colegas (65 páginas ocupan 128).
- **Fragmentación externa:** desperdicio en los huecos entre lo asignado. Pasa con segmentos y con particiones variables.

(Tanenbaum, cap. 3.7 y 3.7.1, págs. 234–238, figs. 3-31 a 3-34) (Apunte: resumen de la cátedra, 3.7)

---

## 13. Sistemas combinados: segmentación con paginación (programa 3.6)

### 13.1 MULTICS

Si los segmentos son grandes, puede ser incómodo o imposible tenerlos enteros en memoria. La idea es **paginar los segmentos**, para que solo estén en memoria las páginas que se usan. El primer sistema que lo hizo fue MULTICS.

MULTICS corría en las Honeywell 6000. Cada programa tenía una memoria virtual de hasta 2¹⁸ segmentos (más de 250.000), de hasta 65.536 palabras de 36 bits cada uno. Cada segmento se trata como una memoria virtual y se pagina: se combinan las ventajas de la paginación (tamaño de página uniforme y no tener que tener todo el segmento en memoria) con las de la segmentación (facilidad de programación, modularidad, protección y compartición).

**Tabla de segmentos:** cada programa tiene una tabla de segmentos con un **descriptor** por segmento. Como puede tener más de un cuarto de millón de entradas, la tabla misma es un segmento y está paginada.

Cada descriptor contiene: si el segmento está en memoria (si alguna parte está, se considera en memoria y su tabla de páginas también); un puntero de 18 bits a su tabla de páginas (las direcciones físicas son de 24 bits y las páginas se alinean a 64 bytes, así que los 6 bits de abajo son siempre 0); el tamaño del segmento; los bits de protección; y otros bits. La dirección del segmento en el disco **no** está en el descriptor, sino en otra tabla que usa el manejador de fallos de segmento.

Descripción de la figura 3-35: (a) el segmento del descriptor (una columna de descriptores del 0 al 6, de 36 bits cada uno) apunta a las tablas de páginas de los segmentos 1 y 3, cada una con sus entradas de página. (b) Un descriptor de segmento, con campos de 18 bits (dirección de la tabla de páginas en memoria principal), 9 bits (longitud del segmento en páginas), tres bits sueltos (tamaño de página: 0 = 1024 palabras, 1 = 64 palabras; si el segmento está paginado o no; y bits varios) y 3 bits de protección.

El tamaño normal de página es de 1024 palabras (algunos segmentos del propio MULTICS no se paginan o usan páginas de 64 palabras, para ahorrar memoria).

**Dirección de MULTICS.** Descripción de la figura 3-36: una dirección virtual de 34 bits con tres campos: número de segmento (18 bits), número de página (6 bits) y desplazamiento dentro de la página (10 bits). Los dos últimos forman la dirección dentro del segmento.

**Algoritmo de traducción (paso a paso):**

1. El número de segmento se usa para encontrar el descriptor.
2. Se comprueba si la tabla de páginas del segmento está en memoria. Si está, se localiza; si no, hay un **fallo de segmento**. Si hay una violación de protección, hay un trap.
3. Se examina la entrada de la tabla de páginas de la página pedida. Si la página no está en memoria, hay un fallo de página. Si está, se obtiene la dirección de inicio de la página en memoria.
4. Se suma el desplazamiento al origen de la página para obtener la dirección de la palabra.
5. Se hace la lectura o el almacenamiento.

Descripción de la figura 3-37: la dirección virtual (segmento, página, desplazamiento). El número de segmento entra al segmento del descriptor y saca un descriptor, que apunta a la tabla de páginas. El número de página entra a esa tabla y saca el marco. El desplazamiento se suma para llegar a la palabra. (Por simplicidad se omite que el segmento del descriptor también está paginado: un registro base del descriptor apunta a su tabla de páginas.)

**TLB de MULTICS:** hacer todo eso en cada instrucción sería lentísimo. El hardware tiene un TLB de 16 palabras que busca en todas sus entradas en paralelo. Descripción de la figura 3-38: una tabla con columnas número de segmento, página virtual (el campo de comparación), marco de página, protección (lectura/escritura, solo lectura, solo ejecución), edad y si la entrada está en uso. Si la dirección está en el TLB, se obtiene el marco directamente. Se guardan las 16 páginas usadas más recientemente; los programas cuyo conjunto de trabajo es menor que el TLB corren eficientemente. Si no está, se recorre el descriptor y la tabla de páginas, se actualiza el TLB y se descarta la entrada usada menos recientemente (el campo edad lleva esa cuenta).

### 13.2 Intel Pentium

La memoria virtual del Pentium se parece en muchas cosas a MULTICS. MULTICS tiene 256 K segmentos de hasta 64 K palabras de 36 bits; el Pentium tiene 16 K segmentos de hasta mil millones de palabras de 32 bits. Hay menos segmentos, pero más grandes, lo cual es mejor: pocos programas necesitan más de 1000 segmentos y muchos necesitan segmentos grandes.

**Dos tablas:**

- **LDT (tabla de descriptores locales):** una por programa; describe los segmentos locales (código, datos, pila).
- **GDT (tabla de descriptores globales):** una sola, compartida por todos los programas; describe los segmentos del sistema, incluido el sistema operativo.

**Selectores.** Para acceder a un segmento, el programa carga un **selector** en uno de los seis registros de segmento. El registro CS tiene el selector del segmento de código y el DS el del segmento de datos. Descripción de la figura 3-39: un selector de 16 bits con tres campos: índice (13 bits), un bit que indica GDT (0) o LDT (1), y nivel de privilegio (2 bits, de 0 a 3).

- Los 13 bits de índice limitan cada tabla a 8 K descriptores.
- El descriptor 0 está prohibido: se puede cargar en un registro para indicar que no está disponible, pero si se usa produce un trap.
- Cuando se carga un selector, el descriptor se trae de la LDT o la GDT y se guarda en registros del microprograma, para acceder rápido.
- Para ubicar el descriptor: se elige la LDT o la GDT según el bit 2, se ponen en 0 los 3 bits de abajo del selector y se suma la dirección de la tabla. Ejemplo: el selector 72 se refiere a la entrada 9 de la GDT, en la dirección GDT + 72 (cada descriptor ocupa 8 bytes, y 9 × 8 = 72).

**Descriptor.** Descripción de la figura 3-40: un descriptor de 8 bytes (dos palabras de 32 bits) con la base repartida en tres partes (bits 0 a 15, 16 a 23 y 24 a 31, por compatibilidad con el 286, que tenía base de 24 bits), el límite en dos partes (bits 0 a 15 y 16 a 19, es decir, 20 bits), el bit G (granularidad: 0 si el límite está en bytes, 1 si está en páginas), el bit D (segmento de 16 o de 32 bits), el bit P (0 si el segmento no está en memoria, 1 si está), el DPL (nivel de privilegio), el bit S (sistema o aplicación) y el tipo y protección del segmento.

Como el límite tiene solo 20 bits: si G = 0, el límite es el tamaño exacto, hasta 1 MB; si G = 1, el límite está en páginas de 4 KB, y 20 bits alcanzan para segmentos de hasta 2³² bytes.

**Traducción de (selector, desplazamiento), paso a paso:**

1. El microprograma busca, en sus registros internos, el descriptor del selector que se está usando.
2. Si el segmento no existe (selector 0) o está fuera de memoria, hay un trap.
3. Con el campo límite, comprueba si el desplazamiento se sale del segmento; si se sale, hay un trap.
4. Suma la base de 32 bits del descriptor al desplazamiento. El resultado es la **dirección lineal**. Descripción de la figura 3-41: el selector elige el descriptor (con su dirección base, límite y otros campos); la dirección base se suma al desplazamiento y da la dirección lineal de 32 bits.
5. Si la paginación está **deshabilitada** (un bit en un registro de control global), la dirección lineal es la física: es segmentación pura. No se impide que los segmentos se superpongan.
6. Si la paginación está **habilitada**, la dirección lineal se trata como virtual y se traduce con tablas de páginas de dos niveles.

**Paginación del Pentium.** Descripción de la figura 3-42: (a) la dirección lineal dividida en tres campos: Dir (10 bits), Página (10 bits) y Desplazamiento (12 bits). (b) Dir indexa el directorio de páginas (1024 entradas de 32 bits, apuntado por un registro global), cuya entrada apunta a una tabla de páginas (también de 1024 entradas). Página indexa esa tabla, cuya entrada apunta al marco de página. El desplazamiento se suma para llegar a la palabra.

Cada entrada de la tabla de páginas tiene 32 bits: 20 para el número de marco y el resto para bits de acceso, bits sucios (los pone el hardware para el sistema), bits de protección y otros. Cada tabla de páginas maneja 1024 marcos de 4 KB, o sea 4 MB. Un segmento de menos de 4 MB tiene un directorio con una sola entrada: la sobrecarga es de dos páginas, en vez del millón que necesitaría una tabla de un nivel.

El Pentium también tiene un TLB que asocia las combinaciones Dir-Página más recientes con el marco físico. Solo si no está en el TLB se recorren las tablas.

**Paginación pura en el Pentium:** si una aplicación no quiere segmentación, se cargan todos los registros de segmento con el mismo selector, con base 0 y límite máximo. El desplazamiento de la instrucción es la dirección lineal: paginación normal. **Todos los sistemas operativos actuales para el Pentium funcionan así.** OS/2 fue el único que usó todo el poder de la MMU de Intel.

Según la cátedra: si la paginación está deshabilitada, hay segmentación pura; si todos los segmentos tienen base 0 y límite máximo, hay paginación pura. Por eso los sistemas modernos en Pentium usan paginación y simulan una segmentación mínima.

**Protección en el Pentium.** El Pentium tiene cuatro niveles de protección, del 0 (el más privilegiado) al 3 (el menos). En cada momento, el programa en ejecución está en un nivel, indicado por 2 bits de su PSW, y cada segmento tiene también un nivel.

- Acceder a datos de un nivel más alto (menos privilegiado) está permitido; acceder a datos de un nivel más bajo (más privilegiado) es ilegal y produce un trap.
- Llamar a procedimientos de otro nivel está permitido, pero en forma controlada: la instrucción CALL tiene que tener un selector, no una dirección, que designa un descriptor llamado **compuerta de llamada**, el cual da la dirección del procedimiento. No se puede saltar al medio de un segmento de código de otro nivel: solo a puntos de entrada oficiales.
- Los niveles de protección y las compuertas de llamada se usaron por primera vez en MULTICS, donde se llamaban **anillos de protección**.
- Los traps y las interrupciones usan un mecanismo similar a las compuertas de llamada.

Descripción de la figura 3-43: cuatro anillos concéntricos. En el centro, el nivel 0, el kernel (E/S, administración de memoria y otras cuestiones críticas). Alrededor, el nivel 1, las llamadas al sistema (solo se puede llamar a una lista de procedimientos protegidos). Después, el nivel 2, las bibliotecas compartidas (los programas pueden llamarlas y leer sus datos, pero no modificarlos). Afuera, el nivel 3, los programas de usuario, con la menor protección.

### 13.3 Investigación y resumen del capítulo

La investigación en algoritmos de paginación casi desapareció para los sistemas de propósito general: la mayoría usa alguna variante del reloj, por ser fácil y relativamente efectiva. Sigue habiendo trabajo en celulares y PDA, que paginan a memoria flash (con propiedades distintas a un disco), en paginación consciente de la energía, en modelado del rendimiento y en memoria para multimedia y tiempo real.

Resumen del libro: los sistemas más simples no intercambian ni paginan. El paso siguiente es el intercambio, con un mapa de bits o una lista de huecos para llevar la cuenta del espacio libre. Las computadoras modernas tienen memoria virtual: el espacio de cada proceso se divide en páginas que pueden ir a cualquier marco. De los muchos algoritmos de reemplazo, dos de los mejores son el envejecimiento y WSClock. Para que la paginación funcione bien no basta con un algoritmo: hay que atender el conjunto de trabajo, la política de asignación y el tamaño de página. La segmentación ayuda con estructuras que cambian de tamaño, simplifica la vinculación y la compartición, y permite proteger cada segmento distinto. MULTICS y el Pentium combinan segmentación y paginación.

(Tanenbaum, cap. 3.7.2 y 3.7.3, págs. 238–247, figs. 3-35 a 3-43; 3.8 y 3.9, págs. 247–248) (Apunte: resumen de la cátedra, 3.7.2 y 3.7.3)

---

## 14. Casos de estudio (programa 3.7)

### 14.1 Llamadas al sistema de memoria en Linux: malloc, brk y mmap

POSIX no define llamadas al sistema para la administración de memoria: el tema se consideró demasiado dependiente de la máquina. En vez de eso, dice que los programas que necesitan memoria dinámica pueden usar el procedimiento de biblioteca **malloc** (definido por el estándar ANSI C). Cómo se implementa malloc queda fuera de POSIX: el libro dice que en algunos círculos esto se llama "pasar la cubeta".

En la práctica, Linux tiene llamadas al sistema para la memoria. Descripción de la figura 10-14:

| Llamada | Descripción |
|---|---|
| s = brk(direc) | Cambia el tamaño del segmento de datos |
| a = mmap(direc, lon, prot, banderas, fd, despl) | Asigna (mapea) un archivo |
| s = unmap(direc, lon) | Desasigna un archivo |

El código de retorno s es −1 si hubo un error.

- **brk** fija el tamaño del segmento de datos indicando la dirección del primer byte después de él. Si el nuevo valor es mayor, el segmento crece; si es menor, se achica. Es la llamada sobre la que trabaja malloc para pedir más memoria.
- **mmap** asocia un archivo (o una parte) a memoria. direc es la dirección donde asociarlo (múltiplo del tamaño de página; si es 0, el sistema la elige y la devuelve en a); lon, cuántos bytes (múltiplo del tamaño de página); prot, la protección (lectura, escritura, ejecución o combinaciones); banderas, si es privado o compartido y si direc es obligatoria o una sugerencia; fd, el descriptor del archivo (hay que abrirlo antes); despl, desde qué parte del archivo (cualquier límite de página).
- **munmap** (en la tabla, unmap) elimina una asociación; si se desasocia una parte, el resto queda.

Descripción de la figura 10-13: dos procesos, A y B, cada uno con su texto, datos, BSS y pila, comparten un archivo mapeado que aparece en el espacio de los dos y está una sola vez en la memoria física.

Cada proceso de Linux en una máquina de 32 bits tiene 3 GB de espacio virtual propio; el gigabyte restante es del kernel (tablas de páginas y otros datos), visible solo en modo kernel, entre las direcciones 0xC0000000 y 0xFFFFFFFF. El espacio de direcciones se crea con el proceso y se sobrescribe con exec. Para asignar memoria física, Linux usa el algoritmo de colegas (sección 5.6), el asignador de losas y vmalloc.

Sobre free, calloc y realloc: el programa de la materia nombra malloc, free, calloc y realloc. El material disponible (el Tanenbaum) nombra solo malloc, como procedimiento de biblioteca del estándar C. free, calloc y realloc no están desarrollados en las fuentes.

### 14.2 La memoria caché

El programa incluye la memoria caché como caso de estudio. El material es la sección 1.3.2 del libro, desarrollada en la sección 1 de este documento: líneas de 64 bytes, aciertos y fallos, L1 y L2, cachés compartidas o separadas en los multinúcleo, las cuatro preguntas de todo sistema de caché y la caché como idea general. También se relaciona con el TLB (una caché de traducciones), con la caché de páginas del sistema operativo y con el bit de caché deshabilitada de la tabla de páginas.

### 14.3 El administrador de memoria de Windows Vista

En Windows Vista, el **administrador de memoria** es el componente más grande del nivel ejecutivo de NTOS.

**Espacio de direcciones.** Cada proceso de usuario tiene su propio espacio virtual. En x86, de 32 bits, son 4 GB: 2 GB para el modo usuario (los servidores pueden configurar 3 GB) y 2 GB (o 1 GB) para el modo kernel. En x64, los procesos de 32 bits (que corren con WOW64) pueden tener los 4 GB completos. El espacio se pagina bajo demanda, con páginas de 4 KB, aunque a veces se usan páginas grandes de 4 MB (usando solo el directorio de páginas).

Descripción de la figura 11-30: tres procesos (A, B y C), cada uno con 4 GB. Abajo, de 0 a 2 GB, el código y los datos privados de cada proceso. Arriba, de 2 a 4 GB, el sistema: HAL + SO, datos del sistema, reserva con paginación, reserva sin paginación, tablas de páginas del proceso y pilas. La parte de arriba se comparte entre todos los procesos, salvo las tablas de páginas y las listas de conjuntos de trabajo, que son de cada uno. Los 64 KB de abajo y de arriba de cada espacio no están asignados, para atrapar punteros inválidos (que suelen valer 0 o −1).

Compartir la parte del kernel en todos los procesos tiene una ventaja: cuando un hilo hace una llamada al sistema, entra al kernel sin cambiar el mapa de memoria (solo cambia a su pila de kernel), y el kernel puede leer los parámetros y búferes del usuario directamente. La desventaja es menos espacio privado por proceso.

**Estados de una página virtual:**

- **Inválida:** no está asignada; usarla provoca un fallo que se convierte en una violación de acceso.
- **Reservada:** inválida, pero el administrador no la va a usar para otra cosa. Por ejemplo, al crear un proceso se reservan muchas páginas para la pila pero se confirma una sola; a medida que la pila crece se confirman más. Las reservadas funcionan como páginas de guardia.
- **Confirmada:** tiene código o datos asignados. Un fallo en una página confirmada la trae del archivo o del archivo de paginación.

Además, las páginas tienen atributos de lectura, escritura y (en AMD64) ejecución.

**Archivos de paginación.** Windows asigna espacio en el archivo de paginación **justo a tiempo**: una página recibe lugar en el archivo recién cuando tiene que salir de la memoria. Las que nunca salen no ocupan disco. Las páginas modificadas se agrupan y se escriben en trozos grandes, contiguos si es posible. Una página leída del archivo de paginación conserva su lugar hasta que se modifica; si nunca se modifica, va a la **lista de espera** y se puede reusar sin escribirla. Windows admite hasta 16 archivos de paginación, conviene repartidos en discos distintos y creados con su tamaño máximo.

El código y los datos de solo lectura de un EXE o una DLL se asignan directamente desde el archivo: nunca se escriben al disco y, si hace falta, se vuelven a leer del archivo. Windows usa **copiar al escribir** para las páginas que empiezan compartidas y después se modifican. Los objetos de sección permiten asociar archivos o compartir memoria anónima entre procesos.

Para servidores con mucha memoria (PAE permite 36 bits, hasta 64 GB), Windows tiene **AWE** (Address Windowing Extensions), una forma moderna de conmutación de bancos.

**API Win32 de memoria** (figura 11-31):

| Función | Descripción |
|---|---|
| VirtualAlloc | Reserva o confirma una región |
| VirtualFree | Libera o desconfirma una región |
| VirtualProtect | Cambia la protección de lectura, escritura o ejecución |
| VirtualQuery | Consulta el estado de una región |
| VirtualLock | Hace residente una región (deshabilita su paginación) |
| VirtualUnlock | Vuelve paginable una región |
| CreateFileMapping | Crea un objeto de asignación de archivo y opcionalmente le da un nombre |
| MapViewOfFile | Asigna (parte de) un archivo en el espacio de direcciones |
| UnmapViewOfFile | Quita un archivo asignado |
| OpenFileMapping | Abre un objeto de asignación de archivo creado antes |

Las regiones empiezan en límites de 64 KB.

**Implementación.** En x86, Windows usa un espacio lineal de 4 GB con paginación bajo demanda y **no admite la segmentación en ninguna forma**. El administrador de memoria trabaja con procesos, no con hilos, porque los procesos son los dueños del espacio de direcciones. Cada región asignada tiene un **VAD** (descriptor de direcciones virtuales) con el rango, el archivo de respaldo, el desplazamiento y los permisos. Los VAD se organizan en un árbol balanceado.

Descripción de la figura 11-32: los procesos A y B, cada uno con regiones (programa, biblioteca compartida, datos y pila) que tienen páginas sombra en el disco: el archivo de paginación para datos y pila, Prog1.exe y Prog2.exe para los programas, y lib.dll, asignada en los dos espacios a la vez.

**Entrada de la tabla de páginas** (figura 11-33): para x86 y x64, con el bit P (presente, válida), R/W (lectura/escritura), U/S (usuario/supervisor), PWT y PCD (control de caché), A (accedida, es decir, referenciada), D (sucia, es decir, modificada), PAT, G (global), bits disponibles para el sistema, NX (no ejecutar, en x64) y el número de página física. Los bits A y D los actualiza el hardware: con A, el administrador implementa una paginación estilo LRU; con D sabe si hay que escribir la página antes de reusarla.

**Fallos de página.** Windows los clasifica en cinco categorías:

1. La página no está confirmada (error de programación: violación de acceso).
2. El acceso violó los permisos (también violación de acceso).
3. Se intenta escribir una página compartida de copiar al escribir (se hace una copia privada y se reintenta).
4. La pila tiene que crecer (se da una página nueva llena de ceros).
5. La página está confirmada pero no asignada (fallo normal).

Si el fallo se resuelve con una página que ya está en memoria (compartida con otro proceso, en la lista de espera o de modificadas, o una página de ceros), es un **fallo suave**; si hay que leer del disco, es un **fallo duro**. Con **SuperFetch**, Windows recuerda el patrón de páginas de un programa y las prepagina al iniciarlo, convirtiendo fallos duros futuros en suaves.

**Reemplazo con conjuntos de trabajo.** Cada **proceso** (no cada hilo) tiene un conjunto de trabajo, con un tamaño mínimo (inicialmente de 20 a 50 páginas) y uno máximo (de 45 a 345), que no son límites duros. Los conjuntos de trabajo solo actúan cuando la memoria escasea. El administrador del conjunto de trabajo corre cada segundo y tiene tres niveles:

1. Mucha memoria disponible: explora las páginas, borra los bits de acceso y estima la edad de cada página.
2. La memoria empieza a escasear: a los procesos con muchas páginas sin usar deja de agregarles páginas y reemplaza las más viejas.
3. La memoria es escasa: recorta los conjuntos de trabajo por debajo de su máximo, sacando las páginas más viejas.

**Listas de páginas físicas** (la base de datos PFN, indexada por número de marco): lista de páginas libres, lista en espera (sin modificar, reutilizables), lista de modificadas (se escriben al disco y después pasan a espera), lista de páginas en cero (preparadas por un hilo de baja prioridad, porque llenar de ceros lleva tiempo) y lista de páginas con errores de hardware.

(Tanenbaum, cap. 10.4.2, págs. 761–762; 10.4.3, págs. 765–767; cap. 11.5, págs. 879–894; cap. 1.3.2, págs. 23–26)

---

## 15. Comandos Linux de memoria de la cátedra

Los exámenes prácticos de la cátedra toman estos comandos y el significado de sus columnas.

**free:** muestra el uso de la RAM y del swap. Lo más cómodo es free -h (valores legibles, en MB o GB).

| Columna | Significado |
|---|---|
| total | memoria total disponible |
| used | memoria usada |
| free | memoria completamente libre |
| shared | memoria compartida entre procesos |
| buff/cache | memoria que el sistema usa como búfer y caché |
| available | memoria que realmente se puede usar para abrir programas nuevos sin recurrir al swap |

La fila Mem es la RAM; la fila Swap, la memoria de intercambio en disco. Ejemplo del apunte: Mem total 16 Gi, used 6 Gi, free 2 Gi, shared 500 Mi, buff/cache 8 Gi, available 9 Gi; Swap total 2 Gi, used 0, free 2 Gi. Después de matar un proceso puede bajar used y subir free o available, pero parte de la memoria liberada pasa a buff/cache, porque Linux la aprovecha como caché. Para saber cuánta memoria queda realmente, hay que mirar **available**. free da un resumen; top muestra además el consumo por proceso; htop, lo mismo en forma visual.

**smem:** analiza la memoria de cada proceso más precisamente que top o ps, porque distingue la memoria privada de la compartida. Se instala con sudo apt install smem y se ejecuta con smem -r -k (-r ordena de mayor a menor consumo; -k muestra en KB, MB o GB).

| Columna | Significado |
|---|---|
| USS | memoria física exclusiva del proceso, no compartida: lo que se liberaría aproximadamente si se cerrara solo ese proceso |
| PSS | memoria privada más una parte proporcional de la compartida: la estimación más realista para comparar procesos |
| RSS | toda la RAM asociada al proceso, incluida toda la compartida: puede exagerar el consumo total |
| Swap | swap usado por el proceso |

Una pregunta real de examen fue: "¿Qué indica la columna USS en el comando smem -k?".

**vmstat:** resumen del estado del sistema; vmstat 1 lo actualiza cada segundo.

- procs: r (procesos listos esperando CPU) y b (bloqueados, normalmente por E/S).
- memory: swpd (swap usado), free (RAM libre), buff y cache.
- swap: si (memoria que entra desde el swap a la RAM por segundo) y so (memoria que sale de la RAM al swap por segundo).
- io: bi (bloques leídos de dispositivos por segundo) y bo (bloques escritos).
- system: in (interrupciones por segundo) y cs (cambios de contexto por segundo).
- cpu: us (usuario), sy (kernel), id (CPU inactiva), wa (esperando E/S) y st (tiempo robado por el hipervisor).

Para recordar: r alto, procesos esperando CPU; b o wa altos, espera de E/S; **si y so altos, uso frecuente de swap** (posible sobrepaginación); id alto, CPU mayormente libre.

**/proc/meminfo:** archivo virtual con información detallada de la memoria (cat /proc/meminfo): MemTotal, MemFree, MemAvailable, Buffers, Cached, SwapTotal, SwapFree, Active (memoria usada recientemente), Inactive (poco usada, recuperable), Dirty (modificada que todavía hay que escribir al disco) y PageTables (memoria ocupada por las tablas de páginas). free toma estos datos y los muestra resumidos.

Relación con la teoría: buff/cache es la caché de páginas del sistema operativo; Dirty son las páginas con el bit M en 1; PageTables es el espacio de las tablas de páginas; si/so son el intercambio con el área de swap.

(Apunte: cartilla de comandos Linux de la cátedra, págs. 8–12)

---

## 16. Lo que más se toma en los exámenes de la cátedra

1. **Traducción de dirección virtual a física** en binario o hexadecimal, con páginas de 1 KB, 2 KB o 4 KB: separar página y desplazamiento, buscar el marco y armar la dirección física.
2. **Segunda oportunidad con tabla de páginas** (N.º de página, tiempo de llegada, R, M, presente/ausente, marco): decir qué página se reemplaza, justificarlo, dejar la tabla actualizada y el estado final de la cola.
3. **Conteo de fallos de página** con N marcos (FIFO, LRU, óptimo).
4. **Comandos:** free, smem (USS, PSS, RSS), vmstat (columnas de swap, id) y /proc/meminfo.
5. Teoría: TLB y fallos suaves contra duros; multinivel contra invertidas; la secuencia del fallo de página; paginación contra segmentación; fragmentación interna contra externa; conjunto de trabajo y sobrepaginación.

Trampas típicas:

- La dirección de disco de una página no está en la tabla de páginas.
- El TLB no reemplaza a la tabla de páginas: es una caché de sus entradas.
- El óptimo no se puede implementar; sirve para comparar.
- Segunda oportunidad degenera en FIFO, no en LRU, cuando todas las páginas tienen R = 1.
- El reloj hace lo mismo que segunda oportunidad: cambia la implementación, no el resultado.
- La segmentación tiene fragmentación externa; la paginación, interna.
- La sobrepaginación no se arregla con un mejor algoritmo de reemplazo: hay que reducir la cantidad de procesos (control de carga).
- El mejor ajuste no es el que menos desperdicia: deja huecos diminutos inútiles.
- En la cola de segunda oportunidad solo entran las páginas presentes.

(Apunte: exámenes de la cátedra y práctica resuelta)
