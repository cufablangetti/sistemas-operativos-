
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
