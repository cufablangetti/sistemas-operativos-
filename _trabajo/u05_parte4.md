
### 5.7 Formato de disco

Un disco duro es una pila de platos de aluminio, aleación de acero o vidrio, de 5,25 o 3,5 pulgadas (más chicos en las notebooks), cubiertos de un óxido metálico magnetizable. De fábrica no tiene ninguna información. Antes de usarlo hay tres pasos: formato de bajo nivel, particionado y formato de alto nivel.

Formato de bajo nivel: lo hace un software y crea pistas concéntricas con cierta cantidad de sectores y huecos cortos entre ellos. Cada sector (figura 5-25 del libro) tiene tres partes:
1. Preámbulo: un patrón de bits que permite reconocer el inicio del sector, más el número de cilindro y de sector y otra información.
2. Datos: su tamaño lo fija el programa de formato; la mayoría de los discos usa 512 bytes.
3. ECC: información redundante para recuperarse de errores de lectura. Su tamaño varía según el fabricante (cuánto espacio sacrifica por confiabilidad y qué tan complejo es el código que puede manejar el controlador); 16 bytes es común.
Además, todos los discos tienen sectores de repuesto para reemplazar los que salen defectuosos de fábrica.

Desajuste de cilindros (cylinder skew). La posición del sector 0 de cada pista se desplaza respecto de la pista anterior, para poder leer varias pistas seguidas sin perder datos. El problema: con el disco de la figura 5-19(a), una petición de 18 sectores que empieza en el sector 0 de la pista interior lee los primeros 16 en una vuelta, pero para el 17 tiene que buscar una pista hacia afuera; para cuando la cabeza llegó, el sector 0 de esa pista ya pasó y hay que esperar casi una vuelta entera. Desplazando los sectores (figura 5-26 del libro: pistas concéntricas numeradas de 0 a 31, cada una con el 0 corrido tres posiciones respecto de la anterior, con una flecha que indica el sentido de rotación) el problema desaparece.

Ejemplo resuelto 5 (cuánto desajuste de cilindros hace falta, datos del libro). Un disco de 10.000 RPM da una vuelta cada 6 ms. Con 300 sectores por pista, pasa un sector bajo la cabeza cada 6 ms / 300 = 20 µs. Si la búsqueda de una pista a la siguiente tarda 800 µs, durante la búsqueda pasan 800 / 20 = 40 sectores. El desajuste tiene que ser de 40 sectores (no de 3 como en el dibujo). También hay un desajuste de cabezas, porque cambiar de cabeza lleva un tiempo, pero es chico.

Capacidad con formato. El preámbulo, los huecos, el ECC y los sectores de repuesto reducen la capacidad: a menudo la capacidad con formato es un 20 % menor que sin formato. Los sectores de repuesto no cuentan, así que todos los discos de un modelo salen con la misma capacidad, tengan los sectores defectuosos que tengan (si los defectuosos superan a los de repuesto, el disco se rechaza).

Ejemplo resuelto 6 (la confusión de los gigabytes, datos del libro). Un disco tiene 200 × 10⁹ bytes sin formato y se vende como "200 GB". Después del formato quedan 170 × 10⁹ bytes para datos. El sistema operativo informa 170 × 10⁹ / 2³⁰ = 170.000.000.000 / 1.073.741.824 ≈ 158 GB, porque para memorias y discos el software usa 1 GB = 2³⁰ bytes. Para empeorarlo, en comunicaciones 1 Gbps = 10⁹ bits/s: el prefijo giga es 10⁹ (un kilómetro son 1000 metros, no 1024). Solo con memorias y discos, kilo, mega, giga y tera valen 2¹⁰, 2²⁰, 2³⁰ y 2⁴⁰.

El formato limita la velocidad. Ejemplo resuelto 7 (datos del libro): un disco de 10.000 RPM con 300 sectores de 512 bytes por pista lee una pista entera (300 × 512 = 153.600 bytes) en una vuelta de 6 ms: 153.600 bytes / 0,006 s = 25.600.000 bytes/s, unos 24,4 MB/s. No se puede ir más rápido aunque la interfaz SCSI sea de 80 o 160 MB/s.

Entrelazado (interleaving). Para leer continuamente a esa velocidad el controlador necesita un búfer grande. Si tiene búfer para un solo sector y le piden dos sectores consecutivos, después de leer el primero y calcular el ECC tiene que copiarlo a memoria; mientras tanto el segundo sector pasa bajo la cabeza, y hay que esperar casi una vuelta entera. Solución: numerar los sectores en forma entrelazada al formatear. Figura 5-27 del libro, una pista de 8 sectores dibujada tres veces:
- (a) sin entrelazado: los sectores en orden 0, 1, 2, 3, 4, 5, 6, 7 alrededor de la pista;
- (b) entrelazado simple: entre dos sectores consecutivos hay uno intermedio, para darle tiempo al controlador de copiar el búfer;
- (c) entrelazado doble: dos sectores intermedios, si la copia es muy lenta.
No importa si la copia la hace el controlador, la CPU o un chip de DMA: siempre lleva tiempo. Para no necesitar entrelazado, el controlador tiene que poder guardar una pista entera en su búfer, cosa que muchos controladores modernos hacen.

Particionado. Después del formato de bajo nivel se particiona el disco. Lógicamente, cada partición es como un disco separado. Las particiones permiten que convivan varios sistemas operativos, y a veces una se usa para intercambio (swap). En el Pentium, el sector 0 tiene el registro de inicio maestro (MBR, Master Boot Record), con código de arranque y la tabla de particiones al final. La tabla da el sector inicial y el tamaño de cada partición y tiene lugar para cuatro. Si las cuatro son de Windows, se llaman C:, D:, E: y F:. Si tres son de Windows y una de UNIX, Windows llama C:, D: y E: a las suyas y el primer CD-ROM queda como F:. Para arrancar del disco, una partición tiene que estar marcada como activa.

Formato de alto nivel: se hace en cada partición por separado. Crea un bloque de arranque, la administración del espacio libre (lista de bloques libres o mapa de bits), el directorio raíz y un sistema de archivos vacío. También pone un código en la entrada de la tabla de particiones que indica qué sistema de archivos se usa.

Arranque, en orden:
1. Al encender, se ejecuta el BIOS.
2. El BIOS lee el MBR y salta a él.
3. El programa del MBR busca la partición activa.
4. Lee el sector de arranque de esa partición y lo ejecuta.
5. Ese pequeño programa carga otro más grande, que busca el kernel en el sistema de archivos.
6. El kernel se carga en memoria y se ejecuta.

(Tanenbaum, cap. 5.4.2, págs. 375–379) (Relación con la Unidad 1: arranque y sector de booteo; con la Unidad 4: distribución de la partición, superbloque, mapa de bits, raíz)

### 5.8 Tiempo de acceso a disco

El tiempo para leer o escribir un bloque de disco depende de tres factores:
1. Tiempo de búsqueda (seek): mover el brazo al cilindro correcto.
2. Retraso rotacional (latencia): esperar a que el sector correcto pase bajo la cabeza.
3. Tiempo de transferencia de los datos.
En la mayoría de los discos el tiempo de búsqueda domina sobre los otros dos, así que reducir la búsqueda promedio mejora mucho el rendimiento.

Fórmula de la práctica de la cátedra (tiempo medio de lectura o escritura, TmLW):

TmLW = tiempo medio de posicionamiento (búsqueda) + retardo rotacional + tiempo de transferencia + sobrecarga del controlador.

- Retardo rotacional medio = media vuelta = (60 / RPM) / 2 segundos = 30.000 / RPM milisegundos.
- Tiempo de transferencia = tamaño del sector / velocidad de transferencia.

Ejemplo resuelto 8 (ejercicio de la práctica de la cátedra). Datos: sector de 512 bytes, disco de 7200 RPM, tiempo medio de posicionamiento 6,8 ms, velocidad de transferencia 19 MB/s y sobrecarga del controlador 2 ms.
1. Vueltas por segundo: 7200 / 60 = 120 vueltas por segundo.
2. Una vuelta tarda 1 / 120 = 0,00833 s = 8,33 ms.
3. Retardo rotacional medio = media vuelta = 8,33 / 2 = 4,165 ms (igual a 30.000 / 7200 = 4,1667 ms).
4. Tiempo de transferencia = 512 bytes / (19 × 10⁶ bytes/s) = 0,0000269 s = 0,0269 ms.
5. TmLW = 6,8 + 4,165 + 0,0269 + 2 = 12,99 ms.
Observación: la transferencia de un sector es despreciable frente a la búsqueda y la rotación. Por eso conviene leer bloques grandes y por eso importa planificar el brazo.

Ejemplo resuelto 9 (variante con datos nuevos). Disco de 10.000 RPM, búsqueda media 5 ms, transferencia 50 MB/s, sector de 4 KB (4096 bytes), sin sobrecarga.
1. Una vuelta: 60.000 / 10.000 = 6 ms; media vuelta: 3 ms.
2. Transferencia: 4096 / (50 × 10⁶) = 0,082 ms.
3. Total: 5 + 3 + 0,082 = 8,08 ms.

(Tanenbaum, cap. 5.4.3, pág. 379) (Apunte: práctica resuelta, ejercicio 3) (Relación con la Unidad 4: tamaño de bloque y la figura 4-21)

### 5.9 Algoritmos de planificación del brazo del disco

Si el driver acepta peticiones de a una y las atiende en orden de llegada, FCFS (First-Come, First-Served, primero en llegar, primero en ser atendido), no se puede optimizar la búsqueda. Pero con el disco muy cargado, mientras el brazo busca para una petición llegan otras. Muchos drivers mantienen una tabla indexada por número de cilindro, con las peticiones pendientes de cada cilindro encadenadas en una lista enlazada. Con eso se puede elegir mejor.

Ejemplo del libro (figuras 5-28 y 5-29): un disco de 40 cilindros (0 a 39). Llega una petición para el cilindro 11. Mientras se busca el 11, llegan peticiones para los cilindros 1, 36, 16, 34, 9 y 12, en ese orden. Los gráficos tienen el número de cilindro en el eje horizontal (0 a 35) y el tiempo hacia abajo, con una línea quebrada que muestra el recorrido del brazo.

FCFS: orden 11 → 1 → 36 → 16 → 34 → 9 → 12. Movimientos: 10, 35, 20, 18, 25 y 3. Total: 111 cilindros.

SSF o SSTF (Shortest Seek First, la búsqueda más corta primero): siempre se atiende la petición más cercana al brazo. Desde 11: el más cercano es 12 (distancia 1); desde 12, el 9 (3); desde 9, el 16 (7); desde 16, el 1 (15); desde 1, el 34 (33); desde 34, el 36 (2). Orden 12, 9, 16, 1, 34, 36. Movimientos: 1, 3, 7, 15, 33 y 2. Total: 61 cilindros, casi la mitad que FCFS.

Problema de SSF: inanición de los extremos. Si mientras se atienden esas peticiones llegan otras (por ejemplo, después de ir al 16 llega una para el 8, que tiene prioridad sobre el 1; después una para el 13, y el brazo va al 13 en vez de al 1), con un disco muy cargado el brazo tiende a quedarse en la parte media, y las peticiones de los extremos esperan hasta que una fluctuación estadística deje el medio sin peticiones. Los objetivos de tiempo de respuesta mínimo y equidad están en conflicto.

Algoritmo del elevador (SCAN). Como un ascensor en un edificio alto: sigue en la misma dirección hasta que no quedan peticiones en esa dirección y entonces cambia de sentido. El software mantiene un solo bit, la dirección actual: ARRIBA o ABAJO. Al terminar una petición, si el bit es ARRIBA el brazo va a la siguiente petición pendiente de número mayor; si no hay ninguna mayor, se invierte el bit. Con ABAJO va a la siguiente de número menor, si la hay.

Con el mismo ejemplo y el bit en ARRIBA al principio: orden 12, 16, 34, 36, 9, 1. Movimientos: 1, 4, 18, 2, 27 y 8. Total: 60 cilindros. En este caso el elevador es apenas mejor que SSF, aunque en general es peor. Su gran propiedad: dado un conjunto de peticiones, el movimiento total tiene un límite superior fijo, el doble de la cantidad de cilindros, y no hay inanición.

Variante de exploración en una sola dirección (Teory, 1972), con menor variación en los tiempos de respuesta: el brazo siempre recorre hacia arriba. Cuando atendió el cilindro más alto con peticiones, salta al cilindro más bajo con peticiones y sigue subiendo, como si el cilindro más bajo estuviera justo encima del más alto. En la terminología habitual (que el libro no usa) esta variante se llama C-SCAN o C-LOOK.

Nota de terminología (complemento, no está en el libro): en muchos textos se distingue SCAN, que llega hasta el último cilindro del disco antes de volver, de LOOK, que da la vuelta en la última petición pendiente. El "elevador" del libro, que cambia de dirección cuando no quedan peticiones en ese sentido, es en realidad LOOK. Del mismo modo, C-SCAN llega hasta el final y vuelve al cilindro 0, y C-LOOK salta de la última petición a la primera.

Ejemplo resuelto 10 (los cinco algoritmos con el ejemplo del libro: 40 cilindros, brazo en 11, subiendo, peticiones 1, 36, 16, 34, 9, 12):

| Algoritmo | Orden de atención | Movimientos | Total |
|---|---|---|---|
| FCFS | 1, 36, 16, 34, 9, 12 | 10 + 35 + 20 + 18 + 25 + 3 | 111 |
| SSF/SSTF | 12, 9, 16, 1, 34, 36 | 1 + 3 + 7 + 15 + 33 + 2 | 61 |
| Elevador (LOOK) | 12, 16, 34, 36, 9, 1 | 1 + 4 + 18 + 2 + 27 + 8 | 60 |
| SCAN (hasta el cilindro 39) | 12, 16, 34, 36, (39), 9, 1 | 1 + 4 + 18 + 2 + 3 + 30 + 8 | 66 |
| C-LOOK (contando el salto de vuelta) | 12, 16, 34, 36, 1, 9 | 1 + 4 + 18 + 2 + 35 + 8 | 68 |

Las filas de SCAN y C-LOOK son complemento: no están en el libro, que solo da los totales de FCFS (111), SSF (61) y elevador (60). Algunos docentes no cuentan el salto de vuelta de C-LOOK o C-SCAN como movimiento útil; si no se cuenta, C-LOOK da 1 + 4 + 18 + 2 + 8 = 33 cilindros más el salto.

Otras optimizaciones del libro:
- Si el controlador informa qué sector está bajo la cabeza y hay varias peticiones para el mismo cilindro, se pide el sector que pasará a continuación. Cambiar de cabeza dentro de un cilindro es casi instantáneo (no mueve el brazo ni espera rotación), así que peticiones a distintas pistas del mismo cilindro no tienen castigo.
- Si la búsqueda fuera mucho más rápida que el retraso rotacional, convendría ordenar las peticiones por número de sector y mover el brazo justo antes de que pase el sector.
- Como la búsqueda y la rotación dominan tanto, es ineficiente leer uno o dos sectores: muchos controladores leen y guardan en su caché gran parte o toda la pista aunque se pida un sector. El disco de la figura 5-18 tiene una caché de 4 MB. La caché del controlador es totalmente independiente de la del sistema operativo: la del controlador tiene bloques que nadie pidió pero que pasaron bajo la cabeza; la del SO tiene bloques leídos explícitamente que probablemente se vuelvan a necesitar (por ejemplo, un bloque de directorio).
- Con varias unidades en el mismo controlador, el SO mantiene una tabla de peticiones pendientes por unidad. Cuando una unidad está inactiva, se le ordena buscar el cilindro de su próxima petición (si el controlador permite búsquedas traslapadas). Al terminar una transferencia, se inicia la siguiente en una unidad que ya esté en el cilindro correcto.

Advertencia del libro: todos estos algoritmos suponen que la geometría real es igual a la virtual. Si no lo es, el sistema operativo no puede saber si el cilindro 40 o el 200 está más cerca del 39, y planificar no tiene sentido. Pero si el controlador acepta varias peticiones pendientes, puede aplicar estos algoritmos internamente, un nivel más abajo.

(Tanenbaum, cap. 5.4.3, págs. 379–382) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 2: FCFS y SJF en planificación de la CPU; SSF es el equivalente del SJF y sufre la misma inanición)

### 5.10 Manejo de errores

Los fabricantes empujan siempre los límites de densidad. Una pista en la mitad de un disco de 5,25 pulgadas mide unos 300 mm de circunferencia; con 300 sectores de 512 bytes, la densidad lineal ronda los 5000 bits/mm (contando el espacio de preámbulos, ECC y huecos). Eso exige un sustrato extremadamente uniforme y una capa de óxido finísima, y no se puede fabricar sin defectos. Cuando la fabricación mejora, se sube la densidad y vuelven los defectos.

Sectores defectuosos: no leen correctamente lo que se les acaba de escribir. Si el defecto es de unos pocos bits, se usa el sector y el ECC corrige el error cada vez. Si es mayor, no se puede enmascarar. Dos métodos:

1. Manejarlos en el controlador. Antes de salir de fábrica, el disco se prueba y se escribe en él una lista de sectores defectuosos; cada uno se reemplaza por un sector de repuesto. Figura 5-30 del libro, una pista con 30 sectores de datos (0 a 29) y dos de repuesto, con el sector 7 defectuoso, dibujada tres veces:
   - (a) la pista con el sector 7 defectuoso;
   - (b) sustitución: uno de los sectores de repuesto pasa a ser el sector 7;
   - (c) desplazamiento: todos los sectores desde el 7 se corren una posición para saltear el defectuoso.
   El controlador registra qué sector es cuál con tablas internas (una por pista) o reescribiendo los preámbulos con los números reasignados. Reescribiendo preámbulos, (c) es más trabajoso (23 preámbulos) pero rinde mejor, porque la pista entera se sigue leyendo en una vuelta.

   Errores durante la operación: la primera defensa ante un error que el ECC no corrige es releer, porque muchos son transitorios (polvo bajo la cabeza). Si un sector da errores repetidos, el controlador puede pasarlo a un repuesto antes de que falle para siempre: no se pierden datos y nadie se entera. Acá se usa el método (b), porque los otros sectores ya tienen datos; el (c) obligaría a reescribir preámbulos y copiar todos los datos.

2. Manejarlos en el sistema operativo. Si el controlador no reasigna sectores, lo hace el SO en software: consigue la lista de sectores defectuosos (leyéndola del disco o probando todo el disco) y arma tablas de reasignación. Con el método (c) tendría que mover los datos de los sectores 7 a 29 una posición. Tiene que asegurarse de que no haya sectores malos en ningún archivo, ni en la lista libre o el mapa de bits. Una forma: crear un archivo con todos los sectores malos que no esté en el sistema de archivos, para que nadie lo lea ni lo libere por accidente. Problema con los respaldos: un respaldo archivo por archivo no debe intentar copiar ese archivo, así que hay que ocultarlo muy bien; uno sector por sector difícilmente evite los errores, y solo cabe esperar que el programa de respaldo se rinda después de 10 lecturas fallidas y siga con el siguiente sector.

Errores de búsqueda: problemas mecánicos del brazo. El controlador lleva internamente la posición del brazo y, para buscar, manda un pulso por cilindro al motor del brazo. Al llegar, lee el número de cilindro del preámbulo del siguiente sector; si no coincide, hubo un error de búsqueda. Los controladores de disco duro los corrigen solos; los de disquete (incluido el del Pentium) solo prenden un bit de error y el driver emite un comando recalibrate, que lleva el brazo lo más afuera posible y pone en 0 la idea interna del cilindro actual. Si eso no alcanza, hay que reparar la unidad.

El controlador es una pequeña computadora especializada, con software, variables, búferes y a veces errores. Una secuencia inusual de eventos (una interrupción en una unidad simultánea con un recalibrate en otra) puede hacerlo entrar en un ciclo o perder la cuenta. Por eso tiene un terminal de reinicio: con una señal olvida lo que estaba haciendo y se restablece; el driver puede prender un bit para activarla. Si tampoco ayuda, el driver imprime un mensaje y se rinde.

Recalibrar hace un ruido raro pero inofensivo, salvo en sistemas de tiempo real: al reproducir video desde el disco o grabar un CD-ROM desde el disco, los bits tienen que salir a velocidad uniforme y una recalibración mete huecos. Para eso existen los discos AV (audiovisuales), que nunca se recalibran.

(Tanenbaum, cap. 5.4.4, págs. 382–385)

### 5.11 Almacenamiento estable

Los discos a veces fallan: sectores buenos se vuelven malos y discos enteros dejan de funcionar. RAID protege contra eso, pero no contra errores de escritura que graban datos malos, ni contra fallas durante una escritura que corrompen el dato viejo sin dejar el nuevo. Para ciertas aplicaciones los datos nunca deben perderse ni corromperse. Un disco perfecto no existe, pero se puede lograr un subsistema con esta propiedad: cuando se emite una escritura, el disco escribe correctamente los datos o no hace nada y deja intactos los existentes. Eso es el almacenamiento estable, implementado en software (Lampson y Sturgis, 1979). El objetivo es mantener el disco consistente a toda costa.

Modelo de errores:
- Una escritura de un bloque es correcta o incorrecta, y el error se detecta en una lectura posterior examinando el ECC. En rigor la detección no está garantizada: con 16 bytes de ECC para 512 de datos hay 2⁴⁰⁹⁶ valores de datos y, según el libro, solo 2¹⁴⁴ valores de ECC (ojo: 16 bytes son 128 bits, así que la cuenta exacta sería 2¹²⁸; el libro da 2¹⁴⁴ y una probabilidad de casi 2⁻¹⁴⁴), así que muchísimas combinaciones incorrectas dan el mismo ECC. Pero la probabilidad de que datos aleatorios tengan el ECC justo es tan chica que se considera cero.
- Un sector bien escrito puede volverse ilegible de golpe, pero es tan raro que la probabilidad de que le pase al mismo sector en una segunda unidad independiente en un intervalo razonable (un día) se ignora.
- La CPU puede fallar y entonces se detiene. Una escritura en curso también se detiene, dejando datos incorrectos y un ECC incorrecto que se detecta después.

Con estas condiciones, el almacenamiento estable es 100 % confiable: las escrituras funcionan o dejan los datos viejos. No protege contra desastres físicos (el libro bromea con una computadora que cae en una grieta de 100 metros a un charco de magma).

Usa un par de discos idénticos: los bloques correspondientes de ambos forman un bloque sin errores. Sin errores, los bloques correspondientes son iguales y se puede leer cualquiera. Tres operaciones:

1. Escritura estable: escribir el bloque en la unidad 1 y releerlo para verificar. Si salió mal, escribir y releer de nuevo, hasta n veces. Tras n fallas seguidas, reasignar el bloque a uno de repuesto y repetir hasta que funcione, pruebe los repuestos que pruebe. Recién cuando la unidad 1 está bien, escribir y verificar el bloque correspondiente en la unidad 2, repitiendo lo que haga falta. Sin fallas de CPU, al terminar el bloque está bien escrito y verificado en las dos unidades.
2. Lectura estable: leer el bloque de la unidad 1. Si el ECC da mal, reintentar hasta n veces. Si todas fallan, leer el bloque de la unidad 2. Como una escritura estable deja dos copias buenas y es despreciable que el mismo bloque se dañe en las dos, la lectura estable siempre funciona.
3. Recuperación de fallas: después de una caída, un programa recorre los dos discos y compara los bloques correspondientes. Si los dos están bien y son iguales, no hace nada. Si uno tiene error de ECC, lo sobrescribe con el bueno. Si los dos están bien pero son distintos, copia el de la unidad 1 a la unidad 2.

Qué pasa si la CPU falla durante una escritura estable (figura 5-31 del libro, cinco pares de bloques "disco 1 / disco 2" con el momento de la falla marcado):
- (a) La falla ocurre antes de escribir cualquiera de las copias: los dos bloques tienen el valor viejo. La recuperación no cambia nada y queda el valor viejo, lo que está permitido.
- (b) La falla ocurre durante la escritura en la unidad 1: el bloque 1 queda con error de ECC y el 2 con el valor viejo. La recuperación restaura el bloque 1 con el 2: se vuelve al estado anterior.
- (c) La falla ocurre después de escribir la unidad 1 y antes de escribir la 2: el bloque 1 tiene el valor nuevo y el 2 el viejo. Ya se pasó el punto sin retorno: la recuperación copia el 1 al 2 y la escritura tiene éxito.
- (d) La falla ocurre durante la escritura en la unidad 2: el bloque 1 tiene el valor nuevo y el 2 error de ECC. La recuperación sobrescribe el malo con el bueno: los dos quedan con el valor nuevo.
- (e) La falla ocurre después de escribir las dos: los dos tienen el valor nuevo, son iguales y no se cambia nada. La escritura tuvo éxito.
En todos los casos el resultado es el valor viejo completo o el valor nuevo completo, nunca una mezcla.

Mejoras:
- Comparar todos los pares después de una caída es caro. Mucho mejor es anotar qué bloque se estaba escribiendo, para revisar solo ese. Algunas computadoras tienen un poco de RAM no volátil (CMOS alimentada por una batería de litio que dura años; ahí suele estar la hora, por eso la computadora la sabe aunque se desenchufe). La escritura estable guarda en la RAM no volátil el número del bloque antes de empezar y, al terminar, lo sobrescribe con un número inválido (por ejemplo, −1). Después de una caída, el programa de recuperación mira la RAM no volátil y revisa solo ese bloque.
- Sin RAM no volátil, se simula: al empezar, se sobrescribe un bloque fijo de la unidad 1 con el número del bloque a escribir y se verifica; después lo mismo en la unidad 2; al terminar, los dos se sobrescriben con un número inválido y se verifican. Cuesta ocho operaciones de disco extra por bloque, así que se usa solo cuando es muy necesario.
- Como con suficientes días el otro bloque de un par también podría dañarse, conviene una exploración completa de los dos discos una vez por día para reparar todo: cada mañana los dos discos quedan idénticos.

(Tanenbaum, cap. 5.4.5, págs. 385–388) (Relación con la Unidad 4: la bitácora y las operaciones idempotentes; con RAID 1)

---
