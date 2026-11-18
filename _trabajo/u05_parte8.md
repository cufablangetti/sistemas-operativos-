
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
