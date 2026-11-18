
## 5. Discos: hardware

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
