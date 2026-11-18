
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
