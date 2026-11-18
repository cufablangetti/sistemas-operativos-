# Sistemas Operativos — Unidad 4: Sistemas de archivos

Material de estudio para la Unidad 4 de Sistemas Operativos (UTN FRM, Ingeniería en Sistemas de Información, programa 2026). Sigue el orden del programa de la materia y se basa en Tanenbaum, Sistemas Operativos Modernos, 3.ª edición (capítulo 4 completo, secciones 8.4.4, 9.3, 10.6 y 11.8), en el resumen de la cátedra de la Unidad 4, en la cartilla de comandos de Linux de la cátedra y en la práctica resuelta de FAT e i-nodos.

Orden de los temas:

1. Por qué hacen falta los archivos.
2. Archivos: nombres, estructura, tipos, acceso, atributos y operaciones.
3. Directorios: un nivel, jerárquicos, rutas y operaciones.
4. Distribución del sistema de archivos en el disco.
5. Implementación de archivos: asignación contigua, lista enlazada, FAT e i-nodos.
6. Implementación de directorios.
7. Archivos compartidos: vínculos duros y simbólicos.
8. Sistemas de archivos estructurados por registro y por bitácora; transacciones atómicas.
9. Sistemas de archivos virtuales (VFS).
10. Administración del espacio en disco: tamaño de bloque, bloques libres y cuotas.
11. Respaldos.
12. Consistencia del sistema de archivos.
13. Rendimiento: caché, lectura adelantada, movimiento del brazo y desfragmentación.
14. Servidores de archivos y sistemas de archivos distribuidos; NFS.
15. Ejemplos: CD-ROM, MS-DOS (FAT) y UNIX V7.
16. NTFS.
17. Protección: dominios, matriz de protección, ACL, capacidades, sistemas confiables, modelos formales, seguridad multinivel y canales encubiertos.
18. Caso de estudio Linux: llamadas al sistema de archivos, VFS, ext2, ext3 y /proc.
19. Comandos de Linux de la cátedra para sistemas de archivos.
20. Lo que más se toma en los exámenes y ejercicios resueltos.

---

## 1. Por qué hacen falta los archivos

Guardar la información solo dentro del espacio de direcciones de un proceso no alcanza, por tres razones fundamentales:

1. El espacio de direcciones es limitado, y muchas aplicaciones necesitan guardar mucha más información (por ejemplo, un sistema de reservas de una aerolínea o un banco).
2. La información se pierde cuando el proceso termina. Para bases de datos, bancos o contabilidad, esto es inaceptable.
3. Varios procesos tienen que poder acceder a la misma información al mismo tiempo, así que la información no puede pertenecer a un solo proceso.

De estos problemas salen tres requisitos esenciales del almacenamiento a largo plazo: poder guardar una cantidad muy grande de información, que la información sobreviva a la terminación del proceso que la usa (persistencia) y que varios procesos puedan acceder a ella de manera concurrente.

A nivel físico, un disco se puede ver como una secuencia lineal de bloques de tamaño fijo con dos operaciones: leer el bloque k y escribir el bloque k. Con eso alcanzaría para guardar datos, pero no es práctico: ¿cómo se encuentra la información?, ¿cómo se impide que un usuario lea los datos de otro?, ¿cómo se sabe qué bloques están libres?

La respuesta es una nueva abstracción. Así como el sistema operativo creó la abstracción de proceso a partir del procesador y la abstracción de espacio de direcciones a partir de la memoria física, crea la abstracción de archivo para el almacenamiento a largo plazo. Definición clave: un archivo es una unidad lógica de información creada por los procesos, independiente de cualquier proceso. La información de un archivo es persistente: solo desaparece cuando su propietario la elimina explícitamente.

La parte del sistema operativo que se ocupa de los archivos (cómo se estructuran, nombran, acceden, usan, protegen e implementan) se llama sistema de archivos. Junto con los procesos y la memoria virtual, es uno de los tres conceptos centrales de un sistema operativo.

Hay dos puntos de vista. El del usuario: cómo se ven los archivos, cómo se nombran y qué operaciones admiten. El del implementador: cómo se guardan en el disco, cómo se registra el espacio libre y cómo se logra eficiencia y confiabilidad. La primera mitad de la unidad sigue el punto de vista del usuario y la segunda el del implementador.

(Tanenbaum, cap. 4, introducción, págs. 255–257) (Apunte: resumen de la cátedra, Unidad 4, págs. 1–2)

---

## 2. Archivos

### 2.1 Nomenclatura

Un archivo se accede siempre por su nombre. Las reglas varían entre sistemas, pero en general los nombres son cadenas de caracteres con letras, dígitos y algunos caracteres especiales, y muchos sistemas admiten nombres de hasta 255 caracteres. Algunos sistemas distinguen mayúsculas de minúsculas (UNIX) y otros no (MS-DOS).

Muchos sistemas admiten nombres de dos partes separadas por un punto, como prog.c. La parte que sigue al punto se llama extensión y suele indicar el tipo de archivo: .c es un programa en C, .html una página web, .jpg una imagen, .zip un archivo comprimido, .o un archivo objeto, etcétera.

- En UNIX las extensiones son solo convenciones: el sistema operativo no las impone. Un archivo puede tener varias extensiones, como prog.java.gz, y son los programas (por ejemplo, el compilador de C) los que esperan cierta extensión.
- En Windows las extensiones sí tienen significado para el sistema: el sistema asocia cada extensión con un programa, y al hacer doble clic sobre el archivo se ejecuta el programa asociado con ese archivo como parámetro.

(Tanenbaum, cap. 4.1.1, págs. 257–259) (Apunte: resumen de la cátedra, págs. 2–3)

### 2.2 Estructura de archivos

Hay tres maneras de estructurar un archivo. El libro las ilustra en la figura 4-2: en la parte (a) el archivo es una fila de bytes sin estructura; en la (b) es una fila de registros de longitud fija; en la (c) es un árbol de registros, cada uno con un campo llave en una posición fija, ordenados por esa llave.

1. Secuencia de bytes. El sistema operativo no sabe ni le importa qué hay en el archivo: solo ve bytes. El significado lo pone el programa de usuario. Es el modelo de máxima flexibilidad, y es el que usan UNIX y Windows.
2. Secuencia de registros de longitud fija, cada uno con su estructura interna. La lectura devuelve un registro completo y la escritura sobrescribe o agrega un registro. Era común en los mainframes de la época de las tarjetas perforadas de 80 columnas y las impresoras de 132 columnas. Hoy no se usa en sistemas de propósito general.
3. Árbol de registros, cada uno con una llave. El acceso es por llave y no por posición, y el sistema operativo decide dónde agregar los registros nuevos. Se usa en algunos mainframes grandes de procesamiento comercial, no en UNIX ni en Windows.

(Tanenbaum, cap. 4.1.2, págs. 259–260) (Apunte: resumen de la cátedra, pág. 3)

### 2.3 Tipos de archivos

UNIX y Windows tienen archivos regulares y directorios. UNIX tiene además archivos especiales de caracteres y de bloques.

- Archivos regulares: contienen información del usuario.
- Directorios: archivos del sistema que mantienen la estructura del sistema de archivos.
- Archivos especiales de caracteres: modelan dispositivos de E/S en serie, como terminales, impresoras y redes.
- Archivos especiales de bloques: modelan discos.

Los archivos regulares suelen ser ASCII o binarios.

- Archivos ASCII: formados por líneas de texto. Cada línea termina con un retorno de carro, un avance de línea o los dos, según el sistema, y las líneas no tienen que tener la misma longitud. Se pueden mostrar, imprimir y editar con cualquier editor de texto, y facilitan conectar la salida de un programa con la entrada de otro, como en las tuberías del shell. Su gran ventaja es la portabilidad y la legibilidad.
- Archivos binarios: al imprimirlos se ve basura incomprensible. Tienen una estructura interna conocida por los programas que los usan. El ejemplo del libro es un ejecutable de UNIX (figura 4-3a): tiene cinco secciones, que son encabezado, texto, datos, bits de reubicación y tabla de símbolos. El encabezado empieza con un número mágico que lo identifica como ejecutable y sigue con los tamaños de las partes, la dirección de inicio de ejecución y bits de bandera. El sistema solo ejecuta un archivo si tiene ese formato. El segundo ejemplo (figura 4-3b) es un archivo de biblioteca (archive): una colección de módulos objeto compilados pero no enlazados, cada uno con un encabezado que da su nombre, fecha, propietario, protección y tamaño.

Un sistema con archivos fuertemente tipificados puede proteger al usuario (por ejemplo, impedir que se ejecute un archivo que no es ejecutable), pero también lo limita, porque impide usos que los diseñadores no previeron. El libro da el ejemplo de un programa que genera automáticamente un archivo fuente: si el sistema exige que los archivos fuente tengan cierta extensión y el compilador se niega a compilar otro tipo, no se puede hacer algo tan simple como compilar la salida de otro programa.

(Tanenbaum, cap. 4.1.3, págs. 260–262) (Apunte: resumen de la cátedra, pág. 4)

### 2.4 Acceso a archivos

- Acceso secuencial: los primeros sistemas solo permitían leer el archivo en orden, desde el principio, sin saltear nada; se podía rebobinar y volver a leer. Era lo adecuado para cintas magnéticas.
- Acceso aleatorio: con los discos se puede leer cualquier byte o registro en cualquier orden, sin leer lo anterior. Es esencial para bases de datos y sistemas de reservas: si un cliente llama para reservar un asiento de un vuelo, el programa tiene que poder ir directo al registro de ese vuelo.

Hay dos formas de indicar desde dónde leer: dar la posición en cada operación read, o usar una operación seek que fija la posición actual y después leer secuencialmente desde ahí. UNIX y Windows usan la segunda.

(Tanenbaum, cap. 4.1.4, págs. 262–263) (Apunte: resumen de la cátedra, pág. 5)

### 2.5 Atributos de archivos

Además del nombre y los datos, cada archivo tiene atributos o metadatos. La figura 4-4 del libro lista los posibles: protección (quién puede acceder y cómo), contraseña, creador, propietario, bandera de solo lectura, bandera de oculto, bandera de sistema, bandera de archivo (necesita respaldo), bandera ASCII/binario, bandera de acceso aleatorio, bandera de temporal (se borra cuando termina el proceso), banderas de bloqueo, longitud del registro, posición de la llave, longitud de la llave, hora de creación, hora del último acceso, hora de la última modificación, tamaño actual y tamaño máximo.

- Las banderas son bits que controlan una propiedad: por ejemplo, ocultar el archivo en los listados, marcarlo como de solo lectura, indicar que necesita respaldo (el programa de respaldo lo desactiva y el sistema lo activa cuando el archivo cambia) o hacer que se elimine automáticamente cuando termina el proceso que lo creó.
- Los atributos de tiempo son fundamentales para herramientas como make, que compara la hora de modificación del archivo fuente con la del archivo objeto para decidir si hay que recompilar.

(Tanenbaum, cap. 4.1.5, págs. 263–264) (Apunte: resumen de la cátedra, pág. 5)

### 2.6 Operaciones de archivos

Las llamadas al sistema más comunes sobre archivos son:

1. Create: crea un archivo vacío. Anuncia que el archivo viene y fija algunos atributos.
2. Delete: elimina el archivo cuando ya no se necesita y libera su espacio en disco.
3. Open: antes de usar un archivo, el proceso lo abre. Abrirlo trae a memoria principal los atributos y la lista de direcciones de disco, para que los accesos siguientes sean rápidos.
4. Close: cuando terminan los accesos se cierra el archivo. Se liberan las tablas internas y se fuerza la escritura del último bloque, aunque no esté lleno. Muchos sistemas limitan la cantidad de archivos abiertos por proceso, para obligar a cerrarlos.
5. Read: lee datos, normalmente desde la posición actual. El que llama dice cuántos bytes quiere y da un búfer donde ponerlos.
6. Write: escribe datos, normalmente en la posición actual. Si la posición es el final, el archivo crece; si está en el medio, se sobrescriben los datos que había, que se pierden.
7. Append: forma restringida de write que solo agrega al final. Algunos sistemas no la tienen porque se puede simular.
8. Seek: reposiciona el apuntador del archivo en un lugar específico, para leer o escribir desde ahí. Es la base del acceso aleatorio.
9. Get attributes: lee los atributos (make lo necesita para comparar fechas).
10. Set attributes: cambia algunos atributos, como la protección.
11. Rename: cambia el nombre. No es estrictamente necesaria (se puede copiar y borrar), pero simplifica mucho.

(Tanenbaum, cap. 4.1.6, págs. 264–265) (Apunte: resumen de la cátedra, págs. 5–7)

### 2.7 Un programa de ejemplo: copyfile

El libro muestra un programa en C para UNIX, copyfile, que copia un archivo fuente en un archivo destino. Se invoca, por ejemplo, como copyfile abc xyz. Funciona así:

1. El sistema operativo le pasa a main dos parámetros: argc, la cantidad de argumentos de la línea de comandos, y argv, el arreglo con sus nombres.
2. El programa verifica que haya exactamente dos argumentos.
3. Abre el archivo fuente con open (solo lectura) y crea el destino con creat (con permisos de protección 0700).
4. Cada llamada exitosa devuelve un descriptor de archivo: un entero pequeño que identifica al archivo abierto en las llamadas siguientes. Si devuelve un número negativo, la apertura falló.
5. Entra en un ciclo: lee bloques de 4096 bytes con read y escribe con write exactamente la cantidad que leyó.
6. read devuelve la cantidad de bytes leídos; 0 significa fin de archivo y un valor negativo significa error. Cuando el último read devuelve 0, el ciclo termina.
7. Cierra los dos archivos con close y termina con un código de estado (0 si todo salió bien).

(Tanenbaum, cap. 4.1.7, págs. 265–268) (Apunte: resumen de la cátedra, págs. 7–8)

---

## 3. Directorios

Para llevar el registro de los archivos, los sistemas de archivos usan directorios o carpetas. En muchos sistemas los directorios también son archivos, con una función especial: organizar y localizar otros archivos.

### 3.1 Sistemas de directorios de un solo nivel

La forma más simple es un solo directorio, llamado a veces directorio raíz, que contiene todos los archivos. La figura 4-6 del libro muestra un directorio raíz con cuatro archivos que pertenecen a tres propietarios distintos, A, B y C.

- Ventajas: simpleza extrema y búsqueda rápida, porque hay un solo lugar donde buscar.
- Desventaja: no escala. Con muchos archivos y usuarios, es imposible organizarse, y dos usuarios no pueden tener archivos con el mismo nombre.
- Se usó en las primeras computadoras personales y en la supercomputadora CDC 6600. Hoy solo aparece en dispositivos incrustados muy simples, como cámaras digitales y reproductores de música.

### 3.2 Sistemas de directorios jerárquicos

Para usuarios con miles de archivos, un solo nivel no alcanza. La solución es una jerarquía: un árbol de directorios donde cada directorio puede tener archivos y subdirectorios. La figura 4-7 del libro muestra un directorio raíz con un subdirectorio por usuario (A, B y C), y debajo de cada uno, los archivos y subdirectorios de ese usuario. Así cada usuario puede organizar sus archivos por proyecto o por tema, y varios usuarios pueden compartir un servidor sin mezclarse. Casi todos los sistemas de archivos modernos son jerárquicos.

### 3.3 Nombres de rutas

- Ruta absoluta: el camino desde el directorio raíz hasta el archivo, por ejemplo /usr/ast/mailbox. Empieza siempre en la raíz y es única. El separador es / en UNIX, \ en Windows y > en MULTICS. Si el primer carácter de la ruta es el separador, la ruta es absoluta.
- Ruta relativa: se interpreta desde el directorio de trabajo (o directorio actual). Si el directorio de trabajo es /usr/ast, el archivo /usr/ast/mailbox se puede nombrar simplemente mailbox.
- Cada proceso tiene su propio directorio de trabajo: si lo cambia y termina, no afecta a nadie. Por eso un procedimiento de biblioteca que cambia el directorio de trabajo tiene que restaurarlo antes de volver.
- Los programas que necesitan un archivo concreto sin importar dónde estén (por ejemplo, un corrector ortográfico que lee /usr/lib/dictionary) usan rutas absolutas.

Entradas especiales: casi todos los sistemas jerárquicos tienen en cada directorio las entradas "." (punto, el directorio actual) y ".." (puntopunto, el directorio padre). En el directorio raíz, ".." apunta a sí mismo. El libro usa el árbol de la figura 4-8 (raíz con bin, etc, lib, usr y tmp; dentro de usr, los directorios ast, jim y lib; dentro de /usr/lib, el archivo dictionary). Un proceso con directorio de trabajo /usr/ast puede copiar el diccionario a su directorio con cp ../lib/dictionary . — la primera ruta sube a usr y baja a lib, y el punto final nombra el directorio actual. Los comandos cp /usr/lib/dictionary . , cp /usr/lib/dictionary dictionary y cp /usr/lib/dictionary /usr/ast/dictionary hacen exactamente lo mismo.

### 3.4 Operaciones de directorios (ejemplo de UNIX)

1. Create: crea un directorio vacío, salvo por "." y "..", que el sistema pone automáticamente.
2. Delete: elimina un directorio, solo si está vacío. Un directorio que solo tiene "." y ".." se considera vacío.
3. Opendir: abre un directorio para leer su contenido (por ejemplo, para listarlo).
4. Closedir: lo cierra y libera el espacio en las tablas internas.
5. Readdir: devuelve la siguiente entrada del directorio en un formato estándar, sin importar la estructura interna. Antes se podía usar read, pero eso obligaba al programador a conocer la estructura interna de los directorios.
6. Rename: cambia el nombre, como con los archivos.
7. Link: hace que un archivo existente aparezca también en otro directorio, con otro nombre de ruta. Este vínculo incrementa el contador del i-nodo del archivo; se lo llama a veces vínculo duro.
8. Unlink: elimina una entrada de directorio. Si el archivo está en un solo directorio, se elimina del sistema de archivos; si está en varios, solo se elimina ese nombre. En UNIX, la llamada para borrar un archivo es justamente unlink.

Variante: el vínculo simbólico. En lugar de que dos nombres apunten a la misma estructura interna, se crea un nombre que apunta a un archivo pequeño que contiene el nombre de otro archivo. Cuando se usa el primero, el sistema lee la ruta y vuelve a buscar con el nombre nuevo. Ventaja: pueden cruzar los límites de los discos e incluso nombrar archivos de computadoras remotas. Desventaja: son un poco menos eficientes que los vínculos duros.

(Tanenbaum, cap. 4.2, págs. 268–273) (Apunte: resumen de la cátedra, págs. 8–12)

---

## 4. Distribución del sistema de archivos

Los sistemas de archivos se guardan en discos. La mayoría de los discos se dividen en una o más particiones, cada una con un sistema de archivos independiente.

- El sector 0 del disco es el MBR (Master Boot Record, registro maestro de arranque) y se usa para arrancar la computadora. Al final del MBR está la tabla de particiones, con la dirección de inicio y fin de cada partición. Una partición está marcada como activa.
- Al arrancar, el BIOS lee y ejecuta el MBR. El programa del MBR localiza la partición activa, lee su primer bloque, el bloque de arranque, y lo ejecuta. El bloque de arranque carga el sistema operativo de esa partición. Por uniformidad, toda partición empieza con un bloque de arranque, aunque no tenga un sistema operativo.

El resto de la partición varía mucho entre sistemas de archivos. La figura 4-9 del libro muestra una distribución posible, de izquierda a derecha: MBR y tabla de particiones al principio del disco; después, cada partición. Dentro de una partición: bloque de arranque, superbloque, administración del espacio libre, i-nodos, directorio raíz y, por último, archivos y directorios.

- Superbloque: contiene los parámetros clave del sistema de archivos. Se lee en memoria al arrancar o al usar el sistema de archivos por primera vez. Incluye un número mágico que identifica el tipo de sistema de archivos, la cantidad de bloques y otra información administrativa.
- Información sobre bloques libres: por ejemplo, un mapa de bits o una lista de apuntadores.
- i-nodos: un arreglo de estructuras, una por archivo, que dicen todo sobre el archivo.
- Directorio raíz: la punta del árbol.
- El resto del disco: todos los demás directorios y archivos.

Según la cátedra, la organización típica de una partición es: bloque de arranque, superbloque, información de bloques libres, i-nodos (uno por archivo), directorio raíz, archivos y subdirectorios; el superbloque se lee en memoria al arrancar o al montar el sistema de archivos.

Conexión con la Unidad 1: el MBR, el sector 0 y la cadena de arranque son los mismos que se vieron en el arranque de la computadora.

(Tanenbaum, cap. 4.3.1, págs. 273–274) (Apunte: resumen de la cátedra, pág. 12)

---

## 5. Implementación de archivos

El problema central es llevar el registro de qué bloques del disco pertenecen a cada archivo. Hay cuatro métodos.

### 5.1 Asignación contigua

Cada archivo se guarda como una serie contigua de bloques. Con bloques de 1 KB, un archivo de 50 KB ocupa 50 bloques consecutivos; con bloques de 2 KB, ocupa 25.

Figura 4-10 del libro: en la parte (a) se ven los primeros 40 bloques de un disco con siete archivos guardados uno detrás de otro: A (4 bloques, desde el bloque 0), B (6 bloques), C, D, E, F y G. Cada archivo empieza en un bloque nuevo, así que si A ocupara tres bloques y medio, se desperdiciaría el resto del cuarto. En la parte (b) se borraron los archivos D y F, y quedaron dos huecos libres entre los archivos.

Ventajas:
- Implementación simple: alcanza con recordar dos números, la dirección del primer bloque y la cantidad de bloques. Cualquier otro bloque se calcula con una suma.
- Rendimiento de lectura excelente: el archivo entero se lee en una sola operación. Hace falta una sola búsqueda (para el primer bloque) y después no hay más búsquedas ni retrasos rotacionales: los datos llegan con todo el ancho de banda del disco.

Desventajas:
- Con el tiempo, el disco se fragmenta: quedan archivos y huecos alternados (fragmentación externa). Compactar es carísimo, porque habría que copiar todos los bloques que siguen al hueco, que pueden ser millones.
- Para reutilizar los huecos hay que mantener una lista de huecos y, al crear un archivo, saber su tamaño final para elegir un hueco adecuado. El libro lo ilustra con un procesador de texto que le pregunta al usuario cuántos bytes va a tener el documento final: si el número es chico, el programa se queda sin lugar; si es grande, puede no haber un hueco tan grande.

Uso actual: es ideal para medios de una sola escritura, como los CD-ROM, donde los tamaños se conocen de antemano y nunca cambian. En los DVD, el sistema UDF usa un número de 30 bits para la longitud de un archivo, limitado a 1 GB, así que una película de unos 4,5 GB se guarda como tres o cuatro archivos contiguos de 1 GB, llamados fragmentos. El libro remarca que la historia se repite: la asignación contigua se usó en discos magnéticos, se abandonó, y volvió con los medios ópticos.

Conexión con la Unidad 3: es el mismo problema que la segmentación pura y el intercambio con particiones variables, con huecos de tamaño variable y fragmentación externa.

### 5.2 Asignación de lista enlazada

Cada archivo es una lista enlazada de bloques: la primera palabra de cada bloque es un apuntador al siguiente, y el resto es para datos. La figura 4-11 del libro muestra el archivo A con sus bloques lógicos 0 a 4 en los bloques físicos 4, 7, 2, 10 y 12, y el archivo B con sus bloques lógicos 0 a 3 en los físicos 6, 3, 11 y 14.

Ventajas:
- Se puede usar cualquier bloque del disco: no hay fragmentación externa (solo fragmentación interna en el último bloque).
- La entrada de directorio solo tiene que guardar la dirección del primer bloque.

Desventajas:
- El acceso aleatorio es extremadamente lento: para llegar al bloque n, hay que leer los n − 1 anteriores, uno por uno.
- El espacio de datos de cada bloque ya no es una potencia de dos, porque el apuntador ocupa unos bytes. Muchos programas leen y escriben en tamaños que son potencias de dos, así que leer un bloque lógico completo obliga a juntar datos de dos bloques físicos, con un costo extra de copia.

### 5.3 Lista enlazada con una tabla en memoria: FAT

Las dos desventajas se eliminan sacando el apuntador de cada bloque y poniéndolo en una tabla en memoria principal. Esa tabla se llama FAT (File Allocation Table, tabla de asignación de archivos).

Figura 4-12 del libro: una tabla con una entrada por bloque físico, numeradas de 0 a 15. Para el archivo A, que empieza en el bloque 4: la entrada 4 contiene 7, la entrada 7 contiene 2, la entrada 2 contiene 10, la entrada 10 contiene 12, y la entrada 12 contiene un marcador especial de fin (por ejemplo −1, que no es un número de bloque válido). Para el archivo B, que empieza en el 6: la entrada 6 contiene 3, la 3 contiene 11, la 11 contiene 14, y la 14 contiene el marcador de fin. Las demás entradas están sin usar.

Ventajas:
- El bloque entero queda disponible para datos.
- El acceso aleatorio es mucho más rápido: aunque hay que seguir la cadena, la cadena está toda en memoria y se recorre sin leer el disco.
- La entrada de directorio solo guarda un entero, el número del bloque inicial.

Desventaja principal: la tabla completa tiene que estar en memoria todo el tiempo, y su tamaño es proporcional al disco. Con un disco de 200 GB y bloques de 1 KB, la tabla necesita 200 millones de entradas, una por bloque. Cada entrada necesita como mínimo 3 bytes, y para que la búsqueda sea rápida, 4. La tabla ocupa entonces 600 MB u 800 MB de memoria permanentemente. La FAT no escala bien en discos grandes.

Según la cátedra: la FAT mejora la lista enlazada porque el bloque completo queda para datos y el acceso aleatorio es más rápido, pero tiene el problema grave de que la tabla completa debe estar en memoria y no escala en discos grandes (consume cientos de MB).

Ejemplo resuelto 1 (seguir la cadena de la FAT). Un sistema FAT con clusters de 256 bytes tiene un archivo cuya entrada de directorio dice que empieza en el cluster 4. La tabla FAT es la de la figura 4-12. ¿En qué cluster termina el archivo y cuánto espacio ocupa en disco?

1. Se arranca en la entrada 4 de la FAT: contiene 7. El archivo sigue en el cluster 7.
2. La entrada 7 contiene 2: el archivo sigue en el cluster 2.
3. La entrada 2 contiene 10: sigue en el 10.
4. La entrada 10 contiene 12: sigue en el 12.
5. La entrada 12 contiene el marcador de fin: el archivo termina en el cluster 12.
6. La cadena completa es 4, 7, 2, 10, 12: cinco clusters.
7. Espacio ocupado en disco: 5 clusters × 256 bytes = 1280 bytes. El espacio en disco siempre se cuenta en clusters enteros, aunque el último no esté lleno.

Este es el ejercicio típico de los exámenes de la cátedra: con una tabla FAT y el cluster inicial, decir en qué cluster termina el archivo y calcular el espacio ocupado como cantidad de clusters por tamaño de cluster.

### 5.4 Nodos-i

El último método asocia a cada archivo una estructura de datos llamada nodo-i (nodo-índice, i-nodo o inodo), que lista los atributos del archivo y las direcciones de disco de sus bloques. Dado el i-nodo, se pueden encontrar todos los bloques del archivo.

Figura 4-13 del libro: un i-nodo con los atributos arriba, después las direcciones de los bloques de disco 0 a 7, y una última dirección que apunta a un bloque que contiene más direcciones de disco.

Ventaja principal sobre la FAT: el i-nodo solo tiene que estar en memoria cuando el archivo está abierto. Si cada i-nodo ocupa n bytes y puede haber como máximo k archivos abiertos a la vez, el arreglo de i-nodos en memoria ocupa solo k × n bytes. La FAT es proporcional al tamaño del disco (si el disco tiene n bloques, la tabla tiene n entradas y crece linealmente con el disco); el arreglo de i-nodos es proporcional a la cantidad máxima de archivos abiertos, sin importar si el disco es de 10 GB, de 100 GB o de 1000 GB.

Problema: si cada i-nodo tiene lugar para una cantidad fija de direcciones, ¿qué pasa cuando el archivo crece más? La solución es reservar la última dirección del i-nodo para la dirección de un bloque que contiene más direcciones de bloques de disco (bloque indirecto). Y se puede ir más lejos con bloques que apuntan a bloques llenos de direcciones (indirectos dobles y triples), como se ve en UNIX.

Según la cátedra:
- Cada archivo tiene un i-nodo con los atributos y las direcciones de sus bloques.
- El i-nodo NO guarda el nombre del archivo: el nombre está en el directorio.
- Un vínculo duro crea otro nombre que apunta al mismo i-nodo. El i-nodo tiene un contador de enlaces (link count), y el archivo solo se elimina cuando el contador llega a 0.
- El camino completo es: directorio → nombre del archivo → i-nodo → direcciones de bloques → bloques del disco → datos del archivo.
- Ventaja clave: solo los i-nodos de los archivos abiertos tienen que estar en memoria; la memoria depende de la cantidad de archivos abiertos, no del tamaño del disco.
- Para archivos grandes se usan bloques indirectos. Es el esquema de UNIX.

El i-nodo de UNIX (figura 4-34 del libro): un recuadro con los atributos arriba y debajo una columna de direcciones de disco. Las primeras direcciones apuntan directamente a bloques de datos. Una dirección apunta a un bloque indirecto sencillo, que es una lista de direcciones de bloques de datos. Otra apunta a un bloque indirecto doble, que contiene direcciones de bloques indirectos sencillos, cada uno de los cuales apunta a bloques de datos. La última apunta a un bloque indirecto triple, que apunta a bloques indirectos dobles, que apuntan a bloques indirectos sencillos, que apuntan a bloques de datos.

En UNIX V7, las primeras 10 direcciones están en el propio i-nodo, así que para archivos chicos toda la información está en el i-nodo, que se trae a memoria al abrir el archivo. En Linux (ext2), son 12 direcciones directas y después los tres indirectos.

Fórmula del tamaño máximo de un archivo con i-nodos. Sea B el tamaño de bloque, d el tamaño de una dirección de bloque, D la cantidad de punteros directos y P = B / d la cantidad de punteros que caben en un bloque. Entonces:

tamaño máximo = (D + P + P² + P³) × B

El término D cuenta los bloques directos; P, los que se alcanzan con el indirecto sencillo; P², con el doble; y P³, con el triple.

Ejemplo resuelto 2 (tamaño máximo, ejercicio de la práctica de la cátedra). Un i-nodo tiene 10 punteros directos, un indirecto sencillo, uno doble y uno triple. El bloque es de 4 KB y cada puntero ocupa 4 bytes. ¿Cuál es el tamaño máximo de un archivo?

1. Punteros por bloque: P = 4096 / 4 = 1024.
2. Bloques alcanzables: 10 + 1024 + 1024² + 1024³ = 10 + 1024 + 1.048.576 + 1.073.741.824 = 1.074.791.434 bloques.
3. Tamaño máximo: 1.074.791.434 × 4096 = 4.402.345.713.664 bytes.
4. En potencias de 2: el término dominante es 1024³ × 4096 = 2⁴² bytes = 4 TiB. El total es 4,004 TiB, que en unidades decimales son unos 4,40 TB.
5. Atención: en la práctica resuelta figura "alrededor de 4,27 TB", que es incorrecto. Lo correcto es aproximadamente 4 TiB (2⁴² bytes), es decir, 4,40 × 10¹² bytes. La respuesta que se espera en los exámenes de la cátedra es "4 TB".

Ejemplo resuelto 3 (cuántos bloques de datos y de índice, ejercicio de la práctica). Un sistema con i-nodos tiene bloques de 2 KB, 12 direcciones directas, un indirecto sencillo, uno doble y uno triple, y direcciones de 4 bytes. Hay un archivo de 5,5 MB. ¿Cuántos bloques son de datos y cuántos de índice?

1. Bloques de datos: 5,5 MB = 5632 KB; 5632 KB / 2 KB = 2816 bloques de datos.
2. Punteros por bloque: 2048 / 4 = 512.
3. Los 12 directos cubren 12 bloques: quedan 2816 − 12 = 2804. No usan bloques de índice, porque los punteros están dentro del i-nodo.
4. El indirecto sencillo cubre 512 bloques: quedan 2804 − 512 = 2292. Usa 1 bloque de índice.
5. El indirecto doble: los 2292 bloques restantes necesitan 2292 / 512 = 4,47, o sea 5 bloques indirectos de segundo nivel, más el bloque doble que apunta a ellos: 6 bloques de índice.
6. El triple no se usa.
7. Total de bloques de índice: 1 + 6 = 7. Respuesta: 2816 bloques de datos y 7 bloques de índice.

Otra pregunta de la práctica, sobre afirmaciones de i-nodos: "si aumenta el tamaño del puntero, el archivo podrá crecer" es falsa (un puntero más grande permite direccionar más bloques del disco, pero entran menos punteros por bloque); "los 12 punteros directos se usan solo para archivos chicos y los indirectos solo para archivos muy grandes" es falsa (los indirectos se van usando a medida que el archivo crece: el sencillo ya sirve para archivos medianos); "agregando o quitando i-nodos es la única manera de agrandar o achicar un archivo" es falsa (cada archivo tiene un solo i-nodo; lo que cambia es la cantidad de bloques de datos asignados). La respuesta correcta es "ninguna de las anteriores".

### 5.5 Comparación de los cuatro métodos

- Contigua: registro con dos números; lectura rapidísima; fragmentación externa y hay que saber el tamaño final. Uso: CD-ROM y DVD.
- Lista enlazada: sin fragmentación externa; acceso aleatorio lentísimo; el bloque de datos deja de ser potencia de 2.
- FAT: bloque entero para datos; acceso aleatorio rápido porque la cadena está en memoria; la tabla entera en memoria, proporcional al disco. Uso: MS-DOS, pendrives, cámaras.
- i-nodos: solo los i-nodos de archivos abiertos en memoria; archivos grandes con indirectos. Uso: UNIX y Linux.

(Tanenbaum, cap. 4.3.2, págs. 274–280; 4.5.3, págs. 321–323) (Apunte: resumen de la cátedra, págs. 13–15) (Apunte: práctica resuelta de FAT e i-nodos)

---

## 6. Implementación de directorios

Al abrir un archivo, el sistema operativo usa la ruta para encontrar la entrada de directorio. Esa entrada da la información necesaria para encontrar los bloques: la dirección del archivo entero (asignación contigua), el número del primer bloque (lista enlazada o FAT) o el número de i-nodo. En todos los casos, la función principal del sistema de directorios es asociar el nombre ASCII del archivo con la información necesaria para localizar sus datos.

¿Dónde se guardan los atributos? Figura 4-14 del libro:
- (a) En la entrada de directorio: cada entrada es de tamaño fijo y tiene el nombre, los atributos y una o más direcciones de disco. Es el esquema de Windows (MS-DOS).
- (b) En el i-nodo: la entrada de directorio solo tiene el nombre del archivo y un número de i-nodo. Es el esquema de UNIX.

Nombres largos de longitud variable. MS-DOS usaba nombres de 1 a 8 caracteres más una extensión de 1 a 3; UNIX V7, de 1 a 14. Hoy se aceptan nombres largos de longitud variable. Opciones:
1. Fijar un límite (por ejemplo 255 caracteres) y reservar ese espacio en cada entrada: simple pero desperdicia mucho, porque pocos nombres son tan largos.
2. Entradas de tamaño variable, en línea (figura 4-15a): cada entrada empieza con su longitud, sigue con los atributos de formato fijo y después el nombre, terminado en un carácter especial (0) y rellenado hasta un límite de palabra. El ejemplo tiene tres archivos: sexto-proyecto, personaje y ave. Problemas: al borrar un archivo queda un hueco de tamaño variable donde quizá no entre el siguiente (aunque como el directorio está en memoria se puede compactar), y una entrada puede abarcar varias páginas, lo que puede producir un fallo de página al leer un nombre.
3. Entradas de tamaño fijo y los nombres juntos en un heap al final del directorio (figura 4-15b): cada entrada tiene un apuntador a su nombre en el heap. Al borrar una entrada, la siguiente siempre entra en su lugar, y no hace falta rellenar los nombres. Hay que administrar el heap, y todavía puede haber fallos de página.

Búsqueda en directorios grandes:
- Búsqueda lineal: simple pero lenta en directorios muy largos.
- Tabla de hash por directorio: el nombre se transforma en un número entre 0 y n − 1 (por ejemplo, el resto de dividirlo por n). Si la ranura está ocupada, se arma una lista enlazada de las entradas con el mismo hash. Es mucho más rápida, pero la administración es más compleja. Solo conviene si los directorios tienen cientos o miles de archivos.
- Caché de búsquedas: antes de buscar, se mira si el nombre está en la caché. Funciona si pocos archivos se usan mucho.

(Tanenbaum, cap. 4.3.3, págs. 280–283) (Apunte: resumen de la cátedra, pág. 16)

---

## 7. Archivos compartidos: vínculos duros y simbólicos

Cuando varios usuarios trabajan juntos, conviene que un archivo aparezca a la vez en varios directorios. La conexión entre un directorio y un archivo compartido se llama vínculo (liga, link). Con vínculos, el sistema de archivos deja de ser un árbol y pasa a ser un grafo acíclico dirigido (DAG). La figura 4-16 del libro muestra el árbol de la figura 4-7 con un archivo de C que también aparece en un directorio de B.

Problema: si los directorios contuvieran las direcciones de disco, habría que copiarlas al directorio de B. Si después B o C agregaran bloques al archivo, los bloques nuevos solo aparecerían en el directorio del que los agregó, y el otro no vería los cambios. Hay dos soluciones:

1. Vínculo duro: los bloques no se listan en los directorios sino en una pequeña estructura asociada al archivo, el i-nodo, y los dos directorios apuntan al mismo i-nodo. Es el esquema de UNIX.
2. Vínculo simbólico: el sistema crea un archivo nuevo de tipo LINK en el directorio de B, que solo contiene la ruta del archivo vinculado. Cuando B lo lee, el sistema ve que es de tipo LINK, busca el nombre y lee el archivo real.

Problema del vínculo duro (figura 4-17): (a) antes de vincular, el i-nodo es de C y tiene cuenta 1; (b) después de que B crea el vínculo, el i-nodo sigue siendo de C, pero la cuenta de vínculos es 2; (c) si C borra el archivo, el sistema no puede limpiar el i-nodo (B quedaría apuntando a un i-nodo inválido, o peor, reasignado a otro archivo), y tampoco puede encontrar todas las entradas de directorio que apuntan a él, porque el i-nodo no guarda apuntadores a los directorios. Lo único que se puede hacer es borrar la entrada de C y dejar el i-nodo con cuenta 1. Resultado: B es el único que tiene el archivo, pero el propietario sigue siendo C, y si hay contabilidad o cuotas, se le sigue cobrando a C hasta que B lo borre y la cuenta llegue a 0.

Vínculo simbólico: no tiene ese problema, porque solo el propietario real tiene un apuntador al i-nodo; los demás tienen nombres de ruta. Cuando el propietario borra el archivo, el archivo se destruye y los intentos de usarlo por el vínculo simbólico fallan. Borrar el vínculo simbólico no afecta al archivo. Desventajas: hay que leer el archivo con la ruta, analizarla y seguirla componente por componente hasta el i-nodo, lo que puede requerir muchos accesos al disco extra; además, cada vínculo simbólico necesita un i-nodo propio y un bloque para la ruta (aunque si la ruta es corta se puede guardar en el propio i-nodo). Ventaja extra: pueden vincular archivos de máquinas de cualquier parte del mundo, dando la dirección de red y la ruta.

Problema común a los dos: un archivo puede tener dos o más rutas. Un programa que recorre un directorio y sus subdirectorios (por ejemplo, para hacer un respaldo en cinta) puede encontrar el mismo archivo varias veces y copiarlo dos veces.

Según la cátedra:
- Al borrar un nombre con vínculo duro (unlink): se elimina la entrada de directorio y el contador del i-nodo baja en 1. Si llega a 0, se elimina el i-nodo y se liberan los bloques.
- Vínculo simbólico (soft link): es un archivo independiente que contiene una ruta a otro archivo; no comparte i-nodo; es más flexible (puede cruzar discos o máquinas) pero más lento y consume más recursos.
- Si se borra el vínculo simbólico, solo se borra ese archivo y el original no se afecta. Si se borra el original, el vínculo simbólico sigue existiendo pero queda roto (broken link), porque apunta a una ruta que ya no existe.

Comparación (según la cartilla de comandos de la cátedra):
- Comando: el vínculo duro se crea con ln original.txt enlace_duro.txt; el simbólico con ln -s original.txt enlace_simbolico.txt.
- A qué apunta: el duro, al mismo i-nodo; el simbólico, a la ruta del archivo.
- i-nodo: el duro comparte el mismo i-nodo; el simbólico tiene uno distinto.
- Si se borra el original: el duro sigue funcionando (todavía hay otro nombre para el mismo i-nodo y contenido); el simbólico se rompe.
- Cruzar sistemas de archivos o discos: el duro no puede; el simbólico sí.
- Enlazar directorios: el duro generalmente no; el simbólico sí.
- Si se modifica el original, el cambio se ve desde los dos mientras el original exista.
- Frase de la cátedra: "El enlace simbólico es un acceso directo. El enlace duro es otro nombre para el mismo archivo."

Ejemplo resuelto 4 (contador de vínculos). Se crea el archivo datos.txt: su i-nodo tiene cuenta 1. Se hace ln datos.txt copia.txt: la cuenta pasa a 2. Se hace ln -s datos.txt atajo.txt: la cuenta sigue en 2, porque el vínculo simbólico tiene su propio i-nodo y no cuenta. Se borra datos.txt con rm: la cuenta baja a 1; el contenido sigue accesible por copia.txt, pero atajo.txt queda roto porque apuntaba al nombre datos.txt, que ya no existe. Se borra copia.txt: la cuenta llega a 0, se libera el i-nodo y se devuelven los bloques a la lista de bloques libres.

(Tanenbaum, cap. 4.3.4, págs. 283–285) (Apunte: resumen de la cátedra, págs. 11, 16–17) (Apunte: comandos de Linux, enlaces simbólico y duro)

---

## 8. Sistemas de archivos estructurados por registro y por bitácora

### 8.1 LFS: sistema de archivos estructurado por registro

Motivación: las CPU son cada vez más rápidas, las memorias más grandes y los discos más grandes y baratos, pero el tiempo de búsqueda del disco casi no mejora. Con memorias grandes, la caché de disco puede atender casi todas las lecturas, así que la mayoría de los accesos al disco van a ser escrituras. Y las escrituras suelen ser muy chicas: una escritura de 50 µs suele ir precedida de una búsqueda de 10 ms y un retraso rotacional de 4 ms, así que la eficiencia del disco baja a una fracción de 1 %. Por ejemplo, crear un archivo en UNIX implica escribir el i-nodo del directorio, el bloque del directorio, el i-nodo del archivo y el archivo mismo.

Idea de LFS (Log-structured File System, Berkeley): estructurar todo el disco como un registro (log). Las escrituras pendientes se acumulan en un búfer en memoria y, periódicamente, se escriben juntas como un solo segmento contiguo al final del registro. Un segmento puede mezclar i-nodos, bloques de directorio y bloques de datos, y empieza con un resumen de segmento que dice qué contiene. Con segmentos de alrededor de 1 MB se aprovecha casi todo el ancho de banda del disco.

- Los i-nodos tienen la misma estructura que en UNIX, pero están dispersos por el registro: su dirección ya no se calcula a partir del número de i-nodo. Para encontrarlos se mantiene un mapa de i-nodos, indexado por número de i-nodo, guardado en disco y en caché.
- Como el disco es finito, el registro termina llenándolo. Muchos segmentos tienen bloques obsoletos (por ejemplo, si un archivo se sobrescribe, su i-nodo apunta a bloques nuevos y los viejos quedan ocupando lugar). Un hilo limpiador recorre el registro en forma circular: lee el resumen del segmento más viejo, descarta lo que ya no está en uso, pasa a memoria los i-nodos y bloques todavía vivos para escribirlos en el siguiente segmento y marca el segmento viejo como libre. El disco funciona como un gran búfer circular: el hilo escritor agrega segmentos al frente y el limpiador quita segmentos viejos del final.
- Resultado medido: LFS supera a UNIX por un orden de magnitud en escrituras pequeñas y es igual o mejor en lecturas y escrituras grandes.

Según la cátedra: el disco se trata como un registro secuencial; las escrituras pequeñas se acumulan en memoria y se escriben juntas en segmentos grandes y contiguos; mejora mucho el rendimiento de las escrituras pequeñas; un hilo limpiador elimina bloques obsoletos, reescribe los bloques válidos y mantiene el disco como un búfer circular.

### 8.2 Sistemas de archivos por bitácora (journaling)

LFS no se usa mucho, sobre todo por su incompatibilidad con los sistemas de archivos existentes. Pero una de sus ideas, la robustez ante fallas, se aplica fácilmente a sistemas convencionales: llevar un registro de lo que el sistema de archivos va a hacer antes de hacerlo. Así, si el sistema falla antes de terminar, al rearrancar mira el registro, ve qué estaba pasando y termina el trabajo. Son los sistemas de archivos por bitácora (JFS, journaling file systems). Ejemplos: NTFS de Microsoft, ext3 y ReiserFS de Linux.

Ejemplo del libro: eliminar un archivo en UNIX requiere tres pasos.
1. Quitar el archivo de su directorio.
2. Liberar el i-nodo y pasarlo a la reserva de i-nodos libres.
3. Devolver los bloques de disco a la reserva de bloques libres.

Sin fallas, el orden no importa; con fallas, sí:
- Si se completa el paso 1 y el sistema cae, el i-nodo y los bloques no están en ningún archivo pero tampoco disponibles para reasignar: quedan "en el limbo". Si cae después del paso 2, solo se pierden los bloques.
- Si se libera primero el i-nodo, después de rearrancar se lo puede reasignar mientras la entrada vieja de directorio sigue apuntando a él, o sea, al archivo equivocado.
- Si se liberan primero los bloques, una entrada de directorio válida apunta a un i-nodo que lista bloques que ya están libres y probablemente se reusen pronto: dos archivos compartirían bloques al azar.

Qué hace el sistema por bitácora: primero escribe una entrada en el registro que lista las tres acciones, la escribe al disco (y por las dudas la relee para verificarla), y recién entonces empieza a hacer las operaciones. Cuando terminan bien, borra la entrada. Si el sistema cae, al recuperarse revisa el registro, y si hay operaciones pendientes las vuelve a ejecutar (todas las veces que haga falta, incluso si hay fallas repetidas) hasta que el archivo quede eliminado correctamente.

Condición clave: las operaciones registradas tienen que ser idempotentes, es decir, que se puedan repetir todas las veces que haga falta sin peligro. Ejemplos idempotentes: "actualizar el mapa de bits para marcar libre el i-nodo k o el bloque n", "buscar en un directorio y eliminar la entrada llamada foobar", y "buscar en la lista de bloques libres y agregar el bloque n si no está". No idempotente: "agregar los bloques recién liberados del i-nodo K al final de la lista libre", porque quizá ya estén ahí.

Transacción atómica: para más confiabilidad se toma de las bases de datos el concepto de transacción atómica. Varias acciones se agrupan entre begin transaction y end transaction, y el sistema de archivos garantiza que se completan todas o ninguna, nunca una parte. Esto es lo que el programa llama actualización atómica y transacciones.

NTFS tiene un sistema por bitácora extenso y su estructura rara vez se corrompe por fallas; está en desarrollo desde Windows NT en 1993. El primer sistema por bitácora de Linux fue ReiserFS, poco usado por ser incompatible con ext2, el estándar de entonces. ext3, menos ambicioso, también usa bitácora y mantiene la compatibilidad con ext2.

(Tanenbaum, cap. 4.3.5–4.3.6, págs. 285–288) (Apunte: resumen de la cátedra, págs. 18–19)

---

## 9. Sistemas de archivos virtuales (VFS)

En una misma computadora suele haber varios sistemas de archivos distintos. Un Windows puede tener NTFS como sistema principal, una partición FAT-32 o FAT-16 heredada y un CD-ROM o DVD, cada uno con su sistema de archivos. Windows los distingue con letras de unidad (C:, D:, etc.) y no intenta integrarlos.

Los UNIX modernos, en cambio, integran varios sistemas de archivos en una sola estructura. Un Linux puede tener ext2 como raíz, una partición ext3 montada en /usr, un segundo disco con ReiserFS montado en /home y un CD-ROM ISO 9660 montado temporalmente en /mnt. El usuario ve una sola jerarquía.

Para lograrlo, desde el trabajo de Sun Microsystems (Kleiman, 1986), la mayoría de los UNIX usa un VFS (virtual file system, sistema de archivos virtual). La idea clave es abstraer la parte común a todos los sistemas de archivos y ponerla en una capa separada, que llama a los sistemas de archivos concretos para manejar los datos.

Figura 4-18 del libro: arriba, los procesos de usuario. Debajo, la interfaz de POSIX hacia el sistema de archivos virtual. Debajo del VFS, la interfaz de VFS hacia tres sistemas de archivos concretos (por ejemplo FS 1, FS 2 y FS 3), y debajo de ellos, la caché de búfer.

- Interfaz superior: las llamadas POSIX estándar (open, read, write, lseek, etc.) de los procesos de usuario.
- Interfaz inferior: varias docenas de llamadas a funciones que el VFS puede hacer a cada sistema de archivos concreto. Por ejemplo, una que lee un bloque del disco, lo pone en la caché de búfer y devuelve un apuntador a él.
- La motivación original de Sun era el NFS: mientras el sistema de archivos concreto provea las funciones que el VFS necesita, el VFS no sabe ni le importa dónde están los datos.
- Internamente, el VFS es orientado a objetos, aunque esté escrito en C. Sus objetos principales: el superbloque (describe un sistema de archivos), el nodo-v (describe un archivo) y el directorio. Además mantiene la tabla de montaje y un arreglo de descriptores de archivos de los procesos.

Secuencia de uso del VFS:
1. Al arrancar se registra el sistema de archivos raíz, y al montar otros, cada uno se registra con el VFS. Registrarse es proveer la lista (vector) de direcciones de las funciones que el VFS necesita.
2. Un proceso hace open("/usr/include/unistd.h", O_RDONLY). Al analizar la ruta, el VFS ve que hay un sistema de archivos montado en /usr y busca su superbloque en la lista de superbloques montados.
3. Busca en el directorio raíz de ese sistema la ruta include/unistd.h.
4. Crea un nodo-v (en RAM) y le pide al sistema concreto la información del i-nodo del archivo. Copia esa información al nodo-v, junto con el apuntador a la tabla de funciones para las operaciones sobre nodos-v (read, write, close, etc.).
5. Crea una entrada en la tabla de descriptores de archivos del proceso que apunta al nodo-v y devuelve el descriptor de archivo.
6. Cuando el proceso hace read con ese descriptor, el VFS sigue el descriptor hasta el nodo-v, del nodo-v a la tabla de funciones, y llama a la función read del sistema concreto, que obtiene el bloque. El VFS no sabe si el dato viene de un disco local, de la red, de un CD-ROM o de una memoria USB (figura 4-19).

Agregar un sistema de archivos nuevo es relativamente directo: se implementan todas las funciones que espera el VFS, o, si el sistema ya existe, funciones de envoltura que traduzcan a sus llamadas nativas.

Conexión con la Unidad 1: es un ejemplo de la idea de abstracción y de la separación entre interfaz e implementación; el VFS es una capa.

(Tanenbaum, cap. 4.3.7, págs. 288–292)

---

## 10. Administración del espacio en disco

Hay dos estrategias para guardar un archivo de n bytes: n bytes consecutivos, o bloques de tamaño fijo no necesariamente contiguos. Es la misma disyuntiva que entre segmentación pura y paginación en la memoria. Guardar el archivo contiguo tiene el problema de que si crece hay que moverlo, y mover un archivo en el disco es mucho más lento que mover un segmento en memoria. Por eso casi todos los sistemas de archivos dividen los archivos en bloques de tamaño fijo que no tienen que ser adyacentes.

### 10.1 Tamaño de bloque

Candidatos naturales: el sector, la pista o el cilindro (todos dependientes del dispositivo), o el tamaño de página.

- Bloque grande: cada archivo, incluso uno de 1 byte, ocupa un bloque entero (en el extremo, un cilindro); los archivos chicos desperdician mucho espacio.
- Bloque chico: la mayoría de los archivos ocupan muchos bloques, y leer cada bloque requiere una búsqueda y un retraso rotacional: se pierde rendimiento.
- En síntesis: si la unidad de asignación es demasiado grande, se desperdicia espacio; si es demasiado chica, se desperdicia tiempo.

Datos medidos (figura 4-20, Tanenbaum y colaboradores, 2006): en la Universidad Libre (VU) de Ámsterdam en 1984 y 2005, y en un servidor web político. En 2005, el 59,13 % de los archivos de la VU tenían 4 KB o menos y el 90,84 % tenían 64 KB o menos; el tamaño promedio era de 2475 bytes. Con bloques de 1 KB, solo entre el 30 % y el 50 % de los archivos entran en un bloque; con 4 KB, entre el 60 % y el 70 %. Con bloques de 4 KB, el 93 % de los bloques del disco los usa el 10 % de los archivos más grandes. Conclusión: el desperdicio al final de los archivos chicos casi no importa, porque el disco lo llenan los archivos grandes (videos).

Según la cátedra: la mayoría de los archivos son pequeños, pero la mayor parte del espacio lo ocupan pocos archivos grandes; por eso el desperdicio en archivos chicos no es tan grave, mientras que el rendimiento sí lo es.

Ejemplo resuelto 5 (tiempo de lectura de un bloque). Disco con 1 MB por pista, tiempo de rotación de 8,33 ms y búsqueda promedio de 5 ms. El tiempo para leer un bloque de k bytes es la suma de búsqueda, retraso rotacional (media vuelta) y transferencia:

tiempo = 5 + 4,165 + (k / 1.000.000) × 8,33 ms

1. Para un bloque de 4 KB: 5 + 4,165 + 0,033 = 9,198 ms. Se leen 4 KB cada 9,2 ms: menos de medio MB por segundo.
2. Para un bloque de 64 KB: 5 + 4,165 + 0,52 = 9,69 ms. Se leen 64 KB cada 9,7 ms: unos 6,6 MB/s según el libro.
3. Conclusión: el tiempo de acceso está dominado por la búsqueda y el retraso rotacional (unos 9 ms), así que cuantos más datos se traen por acceso, mejor: la velocidad de datos crece casi linealmente con el tamaño de bloque.

Figura 4-21: dos curvas en función del tamaño de bloque, suponiendo que todos los archivos son de 4 KB. La curva sólida (velocidad de datos) sube casi linealmente. La curva punteada (eficiencia de espacio) está al 100 % para bloques de 1, 2 y 4 KB (un archivo de 4 KB ocupa 4, 2 y 1 bloques sin desperdicio), baja al 50 % con bloques de 8 KB y al 25 % con 16 KB. Las curvas se cruzan cerca de 64 KB, pero ahí la velocidad es de solo 6,6 MB/s y la eficiencia de espacio es de alrededor del 7 %: no hay un buen compromiso. Rendimiento y uso del espacio están inherentemente en conflicto. Históricamente se eligieron bloques de 1 KB a 4 KB; con discos de más de 1 TB, podría convenir subir a 64 KB y aceptar el espacio desperdiciado, porque el espacio en disco ya no escasea.

Vogels (1999) midió archivos en Windows NT en la Universidad de Cornell: el uso es más complejo que en UNIX (guardar unos caracteres en el Bloc de notas dispara 26 llamadas al sistema, incluidos 3 intentos fallidos de apertura), pero los tamaños promedio son compatibles: 1 KB para archivos solo leídos, 2,3 KB para solo escritos y 4,2 KB para leídos y escritos.

Fragmentación interna en disco: como el espacio se asigna en bloques enteros, el último bloque de cada archivo queda en parte vacío. Esa parte vacía es la fragmentación interna.

Ejemplo resuelto 6 (fragmentación interna, ejercicio de la práctica de la cátedra). Un sistema de archivos FAT32 está diseñado para que el bloque coincida con el marco de página, de 4 KB. Cada sector del disco tiene 512 bytes.
1. Sectores por bloque: 4096 / 512 = 8.
2. En el BPB (BIOS Parameter Block) de FAT32, los bytes por sector se guardan en los desplazamientos 0x0B y 0x0C. 512 en hexadecimal es 0x0200, y se guarda en orden little-endian: en 0x0B va 00 y en 0x0C va 02.
3. Se guarda un ejecutable de 3.712.518 bytes. División entera: 3.712.518 / 4096 = 906 bloques llenos, y sobran 3.712.518 − 906 × 4096 = 3.712.518 − 3.710.976 = 1542 bytes, que van en un bloque 907.
4. Fragmentación interna en el último bloque: 4096 − 1542 = 2554 bytes.
5. El archivo ocupa 907 bloques = 3.715.072 bytes en disco.
6. Atención: en la versión escrita de la práctica figura 2580,48 bytes, porque se usó el cociente redondeado 906,37 y se multiplicó 0,37 × 4096. Lo correcto es trabajar con el resto exacto de la división: 1542 bytes ocupados y 2554 bytes de fragmentación. La resolución manuscrita de la misma práctica llega al valor correcto, 2554.

### 10.2 Registro de bloques libres

Figura 4-22 del libro: (a) la lista de bloques libres guardada en una lista enlazada de bloques, donde cada bloque de 1 KB guarda los números de 255 bloques libres más un apuntador al siguiente bloque de la lista; (b) un mapa de bits.

1. Lista enlazada de bloques de disco: cada bloque de la lista guarda tantos números de bloques libres como entren. Con bloques de 1 KB y números de 32 bits, cada bloque guarda 255 números (una ranura es para el apuntador al siguiente). Los bloques de la lista son bloques libres, así que en esencia el almacenamiento es gratuito.
2. Mapa de bits: un disco de n bloques necesita un mapa de n bits. Los bloques libres se marcan con 1 y los ocupados con 0 (o al revés).

Ejemplo resuelto 7 (espacio de la lista contra el mapa de bits). Disco de 500 GB con bloques de 1 KB, unos 488 millones de bloques.
1. Lista enlazada: a 255 números por bloque, hacen falta 488 millones / 255 ≈ 1,9 millones de bloques.
2. Mapa de bits: 488 millones de bits = 61 millones de bytes = unos 60.000 bloques de 1 KB (exactamente, poco menos de 60.000).
3. El mapa de bits ocupa menos porque usa 1 bit por bloque contra 32 bits de la lista. La lista solo ocupa menos cuando el disco está casi lleno, es decir, cuando hay pocos bloques libres.

Variante: si los bloques libres vienen en series largas consecutivas, la lista puede guardar series en lugar de bloques sueltos: cada entrada lleva una cuenta de bloques consecutivos (de 8, 16 o 32 bits). Un disco casi vacío se representaría con dos números: el primer bloque libre y la cantidad. Pero si el disco está muy fragmentado, llevar series es menos eficiente, porque hay que guardar la dirección y la cuenta.

Detalles de implementación de la lista: solo un bloque de apuntadores está en memoria. Al crear archivos se toman bloques de ahí; cuando se agota, se lee otro del disco. Al borrar archivos, sus bloques se agregan al bloque en memoria; cuando se llena, se escribe al disco. Problema (figura 4-23): si el bloque en memoria tiene lugar solo para dos entradas más y se libera un archivo de tres bloques, el bloque se desborda y hay que escribirlo al disco; si después se crea un archivo de tres bloques, hay que releerlo; con archivos temporales de vida corta se producen muchas E/S inútiles. Solución: dividir el bloque de apuntadores lleno, de modo que el bloque en memoria quede siempre a la mitad y pueda absorber tanto creaciones como borrados sin E/S, mientras la mayoría de los bloques de apuntadores en disco están llenos.

Ventaja extra del mapa de bits: si se asigna desde un solo bloque del mapa, los bloques quedan cerca unos de otros y se minimiza el movimiento del brazo. Como el mapa es de tamaño fijo, si el kernel está paginado, el mapa puede estar en memoria virtual.

Según la cátedra: la lista enlazada es simple pero puede generar muchas E/S cuando se crean y borran archivos chicos y temporales; el mapa de bits usa mucho menos espacio y facilita asignar bloques cercanos, reduciendo el movimiento del brazo. Las decisiones de diseño se toman sin conocer exactamente el comportamiento futuro de los usuarios.

### 10.3 Cuotas de disco

Los sistemas multiusuario imponen cuotas: el administrador asigna a cada usuario un máximo de archivos y de bloques, y el sistema hace que no se excedan.

- Al abrir un archivo, sus atributos y direcciones se ponen en la tabla de archivos abiertos, que tiene una entrada con el propietario. Todo aumento de tamaño del archivo se le carga a su propietario.
- Una segunda tabla tiene el registro de cuotas de cada usuario con algún archivo abierto, aunque lo haya abierto otro. Figura 4-24: a la izquierda, la tabla de archivos abiertos, con una entrada que tiene los atributos, las direcciones de disco, el usuario (por ejemplo, usuario = 8) y un apuntador a la cuota; a la derecha, la tabla de cuotas, con el registro del usuario 8: límite de bloques suave, límite de bloques duro, número actual de bloques, número de advertencias de bloques pendientes, límite de archivos suave, límite de archivos duro, número actual de archivos y número de advertencias de archivos pendientes. Es un extracto del archivo de cuotas del disco y se reescribe cuando se cierran todos los archivos.
- Cada vez que se agrega un bloque a un archivo, se incrementa el total del propietario y se compara con los límites. El límite suave se puede superar; el duro no: intentar superarlo da error. Hay controles parecidos para la cantidad de archivos.
- Al iniciar sesión, si el usuario superó un límite suave, recibe una advertencia y se le descuenta una de las advertencias restantes. Si llegan a cero, no puede iniciar sesión hasta hablar con el administrador.
- Así, un usuario puede pasarse de los límites suaves durante una sesión, siempre que elimine el exceso antes de cerrarla; los límites duros nunca se pueden superar.

(Tanenbaum, cap. 4.4.1, págs. 292–298) (Apunte: resumen de la cátedra, págs. 19–20) (Apunte: práctica resuelta, ejercicio de FAT32 y fragmentación)

---

## 11. Respaldos del sistema de archivos

Perder un sistema de archivos suele ser peor que perder la computadora: la computadora se reemplaza, los datos muchas veces no. Los respaldos (casi siempre en cinta) sirven para dos cosas:
1. Recuperarse de un desastre: falla general del disco, incendio, inundación.
2. Recuperarse de la estupidez: el usuario borra por accidente archivos que después necesita. Por eso en Windows un archivo "borrado" va a la Papelera de reciclaje.

Cuestiones a decidir:
1. ¿Qué respaldar? No todo: los binarios que se pueden reinstalar desde los discos del fabricante no hacen falta, los archivos temporales tampoco, y el directorio /dev de UNIX (archivos especiales de dispositivos) no solo es inútil sino peligroso: el programa de respaldo se colgaría leyendo un dispositivo. Conviene respaldar directorios específicos.
2. Vaciados incrementales: no tiene sentido respaldar archivos que no cambiaron. Lo más simple es un vaciado completo periódico (semanal o mensual) y un vaciado diario de lo modificado desde el último completo. Mejor todavía es vaciar solo lo que cambió desde el último vaciado, aunque complica la recuperación: hay que restaurar el último completo y después todos los incrementales en orden.
3. Compresión: ahorra espacio, pero con muchos algoritmos un solo error en la cinta puede arruinar la descompresión de un archivo o de la cinta entera.
4. Respaldar un sistema activo: si se modifican archivos durante el vaciado, el respaldo queda inconsistente. Hay algoritmos de instantáneas (snapshots) que copian las estructuras críticas y hacen que los cambios futuros copien bloques en lugar de modificarlos: el sistema queda congelado en el momento de la instantánea.
5. Cuestiones no técnicas: las cintas de respaldo tienen que guardarse protegidas y fuera del sitio, para que un incendio no queme también los respaldos, lo que obliga a asegurar dos sitios.

Vaciado físico: copia todos los bloques del disco, del 0 al último, en orden. Es tan simple que puede hacerse sin errores y muy rápido (a la velocidad del disco). Detalles: conviene saltear los bloques libres (y entonces hay que escribir el número de cada bloque) y evitar los bloques defectuosos que el sistema operativo conoce (si no, el programa daría errores de lectura sin fin). Desventajas: no puede saltear directorios, no puede hacer vaciados incrementales y no puede restaurar archivos individuales. Por eso la mayoría de las instalaciones hace vaciados lógicos.

Vaciado lógico: empieza en uno o más directorios y vacía recursivamente los archivos y directorios modificados desde una fecha base (el último respaldo para un incremental, o la instalación para uno completo). Permite restaurar un archivo o directorio concreto.

Algoritmo de vaciado lógico de UNIX (figuras 4-25 y 4-26). La figura 4-25 es un árbol con directorios (cuadros) y archivos (círculos), cada uno numerado con su número de i-nodo, y sombreados los modificados desde la fecha base. El algoritmo vacía también todos los directorios que están en el camino hacia un archivo modificado, aunque no hayan cambiado, por dos razones: para poder restaurar el respaldo en una computadora nueva, y para poder restaurar un solo archivo (si el usuario borró el directorio /usr/jhs/proy/nr3 y quiere recuperar /usr/jhs/proy/nr3/planes/resumen, primero hay que recrear nr3 y planes con su propietario, modo y fechas).

Usa un mapa de bits indexado por número de i-nodo y opera en cuatro fases:
1. Fase 1: desde el directorio inicial, marca en el mapa todos los archivos modificados y todos los directorios (modificados o no), recorriendo recursivamente.
2. Fase 2: recorre el árbol otra vez y desmarca los directorios que no tienen nada modificado adentro ni debajo. En el ejemplo se desmarcan los directorios 10, 11, 14, 27, 29 y 30; los directorios 5 y 6 quedan marcados aunque no cambiaron, porque hacen falta para llegar a lo modificado.
3. Fase 3: recorre los i-nodos en orden numérico y vacía los directorios marcados, cada uno con sus atributos.
4. Fase 4: vacía los archivos marcados, también con sus atributos.

Las fases 1 y 2 se pueden combinar en un solo recorrido.

Restauración: se crea un sistema de archivos vacío, se restaura el último vaciado completo (primero los directorios, que dan el esqueleto, y después los archivos), y después cada incremental en orden.

Cuestiones engañosas: la lista de bloques libres no es un archivo, así que no se vacía y hay que reconstruirla al final (es el complemento de los bloques usados); un archivo con varios vínculos se debe restaurar una sola vez y vincular desde todos sus directorios; los archivos de UNIX pueden tener huecos (se escribe al principio, se hace un seek lejos y se escribe más), y esos bloques no deben vaciarse ni restaurarse como ceros, porque un archivo de volcado de memoria (core) restaurado mal ocuparía todo el espacio de direcciones; y los archivos especiales (canales con nombre, por ejemplo) nunca deben vaciarse.

Las densidades de las cintas crecen más despacio que las de los discos, así que en el futuro se respaldará disco en disco; el libro remite a los RAID del capítulo 5 (Unidad 5).

(Tanenbaum, cap. 4.4.2, págs. 298–304)

---

## 12. Consistencia del sistema de archivos

Muchos sistemas leen bloques, los modifican y los escriben después. Si el sistema cae antes de escribir todos los bloques modificados, el sistema de archivos puede quedar inconsistente. Es crítico si los bloques no escritos son de i-nodos, de directorios o de la lista de bloques libres.

Hay programas utilitarios que verifican la consistencia: fsck en UNIX y scandisk en Windows. Se pueden ejecutar en cada arranque, sobre todo después de una falla. Usan la redundancia propia del sistema de archivos para repararlo. Cada sistema de archivos (partición) se verifica por separado.

### 12.1 Consistencia de bloques

El verificador arma dos tablas con un contador por bloque, inicializados en 0:
- Tabla de bloques en uso: cuántas veces aparece cada bloque en algún archivo. Se llena leyendo todos los i-nodos (con un dispositivo crudo, que ignora la estructura de archivos) y sumando 1 por cada bloque que lista cada i-nodo.
- Tabla de bloques libres: cuántas veces aparece cada bloque en la lista de bloques libres (o en el mapa de bits).

Si el sistema es consistente, cada bloque tiene un 1 en una de las dos tablas y un 0 en la otra. Figura 4-27 del libro, con 16 bloques numerados de 0 a 15:

1. (a) Consistente. En uso: 1 1 0 1 0 1 1 1 1 0 0 1 1 1 0 0. Libres: 0 0 1 0 1 0 0 0 0 1 1 0 0 0 1 1. Cada posición suma exactamente 1.
2. (b) Bloque faltante: el bloque 2 tiene 0 en uso y 0 en libres. No hace daño real, pero desperdicia espacio. Solución: agregarlo a la lista de bloques libres.
3. (c) Bloque duplicado en la lista de libres: el bloque 4 aparece 2 veces en la lista de libres. Solo puede pasar con una lista (con un mapa de bits es imposible). Solución: reconstruir la lista de bloques libres.
4. (d) Bloque de datos duplicado: el bloque 5 aparece 2 veces en uso, es decir, en dos archivos. Es lo peor: si se borra uno de los archivos, el bloque 5 queda a la vez libre y en uso; si se borran los dos, queda dos veces en la lista. Solución: asignar un bloque libre, copiar en él el contenido del bloque 5 e insertar la copia en uno de los archivos. La información no cambia (aunque probablemente uno de los dos termine con basura), pero la estructura queda consistente. El error se reporta al usuario para que inspeccione los daños.

Ejemplo resuelto 8 (diagnóstico de fsck). Un disco de 8 bloques da, después de una falla: En uso = 1 1 0 2 0 1 0 1; Libres = 0 0 0 0 1 0 1 0.
1. Bloque 0: 1 y 0, bien. Bloque 1: 1 y 0, bien.
2. Bloque 2: 0 y 0 → bloque faltante → se agrega a la lista de libres.
3. Bloque 3: 2 en uso → bloque de datos duplicado (está en dos archivos) → se copia a un bloque libre y se da la copia a uno de los archivos; se informa al usuario.
4. Bloques 4 y 6: 0 y 1, libres, bien. Bloques 5 y 7: 1 y 0, en uso, bien.

### 12.2 Consistencia de directorios

El verificador también recorre el sistema de directorios con una tabla de contadores, pero por archivo (por i-nodo), no por bloque. Empieza en la raíz y desciende recursivamente; por cada i-nodo que aparece en cada directorio, incrementa el contador de ese archivo. Un archivo puede aparecer en varios directorios por los vínculos duros; los vínculos simbólicos no cuentan.

Al terminar compara, para cada i-nodo, cuántos directorios lo contienen contra la cuenta de vínculos guardada en el i-nodo (que empieza en 1 al crearlo y sube con cada vínculo duro). Errores posibles:
1. Cuenta del i-nodo más alta que la cantidad de entradas: aunque se borren todos los nombres, la cuenta no llega a 0 y el i-nodo no se libera. No es grave, pero desperdicia espacio con archivos que no están en ningún directorio. Solución: poner la cuenta igual al número real de entradas.
2. Cuenta del i-nodo más baja que la cantidad de entradas: es potencialmente catastrófico. Si dos entradas apuntan al archivo pero el i-nodo dice 1, al borrar una entrada la cuenta llega a 0, el sistema libera el i-nodo y sus bloques, y la otra entrada queda apuntando a un i-nodo sin usar cuyos bloques se pueden reasignar. Solución: la misma, forzar la cuenta al número real de entradas.

Otras verificaciones: números de i-nodo mayores que la cantidad de i-nodos del disco (directorio dañado), modos legales pero raros (como 0007, que no da ningún acceso al propietario y su grupo pero sí todo a los demás), directorios con más de, por ejemplo, 1000 entradas, y archivos en directorios de usuario que pertenecen al superusuario con el bit SETUID activado (un problema potencial de seguridad, porque al ejecutarlos cualquiera obtiene los poderes del superusuario).

Proteger al usuario de sí mismo: el ejemplo de rm *.o con un espacio de más (rm * .o) borra todo el directorio. En MS-DOS, borrar un archivo solo marca un bit en el directorio, y los bloques no vuelven a la lista libre hasta que se necesitan, así que un utilitario puede "des-borrar" el archivo si se actúa rápido. En Windows existe la Papelera de reciclaje.

(Tanenbaum, cap. 4.4.3, págs. 304–307)

---

## 13. Rendimiento del sistema de archivos

Acceder al disco es muchísimo más lento que acceder a memoria: leer una palabra de memoria lleva unos 10 ns; un disco transfiere a unos 100 MB/s pero suma de 5 a 10 ms de búsqueda y rotación. Para una sola palabra, la memoria es del orden de un millón de veces más rápida. Por eso los sistemas de archivos aplican optimizaciones.

### 13.1 Caché de bloques (caché de búfer)

Una caché es una colección de bloques que pertenecen lógicamente al disco pero se mantienen en memoria por rendimiento. Algoritmo común: ante cada pedido de lectura, ver si el bloque está en la caché; si está, se atiende sin ir al disco; si no, se lee del disco a la caché y desde ahí se copia a donde haga falta.

Figura 4-28 del libro: una tabla de hash indexada por dirección de dispositivo y de disco; los bloques con el mismo hash están encadenados en una lista. Además, una lista doblemente enlazada recorre todos los bloques en orden de uso: al frente está el de uso menos reciente y al final el de uso más reciente.

- Cuando la caché está llena y hay que traer un bloque, hay que sacar otro (y escribirlo al disco si se modificó). Es como la paginación, y sirven los mismos algoritmos: FIFO, segunda oportunidad, LRU. Diferencia: las referencias a la caché son relativamente poco frecuentes, así que se puede mantener el orden LRU exacto con la lista doblemente enlazada.
- Pero el LRU exacto no es deseable, por la consistencia: si un bloque crítico (por ejemplo, un bloque de i-nodos) se modifica y queda al final de la lista LRU, puede pasar mucho tiempo hasta que llegue al frente y se escriba; si el sistema cae, el sistema de archivos queda inconsistente. Además, algunos bloques (como los de i-nodos) rara vez se usan dos veces en poco tiempo.
- Por eso se usa un LRU modificado, que tiene en cuenta dos preguntas: ¿es probable que el bloque se necesite pronto otra vez? y ¿el bloque es esencial para la consistencia del sistema de archivos? Los bloques se clasifican en bloques de i-nodos, indirectos, de directorios, de datos llenos y de datos parcialmente llenos. Los que probablemente no se necesiten pronto van al frente de la lista (su búfer se reutiliza rápido); los que probablemente sí, como un bloque parcialmente lleno que se está escribiendo, van al final. Y, independientemente de eso, si un bloque es esencial para la consistencia (todos salvo los de datos) y fue modificado, se escribe al disco de inmediato.

Tampoco conviene tener bloques de datos modificados en la caché mucho tiempo: alguien que escribe un libro puede tener todo en la caché y nada en el disco; si el sistema cae, el sistema de archivos queda bien, pero se pierde el trabajo. Dos esquemas:
- UNIX: la llamada al sistema sync fuerza la escritura inmediata de todos los bloques modificados. Al arrancar, un programa llamado update queda en segundo plano llamando a sync cada 30 segundos, así que una falla hace perder como mucho 30 segundos de trabajo.
- Windows (históricamente): escribía cada bloque modificado al disco apenas se escribía en la caché. Es una caché de escritura inmediata (write-through), que requiere más E/S. Hoy Windows tiene FlushFileBuffers, equivalente a sync.
- Diferencia: si un programa escribe un bloque de 1 KB carácter por carácter, UNIX junta los caracteres en la caché y escribe una vez; la escritura inmediata hace un acceso al disco por carácter. En cambio, si se saca un disquete de un UNIX sin hacer sync, casi seguro se pierden datos y el sistema queda corrupto; con escritura inmediata no pasa nada. Las estrategias se eligieron porque UNIX nació con discos duros fijos y el primer sistema de Windows heredó de MS-DOS el mundo del disquete. Con los discos duros como norma, el método de UNIX (más eficiente, menos confiable) se impuso, y NTFS compensa con la bitácora.

Algunos sistemas integran la caché de búfer con la caché de páginas (atractivo con archivos asociados a memoria): una sola caché para bloques de archivos y páginas.

### 13.2 Lectura adelantada de bloques

Se intenta traer bloques a la caché antes de que se pidan, para subir la tasa de aciertos. Muchos archivos se leen secuencialmente: cuando se pide el bloque k, el sistema lo entrega y verifica si el bloque k + 1 está en la caché; si no, planifica su lectura. Solo sirve para archivos secuenciales; con acceso aleatorio estorba, porque consume ancho de banda y saca de la caché bloques útiles. Para decidir, el sistema puede llevar un bit por archivo abierto: "modo de acceso secuencial" o "modo aleatorio". El archivo empieza en modo secuencial (beneficio de la duda); cada seek desactiva el bit, y si vuelven las lecturas secuenciales se reactiva.

### 13.3 Reducción del movimiento del brazo

Poner cerca, de preferencia en el mismo cilindro, los bloques que probablemente se usen en secuencia.
- Con un mapa de bits en memoria es fácil elegir un bloque libre lo más cerca posible del anterior; con una lista libre en parte en disco, es mucho más difícil.
- Con una lista se puede agrupar: llevar la cuenta del espacio en grupos de bloques consecutivos. Por ejemplo, con sectores de 512 bytes, usar bloques de 1 KB pero asignar en unidades de 2 bloques (4 sectores). No es lo mismo que bloques de 2 KB, porque la caché y las transferencias siguen siendo de 1 KB, pero en una lectura secuencial se reducen las búsquedas a la mitad.
- Con i-nodos, leer un archivo corto requiere dos accesos: uno al i-nodo y otro al bloque. Figura 4-29: (a) todos los i-nodos al principio del disco, con lo que la distancia promedio entre un i-nodo y sus bloques es la mitad de los cilindros; (b) el disco dividido en grupos de cilindros, cada uno con sus propios i-nodos, bloques y lista libre (McKusick y colaboradores, 1984). Mejora simple: poner los i-nodos en el medio del disco, lo que reduce la búsqueda promedio a la mitad. Con grupos de cilindros, al crear un archivo se intenta usar un bloque del mismo grupo que su i-nodo.

### 13.4 Desfragmentación de discos

Al instalar el sistema, los archivos quedan consecutivos y el espacio libre en una sola región. Con el tiempo, al crear y borrar archivos, el disco se fragmenta: archivos y huecos por todos lados, y los archivos nuevos quedan dispersos, con mal rendimiento. Se restaura moviendo archivos para hacerlos contiguos y juntando el espacio libre. Windows tiene el programa defrag. Funciona mejor si hay bastante espacio libre contiguo al final de la partición: se copian archivos fragmentados del principio al espacio libre, y se libera un bloque contiguo al principio. Algunos archivos no se pueden mover: el archivo de paginación, el de hibernación y la bitácora. Los sistemas de archivos de Linux (ext2, ext3) sufren menos la fragmentación por cómo eligen los bloques, así que rara vez hace falta desfragmentar a mano.

Conexión con las Unidades 1 y 3: la caché de búfer es otra instancia de la jerarquía de memoria y de la localidad, y sus algoritmos de reemplazo son los de reemplazo de páginas; la bandera de modificado es el bit M.

(Tanenbaum, cap. 4.4.4–4.4.5, págs. 307–312)

---

## 14. Servidores de archivos y sistemas de archivos distribuidos

El programa pide "servidores de archivos, actualización atómica, transacciones". La actualización atómica y las transacciones se vieron en la sección 8.2 (transacción atómica y operaciones idempotentes de los sistemas por bitácora) y en el ext3 de la sección 18. Los servidores de archivos se tratan en el libro como middleware basado en sistemas de archivos (8.4.4) y con el caso de NFS (10.6.4).

### 14.1 Middleware basado en sistemas de archivos

Idea: hacer que un sistema distribuido parezca un gran sistema de archivos. Hay un solo sistema de archivos global, y para comunicarse un proceso escribe en un archivo y otros lo leen.

Modelo de transferencia (figura 8-36):
- (a) Modelo de envío/descarga (upload/download): el cliente copia el archivo del servidor, lo usa localmente (lecturas y escrituras rápidas) y al terminar lo devuelve actualizado al servidor. Ventajas: simple y eficiente, porque transferir todo de una vez rinde más que en piezas. Desventajas: hace falta lugar local para el archivo entero, mover todo es un desperdicio si se necesita solo una parte, y hay problemas de consistencia con varios usuarios.
- (b) Modelo de acceso remoto: el archivo queda en el servidor y el cliente le envía comandos para hacer el trabajo ahí.

Jerarquía de directorios (figura 8-37): (a) dos servidores de archivos, cada uno con tres directorios y archivos; (b) un sistema donde todos los clientes ven la misma jerarquía (si /D/E/x es válida en una máquina, es válida en todas); (c) un sistema donde cada cliente puede tener una vista distinta, que es lo normal con montaje remoto. La vista única facilita la programación, porque se comporta como un viejo sistema de tiempo compartido.

Transparencia de nombres:
- Transparencia de localización: la ruta no dice dónde está el archivo. /servidor1/dir1/dir2/x dice que x está en el servidor 1, pero no dónde está el servidor.
- Independencia de ubicación: se puede mover un archivo sin cambiar su nombre. Si el primer componente de la ruta es el servidor, no hay independencia de ubicación: mover x al servidor 2 cambia su ruta y rompe los programas. El montaje remoto tampoco la tiene.
- Tres métodos de nombres: máquina + ruta (/máquina/ruta o máquina:ruta); montar sistemas remotos en la jerarquía local; un solo espacio de nombres igual para todas las máquinas. Los dos primeros son fáciles; el tercero es difícil pero le facilita la vida a programadores y usuarios.

Semántica de la compartición de archivos (figura 8-38):
- Consistencia secuencial: en un sistema con un procesador, un read después de un write devuelve el valor recién escrito, y con dos write seguidos de un read, se lee el último. En un sistema distribuido se logra fácilmente con un solo servidor y sin cachés en los clientes, pero el rendimiento es pobre.
- Con cachés en los clientes aparece el problema: si el cliente 1 modifica un archivo en su caché y el cliente 2 lo lee del servidor, el cliente 2 obtiene un valor obsoleto.
- Solución simple pero ineficiente: propagar todos los cambios al servidor de inmediato.
- Semántica de sesión: "los cambios a un archivo abierto solo los ve el proceso que los hizo; recién cuando se cierra el archivo los ven los demás procesos". Es, en efecto, el modelo de envío/descarga. Si dos clientes modifican el mismo archivo a la vez, el resultado final depende de cuál cierra último (o queda sin especificar cuál de los candidatos gana).
- Alternativa: envío/descarga con bloqueo automático del archivo descargado; los demás esperan a que se devuelva.

### 14.2 NFS: el sistema de archivos de red

NFS (Network File System, de Sun Microsystems) se usa en todos los Linux modernos para unir los sistemas de archivos de computadoras separadas en un todo lógico. La versión dominante es la 3 (1994); la 4 es de 2000.

Arquitectura:
- Cada servidor NFS exporta uno o más directorios (la lista suele estar en /etc/exports), con todos sus subdirectorios.
- Los clientes montan los directorios remotos en su propia jerarquía (figura 10-35): el cliente 1 monta el bin del servidor 1 en su /bin y usa el shell como /bin/sh; monta /proyectos del servidor 2 en /usr/ast/trabajo y accede al archivo a como /usr/ast/trabajo/proy1/a; el cliente 2 monta el mismo directorio en /mnt y ve el mismo archivo como /mnt/proy1/a. El mismo archivo puede tener nombres distintos en clientes distintos; el punto de montaje es local al cliente y el servidor no lo conoce.
- Las estaciones de trabajo sin disco tienen solo un sistema de archivos esqueleto en RAM y obtienen todo de servidores remotos.

Protocolos (dos, cliente-servidor):
1. Montaje: el cliente envía una ruta y pide permiso para montarla. Si es legal y está exportada, el servidor devuelve un manejador de archivo (file handle) con el tipo de sistema de archivos, el disco, el número de i-nodo del directorio y la información de seguridad. Los montajes se pueden hacer al arrancar (en /etc/rc) o con automontaje: el directorio remoto se monta recién la primera vez que se abre un archivo, preguntando a varios servidores y quedándose con el primero que responde, lo que da tolerancia a fallas y rendimiento; se usa sobre todo para sistemas de solo lectura, porque NFS no replica archivos.
2. Acceso a directorios y archivos: los clientes envían mensajes para manipular directorios, leer y escribir archivos y ver atributos. No hay open ni close en el servidor: el cliente envía un lookup con el nombre y recibe un manejador, sin que el servidor guarde estado. NFSv3 es un servidor sin estado: si cae y rearranca, no se pierde información de archivos abiertos (porque no hay). Por eso los bloqueos de archivos necesitan un mecanismo aparte.
- La seguridad clásica se basa en enviar el UID y el GID del que llama, y el servidor confía en ellos; se pueden usar claves para autenticar los mensajes RPC.

Implementación (figura 10-36): tres capas. Arriba, la capa de llamadas al sistema (open, read, close). Debajo, el VFS, que tiene un nodo-v por archivo abierto. Cada nodo-v apunta a un i-nodo de un sistema de archivos local o a un nodo-r (nodo-i remoto) del código cliente NFS, que guarda el manejador de archivo. Cuando se lee un archivo remoto, el VFS ve que el nodo-v apunta a un nodo-r y le pasa el pedido al cliente NFS, que envía el mensaje al servidor.
- Rendimiento: las transferencias se hacen en trozos grandes (normalmente 8192 bytes) y con lectura adelantada. Los clientes tienen dos cachés, una de atributos (i-nodos) y una de datos.
- Problema de la caché: dos clientes pueden tener el mismo bloque en caché y uno modificarlo. Parches: un temporizador por bloque (3 segundos para datos y 30 para directorios), una verificación con el servidor al abrir un archivo en caché, y un temporizador de 30 segundos que envía al servidor todos los bloques sucios. No son perfectos, pero lo hacen útil en la práctica.
- NFSv4 es un sistema de archivos con estado: admite open en archivos remotos, porque el servidor mantiene las estructuras de los archivos abiertos.

(Tanenbaum, cap. 8.4.4, págs. 591–596; cap. 10.6.4, págs. 796–803)

---

## 15. Ejemplos de sistemas de archivos

### 15.1 Sistemas de archivos de CD-ROM

Fueron diseñados para medios de una sola escritura, así que son muy simples: por ejemplo, no llevan registro de bloques libres, porque en un CD-ROM no se pueden borrar ni agregar archivos. El CD-R permite agregar archivos después, pero solo al final; nunca se borran (aunque el directorio se puede actualizar para ocultarlos).

ISO 9660 (estándar internacional; la traducción al español dice que se adoptó en 1998, pero unas páginas después el mismo libro dice que 1988 es el año en que se adoptó el estándar, que es lo correcto):
- Objetivo: que cualquier CD-ROM se pueda leer en cualquier computadora, sin importar el orden de bytes ni el sistema operativo. Por eso tiene limitaciones para que lo pudieran manejar sistemas débiles como MS-DOS.
- No hay cilindros concéntricos sino una espiral continua de bits, dividida en bloques lógicos (sectores lógicos) de 2352 bytes, de los cuales 2048 son de datos útiles. Una posición en la espiral se puede expresar en minutos y segundos (1 segundo = 75 bloques).
- Admite conjuntos de hasta 2¹⁶ − 1 CD-ROM y particiones lógicas.
- Cada CD-ROM empieza con 16 bloques de función no definida por el estándar (por ejemplo, un programa de arranque), seguidos de un descriptor de volumen primario con información general: el identificador del sistema (32 bytes), del volumen (32 bytes), del editor (128 bytes) y del preparador de datos (128 bytes); los nombres de tres archivos (resumen, aviso de copyright e información bibliográfica); el tamaño de bloque lógico (normalmente 2048), la cantidad de bloques, las fechas de creación y expiración, y la entrada de directorio del directorio raíz.
- El directorio raíz y los demás directorios tienen una cantidad variable de entradas, y la última lleva un bit que la marca como última. Las entradas de directorio son de longitud variable (figura 4-30), con 10 a 12 campos, algunos ASCII y otros binarios: longitud de la entrada, longitud del registro de atributos extendido, ubicación del primer bloque del archivo (los archivos son series contiguas de bloques, así que el bloque inicial y el tamaño los ubican por completo), tamaño del archivo, fecha y hora de grabación (con bytes separados para año, mes, día, hora, minuto, segundo y zona horaria; los años cuentan desde 1900, así que los CD-ROM tendrán un problema en el año 2156), banderas (ocultar la entrada, distinguir archivo de directorio, usar atributos extendidos, marcar la última entrada), intercalado, número de CD-ROM del conjunto donde está el archivo, L (longitud del nombre), el nombre, un relleno opcional y el campo Uso del sistema. Los campos binarios se codifican dos veces, en little-endian y en big-endian, para que los lea cualquier máquina.
- El nombre tiene un nombre base de hasta 8 caracteres, un punto, una extensión de hasta 3, un punto y coma y un número de versión; solo se permiten mayúsculas, dígitos y guion bajo, por compatibilidad con MS-DOS. Un nombre puede aparecer varias veces en un directorio con distintos números de versión.
- Las entradas de un directorio están en orden alfabético, salvo las dos primeras: la del propio directorio y la de su padre (como "." y ".." en UNIX). La profundidad máxima de anidamiento de directorios es ocho.
- Niveles: el nivel 1 es el más restrictivo (nombres de archivo de 8 + 3 caracteres, archivos contiguos y nombres de directorio de hasta 8 caracteres sin extensión) y maximiza la compatibilidad; el nivel 2 permite nombres de hasta 31 caracteres; el nivel 3 permite además que un archivo tenga varias secciones (fragmentos) contiguas, que pueden repetirse dentro de un archivo o compartirse entre archivos.
- Extensiones Rock Ridge (de la comunidad UNIX): usan el campo Uso del sistema, así que un sistema que no las conoce las ignora y ve un CD-ROM ISO 9660 normal. Campos: PX (los bits de permiso rwxrwxrwx y el resto de la palabra de modo), PN (números de dispositivo mayor y menor, para poder grabar /dev), SL (vínculos simbólicos), NM (un segundo nombre sin las restricciones de ISO 9660, para nombres UNIX arbitrarios), CL, PL y RE (para reubicar directorios y superar el límite de ocho niveles) y TF (los tres tiempos del i-nodo).
- Extensiones Joliet (de Microsoft): nombres de archivo de hasta 64 caracteres, conjunto de caracteres Unicode, más de ocho niveles de anidamiento y nombres de directorio con extensiones.

### 15.2 El sistema de archivos MS-DOS

Fue el sistema principal hasta Windows 98 y ME, y sigue siendo muy usado en sistemas incrustados (cámaras digitales, reproductores de MP3, el iPod de Apple), con su extensión FAT-32. Por eso hay hoy más dispositivos con FAT que con NTFS.

- Para leer un archivo se hace open con una ruta absoluta o relativa; se busca la ruta componente por componente hasta el directorio final, que se lee en memoria, y ahí se busca el archivo.
- Las entradas de directorio son de 32 bytes, de tamaño fijo (figura 4-31). Campos, en bytes: nombre de archivo (8), extensión (3), atributos (1), reservado (10), hora (2), fecha (2), número del primer bloque (2) y tamaño (4). Los nombres más cortos que 8 + 3 se rellenan con espacios.
- Atributos: solo lectura (no se puede escribir, para protegerlo de daños accidentales), archivado (MS-DOS no lo usa; sirve a los programas de respaldo, que lo desactivan al respaldar mientras otros programas lo activan al modificar), oculto (no aparece en los listados) y sistema (también oculto, y no se puede borrar con del por accidente).
- Hora: 2 bytes, divididos en segundos (5 bits), minutos (6 bits) y horas (5 bits). Como 2 bytes solo dan 65.536 valores y un día tiene 86.400 segundos, la precisión es de ±2 segundos. Fecha: día (5 bits), mes (4 bits) y año desde 1980 (7 bits), así que el último año representable es 1980 + 127 = 2107: MS-DOS tiene un problema para el año 2108.
- Tamaño: número de 32 bits, así que en teoría hasta 4 GB, pero otros límites lo restringen a 2 GB o menos.
- Bloques: la entrada de directorio tiene el número del primer bloque, que se usa como índice en la FAT, en memoria principal. Siguiendo la cadena se encuentran todos los bloques. MS-DOS usa la misma FAT para los bloques libres: los bloques no asignados se marcan con un código especial, así que no hace falta un mapa de bits ni una lista libre.

Versiones de FAT:
- FAT-12: la primera versión, con bloques de 512 bytes, daba particiones de hasta 2¹² × 512 bytes (en realidad 4086 × 512, porque 10 direcciones son marcadores especiales, como fin de archivo y bloque defectuoso): unos 2 MB. La tabla tenía 4096 entradas de 2 bytes. Funcionaba para disquetes. Para los discos duros se permitieron bloques de 1, 2 y 4 KB, con particiones de hasta 16 MB, y como MS-DOS admitía cuatro particiones por disco, discos de hasta 64 MB.
- FAT-16: apuntadores de 16 bits y bloques de 8, 16 y 32 KB (32.768 es la potencia de dos más grande representable en 16 bits). La tabla ocupaba 128 KB de memoria. Partición máxima: 2 GB (64K entradas de 32 KB); disco máximo: 8 GB (cuatro particiones de 2 GB). Con video DV, un archivo de 2 GB apenas contiene 9 minutos.
- FAT-32 (desde la segunda versión de Windows 95): direcciones de 28 bits (en realidad debería llamarse FAT-28). En teoría, particiones de 2²⁸ × 2¹⁵ bytes, pero limitadas a 2 TB porque el tamaño de partición se lleva en sectores de 512 bytes con un número de 32 bits (2⁹ × 2³² = 2 TB).

Tamaño máximo de partición según tamaño de bloque (figura 4-32; los cuadros vacíos son combinaciones prohibidas):
- Bloque de 0,5 KB: FAT-12 2 MB.
- Bloque de 1 KB: FAT-12 4 MB.
- Bloque de 2 KB: FAT-12 8 MB; FAT-16 128 MB.
- Bloque de 4 KB: FAT-12 16 MB; FAT-16 256 MB; FAT-32 1 TB.
- Bloque de 8 KB: FAT-16 512 MB; FAT-32 2 TB.
- Bloque de 16 KB: FAT-16 1024 MB; FAT-32 2 TB.
- Bloque de 32 KB: FAT-16 2048 MB; FAT-32 2 TB.

Ventajas de FAT-32 sobre FAT-16: un disco de 8 GB puede ser una sola partición (con FAT-16 harían falta cuatro, que el usuario vería como C:, D:, E: y F:), y para una partición dada se puede usar un bloque más chico. Para una partición de 2 GB, FAT-16 tiene que usar bloques de 32 KB, y un archivo de 10 bytes ocupa 32 KB; si el archivo promedio es de 8 KB, se desperdician 3/4 del disco. FAT-32 puede usar bloques de 4 KB en esa partición, sin desperdicio para archivos de 8 KB, pero la FAT ocupa más RAM: 2 GB / 4 KB = 512K bloques, es decir, 512K entradas que ocupan 2 MB.

Según el último Windows del libro, FAT-16 se usa casi solo para disquetes, y FAT-32 (que no tiene seguridad) para medios transportables como las unidades flash.

### 15.3 El sistema de archivos V7 de UNIX

- Es un árbol desde la raíz, más vínculos que lo convierten en un grafo acíclico dirigido. Los nombres tienen hasta 14 caracteres y pueden tener cualquier carácter ASCII salvo / (el separador) y NUL (el relleno de los nombres más cortos, valor 0).
- Entrada de directorio (figura 4-33): solo dos campos, el número de i-nodo (2 bytes) y el nombre (14 bytes). Con 2 bytes, cada sistema de archivos admite como máximo 64K archivos.
- i-nodo: tamaño, tres tiempos (creación, último acceso y última modificación), propietario, grupo, protección y la cuenta de entradas de directorio que apuntan al i-nodo (por los vínculos). Al crear un vínculo, la cuenta sube; al borrar uno, baja; cuando llega a 0, el i-nodo se reclama y los bloques vuelven a la lista libre.
- Bloques (figura 4-34): las primeras 10 direcciones de disco están en el i-nodo, así que para archivos chicos toda la información está en el i-nodo, que se trae a memoria al abrir el archivo. Para archivos más grandes, una dirección apunta a un bloque indirecto sencillo con más direcciones; si no alcanza, otra apunta a un bloque indirecto doble, que contiene una lista de bloques indirectos sencillos, cada uno con unos cientos de bloques de datos; y si tampoco alcanza, un bloque indirecto triple.

Búsqueda de la ruta /usr/ast/mbox (figura 4-35). Pasos:
1. Se localiza el directorio raíz: su i-nodo está en un lugar fijo del disco (por ejemplo, el i-nodo 1).
2. Se lee el directorio raíz (por ejemplo, en el bloque 1) y se busca el primer componente, usr: la entrada dice que /usr es el i-nodo 6.
3. Se lee el i-nodo 6, que dice que el directorio /usr está en el bloque 132.
4. Se lee el bloque 132 y se busca ast: /usr/ast es el i-nodo 26.
5. Se lee el i-nodo 26, que dice que /usr/ast está en el bloque 406.
6. Se lee el bloque 406 y se busca mbox: /usr/ast/mbox es el i-nodo 60.
7. El i-nodo 60 se lee en memoria y queda ahí hasta que se cierra el archivo.

Localizar un i-nodo a partir de su número es simple, porque cada i-nodo tiene una ubicación fija en el disco. Las rutas relativas se buscan igual, pero desde el directorio de trabajo. Las entradas "." y ".." son cadenas ASCII comunes con el número de i-nodo del directorio actual y del padre: para buscar ../dick/prog.c se busca ".." en el directorio de trabajo, se obtiene el i-nodo del padre y ahí se busca dick. En el directorio raíz, ".." apunta a sí mismo.

(Tanenbaum, cap. 4.5, págs. 312–324)

---

## 16. NTFS, el sistema de archivos de Windows

Windows Vista admite FAT-16, FAT-32 y NTFS (NT File System), que se desarrolló para Windows NT y es el predeterminado desde Windows XP, con lo que mejoró mucho la seguridad y la funcionalidad. NTFS usa direcciones de disco de 64 bits, así que en teoría admite particiones de hasta 2⁶⁴ bytes.

Conceptos fundamentales:
- Nombres de hasta 255 caracteres y rutas completas de hasta 32.767. Los nombres están en Unicode, así que se pueden usar alfabetos no latinos.
- NTFS distingue mayúsculas de minúsculas, pero la API Win32 no lo hace por completo (solo el subsistema POSIX lo usa): Win32 no distingue pero preserva las mayúsculas.
- Un archivo NTFS no es solo una secuencia de bytes: es un conjunto de atributos, cada uno representado como un flujo de bytes. Hay flujos cortos (el nombre, el ID de objeto de 64 bits) y un flujo largo sin nombre con los datos. Puede haber varios flujos de datos, con nombres como foo:flujo1, cada uno con su tamaño y bloqueable por separado. Se usaron para atender clientes Macintosh y para metadatos como las miniaturas de las imágenes, pero son frágiles: se pierden al copiar a otros sistemas de archivos o al respaldar.
- Es jerárquico, con separador "\". El directorio de trabajo, "." y ".." son convenciones, no parte fundamental del diseño. Hay vínculos duros, pero solo para el subsistema POSIX. Los vínculos simbólicos recién llegaron con Windows Vista, restringidos a administradores e implementados con puntos de reanálisis.
- Tiene compresión, cifrado, tolerancia a fallas, registro de transacciones (bitácora) y archivos dispersos.

Implementación:
- Cada volumen (partición) es una secuencia lineal de bloques, que Microsoft llama clusters, de tamaño fijo por volumen, entre 512 bytes y 64 KB; casi siempre 4 KB, como compromiso entre transferencias eficientes y poca fragmentación interna. Los bloques se direccionan con su desplazamiento de 64 bits desde el inicio del volumen.
- La estructura principal es la MFT (Master File Table, tabla de archivos maestra): una secuencia lineal de registros de 1 KB. Cada registro describe un archivo o directorio: atributos (nombre, fechas) y la lista de direcciones de disco de sus bloques. Si un archivo es muy grande, usa varios registros: el registro base apunta a los registros de extensión. Un mapa de bits lleva las entradas libres de la MFT.
- La MFT es ella misma un archivo: puede estar en cualquier lugar del volumen (sin problema de sectores defectuosos en la primera pista) y crecer hasta 2⁴⁸ registros.
- Cada registro es una secuencia de pares (encabezado de atributo, valor). Si el valor es corto, va dentro del registro (archivo inmediato, para campos chicos); si es largo, va en otro lugar del disco y el registro tiene un apuntador (atributo no residente).
- Los primeros 16 registros de la MFT (figura 11-41) son archivos de metadatos cuyos nombres empiezan con $: el 0 describe la propia MFT ($Mft), el 1 es una copia espejo de su primera parte ($MftMirr), el 2 es el archivo de registro para recuperación ($LogFile, donde se registran los cambios estructurales antes de hacerlos; los únicos cambios que no se registran son los de los datos de usuario), el 3 tiene información del volumen ($Volume), el 4 define los atributos ($AttrDef), el 5 es el directorio raíz, el 6 es el mapa de bits del espacio libre ($Bitmap), el 7 apunta al cargador de arranque ($Boot), el 8 es la lista de bloques defectuosos ($BadClus), el 9 tiene los descriptores de seguridad de todos los archivos ($Secure), el 10 es la tabla de conversión de mayúsculas y minúsculas ($Upcase), el 11 es un directorio con archivos de cuotas, IDs de objeto y puntos de reanálisis ($Extend), y los últimos cuatro están reservados. La dirección del primer bloque de la MFT está en el bloque de arranque.
- NTFS define 13 atributos (figura 11-42), entre ellos: información estándar (propietario, etiquetas de hora POSIX, cuenta de vínculos duros, bits de solo lectura y archivo), nombre de archivo (Unicode, con un posible nombre corto 8 + 3 de MS-DOS), lista de atributos (dónde están los registros de extensión), ID de objeto, punto de reanálisis (para montajes y vínculos simbólicos), nombre y versión del volumen, raíz de índice, asignación de índice y mapa de bits (para directorios grandes, implementados con árboles B+), y el flujo de datos. La seguridad, desde Windows 2000, va en un solo archivo compartido.
- Bloques de un flujo: se asignan en tiradas (runs) de bloques consecutivos siempre que se pueda. Cada registro de tirada tiene un encabezado con el desplazamiento del primer bloque del flujo que cubre y del primero que no cubre, seguido de pares (dirección de disco, longitud de la tirada). Ejemplo de la figura 11-43: un flujo de 9 bloques (0 a 8) con tres tiradas: bloques 20 a 23 (par 20, 4), 64 a 65 (par 64, 2) y 80 a 82 (par 80, 3). Un flujo con un hueco, por ejemplo con los bloques 0 a 49 y 60 a 79 definidos, tiene dos registros con encabezados (0, 50) y (60, 80); los bytes del hueco se leen como ceros (archivos dispersos).
- No hay límite al tamaño de los flujos representables así: un par puede cubrir un millón de bloques consecutivos. Los pares se comprimen omitiendo bytes cero de orden alto.

(Tanenbaum, cap. 11.8, págs. 906–915; cap. 4.3.7, pág. 288)

---

## 17. Protección: dominios, matriz de protección, ACL, capacidades y canales encubiertos

### 17.1 Dominios de protección

Un sistema tiene muchos objetos que proteger, de hardware (CPU, segmentos de memoria, discos, impresoras) o de software (procesos, archivos, bases de datos, semáforos). Cada objeto tiene un nombre único y un conjunto finito de operaciones: read y write para un archivo, up y down para un semáforo. Hay que prohibir que un proceso use objetos sin autorización y restringirlo a un subconjunto de operaciones (por ejemplo, el proceso A puede leer el archivo F pero no escribirlo).

- Dominio: un conjunto de pares (objeto, derechos). Cada par indica un objeto y el subconjunto de operaciones permitidas sobre él. Un derecho (permiso) es la autorización para una operación. A menudo un dominio corresponde a un usuario, pero puede ser más general (por ejemplo, un equipo de programación).
- POLA (Principle of Least Authority, principio de menor autoridad, o necesidad de saber): la seguridad funciona mejor cuando cada dominio tiene los mínimos objetos y privilegios necesarios para su trabajo.
- Figura 9-4: tres dominios dibujados como óvalos. El dominio 1 tiene Archivo1 con R y Archivo2 con RW. El dominio 2 tiene Archivo1 con RW, Archivo4 con RWX, Archivo5 con RW e Impresora1 con W. El dominio 3 tiene Archivo6 con RWX, Plotter2 con W e Impresora1 con W. Impresora1 está en dos dominios a la vez (el 2 y el 3, que se superponen) con los mismos permisos; Archivo1 también está en dos dominios, pero con permisos distintos en cada uno (R en el 1 y RW en el 2).
- En cada instante, cada proceso se ejecuta en un dominio, y puede cambiar de dominio durante la ejecución.
- En UNIX, el dominio de un proceso se define por su UID y su GID: dos procesos con la misma combinación tienen acceso exactamente a los mismos objetos. Además, cada proceso tiene dos mitades: la de usuario y la de kernel; una llamada al sistema produce un cambio de dominio. Ejecutar (exec) un archivo con el bit SETUID o SETGID encendido le da al proceso un UID o GID efectivo nuevo: también es un cambio de dominio.

### 17.2 Matriz de protección

Conceptualmente, una matriz donde las filas son los dominios, las columnas son los objetos, y cada celda lista los derechos del dominio sobre el objeto (figura 9-5, la matriz de la figura 9-4). El cambio de dominio se modela tratando los dominios como objetos con la operación enter (figura 9-6): los procesos del dominio 1 pueden pasar al dominio 2, pero no volver; esto modela la ejecución de un programa SETUID.

En la práctica la matriz no se guarda entera, porque es grande y casi vacía. Se guarda por columnas (ACL) o por filas (capacidades), solo con los elementos no vacíos.

### 17.3 Listas de control de acceso (ACL) — la matriz por columnas

A cada objeto se le asocia una lista ordenada con los dominios que pueden acceder y cómo. Figura 9-7: tres procesos de los usuarios A, B y C, y tres archivos. F1 tiene la ACL A: RW; B: R. F2 tiene A: R; B: RW; C: R. F3 tiene B: RWX; C: RX (parece un ejecutable).

- Los derechos se otorgan por usuario, no por proceso: cualquier proceso del usuario A puede leer y escribir F1.
- A los usuarios se los llama sujetos o protagonistas, y a las cosas protegidas, objetos.
- Además de R, W y X puede haber derechos genéricos (destroy object, copy object) y específicos de cada tipo de objeto (append message para un buzón, sort alphabetically para un directorio).
- Grupos: en algunos sistemas cada entrada es un par (UID, GID): permisos. Eso introduce el concepto de rol. Ejemplo de Tana, administradora (grupo sysadm) y miembro del club de colombófilos (grupo fanpichones): el archivo de contraseñas tiene la ACL tana, sysadm: RW, y el de datos de pichones tiene bill, fanpichones: RW; tana, fanpichones: RW (figura 9-8). Lo que puede hacer Tana depende del grupo con el que inició sesión: no puede tocar el archivo de contraseñas cuando está como fanpichones.
- Comodín: tana, *: RW da acceso a Tana con cualquier grupo.
- Bloqueo selectivo: virgil, *: (none); *, *: RW da acceso de lectura y escritura a todos menos a Virgil, porque las entradas se recorren en orden y se aplica la primera que coincide.
- Otra variante: cada entrada es un UID o un GID (debbie: RW; phil: RW; fanpichones: RW).
- Revocación: es muy fácil, alcanza con editar la ACL. Pero si la ACL se revisa solo al abrir, el cambio vale para los open futuros: un archivo ya abierto conserva los derechos que tenía.

### 17.4 Capacidades — la matriz por filas

A cada proceso se le asocia la lista de objetos que puede usar, con las operaciones permitidas sobre cada uno: su dominio. Esa lista se llama lista de capacidades (lista-C), y cada elemento es una capacidad. Figura 9-9: el proceso de A tiene F1: R y F2: R; el de B tiene F1: R, F2: RW y F3: RWX; el de C tiene F2: R y F3: RX. Una capacidad tiene un identificador de objeto (en UNIX sería el número de i-nodo) y un mapa de bits de derechos.

Hay que impedir que los usuarios alteren las capacidades. Tres métodos:
1. Arquitectura etiquetada: cada palabra de memoria tiene un bit extra (etiqueta) que dice si contiene una capacidad; solo el kernel puede modificarlo. Ejemplo: IBM AS/400.
2. Mantener la lista-C dentro del sistema operativo y referirse a las capacidades por su posición ("leer 1 KB del archivo de la capacidad 2"), como los descriptores de archivo de UNIX. Ejemplo: Hydra.
3. Mantener la lista-C en espacio de usuario pero protegida criptográficamente (ideal para sistemas distribuidos; desarrollado para Amoeba). Figura 9-10: la capacidad tiene cuatro campos: servidor, objeto, derechos y f(objeto, derechos, comprobación), donde f es una función de una vía criptográficamente segura y la comprobación es un número aleatorio grande que el servidor guarda con el objeto y nunca envía. Al usar la capacidad, el servidor recalcula f con los dos primeros campos y su comprobación; si coincide con el cuarto campo, acepta. Un usuario que cambie los derechos no puede fabricar el cuarto campo. Para dar una capacidad más débil (por ejemplo, solo lectura), el servidor calcula f(objeto, nuevos derechos, comprobación).

Derechos genéricos típicos de las capacidades: copiar capacidad, copiar objeto, eliminar capacidad (el objeto no se afecta) y destruir objeto.

Revocación: en la versión administrada por el kernel es muy difícil, porque las capacidades pueden estar en listas-C de todo el disco; una solución es que cada capacidad apunte a un objeto indirecto y cortar esa conexión. En Amoeba alcanza con cambiar la comprobación del objeto, pero eso invalida todas las capacidades a la vez: ningún esquema permite revocar selectivamente (quitarle el permiso a John pero no a los demás). Otro problema: que el dueño de una capacidad válida no la reparta a mil amigos.

### 17.5 ACL contra capacidades

- Las capacidades son eficientes: "abrir el archivo de la capacidad 3" no requiere verificación; con ACL puede hacer falta una búsqueda larga.
- Sin grupos, dar lectura a todos con ACL requiere listar a todos los usuarios.
- Las capacidades permiten encapsular un proceso fácilmente; las ACL no.
- Las ACL permiten revocar selectivamente; las capacidades no.
- Si se borra un objeto y quedan capacidades, o al revés, hay problemas; las ACL no tienen ese problema.

Ejemplo resuelto 9 (de matriz a ACL y capacidades). Matriz: el usuario A puede leer y escribir F1 y leer F2; el usuario B puede leer F1 y ejecutar F3.
1. ACL (por columnas): F1: A: RW; B: R. F2: A: R. F3: B: X.
2. Capacidades (por filas): lista-C de A: F1: RW; F2: R. Lista-C de B: F1: R; F3: X.
3. Si se quiere quitarle a B la lectura de F1: con ACL se edita la ACL de F1 y no se afecta a nadie más; con capacidades administradas por el kernel hay que encontrar la capacidad de B (difícil), y con capacidades criptográficas habría que cambiar la comprobación de F1, lo que invalidaría también la capacidad de A.

### 17.6 Sistemas confiables y base de cómputo confiable

¿Se puede construir un sistema seguro? Sí: se sabe desde hace décadas (MULTICS lo logró bastante bien). No se hace por dos razones: los usuarios no quieren abandonar los sistemas actuales, y la única forma conocida es mantener el sistema simple, mientras que los diseñadores agregan características (el libro da los ejemplos del correo con macros de Word y las páginas web con applets). Las características son enemigas de la seguridad.

- Sistema confiable: uno que declaró formalmente sus requisitos de seguridad y los cumple.
- TCB (Trusted Computing Base, base de cómputo confiable): el hardware y el software mínimos necesarios para hacer cumplir todas las reglas de seguridad. Si la TCB funciona según su especificación, la seguridad no se compromete, pase lo que pase con el resto. Suele incluir casi todo el hardware, una parte del kernel (creación y cambio de procesos, administración del mapa de memoria, parte de la administración de archivos y de E/S) y los programas con poder de superusuario (los programas SETUID de root).
- Monitor de referencia (figura 9-11): parte de la TCB que recibe todas las llamadas al sistema relacionadas con la seguridad (como abrir archivos) y decide si se procesan. Pone todas las decisiones de seguridad en un solo lugar, sin posibilidad de saltearlo.
- Ejemplo: MINIX 3 ejecuta solo unas 4000 líneas en el kernel; el sistema de archivos y el administrador de procesos son parte de la TCB, pero el driver de impresora no.

### 17.7 Modelos formales y seguridad multinivel

Harrison y colaboradores (1976) identificaron seis operaciones primitivas sobre la matriz: create object, delete object, create domain, delete domain, insert right y remove right. Se combinan en comandos de protección que pueden ejecutar los programas. La matriz dice lo que un proceso puede hacer, no lo que está autorizado a hacer: el conjunto de matrices posibles se divide en estados autorizados y no autorizados (figura 9-12, donde Robert logra darse acceso a bandejacorreo7 de Henry). Para un sistema arbitrario no se puede probar teóricamente que nunca llegue a un estado no autorizado; para un sistema concreto, sí.

- Control de acceso discrecional: cada usuario decide quién lee y escribe sus archivos.
- Control de acceso obligatorio: la organización impone reglas sobre el flujo de información (militares, patentes, hospitales).

Modelo Bell-La Padula (para guardar secretos; seguridad multinivel). Los objetos y las personas tienen niveles (no clasificado, confidencial, secreto, alto secreto), y un proceso hereda el nivel de su usuario.
1. Propiedad de seguridad simple: un proceso de nivel k solo puede leer objetos de su nivel o inferiores (un general lee los documentos de un teniente, pero no al revés). "No leer hacia arriba."
2. Propiedad *: un proceso de nivel k solo puede escribir objetos de su nivel o superiores (un teniente puede dejarle un mensaje a un general, pero no al revés). "No escribir hacia abajo."
Así la información solo fluye hacia los costados o hacia arriba, nunca hacia abajo (figura 9-13). El problema es que sirve para guardar secretos, no para la integridad.

Modelo Biba (para la integridad), con las propiedades inversas:
1. Principio de integridad simple: un proceso de nivel k solo puede escribir objetos de su nivel o inferiores (no escribir hacia arriba).
2. Propiedad * de integridad: un proceso de nivel k solo puede leer objetos de su nivel o superiores (no leer hacia abajo).
Bell-La Padula y Biba están en conflicto directo, así que es difícil tener las dos a la vez.

### 17.8 Canales encubiertos

Aun con un modelo demostrado seguro e implementado correctamente, puede haber fugas. Modelo de Lampson: un cliente quiere que un servidor haga un trabajo (por ejemplo, completar sus formularios de impuestos), y un colaborador conspira con el servidor para robar los datos del cliente (figura 9-14). El objetivo es confinar al servidor para que no le pase información al colaborador: es el problema del confinamiento.

Con la matriz de protección se puede impedir que el servidor escriba un archivo que el colaborador lee o use la comunicación entre procesos. Pero quedan canales más sutiles, los canales encubiertos:
- Modular el uso de la CPU: para enviar un 1, el servidor calcula todo lo que puede durante un intervalo; para un 0, queda inactivo. El colaborador mide su propio tiempo de respuesta. Es un canal ruidoso, pero con un código de corrección de errores (por ejemplo, Hamming) se puede transmitir de forma confiable.
- Modular la tasa de paginación (muchos fallos de página para un 1, ninguno para un 0).
- Bloquear y desbloquear un archivo en intervalos fijos (figura 9-15, que transmite el flujo 11010100), incluso un archivo que el colaborador no puede usar, si puede detectar el estado del bloqueo; con dos archivos más de sincronización (F1 y F2) se arma un protocolo confiable.
- Adquirir y liberar recursos dedicados (cintas, plotters), o crear y borrar un archivo que el colaborador detecta con la llamada access.
- Esconder información en la factura del servidor.
Encontrar todos los canales encubiertos es muy difícil, y bloquearlos casi imposible en la práctica. Ningún modelo basado en una matriz de objetos y dominios puede evitar este tipo de fuga.

Esteganografía (escritura encubierta): ocultar la existencia de la información. El ejemplo del libro es una foto de tres cebras y un árbol, de 1024 × 768 píxeles con tres valores de color de 8 bits cada uno; usando el bit de menor orden de cada valor se pueden ocultar 1024 × 768 × 3 bits = 294.912 bytes. Ahí se escondieron, comprimidos (a unos 274 KB) y cifrados, los 734.891 bytes del texto de cinco obras de Shakespeare, sin que el ojo note la diferencia. Otro uso: marcas de agua ocultas en imágenes, música y películas para probar la autoría (y la contracara: rotar la imagen y convertirla a JPEG para borrarlas).

Nota: el programa nombra los "canales de conversión"; en el libro se llaman canales encubiertos (covert channels).

(Tanenbaum, cap. 9.3, págs. 622–641)

---

## 18. Caso de estudio: el sistema de archivos de Linux

### 18.1 Conceptos fundamentales

- El primer sistema de archivos de Linux fue el de MINIX 1, con nombres de 14 caracteres y archivos de hasta 64 MB. Después vino ext (nombres de 255 caracteres, archivos de 2 GB, pero lento) y luego ext2, que fue el principal. Linux admite decenas de sistemas de archivos a través del VFS, y algunos se cargan como módulos.
- Un archivo es una secuencia de 0 o más bytes con información arbitraria; no hay distinción entre ASCII y binario. Nombres de hasta 255 caracteres, con cualquier carácter salvo NUL. Las extensiones son convenciones (prog.c, prog.o, prog.java.gz) que esperan algunos programas, no el sistema.
- Los directorios se guardan como archivos. La raíz es "/", y "/" también separa los componentes. Rutas absolutas y relativas (al directorio de trabajo); "." y "..".
- Vínculo: una entrada nueva en un directorio que apunta a un archivo existente (figura 10-24: Fred crea en su directorio /usr/fred una entrada x que apunta al archivo x de Lisa, /usr/lisa/x).
- Archivos especiales de caracteres (por ejemplo /dev/tty para el teclado y /dev/lp para la impresora) y de bloques (por ejemplo /dev/hd1, para leer y escribir una partición cruda ignorando el sistema de archivos; los usan mkfs y fsck).
- Montaje (figura 10-25): en lugar de tener un sistema de archivos separado por unidad, como C: y D: en Windows, Linux monta un disco en un directorio del árbol de otro disco (por ejemplo, el DVD en /b): el usuario ve un solo árbol.
- Bloqueo de archivos (POSIX): un proceso puede bloquear desde un byte hasta un archivo entero en una operación indivisible, dando el archivo, el byte inicial y la cantidad. Bloqueos compartidos (varios a la vez) y exclusivos (ninguno más). El proceso elige si quiere bloquearse cuando no puede obtener el bloqueo o volver de inmediato con un código de estado. Las regiones pueden superponerse (figura 10-26: A bloquea los bytes 4 a 7, B los bytes 6 a 9 y C los bytes 2 a 11, todos compartidos; un pedido exclusivo del byte 9 queda bloqueado hasta que B y C liberen).

### 18.2 Llamadas al sistema de archivos (figura 10-27)

- fd = creat(nombre, modo): crea un archivo y lo abre en modo escritura. Los bits de modo son la protección. Si el archivo existía, lo trunca a 0.
- fd = open(archivo, cómo, ...): abre un archivo para lectura, escritura o ambas. Devuelve un descriptor de archivo, un entero pequeño no negativo.
- s = close(fd): cierra un archivo abierto; el descriptor queda libre para reusarse. creat y open siempre devuelven el descriptor libre de menor número.
- n = read(fd, búfer, nbytes): lee datos de un archivo y los pone en un búfer.
- n = write(fd, búfer, nbytes): escribe datos de un búfer en un archivo.
- posición = lseek(fd, desplazamiento, de_dónde): mueve el apuntador del archivo. El tercer parámetro dice si el desplazamiento es relativo al inicio, a la posición actual o al final; devuelve la posición absoluta resultante.
- s = stat(nombre, &buf): obtiene la información de estado de un archivo. s = fstat(fd, &buf): lo mismo, sobre un archivo abierto.
- s = pipe(&fd[0]): crea una tubería.
- s = fcntl(fd, comando, ...): bloqueo de archivos y otras operaciones.
- El código de retorno s es −1 si hubo un error.

Detalles importantes:
- Los descriptores 0, 1 y 2 ya están abiertos al arrancar un programa: entrada estándar, salida estándar y error estándar. Un filtro como sort lee del 0 y escribe en el 1 sin saber qué archivos son, porque el shell los redirige antes.
- read y write tienen tres parámetros: descriptor, búfer y cantidad de bytes. Cada archivo tiene un apuntador de posición: si está en 4096 y se leen 1024 bytes, queda en 5120.
- Ironía: lseek es la única llamada del sistema de archivos que nunca produce una búsqueda real en el disco, porque solo actualiza un número en memoria.
- stat devuelve (figura 10-28): el dispositivo, el número de i-nodo, el modo (incluida la protección), la cantidad de vínculos, el propietario, el grupo, el tamaño en bytes, la hora de creación, la del último acceso y la de la última modificación.
- pipe crea un seudoarchivo que almacena los datos entre los componentes de una tubería, como en sort <ent | head -30: el shell hace que el descriptor 1 de sort escriba en la tubería y el descriptor 0 de head lea de ella.

Llamadas de directorios (figura 10-29): mkdir(ruta, modo) crea un directorio; rmdir(ruta) lo elimina (solo si está vacío); link(ruta_original, ruta_nueva) crea un vínculo; unlink(ruta) elimina una entrada de directorio (al eliminar el último vínculo, el archivo desaparece); chdir(ruta) cambia el directorio de trabajo; opendir, closedir, readdir (devuelve una entrada en formato fijo) y rewinddir (rebobina para volver a leer). Los usuarios no pueden escribir directamente en un directorio, para mantener la integridad: se agregan archivos con creat o link y se quitan con unlink.

El programa nombra "open, close, read, write, lseek": son exactamente las llamadas de esta sección, y conectan con la Unidad 1 (llamadas al sistema y los pasos de read).

### 18.3 El VFS de Linux

Linux usa un VFS como el de la sección 9. Sus cuatro objetos principales (figura 10-30):
- Superbloque: describe un sistema de archivos específico (información crítica de su distribución; si se destruye, el sistema de archivos no se puede leer).
- i-nodo: describe un archivo específico. En Linux, los directorios y dispositivos también son archivos y tienen i-nodos.
- Dentry: una entrada de directorio, un componente de una ruta. Se guardan en caché (dentry_cache) para acelerar los recorridos de rutas.
- Archivo (file): la representación en memoria de un archivo abierto, creada por open, con operaciones como read, write, sendfile y lock.
Los sistemas concretos debajo del VFS no tienen que usar internamente las mismas abstracciones, pero deben implementar operaciones equivalentes, apuntadas desde las estructuras del VFS.

### 18.4 El sistema de archivos ext2

Distribución en disco (figura 10-31): el bloque 0 no se usa (suele tener el código de arranque). Después, la partición se divide en grupos de bloques, sin importar los límites de los cilindros. Cada grupo tiene, en orden: superbloque, descriptor de grupo, mapa de bits de bloques, mapa de bits de i-nodos, los i-nodos y los bloques de datos.

- Superbloque: número de i-nodos, número de bloques, inicio de la lista de bloques libres.
- Descriptor de grupo: ubicación de los mapas de bits, bloques e i-nodos libres en el grupo y cantidad de directorios (ext2 intenta repartir los directorios de forma pareja por el disco).
- Dos mapas de bits, de un bloque cada uno: uno para bloques libres y otro para i-nodos libres (idea de MINIX 1; la mayoría de los UNIX usaban una lista libre). Con bloques de 1 KB, un grupo tiene como máximo 8192 bloques y 8192 i-nodos.
- i-nodos de 128 bytes, numerados desde 1. Contienen toda la información que devuelve stat y lo necesario para encontrar los bloques. El directorio raíz suele ser el i-nodo 2, porque el 1 se reserva para los bloques defectuosos.
- Política de ubicación: los archivos se ponen en el mismo grupo que su directorio padre, y los datos en el mismo grupo que el i-nodo, si hay lugar (idea del Fast File System de Berkeley). Al asignar bloques, ext2 preasigna ocho bloques extra para el archivo, para reducir la fragmentación de escrituras futuras.

Directorios (figura 10-32): cada directorio ocupa un número entero de bloques, para escribirlos atómicamente. Las entradas no están ordenadas y no cruzan bloques. Cada entrada tiene cuatro campos fijos y uno variable: número de i-nodo (en el ejemplo, 19 para el archivo colosal, 42 para voluminoso y 88 para el directorio grandir), rec_len (tamaño total de la entrada, con relleno, para encontrar la siguiente), tipo (archivo, directorio, etc.), longitud del nombre (8, 10 y 6 en el ejemplo) y el nombre, terminado en 0 y rellenado a un límite de 32 bits. Al borrar voluminoso, simplemente se agranda el rec_len de colosal para que abarque la entrada borrada, que queda como relleno.

Búsqueda de una ruta, por ejemplo /usr/ast/archivo: se localiza el directorio raíz (i-nodo 2) y se pone en la caché de dentry; se busca "usr" en la raíz y se obtiene su número de i-nodo (también a la caché); se lee ese i-nodo, se leen los bloques del directorio /usr y se busca "ast"; se lee el i-nodo de /usr/ast y se busca "archivo". El i-nodo encontrado se lleva a la tabla de i-nodos del kernel, que tiene los i-nodos de todos los archivos y directorios abiertos. Por eso una ruta relativa, además de cómoda, le ahorra trabajo al sistema.

Campos del i-nodo de Linux (figura 10-33): modo (tipo de archivo, bits de protección, bits SETUID y SETGID), cantidad de vínculos (entradas de directorio que apuntan a este i-nodo), UID del propietario, GID, tamaño en bytes, direcciones de los primeros 12 bloques y después 3 bloques indirectos, número de generación (se incrementa cada vez que se reutiliza el i-nodo), y las horas de último acceso, última modificación y último cambio del i-nodo.

Las tres tablas de un read (figura 10-34). Una llamada n = read(fd, búfer, nbytes) parte del descriptor y tiene que llegar al i-nodo y a la posición en el archivo.
- Primer diseño posible: un apuntador al i-nodo en la tabla de descriptores de archivos. ¿Dónde se guarda la posición? Si se guarda en el i-nodo, dos procesos no relacionados que abren el mismo archivo compartirían la posición, y cada uno necesita la suya.
- Segundo diseño: la posición en la tabla de descriptores de cada proceso. Falla de forma más sutil: en un script de shell que corre p1 y después p2 con la salida redirigida al archivo x (s >x), se espera que p2 escriba donde terminó p1. Si cada proceso tuviera su posición privada, p2 empezaría en 0 y sobrescribiría lo de p1.
- Solución: una tabla intermedia, la tabla de descripción de archivos abiertos, entre la tabla de descriptores de archivos (una por proceso) y la tabla de i-nodos. Ahí se guarda la posición en el archivo (y el bit de lectura/escritura). Cuando el shell hace fork para crear p1, la tabla de descriptores del hijo es una copia de la del padre y apunta a la misma descripción de archivo abierto; cuando p1 termina, la posición quedó actualizada ahí, y cuando el shell crea p2, este la hereda. En cambio, un proceso no relacionado que abre el archivo obtiene su propia entrada de descripción, con su propia posición.
- Resumen: tabla de descriptores de archivos (por proceso) → tabla de descripción de archivos abiertos (posición, compartida entre padre e hijo) → tabla de i-nodos (un i-nodo por archivo abierto) → bloques.

Indirección en ext2, con bloques de 1 KB y direcciones de 4 bytes:
- Los 12 primeros bloques están en el i-nodo.
- El bloque indirecto sencillo tiene 256 direcciones: en total, archivos de hasta 12 + 256 = 268 KB.
- El bloque indirecto doble tiene 256 direcciones de bloques indirectos sencillos, cada uno con 256 direcciones de bloques de datos: 256² = 65.536 bloques más. (El libro dice "10 + 2¹⁶ bloques (67.119.104 bytes)", mezclando el 10 de UNIX V7 con los 12 de Linux; con 12 directos serían 12 + 256 + 65.536 = 65.804 bloques.)
- El bloque indirecto triple alcanza archivos de unos 2²⁴ bloques de 1 KB, es decir, 16 GB. Con bloques de 8 KB, hasta 64 TB.

Ejemplo resuelto 10 (qué bloque del i-nodo hay que leer). En ext2 con bloques de 1 KB y direcciones de 4 bytes (256 por bloque), un proceso hace lseek al byte 300.000 y lee.
1. Bloque lógico: 300.000 / 1024 = 292 (división entera), desplazamiento 300.000 − 292 × 1024 = 992 dentro del bloque.
2. Los bloques lógicos 0 a 11 son directos; el 292 no.
3. Los bloques 12 a 267 (256 bloques) están en el indirecto sencillo; el 292 tampoco.
4. Los bloques desde el 268 están en el indirecto doble: 292 − 268 = 24, así que es la entrada 24 / 256 = 0 del bloque doble (el primer bloque indirecto sencillo de segundo nivel) y, dentro de él, la entrada 24 mod 256 = 24.
5. Accesos al disco (sin caché): el i-nodo (normalmente ya en memoria si el archivo está abierto), el bloque indirecto doble, el bloque indirecto sencillo de segundo nivel y, por último, el bloque de datos.

### 18.5 El sistema de archivos ext3 (por bitácora)

Para no perder datos ante fallas, ext2 tendría que escribir cada bloque apenas se crea, con una latencia intolerable; por eso retrasa las escrituras, y los cambios pueden tardar hasta 30 segundos en llegar al disco. ext3 es un sistema de archivos transaccional (por bitácora):
- Mantiene un registro de transacciones que describe en orden secuencial todas las operaciones del sistema de archivos. Al escribir en forma secuencial, no paga los movimientos del brazo de los accesos aleatorios. Después los cambios se confirman en su lugar del disco y se descartan del registro. Si hay una falla antes de confirmar, al reiniciar el sistema detecta que no se desmontó bien, recorre el registro y aplica los cambios pendientes.
- Es compatible con ext2: mismas estructuras y distribución; un sistema desmontado como ext2 se puede montar como ext3.
- El registro es un archivo administrado como búfer circular, en el mismo dispositivo o en otro. Sus operaciones las maneja un JBD (Journaling Block Device), con tres estructuras: registro del diario (una operación de bajo nivel, por lo general cambios dentro de un bloque), manejador de operación atómica (agrupa los registros de una llamada al sistema como write, que cambia i-nodos, bloques existentes y nuevos, lista libre, etc., para que se apliquen todos o ninguno) y transacción (conjunto de operaciones atómicas, por eficiencia). Una parte del registro se descarta solo cuando todos los registros de una transacción están confirmados en el disco.
- Se puede configurar para registrar todos los cambios o solo los de metadatos (i-nodos, superbloque, mapas de bits): esto último cuesta menos y rinde más, pero no garantiza los datos de los archivos.

Lo que no está en el material: el programa nombra ext4, xfs, btrfs y zfs. El libro llega hasta ext3; la cartilla de comandos de la cátedra solo los menciona como valores posibles de FSTYPE (ext4 como el sistema común de Linux; xfs y btrfs como otros sistemas usados en Linux) y usa mkfs.ext4 en los ejemplos. Sus detalles internos no están en las fuentes.

### 18.6 El sistema de archivos /proc

Para cada proceso hay un directorio en /proc cuyo nombre es el PID en decimal (por ejemplo, /proc/619). Sus archivos parecen tener la línea de comandos, el entorno y las máscaras de señales del proceso, pero no existen en el disco: al leerlos, el sistema genera la información en el momento. Linux agrega en /proc información sobre la CPU, las particiones, los dispositivos, los vectores de interrupción, los contadores del kernel, los sistemas de archivos y los módulos cargados; algunos archivos se pueden escribir para modificar parámetros del sistema. Conexión con las Unidades 2 y 3: /proc/PID/status y /proc/meminfo, que se usaron en los comandos de procesos y de memoria.

(Tanenbaum, cap. 10.6.1–10.6.3, págs. 779–796)

---

## 19. Comandos de Linux de la cátedra para sistemas de archivos

Ver los sistemas de archivos montados (tres formas comunes):
- cat /proc/mounts: lo que el kernel tiene montado ahora. Columnas: dispositivo (partición o recurso montado), punto de montaje (la carpeta), tipo de sistema de archivos (ext4, tmpfs, proc) y opciones (rw o ro).
- mount: lo mismo, en un formato más legible.
- findmnt: los montajes en forma de árbol, suele ser el más claro. Columnas: TARGET (punto de montaje), SOURCE (dispositivo o recurso de origen), FSTYPE (tipo) y OPTIONS (opciones).

El archivo /etc/fstab: la configuración de los sistemas de archivos que se montan automáticamente al iniciar Linux. Se ve con cat /etc/fstab. Cada línea tiene seis columnas:
1. Dispositivo o UUID: identifica la partición o el disco.
2. Punto de montaje: por ejemplo /, /home o /mnt/datos.
3. Tipo de sistema de archivos: ext4, ntfs, vfat, swap.
4. Opciones de montaje: defaults, ro, rw, noauto.
5. Dump: si se incluye en las copias de seguridad con dump.
6. Pass: el orden en que fsck revisa el sistema de archivos.
Ejemplo de la cátedra: la línea "UUID=xxxx-xxxx /home ext4 defaults 0 2" significa que la partición se identifica por su UUID, se monta en /home, usa ext4, se monta con opciones normales, no se incluye en dump y se revisa con fsck después de la partición raíz. Importante: fstab no muestra lo que está montado ahora, sino lo que está configurado para montarse automáticamente.

lsblk -f: muestra los dispositivos de bloque (discos y particiones) con información de sus sistemas de archivos. Columnas: NAME (nombre del disco o partición), FSTYPE (tipo), FSVER (versión), LABEL (etiqueta), UUID (identificador único), FSAVAIL (espacio disponible), FSUSE% (porcentaje usado) y MOUNTPOINTS (dónde está montado). En FSTYPE pueden aparecer: ext4 (el sistema común de Linux), vfat o fat32 (pendrives y particiones EFI), ntfs (Windows), exfat (discos extraíbles), swap (área de intercambio de Linux), y xfs o btrfs (otros sistemas de Linux).

Crear, formatear, montar y desmontar una imagen de disco (práctica de la cátedra):
1. dd if=/dev/zero of=mi_imagen.img bs=1M count=100: dd copia datos de un origen a un destino; if=/dev/zero es la entrada (genera ceros continuamente); of=mi_imagen.img es el archivo de salida; bs=1M es el tamaño de bloque, 1 MB; count=100 copia 100 bloques. Resultado: un archivo de unos 100 MB lleno de ceros. Todavía no es un sistema de archivos ni un disco montable.
2. mkfs.ext4 mi_imagen.img: mkfs crea un sistema de archivos de tipo ext4 en el archivo. Ahora es una imagen de disco formateada.
3. sudo mkdir /mnt/mi_imagen crea el punto de montaje, y sudo mount -o loop mi_imagen.img /mnt/mi_imagen lo monta; la opción -o loop hace que Linux trate el archivo .img como si fuera un dispositivo de bloques.
4. df -h | grep mi_imagen: df -h muestra el espacio total, usado y disponible de los sistemas montados, y grep filtra la línea de la imagen.
5. sudo umount /mnt/mi_imagen: desmonta; el contenido deja de verse en /mnt/mi_imagen.
6. Para que se monte sola al arrancar, se agrega una línea a /etc/fstab: echo "$(pwd)/mi_imagen.img /mnt/mi_imagen ext4 loop 0 0" | sudo tee -a /etc/fstab. Los campos son la ruta completa de la imagen, el punto de montaje, el tipo, la opción loop, el primer 0 (no usar dump) y el segundo 0 (no revisarla con fsck al arrancar); tee -a agrega la línea al final con permisos de administrador. Antes conviene hacer una copia: sudo cp /etc/fstab /etc/fstab.bak.
7. sudo mount -a monta todos los sistemas de /etc/fstab que todavía no estén montados; sirve para probar la configuración, y después se verifica con df -h | grep mi_imagen.

Vínculos: ln original.txt enlace_duro.txt y ln -s original.txt enlace_simbolico.txt, con las diferencias de la sección 7.

Glosario básico de la cátedra: cat (muestra el contenido de un archivo), ls y ls -l (lista archivos), cd (cambia de directorio), pwd (muestra la ruta actual), mkdir (crea un directorio), cp (copia), mv (mueve o renombra), rm (elimina), grep (busca líneas con un texto, también en la salida de otro comando), sudo (ejecuta con permisos de administrador) y man (muestra el manual). Símbolos: | envía la salida de un comando al siguiente; > guarda la salida reemplazando el archivo; >> la agrega al final; - introduce opciones como -h, -f o -r.

Nota: en los exámenes aparece la consigna de averiguar el tamaño de bloque de una partición ext4. La cartilla de la cátedra no muestra un comando para eso: /etc/fstab dice qué se monta, dónde y con qué tipo, pero no el tamaño de bloque. Como complemento (no está en el material), en Linux el tamaño de bloque de un sistema ext4 se puede ver con sudo tune2fs -l seguido del dispositivo (la línea "Block size") o con stat -f sobre el punto de montaje.

(Apunte: comandos de Linux de la cátedra, sección de sistemas de archivos)

---

## 20. Lo que más se toma y repaso final

Según los exámenes, parciales y prácticos del material de la cátedra, lo que más se toma en esta unidad es:

1. FAT: seguir la cadena de clusters a partir del cluster inicial de la entrada de directorio, decir en qué cluster termina el archivo y calcular el espacio ocupado en disco (clusters por tamaño de cluster). Ver el ejemplo resuelto 1.
2. i-nodos: con D punteros directos (10 o 12) más un indirecto sencillo, uno doble y uno triple, calcular el tamaño máximo de un archivo con (D + P + P² + P³) × B, donde P = B / tamaño del puntero. Con 10 directos, bloques de 4 KB y punteros de 4 bytes, el máximo es de unos 4 TB (2⁴² bytes). Y calcular cuántos bloques de datos y de índice usa un archivo. Ver los ejemplos resueltos 2 y 3.
3. Fragmentación interna: el espacio desperdiciado en el último bloque, con la división entera y el resto exacto. Ver el ejemplo resuelto 6.
4. Comandos: lsblk -f, /etc/fstab (sus seis columnas), mount, findmnt, df -h, mkfs.ext4, dd y la diferencia entre ln y ln -s.

Ideas clave para recitar:
- Un archivo es una unidad lógica de información, persistente e independiente de los procesos. El sistema de archivos es la parte del SO que los crea, nombra, protege y administra.
- Los cuatro métodos de asignación y sus ventajas y desventajas: contigua (CD-ROM), lista enlazada, FAT (tabla entera en memoria, proporcional al disco) e i-nodos (solo los abiertos en memoria, proporcional a los archivos abiertos).
- El i-nodo no guarda el nombre: el nombre está en el directorio. El contador de vínculos decide cuándo se borra el archivo.
- Vínculo duro: otro nombre para el mismo i-nodo, no cruza sistemas de archivos, sobrevive al borrado del original. Vínculo simbólico: un archivo con una ruta, i-nodo propio, cruza discos y máquinas, se rompe si se borra el original.
- Bitácora: escribir primero lo que se va a hacer, con operaciones idempotentes; transacción atómica = todo o nada.
- VFS: una capa común con interfaz POSIX arriba e interfaz de funciones abajo; nodo-v por archivo abierto.
- Mapa de bits contra lista de bloques libres: el mapa ocupa menos salvo con el disco casi lleno, y permite asignar bloques cercanos.
- fsck: dos tablas de contadores por bloque (en uso y libres); bloque faltante, duplicado en libres y duplicado en datos; y la cuenta de vínculos de los i-nodos, demasiado alta (desperdicia) o demasiado baja (catastrófica).
- Caché de búfer con LRU modificado, sync cada 30 segundos contra escritura inmediata, lectura adelantada y grupos de cilindros.
- Protección: el dominio es un conjunto de pares (objeto, derechos); la matriz por columnas es la ACL y por filas son las capacidades; las ACL permiten revocar selectivamente y las capacidades no.
- Bell-La Padula: no leer hacia arriba, no escribir hacia abajo (secretos). Biba: al revés (integridad).
- Linux: tabla de descriptores (por proceso) → tabla de descripción de archivos abiertos (la posición, compartida entre padre e hijo) → tabla de i-nodos.

Conexiones con otras unidades:
- Unidad 1: la abstracción (el archivo como abstracción del disco), las llamadas al sistema (open, read, write, close, lseek), el MBR y el arranque, y la E/S.
- Unidad 2: los descriptores de archivo se heredan con fork; la posición compartida entre padre e hijo; el bloqueo de archivos y las regiones críticas; los semáforos como objetos protegidos.
- Unidad 3: asignación contigua ↔ segmentación pura y fragmentación externa; bloques fijos ↔ paginación; fragmentación interna en el último bloque ↔ media página por proceso; la caché de búfer usa los mismos algoritmos que el reemplazo de páginas; los archivos asociados a memoria y la caché de páginas.
- Unidad 5: los respaldos en disco remiten a RAID, y el tiempo de búsqueda y rotación del disco se estudia en planificación de disco.
- Unidad 9: la protección (dominios, ACL, capacidades) es la base de la seguridad.

(Tanenbaum, cap. 4.7, págs. 324–325) (Apunte: resumen de la cátedra, Unidad 4) (Apunte: práctica resuelta) (Apunte: comandos de Linux)
