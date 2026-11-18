# Sistemas Operativos — Unidad 5: Entrada/Salida

Material de estudio para la Unidad 5 de Sistemas Operativos (UTN FRM, Ingeniería en Sistemas de Información, programa 2026). Sigue el orden del programa de la materia y se basa en Tanenbaum, Sistemas Operativos Modernos, 3.ª edición (capítulo 5 completo, secciones 10.2.3, 10.5 y 11.7), en el resumen de la cátedra de la Unidad 5 y en la práctica resuelta (ejercicio de tiempo medio de lectura y escritura en disco).

Orden de los temas:

1. Qué hace el sistema operativo con la E/S.
2. Principios del hardware de E/S: dispositivos de bloque y de carácter, controladores, E/S por asignación de memoria, DMA e interrupciones.
3. Fundamentos del software de E/S: objetivos, E/S programada, E/S controlada por interrupciones y E/S con DMA.
4. Capas del software de E/S: manejadores de interrupciones, drivers, software independiente del dispositivo y software en espacio de usuario.
5. Discos: hardware magnético, RAID, CD-ROM, CD-R, CD-RW y DVD; formato; tiempo de acceso; algoritmos de planificación del brazo; manejo de errores; almacenamiento estable.
6. Relojes: hardware, software y temporizadores de software.
7. Interfaces de usuario: teclado, ratón, ventanas de texto, X Window, GUI y clientes delgados.
8. Administración de energía.
9. Caso de estudio Linux: el shell, la redirección y las tuberías.
10. Caso de estudio Linux: la E/S en Linux.
11. Caso de estudio Windows: la E/S en Windows Vista (WDM, WDF, KMDF y UMDF).
12. Lo que más se toma en los exámenes, ideas clave y conexiones con otras unidades.

---

## 1. Qué hace el sistema operativo con la E/S

Además de las abstracciones de procesos, espacios de direcciones y archivos, el sistema operativo controla todos los dispositivos de entrada/salida de la computadora. Tiene cuatro responsabilidades:

1. Emitir comandos a los dispositivos.
2. Captar las interrupciones.
3. Detectar y manejar los errores.
4. Ofrecer una interfaz simple y fácil de usar entre los dispositivos y el resto del sistema, que en lo posible sea la misma para todos los dispositivos. Esto se llama independencia de dispositivos.

El código de E/S es una fracción considerable del sistema operativo total. Según la cátedra, el objetivo central es ocultar la complejidad del hardware y presentar mecanismos simples y consistentes al resto del sistema.

Hay dos maneras de mirar el hardware de E/S. Los ingenieros electrónicos lo ven como chips, cables, fuentes y motores. Los programadores ven la interfaz que el hardware le presenta al software: los comandos que acepta, las funciones que realiza y los errores que puede informar. Esta unidad se ocupa de lo segundo: cómo se programa el hardware de E/S, no cómo se construye. Igual, la programación de muchos dispositivos está muy ligada a su funcionamiento interno.

(Tanenbaum, cap. 5, introducción y 5.1, págs. 329–330) (Apunte: resumen de la cátedra, Unidad 5)

---

## 2. Principios del hardware de E/S

### 2.1 Dispositivos de bloque y de carácter

Los dispositivos de E/S se dividen en dos grandes categorías.

Un dispositivo de bloque guarda la información en bloques de tamaño fijo, cada uno con su propia dirección. Los tamaños comunes van de 512 bytes a 32.768 bytes. Todas las transferencias son de uno o más bloques completos y consecutivos. La propiedad esencial es que cada bloque se puede leer o escribir independientemente de los demás. Ejemplos: discos duros, CD-ROM y memorias USB.

El límite no está del todo bien definido. Un disco es claramente de bloques, porque siempre se puede buscar otro cilindro y esperar a que el bloque pase bajo la cabeza. Una cinta de respaldo también tiene una secuencia de bloques y, para leer el bloque N, puede rebobinar y avanzar. Pero eso tarda muchísimo, y puede que no se pueda reescribir un bloque en el medio. Por eso las cintas, en la práctica, no se usan como dispositivos de bloque de acceso aleatorio.

Un dispositivo de carácter envía o acepta un flujo de caracteres, sin ninguna estructura de bloques. No es direccionable y no tiene operación de búsqueda (seek). Ejemplos: impresoras, interfaces de red, ratones y casi todo lo que no se parece a un disco.

La clasificación no es perfecta. Los relojes no son direccionables por bloques ni generan flujos de caracteres: solo producen interrupciones a intervalos definidos. Las pantallas por asignación de memoria tampoco encajan bien. Aun así, el modelo de bloque y carácter alcanza como base para que parte del sistema operativo sea independiente de los dispositivos. Por ejemplo, el sistema de archivos trabaja solo con dispositivos de bloque abstractos y le deja la parte dependiente del dispositivo al software de bajo nivel.

Los dispositivos cubren un rango enorme de velocidades, lo que presiona al software para rendir bien en muchos órdenes de magnitud. Tabla de velocidades de transferencia (figura 5-1 del libro):

| Dispositivo | Velocidad |
|---|---|
| Teclado | 10 bytes/s |
| Ratón | 100 bytes/s |
| Módem de 56K | 7 KB/s |
| Escáner | 400 KB/s |
| Cámara de video digital | 3,5 MB/s |
| 802.11g inalámbrico | 6,75 MB/s |
| CD-ROM de 52X | 7,8 MB/s |
| Fast Ethernet | 12,5 MB/s |
| Tarjeta Compact Flash | 40 MB/s |
| FireWire (IEEE 1394) | 50 MB/s |
| USB 2.0 | 60 MB/s |
| Red SONET OC-12 | 78 MB/s |
| Disco SCSI Ultra 2 | 80 MB/s |
| Gigabit Ethernet | 125 MB/s |
| Disco SATA | 300 MB/s |
| Cinta Ultrium | 320 MB/s |
| Bus PCI | 528 MB/s |

Del teclado al bus PCI hay más de siete órdenes de magnitud de diferencia.

En Linux, los dispositivos aparecen como archivos especiales en /dev. Con ls -l /dev, la primera letra de cada línea indica el tipo: "b" para dispositivo de bloque (por ejemplo, los discos sda, sda1) y "c" para dispositivo de carácter (por ejemplo, las terminales tty, /dev/null, /dev/random). En lugar del tamaño aparecen dos números, el número mayor y el número menor del dispositivo (ver la sección 4.3).

(Tanenbaum, cap. 5.1.1, págs. 330–331) (Apunte: resumen de la cátedra, Unidad 5)

### 2.2 Controladores de dispositivos

Una unidad de E/S suele tener un componente mecánico (el dispositivo en sí) y un componente electrónico, llamado controlador de dispositivo o adaptador. En una PC el controlador es un chip en la tarjeta principal o una tarjeta insertada en una ranura de expansión (PCI). La tarjeta tiene un conector donde va el cable al dispositivo. Muchos controladores manejan dos, cuatro u ocho dispositivos idénticos. Si la interfaz entre controlador y dispositivo es estándar (ANSI, IEEE, ISO o un estándar de facto, como IDE, SATA, SCSI, USB o FireWire), distintas empresas pueden fabricar controladores o dispositivos compatibles.

Atención con la terminología: el controlador de dispositivo es hardware (el componente electrónico). El software que lo maneja se llama driver o manejador de dispositivo. La traducción del libro a veces usa "controlador" para los dos; en esta unidad, "controlador" es el hardware y "driver" es el software.

La interfaz entre el controlador y el dispositivo suele ser de muy bajo nivel. Ejemplo del libro: un disco formateado con 10.000 sectores de 512 bytes por pista. Lo que sale del disco es un flujo serial de bits: primero un preámbulo, después los 4096 bits del sector y al final una suma de comprobación o código de corrección de errores (ECC). El preámbulo se escribe al formatear e incluye el número de cilindro y de sector, el tamaño del sector e información de sincronización.

El trabajo del controlador es convertir ese flujo serial de bits en un bloque de bytes y corregir los errores. Primero arma el bloque bit por bit en un búfer interno. Cuando verificó la suma de comprobación y el bloque está libre de errores, se puede copiar a la memoria principal.

El controlador de un monitor CRT también trabaja a muy bajo nivel: lee de la memoria los bytes a mostrar y genera las señales que modulan el haz, con los retrazados horizontal y vertical. Sin el controlador, el sistema operativo tendría que programar la exploración analógica del tubo. Con él, el SO solo lo inicializa con unos pocos parámetros (caracteres o píxeles por línea, líneas por pantalla) y el controlador se encarga del haz.

Según la cátedra, el controlador traduce señales físicas en datos utilizables, corrige errores y le ofrece una interfaz uniforme al sistema operativo. El SO no controla directamente el hardware: configura el controlador y le delega el trabajo fino.

(Tanenbaum, cap. 5.1.2, págs. 331–332) (Apunte: resumen de la cátedra, Unidad 5)

### 2.3 E/S por asignación de memoria

Cada controlador tiene unos pocos registros de control para comunicarse con la CPU. Escribiendo en ellos, el sistema operativo hace que el dispositivo envíe o acepte datos, se encienda, se apague o realice otra acción. Leyéndolos, el SO conoce el estado del dispositivo, por ejemplo si está listo para un nuevo comando. Además, muchos dispositivos tienen un búfer de datos que el SO puede leer y escribir. Ejemplo: la RAM de video, un búfer donde los programas o el SO escriben los píxeles de la pantalla.

¿Cómo se comunica la CPU con esos registros y búferes? Hay dos alternativas, más una híbrida (figura 5-2 del libro, tres diagramas lado a lado):

(a) Espacios separados: a cada registro de control se le asigna un número de puerto de E/S, un entero de 8 o 16 bits. El conjunto de puertos forma el espacio de puertos de E/S, protegido para que los programas de usuario no puedan usarlo (solo el sistema operativo). Se usan instrucciones especiales: IN REG,PUERTO lee el registro de control PUERTO y lo guarda en el registro REG de la CPU; OUT PUERTO,REG escribe REG en el registro de control. Así funcionaban casi todas las primeras computadoras y las mainframes, como la IBM 360 y sus sucesoras. En este esquema, IN R0,4 y MOV R0,4 son totalmente distintas: la primera lee el puerto 4 de E/S y la segunda lee la palabra 4 de memoria. Los dos "4" pertenecen a espacios de direcciones distintos y sin relación.

(b) E/S por asignación de memoria (memory-mapped I/O): introducida con la PDP-11. Todos los registros de control se asignan al espacio de memoria: cada registro recibe una dirección de memoria única en la que no hay RAM. Normalmente esas direcciones están en la parte superior del espacio de direcciones.

(c) Híbrido: los búferes de datos van por asignación de memoria y los registros de control usan puertos de E/S separados. Es la arquitectura del Pentium: las direcciones de 640K a 1M se reservan para los búferes de datos de los dispositivos en las PC compatibles con IBM, y además hay puertos de E/S de 0 a 64K.

Cómo funcionan: en todos los casos, para leer una palabra la CPU pone la dirección en las líneas de dirección del bus e impone la señal READ en una línea de control. Una segunda línea indica si se pide espacio de E/S o de memoria. Si solo hay espacio de memoria, todos los módulos de memoria y todos los dispositivos comparan la dirección con el rango que atienden y responde el que corresponde. Como ninguna dirección se asigna a la vez a memoria y a un dispositivo, no hay conflicto.

Ventajas de la E/S por asignación de memoria:

1. Los registros de control son simples variables en memoria y se pueden manejar en C. Con instrucciones IN y OUT hace falta código ensamblador, porque en C o C++ no hay forma de ejecutarlas, y llamar a un procedimiento en ensamblador agrega sobrecarga. Con asignación de memoria, un driver se puede escribir completamente en C.
2. No hace falta un mecanismo especial de protección: alcanza con no poner esa parte del espacio de direcciones en el espacio virtual de ningún usuario. Mejor aún, si cada dispositivo tiene sus registros en una página distinta, el SO puede darle a un usuario el control de algunos dispositivos y no de otros incluyendo solo esas páginas en su tabla de páginas. Así distintos drivers pueden vivir en espacios de direcciones distintos, lo que achica el kernel y evita que un driver interfiera con otro.
3. Cualquier instrucción que referencia memoria sirve también para los registros de control. Ejemplo: con una instrucción TEST que prueba si una palabra es 0, se puede probar si un registro de control es 0 (dispositivo inactivo y listo). El ciclo de sondeo queda en tres instrucciones: CICLO: TEST PUERTO_4 / BEQ LISTO / BRANCH CICLO. Sin asignación de memoria, el registro se tiene que leer primero en la CPU y después evaluarlo: hacen falta cuatro instrucciones y se responde un poco más lento.

Desventajas:

1. La caché. Sería desastroso guardar en caché un registro de control. En el ciclo anterior, la primera lectura de PUERTO_4 lo pondría en la caché y las siguientes leerían el valor guardado sin preguntarle al dispositivo. Cuando el dispositivo por fin estuviera listo, el software no se enteraría y el ciclo seguiría para siempre. Por eso el hardware tiene que poder deshabilitar la caché en forma selectiva, por ejemplo por página, lo que complica el hardware y el sistema operativo.
2. Los buses. Si hay un solo espacio de direcciones, todos los módulos de memoria y todos los dispositivos tienen que examinar todas las referencias. Con un solo bus (figura 5-3a) es fácil. Pero las PC modernas tienen un bus de memoria dedicado de alta velocidad (figura 5-3b, arquitectura de bus dual), y los dispositivos no ven las direcciones que pasan por ese bus. Hay tres soluciones: mandar primero toda referencia a la memoria y, si no responde, probar los otros buses (más hardware); poner un dispositivo husmeador en el bus de memoria que pase las direcciones a los dispositivos (que quizá no puedan seguir la velocidad de la memoria); o filtrar las direcciones en el chip puente PCI, como hace el Pentium, con registros de rango cargados al arrancar (por ejemplo, de 640K a 1M no hay memoria y se reenvía al bus PCI). La desventaja de esto último es tener que averiguar al arrancar qué direcciones no son memoria de verdad.

Conclusión del libro y de la cátedra: cada esquema tiene argumentos a favor y en contra, y las concesiones son inevitables.

(Tanenbaum, cap. 5.1.3, págs. 332–336) (Apunte: resumen de la cátedra, Unidad 5)

### 2.4 Acceso directo a memoria (DMA)

La CPU podría pedirle los datos a un controlador de a un byte, pero desperdiciaría su tiempo. Por eso se usa DMA (Direct Memory Access, acceso directo a memoria). El SO solo puede usar DMA si el hardware tiene un controlador de DMA. A veces está integrado en cada controlador de dispositivo, pero lo más común es uno solo en la tarjeta principal que regula las transferencias de varios dispositivos, a menudo en forma concurrente.

El controlador de DMA accede al bus del sistema independientemente de la CPU. Tiene registros que la CPU puede leer y escribir: un registro de dirección de memoria, un registro contador de bytes y uno o más registros de control. Los registros de control indican el puerto de E/S a usar, la dirección de la transferencia (leer del dispositivo o escribir en él), la unidad de transferencia (un byte o una palabra por vez) y la cantidad de bytes por ráfaga.

Lectura de disco sin DMA: el controlador de disco lee el bloque bit por bit hasta tenerlo completo en su búfer interno, calcula la suma de comprobación y genera una interrupción. Entonces el sistema operativo copia el bloque del búfer del controlador a la memoria con un ciclo, de a un byte o una palabra por iteración.

Lectura de disco con DMA (figura 5-4 del libro: CPU, controlador de DMA con registros de dirección, cuenta y control, controlador de disco con su búfer y la unidad, y memoria principal, todos sobre el bus), en pasos:

1. La CPU programa el controlador de DMA: carga sus registros para que sepa qué transferir y a dónde. También le ordena al controlador de disco que lea los datos en su búfer interno y verifique la suma de comprobación.
2. Cuando hay datos válidos en el búfer, el controlador de DMA envía por el bus una petición de lectura al controlador de disco. Para el controlador de disco es una lectura cualquiera: no sabe ni le importa si vino de la CPU o del DMA. La dirección de memoria de destino va en las líneas de dirección del bus.
3. El controlador de disco escribe la siguiente palabra en memoria, en otro ciclo de bus estándar.
4. Al terminar la escritura, el controlador de disco envía una señal de reconocimiento al controlador de DMA por el bus.
5. El controlador de DMA incrementa la dirección de memoria y decrementa la cuenta de bytes. Si la cuenta sigue mayor que 0, se repiten los pasos 2 a 4.
6. Cuando la cuenta llega a 0, el controlador de DMA interrumpe a la CPU. El sistema operativo ya no tiene que copiar el bloque: ya está en memoria.

Según la cátedra: la CPU no copia los datos, solo coordina.

Variantes:
- Los controladores de DMA más simples hacen una transferencia por vez. Los más complejos tienen varios conjuntos de registros, uno por canal, y después de cada palabra deciden a qué dispositivo atender con turno rotatorio (round-robin) o prioridades. Suele haber una línea de reconocimiento distinta por canal.
- Robo de ciclo (modo de una palabra por vez): el controlador de DMA pide el bus para una palabra; si la CPU también lo quiere, espera. Se llama así porque el controlador "roba" un ciclo de bus a la CPU de vez en cuando y la retrasa un poco.
- Modo de ráfaga (modo de bloque): el controlador adquiere el bus, hace una serie de transferencias y lo libera. Es más eficiente porque adquirir el bus lleva tiempo y así se transfieren varias palabras con una sola adquisición. La desventaja es que puede bloquear a la CPU y a otros dispositivos bastante tiempo si la ráfaga es larga.
- Modo fly-by: el controlador de DMA le indica al controlador de dispositivo que transfiera directo a memoria (el caso descrito). Alternativa: el dispositivo le pasa la palabra al controlador de DMA, que hace una segunda petición de bus para escribirla. Cuesta un ciclo extra por palabra, pero permite copias de dispositivo a dispositivo e incluso de memoria a memoria.
- La mayoría de los controladores de DMA usan direcciones físicas. El sistema operativo tiene que traducir la dirección virtual del búfer a física y escribirla en el registro de dirección. Unos pocos aceptan direcciones virtuales y usan la MMU para traducirlas.

¿Por qué el controlador de disco necesita un búfer interno, en vez de guardar cada byte en memoria apenas lo lee? Dos razones:
1. Puede verificar la suma de comprobación antes de transferir. Si está mal, se señala el error y no se transfiere nada.
2. Una vez que arranca la lectura, los bits llegan del disco a velocidad constante, esté listo o no el controlador. Si tuviera que escribir cada palabra directo en memoria y el bus estuviera ocupado (por ejemplo, por otro dispositivo en modo ráfaga), tendría que guardar las palabras en otro lado y administrar todo eso. Con el bloque en el búfer, el bus no se necesita hasta que empieza el DMA, y el diseño es mucho más simple. Según la cátedra, el búfer desacopla el ritmo del dispositivo del ritmo del bus.

No todas las computadoras usan DMA. La CPU principal suele ser más rápida que el controlador de DMA y, si no tiene otro trabajo, no tiene sentido que espere al DMA lento. Además, sin controlador de DMA se ahorra dinero, lo que importa en computadoras de bajo costo (incrustadas o embebidas).

Ejemplo numérico de interrupciones con y sin DMA (elaborado con los datos del libro): para imprimir una cadena de 1000 caracteres, la E/S controlada por interrupciones produce 1000 interrupciones (una por carácter); con DMA se produce 1 sola interrupción, al terminar todo el búfer.

(Tanenbaum, cap. 5.1.4, págs. 336–339) (Apunte: resumen de la cátedra, Unidad 5)

### 2.5 Repaso de las interrupciones

Estructura de las interrupciones en una PC (figura 5-5 del libro): varios dispositivos (disco, teclado, impresora, reloj) conectados por el bus a un chip controlador de interrupciones, y este a la CPU. Los pasos son: 1. el dispositivo termina su trabajo; 2. el controlador de interrupciones emite la interrupción; 3. la CPU la reconoce. Las conexiones usan líneas de interrupción del bus, no cables dedicados.

Funcionamiento a nivel de hardware, en orden:

1. Cuando un dispositivo de E/S termina el trabajo asignado, produce una interrupción (si el sistema operativo las habilitó) imponiendo una señal en la línea del bus que tiene asignada.
2. El chip controlador de interrupciones de la tarjeta principal detecta la señal. Si no hay otras pendientes, la procesa de inmediato. Si hay otra en progreso, o si otro dispositivo pidió al mismo tiempo por una línea de mayor prioridad, ese dispositivo se ignora por el momento y sigue imponiendo la señal hasta que la CPU lo atiende.
3. Para atender, el controlador pone en las líneas de dirección un número que indica qué dispositivo pide atención e impone una señal para interrumpir a la CPU.
4. La CPU deja lo que estaba haciendo. El número se usa como índice en una tabla llamada vector de interrupciones para obtener un nuevo contador de programa, que apunta al inicio del procedimiento de servicio de interrupciones correspondiente.
5. Las trampas (traps) y las interrupciones suelen usar el mismo mecanismo desde aquí, y a menudo comparten el vector. El vector puede estar fijo en el hardware (hardwired) o en cualquier lugar de la memoria, con un registro de la CPU cargado por el SO que apunta a su origen.
6. Poco después de empezar, el procedimiento de servicio reconoce la interrupción escribiendo un valor en un puerto del controlador de interrupciones. Eso le indica que puede emitir otra. Retrasando ese reconocimiento hasta estar listo para la siguiente, la CPU evita condiciones de competencia entre interrupciones casi simultáneas.

Algunas computadoras antiguas no tienen controlador de interrupciones centralizado y cada controlador de dispositivo pide sus propias interrupciones.

Dónde se guarda el estado. Antes de iniciar el procedimiento de servicio, el hardware siempre guarda algo de información. Como mínimo, el contador de programa (PC), para poder reanudar el proceso interrumpido. En el otro extremo, todos los registros visibles y muchos internos. Opciones:
- En registros internos que el SO lee después. Problema: el controlador de interrupciones no puede recibir el reconocimiento hasta que se leyó todo, por miedo a que una segunda interrupción pise esos registros. Eso alarga los tiempos con las interrupciones deshabilitadas y puede perder interrupciones y datos.
- En la pila, que es lo que hace la mayoría. Pero, ¿la pila de quién? Si es la pila actual, puede ser la de un proceso de usuario: el apuntador quizá no sea legal (error fatal al escribir) o apunte al final de una página y, después de varias escrituras, cause un fallo de página durante el manejo de la interrupción. Y entonces, ¿dónde se guarda el estado para atender ese fallo?
- En la pila del kernel: es mucho más probable que el apuntador sea válido y apunte a una página fija. Pero pasar a modo kernel puede requerir cambiar el contexto de la MMU e invalidar casi toda la caché y el TLB, y recargarlos aumenta el tiempo de atención de la interrupción.

Interrupciones precisas e imprecisas. En las máquinas antiguas, el hardware revisaba si había una interrupción pendiente al terminar cada instrucción. Si la había, metía el PC y el PSW en la pila y arrancaba la secuencia de interrupción; al terminar el manejador, los sacaba y seguía el proceso. Se suponía que todas las instrucciones hasta esa se habían ejecutado completas y ninguna posterior. En las CPU modernas, con líneas de tubería (pipeline) y ejecución superescalar (paralela por dentro, con microoperaciones fuera de orden), eso no se cumple: cuando llega la interrupción hay muchas instrucciones en distintas etapas, y el PC probablemente apunta a la próxima instrucción a buscar, no a la última ejecutada.

Una interrupción precisa deja la máquina en un estado bien definido y cumple cuatro propiedades (Walker y Cragon, 1995):

1. El contador de programa (PC) se guarda en un lugar conocido.
2. Todas las instrucciones anteriores a la que apunta el PC se ejecutaron por completo.
3. Ninguna instrucción posterior a la que apunta el PC se ejecutó.
4. Se conoce el estado de ejecución de la instrucción a la que apunta el PC.

Las instrucciones posteriores pueden haber empezado, pero sus cambios en registros o memoria se tienen que deshacer antes de la interrupción. La instrucción apuntada puede haberse ejecutado o no, pero tiene que estar claro cuál de los dos casos es. Si la interrupción es de E/S, normalmente no empezó. Si es una trampa o un fallo de página, el PC suele apuntar a la instrucción que causó el fallo, para reiniciarla después.

Figura 5-6 del libro, descrita: (a) interrupción precisa con el PC en 316: las instrucciones 300 a 312 están ejecutadas por completo y de la 316 a la 332 ninguna se ejecutó. (b) interrupción imprecisa: alrededor del PC hay instrucciones ejecutadas al 80 %, 60 %, 20 %, 35 %, 40 %, 10 %, algunas completas y otras sin ejecutar, y las más antiguas no están necesariamente más avanzadas que las más nuevas.

Una interrupción imprecisa no cumple esas propiedades. Le complica la vida al escritor del sistema operativo, que tiene que averiguar qué pasó y qué falta. Esas máquinas vuelcan mucho estado interno en la pila; el código para reiniciar es muy complicado, y guardar tanta información en cada interrupción las vuelve más lentas. Resultado irónico: CPU superescalares muy rápidas que a veces no sirven para trabajo real por la lentitud de sus interrupciones.

Decisiones de diseño:
- Algunas máquinas hacen precisas las interrupciones de E/S y dejan imprecisas las trampas por errores fatales de programación. No es grave: no hace falta reiniciar un proceso que dividió por cero.
- Algunas tienen un bit para forzar que todas sean precisas. El costo: la CPU tiene que registrar todo lo que hace y mantener copias "sombra" de los registros, con un gran impacto en el rendimiento.
- El Pentium tiene interrupciones precisas para que el software antiguo funcione. El precio no se paga en tiempo sino en área del chip y complejidad del diseño: esa área podría usarse para cachés más grandes.

(Tanenbaum, cap. 5.1.5, págs. 339–343) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 1: tratamiento de una interrupción y cartilla de interrupciones del 8086)

---

## 3. Fundamentos del software de E/S

### 3.1 Objetivos del software de E/S

1. Independencia de dispositivos. Tiene que poder escribirse un programa que acceda a cualquier dispositivo sin especificarlo de antemano. Un programa que lee un archivo tiene que poder leerlo de un disco duro, un CD-ROM, un DVD o una memoria USB sin modificarse. El comando sort <entrada >salida tiene que funcionar con la entrada de cualquier disco o del teclado y la salida a cualquier disco o a la pantalla. El sistema operativo se encarga de que, aunque los dispositivos necesiten secuencias de comandos muy distintas, el programa no se entere.
2. Denominación uniforme. El nombre de un archivo o dispositivo es una cadena o un entero que no depende del dispositivo. En UNIX todos los discos se integran en la jerarquía del sistema de archivos. Ejemplo: una memoria USB montada en /usr/ast/respaldo; copiar un archivo a /usr/ast/respaldo/lunes lo copia a la memoria USB. Todo se direcciona igual: con un nombre de ruta.
3. Manejo de errores. Los errores se manejan lo más cerca posible del hardware. Si el controlador descubre un error de lectura, trata de corregirlo él mismo. Si no puede, lo maneja el driver, quizá releyendo el bloque. Muchos errores son transitorios (por ejemplo, una pizca de polvo en la cabeza de lectura) y desaparecen al repetir la operación. Solo si los niveles inferiores no pueden resolverlo se entera el nivel superior. Muchas veces la recuperación es transparente.
4. Transferencias síncronas (de bloqueo) contra asíncronas (controladas por interrupciones). La mayor parte de la E/S real es asíncrona: la CPU inicia la transferencia y se va a hacer otra cosa hasta que llega la interrupción. Pero los programas son mucho más fáciles de escribir si la E/S es de bloqueo: después de un read, el programa queda suspendido hasta que los datos están en el búfer. El sistema operativo hace que operaciones controladas por interrupciones parezcan de bloqueo para el usuario.
5. Uso de búferes. A menudo los datos de un dispositivo no pueden ir directo a su destino final. Ejemplo: un paquete que llega de la red; el SO no sabe dónde ponerlo hasta guardarlo y examinarlo. Además, algunos dispositivos tienen restricciones de tiempo real (por ejemplo, el audio digital): los datos se ponen por adelantado en un búfer de salida para desacoplar la velocidad de llenado de la de vaciado y evitar sub-desbordamientos. El uso de búferes implica mucho copiado y tiene un impacto importante en el rendimiento. La cátedra define: un búfer es un almacenamiento temporal.
6. Dispositivos compartidos contra dedicados. Los discos pueden usarlos muchos usuarios a la vez sin problema. Las unidades de cinta tienen que dedicarse a un solo usuario hasta que termine: si dos usuarios escriben bloques entremezclados en la misma cinta, no funciona. Los dispositivos dedicados traen problemas como los interbloqueos (Unidad 6).

(Tanenbaum, cap. 5.2.1, págs. 343–344) (Apunte: resumen de la cátedra, Unidad 5)

### 3.2 Las tres formas de hacer E/S

Hay tres maneras fundamentalmente distintas de realizar la E/S. El libro las explica con el mismo ejemplo: un proceso de usuario quiere imprimir la cadena de ocho caracteres "ABCDEFGH".

#### E/S programada

La CPU hace todo el trabajo. Pasos (figura 5-7 del libro: la cadena en espacio de usuario, copiada a espacio de kernel, y la página impresa con "A" y después "AB", marcando cuál es el siguiente carácter):

1. El proceso arma la cadena en un búfer en espacio de usuario.
2. Abre la impresora con una llamada al sistema. Si otro proceso la está usando, la llamada falla con un código de error o se bloquea hasta que se libere, según el sistema y los parámetros.
3. Hace una llamada al sistema para pedir que se imprima la cadena.
4. El sistema operativo copia el búfer a un arreglo p en espacio de kernel (el kernel quizá tenga que cambiar el mapa de memoria para acceder al espacio de usuario).
5. Comprueba si la impresora está disponible; si no, espera.
6. Copia el primer carácter al registro de datos de la impresora (en el ejemplo, por asignación de memoria). Eso activa la impresora. Escribir en el registro de datos pone el registro de estado en "no está lista".
7. Espera a que el registro de estado indique que la impresora está lista y copia el siguiente carácter. Repite hasta terminar la cadena.
8. Devuelve el control al proceso de usuario.

Código del libro (figura 5-8):

    copiar_del_usuario(bufer, p, cuenta);      /* p es el búfer del kernel */
    for (i = 0; i < cuenta; i++) {             /* itera en cada carácter */
        while (*reg_estado_impresora != READY) ;   /* itera hasta que esté lista */
        *registro_datos_impresora = p[i];      /* imprime un carácter */
    }
    regresar_al_usuario();

Lo esencial: después de cada carácter, la CPU consulta continuamente si el dispositivo está listo. Esto se llama sondeo (polling) u ocupado en espera (busy waiting). Es simple, pero ocupa la CPU todo el tiempo hasta terminar la E/S. Es razonable solo si el tiempo de espera es muy corto (por ejemplo, la impresora solo copia el carácter a un búfer interno) o en un sistema incrustado donde la CPU no tiene otra cosa que hacer.

#### E/S controlada por interrupciones

Ahora la impresora no guarda caracteres en un búfer: imprime cada uno al llegar. Si imprime 100 caracteres por segundo, cada uno tarda 10 ms. Con E/S programada, la CPU estaría 10 ms inactiva entre carácter y carácter. Esos 10 ms alcanzan de sobra para un cambio de contexto y ejecutar otro proceso.

Pasos:

1. Al hacer la llamada al sistema, el búfer se copia al kernel y el primer carácter se copia a la impresora apenas esté lista.
2. La CPU llama al planificador y se ejecuta otro proceso. El proceso que pidió imprimir queda bloqueado hasta que se imprima toda la cadena.
3. Cuando la impresora terminó un carácter y está lista para el siguiente, genera una interrupción. La interrupción detiene el proceso actual y guarda su estado.
4. Se ejecuta el procedimiento de servicio de interrupciones de la impresora. Si no quedan caracteres, desbloquea al usuario. Si quedan, imprime el siguiente, decrementa la cuenta, reconoce la interrupción y vuelve al proceso que se estaba ejecutando, que sigue donde había quedado.

Código del libro (figura 5-9):

    (a) Llamada al sistema para imprimir:
    copiar_del_usuario(bufer, p, cuenta);
    habilitar_interrupciones();
    while (*reg_estado_impresora != READY) ;
    *registro_datos_impresora = p[0];
    planificador();

    (b) Procedimiento de servicio de interrupciones de la impresora:
    if (cuenta == 0) {
        desbloquear_usuario();
    } else {
        *registro_datos_impresora = p[i];
        cuenta = cuenta - 1;
        i = i + 1;
    }
    reconocer_interrupcion();
    regresar_de_interrupcion();

La CPU solo interviene cuando llega una interrupción. El costo: una interrupción por cada carácter (por cada unidad transferida).

#### E/S mediante el uso de DMA

Como las interrupciones llevan tiempo, la E/S por interrupciones desperdicia CPU. Con DMA, el controlador de DMA le pasa los caracteres a la impresora de a uno, sin molestar a la CPU. En esencia, el DMA es E/S programada, pero la hace el controlador de DMA en vez de la CPU principal. Requiere hardware especial, pero libera a la CPU durante la E/S.

Código del libro (figura 5-10):

    (a) Llamada al sistema para imprimir:
    copiar_del_usuario(bufer, p, cuenta);
    establecer_controlador_DMA();
    planificador();

    (b) Procedimiento de servicio de interrupciones:
    reconocer_interrupcion();
    desbloquear_usuario();
    regresar_de_interrupcion();

La gran ganancia: pasar de una interrupción por carácter a una interrupción por búfer impreso. Si hay muchos caracteres y las interrupciones son lentas, es una gran mejora. Pero el controlador de DMA suele ser más lento que la CPU: si no puede manejar el dispositivo a toda velocidad, o si la CPU no tiene nada que hacer mientras espera, puede convenir la E/S por interrupciones o incluso la programada. La mayor parte del tiempo, igual, vale la pena usar DMA.

Comparación de las tres formas:

| | E/S programada | Por interrupciones | Con DMA |
|---|---|---|---|
| Quién mueve los datos | la CPU | la CPU, de a una unidad | el controlador de DMA |
| Qué hace la CPU mientras espera | sondea (ocupado en espera) | ejecuta otros procesos | ejecuta otros procesos |
| Interrupciones | ninguna | una por carácter o palabra | una por búfer completo |
| Estado del proceso que pidió la E/S | la CPU está ocupada en su llamada | bloqueado | bloqueado |
| Cuándo conviene | espera muy corta o sistema incrustado | dispositivos lentos | casi siempre |

Ejemplo resuelto 1 (las tres formas con números). Una impresora imprime 100 caracteres por segundo y se mandan 500 caracteres. Cada interrupción le cuesta a la CPU 20 microsegundos.
1. Tiempo de impresión: 500 / 100 = 5 segundos, igual en los tres casos (lo limita el dispositivo).
2. E/S programada: la CPU está ocupada los 5 segundos sondeando. CPU desperdiciada: 5 s.
3. E/S por interrupciones: 500 interrupciones × 20 µs = 10.000 µs = 10 ms de CPU. Los otros 4,99 s la CPU ejecuta otros procesos.
4. DMA: 1 interrupción × 20 µs = 0,02 ms de CPU, más el costo de programar el controlador de DMA.
Conclusión: la E/S programada desperdicia la CPU entera; la de interrupciones gasta el 0,2 % del tiempo; la de DMA, casi nada.

(Tanenbaum, cap. 5.2.2–5.2.4, págs. 344–348) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 1: las tres formas de hacer E/S; con la Unidad 2: ocupado en espera y estado bloqueado)

---

## 4. Capas del software de E/S

El software de E/S se organiza en cuatro capas, cada una con una función bien definida y una interfaz bien definida con las capas vecinas. Diagrama de capas (figura 5-11 del libro), de arriba hacia abajo:

1. Software de E/S en espacio de usuario.
2. Software del sistema operativo independiente del dispositivo.
3. Drivers de dispositivos.
4. Manejadores de interrupciones.
5. Hardware (debajo de las cuatro capas de software).

Las funcionalidades y las interfaces cambian de un sistema a otro; lo que sigue no es de una máquina concreta. Según la cátedra, esta organización oculta la complejidad del hardware, separa responsabilidades y facilita agregar dispositivos nuevos.

### 4.1 Manejadores de interrupciones

Para casi toda la E/S, las interrupciones son un hecho incómodo e inevitable. Hay que esconderlas en las entrañas del sistema operativo para que este sepa lo menos posible de ellas. La mejor forma es que el driver que inicia una operación de E/S se bloquee hasta que la operación termine y llegue la interrupción. El driver se bloquea con un down en un semáforo, un wait en una variable de condición, un receive de un mensaje o algo parecido.

Cuando llega la interrupción, el procedimiento de interrupciones hace lo necesario y desbloquea al driver que la inició: con un up en el semáforo, un signal en la variable de condición del monitor o enviándole un mensaje. El efecto neto es que un driver bloqueado puede volver a ejecutarse. El modelo funciona mejor si los drivers son procesos del kernel, con su propio estado, pila y contador de programa.

Procesar una interrupción no es solo "tomarla, hacer un up y ejecutar IRET". Los pasos en software, una vez completada la interrupción de hardware (pueden variar u omitirse según la máquina, o estar en otro orden):

1. Guardar los registros (incluido el PSW) que el hardware no guardó.
2. Establecer un contexto para el procedimiento de servicio de interrupciones. Puede requerir configurar el TLB, la MMU y una tabla de páginas.
3. Establecer una pila para el procedimiento de servicio.
4. Reconocer al controlador de interrupciones. Si no hay un controlador centralizado, rehabilitar las interrupciones.
5. Copiar los registros desde donde se guardaron (quizá una pila) a la tabla de procesos.
6. Ejecutar el procedimiento de servicio de interrupciones, que extrae información de los registros del controlador del dispositivo que interrumpió.
7. Elegir qué proceso ejecutar a continuación. Si la interrupción hizo pasar a listo a un proceso de alta prioridad que estaba bloqueado, puede elegirse ese.
8. Establecer el contexto de la MMU para el proceso elegido. Puede hacer falta configurar un TLB.
9. Cargar los registros del nuevo proceso, incluido su PSW.
10. Empezar a ejecutar el nuevo proceso.

Esto consume un número considerable de instrucciones, sobre todo con memoria virtual, donde hay que establecer tablas de páginas o guardar el estado de la MMU (por ejemplo, los bits R y M). En algunas máquinas también hay que manejar el TLB y la caché al pasar entre modo usuario y modo kernel. Según la cátedra, por eso las interrupciones son costosas en tiempo de CPU.

(Tanenbaum, cap. 5.3.1, págs. 348–349) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 2: semáforos, monitores, mensajes, cambio de contexto y estado bloqueado; con la Unidad 3: TLB, MMU y bits R y M)

### 4.2 Drivers de dispositivos

Cada controlador tiene registros para darle comandos, para leer su estado, o ambos. La cantidad de registros y la naturaleza de los comandos varían muchísimo. Un driver de ratón recibe cuánto se movió el ratón y qué botones están oprimidos. Un driver de disco tiene que saber de sectores, pistas, cilindros, cabezas, movimiento del brazo, motores y tiempos de asentamiento de las cabezas.

Por eso cada dispositivo necesita un código específico para controlarlo: el driver. Lo escribe el fabricante del dispositivo y lo entrega junto con él. Como cada sistema operativo necesita sus propios drivers, los fabricantes suelen proveerlos para varios sistemas populares. Cada driver maneja un tipo de dispositivo o, a lo sumo, una clase de dispositivos muy parecidos: un driver de disco SCSI puede manejar varios discos SCSI de distintos tamaños y velocidades, y quizá un CD-ROM SCSI. Un ratón y una palanca de mandos son tan distintos que necesitan drivers diferentes. No hay una restricción técnica para que un driver maneje dispositivos no relacionados; simplemente no es buena idea.

Dónde se ejecuta el driver. Para acceder a los registros del controlador, el driver normalmente forma parte del kernel, al menos en las arquitecturas actuales. Es posible construir drivers en espacio de usuario, con llamadas al sistema para leer y escribir los registros del dispositivo. Eso aísla al kernel de los drivers y a los drivers entre sí, y elimina una fuente importante de fallas: drivers con errores que interfieren con el kernel. Para sistemas altamente confiables es la mejor forma. Ejemplo: MINIX 3, donde los drivers son procesos de usuario. Pero como la mayoría de los sistemas de escritorio espera los drivers en el kernel, ese es el modelo que se estudia.

Posición lógica de los drivers (figura 5-12 del libro): arriba, en espacio de usuario, el proceso y el programa de usuario; abajo, en espacio de kernel, el resto del sistema operativo y debajo los drivers (de impresora, de cámara de video, de CD-ROM); más abajo, el hardware con los controladores y los dispositivos. Toda la comunicación entre el driver y el controlador pasa por el bus.

Arquitectura estándar de drivers. El sistema operativo tiene que permitir instalar drivers escritos por terceros, así que define un modelo de qué hace un driver y cómo interactúa con el resto. Los drivers se clasifican en pocas categorías; las más comunes son los dispositivos de bloque (discos, con bloques direccionables independientemente) y los de carácter (teclados e impresoras, con flujos de caracteres). La mayoría de los sistemas define una interfaz estándar que todos los drivers de bloque deben aceptar, y otra para los de carácter: un conjunto de procedimientos que el resto del SO llama, como leer un bloque o escribir una cadena de caracteres.

Carga de drivers. Durante años, en UNIX el sistema era un solo binario con todos los drivers compilados adentro: lo administraban centros de cómputo y los dispositivos cambiaban poco. Para agregar uno, el administrador recompilaba el kernel. Con las computadoras personales y la multitud de dispositivos, eso dejó de funcionar: pocos usuarios pueden recompilar o vincular el kernel. Por eso los sistemas (empezando por MS-DOS) pasaron a cargar los drivers en forma dinámica durante la ejecución.

Funciones de un driver: aceptar las peticiones abstractas de lectura y escritura del software independiente del dispositivo y hacer que se cumplan; además, inicializar el dispositivo si hace falta, administrar sus requerimientos de energía y registrar eventos.

Estructura típica de un driver, en orden:

1. Comprobar que los parámetros de entrada sean válidos; si no, devolver un error.
2. Traducir los términos abstractos a concretos. En un disco, convertir un número de bloque lineal en número de cabeza, pista, sector y cilindro según la geometría.
3. Comprobar si el dispositivo está en uso. Si lo está, poner la petición en cola para después.
4. Si está inactivo, examinar el estado del hardware. Quizá haya que encenderlo o arrancar un motor.
5. Controlar el dispositivo: enviarle una secuencia de comandos, escribiéndolos en los registros del controlador. Después de cada comando, quizá comprobar que lo aceptó y está listo para el siguiente. Algunos controladores reciben una lista de comandos en memoria y la procesan solos.
6. Esperar o no. En muchos casos el driver tiene que esperar a que el controlador haga el trabajo, y se bloquea hasta que la interrupción lo despierte. En otros la operación termina enseguida (por ejemplo, desplazar la pantalla en modo carácter solo requiere escribir unos bytes en los registros: tarda nanosegundos, sin movimiento mecánico) y el driver no se bloquea.
7. Comprobar si hubo errores.
8. Si todo está bien, pasar los datos al software independiente del dispositivo (por ejemplo, el bloque recién leído).
9. Devolver información de estado para informar los errores a quien llamó.
10. Si hay otras peticiones en la cola, seleccionar e iniciar una. Si no, bloquearse esperando la próxima.

Complicaciones reales:
- Reentrante. Un dispositivo puede terminar su operación mientras un driver se está ejecutando, y la interrupción puede hacer que se ejecute ese mismo driver. Ejemplo: mientras el driver de red procesa un paquete, llega otro. Por eso el driver tiene que ser reentrante: estar preparado para que lo llamen una segunda vez antes de terminar la primera.
- Conexión en caliente (hot plug). Se pueden agregar o quitar dispositivos con la computadora encendida. Si el usuario saca un dispositivo mientras el driver lee de él, hay que abortar la transferencia sin dañar estructuras del kernel, eliminar con cuidado las peticiones pendientes de ese dispositivo y avisarles a quienes las hicieron. Y la llegada inesperada de un dispositivo puede obligar al kernel a reasignar recursos, como las líneas de petición de interrupción.
- El driver no puede hacer llamadas al sistema, pero puede llamar a ciertos procedimientos del kernel: asignar y liberar páginas fijas de memoria para búferes, y administrar la MMU, los temporizadores, el controlador de DMA y el controlador de interrupciones.

(Tanenbaum, cap. 5.3.2, págs. 349–353) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 1: driver ≠ controlador; estructuras de los SO y microkernel)

### 4.3 Software de E/S independiente del dispositivo

Parte del software de E/S es específica de cada dispositivo y otra parte es independiente. El límite exacto depende del sistema y del dispositivo: algunas funciones que podrían ser independientes se hacen en los drivers por eficiencia. Las funciones típicas de esta capa (figura 5-13 del libro):

1. Interfaz uniforme para los drivers de dispositivos.
2. Uso de búfer.
3. Reporte de errores.
4. Asignar y liberar dispositivos dedicados.
5. Proporcionar un tamaño de bloque independiente del dispositivo.

Su función básica es realizar las funciones de E/S comunes a todos los dispositivos y ofrecer una interfaz uniforme al software de nivel de usuario.

#### Interfaz uniforme para los drivers

Si discos, impresoras y teclados se conectaran cada uno de forma distinta, habría que modificar el sistema operativo por cada dispositivo nuevo. Figura 5-14 del libro, dos diagramas: (a) sin interfaz estándar, el sistema operativo se conecta de forma distinta a un driver de disco SATA, uno IDE y uno SCSI, cada uno con funciones distintas, y cada driver nuevo exige mucho esfuerzo de programación; (b) con interfaz estándar, los tres drivers se enchufan igual, es fácil conectar uno nuevo y los programadores de drivers saben qué se espera de ellos.

Cómo funciona: para cada clase de dispositivo (discos, impresoras), el sistema operativo define el conjunto de funciones que el driver tiene que proveer. Para un disco: leer, escribir, encender y apagar la unidad, dar formato, etc. El driver tiene una tabla de apuntadores a esas funciones. Al cargarlo, el sistema registra la dirección de la tabla y después llama a las funciones en forma indirecta a través de ella. Esa tabla de apuntadores a funciones es la interfaz entre el driver y el resto del sistema, y todos los dispositivos de una clase la respetan.

Nombres de dispositivos. El software independiente del dispositivo asocia nombres simbólicos con el driver correcto. En UNIX, un nombre como /dev/disk0 identifica el nodo-i de un archivo especial. Ese nodo-i contiene:
- el número mayor de dispositivo, que identifica qué driver usar;
- el número menor de dispositivo, que se le pasa al driver como parámetro para indicar qué unidad leer o escribir.
Todos los dispositivos tienen número mayor y menor, y el mayor selecciona el driver.

Protección. En UNIX y en Windows los dispositivos aparecen en el sistema de archivos como objetos con nombre, así que se les aplican las reglas normales de protección de archivos. El administrador pone los permisos de cada dispositivo.

#### Uso de búfer

Ejemplo del libro: un proceso quiere leer datos de un módem (figura 5-15, cuatro esquemas con el proceso de usuario arriba, el kernel en el medio y el módem abajo):

(a) Entrada sin búfer: el proceso hace un read y se bloquea esperando un carácter. Cada carácter produce una interrupción; el procedimiento de servicio se lo entrega al proceso y lo desbloquea; el proceso lo guarda, pide otro y se bloquea de nuevo. Problema: hay que ejecutar el proceso de usuario por cada carácter, muchas veces y por tiempos cortos. Es ineficiente.

(b) Búfer en espacio de usuario: el proceso da un búfer de n caracteres y pide leer n. El procedimiento de servicio pone los caracteres en ese búfer hasta llenarlo y recién entonces despierta al proceso. Mucho más eficiente, pero: ¿qué pasa si la página del búfer está paginada al disco cuando llega un carácter? Se podría fijar el búfer en memoria, pero si muchos procesos fijan páginas, se reduce la reserva de páginas disponibles y baja el rendimiento.

(c) Búfer en el kernel, seguido de una copia al espacio de usuario: el manejador de interrupciones pone los caracteres en un búfer del kernel. Cuando se llena, se trae la página del búfer de usuario si hace falta y se copia todo de una vez. Más eficiente. Problema: ¿dónde van los caracteres que llegan mientras se trae del disco la página del búfer de usuario? El búfer del kernel está lleno.

(d) Doble búfer en el kernel: cuando se llena el primer búfer, y antes de vaciarlo, se usa el segundo. Mientras uno se copia al espacio de usuario, el otro acumula datos nuevos. Los dos búferes se turnan.

Búfer circular: una región de memoria con dos apuntadores. Uno apunta a la siguiente palabra libre, donde se ponen datos nuevos; el otro, a la primera palabra con datos que todavía no se sacaron. Muchas veces el hardware avanza el primero al agregar datos (por ejemplo, de la red) y el sistema operativo avanza el segundo al procesarlos. Los dos vuelven al principio al llegar al final.

Búfer en la salida. Un proceso hace write de n caracteres al módem. Si el sistema lo bloquea hasta escribirlos todos, puede tardar mucho en una línea telefónica lenta. Si lo libera enseguida y hace la E/S mientras el usuario sigue calculando, ¿cómo sabe el proceso cuándo puede reutilizar su búfer? Una señal o interrupción de software es difícil de programar y propensa a condiciones de competencia. La mejor solución: el kernel copia los datos a un búfer propio y desbloquea enseguida al proceso, que ya puede reutilizar su búfer sin importar cuándo termine la E/S.

Desventaja: demasiadas copias reducen el rendimiento. Ejemplo de la red (figura 5-16 del libro, con cinco pasos numerados entre el proceso emisor, el kernel, el controlador de red, la red y el receptor):
1. El kernel copia el paquete del usuario a un búfer del kernel, para que el usuario siga enseguida y pueda reutilizar su búfer.
2. Al llamar al driver, el paquete se copia al controlador de red. No se manda directo desde la memoria del kernel porque, una vez iniciada la transmisión, tiene que seguir a velocidad uniforme, y el controlador no puede garantizar acceder a memoria a ese ritmo (el DMA y otros dispositivos pueden robar ciclos); si una palabra no llega a tiempo, se arruina el paquete.
3. Del búfer interno del controlador se copia a la red. El último bit llega al receptor justo después de enviado, y queda en el búfer de su controlador.
4. Se copia al búfer del kernel del receptor.
5. Se copia al búfer del proceso receptor, que normalmente manda un reconocimiento. Recién al recibirlo el emisor puede mandar el segundo paquete.
Todas estas copias son secuenciales y reducen mucho la velocidad de transmisión.

Según la cátedra: el búfer mejora el rendimiento y desacopla la velocidad del dispositivo de la del proceso, con técnicas como el búfer en kernel, el doble búfer y el búfer circular; evita pérdidas de datos y reduce las activaciones de procesos, a costa de copias múltiples.

#### Reporte de errores

Los errores son mucho más comunes en la E/S que en otros contextos. Muchos son específicos del dispositivo y los maneja el driver, pero el marco de manejo de errores es independiente del dispositivo. Dos clases:

1. Errores de programación: el proceso pide algo imposible, como escribir en un dispositivo de entrada (teclado, escáner, ratón) o leer de uno de salida (impresora, plotter); o da una dirección de búfer inválida u otro parámetro inválido; o pide un dispositivo que no existe (el disco 3 cuando solo hay dos). Acción: devolver un código de error a quien llamó.
2. Errores de E/S reales: escribir un bloque de disco dañado o leer de una cámara apagada. Decide el driver; si no sabe qué hacer, le pasa el problema al software independiente del dispositivo. Si es un error de lectura simple y hay un usuario interactivo, puede mostrar un cuadro de diálogo con opciones: reintentar cierto número de veces, ignorar el error o eliminar el proceso. Si no hay usuario, quizá la única opción sea que la llamada falle con un código de error. Algunos errores no admiten eso: si se destruyó una estructura crítica, como el directorio raíz o la lista de bloques libres, el sistema quizá tenga que mostrar un mensaje y terminar.

#### Asignación y liberación de dispositivos dedicados

Algunos dispositivos, como los grabadores de CD-ROM, solo los puede usar un proceso por vez. El sistema operativo examina las peticiones y las acepta o rechaza según la disponibilidad. Dos formas:
1. Que los procesos hagan open directamente sobre el archivo especial del dispositivo. Si no está disponible, el open falla. Cerrarlo lo libera.
2. Mecanismos especiales para pedir y liberar. Si el dispositivo no está disponible, el proceso se bloquea en vez de fallar y queda en una cola. Cuando se libera, lo adquiere el primero de la cola.

#### Tamaño de bloque independiente del dispositivo

Distintos discos pueden tener sectores de distinto tamaño. Esta capa lo oculta y ofrece un tamaño de bloque uniforme a los niveles superiores, por ejemplo tratando varios sectores como un solo bloque lógico. Así los niveles superiores ven dispositivos abstractos con el mismo tamaño de bloque lógico. Lo mismo con los dispositivos de carácter: unos envían un byte por vez (módems) y otros unidades más grandes (interfaces de red); esa diferencia también se oculta.

(Tanenbaum, cap. 5.3.3, págs. 353–358) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 4: archivos especiales en /dev, número mayor y menor en el nodo-i, permisos; con la Unidad 3: páginas fijas en memoria)

### 4.4 Software de E/S en espacio de usuario

Una pequeña parte del software de E/S son bibliotecas vinculadas con los programas de usuario, e incluso programas enteros fuera del kernel.

Bibliotecas. Las llamadas al sistema, incluidas las de E/S, se hacen con procedimientos de biblioteca. Si un programa en C contiene cuenta = write(da, bufer, nbytes);, el procedimiento de biblioteca write se vincula con el programa y queda en el binario en memoria. Algunos procedimientos hacen trabajo real, en particular dar formato a la entrada y la salida. Ejemplo: printf("El cuadrado de %3d es %6d\n", i, i*i); arma una cadena con "El cuadrado de", el valor de i en 3 caracteres, "es", i² en 6 caracteres y un salto de línea, y después llama a write para imprimirla. Para la entrada está scanf, que lee datos y los guarda en variables según una cadena de formato con la misma sintaxis. Según la cátedra: las bibliotecas se encargan del formato de los datos y el kernel solo de la transferencia.

Spooling (uso de colas). Es la forma de manejar dispositivos dedicados en un sistema multiprogramado. Ejemplo, la impresora: sería fácil dejar que cualquier proceso abra el archivo especial de la impresora, pero si uno lo abre y no hace nada durante horas, nadie más puede imprimir. En su lugar:
1. Se crea un proceso especial, el demonio, y un directorio especial, el directorio de cola de impresión (spool).
2. Para imprimir, un proceso genera todo el archivo y lo deja en el directorio de cola.
3. El demonio, que es el único con permiso para usar el archivo especial de la impresora, imprime los archivos del directorio.
Al proteger el archivo especial contra el uso directo, nadie puede tenerlo abierto innecesariamente. El spooling también se usa en la red: un demonio de red transmite los archivos que los usuarios dejan en un directorio de cola de red. Ejemplo: el sistema de noticias USENET, con millones de máquinas y miles de grupos de noticias; para publicar, el programa de noticias deja el mensaje en un directorio de cola para transmitirlo después. Todo el sistema de noticias se ejecuta fuera del sistema operativo. Según la cátedra, el spooling evita bloqueos innecesarios, mejora la equidad y permite manejar dispositivos lentos.

### 4.5 Resumen de las capas: el recorrido de una lectura

Figura 5-17 del libro, una tabla de niveles con sus funciones (la petición baja y la respuesta sube):

| Nivel | Funciones |
|---|---|
| Procesos de usuario | hacer la llamada de E/S; dar formato a la E/S; spooling |
| Software independiente del dispositivo | nombres, protección, bloqueo, búfer, asignación |
| Drivers de dispositivos | establecer los registros del dispositivo; verificar el estado |
| Manejadores de interrupciones | despertar al driver cuando termina la E/S |
| Hardware | realizar la operación de E/S |

Recorrido de un read de un bloque de archivo, en orden:

1. El programa de usuario hace la llamada al sistema y se invoca al sistema operativo.
2. El software independiente del dispositivo busca el bloque en la caché de búfer.
3. Si no está, llama al driver, que envía la petición al hardware para traerlo del disco.
4. El proceso se bloquea hasta que termine la operación de disco.
5. Cuando el disco termina, el hardware genera una interrupción.
6. El manejador de interrupciones averigua qué dispositivo pide atención, extrae su estado y despierta al proceso dormido.
7. El proceso termina la petición de E/S y continúa.

(Tanenbaum, cap. 5.3.4, págs. 359–360) (Apunte: resumen de la cátedra, Unidad 5) (Relación con la Unidad 1: llamadas al sistema y los pasos de read; con la Unidad 2: el spooler de impresión como ejemplo de condición de carrera; con la Unidad 4: la caché de búfer)

---

## 5. Discos

Los discos son conceptualmente simples pero muy importantes. Según la cátedra, son críticos porque se usan como memoria secundaria, tanto para los sistemas de archivos como para la paginación.

Los más comunes son los discos magnéticos (duros y flexibles). Leer y escribir es igual de rápido, lo que los hace ideales como memoria secundaria. A veces se usan arreglos de discos para tener almacenamiento muy confiable. Para distribuir programas, datos y películas son importantes los discos ópticos (CD-ROM, CD grabable y DVD).

### 5.1 Discos magnéticos

Organización: los discos magnéticos se organizan en cilindros. Cada cilindro tiene tantas pistas como cabezas apiladas verticalmente. Las pistas se dividen en sectores. Hay de 8 a 32 sectores por pista en los disquetes y hasta varios cientos en los discos duros. La cantidad de cabezas va de 1 a 16. Según la cátedra, el cilindro es el conjunto de pistas alineadas verticalmente y el sector es la unidad mínima de lectura y escritura.

Descripción del dibujo: una pila de platos que giran sobre un eje común; sobre cada superficie, una cabeza montada en un brazo; todos los brazos se mueven juntos. Las pistas son círculos concéntricos en cada superficie; las pistas que están a la misma distancia del eje en todas las superficies forman un cilindro.

Los discos antiguos tenían poca electrónica y solo producían un flujo de bits serial; el controlador hacía casi todo. Los discos IDE (Integrated Drive Electronics, electrónica de unidad integrada) y SATA (Serial ATA) tienen dentro de la unidad un microcontrolador que hace mucho trabajo y le permite al controlador real emitir comandos de más alto nivel. Ese microcontrolador suele guardar pistas en caché, reasignar los bloques defectuosos y mucho más.

Búsquedas traslapadas (overlapped seeks): un controlador puede buscar en dos o más unidades al mismo tiempo. Mientras espera que termine la búsqueda en una unidad, inicia otra búsqueda en otra. Muchos controladores pueden además leer o escribir en una unidad mientras buscan en otras. Un controlador de disquete no puede leer o escribir en dos unidades a la vez, porque la transferencia le consume casi todo su poder de cómputo. Con discos duros de controlador integrado, varias unidades pueden transferir a la vez entre el disco y el búfer del controlador, pero solo es posible una transferencia por vez entre el controlador y la memoria principal. Hacer varias operaciones a la vez puede reducir mucho el tiempo de acceso promedio.

Comparación de 20 años de discos (figura 5-18 del libro):

| Parámetro | Disquete IBM de 360 KB | Disco duro WD 18300 |
|---|---|---|
| Cilindros | 40 | 10.601 |
| Pistas por cilindro | 2 | 12 |
| Sectores por pista | 9 | 281 (promedio) |
| Sectores por disco | 720 | 35.742.000 |
| Bytes por sector | 512 | 512 |
| Capacidad | 360 KB | 18,3 GB |
| Búsqueda entre cilindros adyacentes | 6 ms | 0,8 ms |
| Búsqueda promedio | 77 ms | 6,9 ms |
| Tiempo de rotación | 200 ms | 8,33 ms |
| Arranque y parada del motor | 250 ms | 20 s |
| Transferir 1 sector | 22 ms | 17 µs |

No todo mejoró igual: la búsqueda promedio es siete veces mejor, la velocidad de transferencia 1300 veces mejor y la capacidad 50.000 veces. Las piezas móviles mejoran de a poco; la densidad de bits en las superficies, muchísimo.

Nota: un tiempo de rotación de 8,33 ms corresponde a 7200 RPM (60.000 ms / 7200 vueltas = 8,33 ms por vuelta).

Zonas y geometría virtual. La geometría que usa el controlador casi siempre difiere del formato físico. En los discos antiguos todas las pistas tenían la misma cantidad de sectores. Los modernos se dividen en zonas, con más sectores en las zonas exteriores que en las interiores. Figura 5-19 del libro: (a) un disco chico con dos zonas, la exterior con 32 sectores por pista y la interior con 16; (b) una posible geometría virtual del mismo disco, con la misma cantidad de sectores por pista en todas. En los dos casos el disco tiene 192 sectores; solo cambia el arreglo publicado. Un disco real como el WD 18300 tiene 16 o más zonas, y la cantidad de sectores crece alrededor del 4 % por zona desde adentro hacia afuera.

Para ocultar cuántos sectores tiene cada pista, los discos modernos le presentan al sistema operativo una geometría virtual: el software actúa como si hubiera x cilindros, y cabezas y z sectores por pista, y el controlador traduce cada petición (x, y, z) al cilindro, cabeza y sector reales.

En las PC, los valores máximos suelen ser 65.535 cilindros, 16 cabezas y 63 sectores (la traducción del libro escribe "5535", que es un error de imprenta), por compatibilidad con la IBM PC original, que usaba campos de 16, 4 y 6 bits; los cilindros y sectores se numeran desde 1 y las cabezas desde 0. Con esos parámetros y 512 bytes por sector, el disco más grande posible es de 31,5 GB. Para superar ese límite, los discos modernos usan direccionamiento de bloques lógicos (LBA, Logical Block Addressing): los sectores se numeran consecutivamente desde 0, sin importar la geometría.

(Tanenbaum, cap. 5.4.1, págs. 361–363) (Apunte: resumen de la cátedra, Unidad 5)

### 5.2 RAID

El rendimiento de la CPU crece exponencialmente (se duplica cada 18 meses aproximadamente); el del disco, no. En los años 70 la búsqueda promedio de un disco de minicomputadora era de 50 a 100 ms; hoy, algo menos de 10 ms. La brecha entre CPU y disco es cada vez mayor. Así como se usa procesamiento en paralelo para la CPU, se pensó en E/S en paralelo.

En 1988, Patterson y colaboradores propusieron seis organizaciones de discos para mejorar el rendimiento, la confiabilidad o las dos cosas. La industria las adoptó y nació un nuevo tipo de dispositivo: el RAID. Patterson lo definió como Redundant Array of Inexpensive Disks (arreglo redundante de discos económicos); la industria cambió la I por "Independiente". El "villano" era el SLED (Single Large Expensive Disk, un solo disco grande y costoso).

Idea básica: poner una caja llena de discos al lado de la computadora (normalmente un servidor grande), reemplazar la tarjeta controladora de discos por un controlador RAID, copiar los datos al RAID y seguir operando normalmente. Para el sistema operativo, el RAID se ve como un SLED, pero con mejor rendimiento y confiabilidad. Como los discos SCSI rinden bien, son baratos y se pueden poner hasta siete por controlador (15 con SCSI amplio), la mayoría de los RAID son un controlador RAID SCSI más una caja de discos SCSI que el SO ve como un solo disco grande. No hace falta cambiar el software: gran argumento de venta.

Todos los RAID distribuyen los datos entre las unidades para operar en paralelo. Patterson definió los niveles RAID 0 a RAID 5. La palabra "nivel" engaña: no hay jerarquía, son seis organizaciones distintas.

Figura 5-20 del libro, seis diagramas con las unidades lado a lado (las de respaldo y paridad sombreadas):
- (a) RAID 0: cuatro discos; el disco 1 tiene los bloques 0, 4, 8; el disco 2, los bloques 1, 5, 9; el disco 3, los bloques 2, 6, 10; el disco 4, los bloques 3, 7, 11.
- (b) RAID 1: los mismos cuatro discos de (a) más otros cuatro idénticos de respaldo.
- (c) RAID 2: siete discos sincronizados, cada uno con un bit (bits 1 a 7) de una palabra con código de Hamming.
- (d) RAID 3: cuatro discos con los bits 1 a 4 de cada palabra y un quinto disco con el bit de paridad.
- (e) RAID 4: como RAID 0 con bloques 0 a 11, más un quinto disco con las paridades P0-3, P4-7 y P8-11.
- (f) RAID 5: cinco discos con los bloques y las paridades repartidas por turno rotatorio: la paridad de la primera banda (P0-3) en el último disco, la de la segunda (P4-7) en el cuarto, la de la tercera (P8-11) en el tercero, y así sucesivamente.

RAID nivel 0 (reparto de bloques, sin redundancia). El disco virtual se divide en bandas (strips) de k sectores: los sectores 0 a k−1 son la banda 0, los sectores k a 2k−1 la banda 1, etc. Con k = 1, cada banda es un sector. Las bandas consecutivas se escriben en las unidades por turno rotatorio (round-robin). Distribuir así los datos se llama reparto de bloques (striping). Si el software pide leer cuatro bloques consecutivos que empiezan en un límite de banda, el controlador RAID lo divide en cuatro comandos, uno por disco, y los cuatro trabajan en paralelo: E/S en paralelo sin que el software lo sepa.
- Funciona mejor cuanto más grandes son las peticiones. Si una petición es mayor que (cantidad de unidades × tamaño de banda), algunas unidades reciben varias peticiones y, al terminar la primera, empiezan la segunda. El controlador divide la petición, manda los comandos correctos en el orden correcto y arma los resultados en memoria. Rendimiento excelente e implementación sencilla.
- Funciona peor con sistemas que piden de a un sector: el resultado es correcto, pero no hay paralelismo.
- La confiabilidad es peor que la de un SLED. Si cada uno de los cuatro discos tiene un tiempo medio entre fallas de 20.000 horas, cada 5000 horas falla alguna unidad y se pierden todos los datos. Un SLED de 20.000 horas es cuatro veces más confiable. Como no hay redundancia, en realidad no es un RAID verdadero.

RAID nivel 1 (espejo). Duplica todos los discos: cuatro primarios y cuatro de respaldo. Cada escritura se hace dos veces. En una lectura se puede usar cualquiera de las copias, repartiendo la carga. Escribir no es más rápido que con una sola unidad; leer puede ser hasta el doble de rápido. La tolerancia a fallas es excelente: si una unidad falla, se usa la copia. Recuperar es instalar una unidad nueva y copiarle la de respaldo.

RAID nivel 2 (por palabra o byte, con Hamming). Cada byte del disco virtual se divide en dos nibbles de 4 bits; a cada nibble se le agrega un código de Hamming para formar una palabra de 7 bits, en la que los bits 1, 2 y 4 son de paridad. Las siete unidades están sincronizadas en la posición del brazo y en la posición rotacional, y cada una guarda un bit de la palabra. La Thinking Machines CM-2 usaba este esquema: palabras de 32 bits más 6 de paridad (palabra de Hamming de 38 bits) más un bit de paridad de palabra, repartidas en 39 discos. La tasa de transferencia era inmensa: en el tiempo de un sector escribía 32 sectores de datos. Perder un disco no era problema: era perder 1 bit en cada palabra de 39, que el código de Hamming corregía al instante. En contra: todas las unidades deben estar sincronizadas rotacionalmente, solo tiene sentido con muchas unidades (aun con 32 de datos y 6 de paridad, la sobrecarga es del 19 %) y exige mucho al controlador, que hace una suma de Hamming por cada tiempo de bit.

RAID nivel 3 (por palabra, con un bit de paridad). Versión simplificada del nivel 2: se calcula un solo bit de paridad por palabra y se escribe en una unidad de paridad. Las unidades deben estar exactamente sincronizadas, porque cada palabra se reparte entre varias. Un solo bit de paridad parecería servir solo para detectar errores, y para errores aleatorios es así. Pero cuando falla una unidad corrige el error de 1 bit, porque se sabe qué posición está mal: el controlador supone que todos los bits de la unidad caída son 0; si una palabra da error de paridad, el bit perdido era 1 y se corrige. Los niveles 2 y 3 dan velocidades de transferencia muy altas, pero la cantidad de peticiones de E/S separadas por segundo no es mayor que la de una sola unidad.

RAID nivel 4 (por bloques, con disco de paridad). Vuelve a trabajar con bandas, como el nivel 0, y no necesita unidades sincronizadas. Se escribe una paridad banda por banda en una unidad extra: si cada banda tiene k bytes, se hace un OR EXCLUSIVO (XOR) de todas las bandas y se obtiene una banda de paridad de k bytes. Si una unidad falla, los bytes perdidos se recalculan con la paridad, leyendo todas las demás unidades. Protege contra la pérdida de una unidad, pero rinde mal en actualizaciones chicas: si cambia un sector, hay que leer todas las unidades para recalcular la paridad y reescribirla. Optimización: leer el dato viejo del usuario y la paridad vieja y recalcular la nueva paridad a partir de ellos; aun así, una actualización chica cuesta dos lecturas y dos escrituras. La unidad de paridad, muy cargada, puede volverse un cuello de botella.

RAID nivel 5 (por bloques, con paridad distribuida). Elimina el cuello de botella repartiendo la paridad uniformemente entre todas las unidades por turno rotatorio. Desventaja: si falla una unidad, reconstruir su contenido es un proceso complejo.

Tabla comparativa de los niveles RAID:

| Nivel | Unidad de reparto | Redundancia | Tolerancia a fallas | A favor | En contra |
|---|---|---|---|---|---|
| 0 | bandas de sectores | ninguna | ninguna (peor que un SLED) | rendimiento excelente con peticiones grandes, simple | no es un RAID verdadero; pierde todo si falla un disco |
| 1 | bandas, duplicadas | copia completa (espejo) | excelente | lectura hasta el doble de rápida; recuperar = copiar | duplica la cantidad de discos; escribir no mejora |
| 2 | bits (Hamming) | bits de Hamming | corrige un disco caído al vuelo | transferencia inmensa | discos sincronizados; muchas unidades; controlador exigido |
| 3 | bits | 1 disco de paridad | un disco (se sabe cuál falló) | transferencia muy alta, más simple que el 2 | discos sincronizados; pocas peticiones por segundo |
| 4 | bandas | 1 disco de paridad (XOR) | un disco | no necesita sincronización | escrituras chicas: 2 lecturas + 2 escrituras; el disco de paridad es cuello de botella |
| 5 | bandas | paridad distribuida | un disco | sin cuello de botella de paridad | reconstruir un disco caído es complejo |

Ejemplo resuelto 2 (paridad XOR de RAID 4 y 5). Cuatro discos de datos con una banda de 4 bits cada uno: D1 = 1011, D2 = 0110, D3 = 1100, D4 = 0001.
1. Paridad = D1 XOR D2 XOR D3 XOR D4. D1 XOR D2 = 1101; XOR D3 = 0001; XOR D4 = 0000. La paridad es P = 0000.
2. Falla el disco D3. Se reconstruye con D3 = D1 XOR D2 XOR D4 XOR P = 1011 XOR 0110 XOR 0001 XOR 0000. 1011 XOR 0110 = 1101; XOR 0001 = 1100; XOR 0000 = 1100. Se recupera D3 = 1100, que era el valor original.
3. Actualización chica: D2 pasa de 0110 a 0111. Nueva paridad = paridad vieja XOR dato viejo XOR dato nuevo = 0000 XOR 0110 XOR 0111 = 0001. Se hicieron dos lecturas (dato viejo y paridad vieja) y dos escrituras (dato nuevo y paridad nueva).

Ejemplo resuelto 3 (confiabilidad de RAID 0). Con N discos de tiempo medio entre fallas T horas cada uno, el arreglo sin redundancia falla, en promedio, cada T / N horas. Con N = 4 y T = 20.000 horas: 20.000 / 4 = 5000 horas. Un solo disco grande (SLED) de 20.000 horas es cuatro veces más confiable.

(Tanenbaum, cap. 5.4.1, págs. 363–367) (Relación con la Unidad 4: los respaldos disco a disco; con la Unidad 1: la paridad y el código de Hamming)

### 5.3 CD-ROM

Los discos ópticos tienen densidades de grabación mucho mayores que los magnéticos. La primera generación la inventó Philips para películas (LaserVision, de 30 cm). En 1980, Philips y Sony crearon el CD (disco compacto), que reemplazó al disco de vinilo de 33 1/3 RPM. Sus detalles se publicaron en el estándar internacional IS 10149, el "Libro rojo" por el color de su tapa, para que los CD de distintos sellos y los reproductores de distintos fabricantes funcionen entre sí. Todos los CD miden 120 mm de diámetro y 1,2 mm de grosor, con un agujero de 15 mm en el medio. El CD de audio fue el primer medio de almacenamiento digital masivo; se supone que duran 100 años.

Fabricación: un láser infrarrojo de alta potencia quema hoyos de 0,8 micrones en un disco maestro de vidrio. Con él se hace un molde con protuberancias en lugar de hoyos, se le inyecta resina de policarbonato fundido y se forma el CD con el mismo patrón. Encima se deposita una capa muy delgada de aluminio reflector, una laca protectora y la etiqueta. Las depresiones se llaman hoyos (pits) y las zonas sin quemar, áreas lisas (lands).

Lectura: un diodo láser de baja energía emite luz infrarroja de 0,78 micrones. Los hoyos tienen una altura de un cuarto de la longitud de onda, así que la luz reflejada en un hoyo queda desfasada media longitud de onda respecto de la reflejada alrededor, interfiere en forma destructiva y vuelve menos luz al fotodetector. Así se distingue un hoyo de un área lisa. En lugar de usar hoyo = 0 y área lisa = 1, es más confiable codificar un 1 como una transición (de hoyo a área lisa o al revés) y un 0 como la ausencia de transición.

Figura 5-21 del libro: una sola espiral continua de hoyos y áreas lisas, que empieza cerca del agujero central y avanza 32 mm hacia el borde, con un bloque de 2K de datos de usuario marcado sobre ella. La espiral da 22.188 vueltas (unas 600 por milímetro); desenrollada mediría 5,6 km.

Velocidad lineal constante: para reproducir música a velocidad uniforme, los hoyos tienen que pasar a velocidad lineal constante, así que el CD gira más lento a medida que la cabeza va hacia afuera: 530 RPM adentro y 200 RPM afuera, para 120 cm/s. Un disco magnético, en cambio, gira a velocidad angular constante, y a 3600–7200 RPM.

CD-ROM: en 1984 Philips y Sony publicaron el "Libro amarillo", el estándar del CD-ROM (Compact Disk Read Only Memory). Para aprovechar el mercado del audio, los CD-ROM tenían que tener el mismo tamaño, ser compatibles mecánica y ópticamente, y fabricarse con las mismas máquinas: por eso usan motores lentos de velocidad variable y cuestan muy por debajo de un dólar en volumen. El Libro amarillo definió el formato de los datos y mejoró la corrección de errores, porque a los usuarios de computadoras sí les importa perder bits.

Formato en niveles (figura 5-22 del libro):
1. Cada byte se codifica en un símbolo de 14 bits (8 de datos y 6 de corrección). La conversión de 14 a 8 la hace el hardware con una tabla.
2. 42 símbolos consecutivos forman una trama de 14 × 42 = 588 bits. Cada trama lleva 192 bits de datos (24 bytes) y 396 bits de control y corrección de errores (252 en los símbolos de 14 bits y 144 en los de 8).
3. Lo que agrega el Libro amarillo: 98 tramas forman un sector de CD-ROM. Un sector de modo 1 tiene un preámbulo de 16 bytes, 2048 bytes de datos y 288 bytes de ECC (un código Reed-Solomon cruzado entrelazado): 2352 bytes en total.

El preámbulo: los primeros 12 bytes son 00FFFFFFFFFFFFFFFFFFFF00 (hexadecimal), para reconocer el inicio de un sector; los 3 siguientes, el número de sector, necesario porque buscar en una sola espiral es mucho más difícil que en pistas concéntricas (el software calcula a dónde ir, mueve la cabeza y busca un preámbulo para ver qué tan bien le fue); el último byte es el modo.

Modo 1: la distribución anterior, con 2048 bytes de datos. Modo 2: junta los campos de datos y ECC en un campo de datos de 2336 bytes, para aplicaciones que no necesitan corrección de errores, como audio y video.

Tres niveles de corrección de errores: dentro del símbolo (errores de un bit), dentro de la trama (ráfagas cortas) y dentro del sector (errores residuales). El precio: hacen falta 98 tramas de 588 bits (7203 bytes) para transferir 2048 bytes, una eficiencia de solo el 28 %.

Velocidad: una unidad de velocidad simple (1x) lee 75 sectores por segundo: 75 × 2048 = 153.600 bytes/s en modo 1 y 75 × 2336 = 175.200 bytes/s en modo 2. Una de 40x transfiere 40 × 153.600 bytes/s, si la interfaz, el bus y el sistema operativo lo permiten. Un CD de audio de 74 minutos usado para datos en modo 1 tiene 681.984.000 bytes, que se informa como 650 MB porque 1 MB = 2²⁰ = 1.048.576 bytes. Ni un CD-ROM de 32x (4.915.200 bytes/s) alcanza a un disco SCSI rápido de 10 MB/s, y la búsqueda del CD-ROM tarda varios cientos de milisegundos.

Ejemplo resuelto 4 (capacidad de un CD de 74 minutos). 74 minutos × 60 = 4440 segundos. 4440 s × 75 sectores/s = 333.000 sectores. 333.000 × 2048 bytes = 681.984.000 bytes. Dividido por 1.048.576 = 650,4 MB.

En 1986 Philips publicó el "Libro verde": gráficos y la posibilidad de intercalar audio, video y datos en el mismo sector, esencial para multimedia.

Sistema de archivos: para que un CD-ROM se lea en cualquier computadora, representantes de muchas empresas se reunieron en Lake Tahoe (región High Sierra) e idearon el sistema High Sierra, que evolucionó al estándar IS 9660, con tres niveles:
- Nivel 1: nombres de hasta 8 caracteres más una extensión opcional de hasta 3 (convención de MS-DOS); solo mayúsculas, dígitos y guion bajo; directorios anidados hasta ocho niveles, sin extensiones en sus nombres; todos los archivos contiguos (no es problema en un medio de una sola escritura). Se lee en MS-DOS, Apple, UNIX y casi cualquier computadora.
- Nivel 2: nombres de hasta 32 caracteres.
- Nivel 3: archivos no contiguos.
- Extensiones Rock Ridge (nombradas por el pueblo de la película Blazing Saddles): nombres muy largos para UNIX, UID, GID y vínculos simbólicos. Los CD-ROM que no cumplen el nivel 1 no se leen en todas las computadoras.

Atención: en el capítulo 4 (sección 4.5.1) el libro da algunos detalles distintos del IS 9660 (por ejemplo, 31 caracteres en el nivel 2). Ese tema ya se vio en la Unidad 4.

(Tanenbaum, cap. 5.4.1, págs. 367–371) (Relación con la Unidad 4: ISO 9660 y la asignación contigua)

### 5.4 CD grabable (CD-R)

A mediados de los 90 los grabadores de CD ya eran un periférico común. Lo escrito no se puede borrar. Se usan como respaldo de discos duros y para producir CD-ROM propios o maestros para plantas de duplicación.

Física (figura 5-23 del libro, corte transversal: de arriba abajo, etiqueta impresa, laca protectora, capa dorada reflectora, capa de colorante y sustrato de policarbonato de 1,2 mm; debajo, el láser con su lente, prisma y fotodetector, y un punto oscuro quemado en el colorante): el disco en blanco de policarbonato de 120 mm tiene una ranura de 0,6 mm para guiar el láser, con una oscilación sinusoidal de 0,3 mm a exactamente 22,05 kHz para controlar la velocidad de rotación. Tiene la parte superior dorada porque usa oro en vez de aluminio. Entre el policarbonato y el oro hay una capa de colorante (cianina, verde, o ptalocianina, naranja amarillento). Al principio el colorante es transparente. Para escribir, el láser va a alta potencia (8 a 16 mW): calienta un punto, rompe un enlace químico y crea un punto oscuro. Al leer (a 0,5 mW) el fotodetector distingue los puntos oscuros de las zonas intactas, y eso se interpreta como hoyos y áreas lisas, incluso en un lector de CD-ROM común.

El "Libro naranja" (1989) define el CD-R y el formato CD-ROM XA, que permite escritura incremental: unos sectores hoy y otros otro día. Un grupo de sectores consecutivos escritos de una vez es una pista de CD-ROM. Uno de los primeros usos fue el PhotoCD de Kodak, que agregaba fotos nuevas en pistas separadas.

Problema de la escritura incremental: antes, cada CD-ROM tenía una sola VTOC (Volume Table of Contents, tabla de contenido del volumen) al principio. La solución del Libro naranja: cada pista tiene su propia VTOC, que puede listar algunos o todos los archivos de las pistas anteriores. Al insertar el CD-R, el sistema operativo busca la VTOC más reciente, que da el estado actual. Si la VTOC actual omite archivos de pistas anteriores, se da la ilusión de que se borraron. Las pistas se agrupan en sesiones: CD-ROM multisesión. Los reproductores de audio no los manejan porque esperan una sola VTOC al principio.

Protección contra copia: grabar las longitudes de los archivos como de varios gigabytes para frustrar el copiado estándar; usar ECC incorrectos a propósito en algunos sectores, esperando que el copiador los "corrija" (el software original se niega a funcionar si están correctos); o huecos no estándar entre pistas y otros "defectos" físicos.

### 5.5 CD regrabable (CD-RW)

Mismo tamaño que el CD-R, pero la capa de grabación es una aleación de plata, indio, antimonio y telurio con dos estados estables, cristalino y amorfo, de distinta reflectividad. El láser usa tres potencias:
- alta: funde la aleación y la pasa del estado cristalino (alta reflectividad) al amorfo (baja reflectividad): un hoyo;
- media: la funde y vuelve a formarse en estado cristalino: un área lisa otra vez;
- baja: solo detecta el estado, para leer.
No reemplazó al CD-R porque los CD-RW en blanco son más caros y, para respaldos, que el CD-R no se pueda borrar por accidente es una ventaja.

### 5.6 DVD

DVD significaba Digital Video Disk; oficialmente hoy es Digital Versatile Disk. Mismo diseño general que el CD (policarbonato de 120 mm, hoyos, áreas lisas, diodo láser y fotodetector), con tres novedades:
1. Hoyos más chicos: 0,4 micrones contra 0,8 del CD.
2. Espiral más apretada: 0,74 micrones entre pistas contra 1,6 del CD.
3. Láser rojo de 0,65 micrones contra 0,78 del CD.
Juntas multiplican la capacidad por siete: 4,7 GB. Un DVD 1x transfiere 1,4 MB/s contra 150 KB/s del CD. Como el láser es rojo, los lectores de DVD necesitan un segundo láser u óptica especial para leer CD; hoy casi todos traen los dos.

Con compresión MPEG-2 (IS 13346), un DVD de 4,7 GB guarda 133 minutos de video de alta resolución (720 × 480), sonido en hasta ocho idiomas y subtítulos en 32 más. Cerca del 92 % de las películas de Hollywood duran menos de 133 minutos. Formatos:
1. Un lado, una capa: 4,7 GB.
2. Un lado, doble capa: 8,5 GB.
3. Doble lado, una capa: 9,4 GB.
4. Doble lado, doble capa: 17 GB.
Tantos formatos por política: Philips y Sony querían una sola cara con doble capa; Toshiba y Time Warner, doble cara con una capa. En la doble capa hay una capa reflectora abajo y una semirreflectora encima; según dónde se enfoque el láser, rebota en una o en otra. La capa inferior tiene hoyos un poco más grandes y algo menos de capacidad. Figura 5-24 del libro: dos discos de 0,6 mm de un solo lado pegados por la parte trasera con una capa adhesiva, cada uno con su sustrato de policarbonato, su capa semirreflectiva y su reflector de aluminio.

El DVD lo diseñó un consorcio de 10 empresas de electrónica de consumo (siete japonesas) con los grandes estudios de Hollywood, pensando en películas: omisión de escenas, sonido de seis canales, Pan-and-Scan (recortar los bordes de una película 3:2 para televisores 4:3) e incompatibilidad intencional entre regiones (Estados Unidos, Europa, otros continentes).

Siguiente generación, otra vez sin estándar único: Blu-ray, con láser azul de 0,405 micrones, 25 GB en una capa y 50 GB en doble capa; y HD DVD, con el mismo láser azul pero 15 GB y 30 GB.

(Tanenbaum, cap. 5.4.1, págs. 371–376)

---

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

Nota sobre los discos de RAM: el programa de la materia nombra "discos de RAM" junto con el manejo de errores, pero esta edición del libro no los desarrolla. Lo más cercano en el material es la RAM no volátil (CMOS con batería) que usa el almacenamiento estable para anotar qué bloque se estaba escribiendo.

---

## 6. Relojes

Los relojes (temporizadores) son esenciales en cualquier sistema multiprogramado: mantienen la hora del día y evitan que un proceso monopolice la CPU, entre otras cosas. Un reloj no es un dispositivo de bloque ni de carácter, pero su software toma la forma de un driver.

### 6.1 Hardware de reloj

Hay dos tipos:
1. Los más simples se conectan a la línea de energía de 110 o 220 voltios y producen una interrupción en cada ciclo de voltaje, a 50 o 60 Hz. Antes dominaban; hoy son raros.
2. El reloj programable (figura 5-32 del libro: un oscilador de cristal que manda pulsos a un contador que se decrementa con cada pulso, y un registro contenedor que se usa para cargar el contador). Un cristal de cuarzo bien cortado y montado bajo tensión genera una señal periódica muy precisa, de varios cientos de megahertz, que se puede multiplicar hasta 1000 MHz o más. Esa señal alimenta al contador, que cuenta hacia abajo hasta cero; al llegar a cero produce una interrupción de la CPU.

Modos de operación del reloj programable:
- Modo de un solo disparo: al iniciarse, copia el registro contenedor en el contador y lo decrementa con cada pulso del cristal. Al llegar a cero, interrumpe y se detiene hasta que el software lo vuelva a iniciar.
- Modo de onda cuadrada: al llegar a cero e interrumpir, el registro contenedor se copia automáticamente en el contador y todo se repite indefinidamente. Esas interrupciones periódicas se llaman pulsos de reloj (clock ticks).

Ventaja: la frecuencia de interrupción se controla por software.

Ejemplo resuelto 11 (rango de un reloj programable, datos del libro). Con un cristal de 500 MHz, el contador recibe un pulso cada 1 / 500.000.000 s = 2 ns. Con un registro de 32 bits sin signo, el intervalo máximo es 2³² × 2 ns = 4.294.967.296 × 2 ns ≈ 8,6 s. Se pueden programar interrupciones desde cada 2 ns hasta cada 8,6 s.

Los chips de reloj suelen tener dos o tres relojes programables independientes y más opciones (contar hacia arriba o abajo, deshabilitar interrupciones).

Reloj de respaldo: para no perder la hora al apagar, casi todas las computadoras tienen un reloj alimentado por batería, con circuitos de bajo consumo como los de los relojes digitales. Se lee al arrancar. Si no lo hay, el software le pide la fecha y hora al usuario, o la obtiene de un host remoto con un protocolo estándar. La hora se convierte en la cantidad de pulsos desde un momento de referencia: en UNIX, las 12 a. m. UTC (tiempo universal coordinado, antes llamado del meridiano de Greenwich) del 1 de enero de 1970; en Windows, el 1 de enero de 1980. En cada pulso el tiempo real se incrementa en uno. Hay utilitarios para poner a mano el reloj del sistema y el de respaldo, y para sincronizarlos.

(Tanenbaum, cap. 5.5.1, págs. 388–390) (Relación con la Unidad 1: el reloj CMOS con pila)

### 6.2 Software de reloj

El hardware solo genera interrupciones a intervalos conocidos; todo lo demás lo hace el driver del reloj. Sus tareas típicas:

1. Mantener la hora del día (tiempo real).
2. Evitar que los procesos se ejecuten más tiempo del permitido.
3. Contabilizar el uso de la CPU.
4. Manejar la llamada al sistema alarm de los procesos de usuario.
5. Proveer temporizadores guardianes (watchdogs) para partes del propio sistema.
6. Hacer perfilamiento, supervisión y estadísticas.

Tarea 1: la hora del día. Alcanza con incrementar un contador en cada pulso, pero hay que cuidar la cantidad de bits. Con un reloj de 60 Hz, un contador de 32 bits se desborda en aproximadamente 2 años, así que no se puede guardar la hora como pulsos desde 1970 en 32 bits. Tres soluciones (figura 5-33 del libro, tres registros dibujados):
- (a) Un contador de 64 bits con la hora del día en pulsos. Mantenerlo es más costoso, porque se actualiza muchas veces por segundo.
- (b) La hora del día en segundos (32 bits), con un contador subsidiario que cuenta los pulsos del segundo actual hasta completar un segundo. Como 2³² segundos son más de 136 años, sirve hasta el siglo XXII.
- (c) Un contador en pulsos (32 bits) relativo al momento en que arrancó el sistema, más el tiempo de inicio del sistema guardado en segundos. Cuando se lee el reloj de respaldo o el usuario ingresa la hora, se calcula y guarda el tiempo de inicio; al pedir la hora, se suma el tiempo de inicio con el contador.

Ejemplo resuelto 12 (desbordamiento del contador). 2³² = 4.294.967.296 pulsos. A 60 pulsos por segundo: 4.294.967.296 / 60 = 71.582.788 segundos. Dividido por 86.400 segundos por día: 828,5 días, unos 2,27 años. En cambio, contando segundos: 4.294.967.296 / (86.400 × 365) ≈ 136 años.

Tarea 2: el quantum. Al iniciar un proceso, el planificador inicializa un contador con su quantum en pulsos de reloj. En cada interrupción de reloj, el driver lo decrementa en 1. Al llegar a cero, llama al planificador para que elija otro proceso.

Tarea 3: contabilizar la CPU. La forma más precisa es arrancar un segundo temporizador, distinto del principal, cada vez que arranca un proceso, y leerlo cuando se detiene; ese temporizador se guarda al llegar una interrupción y se restaura al terminarla. Una forma más simple y menos precisa es tener en una variable global un puntero a la entrada de la tabla de procesos del proceso actual e incrementar un campo de esa entrada en cada pulso: cada pulso se le "carga" al proceso que estaba ejecutando. Problema menor: si durante el proceso hubo muchas interrupciones, igual se le carga el pulso completo aunque no haya podido trabajar mucho. Contabilizar bien la CPU durante las interrupciones es muy complicado y casi no se hace.

Tarea 4: alarmas. Un proceso puede pedir que el sistema le avise después de cierto intervalo, con una señal, interrupción o mensaje. Usos: en redes, retransmitir un paquete que no se reconoció a tiempo; en instrucción asistida por computadora, darle la respuesta al estudiante que no contestó a tiempo. Como no hay un reloj físico por petición, el driver simula varios relojes virtuales con uno solo. Una forma: una tabla con el momento de cada señal pendiente y una variable con la próxima. Si hay muchas, es más eficiente una lista enlazada ordenada por tiempo.

Figura 5-34 del libro (simulación de varios temporizadores con un solo reloj): hora actual 4200; variable "siguiente señal" = 3; encabezado de reloj apuntando a una lista enlazada con los valores 3, 4, 6, 2, 1. Cada entrada dice cuántos pulsos después de la anterior hay que esperar. Así, hay señales pendientes para 4200 + 3 = 4203, 4203 + 4 = 4207, 4207 + 6 = 4213, 4213 + 2 = 4215 y 4215 + 1 = 4216. En cada pulso se decrementa "siguiente señal". Cuando llega a 0 se produce la señal del primer elemento, ese elemento se saca de la lista, y "siguiente señal" toma el valor de la nueva cabeza (en el ejemplo, 4).

Ejemplo resuelto 13 (agregar una alarma a la lista). Con la lista anterior (hora 4200; señales en 4203, 4207, 4213, 4215 y 4216), un proceso pide una alarma para 4210.
1. Se recorre la lista acumulando: 4203, 4207, 4213. La nueva va entre 4207 y 4213.
2. Su valor relativo es 4210 − 4207 = 3.
3. El elemento siguiente (el de 4213) pasa de 6 a 4213 − 4210 = 3.
4. La lista queda 3, 4, 3, 3, 2, 1, con señales en 4203, 4207, 4210, 4213, 4215 y 4216.

En cada interrupción de reloj el driver hace varias cosas: incrementar el tiempo real, decrementar el quantum y ver si llegó a 0, contabilizar la CPU y decrementar el contador de alarma. Cada una está diseñada para ser muy rápida, porque se repite muchas veces por segundo.

Tarea 5: temporizadores guardianes (watchdogs). Partes del sistema operativo también necesitan temporizadores. Ejemplo: los disquetes no giran cuando no se usan, para evitar el desgaste del medio y de la cabeza. Para leer, hay que arrancar el motor y esperar a que gire a velocidad completa. El driver del disquete arranca el motor y pone un temporizador guardián que interrumpe pasado un intervalo suficientemente largo (no hay un interruptor que avise que llegó a velocidad). El mecanismo es igual al de las señales de usuario, pero al vencer, en vez de producir una señal, el driver del reloj llama a un procedimiento que dio quien pidió el temporizador. Ese procedimiento puede hacer lo que haga falta. Se usa porque dentro del kernel las interrupciones son incómodas y las señales no existen. Solo funciona si el driver del reloj y el procedimiento están en el mismo espacio de direcciones.

Tarea 6: perfilamiento. Algunos sistemas permiten que un programa pida un histograma de su contador de programa para ver en qué gasta el tiempo. En cada pulso, si el proceso actual se está perfilando, el driver calcula a qué receptáculo (un rango de direcciones) corresponde el PC actual y lo incrementa en uno. También sirve para perfilar el propio sistema.

(Tanenbaum, cap. 5.5.2, págs. 390–392) (Relación con la Unidad 2: quantum de Round Robin, contabilidad de la CPU y señales)

### 6.3 Temporizadores de software

La mayoría de las computadoras tiene un segundo reloj programable para que un programa pida interrupciones a la velocidad que necesite. Mientras la frecuencia sea baja, no hay problema. El problema aparece con frecuencias muy altas. Idea de Aron y Druschel (1999):

Hay dos formas de enterarse de un evento de E/S:
- Interrupciones: baja latencia (ocurren justo después del evento), pero en las CPU modernas tienen mucha sobrecarga, por el cambio de contexto y su efecto en la línea de tubería, el TLB y la caché.
- Sondeo: la aplicación pregunta ella misma. Evita las interrupciones, pero tiene latencia: si el evento ocurre justo después de un sondeo, espera casi todo el intervalo. En promedio, la latencia es la mitad del intervalo de sondeo.

Para algunas aplicaciones ninguna de las dos sirve. Ejemplo: Gigabit Ethernet puede enviar o aceptar un paquete completo cada 12 µs. Una interrupción cada 12 µs, medida en un Pentium II de 300 MHz, tarda 4,45 µs: apenas mejor que en los años 70, cuando en una minicomputadora una interrupción costaba cuatro ciclos (guardar el PC y el PSW en la pila y cargar un PC y un PSW nuevos). Hoy la línea de tubería, la MMU, el TLB y la caché aumentan mucho la sobrecarga, y probablemente empeore con el tiempo.

Ejemplo resuelto 14 (costo de las interrupciones en Gigabit Ethernet). Una interrupción cada 12 µs que cuesta 4,45 µs ocupa 4,45 / 12 = 0,37, es decir, alrededor del 37 % de la CPU (el libro habla de interrupciones que ocupan el 35 % de la CPU).

Temporizadores de software: evitan las interrupciones. Cada vez que el kernel se ejecuta por otra razón, justo antes de volver a modo usuario, mira el reloj de tiempo real para ver si venció un temporizador de software. Si venció, hace el evento programado (transmitir paquetes, ver si llegó uno) sin cambiar a modo kernel, porque ya está ahí. Después lo reprograma: copia el valor actual del reloj y le suma el intervalo.

Los temporizadores de software avanzan al ritmo en que se entra al kernel por otras razones:
1. Llamadas al sistema.
2. Fallos del TLB.
3. Fallos de página.
4. Interrupciones de E/S.
5. La CPU queda inactiva.

Aron y Druschel midieron con varias cargas (servidor web a plena carga, servidor web con un cálculo en segundo plano, audio en tiempo real por Internet y recompilación del kernel de UNIX): el tiempo promedio entre entradas al kernel varió de 2 µs a 18 µs, y casi la mitad de las entradas eran llamadas al sistema. Así que es viable un temporizador de software cada 12 µs, aunque a veces se pase del plazo. Para enviar o sondear paquetes, un retraso ocasional de 10 µs es mejor que interrupciones que ocupen el 35 % de la CPU. Para acotar los períodos sin entradas al kernel, se puede programar el segundo temporizador de hardware cada 1 ms: si la aplicación tolera 1000 paquetes por segundo en intervalos ocasionales, la combinación de temporizadores de software y un temporizador de hardware de baja frecuencia es mejor que solo interrupciones o solo sondeo.

(Tanenbaum, cap. 5.5.3, págs. 393–394) (Relación con el tema 2: interrupciones contra sondeo)

Según la cátedra: los relojes permiten mantener la hora, evitar que un proceso monopolice la CPU y medir el uso del sistema; aunque no son de bloque ni de carácter, su software se implementa como un driver.

---

## 7. Interfaces de usuario: teclado, ratón y monitor

Toda computadora de propósito general tiene teclado y monitor (y casi siempre ratón). Son dispositivos separados pero trabajan muy juntos. En las mainframes, cada usuario remoto tenía un dispositivo con teclado y pantalla en una sola unidad: una terminal. El término se sigue usando para el teclado y el monitor de una PC.

Atención: el resumen de la cátedra no cubre este tema. El programa lo nombra como "interfaces gráficas, terminales"; todo lo que sigue sale del libro.

### 7.1 Software de entrada: teclado

En una PC, el teclado tiene un microprocesador integrado que se comunica por un puerto serial especial (cada vez más, por USB) con un chip controlador en la tarjeta principal. Se genera una interrupción al oprimir una tecla y otra al soltarla. En cada interrupción, el driver del teclado lee del puerto de E/S lo que pasó. Todo lo demás es software, muy independiente del hardware.

Código de exploración (scan code): el número que llega al puerto es el número de tecla, no el código ASCII. Los teclados tienen menos de 128 teclas, así que bastan 7 bits; el octavo bit vale 0 al oprimir y 1 al soltar. El driver lleva el estado de cada tecla. Ejemplo: al oprimir la A llega el código de exploración 30, y el driver decide si es minúscula, mayúscula, CTRL-A, ALT-A, CTRL-ALT-A u otra, porque sabe qué teclas están oprimidas (por ejemplo, MAYÚS). Las secuencias OPRIMIR MAYÚS, OPRIMIR A, SOLTAR A, SOLTAR MAYÚS y OPRIMIR MAYÚS, OPRIMIR A, SOLTAR MAYÚS, SOLTAR A dan las dos una A mayúscula. Esta interfaz carga todo en el software pero es muy flexible: un programa podría saber si un dígito vino de la fila superior o del teclado numérico.

Dos filosofías para el driver:
- Orientada a caracteres: pasar la entrada sin modificarla, como una secuencia de códigos ASCII. Sirve a editores como emacs, que asocian cualquier acción a cualquier secuencia. Si el usuario escribe "dste" en vez de "date", borra tres veces y escribe "ate" y Enter, el programa recibe los 11 códigos: d s t e ← ← ← a t e CR.
- Orientada a líneas: el driver maneja toda la edición dentro de la línea y solo le pasa al programa las líneas corregidas.
Antes se llamaban modo crudo y modo cocido. POSIX llama modo canónico al orientado a líneas; el modo no canónico equivale al crudo, con muchos detalles configurables. Los sistemas POSIX traen funciones de biblioteca para elegir el modo y ajustar parámetros.

Búfer del teclado: en modo canónico los caracteres se guardan hasta completar una línea, porque el usuario puede borrar parte. Aun en modo crudo, el programa quizá todavía no pidió entrada, así que se guardan para permitir la escritura adelantada (type-ahead). Se puede usar un búfer dedicado (pone un límite fijo a la escritura adelantada) o búferes de una reserva (sin límite fijo). Esto importa en una ventana de shell cuando el usuario sigue escribiendo mientras corre un comando (por ejemplo, una compilación): el shell todavía no está listo para leer. El libro dice que los diseñadores que no permiten escribir por adelantado deberían ser emplumados, o peor, obligados a usar su propio sistema.

Eco: la mayoría de los usuarios espera ver en pantalla lo que escribe. Se complica porque un programa puede estar escribiendo en la pantalla mientras el usuario teclea, y el driver tiene que ubicar la entrada sin que la tape la salida. También con líneas de más de 80 caracteres en una ventana de 80 columnas (ajustar a la línea siguiente o truncar) y con los tabuladores (el driver calcula la posición del cursor y cuántos espacios mostrar).

Equivalencia de dispositivos: al final de una línea se quiere un retorno de carro (volver a la columna 1) y un avance de línea (bajar una línea), pero el usuario no debería tener que escribir los dos. El driver convierte la entrada al formato interno del sistema: en UNIX, la tecla Intro se guarda como un avance de línea (la traducción del libro dice "avance de página", por error); en Windows, como retorno de carro más avance de línea. En sistemas multiusuario con terminales distintas, el driver convierte todas las combinaciones al estándar interno y se encarga de que el eco salga bien.

Caracteres especiales en modo canónico (figura 5-35 del libro, los que exige POSIX):

| Carácter | Nombre POSIX | Qué hace |
|---|---|---|
| CTRL-H | ERASE | retrocede un carácter |
| CTRL-U | KILL | borra toda la línea que se está escribiendo |
| CTRL-V | LNEXT | interpreta el siguiente carácter literalmente |
| CTRL-S | STOP | detiene la salida |
| CTRL-Q | START | reanuda la salida |
| DEL | INTR | interrumpe el proceso (señal SIGINT) |
| CTRL-\ | QUIT | fuerza un volcado de núcleo (señal SIGQUIT) |
| CTRL-D | EOF | fin de archivo |
| CTRL-M | CR | retorno de carro (no se puede cambiar) |
| CTRL-J | NL | avance de línea (no se puede cambiar) |

Todos salvo los dos últimos se pueden cambiar desde el programa. Detalles:
- ERASE no se agrega a la cola: elimina el carácter anterior. Su eco es retroceso, espacio, retroceso, para borrarlo de la pantalla. Borrar un tabulador depende de cómo se guardó. En general no retrocede más allá de la línea actual.
- KILL borra la línea entera; la mayoría de los sistemas la hace desaparecer de la pantalla.
- LNEXT es un carácter de escape. Ejemplo: en UNIX viejo, @ era KILL; para escribir una dirección de correo como linda@cs.washington.edu con KILL redefinido como @, se escribe CTRL-V @. CTRL-V CTRL-V ingresa un CTRL-V literal. LNEXT no entra en la cola.
- STOP y START no se guardan: prenden y apagan una bandera que se revisa antes de cada salida.
- INTR (DEL, aunque muchas veces es CTRL-C) envía SIGINT a todos los procesos iniciados desde ese teclado, y solo a los de ese usuario. QUIT (CTRL-\) envía SIGQUIT, que fuerza un volcado de núcleo si no se atrapa. Con cualquiera de los dos, el driver hace eco de retorno de carro y avance de línea y descarta toda la entrada acumulada.
- EOF (CTRL-D) hace que se cumpla cualquier lectura pendiente con lo que haya en el búfer, aunque esté vacío. Al principio de una línea, el programa recibe una lectura de 0 bytes, que por convención es fin de archivo.

(Tanenbaum, cap. 5.6.1, págs. 394–399) (Relación con la Unidad 2: las señales SIGINT y SIGQUIT)

### 7.2 Software de entrada: ratón

Un ratón mecánico tiene una bola de goma que gira contra dos rodillos en ejes ortogonales: el movimiento este-oeste hace girar el eje paralelo al eje y, y el norte-sur el paralelo al eje x. El trackball es un ratón boca arriba. Los ratones ópticos tienen diodos emisores de luz y fotodetectores: los primeros necesitaban un tapete con una grilla para contar líneas; los modernos tienen un chip de procesamiento de imágenes que saca fotos de baja resolución de la superficie y busca cambios. Los inalámbricos usan radio de baja energía (por ejemplo, Bluetooth).

Cada vez que el ratón se movió una distancia mínima (unos 0,1 mm, configurable; algunos llaman mickey a esa unidad) o se oprimió o soltó un botón, se envía un mensaje con tres elementos: Δx (cambio en x desde el último mensaje), Δy (cambio en y) y el estado de los botones. Suele ocupar 3 bytes. La mayoría de los ratones informa a lo sumo 40 veces por segundo, así que puede haberse movido varios mickeys entre informes. El ratón informa solo cambios de posición, no la posición absoluta: si se levanta y se apoya sin girar la bola, no manda nada. El doble clic: si dos clics están lo bastante cerca en el espacio (mickeys) y en el tiempo (milisegundos), el software señala un doble clic; los dos umbrales suelen ser ajustables.

(Tanenbaum, cap. 5.6.1, pág. 399)

### 7.3 Software de salida: ventanas de texto y secuencias de escape

La salida en una ventana de texto, con un solo tipo de letra, tamaño y color, es más simple que la entrada: el programa envía caracteres y aparecen, normalmente de a una línea por llamada al sistema. Los editores de pantalla necesitan además mover el cursor e insertar o borrar caracteres y líneas: para eso el driver acepta comandos llamados secuencias de escape.

En la época de las terminales "tontas" ASCII de 25 × 80 había cientos de tipos de terminal, cada uno con sus secuencias. Berkeley UNIX introdujo termcap, una base de datos de terminales: el software usaba una secuencia genérica (por ejemplo, mover el cursor a fila y columna) que se traducía a la de la terminal real. La mayoría del software de UNIX sigue funcionando así. Después se creó un estándar ANSI. Algunas secuencias (figura 5-36 del libro; ESC es el carácter 0x1B y n, m y s son parámetros):

| Secuencia | Significado |
|---|---|
| ESC [ n A | subir n líneas |
| ESC [ n B | bajar n líneas |
| ESC [ n C | n espacios a la derecha |
| ESC [ n D | n espacios a la izquierda |
| ESC [ m ; n H | mover el cursor a (m, n) |
| ESC [ s J | borrar la pantalla desde el cursor (0 hasta el final, 1 desde el inicio, 2 todo) |
| ESC [ s K | borrar la línea desde el cursor (0 hasta el final, 1 desde el inicio, 2 toda) |
| ESC [ n L | insertar n líneas en el cursor |
| ESC [ n M | eliminar n líneas en el cursor |
| ESC [ n P | eliminar n caracteres en el cursor |
| ESC [ n @ | insertar n caracteres en el cursor |
| ESC [ n m | modo de video n (0 normal, 4 negrita, 5 parpadeo, 7 inverso) |
| ESC M | desplazar la pantalla hacia atrás si el cursor está en la línea superior |

Ejemplo del libro: para borrar la línea 3 y cerrar el hueco, el editor envía ESC [ 3 ; 1 H, ESC [ 0 K, ESC [ 1 M: mueve el cursor al principio de la línea 3, borra la línea y elimina la línea vacía, así la 4 pasa a ser la 3, la 5 la 4, etc.

(Tanenbaum, cap. 5.6.2, págs. 399–400)

### 7.4 El sistema X Window

Casi todos los UNIX basan su interfaz en el sistema X Window (X), del MIT, proyecto Athena, años 80. Es muy portátil y corre totalmente en espacio de usuario. Se pensó para conectar muchas terminales remotas a un servidor central, así que se divide en software cliente y servidor, que pueden estar en máquinas distintas. Gnome y KDE corren encima de X.

- Servidor X: el software que recoge la entrada del teclado y el ratón y escribe en la pantalla. Sabe qué ventana está seleccionada (dónde está el ratón) para mandar la entrada al cliente correcto. Siempre está en la computadora del usuario, porque su trabajo es mostrar bits en la pantalla.
- Clientes X: los programas, que pueden estar en una computadora remota. Le piden al servidor que muestre texto y figuras, y reciben de él la entrada.

Diagrama de la figura 5-37 del libro: a la izquierda, el host remoto, con el administrador de ventanas y el programa de aplicación sobre las capas Motif, Intrinsics y Xlib (el cliente X), sobre UNIX y el hardware; a la derecha, la computadora del usuario, con el servidor X sobre UNIX y el hardware y la ventana en pantalla; entre los dos, el protocolo X por la red. Lo que X define en realidad es el protocolo X entre cliente y servidor; no importa si están en la misma máquina, a 100 metros o a miles de kilómetros. Aun en la misma máquina, el cliente habla con el servidor por una conexión TCP sobre sockets.

Capas: X es solo un sistema de ventanas, no una GUI completa.
- Xlib: procedimientos de biblioteca para acceder a X; demasiado primitivos para la mayoría de los programas (por ejemplo, cada clic llega por separado y el doble clic se detecta más arriba).
- Intrinsics: un kit de herramientas que maneja botones, barras de desplazamiento y otros elementos llamados widgets.
- Motif (u otra capa): da una apariencia uniforme; es la base del Entorno de Escritorio Común (CDE) de Solaris y otros UNIX comerciales. Gnome usa la biblioteca GTK y KDE la biblioteca Qt.
- El administrador de ventanas no es parte de X, a propósito: es un proceso aparte que crea, borra y mueve ventanas enviándole comandos al servidor X.
Este diseño modular hace a X muy portátil. En Windows, en cambio, el sistema de ventanas y la GUI están mezclados en la GDI, dentro del kernel: más difíciles de mantener y no portátiles.

Cuatro tipos de mensajes por la conexión (normalmente TCP/IP, que X considera confiable):
1. Comandos de dibujo del programa a la estación de trabajo.
2. Respuestas de la estación de trabajo a pedidos del programa.
3. Mensajes de teclado, ratón y otros eventos.
4. Mensajes de error.
La mayoría de los comandos de dibujo son de una sola vía, sin respuesta, para no frenar al programa cuando cliente y servidor están lejos. X está controlado por eventos: cada evento es de 32 bytes (el primero da el tipo, los otros 31 la información); a cada programa se le mandan solo los eventos que puede manejar, y se ponen en una cola. A diferencia de Windows, el sistema nunca llama por su cuenta a procedimientos del programa. Un concepto clave es el recurso: una estructura de datos que la aplicación crea en la estación de trabajo, compartible y de vida corta (no sobrevive a reinicios). Ejemplos: ventanas, tipos de letra, mapas de colores, mapas de píxeles, cursores y contextos gráficos.

Esqueleto de un programa X (figura 5-38 del libro): XOpenDisplay se conecta al servidor X; XCreateSimpleWindow asigna la ventana; XSetStandardProperties la anuncia al administrador de ventanas; XCreateGC crea el contexto gráfico; XSelectInput indica qué eventos se manejan (clics, teclas, exposición); XMapRaised muestra la ventana. El ciclo principal tiene dos instrucciones: XNextEvent obtiene el siguiente evento y un switch lo despacha (Expose: redibujar; ButtonPress: clic; KeyPress: tecla). Al final, XFreeGC, XDestroyWindow y XCloseDisplay. Para quien prefiere la línea de comandos, el cliente xterm emula una terminal VT102 con todas sus secuencias de escape, así que vi, emacs y todo lo que usa termcap funciona sin cambios.

(Tanenbaum, cap. 5.6.2, págs. 400–404)

### 7.5 Interfaces gráficas de usuario (GUI)

La GUI la inventaron Douglas Engelbart y su grupo en el Stanford Research Institute; la copiaron en Xerox PARC; Steve Jobs la vio ahí y la llevó a la Lisa de Apple (fracaso comercial) y a la Macintosh (gran éxito). Microsoft obtuvo una licencia de los elementos de la interfaz, base de Windows; Apple demandó y perdió.

Elementos esenciales, WIMP: ventanas (Windows, áreas rectangulares donde corren programas), iconos (Icons, símbolos en los que se hace clic), menús (Menus, listas de acciones) y dispositivo señalador (Pointing device, ratón o trackball). La GUI puede estar en el nivel de usuario (UNIX) o en el sistema operativo (Windows).

Adaptador de gráficos: la salida va a un hardware especial con RAM de video, que contiene las imágenes en pantalla. Los de alto rendimiento tienen CPU de 32 o 64 bits y hasta 1 GB de RAM propia. Resoluciones comunes: 1024 × 768, 1280 × 960, 1600 × 1200 (relación 4:3, como los televisores NTSC y PAL, con píxeles cuadrados) y 1920 × 1200 (pantalla ancha).

Ejemplo resuelto 15 (RAM de video, datos del libro). Una pantalla de 1920 × 1200 a 24 bits (3 bytes) por píxel necesita 1920 × 1200 × 3 = 6.912.000 bytes, unos 6,5 MB solo para la imagen. Si se actualiza 75 veces por segundo, la RAM de video tiene que transferir 6,5 MB × 75 ≈ 489 MB/s.

Programación en Windows (API Win32): la ventana es un rectángulo definido por las coordenadas en píxeles de dos esquinas opuestas; el origen (0, 0) está arriba a la izquierda y la y crece hacia abajo. Figura 5-39 del libro: una ventana en (200, 100) en una pantalla XGA de 1024 × 768, con barra de título, barra de menús, barra de herramientas, área cliente, barra de desplazamiento con su control deslizante, y las esquinas de la pantalla en (0, 0), (1023, 0), (0, 767) y (1023, 767). Como las ventanas se pueden mover, cambiar de tamaño y tapar, los programas tienen que redibujar su contenido en cualquier momento. Por eso los programas de Windows están orientados a mensajes: las acciones del usuario se convierten en mensajes para el programa dueño de la ventana, que tiene una cola de mensajes. El ciclo principal saca el siguiente mensaje y lo procesa con el procedimiento correspondiente. Es muy distinto del modelo de UNIX, orientado a procedimientos que hacen llamadas al sistema (aunque X también es orientado a eventos).

Esqueleto de un programa Windows (figura 5-40 del libro): WinMain recibe el manejador de instancia h (identifica al programa; Win32 es en parte orientado a objetos y se refiere a los objetos con manejadores), un parámetro que ya no se usa, la línea de comandos szCmd y iCmdShow (si la ventana ocupa toda la pantalla, parte o solo la barra de tareas). Se inicializa un objeto de clase WNDCLASS (10 campos; el más importante, lpfnWndProc, apunta a la función que maneja los mensajes), se registra con RegisterClass, se crea la ventana con CreateWindow, se muestra con ShowWindow y se pinta con UpdateWindow. El ciclo principal: while (GetMessage(...)) { TranslateMessage(...); DispatchMessage(...); }. El procedimiento WndProc atiende WM_CREATE (al inicio), WM_PAINT (redibujar, que llega muchas veces, porque nada de lo dibujado queda garantizado) y WM_DESTROY (al final), y termina llamando a DefWindowProc para los demás mensajes.
- Notación húngara (de Charles Simonyi, programador húngaro de Microsoft): las primeras letras del identificador indican el tipo: c carácter, w palabra (entero sin signo de 16 bits), i entero con signo de 32 bits, l long, s cadena, sz cadena terminada en cero, p apuntador, fn función, h manejador. Muchos programadores creen que vuelve el código difícil de leer; no hay nada análogo en UNIX.
- Dos formas en que Windows hace actuar a un programa: publicar un mensaje en su cola (teclado, ratón, temporizadores vencidos) o enviárselo llamando directamente a WndProc (el resto). Como Windows sabe cuándo terminó de procesarse un mensaje, no hace una nueva llamada hasta que termina la anterior, y así evita condiciones de competencia.

GDI (Graphics Device Interface, interfaz de dispositivo gráfico): cientos de procedimientos para dibujar texto y gráficos, independientes de la plataforma y del dispositivo. Antes de dibujar hay que obtener un contexto de dispositivo (fuente, color de texto, color de fondo): hdc = GetDC(hwnd); TextOut(hdc, x, y, psText, iLength); ReleaseDC(hwnd, hdc);. El hdc se usa como un descriptor de archivo de UNIX. Con GetDC solo se dibuja en el área cliente; con GetWindowDC, en toda la ventana. Las llamadas de dibujo se dividen en líneas y curvas, áreas rellenas, mapas de bits y texto. Ejemplo: Rectangle(hdc, 2, 1, 6, 4) dibuja un rectángulo relleno con esquinas (2, 1) y (6, 4) (figura 5-41, una grilla de píxeles).

Gráficos vectoriales y mapas de bits: los procedimientos de la GDI son gráficos vectoriales (figuras y texto que escalan fácilmente). Una colección de llamadas guardada en un archivo es un metarchivo de Windows (.wmf), usado por ejemplo para el portapapeles. Las fotos y los videos, en cambio, se guardan como mapas de bits: se superpone una grilla y se guarda el rojo, verde y azul promedio de cada cuadro como un píxel. BitBlt copia un rectángulo de mapa de bits de una ventana a otra: BitBlt(hdc2, 1, 2, 5, 7, hdc1, 2, 2, SRCCOPY) copia el área de 5 × 7 de la letra A, con su fondo (figura 5-42, antes y después). El último parámetro permite combinar origen y destino con operaciones booleanas (OR, OR exclusivo). Los mapas de bits no escalan: un carácter de 8 × 12 píxeles en una pantalla de 640 × 480 se ve bien, pero en una impresora de 1200 puntos por pulgada mide 8/1200 pulgadas, unos 0,17 mm. Por eso existe el DIB (Device Independent Bitmap, archivos .bmp), con encabezados y una tabla de colores.

Tipos de letra: antes de Windows 3.1 los caracteres eran mapas de bits, uno por carácter y por tamaño (de 4 a 120 puntos), imposible de escalar. TrueType define cada carácter por los puntos de su contorno, relativos a (0, 0): para escalar se multiplica cada coordenada por el mismo factor (incluso a tamaños fraccionarios), se unen los puntos (con splines) y se rellena (figura 5-43, caracteres en 20, 53 y 81 puntos). Después se rasteriza a la resolución deseada, así pantalla e impresora coinciden salvo errores de cuantización. El hinting ajusta el resultado (por ejemplo, para que los dos patines de la T sean idénticos).

(Tanenbaum, cap. 5.6.2, págs. 404–415)

---

### 7.6 Clientes delgados

La computación oscila entre centralizada y descentralizada: las primeras computadoras (ENIAC) eran de una persona por vez; después vino el tiempo compartido, con muchas terminales simples contra una computadora central; después la PC, otra vez una computadora por usuario. La PC tiene desventajas graves:
- Cada PC tiene un disco grande y software complejo que hay que mantener; actualizar el sistema operativo en cada equipo cuesta en mano de obra más que el hardware y el software. Con un sistema centralizado se actualizan una o pocas máquinas, con personal experto.
- Pocos usuarios respaldan sus gigabytes de datos; en un sistema centralizado, robots de cintas hacen respaldos cada noche.
- Compartir recursos es más fácil centralizado: 256 usuarios con 256 MB de RAM cada uno tienen casi toda esa RAM ociosa casi siempre; con un sistema central de 64 GB, nadie se queda sin RAM porque esté en la PC de otro. Lo mismo con el disco.
- Hay un cambio de la computación centrada en la PC a la centrada en la Web (por ejemplo, el correo en Gmail, Hotmail o Yahoo).

La mayoría de los usuarios quiere computación interactiva de alto rendimiento sin administrar una computadora. Eso llevó a reexaminar el tiempo compartido con terminales "tontas", hoy llamadas clientes delgados. Las terminales X fueron un paso, pero costaban lo mismo que una PC, hacían menos y requerían mantenimiento.

THINC (Universidad de Columbia): la máquina cliente no tiene inteligencia ni software; es solo una pantalla. Todo el cómputo, incluido armar el mapa de bits a mostrar, se hace en el servidor. El protocolo solo le dice a la pantalla cómo actualizar su RAM de video, con cinco comandos (figura 5-44 del libro):

| Comando | Descripción |
|---|---|
| Raw | muestra datos de píxeles crudos en una ubicación dada (en principio, el único necesario) |
| Copy | copia un área del búfer de pantalla a otras coordenadas (sirve para desplazar sin retransmitir) |
| Sfill | llena un área con un solo color de píxel (fondos uniformes) |
| Pfill | llena un área con un patrón de píxeles (fondos más complejos) |
| Bitmap | llena una región con una imagen de mapa de bits, con color de primer plano y de fondo |

Los cuatro últimos son optimizaciones. Se pueden agrupar varios comandos en un paquete. En el servidor, el software THINC intercepta los comandos gráficos de alto nivel de los programas y los traduce (y reordena) en comandos para el cliente. Las mediciones, con servidores a entre 10 km y 10.000 km del cliente, dieron un rendimiento superior a otros sistemas de red de área amplia, incluso con video en tiempo real.

(Tanenbaum, cap. 5.7, págs. 415–417) (Relación con la Unidad 1: tiempo compartido y la historia de los SO)

---

## 8. Administración de energía

Atención: el programa de la materia no nombra este tema y el resumen de la cátedra no lo cubre. Se incluye porque es parte del capítulo 5 del libro.

La ENIAC tenía 18.000 tubos al vacío y consumía 140.000 watts. Con el transistor el consumo bajó y la industria perdió interés, pero hoy vuelve a importar por dos razones:
1. Las PC de escritorio: una fuente de 200 watts (85 % de eficiencia); 100 millones de máquinas encendidas a la vez consumen 20.000 megawatts, la producción de 20 centrales nucleares promedio. Reducir el consumo a la mitad eliminaría 10.
2. Las computadoras a batería (notebooks, de bolsillo): las baterías duran unas pocas horas y casi no progresan, a diferencia de la ley de Moore.

Dos métodos generales: que el sistema operativo apague las partes que no se usan (sobre todo dispositivos de E/S), y que los programas usen menos energía aun degradando la experiencia del usuario.

### 8.1 Cuestiones de hardware

Baterías desechables (AAA, AA, D: no alcanzan para una notebook) y recargables (níquel-cadmio, reemplazadas por níquel-metal híbrido, y las de ion-litio, mejores y que se recargan sin vaciarse del todo, pero de capacidad limitada).

Los fabricantes diseñan CPU, memoria y dispositivos con varios estados:
- encendido: para usar el dispositivo;
- inactivo: si no se va a usar por poco tiempo; consume menos;
- hibernando: si no se va a usar por más tiempo; consume todavía menos, pero salir de hibernación lleva más tiempo y energía que salir de inactivo;
- apagado: no hace nada ni consume.
El sistema operativo administra las transiciones. Algunas computadoras tienen dos o tres botones de energía (inactivo, hibernación), que solo le mandan una señal al SO.

Preguntas que el SO tiene que responder por cada dispositivo: qué dispositivos se pueden controlar; si son de encendido y apagado o tienen estados intermedios; cuánto se ahorra en bajo consumo; si se gasta energía al reiniciarlo; si hay que guardar contexto al bajar el consumo; cuánto tarda en volver a plena energía.

Consumo de las partes de una notebook (figura 5-45 del libro):

| Dispositivo | Li y colaboradores (1994) | Lorch y Smith (1998) |
|---|---|---|
| Pantalla | 68 % | 39 % |
| CPU | 12 % | 18 % |
| Disco duro | 20 % | 12 % |
| Módem | — | 6 % |
| Sonido | — | 2 % |
| Memoria | 0,5 % | 1 % |
| Otros | — | 22 % |

Weiser y colaboradores no publicaron números, pero concluyeron que los tres grandes consumidores son la pantalla, el disco duro y la CPU, en ese orden.

### 8.2 Cuestiones del sistema operativo

El SO controla todos los dispositivos y decide qué apagar y cuándo. Si apaga algo que se necesita enseguida, hay un retraso molesto; si espera demasiado, desperdicia energía. Lo "bueno" es subjetivo: un usuario acepta que tras 30 segundos sin uso la computadora tarde 2 segundos en responder; otro no.

Pantalla: es el mayor consumidor, por la luz posterior. Muchos SO la apagan tras unos minutos sin actividad (el usuario elige el intervalo). Es un estado inactivo, porque se regenera casi al instante desde la RAM de video. Propuesta de Flinn y Satyanarayanan (2004), figura 5-46 del libro: dividir la pantalla en zonas que se encienden por separado; con 16 zonas y el cursor en la ventana 2, que ocupa 4 zonas abajo a la derecha, alcanza con encender esas 4 y se ahorran 3/4 de la energía de la pantalla. Si el usuario pasa a la ventana 1, que cubre 9 zonas, se gasta más; el administrador de ventanas podría mover la ventana 1 para que quepa en 4 zonas y bajar de 9/16 a 4/16 de la energía máxima.

Disco duro: mantenerlo girando consume mucho. Muchas notebooks lo detienen tras unos segundos o minutos sin uso. Un disco detenido está en hibernación, no inactivo: tarda unos segundos en volver a girar y reiniciarlo gasta bastante energía. Cada disco tiene un tiempo característico Td, su punto de equilibrio, normalmente de 5 a 15 segundos. Si el próximo acceso será dentro de un tiempo t: si t < Td, gasta menos seguir girando que apagar y volver a encender; si t > Td, conviene apagarlo. Con buenas predicciones (por patrones de acceso anteriores) el SO podría decidir bien; en la práctica la mayoría es conservadora y lo detiene recién tras unos minutos. Otras ayudas: una caché de disco grande en RAM (si el bloque está en la caché, o si la escritura se puede guardar en el búfer, no hace falta arrancar el disco), y avisarles a los programas el estado del disco para que retrasen escrituras discrecionales (por ejemplo, el guardado automático de un procesador de textos).

Ejemplo resuelto 16 (punto de equilibrio del disco). Un disco tiene Td = 10 s. Si el SO predice que el próximo acceso será dentro de 4 s, como 4 < 10 conviene dejarlo girando. Si predice 30 s, como 30 > 10 conviene detenerlo.

CPU: se puede poner inactiva por software, con un consumo casi nulo; solo puede despertarse con una interrupción. Además, en muchas computadoras se puede reducir el voltaje, lo que reduce la velocidad del reloj aproximadamente en forma lineal. Como la energía consumida es proporcional al cuadrado del voltaje, con la mitad del voltaje la CPU va a la mitad de velocidad pero gasta un cuarto de la energía.

Ejemplo resuelto 17 (escalado de voltaje, datos del libro). Un visor multimedia tiene que descomprimir y mostrar un cuadro cada 40 ms. A toda velocidad, la CPU gasta x joules si trabaja los 40 ms, y lo hace en 20 ms.
1. Opción a: toda velocidad durante 20 ms y después inactiva 20 ms: gasta x/2 joules.
2. Opción b: mitad de velocidad durante los 40 ms (llega justo al plazo): la potencia es 1/4, así que gasta x/4 joules.
Se hace el mismo trabajo con la mitad de la energía de la opción a (figura 5-47 del libro: dos gráficos de energía contra tiempo; en (a) un bloque de altura 1,00 hasta T/2; en (b) un bloque de altura 0,25 hasta T). Del mismo modo, si un usuario escribe 1 carácter por segundo y procesarlo lleva 100 ms, conviene bajar la velocidad de la CPU por un factor de 10. Es más eficiente operar más lento.

Memoria: dos opciones. Vaciar la caché y apagarla: se puede recargar desde la memoria principal sin perder nada y rápido, así que es un estado inactivo. Más drástico: escribir la memoria principal en el disco y apagarla: hibernación, con un tiempo de recarga considerable, sobre todo si el disco también está apagado. Con la memoria apagada, la CPU también se apaga o ejecuta desde la ROM, y la interrupción que la despierta salta a código en la ROM para recargar la memoria. Vale la pena para períodos largos (horas) si reanudar en unos segundos es mejor que rearrancar el SO desde el disco (un minuto o más).

Comunicación inalámbrica: el radio consume mucho; si siempre está encendido para recibir correo, agota la batería; si se apaga, se pierden mensajes. Propuesta de Kravets y Krishnan (1998): la computadora móvil le avisa a la estación base fija (con memoria y disco grandes y sin restricciones de energía) antes de apagar el radio; la estación guarda los mensajes entrantes en su disco y los envía cuando la móvil vuelve a encender el radio. Los mensajes salientes se guardan en un búfer en la móvil y, si el búfer está por llenarse, se enciende el radio. Cuándo apagarlo y encenderlo: lo decide el usuario o el programa, o tras unos segundos de inactividad, o periódicamente para revisar el tráfico, y siempre cuando el búfer de salida está por llenarse.

Administración térmica: las CPU modernas se calientan muchísimo. En las PC de escritorio el ventilador suele estar siempre encendido. En las notebooks el SO monitorea la temperatura y, cerca del máximo, decide: encender el ventilador (ruido y consumo) o reducir el consumo (bajar la luz de la pantalla, bajar la velocidad de la CPU, detener el disco). El usuario puede indicar de antemano si el ruido del ventilador le molesta.

Administración de baterías: las notebooks usan baterías inteligentes que le informan al SO su voltaje máximo y actual, carga máxima y actual, tasa de descarga máxima y actual, etc., y aceptan cambios de parámetros. Con varias baterías, el SO cambia de una a otra sin cortar la energía. Cuando la última se está agotando, avisa al usuario y hace un apagado ordenado (por ejemplo, para que no se corrompa el sistema de archivos).

Interfaz de drivers: Windows usa ACPI (Advanced Configuration and Power Interface, interfaz avanzada de configuración y energía). El SO les pide a los drivers que informen las capacidades y el estado de sus dispositivos (clave con plug and play, porque al arrancar el SO ni sabe qué dispositivos hay) y les ordena bajar el consumo. También hay tráfico al revés: si el teclado o el ratón detectan actividad tras un período inactivo, es la señal para volver a la operación normal.

### 8.3 Cuestiones de los programas de aplicación

Otra vía: que los programas usen menos energía aunque empeore la experiencia (mejor una experiencia pobre que ninguna cuando se acaba la batería). Normalmente se les avisa cuando la carga baja de un umbral, y cada programa decide entre degradar el rendimiento o arriesgarse. Flinn y Satyanarayanan (2004) estudiaron cómo hacerlo midiendo con una herramienta llamada PowerScope (la computadora conectada a una fuente externa a través de un multímetro digital controlado por software): cuando no hay degradación se presenta la mejor información; con degradación, baja la fidelidad (precisión) de lo que se muestra.

(Tanenbaum, cap. 5.8, págs. 417–425)

---

## 9. Caso de estudio Linux: el shell, la redirección y las tuberías

Linux ofrece tres interfaces: la verdadera interfaz de llamadas al sistema, la interfaz de la biblioteca y la de los programas utilitarios estándar (algunos definidos en POSIX 1003.2): el shell, compiladores, editores y herramientas de archivos. Las distribuciones de escritorio reemplazaron la interfaz de teclado por una GUI orientada al ratón sin cambiar el sistema operativo, y esa flexibilidad explica en parte su popularidad. La GUI de Linux arma un entorno de escritorio (ventanas, iconos, carpetas, barras de herramientas, arrastrar y soltar), con un administrador de ventanas; los más populares son GNOME y KDE. La GUI se provee con X11 (el sistema X Window, ver 7.4): el servidor X controla teclado, ratón y pantalla y redirige la entrada y salida a los programas cliente; encima está la biblioteca xlib. El servidor X suele iniciarlo durante el arranque un administrador de pantalla, que muestra la pantalla gráfica de inicio de sesión. Desde la GUI se puede abrir un emulador de terminal (xterm) con la línea de comandos.

El shell. La mayoría de los programadores y usuarios avanzados prefiere la línea de comandos, el shell: es más rápida, más poderosa, se extiende fácil y no provoca lesiones por esfuerzo repetitivo con el ratón. El shell predeterminado en la mayoría de los Linux es bash (Bourne Again SHell), basado en el Bourne shell original de UNIX; también existen ksh y csh.

Funcionamiento, en orden:
1. Al iniciar, el shell se inicializa y escribe un indicador (prompt), por ejemplo % o $.
2. Espera que el usuario escriba una línea de comandos.
3. Toma la primera palabra como el nombre de un programa, lo busca y, si lo encuentra, lo ejecuta.
4. Se suspende hasta que el programa termina.
5. Vuelve a leer el siguiente comando.
Lo importante: el shell es un programa de usuario ordinario. Solo necesita leer del teclado, escribir en el monitor y poder ejecutar otros programas.

Argumentos y banderas: cp org dest invoca cp con dos argumentos (copia org con el nombre dest). En head -20 archivo, el -20 es una bandera: imprime las primeras 20 líneas en vez de las 10 predeterminadas. El guion evita la ambigüedad: head 20 archivo imprimiría las 10 primeras líneas de un archivo llamado 20 y después las de otro llamado archivo.

Comodines: * coincide con cualquier cadena (ls *.c lista los archivos que terminan en .c; si existen x.c, y.c y z.c equivale a ls x.c y.c z.c); ? coincide con un carácter cualquiera; una lista entre corchetes elige uno de esos caracteres (ls [ape]* lista los que empiezan con a, p o e).

Entrada, salida y error estándar: un programa no tiene que abrir la terminal. Al iniciarse tiene acceso automático a la entrada estándar (para leer), la salida estándar (para la salida normal) y el error estándar (para los mensajes de error), que por defecto son la terminal: se lee del teclado y se escribe en la pantalla. Ejemplo: sort lee líneas de la terminal hasta que el usuario escribe CTRL-D (fin de archivo), las ordena alfabéticamente y las escribe en la pantalla.

Redirección:
- < archivo redirige la entrada estándar; > archivo redirige la salida estándar. Se pueden combinar: sort <ent >sal hace que sort lea de ent y escriba en sal. Como el error estándar no se redirigió, los mensajes de error van a la pantalla.
- Un filtro es un programa que lee de la entrada estándar, procesa y escribe en la salida estándar.
- sort <ent >temp; head -30 <temp; rm temp: tres comandos separados por punto y coma; primero sort escribe en temp, después head muestra las 30 primeras líneas de temp en la terminal y por último se borra temp.
- Según la cartilla de la cátedra: > guarda la salida reemplazando el archivo y >> la agrega al final.

Tuberías (pipes): la barra vertical | toma la salida de un programa como entrada del siguiente, sin archivo temporal: sort <ent | head -30. Una colección de comandos unidos por | es una tubería en línea (pipeline). Ejemplo de cuatro componentes: grep ter *.t | sort | head -20 | tail -5 >foo. grep escribe todas las líneas que contienen "ter" en los archivos terminados en .t; sort las ordena; head se queda con las 20 primeras; tail escribe las últimas 5 de esas (las líneas 16 a 20 de la lista ordenada) en el archivo foo. Linux da bloques básicos (muchos filtros) y un mecanismo para combinarlos casi sin límite.

Segundo plano: con & al final, el comando se ejecuta en segundo plano y el shell muestra enseguida el indicador para el siguiente comando: wc -l <a >b & cuenta las líneas de a y escribe el resultado en b, en segundo plano. Las tuberías también: sort <x | head &. Puede haber varias a la vez.

Secuencias de comandos de shell (shell scripts): una lista de comandos en un archivo que se le da a un shell como entrada estándar; el shell los procesa en orden. Pueden asignar variables, tener parámetros y usar if, for, while y case: son programas en el lenguaje del shell. El shell C de Berkeley hace que se parezcan a programas en C.

Cómo se implementa una tubería (relación con la Unidad 4, sección de llamadas al sistema): la llamada pipe crea un seudoarchivo que guarda los datos entre los componentes; en sort <ent | head -30, el shell hace que el descriptor 1 (salida estándar) de sort escriba en la tubería y que el descriptor 0 (entrada estándar) de head lea de ella. Los descriptores 0, 1 y 2 ya están abiertos al arrancar un programa y el shell los redirige antes de ejecutarlo; por eso un filtro no sabe de qué archivo lee ni a cuál escribe.

Ejemplo resuelto 18 (interpretar una tubería). Comando: cat notas.txt | grep aprobado | sort | head -3 > top3.txt.
1. cat escribe el contenido de notas.txt en su salida estándar, que está conectada a una tubería.
2. grep lee de esa tubería y deja pasar solo las líneas que contienen "aprobado".
3. sort ordena esas líneas alfabéticamente.
4. head -3 se queda con las 3 primeras.
5. > top3.txt redirige la salida estándar de head al archivo top3.txt, reemplazando su contenido. Si fuera >>, se agregaría al final.
Nada aparece en pantalla salvo los mensajes de error, porque el error estándar no se redirigió.

(Tanenbaum, cap. 10.2.2–10.2.3, págs. 731–734) (Apunte: comandos de Linux de la cátedra, símbolos |, > y >>) (Relación con la Unidad 2: fork, procesos en segundo plano, CTRL-D; con la Unidad 4: los descriptores de archivo y la llamada pipe)

---

## 10. Caso de estudio Linux: la E/S en Linux

El sistema de E/S de Linux es bastante simple y parecido al de otros UNIX: todos los dispositivos se ven como archivos y se usan con las mismas llamadas read y write que los archivos ordinarios. En algunos casos hay que configurar parámetros del dispositivo con una llamada especial.

### 10.1 Conceptos fundamentales

Linux integra los dispositivos en el sistema de archivos como archivos especiales. A cada dispositivo se le asigna una ruta, normalmente en /dev: un disco podría ser /dev/hd1, una impresora /dev/lp y la red /dev/net. Se usan como cualquier archivo, con open, read y write, sin comandos especiales. Ejemplo: cp archivo /dev/lp copia el archivo a la impresora y lo imprime (si el usuario tiene permiso sobre /dev/lp); cp ni siquiera sabe que está imprimiendo.

Dos categorías:
- Archivo especial de bloques: una secuencia de bloques numerados, cada uno direccionable por separado: se puede leer el bloque 124 sin leer antes los bloques 0 a 123. Se usan para los discos.
- Archivo especial de caracteres: para dispositivos que reciben o envían un flujo de caracteres: teclados, impresoras, redes, ratones, plotters. No tiene sentido buscar el bloque 124 en un ratón.

Cada archivo especial tiene un driver asociado. Cada driver tiene un número de dispositivo mayor que lo identifica; si maneja varios dispositivos (por ejemplo, dos discos del mismo tipo), cada uno tiene un número de dispositivo menor. Juntos, mayor y menor identifican cada dispositivo en forma única. A veces un driver maneja dos dispositivos muy relacionados: el de /dev/tty controla el teclado y la pantalla, considerados un solo dispositivo, la terminal.

Con ls -l /dev se ven: la primera letra del modo es b (bloque) o c (carácter), y en lugar del tamaño aparecen los números mayor y menor separados por coma. Por ejemplo, una línea como "brw-rw---- 1 root disk 8, 1 ... sda1" indica un dispositivo de bloques con número mayor 8 y menor 1 (complemento: el ejemplo de salida no está en el libro; la cátedra toma ls -l /dev en sus exámenes).

Los dispositivos de caracteres de terminal se controlan de formas que no hacen falta en los de bloques: cada usuario prefiere su tecla para borrar (retroceso o SUPR), para borrar la línea (antes @, hoy CTRL-U) o para interrumpir (CTRL-C es común pero no universal). Linux permite personalizar todo eso con una llamada al sistema especial, que también expande tabuladores, habilita o deshabilita el eco y convierte entre retorno de carro y avance de línea. Esa llamada no se permite sobre archivos regulares ni especiales de bloques.

### 10.2 Redes: los sockets

Berkeley UNIX promovió las redes como E/S y Linux siguió su convención. El concepto clave es el socket, análogo a un buzón o a la ficha telefónica de la pared: la interfaz entre el usuario y la red. Figura 10-19 del libro: un proceso emisor y uno receptor en espacio de usuario, cada uno con su socket en el espacio de kernel, unidos por una conexión a través de la red.

Los sockets se crean y destruyen dinámicamente. Crear un socket devuelve un descriptor de archivo, que se usa para conectar, leer, escribir y liberar la conexión. Tres tipos comunes:
1. Flujo de bytes confiable orientado a conexión: el equivalente a una tubería entre dos procesos de distintas máquinas; los bytes llegan todos y en orden.
2. Flujo de paquetes confiable orientado a conexión: igual, pero preserva los límites de los paquetes. Si el emisor hace cinco write de 512 bytes y el receptor pide 2560, con el tipo 1 recibe los 2560 juntos; con el tipo 2 recibe solo 512 y necesita cuatro llamadas más.
3. Transmisión de paquetes no confiable: acceso a la red cruda; los paquetes pueden perderse o desordenarse, sin garantías, pero con más rendimiento. Útil para tiempo real y multimedia, donde importa más la velocidad que la integridad.
Protocolos: TCP (Transmission Control Protocol) para flujos de bytes confiables; UDP (User Datagram Protocol) para paquetes no confiables; los dos sobre IP (Internet Protocol). Vienen de ARPANET y son la base de Internet. No hay un protocolo común para flujos de paquetes confiables.

Antes de usar un socket hay que enlazarlo a una dirección; en el dominio de Internet, enteros de 32 bits en la versión 4 y de 128 bits en la versión 6. Para una conexión, un lado hace listen sobre un socket local (crea un búfer y se bloquea hasta que lleguen datos); el otro hace connect con su descriptor local y la dirección remota. Si se acepta, la conexión funciona como una tubería: se lee y escribe con el descriptor del socket local y se cierra con close.

### 10.3 Llamadas al sistema de E/S

Casi toda la E/S se hace con el archivo especial correspondiente, sin llamadas especiales. Para lo específico de un dispositivo, los UNIX anteriores a POSIX tenían ioctl, que hacía de todo y resultó un desastre. POSIX lo dividió en funciones separadas, sobre todo para terminales (figura 10-20 del libro):

| Llamada | Descripción |
|---|---|
| s = cfsetospeed(&termios, velocidad) | establece la velocidad de salida |
| s = cfsetispeed(&termios, velocidad) | establece la velocidad de entrada |
| s = cfgetospeed(&termios, velocidad) | obtiene la velocidad de salida |
| s = cfgetispeed(&termios, velocidad) | obtiene la velocidad de entrada |
| s = tcsetattr(fd, opc, &termios) | establece los atributos |
| s = tcgetattr(fd, &termios) | obtiene los atributos |

Hay llamadas separadas para entrada y salida porque algunos módems usan velocidades distintas en cada sentido: el videotex enviaba pedidos a 75 bits/s y recibía a 1200 bits/s; hoy el ADSL recibe a 8 Mbps y envía a 512 kbps. Las dos últimas llamadas establecen y leen los caracteres especiales (borrar carácter y línea, interrumpir), habilitan o deshabilitan el eco y manejan el control de flujo. ioctl sigue disponible.

### 10.4 Implementación de la E/S en Linux

La E/S se implementa con drivers, uno por tipo de dispositivo, que aíslan al resto del sistema de las particularidades del hardware. Con interfaces estándar, la mayor parte del sistema de E/S queda en la parte del kernel independiente de la máquina.

Cuando se accede a un archivo especial:
1. El sistema de archivos determina sus números mayor y menor y si es de bloques o de caracteres.
2. El número mayor indexa una de dos tablas hash internas (una para dispositivos de caracteres y otra para los de bloques).
3. La estructura encontrada tiene apuntadores a los procedimientos para abrir, leer, escribir, etc.
4. El número menor se pasa como parámetro.
Agregar un tipo de dispositivo es agregar una entrada a una de esas tablas y proveer los procedimientos.

Operaciones de algunos dispositivos de caracteres (figura 10-21 del libro; cada fila es un driver):

| Dispositivo | Abrir | Cerrar | Leer | Escribir | Ioctl |
|---|---|---|---|---|---|
| Null | null | null | null | null | null |
| Memoria | null | null | mem_read | mem_write | null |
| Teclado | k_open | k_close | k_read | error | k_ioctl |
| Tty | tty_open | tty_close | tty_read | tty_write | tty_ioctl |
| Impresora | lp_open | lp_close | error | lp_write | lp_ioctl |

Escribir en el teclado y leer de la impresora dan error (los errores de programación del tema 4.3).

Cada driver tiene dos mitades, las dos en el kernel y en modo kernel: la mitad superior se ejecuta en el contexto de quien llama y es la interfaz con el resto de Linux; la mitad inferior se ejecuta en el contexto del kernel e interactúa con el dispositivo. Los drivers pueden llamar a procedimientos del kernel para asignar memoria, manejar el temporizador, controlar el DMA, etc.; ese conjunto está definido en la interfaz driver-kernel.

Dispositivos de bloques: el objetivo es minimizar la cantidad de transferencias. Hay una caché entre los drivers de disco y el sistema de archivos (figura 10-22 del libro: arriba el sistema de archivos virtual; debajo, los sistemas de archivos, la caché, los planificadores de E/S y los drivers de bloques para archivos regulares y especiales de bloques; al costado, la disciplina de línea opcional y el driver de caracteres para los archivos especiales de caracteres; y los drivers de protocolos y el driver de red para los sockets). Antes del kernel 2.2 había cachés de páginas y de búfer separadas; ahora hay una caché unificada, con un nivel de bloques genérico que traduce entre sectores, bloques, búferes y páginas.
- La caché guarda miles de los bloques usados más recientemente. Cuando se necesita un bloque (nodo-i, directorio o datos), primero se busca en la caché; si está, se evita el acceso al disco.
- Si no está, se lee del disco a la caché y de ahí se copia donde haga falta. Como la caché tiene espacio limitado, se usa el algoritmo de reemplazo de páginas (Unidad 3).
- Las escrituras van a la caché, no al disco. El demonio pdflush vacía los bloques al disco si la caché supera cierto tamaño, y todos los bloques sucios se escriben cada 30 segundos.

Planificador de E/S de Linux: reordena o agrupa las peticiones de lectura y escritura a los dispositivos de bloques para minimizar los movimientos de la cabeza. El básico es el planificador del elevador de Linus:
1. Las operaciones de disco se guardan en una lista doblemente enlazada ordenada por dirección de sector.
2. Las peticiones nuevas se insertan en orden.
3. Las operaciones adyacentes se combinan en una sola petición de disco.
El elevador básico puede producir inanición, así que la versión revisada agrega dos listas más con las lecturas y las escrituras ordenadas por tiempo límite: 0,5 segundos para lecturas y 5 segundos para escrituras. Si el plazo de la escritura más antigua está por vencer, se atiende antes que la lista principal. (En la terminología habitual, este planificador con plazos se conoce como deadline; el libro no le da nombre.)

Bloques de disco crudos: los archivos especiales de bloques permiten acceder al disco por número de bloque absoluto, sin el sistema de archivos. Se usan para la paginación y el mantenimiento del sistema.

Dispositivos de caracteres: producen o consumen flujos, así que no tiene sentido el acceso aleatorio. Excepción: la disciplina de línea, asociada a una terminal (estructura tty_struct), que interpreta los datos: edición local de líneas (borrar caracteres y líneas), convertir retornos de carro en avances de línea y otros procesamientos. Si un proceso necesita cada carácter, pone la línea en modo crudo y se ignora la disciplina. En la salida: expandir tabuladores, convertir avances de línea en retorno de carro más avance de línea, agregar relleno en terminales mecánicas lentas. Con disciplina de línea es modo cocido; sin ella, modo crudo, útil para enviar datos binarios por una línea serial y para las GUI.

Dispositivos de red: también son flujos, pero su naturaleza asíncrona los hace difíciles de integrar con los de caracteres. El driver de red produce paquetes con datos y encabezados, que pasan por los drivers de protocolos de red y llegan a la aplicación. La estructura clave es el búfer de socket skbuff, que representa porciones de memoria con los datos del paquete; los datos no siempre empiezan al principio del búfer, porque los protocolos agregan y quitan encabezados. Los procesos usan la API de sockets de BSD. Con raw_sockets se accede directo al dispositivo de red, saltando los protocolos; solo los superusuarios pueden crearlos.

### 10.5 Los módulos de Linux

Durante décadas, los drivers de UNIX se vinculaban estáticamente en el kernel: con pocos dispositivos que no cambiaban, un centro de cómputo armaba su kernel y, si compraba un disco nuevo, lo volvía a vincular. Con la PC, la cantidad de dispositivos explotó, y para la mayoría de los usuarios era difícil agregar un driver, recompilar, instalar el kernel nuevo y arriesgarse a que no arranque. Linux lo resolvió con módulos cargables: código que se carga en el kernel mientras el sistema funciona. Los más comunes son drivers de caracteres o de bloques, pero también sistemas de archivos, protocolos de red o herramientas de monitoreo.

Al cargar un módulo, en orden:
1. Se reubica al instante, durante la carga.
2. Se comprueba que estén disponibles los recursos que necesita (por ejemplo, niveles de petición de interrupción) y se marcan como en uso.
3. Se establecen los vectores de interrupción necesarios.
4. Se actualiza la tabla de drivers para el nuevo número mayor.
5. Se ejecuta el driver para la inicialización específica del dispositivo.
Después queda instalado como cualquier driver estático. Otros UNIX modernos también tienen módulos cargables.

(Tanenbaum, cap. 10.5, págs. 771–779) (Relación con la Unidad 3: caché de páginas, reemplazo y pdflush; con la Unidad 4: archivos especiales, números mayor y menor, caché de búfer y sync cada 30 segundos)

---

## 11. Caso de estudio Windows: la E/S en Windows Vista

Objetivos del administrador de E/S de Windows: un marco extensible y flexible para manejar con eficiencia una enorme variedad de dispositivos y servicios; descubrimiento automático de dispositivos e instalación de drivers (plug-and-play); administración de energía de los dispositivos y la CPU; todo con una estructura básicamente asíncrona que permite superponer cálculo y transferencias de E/S. Hay cientos de miles de dispositivos que funcionan con Vista; para muchos comunes el driver ya viene con el sistema, y contando todas las versiones hay casi un millón de binarios de drivers distintos.

Atención: el resumen de la cátedra no cubre este caso de estudio. El programa lo nombra como "componentes de E/S de Windows, KMDF/UMDF".

### 11.1 Conceptos fundamentales

Plug-and-play: el administrador de E/S trabaja muy junto con el administrador de plug-and-play, basado en la idea de bus enumerable. Buses como PC Card, PCI, PCI-x, AGP, USB, IEEE 1394, EIDE y SATA permiten preguntarle a cada ranura qué dispositivo hay. Una vez descubiertos los dispositivos, el administrador de plug-and-play asigna los recursos de hardware (niveles de interrupción), busca los drivers y los carga en memoria. Por cada driver cargado se crea un objeto de driver, y por cada dispositivo al menos un objeto de dispositivo. En buses como SCSI la enumeración es solo al arrancar; en USB puede pasar en cualquier momento, y requiere cooperación entre el administrador de plug-and-play, los drivers del bus (que enumeran) y el administrador de E/S.

En Windows, todo se implementa como drivers de E/S: los sistemas de archivos, los filtros antivirus, los administradores de volúmenes, las pilas de protocolos de red y hasta servicios del kernel sin hardware. Algunos se cargan por configuración (no hay dispositivo que enumerar); otros, como los sistemas de archivos, los carga un código especial, como el reconocedor de sistemas de archivos, que analiza un volumen y deduce su formato.

Discos dinámicos: pueden abarcar varias particiones e incluso varios discos, y reconfigurarse sin reiniciar; un sistema de archivos puede abarcar varias unidades en forma transparente.

Copias sombra de volúmenes: un driver de filtro crea una instantánea del volumen que se puede montar por separado y representa el volumen en un momento anterior, registrando los cambios posteriores. Sirve para recuperar archivos borrados por accidente, ver estados anteriores de un archivo y hacer respaldos precisos de servidores: el sistema les pide a las aplicaciones servidor que lleguen a un punto conveniente, toma la instantánea, les dice que sigan, y respalda el estado de la instantánea. Las aplicaciones se bloquean muy poco tiempo en lugar de desconectarse durante todo el respaldo, y el respaldo queda en un estado fácil de recuperar. (Relación con la Unidad 4: las instantáneas para respaldar un sistema activo.)

E/S asíncrona: un hilo puede iniciar una E/S y seguir ejecutando en paralelo; es importante sobre todo en servidores. Cuatro formas de enterarse de que terminó:
1. Especificar un objeto de evento en la llamada y esperar a que ocurra.
2. Especificar una cola en la que el sistema publica un evento de compleción.
3. Proveer un procedimiento de retorno (callback) que el sistema llama al terminar.
4. Sondear una posición de memoria que el administrador de E/S actualiza al terminar.

E/S con prioridades (introducida en Vista): la prioridad sale de la prioridad del hilo que emite la E/S o se fija explícitamente. Hay cinco: crítica, alta, normal, baja y muy baja. La crítica la reserva el administrador de memoria para evitar interbloqueos con presión de memoria extrema. Baja y muy baja son para procesos de segundo plano (desfragmentación, exploradores de spyware, búsqueda en el escritorio). La mayoría es normal; las aplicaciones multimedia pueden usar alta, o pedir una reservación de ancho de banda garantizado para archivos de tiempo crítico (música, video): el sistema les indica el tamaño de transferencia óptimo y cuántas operaciones pendientes mantener.

ReadyBoost (sección 11.6 del libro, el administrador de caché): Vista puede usar una memoria flash conectada por USB como caché de escritura inmediata, un nuevo nivel en la jerarquía de memoria, más lento que la DRAM pero más barato. Comprime los datos (en general al doble) y los cifra, con un driver de filtro entre el sistema de archivos y el administrador de volúmenes. ReadyBoot usa la flash para acelerar el arranque. Ayudan de verdad con 512 MB de DRAM; con 1 GB o más casi no se notan. Es de escritura inmediata para no perder datos si se desconecta la flash.

### 11.2 Llamadas a la API de E/S

Las operaciones básicas son las de casi cualquier sistema: open, read, write, ioctl y close, más operaciones de plug-and-play y de energía, establecer parámetros, vaciar búferes, etc. En Win32 se envuelven en interfaces de más alto nivel, pero por debajo abren dispositivos y hacen estas operaciones. Incluso algunas operaciones de metadatos, como renombrar un archivo, son una versión especial de ioctl. Las llamadas nativas de NT reciben muchos parámetros y variantes. Principales (figura 11-37 del libro):

| Llamada | Descripción |
|---|---|
| NtCreateFile | abre archivos o dispositivos nuevos o existentes |
| NtReadFile | lee de un archivo o dispositivo |
| NtWriteFile | escribe en un archivo o dispositivo |
| NtQueryDirectoryFile | pide información sobre un directorio, incluidos los archivos |
| NtQueryVolumeInformationFile | pide información sobre un volumen |
| NtSetVolumeInformationFile | modifica la información del volumen |
| NtNotifyChangeDirectoryFile | se completa cuando cambia cualquier archivo del directorio o subárbol |
| NtQueryInformationFile | pide información sobre un archivo |
| NtSetInformationFile | modifica la información de un archivo |
| NtLockFile | bloquea un rango de bytes de un archivo |
| NtUnlockFile | elimina un bloqueo de rango |
| NtFsControlFile | operaciones varias sobre un archivo |
| NtFlushBuffersFile | vacía al disco los búferes del archivo en memoria |
| NtCancelIoFile | cancela las E/S pendientes de un archivo |
| NtDeviceIoControlFile | operaciones especiales en un dispositivo |

Detalles:
- NtCreateFile da descriptores de seguridad a los archivos nuevos, una descripción extensa de los permisos pedidos y cierto control sobre cómo se asignan los bloques.
- NtReadFile y NtWriteFile reciben un manejador, un búfer, una longitud, un desplazamiento explícito y una clave para acceder a rangos bloqueados; la mayoría de los parámetros indican cómo informar la compleción (posiblemente asíncrona).
- NtNotifyChangeDirectoryFile: como la E/S es asíncrona, el hilo sigue y recién se le avisa cuando algo cambia; la petición queda pendiente en el sistema de archivos como un IRP. Eso complica desmontar un volumen con E/S pendiente, así que Windows permite cancelar E/S pendientes y desmontar por la fuerza.
- NtQueryInformationFile y NtSetInformationFile son una especie de ioctl para archivos: nombres, cifrado, compresión, dispersión, id interno. Con Set se renombra o se borra, pero reciben manejadores, no nombres: hay que abrir el archivo primero. También renombran los flujos de datos alternativos de NTFS.
- NtLockFile y NtUnlockFile aplican bloqueos obligatorios a rangos de bytes: las lecturas y escrituras tienen que dar la clave que se usó en NtLockFile. En UNIX existen herramientas parecidas, pero respetar los bloqueos es discrecional para las aplicaciones.
- NtFlushBuffersFile equivale a sync de UNIX: obliga a escribir al disco los datos del sistema de archivos (relación con la Unidad 4).
- Los puertos de compleción de E/S son una cola que ayuda a los servidores multihilo a usar E/S asíncrona con eficiencia, despertando hilos bajo demanda y reduciendo cambios de contexto.

### 11.3 Implementación de la E/S

El sistema de E/S de Windows tiene cuatro partes:
1. Los servicios de plug-and-play: detectan cambios en la configuración del hardware, arman o desarman las pilas de dispositivos y cargan o descargan drivers.
2. El administrador de energía: ajusta el estado de energía de los dispositivos para reducir el consumo cuando no se usan.
3. El administrador de E/S: maneja los objetos de E/S del kernel y las operaciones basadas en IRP, como IoCallDriver e IoCompleteRequest.
4. El modelo de drivers de dispositivos: la mayor parte del trabajo de E/S lo hacen los drivers.

Modelos de drivers:
- WDM (Windows Driver Model, modelo de drivers de Windows): el modelo que los drivers deben seguir, diseñado para Windows 98 y para los Windows basados en NT desde Windows 2000, de modo que un driver bien escrito sirva en los dos. Hay un kit de desarrollo (Windows Driver Kit); la mayoría de los drivers empieza copiando uno de muestra. El verificador de drivers (verifier.exe) valida que cumplan los requisitos del WDM (estructura y protocolos de las peticiones de E/S, administración de memoria), con un nivel de comprobación configurable.
- WDF (Windows Driver Foundation, fundamento de drivers de Windows): como aun así es muy difícil escribir drivers, WDF es un sistema de envolturas que corre encima del WDM y simplifica lo más común, sobre todo la interacción con la energía y el plug-and-play. Incluye dos marcos:
  - UMDF (User-Mode Driver Framework, marco de drivers en modo usuario): para escribir drivers como servicios que se ejecutan en procesos, en modo usuario. Aumenta la solidez del sistema, porque un error del driver no corrompe el kernel.
  - KMDF (Kernel-Mode Driver Framework, marco de drivers en modo kernel): para drivers que se ejecutan en el kernel, pero con muchos detalles del WDM resueltos automáticamente.
  Debajo de los dos sigue estando el WDM.

Relación con el tema 4.2: los drivers en espacio de usuario (como los de MINIX 3) aíslan al kernel; UMDF es la forma en que Windows ofrece eso.

Objetos y pila de dispositivos: los dispositivos se representan con objetos de dispositivo, tanto hardware (buses) como abstracciones de software (sistemas de archivos, motores de protocolos de red, filtros antivirus). Se organizan en una pila de dispositivos. Para iniciar una E/S, el administrador de E/S llama a IoCallDriver con apuntadores al objeto de dispositivo de arriba y al IRP que representa la petición. Figura 11-38 del libro, un nivel de la pila: el objeto de dispositivo (con sus datos de instancia y un apuntador al siguiente objeto de dispositivo) apunta al objeto de driver, que tiene una tabla de despacho con entradas CREATE, READ, WRITE, FLUSH, IOCTL, CLEANUP, CLOSE, etc., que apuntan al código del driver cargado.

Pasos de IoCallDriver:
1. Obtiene del IRP el tipo de operación (CREATE, READ, CLOSE, etc., que corresponden a las llamadas de la API).
2. Con el objeto de dispositivo del nivel actual busca el objeto de driver.
3. Indexa la tabla de despacho del driver con el tipo de operación y obtiene el punto de entrada.
4. Llama al driver, que recibe el objeto de dispositivo y el IRP.

Al terminar de procesar el IRP, el driver tiene tres opciones:
1. Llamar otra vez a IoCallDriver con el IRP y el siguiente objeto de dispositivo de la pila.
2. Declarar la petición completa y volver a quien llamó.
3. Poner el IRP en una cola interna y volver declarando la petición pendiente. Si todos los drivers de arriba hacen lo mismo, la E/S queda asíncrona.

Paquete de peticiones de E/S (IRP, I/O Request Packet). Campos principales (figura 11-39 del libro): código de operación (indexa la tabla de despacho), banderas, apuntadores a búfer (de kernel y de usuario), la lista de MDL (Memory Descriptor Lists, listas de descriptores de memoria, que describen las páginas físicas de los búferes, para el DMA), el hilo, la información de compleción y cancelación, el vínculo con el siguiente IRP del hilo, el bloque APC de compleción y, abajo, un arreglo de tamaño dinámico con los datos de la pila de drivers: un campo por cada driver que maneja la petición, que también indica qué rutina llamar al completar. Al completar, la pila se recorre en orden inverso llamando a la rutina de compleción de cada driver; cada uno puede seguir completando o dejar la petición pendiente. El administrador de E/S tiene que saber la profundidad de la pila para asignar un IRP lo bastante grande (cada objeto de dispositivo guarda la profundidad). Qué objeto sigue en la pila lo sabe solo el driver anterior, en sus datos privados; de hecho no tiene por qué ser una pila: un driver puede crear IRP nuevos, mandar la E/S a otra pila o pasar a un hilo trabajador. Los campos usados para encolar el IRP se reutilizan al completar para la APC que llama a la rutina de compleción en el contexto del hilo original, y un vínculo une todos los IRP pendientes con el hilo que los inició.

Pilas de drivers (figura 11-40 del libro: a la izquierda, un driver monolítico de impresora que hace todo el trabajo; a la derecha, una pila con un driver de filtro, un driver de función y un driver de bus, sobre el nivel de abstracción de hardware y los controladores):
- Un driver puede hacer todo solo (monolítico) o apilarse: la petición pasa por una secuencia de drivers y cada uno hace una parte.
- Uso común: separar la administración del bus (por ejemplo, el bus PCI, complicado por sus modos y transacciones) del trabajo funcional del dispositivo. El escritor del driver usa el driver de bus estándar. USB y SCSI también tienen una parte específica del dispositivo y una parte genérica que provee Windows.
- Otro uso: insertar drivers de filtro, que transforman las operaciones cuando el IRP baja por la pila y durante la compleción. Por ejemplo, comprimir los datos camino al disco o cifrarlos camino a la red, sin que la aplicación ni el driver real se enteren.

Problema de confiabilidad: los drivers en modo kernel son un problema grave para la estabilidad de Windows: la mayoría de las caídas del kernel se deben a errores de drivers, porque comparten el espacio de direcciones con el kernel y el ejecutivo y pueden corromper estructuras del sistema. Influyen la enorme cantidad de drivers, programadores menos experimentados y el detalle necesario para un driver correcto: el modelo es poderoso, pero toda la E/S es asíncrona y abundan las condiciones de competencia. Windows 2000 sumó a los sistemas basados en NT el plug-and-play y la administración de energía de Win9x, lo que obliga a los drivers a manejar dispositivos que se conectan y desconectan con paquetes de E/S a medio procesar. Por eso se creó WDF.

Administrador de energía: antes era apagar el monitor y detener el disco; hoy importa por la batería de las portátiles, las PC que quedan encendidas y el costo de energía de las granjas de servidores (Microsoft y Google las construyen al lado de centrales hidroeléctricas). Incluye pasar dispositivos a estados de espera o apagarlos con interruptores suaves, desactivar CPU en multiprocesadores y bajar la velocidad del reloj. Dos modos:
- Hibernación: se copia toda la memoria física al disco y el consumo baja a un goteo (una portátil puede estar semanas así); se puede cambiar la batería. Al reanudar se restaura la memoria y se reinicializan los dispositivos, sin volver a iniciar sesión. Aun optimizando (ignorar páginas no modificadas ya respaldadas, comprimir el resto), puede tardar muchos segundos con varios gigabytes.
- Modo suspendido: todo el sistema al menor nivel de energía posible, con lo justo para refrescar la DRAM. Mucho más rápido que hibernar, pero menos confiable: se pierde el trabajo si se corta la energía, si se cambia la batería o si algún driver no logra reinicializar su dispositivo. En Vista se mejoró y se dejó de permitir que las aplicaciones vetaran el paso a suspendido.

(Tanenbaum, cap. 11.7, págs. 896–906; ReadyBoost, cap. 11.6, págs. 895–896) (Relación con la Unidad 1: estructura del SO y modos kernel y usuario; con la Unidad 2: E/S asíncrona, eventos, callbacks y condiciones de competencia; con la Unidad 4: instantáneas, sync y NTFS)

---

## 12. Lo que más se toma y repaso final

Según el material de la cátedra (práctica resuelta y exámenes):

1. Tiempo medio de lectura o escritura en disco: TmLW = búsqueda + retardo rotacional (media vuelta = 30.000 / RPM ms) + transferencia (tamaño / velocidad) + sobrecarga. Ver el ejemplo resuelto 8 (7200 RPM, 6,8 ms, 19 MB/s, 2 ms → 12,99 ms).
2. Planificación del brazo del disco: calcular el orden de atención y el movimiento total con FCFS, SSF/SSTF, elevador (SCAN/LOOK) y C-SCAN/C-LOOK. Ver el ejemplo resuelto 10 (brazo en 11: 111, 61 y 60 cilindros).
3. Las tres formas de hacer E/S (programada, por interrupciones, con DMA) y la operación del DMA paso a paso.
4. Dispositivos de bloque contra dispositivos de carácter, y cómo verlos con ls -l /dev (letra b o c, números mayor y menor).
5. Las capas del software de E/S y qué hace cada una; los 10 pasos de un manejador de interrupciones; la estructura de un driver.
6. RAID 0 a 5: cómo reparte los datos cada uno, qué tolera y qué cuesta; la paridad XOR. Ver los ejemplos resueltos 2 y 3.
7. Comandos: iostat y vmstat, con la columna id de vmstat, que es el porcentaje de CPU inactiva. Complemento: la cartilla de comandos de la cátedra no trae una sección de E/S; vmstat aparece en la de memoria, y en los exámenes se pregunta qué indica la columna id. En vmstat, las columnas de CPU son us (usuario), sy (sistema), id (inactiva) y wa (esperando E/S); la columna bi y bo muestra los bloques leídos y escritos por segundo. iostat (del paquete sysstat) muestra el uso de CPU y, por dispositivo, transferencias por segundo y kB leídos y escritos. Esto es complemento: no está en el libro.

Ideas clave para recitar:
- El SO emite comandos a los dispositivos, atiende las interrupciones, maneja los errores y ofrece una interfaz uniforme (independencia de dispositivos).
- Controlador = hardware (electrónica que convierte el flujo de bits en bloques y corrige errores). Driver = software (lo escribe el fabricante, corre normalmente en el kernel).
- Puertos de E/S separados (IN y OUT) contra E/S por asignación de memoria (los registros son direcciones de memoria: drivers en C, protección por páginas; problema: la caché y los buses separados).
- DMA: la CPU programa el controlador de DMA, este transfiere sin la CPU y solo interrumpe al final. Robo de ciclo contra modo ráfaga. El búfer interno del controlador permite verificar el ECC y desacopla la velocidad del disco de la del bus.
- Interrupción precisa: cuatro propiedades (PC conocido, todo lo anterior completo, nada posterior ejecutado, estado de la instrucción del PC conocido).
- Objetivos del software de E/S: independencia, denominación uniforme, errores cerca del hardware, síncrono contra asíncrono, búferes, compartidos contra dedicados.
- E/S programada (ocupado en espera) → por interrupciones (una por carácter) → DMA (una por búfer).
- Capas: usuario → independiente del dispositivo → drivers → manejadores de interrupciones → hardware.
- Búfer: sin búfer, en usuario, en kernel, doble búfer, búfer circular; cuidado con las copias excesivas.
- Spooling: un demonio y un directorio de cola para los dispositivos dedicados.
- Disco: cilindro, pista, sector; geometría virtual y LBA; desajuste de cilindros; entrelazado; formato de bajo nivel, particionado (MBR, partición activa) y formato de alto nivel.
- Tiempo de acceso = búsqueda + rotación + transferencia; domina la búsqueda.
- SSF reduce el movimiento pero puede dejar en inanición a los extremos; el elevador acota el movimiento al doble de los cilindros y es equitativo.
- Errores: sectores de repuesto (sustituir o desplazar), recalibrate, discos AV.
- Almacenamiento estable: dos discos, escritura estable (primero el 1, después el 2, verificando), lectura estable y recuperación; el resultado es todo viejo o todo nuevo.
- Reloj programable: un solo disparo contra onda cuadrada; el driver del reloj mantiene la hora, el quantum, la contabilidad, las alarmas (lista de diferencias), los guardianes y el perfilamiento.
- Linux: los dispositivos son archivos especiales en /dev; número mayor (driver) y menor (unidad); caché unificada, pdflush y sync cada 30 s; planificador del elevador con plazos; módulos cargables. Redirección <, >, >> y tuberías |.
- Windows: plug-and-play, IRP, pila de drivers (bus, función, filtro), WDM, WDF con KMDF y UMDF.

Conexiones con otras unidades:
- Unidad 1: las tres formas de E/S, el tratamiento de una interrupción, el DMA, el MBR y el arranque, driver contra controlador, la jerarquía de memoria.
- Unidad 2: ocupado en espera (E/S programada) contra bloqueo (E/S por interrupciones); el manejador de interrupciones desbloquea al driver con up, signal o un mensaje; el quantum del reloj y Round Robin; SSF es el SJF del disco y sufre la misma inanición; el spooler de impresión; las señales SIGINT y SIGQUIT.
- Unidad 3: páginas fijas para búferes de DMA; la MMU y el TLB en el costo de una interrupción; la caché de páginas de Linux y el reemplazo; la hibernación.
- Unidad 4: archivos especiales en /dev, números mayor y menor en el nodo-i; la caché de búfer; sync; los respaldos y las instantáneas; ISO 9660 y los CD-ROM; el tamaño de bloque y el tiempo de búsqueda y rotación; la bitácora contra el almacenamiento estable.
- Unidad 6: los dispositivos dedicados (cintas, grabadores, impresoras) provocan interbloqueos; la E/S con prioridad crítica de Windows evita interbloqueos de memoria.

(Tanenbaum, cap. 5.10, resumen del capítulo) (Apunte: resumen de la cátedra, Unidad 5) (Apunte: práctica resuelta, ejercicio 3)
