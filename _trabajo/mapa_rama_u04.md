
# U4 — Sistemas de archivos {#u4}

> 📖 Tanenbaum, cap. 4 completo (págs. 255–324) + 9.3 protección (págs. 622–641) + 10.6 Linux (págs. 779–803) + 11.8 NTFS (págs. 906–915) + 8.4.4 (págs. 591–596) + apuntes de la cátedra (resumen U4, práctica de FAT, nodos-i y FAT32, comandos de sistemas de archivos)
> 📄 Repaso U4, 35 págs. — la clase completa; mapa de la unidad en la pág. 1; cierre y lo que más se toma en las págs. 33–34

La pregunta que recorre la unidad: **¿cómo guardamos información que sobreviva al proceso, en un disco que solo sabe «leer el bloque k» y «escribir el bloque k»?** Primero se mira desde el **usuario** (archivos, directorios), después desde el **implementador** (asignación, nodos-i, directorios por dentro, bitácora, espacio libre, consistencia), después casos reales (CD-ROM, FAT, V7, NTFS, NFS, Linux) y la **protección**.

## Tema 1 — Archivos {#u4-archivos}

> 📖 cap. 4.1, págs. 255–268 (figs. 4-1 a 4-5)
> 📄 Repaso U4, pág. 1 — "Tema 1 — Archivos"

- **Por qué no alcanza la memoria** — guardar los datos en el espacio de direcciones falla por 3 razones: **no entra**, **se pierde** cuando el proceso termina, **no se comparte**. De ahí los 3 requisitos: mucha capacidad, **persistencia**, **acceso concurrente**.
- **Archivo** — unidad lógica de información creada por los procesos, **independiente de ellos** y **persistente**. **Sistema de archivos** = la parte del SO que los estructura, nombra, accede, usa, protege e implementa.
  - 🧠 **Tercera abstracción del SO**: proceso (CPU) [[u2-proceso]], espacio de direcciones (RAM) [[u3-espacio-dir]], archivo (disco).
- **Nombres** — hasta 255 caracteres. La extensión es **convención en UNIX** (`prog.java.gz`); en **Windows tiene significado** (asocia un programa).
- **Estructura** — (a) **secuencia de bytes** (UNIX y Windows: el SO no interpreta nada); (b) registros fijos; (c) **árbol de registros con llave** (mainframes).
- **Tipos** — regulares (ASCII o binarios), directorios, especiales de **caracteres** (terminal, impresora) y de **bloques** (discos).
  - **Ejecutable de UNIX (fig. 4-3)** — encabezado con **número mágico**, tamaños y dirección de inicio; texto, datos, reubicación, tabla de símbolos. El SO **exige** ese formato.
- **Acceso** — **secuencial** (cinta) o **aleatorio** (disco); UNIX y Windows: **seek + read**.
- **Atributos (metadatos)** — protección, propietario, banderas (solo lectura, oculto, archivo, temporal), fechas, tamaño.
- **Operaciones** {#u4-operaciones}
  - 🔢 **Ciclo de vida de un archivo**
    1. `create`.
    2. `open` → trae a RAM los **atributos y las direcciones de disco** (por eso lo que sigue es rápido).
    3. `read` / `write` / `append` / `seek` (write en el medio sobrescribe; al final, crece).
    4. `get/set attributes`, `rename`.
    5. `close` → libera tablas y **fuerza la escritura del último bloque**.
    6. `delete`.
  - **`copyfile` (fig. 4-5)** — `while ((n = read(ent, buf, 4096)) > 0) write(sal, buf, n);` — se escribe **n**, no 4096: el último read trae lo que queda; con 4096 la copia quedaría más grande y con basura al final.
  - 🔗 Son llamadas al sistema (TRAP → modo kernel) [[u1-llamadas]], y el **descriptor** que devuelve `open` es lo que hereda el hijo en un `fork` [[u2-fork]].
- 📌 «Cambiarle la extensión a `.txt` a un ejecutable en UNIX impide ejecutarlo» → **falso**: deciden el **bit x** y el **número mágico**. En Windows, doble clic lo abre con el Bloc de notas.
  - ⚠️ Respondí bien pero sin nombrar el **bit x** ni el **número mágico**, que es lo que da el puntaje completo.

## Tema 2 — Directorios {#u4-directorios}

> 📖 cap. 4.2, págs. 268–273 (figs. 4-6 a 4-8)
> 📄 Repaso U4, pág. 3 — "Tema 2 — Directorios"

- **Un solo nivel** (fig. 4-6) — simple y rápido, pero los nombres de distintos usuarios **chocan**. Hoy: cámaras y reproductores.
- **Jerárquico** (fig. 4-7) — un árbol; cada usuario se organiza; casi todos los SO.
- **Rutas** {#u4-rutas}
  - **Absoluta** — desde la raíz; **empieza con el separador** (`/` UNIX, `\` Windows, `>` MULTICS); única.
  - **Relativa** — desde el **directorio de trabajo**. Cada proceso tiene el suyo.
  - **`.`** = actual, **`..`** = padre; en la raíz, `..` apunta a la raíz.
  - Ejemplo (fig. 4-8): en `/usr/ast`, `cp ../lib/dictionary .` = `cp /usr/lib/dictionary dictionary`.
  - ⚠️ Escribí `/luis/notas.txt` en un paso intermedio: **toda ruta que empieza con `/` es absoluta**, aunque venga después de los `..`.
- **Operaciones de directorios (UNIX)** — create (ya trae `.` y `..`), delete (**solo vacío**), opendir/readdir/closedir (formato estándar), rename, **link** (sube el contador del nodo-i), **unlink** (si era la última entrada, el archivo desaparece; **borrar en UNIX es unlink**).
  - 📌 **«Vacío» = solo `.` y `..`**: `rmdir` lo borra. Cualquier otra entrada, aunque sea `.bashrc`, da *Directory not empty* (pág. 272).
- 🔗 El directorio de trabajo es parte del estado del proceso: el hijo lo hereda en el `fork` y si hace `cd` el padre no se entera; por eso **`cd` es un comando interno del shell** [[u2-fork]].

## Tema 3 — Distribución del disco y asignación ★ {#u4-asignacion}

> 📖 cap. 4.3.1–4.3.2, págs. 273–279 (figs. 4-9 a 4-12)
> 📄 Repaso U4, pág. 5 — "Tema 3 — Implementación: distribución del disco y asignación (contigua, enlazada, FAT)"

- **Distribución del disco (fig. 4-9)** — sector 0 = **MBR** (código de arranque + **tabla de particiones**, una **activa**). Cada partición: bloque de arranque · **superbloque** · espacio libre · nodos-i · directorio raíz · archivos.
  - 🔢 **Arranque desde el disco**
    1. El BIOS lee y ejecuta el MBR.
    2. El MBR busca la partición activa.
    3. Lee su bloque de arranque y lo ejecuta.
    4. Ese bloque carga el SO.
  - **Superbloque** — **número mágico** (tipo de FS), cantidad de bloques, datos administrativos; se lee a RAM al montar.
  - 🔗 Es el sector de booteo de la U1 [[u1-arranque]]; lo nuevo es el interior de la partición.
- **Contigua** — el directorio guarda inicio + cantidad; bloque k en **inicio + k**.
  - (+) simple, **una sola búsqueda** para leer todo. (−) **fragmentación externa**, hay que saber el tamaño final. Hoy: **CD-ROM y DVD** (UDF: archivos de 1 GB, película en 3–4 fragmentos).
  - 🔗 Es el problema de la **segmentación** y el tablero de ajedrez [[u3-tablero]].
- **Lista enlazada** — la primera palabra de cada bloque apunta al siguiente; el directorio guarda el primero.
  - (+) sin fragmentación externa. (−) **acceso aleatorio lentísimo** (leer del disco los n−1 anteriores); el dato ya **no es potencia de 2**.
- **FAT** {#u4-fat} — los punteros pasan a una **tabla en RAM** con una entrada por bloque: **FAT[c] = el bloque que sigue a c**.
  - (+) el bloque entero para datos; la cadena se recorre **en RAM**. (−) **toda la tabla en RAM siempre**: 200 GB con bloques de 1 KB → 600–800 MB. **No escala.**
  - 🔗 Es el drama de la **tabla de páginas grande** [[u3-multinivel]]; el nodo-i lo resuelve como la tabla invertida [[u3-invertida]].
  - 🔢 **Seguir una cadena FAT (ejercicio de final)**
    1. Del directorio, el cluster inicial c.
    2. Leer FAT[c]: si es FIN (FF / −1), c es el último.
    3. Si no, c = FAT[c] y anotar.
    4. Clusters = cantidad de nodos de la cadena (**no de flechas**).
    5. Espacio = clusters × tamaño de cluster; frag. interna = espacio − tamaño real.
    6. Control: ⌈tamaño / cluster⌉ tiene que dar la misma cantidad.
  - **Final de la cátedra** — FAT32, clusters de 256 B, empieza en 4, tabla 5×5 numerada fila por fila: 4 → 9 → 24 → 14 → 16 → 10 → 21 → 7 (FF). Termina en el **cluster 7**; **8 × 256 = 2048 B**.
  - 📌 «¿En qué cluster termina?» se responde con el **número de entrada que tiene FF**, no con «FF». Y son **8 clusters con 7 flechas**. Los valores fuera de la cadena son ruido.
  - ⚠️ En el control respondí bien (cluster 2, 3072 B, 172 B) pero **sin escribir la cadena**: en el final la parte b vale 15 p y sin desarrollo queda parcial.
  - ⚖️ **FAT vs. lista enlazada para el byte 1.000.000**: las dos recorren la cadena desde el principio, pero la FAT lo hace **en RAM** (~980 consultas + 1 lectura) y la lista **en el disco** (~980 lecturas). Nanosegundos contra milisegundos [[u1-jerarquia]].

## Tema 4 — Nodos-i ★ {#u4-nodoi}

> 📖 cap. 4.3.2, págs. 279–280; 4.5.3, págs. 321–322 (figs. 4-13, 4-34)
> 📄 Repaso U4, pág. 8 — "Tema 4 — Nodos-i"

- **Nodo-i** — una estructura por archivo con los **atributos** (tamaño, dueño, grupo, permisos, 3 tiempos, **contador de vínculos**) y las **direcciones**: D directos (V7: 10, ext2: 12) + indirecto **simple**, **doble** y **triple**. **P = tamaño de bloque / tamaño de puntero.**
  - ⚖️ **FAT vs. nodos-i** {#u4-fat-vs-nodoi} — 🧠 *«la FAT es proporcional al disco; los nodos-i, a los archivos abiertos»* (k abiertos × n bytes). Disco de 2 TB con bloques de 1 KB: FAT ≈ 8 GB de RAM; 1000 nodos-i de 128 B ≈ 128 KB.
  - ⚠️ Dije que la FAT «copia todos los índices»: es **una entrada por cada bloque del disco**; y del lado del nodo-i va a RAM **el nodo-i**, no el archivo.
- **Tamaño máximo** — **(D + P + P² + P³) · B**.
  - Práctica: 10 directos, 4 KB, punteros de 4 B → P = 1024 → 1.074.791.434 bloques × 4096 = **4.402.345.713.664 B ≈ 4 TiB**. 🧠 Atajo: P³·B = 2³⁰·2¹² = 2⁴².
  - 📌 **Errata de la práctica**: dice «4,27 TB»; es **4,00 TiB** (4,40 TB en base 10).
- **Bloques índice de un archivo** — se van llenando niveles: en el doble se cuenta **el bloque doble + cada sencillo** que cuelga de él.
  - Práctica: 12 directos, 2 KB, 4 B, 5,5 MB → 2816 datos: simple 1 + doble (1 + ⌈2292/512⌉ = 5) = **7 índices**.
  - Control: 10 directos, 1 KB, 300 KB → 300 datos + **3 índices** (1 simple + 1 doble + 1 sencillo) = 303 bloques.
- **¿Dónde está un byte?** {#u4-ubicar-byte}
  - 🔢 **Ubicar un byte en el nodo-i**
    1. n = byte div B; desplazamiento = byte mod B.
    2. Si n < D → directo n.
    3. Si no, n −= D; si n < P → simple, entrada n.
    4. Si no, n −= P; si n < P² → doble, entrada n div P, y en el sencillo n mod P.
    5. Si no, n −= P² → triple.
    6. Lecturas con el nodo-i en RAM: directo 1, simple 2, doble 3, triple 4 (**+1 si el nodo-i no está en RAM**).
  - ext2 (12, 1 KB, P = 256), byte 300.000 → bloque 292 → doble, entrada 0, sencillo 24 → **3 lecturas**.
  - Control: 10 directos, 1 KB, byte 270.000 → bloque 263 → simple, **entrada 253**, **2 lecturas**.

## Tema 5 — Implementación de directorios y vínculos ★ {#u4-vinculos}

> 📖 cap. 4.3.3–4.3.4, págs. 280–285 (figs. 4-14 a 4-17); 4.5.3, págs. 321–323 (figs. 4-33, 4-35)
> 📄 Repaso U4, pág. 10 — "Tema 5 — Implementación de directorios y vínculos"

- **Qué guarda la entrada** — traduce un nombre a lo necesario para hallar los datos: contigua → dirección de todo; enlazada/FAT → **primer bloque**; nodos-i → **número de nodo-i**.
  - ⚖️ **Atributos en la entrada (MS-DOS) vs. en el nodo-i (UNIX)** (fig. 4-14). **V7**: entrada = nombre (14 B) + nº de nodo-i (2 B) → **máximo 64 K archivos**.
- **Nombres largos (fig. 4-15)** — **en línea** (longitud + atributos + nombre con relleno; hueco variable al borrar, puede cruzar páginas → fallo de página) o **en un heap** (entradas fijas con puntero; el próximo archivo siempre entra).
- **Búsqueda rápida** — **tabla hash** por directorio (colisiones encadenadas; para directorios de cientos o miles) o **caché de búsquedas**.
- **Buscar `/usr/ast/mbox` (fig. 4-35)** {#u4-ruta-mbox}
  - 🔢 **Resolución de una ruta en V7**
    1. Nodo-i de la raíz, en **lugar fijo**.
    2. Bloque 1 (raíz): `usr` → nodo-i 6.
    3. Nodo-i 6 → el directorio está en el bloque 132.
    4. Bloque 132: `ast` → nodo-i 26.
    5. Nodo-i 26 → bloque 406.
    6. Bloque 406: `mbox` → nodo-i 60.
    7. El nodo-i 60 se lee a RAM y queda hasta el `close`. **7 lecturas sin caché.**
  - Una ruta relativa empieza en el directorio de trabajo; `..` es una entrada más con el nodo-i del padre.
- **Archivos compartidos** — con vínculos el árbol pasa a ser un **DAG**. Las direcciones tienen que vivir en el **nodo-i** y no en el directorio; si no, lo que agrega uno no lo ve el otro.
- **Vínculo duro** {#u4-duro} — otra entrada al **mismo nodo-i**; **sube el contador**; el **dueño no cambia**.
  - 🔢 **Fig. 4-17, contador del nodo-i**
    1. C crea `datos` → 1.
    2. B hace `ln` → **2** (el dueño sigue siendo C).
    3. C hace `rm` → **1**: se borra solo la entrada de C; el archivo **sigue vivo** para B.
    4. B hace `rm` → **0**: recién ahí se liberan nodo-i y bloques.
  - Por qué no se libera antes: B quedaría apuntando a un nodo-i que podría reasignarse, y **el nodo-i no sabe qué directorios lo apuntan**.
  - 📌 **El dueño sigue pagando la cuota** de un archivo que «borró» hasta que el otro borre su vínculo [[u4-espacio]].
  - **No cruza particiones**: la entrada es (nombre, nº de nodo-i) y el número es **local** a cada FS.
- **Vínculo simbólico** {#u4-simbolico} — un **archivo nuevo tipo LINK** que contiene una **ruta**; el contador del original **no cambia**. Si el dueño borra, queda **colgado** («No such file or directory»). Más lento (recorre la ruta) y cuesta un nodo-i. **Cruza discos y hasta máquinas.**
  - 🧠 *«El duro cuenta, el simbólico apunta.»* Analogía: duro = **copia de la llave** (la casa se demuele cuando no queda ninguna); simbólico = **papelito con la dirección** (si demuelen la casa, encontrás un terreno vacío).
  - ⚠️ En el control (Ana crea, Luis `ln`, Luis `ln -s`, Ana `rm`): contador **1, 2, 2, 1**. Me olvidé de que el `rm` **ya había pasado** al responder el `cat`, y dije que el **simbólico** mantenía vivo el archivo y que pagaba Luis. Lo correcto: `cat inf` funciona, `cat atajo` falla (colgado), **paga Ana**, y lo mantiene vivo **el duro**.
- 📌 **Problema de los dos** — el archivo tiene varias rutas: un respaldo puede copiarlo **dos veces** [[u4-respaldos]].

## Tema 6 — LFS, bitácora y VFS {#u4-bitacora}

> 📖 cap. 4.3.5–4.3.7, págs. 285–291 (fig. 4-18)
> 📄 Repaso U4, pág. 13 — "Tema 6 — LFS, bitácora y VFS"

- 📌 El resumen de la cátedra solo trae LFS; bitácora y VFS salen del libro (el programa nombra «actualización atómica, transacciones» y «VFS»).
- **LFS (sistema estructurado por registro)** — el disco no mejora la búsqueda y lo que llega son **escrituras chicas** (< 1 % de eficiencia). Idea: juntar las escrituras en RAM y escribir **un segmento grande (~1 MB) al final de un registro circular**.
  - Cada segmento tiene un **resumen**; los nodos-i ya no tienen lugar fijo → **mapa de nodos-i**; un **hilo limpiador** rescata lo vivo de los segmentos viejos.
  - (+) un orden de magnitud más rápido en escrituras chicas. (−) incompatible → **casi no se usa**.
  - 🔗 El limpiador es la **compactación** y el registro circular es la idea del **reloj** [[u3-reloj]].
- **Bitácora (journaling)** ★ {#u4-journaling}
  - **El problema**: borrar = (A) quitar la entrada del directorio, (B) liberar el nodo-i, (C) devolver los bloques. Si se corta la luz en el medio, **ningún orden es seguro**: limbo, bloques perdidos, **nodo-i reasignado** (B primero) o **bloques compartidos** (C primero).
  - 🔢 **Operación con bitácora**
    1. Escribir en el disco la **entrada de bitácora** con las acciones (y releerla).
    2. Hacer A, B, C.
    3. Si todo salió bien, **borrar la entrada**.
    4. Si se cae: al re-arrancar, **rehacer** todo lo pendiente, las veces que haga falta.
  - **Idempotente** {#u4-idempotente} — hacerla 2 veces deja lo mismo que 1 vez. Hace falta porque se rehace **sin saber** qué se alcanzó a hacer.
    - 🧠 *Fijar / poner en X / borrar si existe / agregar si no está* → **sí**. *Sumar / incrementar / agregar al final / alternar* → **no**. Ascensor (piso 5) vs. interruptor que alterna.
    - ⚠️ Confundí «idempotente» con «es la operación correcta». «Poner en 1 el bit 500» **sí** es idempotente; «incrementar el contador» **no**.
  - **Transacción atómica** — `begin … end transaction`: **todas o ninguna**.
  - Usan bitácora: **NTFS** [[u4-ntfs]], ReiserFS y **ext3** (compatible con ext2) [[u4-linux]].
  - ⚠️ En el escenario «libero el nodo-i y después borro la entrada», me faltó el problema concreto: **el nodo-i liberado se reasigna** al archivo nuevo y la entrada vieja **abre el archivo nuevo**. Y la bitácora no «empieza de cero»: **rehace** lo pendiente.
- **VFS (sistema de archivos virtual)** {#u4-vfs}
  - Windows usa letras de unidad; UNIX **monta** todo en un árbol. El VFS es la capa común: interfaz **superior POSIX** hacia los procesos e **interfaz VFS inferior** hacia cada FS concreto.
  - 🔢 **`open("/usr/include/unistd.h")` con VFS**
    1. Al montarse, cada FS se **registra** con su vector de funciones.
    2. El VFS ve que en `/usr` hay un FS montado y busca su **superbloque**.
    3. Busca `include/unistd.h` desde la raíz de ese FS.
    4. Crea un **nodo-v** en RAM con los datos del nodo-i y el puntero a las funciones del FS.
    5. Agrega una entrada en la **tabla de descriptores** y devuelve el descriptor.
    6. Cada `read`: descriptor → nodo-v → la función `read` del FS concreto.
  - Motivación original de Sun: **NFS** [[u4-nfs]].
  - 🔗 Es la **capa independiente del dispositivo** de la E/S: interfaz común arriba, «controladores» abajo [[u1-es]].

## Tema 7 — Administración del espacio en disco ★ {#u4-espacio}

> 📖 cap. 4.4.1, págs. 292–298 (figs. 4-20 a 4-24)
> 📄 Repaso U4, pág. 16 — "Tema 7 — Administración del espacio en disco"

- **Bloques fijos, no contiguos** — porque mover un archivo que crece es carísimo. 🔗 Es la decisión segmentación vs. paginación [[u3-pag-vs-seg]].
- **Tamaño de bloque (fig. 4-21)** — tiempo = búsqueda (5 ms) + media rotación (4,165 ms) + transferencia (k/1 MB × 8,33 ms): **~9,2 ms casi fijos** por acceso.
  - Bloque grande → **más rápido** (más bytes por acceso) pero **más desperdicio**; las curvas se cruzan cerca de 64 KB. **No hay tamaño ideal.** Históricamente 1–4 KB.
  - Mediciones (VU 2005): el 59 % de los archivos ≤ 4 KB, pero el 93 % de los bloques los usa el 10 % de los archivos más grandes.
  - 🔗 Es el compromiso del tamaño de página p = √(2se) [[u3-tamano]].
- **Fragmentación interna** {#u4-frag-interna}
  - 🔢 **Cuenta de fragmentación interna**
    1. n_llenos = tamaño div bloque.
    2. resto = tamaño − n_llenos × bloque.
    3. bloques = n_llenos + 1 (si resto > 0).
    4. disco = bloques × bloque.
    5. frag = bloque − resto (**contra el bloque/cluster, nunca contra el sector**).
  - **Práctica FAT32** — bloque 4 KB, sector 512 B, 3.712.518 B: **8 sectores por bloque**; BPB bytes por sector 512 = 0x0200 → **0x0B = 00, 0x0C = 02** (little-endian); 906 llenos, resto 1542 → **907 bloques = 3.715.072 B**, frag **2554 B**.
  - 📌 **Errata de la práctica**: «2580,48 B» sale de usar 0,37 × 4096 (decimal redondeado). Siempre el **resto exacto**.
  - ⚠️ En el control (cluster 8 KB, 1.000.000 B): sumé el resto encima de los 123 clusters (1.008.192 en vez de **1.007.616**) y medí la fragmentación **contra el sector** (448 en vez de **7616**). El FS asigna **clusters enteros**.
- **Registro de bloques libres (figs. 4-22, 4-23)** {#u4-libres}
  - **Lista enlazada** — bloques llenos de números de bloques libres (1 KB con números de 32 bits → **255 libres + 1 puntero**). Sus bloques **son bloques libres** (no cuestan).
  - **Mapa de bits** — **1 bit por bloque del disco**; tamaño **fijo**. Asignando desde un pedazo del mapa, los bloques quedan **cerca** (menos brazo).
  - ⚖️ 500 GB, bloques de 1 KB (488 M): lista ≈ **1,9 M bloques**, mapa ≈ **60.000**. La lista solo gana con el disco **casi lleno** (< ~3 % libre). Con 1 TB al 2 % libre: lista ≈ 84.200, mapa 131.072.
  - **Variante de series** — primer bloque + cantidad; buena con el disco poco fragmentado.
  - **Fig. 4-23** — tener en RAM un bloque de punteros **por la mitad**, para absorber altas y bajas de archivos temporales sin E/S.
- **Cuotas (fig. 4-24)** — cada bloque nuevo se le carga al **dueño**. Límite **suave** (se puede pasar en la sesión; advertencias al iniciar sesión; si se acaban, no entra) y **duro** (nunca; error). Límites también para la **cantidad de archivos**. 🔗 Por eso el duro sigue cobrando al dueño [[u4-duro]].

## Tema 8 — Respaldos, consistencia (fsck) y rendimiento {#u4-confiabilidad}

> 📖 cap. 4.4.2–4.4.5, págs. 298–312 (figs. 4-25 a 4-29)
> 📄 Repaso U4, pág. 19 — "Tema 8 — Respaldos, consistencia (fsck) y rendimiento"

- **Respaldos** {#u4-respaldos} — para el **desastre** y la **estupidez** (Papelera).
  - Qué decidir: no respaldar binarios reinstalables, temporales ni **`/dev`** (peligroso: se colgaría leyendo un dispositivo); **incrementales** (completo semanal + diario de lo cambiado; restaurar = completo + incrementales **en orden**); compresión (un error arruina todo); **sistema activo → instantáneas**; cintas **fuera del sitio**.
  - ⚖️ **Vaciado físico** (bloques 0…n: simple y rápido; no saltea directorios, no es incremental, no restaura un archivo suelto) vs. **lógico** (recorre el árbol desde una fecha base; incremental; restaura un archivo).
  - 🔢 **Vaciado lógico de UNIX (fig. 4-25)**, con un mapa de bits por nodo-i
    1. Marcar los archivos modificados y **todos** los directorios.
    2. Desmarcar los directorios sin nada modificado debajo.
    3. Vaciar los directorios marcados (con atributos).
    4. Vaciar los archivos marcados.
  - 📌 Se vacían directorios **no modificados** si están en el camino a algo modificado (para restaurar en un disco nuevo o un archivo suelto).
  - 📌 Al restaurar: la lista de libres **no se respalda** (se reconstruye), un archivo con varios vínculos se restaura **una vez**, los **huecos** no se restauran como ceros (core), los archivos especiales no se vacían [[u4-vinculos]].
- **Consistencia: fsck** {#u4-fsck} — `fsck` (UNIX) / `scandisk` (Windows), usando la **redundancia** del FS; cada partición por separado.
  - 🔢 **Consistencia de bloques**
    1. Tabla «en uso»: leer todos los nodos-i (dispositivo crudo) y sumar 1 por cada bloque que listan.
    2. Tabla «libres»: sumar 1 por cada aparición en la lista o el mapa.
    3. Para cada bloque, **uso + libres = 1**.
    4. Reparar y avisar.
  - Los casos (fig. 4-27): **0+0 faltante** → agregar a libres (solo desperdicio) · **0+2 duplicado en libres** → reconstruir la lista (**imposible con mapa de bits**) · **2 en uso, duplicado de datos** (el peor) → **copiar el contenido** a un bloque libre, dar la copia a uno de los archivos y **avisar** (uno tendrá basura) · **1 en uso + 1 libre** → **sacarlo de la lista de libres, nunca del archivo**.
    - 🧠 Reconstruir la lista como **complemento** de los bloques que usan los nodos-i arregla de un saque faltantes, duplicados en libres y «en uso y libre».
    - ⚠️ En el control: en el duplicado de datos me faltó **copiar el contenido y avisar**; en «en uso y libre» dije «ver cuál fue el paso reciente» (fsck **no tiene historial**). Y el mapa de bits evita **solo** el duplicado en libres.
  - **Consistencia de directorios** — un contador **por nodo-i**: cuántos directorios lo contienen (los duros suman, los simbólicos no) vs. la **cuenta de vínculos** del nodo-i.
    - Cuenta **>** entradas → nunca llega a 0, desperdicio. Cuenta **<** entradas → **catastrófico**: al borrar un nombre se libera y el otro queda apuntando a un nodo-i que se reasigna [[u4-journaling]]. Arreglo: **cuenta = entradas reales**.
    - También avisa: nodo-i fuera de rango, modos raros (0007), archivos de root con **SETUID** en directorios de usuarios [[u4-proteccion]].
- **Rendimiento** {#u4-cache-bufer}
  - **Caché de bloques (fig. 4-28)** — hash por dirección + lista doble en orden LRU. 🔗 Es reemplazo de páginas [[u3-reemplazo]]; el bit de modificado es el bit M [[u3-entrada]].
    - 📌 **LRU exacto acá sí se puede** (pocas referencias) **pero no conviene**: un bloque de nodos-i modificado quedaría mucho sin escribirse. **LRU modificado**: los bloques **esenciales para la consistencia** (todo menos datos) se escriben **apenas se modifican**; los que no se reusarán pronto van **al frente**.
    - ⚖️ **UNIX `sync` cada 30 s** (programa *update*; junta escrituras; se pierden hasta 30 s) vs. **write-through** (Windows histórico; cada bloque al disco ya; más E/S; sacar el disquete no rompe nada). Hoy `FlushFileBuffers` y NTFS con bitácora.
    - 🧠 Sacar un pendrive sin expulsar: los datos estaban **solo en la caché** y los metadatos pueden quedar **a medias**. **Expulsar = sync + desmontar.**
  - **Lectura adelantada** — traer k+1 al pedir k; **un bit por archivo abierto** (secuencial/aleatorio), cada `seek` lo apaga.
  - **Menos movimiento del brazo** — bloques cercanos (fácil con mapa de bits [[u4-libres]]); nodos-i **en el medio del disco** o **grupos de cilindros** (fig. 4-29) [[u4-ext2]].
  - **Desfragmentar** — `defrag`; no se mueven el archivo de paginación, el de hibernación ni la bitácora; ext2/ext3 casi no lo necesitan.
  - 🔗 La caché de búfer es otra instancia de la jerarquía y la localidad [[u3-idea-cache]].

## Tema 9 — Ejemplos: ISO 9660, MS-DOS, UNIX V7, NTFS y NFS {#u4-ejemplos}

> 📖 cap. 4.5, págs. 312–324 (figs. 4-30 a 4-35); 11.8, págs. 906–915; 10.6.4, págs. 796–803; 8.4.4, págs. 591–596
> 📄 Repaso U4, pág. 23 — "Tema 9 — Ejemplos: ISO 9660, MS-DOS, UNIX V7, NTFS y NFS"

- 📌 El resumen de la cátedra no cubre este tema; sale del libro.
- 🧠 **Dónde están los bloques / los libres**: ISO 9660 → **contiguo** / no se registran · MS-DOS → **FAT** / la misma FAT · V7 → **nodo-i** / lista libre · NTFS → **tiradas** en la MFT / mapa de bits.
- **ISO 9660 (CD-ROM)** — una sola escritura: **sin registro de libres**. Números binarios **dos veces** (little y big endian). Espiral, bloques de 2352 B con **2048 útiles**. 16 bloques libres + descriptor de volumen primario + raíz. Archivos **contiguos** (inicio + tamaño). Nombres 8+3;versión, mayúsculas. Máximo **8 niveles**; año 2156.
  - Niveles 1 (8+3, contiguo), 2 (31 caracteres), 3 (secciones). **Rock Ridge** (UNIX: PX permisos, PN, SL, NM, CL/PL/RE, TF) y **Joliet** (Microsoft: 64 Unicode, más de 8 niveles), en el campo «uso del sistema».
  - 📌 **Errata del libro**: dice «1998»; es **1988**.
- **MS-DOS / FAT** {#u4-msdos} — entrada fija de **32 B**: nombre 8 · ext 3 · atributos 1 · reservado 10 · hora 2 · fecha 2 · primer bloque 2 · tamaño 4. Atributos: solo lectura, **archivado** (lo usan los respaldos), oculto, sistema.
  - **Hora** = horas 5 · minutos 6 · **segundos/2** 5 → **±2 s**. **Fecha** = año−1980 7 · mes 4 · día 5 → último año **2107**.
  - Libres en **la misma FAT** (código especial) [[u4-fat]].
  - ⚖️ **FAT-12 / 16 / 32**: 12 bits (2–16 MB, disquetes) · 16 bits (hasta **2 GB** = 64K × 32 KB) · **28 bits** (1 TB con 4 KB; **tope 2 TB** = 2⁹ × 2³² por el tamaño de partición en sectores).
  - 📌 **FAT-32 tiene 28 bits, no 32.** Ejemplo 2 GB: FAT-16 obliga a 32 KB (archivos de 8 KB desperdician 3/4); FAT-32 usa 4 KB pero la FAT ocupa **2 MB** de RAM.
  - Control: 1 GB con FAT-16 → bloque mínimo **16 KB** (al límite), archivos de 2 KB → 87,5 %; FAT-32 con 4 KB → 256K × 4 B = **1 MB**, 50 %.
- **UNIX V7** — entrada **16 B** (nº de nodo-i 2 + nombre 14) → 64 K archivos por FS; nombres con cualquier ASCII salvo `/` y NUL; 10 directos + indirectos; búsqueda de `/usr/ast/mbox` [[u4-ruta-mbox]].
- **NTFS** {#u4-ntfs} — direcciones de **64 bits**, 255 Unicode, clusters de 512 B a 64 KB (casi siempre 4 KB). Un archivo es un **conjunto de atributos (flujos)**; los flujos extra se pierden al copiar.
  - **MFT** — registros de **1 KB**, pares (encabezado, valor). Valor corto **adentro** (archivo inmediato), largo **no residente**. La MFT **es un archivo**.
  - Bloques en **tiradas**: pares (dirección, longitud), p. ej. (20,4)(64,2)(80,3) = 9 bloques. Huecos → archivos dispersos.
  - Primeros 16 registros: 0 `$Mft`, 1 espejo, 2 **`$LogFile` (bitácora)** [[u4-journaling]], 5 raíz, 6 **`$Bitmap`**, 8 defectuosos, 9 `$Secure`.
- **NFS** {#u4-nfs} — el servidor **exporta** (`/etc/exports`), el cliente **monta** donde quiere: el mismo archivo puede llamarse distinto en cada cliente; el servidor no conoce el punto de montaje.
  - Dos protocolos: **montaje** (devuelve un **manejador**) y **acceso** (lookup, read, write).
  - ⚖️ **NFSv3 sin estado** (no hay open/close en el servidor; si cae y rearranca no se pierde nada; los bloqueos necesitan otro mecanismo) vs. **NFSv4 con estado** (admite open; el servidor guarda los archivos abiertos).
  - **nodo-v → nodo-i** (local) o **nodo-r** (remoto, el cliente NFS manda el mensaje) [[u4-vfs]]. Cachés con temporizadores (3 s datos, 30 s directorios).
  - **Semántica de sesión** — los demás ven los cambios **al cerrar**; gana el que cierra último (modelo de envío/descarga).
  - ⚖️ **Transparencia de localización** (la ruta no dice dónde está) ≠ **independencia de ubicación** (moverlo sin cambiar el nombre). El montaje remoto no tiene la segunda.
  - 📌 El «período de gracia» de NFSv4 es real pero **no está en el libro**.

## Tema 10 — Protección {#u4-proteccion}

> 📖 cap. 9.3, págs. 622–641 (figs. 9-4 a 9-15)
> 📄 Repaso U4, pág. 26 — "Tema 10 — Protección"

- 📌 El resumen de la cátedra no cubre este tema; sale del libro.
- **Dominio** — conjunto de pares **(objeto, derechos)**. **POLA**: cada dominio con lo mínimo necesario.
  - Fig. 9-4: Archivo1 en D1 (R) y D2 (RW), mismo objeto con derechos distintos; Impresora1 en D2 y D3 con los mismos.
  - **UNIX: dominio = (UID, GID).** Cambio de dominio: una **llamada al sistema** (usuario → kernel) [[u1-modos]] o un `exec` con **SETUID/SETGID**.
- **Matriz de protección** — filas = dominios, columnas = objetos. Cambio de dominio = dominios como objetos con el derecho **enter** (fig. 9-6). Es enorme y **casi vacía**: se guarda por columnas o por filas.
- **ACL (por columnas)** {#u4-acl} — cada **objeto** con su lista ordenada. Fig. 9-7: F1 = A: RW; B: R · F2 = A: R; B: RW; C: R · F3 = B: RWX; C: RX.
  - Grupos (roles): Tana escribe el archivo de contraseñas solo como **sysadm**. Comodín `tana, *: RW`.
  - 📌 **Gana la primera entrada que coincide, no la más específica**: `virgil, *: (nada); *, *: RW` deja afuera solo a Virgil; `*, alumnos: R; juan, *: RW` **no deja escribir a Juan**.
  - Revocar: editar la ACL. 📌 Si se revisa solo en `open`, un archivo **ya abierto conserva** los derechos.
- **Capacidades (por filas)** {#u4-capacidades} — cada **proceso** con su **lista-C** (objeto + mapa de bits de derechos).
  - Protegerlas: (1) **arquitectura etiquetada** (AS/400); (2) lista-C **en el SO**, usada por posición (como los **descriptores de archivo**; Hydra); (3) **cifradas** en espacio de usuario (Amoeba): (servidor, objeto, derechos, f(objeto, derechos, comprobación)), con f de una vía.
  - Derechos genéricos: copiar capacidad, copiar objeto, eliminar capacidad, destruir objeto.
- ⚖️ **ACL vs. capacidades** {#u4-acl-vs-cap}
  - Verificar: la ACL puede buscar mucho · la capacidad es inmediata.
  - Revocar: ACL **fácil y selectivo** · capacidades **difícil**; en Amoeba, cambiar la comprobación **invalida a todos** (hay que re-entregar a los que siguen).
  - Encapsular un proceso: fácil con capacidades. Objeto borrado: la ACL se va con él; las capacidades quedan colgadas.
  - 🧠 *«La ACL cuelga del archivo; la capacidad la lleva el proceso, como una llave.»*
  - Control: en una ACL **no se escribe** a quien no entra (solo celdas no vacías).
- **Sistemas confiables** — **TCB** = hardware y software mínimos que hacen cumplir la seguridad; **monitor de referencia** = todas las llamadas de seguridad pasan por él. 🧠 *Las características son enemigas de la seguridad.*
- **Modelos formales** — 6 primitivas de Harrison (create/delete object, create/delete domain, insert/remove right). Para un sistema arbitrario **no se puede probar** que nunca llegue a un estado no autorizado.
  - ⚖️ **Discrecional** (decide el dueño) vs. **obligatorio** (decide la organización).
- **Bell-La Padula (secreto)** {#u4-blp} — **no leer hacia arriba** (seguridad simple) · **no escribir hacia abajo** (propiedad *). La información solo sube.
  - ⚠️ Justifiqué «no escribir hacia abajo» con «me puedo equivocar». Es **fuga de información hacia abajo**: el modelo supone un proceso que puede ser malicioso (troyano).
- **Biba (integridad)** — al revés: **no escribir hacia arriba** · **no leer hacia abajo**. ⚖️ Los dos están **en conflicto directo**: un proceso Secreto escribiendo en Confidencial → BLP no, Biba sí.
- **Canales encubiertos** {#u4-canales} — modelo de Lampson (cliente, servidor, colaborador); **confinamiento**. Modular la CPU (con **Hamming**), la tasa de **paginación** [[u3-reemplazo]], el **bloqueo de un archivo** (fig. 9-15, 11010100), recursos, la factura.
  - 📌 **Ninguna matriz los puede evitar.** El programa dice «canales de **conversión**»: son los canales **encubiertos** (*covert channels*).
  - **Esteganografía** — Shakespeare en los bits bajos de una foto de cebras (1024 × 768 × 3 bits = 294.912 B); marcas de agua.

## Tema 11 — Linux: llamadas, VFS, ext2, ext3, /proc y comandos ★ {#u4-linux}

> 📖 cap. 10.6.1–10.6.3, págs. 779–796 (figs. 10-24 a 10-34) · Cartilla de comandos de la cátedra
> 📄 Repaso U4, pág. 30 — "Tema 11 — El sistema de archivos de Linux y los comandos de la cátedra"

- **Conceptos** — secuencia de bytes; 255 caracteres; extensiones = convención. Especiales de caracteres (`/dev/tty`) y de bloques (`/dev/hd1`, partición cruda: la usan `mkfs` y **fsck** [[u4-fsck]]). **Montaje** en un solo árbol.
  - **Bloqueo POSIX** — de un byte al archivo entero; **compartido** o **exclusivo**; elegir bloquearse o volver con error. Fig. 10-26: un exclusivo del byte 9 espera a **B y C**.
- **Llamadas** — `open` devuelve el **descriptor libre más chico**; `creat` trunca; read/write avanzan la posición; `stat` (dispositivo, nº de nodo-i, modo, vínculos, dueño, grupo, tamaño, 3 tiempos); `pipe`; `fcntl`; directorios: mkdir, rmdir (vacío), **link**, **unlink**, chdir, opendir/readdir.
  - 📌 **`lseek` nunca mueve el brazo**: solo cambia un número en memoria.
  - Descriptores 0, 1, 2 ya abiertos; el shell redirige antes de arrancar el programa. 🔗 Los pasos de `read` de la U1 [[u1-seq-read]].
- **VFS de Linux** — 4 objetos: **superbloque**, **nodo-i**, **dentry** (componente de ruta, en la *dentry_cache*), **file** (archivo abierto) [[u4-vfs]].
- **ext2** {#u4-ext2} — bloque 0 de arranque + **grupos de bloques**: superbloque · descriptor de grupo · **mapa de bits de bloques** · **mapa de bits de nodos-i** · nodos-i · datos [[u4-libres]].
  - Política: archivo en el **grupo de su directorio**, datos en el grupo de su nodo-i; **preasigna 8 bloques**. 🔗 Grupos de cilindros [[u4-cache-bufer]].
  - Nodo-i de 128 B; **raíz = nodo-i 2** (el 1, bloques defectuosos); **12 directos** + simple, doble, triple; **número de generación**.
  - Directorio (fig. 10-32): (nº de nodo-i, `rec_len`, tipo, longitud, nombre), sin ordenar; al borrar, el `rec_len` de la anterior **se agranda** y tapa la entrada.
  - Byte 300.000 → doble, entradas 0 y 24, 3 lecturas [[u4-ubicar-byte]]. Control: byte 20.000 → bloque 19, **simple, entrada 7, 2 lecturas**.
  - 📌 **Errata del libro**: «10 + 2¹⁶ bloques» mezcla los 10 directos de V7 con los 12 de Linux.
- **Las tres tablas (fig. 10-34)** ★★ {#u4-tres-tablas}
  - 🔢 **De un `read(fd, …)` al dato**
    1. **Tabla de descriptores** del proceso: fd → entrada de la tabla intermedia.
    2. **Tabla de descripción de archivos abiertos**: la **posición** y el modo.
    3. **Tabla de nodos-i**: un nodo-i por archivo abierto → los bloques.
  - Por qué la tabla del medio: con la posición **en el nodo-i**, procesos **no relacionados** la compartirían; con la posición **en el descriptor**, en `(p1; p2) > x` p2 heredaría una **copia** (0) y **pisaría** a p1.
  - 🧠 **`fork` comparte la posición; `open` no.** Dos `open` del mismo archivo, aunque sea en un proceso, dan dos posiciones.
  - Control: P abre y lee 100, `fork`, H lee 50, Q abre aparte y lee 10 → H desde **100**, Q desde **0**, P después desde **150**; tablas: **3 descriptores, 2 descripciones, 1 nodo-i**.
  - 🔗 Es lo que hereda el hijo en el `fork` de la U2 [[u2-fork]].
- **ext3** — ext2 + **bitácora** [[u4-journaling]]; compatible con ext2; registro como **búfer circular**; el **JBD** con registro del diario, **operación atómica** (todos los cambios de una llamada) y transacción. Registrar todo o **solo metadatos** (más rápido, no protege los datos).
- **/proc** — un directorio por PID; los archivos **no existen en el disco**, se generan al leerlos. 🔗 `/proc/PID/status` y `/proc/meminfo` [[u3-linux]].
- **Comandos de la cátedra** {#u4-comandos}
  - `cat /proc/mounts`, `mount`, `findmnt` → lo montado **ahora**.
  - **`/etc/fstab`** — 6 columnas: **dispositivo/UUID · punto de montaje · tipo · opciones · dump · pass** (orden de fsck: 1 raíz, 2 el resto, 0 no se revisa).
    - 📌 **fstab dice qué se monta al arrancar, no qué está montado ahora.** `noauto` → no se monta al arrancar (se monta con `mount /punto`).
    - Ejemplo de la cátedra: `UUID=xxxx-xxxx /home ext4 defaults 0 2`.
  - `lsblk -f` — NAME, FSTYPE, FSVER, LABEL, UUID, FSAVAIL, FSUSE%, MOUNTPOINTS.
  - 🔢 **La práctica de la imagen de disco**
    1. `dd if=/dev/zero of=mi_imagen.img bs=1M count=100` (100 MB de ceros, todavía no es un FS).
    2. `mkfs.ext4 mi_imagen.img`.
    3. `sudo mkdir /mnt/mi_imagen` y `sudo mount -o loop mi_imagen.img /mnt/mi_imagen` (**loop**: un archivo como dispositivo de bloques).
    4. `df -h | grep mi_imagen`.
    5. `sudo umount /mnt/mi_imagen` (hace sync [[u4-cache-bufer]]).
    6. Copia `sudo cp /etc/fstab /etc/fstab.bak` y agregar la línea con `… | sudo tee -a /etc/fstab`.
    7. `sudo mount -a` para probar.
  - `ln orig duro` · `ln -s orig simb` [[u4-vinculos]].
  - 📌 **Fuera del material**: ext4, xfs, btrfs y zfs por dentro, y el comando para ver el tamaño de bloque (complemento: `sudo tune2fs -l /dev/sdXN` o `stat -f /punto`).

## Cierre de la U4 y lo que más se toma {#u4-examen}

> 📄 Repaso U4, pág. 33 — "Cierre de la Unidad 4"

- **Los 8 puntos**
  1. **Archivo** como abstracción del disco; rutas absolutas y relativas [[u4-archivos]] [[u4-rutas]].
  2. **Asignación**: contigua, enlazada, FAT (contar clusters, no saltos) [[u4-asignacion]] [[u4-fat]].
  3. **Nodos-i**: (D + P + P² + P³)·B y las lecturas por nivel [[u4-nodoi]] [[u4-ubicar-byte]].
  4. **Vínculos**: el duro cuenta, el simbólico apunta [[u4-duro]] [[u4-simbolico]].
  5. **Consistencia**: bitácora + idempotencia; fsck de bloques y directorios [[u4-journaling]] [[u4-fsck]].
  6. **Espacio**: frag = bloque − resto; mapa de bits vs. lista [[u4-frag-interna]] [[u4-libres]].
  7. **Protección**: ACL vs. capacidades, primera entrada que coincide, Bell-La Padula vs. Biba, canales encubiertos [[u4-acl-vs-cap]] [[u4-blp]] [[u4-canales]].
  8. **Linux**: ext2, las 3 tablas, ext3, fstab [[u4-ext2]] [[u4-tres-tablas]] [[u4-comandos]].
- **Lo que más se toma**
  - ★★★ **Cadena FAT**: clusters, espacio y desperdicio [[u4-fat]].
  - ★★★ **Nodo-i**: tamaño máximo, bloques índice y en qué nivel cae un byte [[u4-nodoi]].
  - ★★ **Fragmentación interna en FAT32** (sectores por bloque, BPB, resto exacto) [[u4-frag-interna]].
  - ★★ **Tablas de fsck** [[u4-fsck]] · **duro vs. simbólico** [[u4-vinculos]] · **3 tablas** con `fork` y `open` [[u4-tres-tablas]].
  - ★ ACL vs. capacidades y Bell-La Padula vs. Biba [[u4-proteccion]] · una línea de **fstab** [[u4-comandos]].
- **Simuladores de la unidad** (en `unidades/u04-archivos/visuales/`) — `fat.html`, `inodos.html`, `vinculos_rutas.html`, `bitacora.html`, `espacio_disco.html`, `fsck.html`, `ejemplos_fs.html`, `proteccion.html`, `tres_tablas.html`.
