# Sistemas Operativos — Unidad 1: Introducción, hardware y estructura de los sistemas operativos

Este documento desarrolla la Unidad 1 del programa de Sistemas Operativos (UTN, Facultad Regional Mendoza, Ingeniería en Sistemas de Información, ciclo 2026), siguiendo el orden de los puntos 1.1 a 1.7 del programa analítico. La fuente principal es Tanenbaum, Sistemas Operativos Modernos, tercera edición, complementada con los apuntes de la cátedra. Al final de cada sección se indica la referencia exacta.

---

## 1.1 Introducción y definiciones

### 1.1.1 Lenguajes, niveles y máquinas virtuales

Una computadora puede entenderse como una pila de niveles, donde cada nivel ofrece un lenguaje más cómodo que el de abajo y se apoya en él para funcionar.

Descripción de la figura de niveles: imaginemos una torre de cinco bloques apilados. En la base está el hardware digital, los circuitos y las compuertas. Encima, la microarquitectura, que es el camino de datos interno con registros y la unidad aritmético-lógica. Encima, el nivel de lenguaje máquina, que es el conjunto de instrucciones que la CPU entiende. Encima, el sistema operativo. Y en la cima, los programas de aplicación. Una flecha vertical que sube indica que cada nivel se construye sobre el anterior y le oculta su complejidad.

Cada nivel define una máquina virtual: una máquina que no existe físicamente, pero que el programador percibe como si existiera. El programador que escribe en C no ve registros ni sectores de disco, ve variables y archivos. Esa máquina virtual más amable es, en buena medida, lo que fabrica el sistema operativo.

El concepto llega a su forma más literal en las máquinas virtuales propiamente dichas, donde un programa monitor reproduce el hardware completo y permite ejecutar varios sistemas operativos a la vez sobre una sola máquina física. Eso se desarrolla en el punto 1.5.

Referencia: (Tanenbaum, cap. 1.1 y 1.7.5, págs. 3 a 7 y 67 a 71). El desarrollo completo de niveles y máquinas virtuales pertenece a Tanenbaum, Organización de Computadoras, un enfoque estructurado, referencia 4 del programa, que no forma parte del material disponible. Lo anterior es un complemento elaborado para cubrir el punto del programa.

### 1.1.2 Repaso del hardware de cómputo

Un sistema de cómputo está formado por la CPU, la memoria principal y los dispositivos de entrada/salida, unidos por un bus del sistema.

Descripción de la figura de la arquitectura: una línea horizontal gruesa atraviesa el dibujo de lado a lado, es el bus. Colgando de esa línea, hacia arriba, hay cuatro cajas conectadas: la CPU, la memoria, la controladora de video con su monitor, y la controladora de disco con sus discos. Todo lo que viaja entre esas cajas pasa por el bus.

**La CPU.** Es el cerebro. Su ciclo básico es: obtener la instrucción de la memoria, decodificarla para determinar su tipo y sus operandos, ejecutarla, y volver a empezar. El ciclo se repite hasta que el programa termina.

Además de los registros generales, hay tres registros especiales que el programador ve y que el sistema operativo debe conocer:

- Contador de programa (Program Counter): contiene la dirección de memoria de la siguiente instrucción que se va a obtener. Se actualiza solo.
- Apuntador de pila (Stack Pointer): apunta al tope de la pila actual en memoria, donde se guardan los datos de los procedimientos que fueron llamados pero todavía no retornaron.
- PSW (Program Status Word, palabra de estado del programa): contiene los bits de código de condición y, entre ellos, el bit que determina el modo de ejecución.

**Modo kernel y modo usuario.** Casi todas las CPU tienen dos modos, y un bit del PSW controla cuál está activo. En modo kernel la CPU puede ejecutar cualquier instrucción de su repertorio y usar todas las características del hardware; es el modo en el que corre el sistema operativo. En modo usuario sólo se puede ejecutar un subconjunto de instrucciones y acceder a un subconjunto de características; es el modo en el que corren los programas comunes. Cuando un programa de usuario necesita un servicio del sistema operativo, ejecuta una llamada al sistema, que mediante una instrucción TRAP pasa a modo kernel y entrega el control al sistema operativo.

Esta separación es el fundamento de toda la protección: sin ella, cualquier programa podría escribir directamente en el disco de otro usuario o apagar las interrupciones.

**Multihilamiento y multinúcleo.** El multihilamiento o hiperhilamiento permite que la CPU mantenga el estado de dos hilos de ejecución distintos y alterne entre ellos en una escala de nanosegundos. No son dos CPU reales, pero el sistema operativo las ve casi como tales. Los chips multinúcleo sí contienen varias CPU completas en un mismo chip.

**La jerarquía de memoria.** La memoria se organiza en niveles, donde cuanto más rápido es un nivel, más caro resulta y menos capacidad tiene.

| Nivel | Tiempo de acceso típico | Capacidad típica | Volátil |
|---|---|---|---|
| Registros | igual que la CPU | menos de 1 KB | sí |
| Caché L1 y L2 | de 1 a pocos ciclos | de KB a pocos MB | sí |
| Memoria principal (RAM) | decenas de nanosegundos | de GB | sí |
| Disco magnético | milisegundos | de cientos de GB a TB | no |
| Cinta magnética | segundos o más | muy alta | no |

La memoria caché funciona así: la memoria principal se divide en líneas de caché, y las líneas que se usan con más frecuencia se mantienen en una caché de alta velocidad ubicada dentro o muy cerca de la CPU. Cuando el programa necesita leer una palabra, el hardware comprueba si la línea está en la caché. Si está, hay un acierto de caché, la petición se resuelve ahí y no se envía ninguna petición por el bus a la memoria principal. Si no está, hay un fallo y se paga el acceso completo a memoria. La caché L1 está siempre dentro de la CPU y se accede sin retraso; la L2 contiene varios megabytes y su acceso cuesta uno o dos ciclos de reloj.

**Ejemplo resuelto: tiempo medio de acceso a memoria con caché.**

Supongamos una caché L1 con un tiempo de acceso de 1 nanosegundo, una memoria RAM con un tiempo de acceso de 10 nanosegundos, y una tasa de aciertos de caché del 95 por ciento.

Paso 1. En el 95 por ciento de los accesos la palabra está en la caché y el costo es 1 nanosegundo.

Paso 2. En el 5 por ciento restante hay fallo: primero se consulta la caché, que cuesta 1 nanosegundo, y después hay que ir a la memoria principal, que cuesta 10 nanosegundos. Total del caso de fallo: 11 nanosegundos.

Paso 3. Se promedia ponderando por las probabilidades. Tiempo medio igual a 0,95 por 1 más 0,05 por 11, que da 0,95 más 0,55, es decir 1,50 nanosegundos.

Paso 4. Interpretación: sin caché, cada acceso costaría 10 nanosegundos. Con caché cuesta 1,50. La mejora es de 10 dividido 1,50, es decir 6,67 veces. Y eso se logra con una caché que, en capacidad, es una fracción ínfima de la RAM. Ese es el valor de la localidad de referencia.

**Memoria no volátil.** Además de la RAM, hay memoria que conserva su contenido sin energía. La ROM se graba en fábrica y no se puede modificar. La EEPROM y la memoria flash también son no volátiles, pero se pueden borrar y reescribir. La memoria CMOS, en cambio, es volátil y se alimenta de una batería: ahí se guardan la fecha, la hora y la configuración del BIOS.

**Discos.** Un disco consta de uno o más platos que giran a 5400, 7200 o 10800 revoluciones por minuto. Un brazo mecánico con punto de giro en una esquina se mueve sobre los platos, como el brazo de un tocadiscos. En cualquier posición dada del brazo, cada cabeza lee una región anular llamada pista. El conjunto de todas las pistas que quedan bajo las cabezas para una misma posición del brazo se llama cilindro.

**Memoria virtual y MMU.** Muchas computadoras ofrecen memoria virtual: permiten ejecutar programas más grandes que la memoria física, dejando parte del programa en el disco y usando la memoria principal como una caché de las partes que se ejecutan con más frecuencia. Esto exige traducir, al instante, la dirección que genera el programa en la dirección física real de la RAM. De esa traducción se encarga una parte de la CPU llamada MMU (Memory Management Unit, unidad de administración de memoria).

**Dispositivos de E/S y drivers.** Un dispositivo de E/S consta de dos partes: el dispositivo propiamente dicho y su controlador, que es un chip o conjunto de chips que lo maneja físicamente y acepta comandos del sistema operativo. Las interfaces de los controladores están estandarizadas, de modo que cualquier fabricante pueda construir dispositivos compatibles; IDE, Electrónica de unidades integradas, es un ejemplo de esa estandarización. El software que se comunica con un controlador, que le da comandos y recibe sus respuestas, se llama driver o controlador de software. Para funcionar, el driver debe estar dentro del sistema operativo y ejecutarse en modo kernel.

**Buses.** El bus ISA de la IBM PC original y su sucesor el bus PCI son los dos buses principales. El USB se inventó para conectar dispositivos de E/S lentos, como el teclado y el ratón. El bus SCSI es de alto rendimiento y está pensado para discos, escáneres y otros dispositivos veloces que necesitan mucho ancho de banda.

**Plug and play.** Antes de plug and play, cada tarjeta de E/S tenía un nivel de interrupción fijo y direcciones fijas para sus registros, lo que generaba conflictos cuando dos dispositivos pedían la misma interrupción. Plug and play permite que el sistema recolecte automáticamente la información sobre los dispositivos, asigne de manera centralizada los niveles de interrupción y las direcciones de E/S, y después le informe a cada tarjeta cuáles le tocaron.

Referencia: (Tanenbaum, cap. 1.3, págs. 19 a 33). (Apunte: resumen so (5).pdf, secciones 1.3.1 a 1.3.7).

### 1.1.3 Entrada/salida: programada, por interrupciones, por DMA y canales de datos

Hay tres formas de llevar a cabo una operación de entrada/salida, y se diferencian en cuánta CPU consumen.

**Primera forma: E/S programada, con espera ocupada.** El programa de usuario emite una llamada al sistema, el kernel la traduce en una llamada al driver correspondiente, el driver inicia la operación y entra en un ciclo cerrado sondeando continuamente al dispositivo para ver si terminó. Cuando termina, el driver coloca los datos donde corresponde y retorna. El defecto es grave: la CPU queda ocupada haciendo la pregunta "¿ya terminaste?" durante toda la transferencia, sin hacer nada útil. A ese sondeo continuo se lo llama espera ocupada o polling.

**Segunda forma: E/S controlada por interrupciones.** El driver inicia el dispositivo y le pide que genere una interrupción cuando termine; después, el driver retorna. El sistema operativo bloquea al programa llamador si hace falta y se pone a ejecutar otro trabajo. Cuando el controlador del dispositivo detecta el final de la transferencia, genera una interrupción, y el sistema operativo atiende el final de la operación. La CPU se libera durante la espera, pero paga una interrupción por cada unidad de datos transferida.

**Tercera forma: E/S con DMA.** Se usa un chip especial llamado DMA (Direct Memory Access, acceso directo a memoria) que controla el flujo de bits entre la memoria y el controlador del dispositivo sin intervención constante de la CPU. La CPU configura el chip: le indica cuántos bytes transferir, las direcciones de dispositivo y de memoria involucradas y la operación, y lo deja trabajar. Cuando el chip DMA termina, genera una única interrupción.

**Canales de datos.** En las mainframes, la idea del DMA se lleva al extremo con los canales de datos: procesadores de E/S especializados, con su propio repertorio de instrucciones, que ejecutan programas de canal completos y manejan muchos dispositivos de forma autónoma. La CPU central sólo les indica dónde está el programa de canal y recibe la notificación al final. Es el antecesor directo del DMA y de las controladoras inteligentes actuales.

**Ejemplo resuelto: cuánta CPU consume cada forma de hacer E/S.**

Planteo: hay que transferir 1000 bytes desde un dispositivo que entrega un byte cada 100 microsegundos. Atender una interrupción cuesta 5 microsegundos de CPU.

Paso 1. Duración total de la transferencia. Son 1000 bytes por 100 microsegundos cada uno, igual a 100000 microsegundos, es decir 100 milisegundos. Este tiempo es el mismo en los tres métodos, porque lo impone el dispositivo, no la CPU.

Paso 2. Espera ocupada. La CPU sondea durante toda la transferencia: 100 milisegundos de CPU consumidos, el 100 por ciento.

Paso 3. Por interrupciones. Hay una interrupción por byte, o sea 1000 interrupciones, cada una de 5 microsegundos. Total: 5000 microsegundos, es decir 5 milisegundos de CPU. Sobre los 100 milisegundos que dura la operación, eso es el 5 por ciento. El otro 95 por ciento la CPU lo dedica a otros procesos.

Paso 4. Con DMA. Hay una sola interrupción al final: 5 microsegundos, es decir 0,005 milisegundos. Sobre 100 milisegundos, es el 0,005 por ciento.

Paso 5. Conclusión. El tiempo que tarda la transferencia no cambia, pero el costo en CPU pasa de 100 por ciento a 5 por ciento y a prácticamente cero. Por eso todo dispositivo veloz, y el disco en particular, usa DMA.

Referencia: (Tanenbaum, cap. 1.3.5, págs. 27 a 30, y cap. 5.1.4 a 5.2.4, págs. 336 a 348). (Apunte: resumen so (5).pdf, sección Dispositivos de E/S).

### 1.1.4 Control de flujo: secuencial, saltos, procedimientos, co-rutinas e interrupciones

El control de flujo describe cómo avanza la ejecución de un programa, es decir, qué valor va tomando el contador de programa.

**Secuencial.** El caso normal: terminada una instrucción, se ejecuta la siguiente. El contador de programa se incrementa automáticamente.

**Saltos.** Una instrucción de salto carga un valor nuevo en el contador de programa. Si el salto es condicional, se toma o no según los bits de condición del PSW. No se guarda ninguna dirección de retorno: es un viaje de ida.

**Procedimientos.** Una llamada a procedimiento también cambia el contador de programa, pero antes apila la dirección de retorno. Cuando el procedimiento termina, la instrucción de retorno desapila esa dirección y la ejecución continúa donde había quedado. La relación es asimétrica: hay uno que llama y uno que es llamado, y el llamado siempre empieza desde su principio.

**Co-rutinas.** Son una generalización simétrica del procedimiento. Dos co-rutinas se ceden el control mutuamente, y cada una, al recibir de nuevo el control, retoma exactamente en el punto donde lo había cedido, conservando su estado. No hay uno que llame y otro que sea llamado: son pares. Es el modelo mental más cercano a lo que hace un sistema operativo cuando alterna entre procesos, con la diferencia de que la alternancia entre co-rutinas la decide el propio programa, mientras que la alternancia entre procesos la decide el planificador.

**Interrupciones.** Es el único de estos mecanismos que no está previsto en el texto del programa. Un dispositivo externo, de forma asincrónica, obliga a la CPU a abandonar lo que estaba haciendo. El hardware guarda el contador de programa y el PSW, consulta el vector de interrupciones para obtener la dirección de la rutina de servicio y salta a ella. Al terminar, se restaura el estado y el programa interrumpido continúa sin haberse enterado. Desde el punto de vista del programa, es una llamada a procedimiento que él nunca escribió.

Descripción de la figura de la interrupción: una línea horizontal representa la ejecución del programa de usuario, avanzando de izquierda a derecha. En un punto cualquiera, una flecha vertical que viene desde abajo, rotulada "el disco terminó", corta esa línea. La ejecución salta hacia arriba, a una segunda línea corta rotulada "rutina de servicio de la interrupción", la recorre, y vuelve a bajar exactamente al punto donde había sido interrumpida, continuando la primera línea.

Referencia: (Tanenbaum, cap. 1.3.1 y 5.1.5, págs. 19 a 23 y 339 a 343). Co-rutinas y canales de datos no están desarrollados en el Tanenbaum de Sistemas Operativos; lo anterior es un complemento elaborado para cubrir esos puntos del programa.

### 1.1.5 Lenguaje ensamblador: definición y conceptos

El lenguaje ensamblador es un lenguaje simbólico en el que cada instrucción corresponde, en general, a una instrucción de lenguaje máquina. En lugar de escribir el código binario de la operación, se escribe un nemónico como MOV, ADD o INT, y en lugar de direcciones numéricas se usan etiquetas. Un programa llamado ensamblador traduce ese texto al lenguaje máquina real.

No es un lenguaje de alto nivel: no hay estructuras de control ni tipos de datos. Lo que da a cambio es control absoluto sobre los registros y sobre el hardware, y por eso aparece en dos lugares donde no se puede evitar: en las partes más bajas del sistema operativo, y en el código del sector de arranque.

**Los registros del 8086 que usa la cátedra.** Los registros generales son AX, BX, CX y DX, cada uno de 16 bits, divisibles en dos mitades de 8 bits: AH y AL para AX, BH y BL para BX, y así sucesivamente. Los registros de segmento son DS, ES, CS y SS. Los de índice y puntero son SI, DI, BP y SP.

**El mecanismo de los servicios por interrupción.** La lógica general que usa la cátedra es la siguiente: el número de interrupción, es decir INT seguido de un valor en hexadecimal, elige la familia de servicios; el registro AH elige la función dentro de esa familia; y los demás registros transportan los parámetros o los resultados. Es importante no confundirse: AH selecciona la función, pero los datos pueden ir en AL, DL, DX, BX, CX o en el par DS:DX, según el caso.

Las cuatro familias que toma la cátedra son:

| Interrupción | Familia de servicios |
|---|---|
| INT 10h | Video |
| INT 14h | Puerto serie |
| INT 16h | Teclado, a nivel BIOS |
| INT 17h | Impresora |
| INT 21h | Funciones de DOS |

Las funciones de INT 10h, video, que conviene distinguir bien porque se confunden entre sí:

| AH | Qué hace | Dónde van los datos |
|---|---|---|
| 00h | Inicializa el modo de video | AL contiene el modo |
| 01h | Ajusta el tamaño del cursor | CH línea inicial, CL línea final |
| 02h | Inicializa la posición del cursor | DH fila, DL columna, BH página |
| 09h | Muestra un carácter con atributo, pero no avanza el cursor | AL carácter, BL atributo, CX cantidad |
| 0Ah | Muestra un carácter sin atributo nuevo, tampoco avanza | AL carácter, CX cantidad |
| 0Eh | Muestra un carácter y avanza el cursor | AL carácter |
| 13h | Muestra una cadena completa | ES:BP dirección, CX longitud, DH y DL posición, BL atributo |

Las funciones de INT 21h, DOS, que es la más importante:

| AH | Qué hace | Dónde van los datos |
|---|---|---|
| 01h | Lee un carácter del teclado con eco en pantalla | retorna en AL |
| 02h | Muestra un carácter en pantalla | el carácter va en DL |
| 07h | Lee un carácter sin eco | retorna en AL |
| 08h | Lee sin eco y controla Ctrl-Break | retorna en AL |
| 09h | Muestra una cadena de caracteres | DS:DX apunta a la cadena, que termina en el signo pesos |
| 0Ah | Lee una cadena desde el teclado y la guarda en un buffer | DS:DX apunta al buffer |
| 0Bh | Consulta si hay entrada disponible | AL vale FFh si hay, 00h si no |
| 2Ah | Obtiene la fecha | CX año, DH mes, DL día, AL día de la semana |
| 2Ch | Obtiene la hora | CH hora, CL minutos, DH segundos, DL centésimas |
| 3Ch a 42h | Archivos: crear, abrir, cerrar, leer, escribir, borrar, mover el puntero | BX handle, CX cantidad de bytes, DS:DX buffer |
| 4Ch | Termina el proceso y devuelve el control a DOS | AL contiene el código de retorno |

Las funciones de INT 16h, teclado a nivel BIOS: la función 00h lee una tecla y espera hasta que haya una, devolviendo el código ASCII en AL y el código de barrido en AH; la función 01h solamente consulta si hay tecla, sin bloquear, e indica el resultado en el flag de cero; la función 02h devuelve en AL el estado de las teclas Shift, Ctrl, Alt, Caps Lock y Num Lock.

**Ejemplo resuelto paso a paso: mostrar la cadena "SISTEMAS OPERATIVOS" en pantalla.**

Paso 1. Elegir el servicio. Hay que mostrar una cadena completa, no un carácter suelto. Dentro de las funciones de DOS, la que corresponde es INT 21h con AH igual a 09h.

Paso 2. Preparar la cadena en memoria. La cadena debe estar declarada en el segmento de datos y debe terminar con el signo pesos, que es el carácter que marca el final para esta función. Si falta ese signo, la función sigue mostrando basura de memoria hasta encontrar un pesos por casualidad.

Paso 3. Cargar el segmento de datos. La dirección de la cadena se pasa en el par DS:DX, de modo que DS tiene que apuntar al segmento de datos. Como no se puede cargar un valor inmediato directamente en DS, se pasa primero por AX: se carga el segmento de datos en AX y luego se mueve AX a DS.

Paso 4. Cargar el desplazamiento. Se carga en DX la dirección efectiva de la cadena, usando la instrucción LEA, que carga la dirección y no el contenido.

Paso 5. Seleccionar la función. Se carga el valor 09h en AH.

Paso 6. Invocar el servicio con INT 21h. DOS recorre la memoria desde DS:DX mostrando caracteres hasta encontrar el signo pesos.

Paso 7. Terminar el programa. Se carga 4Ch en AH y 00h en AL, que es el código de retorno, y se ejecuta INT 21h nuevamente. Equivale a cargar 4C00h en AX de una sola vez.

Los cuatro errores que la cátedra señala como típicos en este ejercicio son: usar DL en lugar de DX para pasar la dirección; olvidar el signo pesos al final de la cadena; no cargar DS antes de llamar; y usar la función 02h, que muestra un solo carácter, cuando se quiere mostrar una cadena entera.

Referencia: (Apunte: Interrupciones (1).pdf). (Apunte: Tp5 - Tabla Interrupciones.pdf, Cartilla de Interrupciones UTN-FRM). La definición de lenguaje ensamblador corresponde a Tanenbaum, Organización de Computadoras, referencia 4 del programa, no disponible en el material; el párrafo introductorio es un complemento elaborado.

### 1.1.6 Sector de booteo y arranque de la computadora

El arranque es la secuencia que lleva a la máquina desde el encendido hasta tener el sistema operativo funcionando. Tanenbaum lo describe para el Pentium de esta manera.

En la tarjeta madre hay un programa llamado BIOS (Basic Input Output System, sistema básico de entrada y salida), que contiene software de E/S de bajo nivel: procedimientos para leer el teclado, escribir en la pantalla y hacer E/S de disco. Hoy reside en una RAM tipo flash, que es no volátil pero puede actualizarse.

Cuando se enciende la computadora, el BIOS empieza a ejecutarse y hace lo siguiente:

1. Prueba cuánta RAM hay instalada y si el teclado y los demás dispositivos básicos están presentes y responden bien.
2. Explora los buses ISA y PCI para detectar todos los dispositivos conectados. Registra los dispositivos heredados, que tienen niveles de interrupción y direcciones fijas, y los dispositivos plug and play. Si los dispositivos presentes son distintos de los de la vez anterior, configura los nuevos.
3. Determina el dispositivo de arranque consultando una lista almacenada en la memoria CMOS, que el usuario puede modificar entrando a la configuración del BIOS.
4. Lee el primer sector del dispositivo de arranque, lo coloca en memoria y lo ejecuta. Ese primer sector es el sector de booteo.
5. El sector de booteo examina la tabla de particiones que está al final de él mismo, determina cuál partición está activa, y lee de esa partición un cargador de arranque secundario.
6. El cargador secundario lee el sistema operativo de la partición activa y lo inicia.
7. El sistema operativo consulta al BIOS la información de configuración, comprueba que tenga el driver de cada dispositivo, carga los drivers en el kernel, inicializa sus tablas, crea los procesos de segundo plano necesarios y arranca el programa de inicio de sesión o la interfaz gráfica.

**Ejemplo resuelto paso a paso: el contenido del sector de booteo.**

Planteo: el sector de arranque maestro, o MBR, ocupa un sector de disco de 512 bytes. Hay que ver cómo se reparten esos 512 bytes.

Paso 1. Al final del sector hay una firma de 2 bytes con el valor 55AA en hexadecimal. Sin esa firma, el BIOS considera que el sector no es arrancable. Ocupa los bytes 510 y 511.

Paso 2. Antes de la firma está la tabla de particiones. Tiene 4 entradas, una por partición primaria, y cada entrada ocupa 16 bytes. Son 4 por 16, igual a 64 bytes. Ocupan desde el byte 446 hasta el 509.

Paso 3. Todo lo que queda adelante es el código de arranque: 512 menos 64 menos 2, igual a 446 bytes. Ocupan desde el byte 0 hasta el 445.

Paso 4. Verificación: 446 más 64 más 2 es igual a 512. Correcto.

Paso 5. Interpretación: el programa que arranca toda la computadora tiene que entrar en 446 bytes. Por eso está escrito en ensamblador y por eso no carga el sistema operativo él mismo, sino que se limita a encontrar la partición activa y cargar un segundo cargador, que ya no tiene ese límite de tamaño. Cada entrada de 16 bytes de la tabla de particiones guarda el indicador de partición activa, el tipo de sistema de archivos, y el sector de inicio y la cantidad de sectores de la partición.

Referencia: (Tanenbaum, cap. 1.3.7, pág. 33). (Apunte: resumen so (5).pdf, sección Arranque de la computadora). El detalle del reparto de los 512 bytes del MBR es un complemento elaborado, porque el libro describe el proceso de arranque pero no la estructura interna del sector.

---

## 1.2 Los sistemas operativos: definición y conceptos generales

### 1.2.1 Qué es un sistema operativo

Es difícil definir qué es un sistema operativo más allá de decir que es el software que se ejecuta en modo kernel, y ni siquiera eso es siempre cierto. Parte del problema es que el sistema operativo cumple dos funciones básicas que no están relacionadas entre sí.

**Primera función: el sistema operativo como máquina extendida.** La arquitectura de la mayoría de las computadoras a nivel de lenguaje máquina es primitiva y difícil de programar. La abstracción es la clave para lidiar con esa complejidad. La abstracción que cualquier usuario comprende es el archivo: una pieza útil de información, como una fotografía digital, un correo electrónico guardado o una página web. Es mucho más fácil trabajar con fotografías, correos y páginas que con cilindros, sectores y bits de estado de una controladora de disco. El trabajo del sistema operativo es crear buenas abstracciones y después implementar y administrar los objetos abstractos que creó.

Ejemplo del contraste: para leer un archivo sin sistema operativo habría que encender el motor del disco, esperar a que alcance la velocidad, mover el brazo al cilindro correcto, esperar a que pase el sector bajo la cabeza, leer los bits y verificar el código de error, y después apagar el motor. Con sistema operativo, se escribe una llamada a read con tres parámetros.

**Segunda función: el sistema operativo como administrador de recursos.** Desde esta perspectiva, el trabajo del sistema operativo es proporcionar una asignación ordenada y controlada de los procesadores, las memorias y los dispositivos de E/S entre los programas que compiten por ellos. La administración de recursos incluye el multiplexaje o compartición de recursos, en dos formas distintas:

- Multiplexaje en el tiempo: los distintos programas o usuarios toman turnos para utilizar el recurso. Así se comparte la CPU, y así se comparte la impresora.
- Multiplexaje en el espacio: en lugar de tomar turnos, cada uno obtiene una parte del recurso. Así se comparte la memoria principal, que se divide entre varios programas en ejecución para que todos estén residentes al mismo tiempo, y así se comparte el disco duro, que contiene archivos de muchos usuarios a la vez.

El multiplexaje en el espacio genera problemas de equidad y de protección, y resolverlos le corresponde al sistema operativo. Asignar espacio en disco y llevar el registro de quién usa qué bloques es una tarea típica de administración de recursos.

**Ejemplo resuelto paso a paso: por qué la multiprogramación mejora el uso de la CPU.**

Planteo: un proceso pasa el 80 por ciento de su tiempo esperando operaciones de E/S. Se quiere saber cuánto se aprovecha la CPU según cuántos procesos haya en memoria.

Paso 1. Modelo. Si cada proceso espera E/S una fracción p del tiempo, y hay n procesos independientes en memoria, la probabilidad de que los n estén esperando a la vez es p elevado a la n. En ese caso y sólo en ese la CPU está ociosa. Entonces el aprovechamiento de la CPU es 1 menos p elevado a la n.

Paso 2. Datos. p igual a 0,80.

Paso 3. Cálculo con un solo proceso. 1 menos 0,80 elevado a 1 igual a 0,20, es decir el 20 por ciento. La CPU está ociosa cuatro quintas partes del tiempo.

Paso 4. Cálculo con varios procesos:

| Procesos en memoria | Aprovechamiento de CPU |
|---|---|
| 1 | 20,00 por ciento |
| 2 | 36,00 por ciento |
| 3 | 48,80 por ciento |
| 4 | 59,04 por ciento |
| 5 | 67,23 por ciento |
| 10 | 89,26 por ciento |

Paso 5. Interpretación. Pasar de 1 a 2 procesos agrega 16 puntos de aprovechamiento; pasar de 4 a 5 agrega 8; pasar de 5 a 10 agrega 22 repartidos entre cinco procesos. El rendimiento marginal decrece: cada proceso adicional aporta menos que el anterior, y además consume memoria. Este es el argumento cuantitativo que justifica la multiprogramación y, más adelante, el que explica por qué existe un punto a partir del cual agregar procesos deja de convenir.

Nota: el modelo es optimista porque supone que los procesos son independientes, lo que no es exacto cuando compiten por el mismo dispositivo. Un modelo con colas daría números algo menores, pero la forma de la curva es la misma.

Referencia: (Tanenbaum, cap. 1.1, págs. 3 a 7, y cap. 2.1.7, págs. 93 a 95). (Apunte: resumen so (5).pdf, sección 1.1).

### 1.2.2 Conceptos generales de los sistemas operativos

**Proceso.** Es, en esencia, un programa en ejecución. Cada proceso tiene asociado un espacio de direcciones, que es una lista de ubicaciones de memoria que va desde un mínimo, generalmente cero, hasta cierto máximo, donde el proceso puede leer y escribir. Ese espacio contiene el programa ejecutable, los datos del programa y su pila. También tiene asociado un conjunto de recursos: los registros, entre ellos el contador de programa y el apuntador de pila, una lista de archivos abiertos, alarmas pendientes, listas de procesos relacionados y toda la demás información necesaria para ejecutar el programa. En esencia, un proceso es un recipiente que guarda todo lo necesario para ejecutar un programa.

**Jerarquía de procesos.** Un proceso puede crear uno o más procesos hijos, y estos a su vez pueden crear los suyos, lo que forma un árbol de procesos. El caso típico: el shell lee un comando de la terminal, el usuario pide compilar un programa, el shell crea un proceso para ejecutar el compilador, y cuando el compilador termina, ejecuta una llamada al sistema para terminarse a sí mismo.

**Espacio de direcciones.** Cada computadora tiene memoria principal para mantener los programas en ejecución. En un sistema operativo muy simple hay un solo programa a la vez en memoria; en los demás, hay que repartirla y protegerla.

**Archivos.** Son la abstracción que oculta los detalles del disco. Existen dos tipos de archivos especiales que conviene distinguir, porque la cátedra los toma: los archivos especiales de bloque, que modelan dispositivos que se acceden en bloques de tamaño fijo con direccionamiento aleatorio, como los discos; y los archivos especiales de carácter, que modelan dispositivos que entregan o reciben un flujo de caracteres, como las terminales y las impresoras. En Linux se distinguen con el comando ls -l sobre el directorio /dev: las entradas que empiezan con la letra b son dispositivos de bloque y las que empiezan con la letra c son dispositivos de carácter.

**Entrada/salida.** El sistema operativo administra los dispositivos y ofrece una interfaz uniforme para todos ellos, de modo que leer de un archivo y leer del teclado se parezcan lo más posible.

**Protección.** El sistema operativo decide quién puede acceder a qué. En UNIX se implementa con los bits rwx para el propietario, el grupo y los demás usuarios.

**El shell.** Es el intérprete de comandos: no forma parte del sistema operativo, pero es su interfaz más visible. Lee comandos, crea un proceso hijo para ejecutar cada uno, y espera a que termine.

**Memoria virtual.** Permite ejecutar programas más grandes que la memoria física, llevando y trayendo pedazos entre la RAM y el disco. Apareció primero en las mainframes, con MULTICS como primer sistema que la tuvo, y después bajó a las minicomputadoras y a las microcomputadoras.

Referencia: (Tanenbaum, cap. 1.5, págs. 37 a 49). (Apunte: resumen so (5).pdf, sección 1.5).

### 1.2.3 Llamadas al sistema

Las llamadas al sistema son la interfaz que permite a los programas de usuario solicitar servicios al sistema operativo. Son la frontera exacta entre el modo usuario y el modo kernel.

Aunque se escriben como llamadas a procedimientos normales, por dentro usan una instrucción TRAP que cambia la CPU del modo usuario al modo kernel y transfiere el control al sistema operativo. La instrucción TRAP se parece a una llamada a procedimiento en que guarda la dirección de retorno, pero se diferencia en dos cosas importantes: cambia el modo de ejecución, cosa que una llamada a procedimiento no hace; y no puede saltar a una dirección arbitraria, sino que salta a una ubicación fija o a una entrada de una tabla del kernel. Esto último es lo que impide que un programa de usuario entre al kernel por donde se le antoje.

**Ejemplo resuelto paso a paso: los once pasos de la llamada read.**

Planteo: un programa en C ejecuta la sentencia que asigna a la variable cuenta el resultado de read con tres parámetros: fd, que identifica el archivo, bufer, que indica dónde colocar los datos, y nbytes, que indica cuántos bytes leer.

Descripción de la figura: un rectángulo grande dividido por una línea horizontal. Arriba de la línea está el espacio de usuario, que contiene dos cajas: el programa de usuario y, debajo, el procedimiento de biblioteca read. Abajo de la línea está el espacio de kernel, que contiene el despachador y los manejadores de llamadas al sistema. Una flecha cruza la línea hacia abajo, rotulada TRAP, y otra vuelve a cruzarla hacia arriba.

Paso 1, 2 y 3. El programa llamador mete los parámetros en la pila. Los compiladores de C los meten en orden inverso por razones históricas: primero nbytes, después la dirección del buffer, después fd. Los parámetros primero y tercero se pasan por valor, pero el segundo se pasa por referencia, es decir, se pasa la dirección del buffer, no su contenido.

Paso 4. Se ejecuta la llamada al procedimiento de biblioteca read, que es una instrucción de llamada a procedimiento común y corriente.

Paso 5. El procedimiento de biblioteca, que normalmente está escrito en ensamblador, coloca el número de la llamada al sistema en el lugar donde el sistema operativo lo espera, que suele ser un registro.

Paso 6. Ejecuta la instrucción TRAP, que cambia a modo kernel y empieza la ejecución en una dirección fija dentro del núcleo.

Paso 7. El código del kernel examina el número de llamada y lo usa como índice en una tabla de apuntadores a manejadores de llamadas al sistema.

Paso 8. Se ejecuta el manejador correspondiente, que es el que realmente hace la lectura.

Paso 9. Terminado el manejador, el control vuelve al procedimiento de biblioteca en espacio de usuario, a la instrucción siguiente al TRAP.

Paso 10. El procedimiento de biblioteca retorna al programa de usuario, de la forma habitual.

Paso 11. El programa de usuario limpia la pila: incrementa el apuntador de pila lo suficiente como para eliminar los tres parámetros que había metido.

Observación importante sobre el paso 9: se dijo que el control "puede" volver, porque la llamada al sistema puede bloquear al llamador. Si se intenta leer del teclado y todavía no se escribió nada, el proceso se bloquea, el sistema operativo busca otro proceso para ejecutar, y recién cuando llegue la entrada se completarán los pasos 9 a 11.

**Valor de retorno y errores.** La llamada devuelve la cantidad de bytes leídos. Normalmente coincide con nbytes, pero puede ser menor si se alcanzó el fin del archivo. Si la llamada no se pudo llevar a cabo, por un parámetro inválido o un error del disco, devuelve menos uno y coloca el número de error en la variable global errno. Los programas siempre deben comprobar el resultado de una llamada al sistema.

**Las llamadas POSIX más importantes.** POSIX tiene alrededor de cien llamadas a procedimientos. Las principales, agrupadas por categoría:

Administración de procesos:

| Llamada | Qué hace |
|---|---|
| fork | Crea un proceso hijo idéntico al padre |
| waitpid | Espera a que un hijo termine |
| execve | Reemplaza la imagen del núcleo de un proceso, es decir, carga otro programa |
| exit | Termina la ejecución del proceso y devuelve el estado |
| kill | Envía una señal a un proceso |

Administración de archivos:

| Llamada | Qué hace |
|---|---|
| open | Abre un archivo para lectura, escritura o ambas |
| close | Cierra un archivo abierto |
| read | Lee datos de un archivo y los coloca en un buffer |
| write | Escribe datos de un buffer a un archivo |
| lseek | Desplaza el apuntador del archivo |
| stat | Obtiene la información de estado de un archivo |

Administración de directorios y del sistema de archivos:

| Llamada | Qué hace |
|---|---|
| mkdir | Crea un nuevo directorio |
| rmdir | Elimina un directorio vacío |
| link | Crea una nueva entrada, nombre2, que apunta a nombre1 |
| unlink | Elimina una entrada de directorio |
| mount | Monta un sistema de archivos |
| umount | Desmonta un sistema de archivos |

Varias:

| Llamada | Qué hace |
|---|---|
| chdir | Cambia el directorio de trabajo |
| chmod | Cambia los bits de protección de un archivo |
| time | Obtiene el tiempo transcurrido desde el 1 de enero de 1970 |

**POSIX frente a Win32.** En POSIX la correspondencia entre procedimientos de biblioteca y llamadas al sistema es casi uno a uno, aunque el estándar no obliga a que lo sea: si un procedimiento se puede resolver sin entrar al kernel, se resuelve en espacio de usuario por rendimiento. La API Win32 de Windows, en cambio, es una interfaz con miles de funciones deliberadamente desacoplada de las verdaderas llamadas al sistema: son procedimientos de biblioteca que pueden invocar o no al kernel. Esa indirección le permite a Microsoft cambiar el kernel sin romper la compatibilidad de los programas existentes.

**Ejemplo resuelto paso a paso: contar las llamadas al sistema de una lectura.**

Planteo: se quiere leer completo un archivo de 8 KB. ¿Cuántas llamadas al sistema hacen falta según el tamaño del buffer?

Paso 1. Pasar el tamaño a bytes: 8 KB son 8 por 1024, igual a 8192 bytes.

Paso 2. Con un buffer de 512 bytes: 8192 dividido 512 igual a 16 llamadas a read.

Paso 3. Con un buffer de 4096 bytes: 8192 dividido 4096 igual a 2 llamadas a read.

Paso 4. Interpretación: se lee exactamente la misma cantidad de datos, pero en el primer caso se cruza la frontera usuario-kernel dieciséis veces y en el segundo dos. Como cada cruce implica los once pasos descritos antes, con su TRAP, su cambio de modo y su consulta de tabla, el segundo caso hace ocho veces menos trabajo de kernel. Esta es la razón de ser del buffering: no se ahorra E/S de disco, se ahorran llamadas al sistema.

**Relación con el práctico de la cátedra.** El comando strace de Linux rastrea y muestra las llamadas al sistema que realiza un proceso. La forma de usarlo es strace, la opción -o seguida del nombre del archivo de salida, y después el comando que se quiere rastrear. Por ejemplo, para rastrear la ejecución de ls -la guardando el resultado en salida.txt. Al rastrear ese comando aparecen, entre otras: openat, que abre archivos o directorios, en este caso el directorio actual; read, que lee contenido desde un descriptor de archivo; getdents64, que lee las entradas de un directorio y obtiene la lista de archivos y carpetas; write, que escribe la salida en la terminal; newfstatat o statx, que obtiene la información de los archivos, es decir permisos, tamaño, propietario y fechas; y close, que cierra un descriptor abierto y libera recursos del kernel. Ver ese listado es ver, literalmente, la interfaz entre el programa y el sistema operativo.

Referencia: (Tanenbaum, cap. 1.6, págs. 49 a 62). (Apunte: resumen so (5).pdf, sección 1.6). (Apunte: Comandos_Linux-SO (1).pdf).

---

## 1.3 Historia de los sistemas operativos: las generaciones

Los sistemas operativos han estado estrechamente ligados a la arquitectura de las computadoras en las que corren, así que la historia se ordena por generaciones de hardware. La progresión es cronológica a grandes rasgos, pero hubo traslapes, falsos inicios y callejones sin salida: conviene tomarla como guía, no como una secuencia estricta.

**Antecedente: Charles Babbage.** La primera computadora digital verdadera fue diseñada por el matemático inglés Charles Bab­bage, que vivió entre 1792 y 1871. Gastó la mayor parte de su vida y de su fortuna tratando de construir su máquina analítica, pero nunca logró hacerla funcionar: era puramente mecánica y la tecnología de su época no podía producir ruedas y engranes con la precisión necesaria. La máquina analítica no tenía sistema operativo. Babbage advirtió que necesitaba software y contrató a Ada Lovelace, hija del poeta Lord Byron, como la primera programadora del mundo; el lenguaje Ada lleva su nombre.

### 1.3.1 Primera generación, de 1945 a 1955: tubos al vacío

La Segunda Guerra Mundial estimuló la construcción de computadoras digitales. El profesor John Atanasoff y su estudiante Clifford Berry construyeron en Iowa State University lo que hoy se considera la primera computadora digital funcional, con 300 tubos de vacío. Casi al mismo tiempo, Konrad Zuse construyó la Z3 en Berlín con relevadores; en 1944 se construyó la Colossus en Bletchley Park, la Mark I de Howard Aiken en Harvard y la ENIAC de Mauchley y Eckert en la Universidad de Pennsylvania.

Características de la época:

- Un solo grupo de personas, en general ingenieros, diseñaba, construía, programaba, operaba y mantenía cada máquina.
- Toda la programación se hacía en lenguaje máquina o, peor, conectando miles de cables en tableros de conexiones. No existían los lenguajes de programación, ni siquiera el ensamblador.
- No existían los sistemas operativos.
- El programador se anotaba en una hoja de firmas para reservar un turno, entraba al cuarto de máquinas, insertaba su tablero y pasaba varias horas esperando que ninguno de los veinte mil bulbos se quemara.
- Los problemas eran cálculos numéricos simples: tablas de senos, cosenos y logaritmos.

A principios de la década de 1950 aparecieron las tarjetas perforadas, que permitieron escribir los programas en tarjetas en vez de usar tableros. El resto del procedimiento siguió igual.

### 1.3.2 Segunda generación, de 1955 a 1965: transistores y procesamiento por lotes

El transistor cambió el panorama: las computadoras se volvieron lo bastante confiables como para fabricarlas y venderlas. Por primera vez hubo una separación clara entre diseñadores, constructores, operadores, programadores y personal de mantenimiento. Estas máquinas, las mainframes, vivían en cuartos con aire acondicionado, atendidas por operadores profesionales, y sólo las grandes empresas, universidades o agencias de gobierno podían costear su operación multimillonaria.

El flujo de trabajo era el siguiente: el programador escribía el programa en papel, en FORTRAN o en ensamblador, lo pasaba a tarjetas perforadas, llevaba el mazo al cuarto de entrada de datos y se lo entregaba a un operador; después se iba a tomar un café a esperar los resultados. Cuando la computadora terminaba un trabajo, el operador iba a la impresora, arrancaba las hojas y las llevaba al cuarto de salida. Se desperdiciaba muchísimo tiempo de máquina mientras los operadores caminaban de un lado a otro.

**El procesamiento por lotes.** La solución fue juntar una bandeja llena de trabajos y pasarlos a una cinta magnética con una computadora chica y barata, la IBM 1401, buena para leer tarjetas, copiar cintas e imprimir, pero mala para cálculo numérico. La cinta se llevaba a una máquina cara, la IBM 7094, que hacía los cálculos.

Descripción de la figura del flujo por lotes, que tiene seis escenas: a) los programadores llevan las tarjetas a la 1401; b) la 1401 lee los lotes de trabajos y los coloca en una cinta; c) un operador lleva físicamente la cinta de entrada a la 7094; d) la 7094 realiza los cálculos y escribe los resultados en una segunda cinta; e) el operador lleva la cinta de salida de vuelta a la 1401; f) la 1401 imprime los resultados. En el dibujo se ven las dos computadoras separadas, con un lector de tarjetas y una impresora en la 1401, unidades de cinta en ambas, y flechas que representan a una persona llevando cintas de una máquina a la otra.

Dentro de la 7094, un programa especial, el ancestro del sistema operativo, leía el primer trabajo de la cinta, lo ejecutaba, y al terminar leía automáticamente el siguiente.

**Las tarjetas de control.** Un trabajo típico empezaba con una tarjeta $JOB, que especificaba el tiempo máximo de ejecución en minutos, el número de cuenta al que cargarlo y el nombre del programador. Seguía una tarjeta $FORTRAN, que indicaba cargar el compilador desde la cinta del sistema; luego el programa a compilar; luego una tarjeta $LOAD, que indicaba cargar el programa objeto recién compilado; luego $RUN, que indicaba ejecutarlo con los datos que seguían; y finalmente $END, que marcaba el fin del trabajo. Estas tarjetas de control primitivas fueron las precursoras de los shells e intérpretes de línea de comandos modernos.

Los sistemas operativos típicos de la época fueron el FMS (Fortran Monitor System) e IBSYS, el sistema de IBM para la 7094.

### 1.3.3 Tercera generación, de 1965 a 1980: circuitos integrados y multiprogramación

A principios de los años sesenta, los fabricantes tenían dos líneas de productos incompatibles: las computadoras científicas orientadas a palabras, como la 7094, y las comerciales orientadas a caracteres, como la 1401. Mantener ambas era caro, y los clientes que crecían querían una máquina más grande capaz de ejecutar sus programas anteriores.

**La IBM System/360.** IBM resolvió los dos problemas de un golpe con una serie de máquinas compatibles en software, que iban desde el tamaño de una 1401 hasta máquinas más potentes que la 7094, y que sólo diferían en precio y rendimiento. Como todas tenían la misma arquitectura y el mismo conjunto de instrucciones, los programas escritos para una podían correr en las demás, al menos en teoría. Fue la primera línea importante en usar circuitos integrados a pequeña escala, lo que le dio una ventaja de precio sobre las máquinas de transistores. La idea de familia de computadoras compatibles fue adoptada de inmediato por todos los fabricantes importantes.

Su mayor fortaleza fue también su mayor debilidad: el sistema operativo OS/360 debía funcionar en sistemas chicos y grandes, con pocos y con muchos periféricos, en entornos comerciales y científicos, y ser eficiente en todos. No había manera de escribir un software que cumpliera requerimientos tan en conflicto. El resultado fue un sistema operativo enorme y extraordinariamente complejo, de dos a tres órdenes de magnitud más grande que el FMS, con millones de líneas de ensamblador escritas por miles de programadores y miles de errores, que requería un flujo continuo de versiones nuevas: cada versión corregía algunos errores e introducía otros, de modo que la cantidad total se mantenía más o menos constante. Fred Brooks, uno de sus diseñadores, contó esa experiencia en un libro cuya portada muestra una manada de bestias prehistóricas atrapadas en un pozo de brea.

A pesar de todo, el OS/360 y sus contemporáneos dejaban razonablemente satisfechos a sus clientes y popularizaron técnicas clave que no existían en la segunda generación.

**La multiprogramación.** En la 7094, cuando el trabajo en curso se detenía a esperar una operación de cinta o de E/S, la CPU simplemente quedaba inactiva. En cálculo científico eso no era grave porque la E/S es poco frecuente, pero en procesamiento de datos comerciales el tiempo de espera de E/S puede ser del 80 al 90 por ciento del total, y dejar inactiva una CPU carísima era inaceptable.

La solución fue particionar la memoria en varias piezas, con un trabajo distinto en cada partición. Mientras un trabajo esperaba su E/S, otro usaba la CPU. Con suficientes trabajos en memoria, la CPU podía estar ocupada casi el cien por ciento del tiempo.

Descripción de la figura de la multiprogramación: un rectángulo vertical que representa toda la memoria, dividido en cuatro franjas horizontales. La franja de más abajo está rotulada sistema operativo. Encima de ella, tres franjas rotuladas trabajo 1, trabajo 2 y trabajo 3. Las líneas que las separan son las fronteras de las particiones de memoria.

Para tener varios trabajos en memoria de forma segura hace falta hardware especial que proteja a cada uno de los demás; la 360 y los demás sistemas de tercera generación lo tenían.

**El spooling.** Otra característica importante fue la capacidad de leer los trabajos de las tarjetas y colocarlos en el disco apenas llegaban al cuarto de computadoras. Así, cuando terminaba un trabajo, el sistema operativo podía cargar otro del disco en la partición que quedaba libre. La técnica se llama spooling, de Simultaneous Peripheral Operation On Line, operación periférica simultánea en línea, y también se usó para la salida. Con el spooling desaparecieron las máquinas 1401 y el trabajo de transportar cintas.

**El tiempo compartido.** Los sistemas de tercera generación seguían siendo, en esencia, de procesamiento por lotes: entre enviar un trabajo y recibir la salida pasaban varias horas, y una coma mal puesta podía costar medio día. El deseo de respuesta rápida llevó al tiempo compartido, una variante de la multiprogramación donde cada usuario tiene una terminal en línea. Si hay veinte usuarios conectados y diecisiete están pensando o tomando café, la CPU se asigna por turnos a los tres que piden atención. Como los comandos interactivos suelen ser cortos, la computadora puede dar servicio rápido a varios usuarios y, además, ocuparse de trabajos largos por lotes en segundo plano. El primer sistema de tiempo compartido de propósito general fue CTSS (Compatible Time Sharing System), desarrollado en el M.I.T. sobre una 7094 modificada.

**MULTICS.** Tras el éxito de CTSS, el M.I.T., Bell Labs y General Electric emprendieron el desarrollo de una utilería para computadora: una máquina capaz de servir a cientos de usuarios simultáneos, con el sistema eléctrico como modelo, es decir, poder de cómputo disponible al enchufarse. El sistema se llamó MULTICS (MULTiplexed Information and Computing Service). Fue un éxito parcial en lo comercial, pero tuvo una influencia enorme en todo lo que vino después, y fue el primer sistema con memoria virtual y ligado dinámico de bibliotecas.

**Minicomputadoras y el nacimiento de UNIX.** Otro desarrollo importante fue el crecimiento de las minicomputadoras, empezando con la DEC PDP-1 en 1961: tenía sólo 4K palabras de 18 bits, pero costaba 120000 dólares, menos del 5 por ciento del precio de una 7094, y para cierto trabajo no numérico era casi tan rápida. A la PDP-1 le siguió una serie de modelos, culminando en la PDP-11.

Ken Thompson, uno de los científicos de Bell Labs que había trabajado en MULTICS, encontró una PDP-7 que nadie usaba y escribió una versión simple de MULTICS para un solo usuario. Ese trabajo se convirtió en UNIX. Como el código fuente estaba ampliamente disponible, muchas organizaciones desarrollaron sus propias versiones incompatibles, lo que produjo un caos; se consolidaron dos: System V de AT&T y BSD de la Universidad de California en Berkeley. Para que fuera posible escribir programas portables, el IEEE desarrolló el estándar POSIX, que define una interfaz mínima de llamadas al sistema a la que los sistemas UNIX deben ajustarse.

**MINIX y Linux.** En 1987 Tanenbaum liberó MINIX, un clon chico de UNIX con fines educativos, similar a UNIX en funcionalidad e incluyendo soporte POSIX; evolucionó en MINIX 3, altamente modular y enfocado en la confiabilidad, con la capacidad de detectar y reemplazar módulos fallados al instante sin reiniciar. El deseo de una versión de producción gratuita llevó a un estudiante finlandés, Linus Torvalds, a escribir Linux, inspirado en MINIX, desarrollado sobre MINIX y que originalmente daba soporte a varias de sus características, entre ellas su sistema de archivos.

### 1.3.4 Cuarta generación, de 1980 a la fecha: computadoras personales

Con los circuitos LSI (Large Scale Integration), que contienen miles de transistores por centímetro cuadrado de silicio, nació la computadora personal. En arquitectura no eran muy distintas de las minicomputadoras clase PDP-11, pero en precio sí: el microprocesador permitió que una persona tuviera su propia computadora.

**CP/M.** Cuando Intel presentó el microprocesador 8080 en 1974, la primera CPU de 8 bits de propósito general, encargó un sistema operativo a su consultor Gary Kildall. Kildall construyó primero una controladora para el disco flexible de 8 pulgadas de Shugart, lo conectó al 8080, y escribió CP/M (Control Program for Microcomputers). Intel no creyó que las microcomputadoras con disco tuvieran futuro y le cedió los derechos. Kildall fundó Digital Research, y en 1977 rediseñó CP/M para que corriera en todas las microcomputadoras con chips 8080, Z80 y similares; dominó el mundo de la microcomputación durante unos cinco años.

**MS-DOS.** A principios de los ochenta, IBM diseñó la IBM PC y buscó software. Contactó a Bill Gates por su intérprete de BASIC y le preguntó por un sistema operativo; Gates los derivó a Digital Research. Kildall no quiso reunirse con IBM y mandó a un subordinado, y su abogado se negó a firmar el acuerdo de confidencialidad. IBM volvió a Gates. Gates se enteró de que Seattle Computer Products tenía un sistema adecuado llamado DOS (Disk Operating System), lo compró, contrató a su autor Tim Paterson para modificarlo, lo rebautizó MS-DOS y se lo ofreció a IBM. El factor clave fue la decisión de Gates de vender MS-DOS a las empresas de computadoras para que lo incluyeran con su hardware, frente al intento de Kildall de venderle CP/M a los usuarios finales de a uno.

**La interfaz gráfica.** CP/M, MS-DOS y los demás sistemas de las primeras microcomputadoras se basaban en que el usuario escribiera comandos. Eso cambió por la investigación de Doug Engelbart en el Stanford Research Institute en los años sesenta: Engelbart inventó la interfaz gráfica de usuario, completa con ventanas, iconos, menús y ratón. Los investigadores de Xerox PARC adoptaron esas ideas. Steve Jobs visitó PARC, vio la interfaz y comprendió su valor, algo que la administración de Xerox no hizo. El primer intento de Apple, Lisa, fracasó por costosa; el segundo, la Macintosh, fue un éxito enorme, por más económica y porque era amigable, es decir, pensada para usuarios que no sabían nada de computadoras y tampoco pensaban aprender.

**Windows.** Microsoft, influida por el éxito de la Macintosh, produjo Windows, que al principio corría encima de MS-DOS: de 1985 a 1995 fue más un entorno gráfico que un verdadero sistema operativo. En 1995 se liberó Windows 95, una versión independiente que incorporaba muchas características de sistema operativo y usaba el MS-DOS subyacente sólo para iniciar y ejecutar programas antiguos; en 1998 siguió Windows 98. Ambos todavía contenían gran cantidad de ensamblador para procesadores Intel de 16 bits. Windows NT, en cambio, fue una reescritura desde cero en 32 bits, y es la línea de la que descienden Windows 2000, XP, Vista y los posteriores.

**Un patrón que conviene retener.** A lo largo de toda esta historia se ve que hay ideas que se inventan en un contexto, se descartan cuando el contexto cambia, y reaparecen una década más tarde en otro contexto. La programación en ensamblador, la monoprogramación y los directorios de un solo nivel desaparecieron de las computadoras grandes y volvieron a aparecer en las computadoras incrustadas y las tarjetas inteligentes. Tanenbaum llama a esto, con ironía, "la ontogenia recapitula la filogenia".

Referencia: (Tanenbaum, cap. 1.2, págs. 7 a 19, y cap. 1.5.7, págs. 46 a 49).

---

## 1.4 Variedades de sistemas operativos

Tanenbaum describe nueve tipos, ordenados de la máquina más grande a la más chica.

**De mainframe.** Para las computadoras del tamaño de un cuarto que todavía están en los grandes centros de datos corporativos. Lo que las distingue de una computadora personal no es tanto la CPU como la capacidad de E/S: una mainframe con mil discos y millones de gigabytes no es rara. Sus sistemas operativos están orientados a procesar muchos trabajos a la vez, la mayoría con mucha E/S, y ofrecen tres tipos de servicios: procesamiento por lotes, que procesa trabajos de rutina sin usuario interactivo presente, como el procesamiento de reclamos de una aseguradora; procesamiento de transacciones, que maneja grandes cantidades de peticiones pequeñas, como los cheques de un banco o las reservas de una aerolínea, donde cada unidad de trabajo es chica pero hay que manejar cientos o miles por segundo; y tiempo compartido, que permite a varios usuarios remotos ejecutar trabajos a la vez. Un ejemplo es el OS/390, descendiente del OS/360, aunque estos sistemas están siendo reemplazados por variantes de UNIX.

**De servidores.** Corren en servidores, que pueden ser computadoras personales grandes, estaciones de trabajo o incluso mainframes. Dan servicio a varios usuarios a la vez a través de una red y les permiten compartir recursos de hardware y software: impresión, archivos, web. Ejemplos: Solaris, FreeBSD, Linux y Windows Server.

**De multiprocesadores.** Para sistemas con varias CPU conectadas. Según cuán estrechamente estén conectadas y qué compartan, se llaman computadoras en paralelo, multicomputadoras o multiprocesadores. Suelen ser variaciones de los sistemas de servidores con agregados para comunicación, conectividad y consistencia. Con la llegada de los chips multinúcleo, hasta los sistemas de escritorio tienen que lidiar con multiprocesadores de pequeña escala.

**De computadoras personales.** Su trabajo es dar buen soporte a un solo usuario. Todos los modernos soportan multiprogramación, y es común que se inicien docenas de programas al arrancar. Ejemplos: Linux, FreeBSD, Windows y el sistema operativo de Macintosh.

**De computadoras de bolsillo.** Para computadoras que caben en el bolsillo, los PDA y los teléfonos celulares, que en la práctica se fusionaron y se diferencian sólo en tamaño, peso e interfaz. Casi todos se basan en CPU de 32 bits con modo protegido y corren un sistema operativo sofisticado, con telefonía, fotografía digital y aplicaciones de terceros.

**Integrados.** También llamados incrustados o embebidos. Operan en computadoras que controlan dispositivos que no se consideran computadoras: hornos de microondas, televisores, autos, grabadores de DVD, reproductores de música. La propiedad que los distingue de los de bolsillo es la certeza de que nunca se ejecutará software que no sea confiable: no se pueden instalar aplicaciones nuevas, todo el software está en ROM. Eso elimina la necesidad de protección y simplifica el diseño. Ejemplos: QNX y VxWorks.

**De nodos sensores.** Para redes de pequeños nodos que se comunican entre sí y con una estación base por radio, usados para proteger perímetros de edificios, vigilar fronteras, detectar incendios forestales o medir temperatura y precipitación. Cada nodo es una computadora real, con CPU, RAM, ROM y sensores, alimentada a batería, que debe trabajar largos períodos desatendida y en condiciones duras. El sistema operativo debe ser chico y simple, por lo general manejador de eventos, y como todos los programas se cargan por adelantado, el diseño se simplifica mucho. Ejemplo: TinyOS.

**De tiempo real.** Se caracterizan por tener el tiempo como parámetro clave. Hay dos variantes:

- Tiempo real duro: la acción debe ocurrir sin excepción en un instante determinado o dentro de un rango. Si un robot soldador de una línea de montaje suelda antes o después de tiempo, el auto se arruina. Se usan en control de procesos industriales, aeronáutica y aplicaciones militares. Deben dar garantías absolutas.
- Tiempo real suave: es aceptable fallar muy ocasionalmente a un tiempo predeterminado. El audio digital y la multimedia están en esta categoría, y los teléfonos digitales también.

**De tarjetas inteligentes.** Son los más chicos: corren en una tarjeta del tamaño de una tarjeta de crédito con un chip de CPU. Tienen restricciones severísimas de procesamiento y memoria, y algunas manejan una sola función, como el pago electrónico.

Referencia: (Tanenbaum, cap. 1.4, págs. 33 a 37).

---

## 1.5 Estructura de los sistemas operativos

Esta sección responde a la pregunta de cómo está organizado por dentro un sistema operativo. Son cinco organizaciones, y se ordenan de la más acoplada a la más distribuida.

### 1.5.1 Sistemas monolíticos

Es la organización más común. Todo el sistema operativo se ejecuta como un solo programa en modo kernel: se escribe como una colección de procedimientos enlazados entre sí en un único programa binario ejecutable extenso. Cualquier procedimiento puede llamar a cualquier otro, lo que es eficiente pero significa que un error en cualquier parte derriba el sistema entero.

Su estructura básica tiene tres niveles: un programa principal, que invoca el procedimiento de servicio solicitado; un conjunto de procedimientos de servicio, que llevan a cabo las llamadas al sistema; y un conjunto de procedimientos utilitarios, que ayudan a los procedimientos de servicio.

Descripción de la figura del modelo monolítico: tres cajas apiladas verticalmente dentro de un rectángulo grande rotulado modo kernel. Arriba, una caja chica rotulada procedimiento principal. En el medio, una fila de cajas rotuladas procedimientos de servicio. Abajo, otra fila de cajas rotuladas procedimientos utilitarios. Flechas desde la caja de arriba bajan a varias cajas del medio, y desde el medio bajan a varias de abajo.

Linux es monolítico, aunque con módulos cargables que le dan flexibilidad.

### 1.5.2 Sistemas de capas

El sistema operativo se organiza como una jerarquía de capas, cada una construida sobre la que tiene debajo, y cada capa sólo puede usar los servicios de la capa inferior. El primer ejemplo fue el sistema THE, que tenía seis capas, desde la asignación del procesador en la capa más baja hasta el operador en la más alta. Una generalización de esta idea fue MULTICS, descrito como una serie de anillos concéntricos, donde los anillos interiores tienen más privilegios que los exteriores: un procedimiento de un anillo exterior que quisiera llamar a uno interior tenía que hacer el equivalente de una llamada al sistema.

Descripción de la figura de capas: seis rectángulos apilados uno sobre otro, numerados de 0 abajo a 5 arriba. La capa 0 rotulada asignación del procesador y multiprogramación; la 1, administración de memoria y tambor; la 2, comunicación operador-proceso; la 3, administración de E/S; la 4, programas de usuario; la 5, el operador. En el modelo de anillos de MULTICS, en cambio, el dibujo son círculos concéntricos, con el anillo cero en el centro.

La ventaja es la claridad y la facilidad de depuración; la desventaja es que no siempre es posible ordenar las funciones en capas estrictas, y que atravesar muchas capas cuesta rendimiento.

### 1.5.3 Microkernels

La idea básica es lograr alta confiabilidad dividiendo el sistema operativo en módulos chicos y bien definidos. Sólo uno de ellos, el microkernel, se ejecuta en modo kernel; todo el resto, incluidos los drivers de dispositivos, corre como procesos de usuario ordinarios, sin poder especial. Así, un driver con errores, que es la causa más frecuente de fallas, puede corromper sus propios datos pero no puede derribar el sistema entero. MINIX 3 es el ejemplo.

Una regla de diseño que acompaña a esta idea: poner el mecanismo en el kernel pero dejar la directiva, es decir la política, en los procesos de usuario. El kernel provee la capacidad de hacer algo; quién y cuándo se hace lo decide afuera.

El costo es el rendimiento: lo que en un sistema monolítico es una llamada a procedimiento, en un microkernel es un intercambio de mensajes entre procesos.

### 1.5.4 Modelo cliente-servidor

Es una variación leve de la idea del microkernel. Se distinguen dos clases de procesos: los servidores, que proporcionan algún servicio, y los clientes, que lo usan. La comunicación se lleva a cabo mediante paso de mensajes: el cliente manda un mensaje pidiendo el servicio y el servidor hace el trabajo y responde.

La propiedad interesante del modelo es que se adapta sin cambios a una red: el cliente no necesita saber si el mensaje se atendió localmente o se envió por la red a un servidor remoto. Por eso este modelo es también la base conceptual de los sistemas distribuidos.

### 1.5.5 Máquinas virtuales

El monitor de máquina virtual, cuyo ejemplo clásico es el VM/370 de IBM, separa dos funciones que en otros sistemas están mezcladas: la multiprogramación y la provisión de una máquina extendida. El monitor se ejecuta directamente sobre el hardware, realiza la multiprogramación y ofrece a la capa superior no una máquina extendida y cómoda, sino varias máquinas virtuales que son copias exactas del hardware real, con su modo kernel, su modo usuario, su E/S y sus interrupciones. Sobre cada una de esas copias se puede instalar el sistema operativo que se quiera.

Descripción de la figura de máquinas virtuales: en la base, un rectángulo ancho rotulado hardware del 370. Encima, otro rectángulo ancho rotulado VM/370. Encima de este, tres cajas separadas, una al lado de la otra, cada una dividida en dos pisos: el piso de abajo rotulado CMS, CMS y MVS respectivamente, y el de arriba rotulado llamadas al sistema de cada uno. Cada caja es una máquina virtual independiente.

- Hipervisor de tipo 1: el monitor tradicional, que se ejecuta directamente sobre el hardware.
- Hipervisor de tipo 2: se ejecuta como un programa de usuario encima de un sistema operativo anfitrión, por ejemplo Windows o Linux, e interpreta el conjunto de instrucciones.
- La máquina virtual de Java es otra variante: es una arquitectura de computadora definida por software, que usa un intérprete para ejecutar código byte, lo que hace que los programas compilados a ese código byte sean portables a cualquier máquina que tenga la JVM.

### 1.5.6 Exokernels

Es la idea opuesta a la de la máquina virtual. En lugar de dar a cada usuario una copia de la máquina completa, se le da un subconjunto de los recursos reales: por ejemplo, los cilindros 0 a 1023 del disco, y no un disco virtual entero. La capa inferior, el exokernel, sólo lleva el registro de qué recursos tiene asignado cada máquina virtual y verifica que nadie use los ajenos. La ventaja es que ahorra la capa de traducción entre direcciones virtuales y reales.

Referencia: (Tanenbaum, cap. 1.7, págs. 62 a 72). (Apunte: resumen so (5).pdf, sección 1.7).

---

## 1.6 Revisión de diferentes sistemas operativos y tendencias actuales

### 1.6.1 Comparación de las estructuras

| Estructura | Qué corre en modo kernel | Ventaja principal | Desventaja principal | Ejemplo |
|---|---|---|---|---|
| Monolítica | Todo el sistema operativo | Rendimiento: las llamadas internas son llamadas a procedimiento | Un error en cualquier módulo derriba el sistema | Linux, UNIX clásico |
| Por capas | Todo, pero organizado en niveles | Claridad, depuración ordenada | Difícil de ordenar en capas estrictas, costo por atravesarlas | THE, MULTICS |
| Microkernel | Sólo el microkernel | Confiabilidad: un driver que falla no derriba el sistema | Rendimiento: paso de mensajes en lugar de llamadas | MINIX 3, QNX |
| Cliente-servidor | El microkernel y el transporte de mensajes | Se extiende naturalmente a una red | Latencia de la comunicación | Base de los sistemas distribuidos |
| Máquinas virtuales | El monitor o hipervisor | Aislamiento total entre sistemas operativos completos | Sobrecarga de la virtualización | VM/370, hipervisores actuales |
| Exokernel | El exokernel, que sólo reparte recursos | Ahorra la capa de traducción | Modelo poco difundido | Sistemas experimentales |

### 1.6.2 Tendencias actuales

Las líneas de evolución que el libro y la cátedra señalan:

- Multinúcleo en todas partes. El aumento de rendimiento ya no viene de subir la frecuencia de reloj sino de agregar núcleos, lo que convierte a la planificación de multiprocesadores en un problema cotidiano, y no sólo de los grandes servidores. La parte difícil es que las aplicaciones aprovechen ese poder.
- Virtualización generalizada. Lo que en el VM/370 era una rareza de mainframe hoy es la base de los centros de datos y del cómputo en la nube.
- Vuelta de la idea de la utilería para computadora. El concepto de MULTICS, el cómputo como un servicio al que uno se enchufa, reapareció en forma de servidores masivos de Internet a los que se conectan máquinas cliente relativamente simples, y en el comercio electrónico.
- Sistemas integrados y nodos sensores. Cada vez más dispositivos cotidianos llevan adentro un sistema operativo pequeño, con restricciones de energía y memoria que obligan a rescatar técnicas que las computadoras grandes habían descartado.
- Confiabilidad y seguridad como objetivos de diseño. El interés en los microkernels y en la modularidad del kernel responde a que la causa más común de caídas son los drivers de terceros.
- Software libre y código abierto. El camino que va de UNIX con código fuente disponible a MINIX y a Linux muestra que la disponibilidad del código fue determinante en la evolución de los sistemas operativos.

Referencia: (Tanenbaum, cap. 1.7 y 1.9, págs. 62 a 77).

---

## 1.7 Análisis comparativo: casos de estudio

### 1.7.1 Caso 1: los módulos constitutivos del kernel de Linux y cómo se relacionan

El kernel de Linux es monolítico, pero está estructurado internamente en tres grandes niveles.

En el nivel más bajo están los manejadores de interrupciones, que son la vía principal de interacción con los dispositivos, y el mecanismo de despacho de bajo nivel. Este despacho ocurre cuando llega una interrupción: el código de bajo nivel detiene el proceso en ejecución, guarda su estado en las estructuras del kernel y arranca el driver que corresponde.

En el nivel intermedio está el grueso del kernel, dividido en subsistemas que corren en el contexto de un proceso:

- Subsistema de E/S: contiene el cache de bloques, los drivers de dispositivos de carácter y de bloque, los protocolos de red y los drivers de red. Es el que atiende todas las operaciones sobre dispositivos.
- Subsistema de memoria virtual: maneja la paginación, los espacios de direcciones y el mapeo de archivos en memoria.
- Subsistema de procesos: contiene el planificador, que decide qué proceso corre; la creación y terminación de procesos mediante fork y exit; y los mecanismos de señales y de comunicación entre procesos.
- El sistema de archivos virtual, VFS, que se apoya sobre el subsistema de E/S y ofrece una interfaz única hacia arriba, de modo que ext4, FAT o NFS se vean iguales para el resto del sistema.

En el nivel más alto está la interfaz de llamadas al sistema, que es la única puerta legítima de entrada desde el espacio de usuario. Todo lo que los programas pueden pedirle al kernel pasa por ahí.

Lo que mantiene a Linux manejable a pesar de ser monolítico son los módulos cargables: porciones de código, típicamente drivers o sistemas de archivos, que pueden insertarse y quitarse del kernel en ejecución sin reiniciar. Es un término medio entre el monolito rígido y el microkernel.

Referencia: (Tanenbaum, cap. 10.2.5, págs. 736 a 739).

### 1.7.2 Caso 2: la arquitectura de Windows y sus componentes clave

Windows, desde la línea NT, tiene una estructura híbrida: no es un microkernel puro, pero tampoco un monolito plano.

En modo kernel se distinguen varias piezas:

- La capa de abstracción de hardware, HAL, que oculta las diferencias entre las distintas placas y chipsets al resto del sistema, de modo que el código superior sea el mismo sobre hardware distinto.
- El kernel propiamente dicho, que es chico y se ocupa de la planificación de hilos, la sincronización y el manejo de interrupciones y excepciones.
- Los ejecutivos, que son los subsistemas principales: administrador de objetos, administrador de procesos e hilos, administrador de memoria virtual, administrador de caché, administrador de E/S y monitor de referencia de seguridad.
- Los drivers de dispositivos, incluidos los del sistema de archivos.

En modo usuario están los subsistemas de entorno, las DLL del sistema que implementan la API Win32, y los servicios.

El rasgo arquitectónico más característico es el administrador de objetos: Windows representa de manera uniforme como objetos a los procesos, los hilos, los archivos, los semáforos y casi todo recurso del sistema, con un espacio de nombres, descriptores de seguridad y conteo de referencias comunes para todos. Esa uniformidad es la diferencia de diseño más visible frente a UNIX, donde la abstracción universal es el archivo.

El otro rasgo es la API Win32, ya mencionada: miles de funciones desacopladas de las llamadas al sistema reales, lo que le permite a Microsoft cambiar el kernel entre versiones sin romper los programas.

Referencia: (Tanenbaum, cap. 11.3, págs. 831 a 858). Las páginas correspondientes al cap. 11 no fueron recortadas para esta unidad; el desarrollo anterior es un complemento elaborado a partir del índice del libro y de Russinovich y Solomon, Windows Internals, referencia 5 del programa, que no está disponible en el material.

### 1.7.3 Comparación de conjunto

| Aspecto | Linux | Windows NT y posteriores |
|---|---|---|
| Estructura | Monolítica con módulos cargables | Híbrida, con HAL, kernel chico y ejecutivos |
| Abstracción universal | El archivo: casi todo se accede como archivo | El objeto, administrado por el administrador de objetos |
| Interfaz de programación | POSIX, correspondencia casi uno a uno con las llamadas al sistema | Win32, desacoplada de las llamadas al sistema reales |
| Portabilidad entre hardware | Por adaptación del código dependiente de arquitectura | Concentrada en la capa HAL |
| Drivers | En modo kernel, cargables como módulos | En modo kernel, con marcos KMDF y UMDF, este último en modo usuario |
| Creación de procesos | fork, que duplica el proceso, seguido de exec | CreateProcess, que crea y carga en un solo paso |

Referencia: (Tanenbaum, cap. 1.7, cap. 10.2 y cap. 11.3).

---

## Síntesis de la unidad

Los puntos que conviene tener firmes al terminar la Unidad 1:

1. El sistema operativo cumple dos funciones no relacionadas: ser una máquina extendida que ofrece abstracciones, y ser un administrador de recursos que los multiplexa en el tiempo y en el espacio.
2. La distinción entre modo kernel y modo usuario, controlada por un bit del PSW, es el fundamento de toda la protección, y la instrucción TRAP es el único pasaje legítimo de uno a otro.
3. La jerarquía de memoria intercambia velocidad por capacidad y costo, y la caché funciona gracias a la localidad de referencia.
4. Las tres formas de hacer E/S, programada con espera ocupada, por interrupciones y con DMA, tardan lo mismo pero cuestan cantidades de CPU radicalmente distintas.
5. La multiprogramación nació para que la CPU no quedara ociosa durante la E/S, y su aprovechamiento se modela como 1 menos p elevado a la n.
6. El arranque va del BIOS al sector de booteo de 512 bytes, de ahí a la partición activa y al cargador secundario, y recién después al sistema operativo.
7. Una llamada al sistema es una llamada a procedimiento que además cambia de modo y entra al kernel por una puerta fija; sus once pasos explican por qué conviene usar buffers grandes.
8. Las cinco estructuras de sistema operativo, monolítica, por capas, microkernel, cliente-servidor y máquina virtual, se ordenan como un intercambio entre rendimiento y confiabilidad.
9. En el repertorio de interrupciones del 8086, INT elige la familia de servicio y AH elige la función dentro de ella; las que más se confunden son INT 10h con AH igual a 09h, 0Ah, 0Eh y 13h, y dentro de INT 21h, la 02h para un carácter en DL y la 09h para una cadena en DS:DX terminada en el signo pesos.
