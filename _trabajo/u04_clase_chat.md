

<<<<<< MENSAJE 0 >>>>>>

# Unidad 4: Sistemas de archivos

## Mapa de la unidad

La pregunta que recorre la unidad: **¿cómo guardamos información que sobreviva al proceso, en un disco que solo sabe «leer el bloque k» y «escribir el bloque k»?**

```
 PUNTO DE VISTA DEL USUARIO                PUNTO DE VISTA DEL IMPLEMENTADOR
 ──────────────────────────                ────────────────────────────────
 1. Archivos (nombres, tipos,      ┌──►  3. Distribución del disco y asignación:
    acceso, atributos, operaciones)│        contigua · lista enlazada · FAT ★
        │                          │     4. i-nodos y bloques indirectos ★
 2. Directorios y rutas ───────────┘     5. Directorios por dentro + vínculos
                                            duros y simbólicos ★
                                         6. Bitácora, transacciones y VFS
                                                │
                    ┌───────────────────────────┘
                    ▼
 7. Espacio en disco: tamaño de bloque, bloques libres, fragmentación ★
 8. Confiabilidad y rendimiento: respaldos, fsck, caché
 9. Ejemplos reales: CD-ROM, MS-DOS/FAT, UNIX V7, NTFS, NFS
10. Protección: dominios, ACL, capacidades, canales encubiertos
11. Caso Linux: open/read/write/lseek, ext2/ext3, comandos (fstab, lsblk, ln)
```

Los ★ son lo que más se toma en los exámenes de la cátedra:
- **FAT**: seguir la cadena y calcular el espacio ocupado.
- **i-nodos**: tamaño máximo de un archivo y cuántos bloques de índice usa.
- **Fragmentación interna**.

Para los tres te voy a armar simuladores.

🔗 La unidad repite muchas ideas de la U3: bloques fijos ↔ páginas, asignación contigua ↔ segmentación, caché de búfer ↔ reemplazo de páginas. Te las voy marcando.

---

## Tema 1 de 11: Archivos

### La intuición

El disco «crudo» es un depósito gigante de cajas numeradas: «dame la caja 48.211». Nadie quiere trabajar así.

El SO te da **carpetas con etiquetas** («informe.docx»). Por debajo se encarga de saber en qué cajas está cada cosa, quién puede abrirla y qué cajas están libres.

### Por qué no alcanza la memoria (pág. 255)

Guardar los datos dentro del espacio de direcciones del proceso falla por **tres razones**:
1. **No entra**: el espacio de direcciones es limitado.
2. **Se pierde** cuando el proceso termina.
3. **No se comparte**: varios procesos necesitan la misma información al mismo tiempo.

De ahí salen los **tres requisitos** del almacenamiento a largo plazo: mucha capacidad, **persistencia** y **acceso concurrente**.

> **Archivo:** unidad lógica de información creada por los procesos, **independiente de ellos** y **persistente** (desaparece solo si el dueño la borra).
> **Sistema de archivos:** la parte del SO que estructura, nombra, accede, usa, protege e implementa los archivos.

🧠 Es la tercera abstracción del SO: **proceso** (de la CPU, U2), **espacio de direcciones** (de la RAM, U3) y **archivo** (del disco, U4).

### Lo que ve el usuario

| Aspecto | Lo clave |
|---|---|
| **Nombres** | hasta 255 caracteres. La extensión es una **convención en UNIX** (`prog.java.gz` vale); en **Windows tiene significado**: asocia el archivo con un programa |
| **Estructura** | (a) **secuencia de bytes** (UNIX y Windows: el SO no interpreta nada); (b) secuencia de registros fijos (mainframes viejos); (c) **árbol de registros con llave** (mainframes comerciales) |
| **Tipos** | regulares (ASCII o binarios), directorios, especiales de **caracteres** (terminal, impresora) y de **bloques** (discos) |
| **Acceso** | **secuencial** (cinta) o **aleatorio** (disco). UNIX y Windows usan **seek + read** |
| **Atributos** (metadatos) | protección, propietario, banderas (solo lectura, oculto, archivo, temporal), fechas de creación, acceso y modificación, tamaño |

**Fig. 4-3, el ejecutable de UNIX:** aunque es «una secuencia de bytes», el SO **exige un formato**. Tiene encabezado (con el **número mágico**, tamaños y dirección de inicio), texto, datos, bits de reubicación y tabla de símbolos. Si no tiene ese formato, no lo ejecuta.

### Las operaciones (llamadas al sistema, pág. 264)

```
 create ─► open ─► read / write / append / seek ─► close ─► delete
                   get/set attributes · rename
```
- **open** trae a memoria los **atributos y la lista de direcciones de disco**, y por eso los accesos siguientes son rápidos.
- **close** libera las tablas y **fuerza la escritura del último bloque**.
- **write en el medio** del archivo sobrescribe; **al final**, el archivo crece.

### Ejemplo: `copyfile abc xyz` (fig. 4-5)

```c
ent = open("abc", O_RDONLY);         // descriptor de archivo (entero chico)
sal = creat("xyz", 0700);            // crea y abre para escribir
while ((n = read(ent, buf, 4096)) > 0)   // n = bytes leídos; 0 = fin; <0 = error
    write(sal, buf, n);              // escribe EXACTAMENTE lo que leyó
close(ent); close(sal);
```
🔗 **U1:** son las mismas llamadas al sistema de la U1 (TRAP, modo kernel). Y el **descriptor de archivo**, el entero chico que devuelve `open`, ya lo viste en la U2: es lo que hereda el hijo en un `fork`.

📖 *Tanenbaum 4.1, págs. 255–268 · Resumen de la cátedra U4, págs. 1–8.*

---

### Preguntas rápidas

**1.** Un compañero dice: *«En UNIX, si a un ejecutable le cambio la extensión a `.txt`, el sistema ya no lo puede ejecutar.»* ¿Tiene razón? ¿Y en Windows, qué cambiaría si hacés doble clic?

**2.** En `copyfile`, ¿por qué se hace `write(sal, buf, n)` con **n** y no directamente con 4096? ¿Qué pasaría con el archivo copia si se usara 4096?

<<<<<< MENSAJE 1 >>>>>>

Es larga, pero menos pesada que la U3. También son 11 temas; la diferencia es que acá hay pocas cuentas y casi todas son del mismo tipo (FAT, i-nodos y fragmentación).

| Temas | Peso |
|---|---|
| 1 Archivos · 2 Directorios | 🟢 cortos, casi todo vocabulario |
| 3 Asignación y FAT ★ · 4 i-nodos ★ | 🔴 lo que más se toma; llevan ejercicios |
| 5 Vínculos duros y simbólicos ★ | 🟡 medio; se toma seguido |
| 6 Bitácora y VFS | 🟢 corto, conceptual |
| 7 Espacio en disco y fragmentación ★ | 🟡 medio, con cuentas |
| 8 Respaldos, fsck y caché | 🟡 medio; fsck tiene un ejercicio lindo |
| 9 Ejemplos (MS-DOS, V7, NTFS, NFS) | 🟡 largo pero liviano: repasa lo anterior |
| 10 Protección | 🟡 medio, conceptual |
| 11 Linux y comandos | 🟢 corto; los comandos se toman |

**Estimación:** unas **10 a 12 horas**, es decir **3 o 4 días a unas 3 horas por día**. La U3 llevó cerca de 15.

**Con el calendario:** el plan del 9/11 ponía la U4 y la U5 entre el 15 y el 19/11. Hoy es 13 y ya preparamos la U4, así que vamos un poco adelantados. Si terminás la U4 alrededor del **16/11**, quedan tres días para la U5 sin tocar el resto del plan.

Cuando quieras, respondé las dos preguntas del tema 1:

1. Si a un ejecutable de UNIX le cambiás la extensión a `.txt`, ¿se puede seguir ejecutando? ¿Y en Windows, qué pasa con el doble clic?
2. En `copyfile`, ¿por qué se usa `write(sal, buf, n)` con **n** y no con 4096?

<<<<<< MENSAJE 2 >>>>>>

# Corrección del tema 1

**1. ✅ Correcta, con un detalle que falta.** En UNIX la extensión es **solo parte del nombre**, una convención.

Para nota completa, decí **qué decide** si se ejecuta:
- el **bit de permiso de ejecución** (`x`);
- y el **formato del archivo**: el encabezado empieza con el **número mágico** (fig. 4-3). El SO mira el contenido, no el nombre.

En Windows, con doble clic sobre `programa.txt` **no se ejecuta**: se abre con el programa asociado a `.txt` (el Bloc de notas), que muestra **basura binaria**.

**2. ✅ Correcta.** El último `read` casi nunca trae 4096 bytes: trae lo que queda. Con 4096, la copia quedaría **más grande que el original** (redondeada a un múltiplo de 4096), con **basura** al final, lo que haya quedado en el búfer de la vuelta anterior.

---

## Tema 2 de 11: Directorios

### La intuición

Un directorio es una **guía telefónica**: asocia un **nombre** con «dónde está el archivo». Al principio había una sola guía para todos; después cada uno tuvo la suya, con secciones y subsecciones (un árbol).

### Los dos modelos (págs. 268–269)

```
 UN SOLO NIVEL (fig. 4-6)            JERÁRQUICO (fig. 4-7)
   [ raíz ]                             [ raíz ]
   ├ A: notas                         ┌────┼────┐
   ├ A: tp                           [A]  [B]  [C]
   ├ B: tp   ← ¡choca con A!          │         ├ proy1/
   └ C: foto                          tp        └ foto
```

| | Un solo nivel | Jerárquico |
|---|---|---|
| **+** | simplísimo, búsqueda rápida | cada usuario se organiza por temas o proyectos; los nombres no chocan |
| **−** | no escala; dos usuarios no pueden usar el mismo nombre | más complejo |
| Uso | CDC 6600, primeras PC; hoy **cámaras y reproductores** | casi todos los SO modernos |

### Nombres de rutas (págs. 269–272)

- **Ruta absoluta**: desde la raíz, por ejemplo `/usr/ast/mailbox`. **Empieza con el separador** y es única. El separador es `/` en UNIX, `\` en Windows y `>` en MULTICS.
- **Ruta relativa**: desde el **directorio de trabajo** (actual). Si estás en `/usr/ast`, alcanza con `mailbox`.
- **Cada proceso tiene su propio directorio de trabajo.** Por eso un procedimiento de biblioteca que lo cambia **tiene que devolverlo** antes de terminar.
- **`.`** es el directorio actual y **`..`** es el padre. En la raíz, `..` apunta a la raíz misma.

**Ejemplo (fig. 4-8):** estás en `/usr/ast` y querés el diccionario `/usr/lib/dictionary`.
```
 /                       cp ../lib/dictionary .
 ├ bin                       │  │   │         └ "." = acá (/usr/ast)
 ├ usr ◄──── ".." sube acá   │  │   └ el archivo
 │  ├ ast  ◄── estás acá     │  └ baja a lib
 │  ├ jim                    └ sube a /usr
 │  └ lib
 │     └ dictionary
```
Estas tres formas hacen exactamente lo mismo:
- `cp ../lib/dictionary .`
- `cp /usr/lib/dictionary dictionary`
- `cp /usr/lib/dictionary /usr/ast/dictionary`

### Operaciones de directorios en UNIX (págs. 272–273)

| Llamada | Qué hace | Ojo |
|---|---|---|
| `create` | crea el directorio | ya trae `.` y `..` |
| `delete` | lo borra | **solo si está vacío** (con solo `.` y `..` cuenta como vacío) |
| `opendir` / `readdir` / `closedir` | leer el contenido | `readdir` devuelve una entrada en **formato estándar**: el programa no necesita conocer la estructura interna |
| `rename` | cambia el nombre | |
| **`link`** | el mismo archivo aparece en **otro directorio** | **sube el contador del i-nodo** → «vínculo duro» |
| **`unlink`** | borra una entrada | si era la última, el archivo **desaparece**. **En UNIX, borrar un archivo ES `unlink`** |

**El vínculo simbólico** es un archivo chico que contiene **una ruta** a otro archivo. Puede cruzar discos y apuntar a otra máquina, pero es un poco más lento. Lo vemos a fondo en el tema 5.

🔗 **U2:** el directorio de trabajo es parte del estado del proceso: el hijo lo **hereda** en el `fork`, y si después lo cambia (`cd`), **el padre no se entera**. Por eso `cd` tiene que ser un comando **interno del shell**: si fuera un programa aparte, cambiaría el directorio de un hijo que muere enseguida.

📖 *Tanenbaum 4.2, págs. 268–273 · Resumen de la cátedra, págs. 8–12.*

---

### Preguntas rápidas

**1.** Estás en `/home/ana/tp`. Escribí la ruta **relativa** y la **absoluta** para llegar a `/home/luis/notas.txt`.

**2.** V o F, justificá: *«`rmdir` no me deja borrar un directorio que solo tiene las entradas `.` y `..`, porque no está vacío.»*

<<<<<< MENSAJE 3 >>>>>>

# Corrección del tema 2

**1. ✅ Correcta.** Las dos rutas están bien:
- absoluta: `/home/luis/notas.txt`
- relativa: `../../luis/notas.txt`

⚠️ En el paso 3 escribiste «`/luis/notas.txt`». La ruta final que diste está bien, pero ojo en el examen: si después de los `..` ponés una barra al principio, deja de ser relativa. **Toda ruta que empieza con `/` es absoluta** y arranca desde la raíz, así que `/luis/notas.txt` buscaría una carpeta `luis` colgada de `/`.

**2. ✅ Falso es lo correcto.** Te armo la justificación para que la tengas lista:

> Para UNIX, un directorio que solo tiene `.` y `..` **está vacío**. Esas dos entradas las crea el propio sistema al hacer `mkdir`, y existen en **todo** directorio: `.` apunta a sí mismo y `..` al padre. No son contenido del usuario, sino parte de la estructura del árbol. Por eso un directorio en UNIX **nunca tiene cero entradas**, y «vacío» quiere decir «sin entradas aparte de `.` y `..`». `rmdir` lo borra sin problema, y las dos entradas desaparecen con él.

Lo que `rmdir` sí rechaza es un directorio con **cualquier otra entrada**, aunque sea un archivo oculto como `.bashrc`. Ahí responde *«Directory not empty»* y hay que usar `rm -r`, que borra recursivamente.

🧠 **Regla para recitar:** «vacío = solo `.` y `..`».

📖 *Tanenbaum 4.2.6, pág. 272: «Sólo se puede eliminar un directorio vacío. Un directorio que sólo contiene a punto y punto-punto se considera vacío, ya que por lo general éstos no se pueden eliminar».*

---

Con esto cerramos **la parte del usuario** (archivos y directorios). Lo que viene es lo más pesado de la unidad, y lo que más se toma en examen: el **tema 3, cómo se guardan los archivos en el disco**. Vemos la distribución de la partición (MBR, superbloque…) y la asignación contigua, por lista enlazada y con **FAT**, con un simulador para seguir cadenas de clusters.

Cuando quieras, decime **«seguí»**.

<<<<<< MENSAJE 4 >>>>>>

Estoy preparando el tema 3: ya leí el libro y el apunte, y ahora armo el simulador de FAT.

<<<<<< MENSAJE 5 >>>>>>

Encontré el ejercicio de final de la cátedra con la tabla FAT (FAT32, bloques de 256 B, arranca en el cluster 4). Lo amplío para leer la tabla.

<<<<<< MENSAJE 6 >>>>>>

Ahora escribo el simulador.

<<<<<< MENSAJE 7 >>>>>>

Ahora la verificación del motor y del HTML en el navegador.

<<<<<< MENSAJE 8 >>>>>>

El simulador pasó todas las pruebas (14 del motor y 12 en Chrome). Ahora lo enlazo en el índice y en la pestaña 🎛.

<<<<<< MENSAJE 9 >>>>>>

# Tema 3 de 11: Cómo se guardan los archivos en el disco

Hasta acá miramos el sistema de archivos **desde el usuario** (nombres, rutas, operaciones). Ahora lo miramos **desde quien lo implementa**: dónde va cada cosa en el disco y cómo se sabe **qué bloques son de qué archivo**.

### Parte A: cómo está repartido el disco (fig. 4-9, pág. 274)

```
 DISCO COMPLETO
 ┌─────┬────────────────┬────────────────┬──────────────┐
 │ MBR │  Partición 1   │  Partición 2   │ Partición 3  │
 └──┬──┴───────┬────────┴────────────────┴──────────────┘
    │          ▼  (una partición por dentro)
    │  ┌──────────┬───────┬────────────┬────────┬──────┬───────────────┐
    │  │ Bloque de│ Super │ Espacio    │ Nodos-i│ Dir. │ Archivos y    │
    │  │ arranque │ bloque│ libre      │        │ raíz │ directorios   │
    │  └──────────┴───────┴────────────┴────────┴──────┴───────────────┘
    └─ sector 0: código de arranque + TABLA DE PARTICIONES (una marcada ACTIVA)
```

**El arranque, en orden:**
1. El **BIOS** lee y ejecuta el **MBR** (sector 0 del disco).
2. El MBR busca en la tabla la **partición activa**.
3. Lee el **bloque de arranque** de esa partición y lo ejecuta.
4. Ese bloque **carga el SO** que está en la partición.

Todas las particiones empiezan con un bloque de arranque, aunque no tengan SO: así quedan uniformes, y además podrían tener uno en el futuro.

| Pieza | Qué guarda |
|---|---|
| **Superbloque** | Los parámetros clave del sistema de archivos: **número mágico** (qué tipo de sistema de archivos es), cantidad de bloques y otros datos administrativos. **Se lee a RAM** al arrancar o al montar. |
| Espacio libre | Un **mapa de bits** o una **lista de apuntadores** (tema 7) |
| Nodos-i | Un arreglo con **un nodo-i por archivo** (tema 4) |
| Directorio raíz | La punta del árbol |

🔗 **U1:** esto es el «sector de booteo» que viste en el arranque. Lo nuevo es lo que hay **dentro de la partición**.

---

### Parte B: los métodos de asignación (págs. 274–278)

El problema central es este: el archivo `tp.c` ocupa 5 bloques, **¿cuáles?**

#### 1) Asignación contigua: «todos juntos, uno al lado del otro»

```
 (a) bloque: 0  1  2  3  4  5  6  7  8  9 10 11 12 ...
             [A][A][A][A][B][B][B][B][B][B][C][C][C]...

 (b) se borran D y F:  ...[ E ][░ 5 libres ░][ G ][░ 6 libres ░]...
                                  └─ huecos: FRAGMENTACIÓN EXTERNA
```

- El directorio guarda **dos números**: el primer bloque y la cantidad. El bloque *k* está en **inicio + k**.
- **+** Muy simple. **+** Lectura excelente: **una sola búsqueda** y después todo seguido.
- **−** Al borrar quedan huecos, y compactar es carísimo. **−** Hay que saber el **tamaño final al crear** el archivo: imaginate un editor que te pregunte cuántos bytes va a tener tu documento.
- **Hoy se usa en CD-ROM y DVD**: se escriben una sola vez y los tamaños se conocen de antemano. En DVD, UDF limita los archivos a 1 GB, así que una película se guarda en 3 o 4 **fragmentos** contiguos.

🔗 **U3:** es el mismo problema de la **segmentación** y el **tablero de ajedrez**: huecos, fragmentación externa y compactación.

#### 2) Lista enlazada: «cada bloque dice cuál sigue»

```
 Archivo A:  [4|→7] → [7|→2] → [2|→10] → [10|→12] → [12|FIN]
               ▲ la primera palabra de cada bloque es el puntero
```

- El directorio guarda **solo el primer bloque**.
- **+** No hay fragmentación externa: sirve **cualquier** bloque libre. Solo queda la interna, en el último bloque.
- **−** El **acceso aleatorio es lentísimo**: para llegar al bloque *n* hay que **leer del disco** los *n−1* anteriores.
- **−** Lo que queda para datos ya **no es potencia de 2**, porque el puntero ocupa unos bytes. Leer «un bloque lógico» obliga a juntar pedazos de dos bloques físicos.

#### 3) FAT: «sacar los punteros a una tabla en RAM»

Se toman los punteros de la lista enlazada y se ponen en un arreglo en memoria con **una entrada por bloque**: la **FAT** (*File Allocation Table*).

```
 FAT (fig. 4-12)         Lectura: «FAT[c] = el bloque que SIGUE a c»
  0 │       │
  1 │       │            Archivo A empieza en 4:
  2 │  10   │              4 → FAT[4]=7 → FAT[7]=2 → FAT[2]=10
  3 │  11   │                → FAT[10]=12 → FAT[12]=−1  FIN
  4 │   7   │ ◄─ A         = 5 bloques: 4, 7, 2, 10, 12
  5 │       │
  6 │   3   │ ◄─ B         Archivo B empieza en 6:
  7 │   2   │              6 → 3 → 11 → 14 → FIN
 10 │  12   │              = 4 bloques
 11 │  14   │
 12 │  −1   │
 14 │  −1   │
```

- **+** El bloque **entero** queda para datos.
- **+** El acceso aleatorio mejora: igual hay que seguir la cadena, pero **en RAM**, sin ir al disco.
- **+** El directorio sigue guardando **un solo entero**: el primer bloque.
- **−** **Toda la tabla tiene que estar en RAM, siempre.** Con un disco de 200 GB y bloques de 1 KB son 200 millones de entradas: entre **600 y 800 MB** de RAM, según sean de 3 o 4 bytes. **No escala.**

🔗 **U3:** es el mismo drama que la **tabla de páginas grande**: una entrada por bloque del recurso, aunque casi todo esté sin usar. El nodo-i (tema 4) lo resuelve como la tabla invertida: solo ocupa RAM lo que está en uso.

---

### Ejemplo resuelto: el ejercicio de **final de la cátedra** ★

Lo encontré en la práctica: *«FAT32 con bloques de 256 bytes. La entrada de directorio dice que el archivo empieza en el cluster 4. a) ¿En qué cluster termina? (5 p) b) ¿Qué espacio ocupa en disco? (15 p)»*

La tabla es de 5×5 y **se numera fila por fila, de 0 a 24**:

```
          col0  col1  col2  col3  col4
 0–4   :    0    22    71     8   [9]   ← entrada 4 = 9
 5–9   :   23    13   [FF]    4   [24]
 10–14 :  [21]   FF    FF    11   [16]
 15–19 :    6   [10]    0    FF    21
 20–24 :    0   [7]    FF    FF   [14]
```

| Paso | Cluster actual *c* | FAT[*c*] | Bloque lógico |
|---|---|---|---|
| 1 | **4** (dato del directorio) | 9 | 0 |
| 2 | 9 | 24 | 1 |
| 3 | 24 | 14 | 2 |
| 4 | 14 | 16 | 3 |
| 5 | 16 | 10 | 4 |
| 6 | 10 | 21 | 5 |
| 7 | 21 | 7 | 6 |
| 8 | **7** | **FF → FIN** | 7 |

- **a)** Termina en el **cluster 7**.
- **b)** **8 clusters × 256 B = 2048 bytes.**

⚠️ **Dos trampas de este ejercicio:**
1. «¿En qué cluster termina?» se responde con el **número de entrada que contiene FF** (el 7), no con «FF».
2. Se cuentan **clusters, no saltos**. Hay 7 flechas pero **8 clusters**: el que tiene FIN **también tiene datos**.

Los valores sueltos que no están en la cadena (22, 71, 8, el 21 de la entrada 19…) son **ruido para distraer**: no los mires.

### 🎛 Simulador: [fat.html](unidades/u04-archivos/visuales/fat.html) (ya te lo abrí)

- Arranca con **el ejercicio del final** cargado. Con «Siguiente paso» ves la línea de código que se ejecuta, la entrada de la FAT resaltada y el bloque lógico de cada cluster.
- Si cargás el **tamaño real** del archivo, calcula la fragmentación interna. Si cargás un **byte**, te dice en qué cluster cae, comparando **1 lectura de disco con FAT** contra ***k*+1 lecturas con lista enlazada**.
- También trae la fig. 4-12 (A y B), una **cadena rota** y un **ciclo**. Esos dos los retomamos en el tema 8 con `fsck`.
- Abajo están los **tres métodos en paneles** con sus + y −.

Ideas clave:
- **Espacio = clusters de la cadena × tamaño de cluster**, siempre en clusters enteros.
- ⚠️ El cluster con FIN **se cuenta**.
- 🧠 La FAT arregla las **dos** desventajas de la lista enlazada, pero cobra con **RAM**.
- 🧠 La contigua es la única que **lee de un tirón**, y por eso vive en los CD y DVD.

📖 *Tanenbaum 4.3.1–4.3.2, págs. 273–278 · Resumen de la cátedra, págs. 12–14 · Práctica, ejercicio 3 del final.*

---

### Preguntas rápidas

**1. (Estilo final)** FAT con clusters de **512 B**. El archivo empieza en el **cluster 3**. La tabla, desde la entrada 0, es:

```
 entrada:  0   1   2   3   4   5   6   7   8   9  10  11
 valor  :  0   8  FF   6   0   2  11  FF   7   0   5  10
```
- a) ¿En qué cluster termina?
- b) ¿Cuánto espacio ocupa en disco?
- c) Si el archivo mide en realidad 2900 bytes, ¿cuánta fragmentación interna hay?

**2.** Un compañero dice: *«Con FAT, leer el byte 1.000.000 de un archivo es tan lento como con lista enlazada, porque igual hay que recorrer la cadena desde el principio.»* ¿Tiene razón? Justificá en qué sí y en qué no.

<<<<<< MENSAJE 10 >>>>>>

# Corrección del tema 3

**1. ✅ Las tres bien.**
- a) Termina en el **cluster 2**.
- b) **3072 B**.
- c) **172 B**.

⚠️ En el examen, **mostrá la cadena**. En el final de la cátedra la parte b) vale 15 puntos, y sin el desarrollo un número suelto puede quedar como «parcial». Escribilo así:

```
3 → FAT[3]=6 → FAT[6]=11 → FAT[11]=10 → FAT[10]=5 → FAT[5]=2 → FAT[2]=FF (FIN)
Clusters: 3, 6, 11, 10, 5, 2  →  6 clusters
Espacio = 6 × 512 = 3072 B
Frag. interna = 3072 − 2900 = 172 B   (⌈2900/512⌉ = 6 ✔ coincide con la cadena)
```

Esa última verificación (que ⌈tamaño / cluster⌉ dé la misma cantidad de clusters que la cadena) es un control rápido de que leíste bien la tabla.

**2. ✅ Correcta en la idea.** Para nota completa, poné el **costo** concreto:

| | Recorrer la cadena | Leer el dato | Total de accesos a disco |
|---|---|---|---|
| **Lista enlazada** | hay que **leer del disco** cada bloque anterior | — | con bloques de 1 KB, el byte 1.000.000 está cerca del bloque 980 → **~980 lecturas** |
| **FAT** | ~980 consultas **en RAM** | 1 lectura | **1 lectura** |

Así que el compañero tiene razón en que **hay que seguir la cadena desde el principio** en los dos casos (la FAT no da acceso directo como la contigua). Se equivoca en lo de «igual de lento»: un acceso a RAM tarda **nanosegundos** y uno a disco **milisegundos**, alrededor de un millón de veces más.

🔗 **U1:** es la jerarquía de memoria; la diferencia la hace **dónde** está la cadena.

---

El próximo es el **tema 4: nodos-i** ★, el otro ejercicio fijo del final: bloques directos, indirectos simple, doble y triple, el tamaño máximo de un archivo y cuántos bloques índice necesita. Te armo una calculadora y un simulador.

Decime **«seguí»** cuando quieras.

<<<<<< MENSAJE 11 >>>>>>

Ahora armo el gráfico del i-nodo: calculadora de tamaño máximo, conteo de bloques índice y ubicación de un byte paso a paso.

<<<<<< MENSAJE 12 >>>>>>

Las pruebas pasan. Saco una captura para revisar que el árbol se vea bien.

<<<<<< MENSAJE 13 >>>>>>

Funciona, pero las cajas encendidas no se pintan de amarillo, porque el color inline les gana. Lo corrijo y agrego en el árbol el número de entrada de cada bloque índice.

<<<<<< MENSAJE 14 >>>>>>

Ahora se ve bien. Lo enlazo y lo abro.

<<<<<< MENSAJE 15 >>>>>>

# Tema 4 de 11: Nodos-i ★

### La intuición

La FAT es **una agenda gigante para todo el edificio**: aunque vos solo busques tu departamento, la agenda entera tiene que estar sobre la mesa.

El nodo-i es **una ficha por archivo**: cuando abrís un archivo, sacás *su* ficha del cajón y la ponés sobre la mesa. Las demás quedan guardadas.

### El concepto (fig. 4-13, págs. 279–280)

Cada archivo tiene **un nodo-i** (nodo índice) con dos cosas:
- **Los atributos**: tamaño, dueño, grupo, permisos, tres tiempos y el **contador de vínculos**.
- **Las direcciones de disco** de sus bloques.

```
        NODO-I (fig. 4-34, UNIX)
 ┌──────────────────────────┐
 │ atributos                │
 │ (tamaño, dueño, permisos,│
 │  tiempos, nº de vínculos)│
 ├──────────────────────────┤
 │ dirección 0  ────────────┼──► [dato]
 │ dirección 1  ────────────┼──► [dato]       D DIRECTOS
 │   ...                    │                 (V7: 10 · ext2: 12)
 │ dirección D−1 ───────────┼──► [dato]
 ├──────────────────────────┤
 │ indirecto SIMPLE ────────┼──► [P direcciones] ──► P datos
 │ indirecto DOBLE  ────────┼──► [P dir.] ──► P × [P dir.] ──► P² datos
 │ indirecto TRIPLE ────────┼──► [P] ──► [P] ──► [P] ──────► P³ datos
 └──────────────────────────┘
         P = tamaño de bloque / tamaño de puntero
```

**La gran ventaja contra la FAT:** el nodo-i se carga a RAM **solo mientras el archivo está abierto**. Con *k* archivos abiertos y nodos-i de *n* bytes, la RAM ocupada es **k · n**:
- La **FAT** es proporcional al **tamaño del disco**: si el disco crece, la tabla crece.
- El arreglo de **nodos-i** es proporcional a la **cantidad de archivos abiertos**. Da igual si el disco tiene 10 GB o 1000 GB.

**El crecimiento por niveles:** los archivos chicos, que son la mayoría, entran enteros en los directos y se leen rapidísimo. Si el archivo no entra, se usa el simple; si tampoco, el doble; y si hace falta, el triple.

📖 *Tanenbaum 4.3.2, págs. 279–280; 4.5.3, págs. 321–322 (nodo-i de V7) · Resumen de la cátedra, págs. 14–15.*

---

### Ejemplo resuelto 1: tamaño máximo (el de la práctica de la cátedra)

*10 directos, simple, doble y triple; bloques de 4 KB; punteros de 4 B.*

```
P = 4096 / 4 = 1024 direcciones por bloque índice

 directos :          10 bloques
 simple   :       1.024 bloques
 doble    :   1.048.576 bloques   (1024²)
 triple   : 1.073.741.824 bloques (1024³)
            ─────────────
            1.074.791.434 bloques × 4096 B = 4.402.345.713.664 B ≈ 4 TiB
```

🧠 **Atajo para el examen:** el triple se come casi todo. P³ × B = 2³⁰ × 2¹² = 2⁴² B = **4 TiB**. Los demás términos casi no cambian el resultado.

⚠️ **Errata de la práctica:** dice «4,27 TB». Está mal: 4.402.345.713.664 / 2⁴⁰ = **4,00 TiB** (o 4,40 TB si dividís por 10¹²). Si te lo toman, mostrá la cuenta.

### Ejemplo resuelto 2: ¿cuántos bloques índice? (también de la práctica)

*12 directos, bloques de 2 KB, punteros de 4 B, archivo de 5,5 MB.*

```
P = 2048 / 4 = 512
Bloques de datos = 5,5 MB / 2 KB = 5632 KB / 2 KB = 2816

 directos : 12 bloques              → 0 bloques índice    (quedan 2804)
 simple   : 512 bloques             → 1 bloque índice     (quedan 2292)
 doble    : 2292 bloques            → 1 bloque doble
                                      + ⌈2292 / 512⌉ = 5 sencillos  → 6
                                                                   ───
                                       TOTAL BLOQUES ÍNDICE  =  7
```

⚠️ **La trampa:** en el doble se cuenta **el bloque doble mismo** más **cada sencillo que cuelga de él**. Si contás solo los 5, te da 6 y está mal.

### Ejemplo resuelto 3: ¿dónde está un byte? (ext2: 12 directos, 1 KB, 4 B, P = 256)

*Un proceso hace `lseek` al byte 300.000 y lee.*

1. Bloque lógico: n = ⌊300.000 / 1024⌋ = **292**. Desplazamiento: 300.000 mod 1024 = 992.
2. ¿Es directo? 292 ≥ 12, no. Resto: 292 − 12 = 280.
3. ¿Está en el simple? 280 ≥ 256, no. Resto: 280 − 256 = 24.
4. ¿Está en el doble? 24 < 256² = 65.536, **sí**. Entrada del doble: ⌊24 / 256⌋ = **0**. Entrada del sencillo: 24 mod 256 = **24**.
5. Lecturas de disco, con el nodo-i ya en RAM: doble + sencillo + dato = **3**.

| Nivel | Lecturas (nodo-i en RAM) |
|---|---|
| directo | 1 |
| simple | 2 |
| doble | 3 |
| triple | 4 |

⚠️ Si el enunciado dice que el nodo-i **no** está en memoria, sumá 1.

### 🎛 Gráfico: [inodos.html](unidades/u04-archivos/visuales/inodos.html) (ya te lo abrí)

- **Calculadora** con deslizadores (directos, tamaño de bloque, tamaño de puntero y qué niveles hay) y la tabla nivel por nivel. El estado ok / al límite / saturado compara el máximo contra lo que **el ancho del puntero** puede direccionar: probá el botón «Punteros de 2 B» y vas a ver que la fórmula da más disco del que se puede nombrar.
- **Bloques de datos y bloques índice** para un tamaño de archivo que elijas. Trae cargado el ejercicio de 5,5 MB.
- **Simulador** que ubica un byte en el árbol del nodo-i, paso a paso, con el camino resaltado, las entradas y las lecturas de disco.

Ideas clave:
- **Máximo = (D + P + P² + P³) × B**, con **P = B / puntero**.
- ⚠️ Los bloques índice **no son datos**, pero ocupan disco. Contá el doble **más** sus sencillos.
- 🧠 Nodo-i: la RAM depende de los **archivos abiertos**. FAT: la RAM depende del **tamaño del disco**.
- 🧠 Un nodo-i por archivo. Cuando el archivo crece, **crecen sus bloques, no sus nodos-i**. Esa era una opción trampa del parcial de la práctica.

🔗 **U3:** es la misma idea que la **tabla de páginas multinivel**: solo existen los bloques índice que hacen falta, igual que en la paginación multinivel solo existen las tablas de segundo nivel que se usan.

---

### Preguntas rápidas

**1.** Nodo-i con **10 directos** más simple, doble y triple; bloques de **1 KB**; punteros de **4 B**.
- a) Un archivo de **300 KB**: ¿cuántos bloques de datos y cuántos bloques índice usa?
- b) Se hace `lseek` al byte **270.000** y se lee. ¿En qué nivel cae, qué entrada se usa y cuántas lecturas de disco hacen falta (nodo-i ya en RAM)?

**2.** Tenés un disco de 2 TB. ¿Por qué en ese disco el nodo-i usa mucha menos RAM que la FAT? Respondé con lo que crece en cada caso.

<<<<<< MENSAJE 16 >>>>>>

# Corrección del tema 4

**1. ✅ a) y b) correctas.** Ejercicio completo. Para el examen, el desarrollo quedaría así:

```
P = 1024 / 4 = 256 · bloques de datos = 300 KB / 1 KB = 300

a) directos: 10            → 0 índice   (quedan 290)
   simple  : 256           → 1 índice   (quedan 34)
   doble   : 34            → 1 doble + ⌈34/256⌉ = 1 sencillo → 2
   ─────────────────────────────────────────────
   300 de datos + 3 índice = 303 bloques en disco

b) n = ⌊270.000 / 1024⌋ = 263   (desp = 688)
   263 − 10 = 253 < 256  → indirecto SIMPLE, entrada 253
   Lecturas: bloque simple + dato = 2
```

**2. ✅ Correcta en la idea.** Ajustá el vocabulario: la FAT no «copia índices», sino que tiene **una entrada por cada bloque del disco**. Y del lado del nodo-i, lo que va a RAM es **el nodo-i de cada archivo abierto**, no el archivo.

Si le ponés números, la respuesta queda redonda. Por ejemplo, con bloques de 1 KB y entradas de 4 B:

| | Qué crece | En un disco de 2 TB |
|---|---|---|
| **FAT** | el **tamaño del disco** (una entrada por bloque) | 2·10⁹ bloques × 4 B ≈ **8 GB de RAM**, siempre |
| **Nodos-i** | la cantidad de **archivos abiertos** (k · n) | 1000 abiertos × 128 B (ext2) ≈ **128 KB** |

🧠 La frase para el examen: **«la FAT es proporcional al disco; los nodos-i, a los archivos abiertos»**.

---

Ya tenés los **dos ejercicios fijos del final** (FAT y nodo-i). Lo que sigue es el **tema 5: implementación de directorios y vínculos duros y simbólicos** ★, donde vemos:
- qué guarda una entrada de directorio (MS-DOS contra UNIX);
- los nombres largos;
- la búsqueda de `/usr/ast/mbox`;
- y qué pasa con el **contador de vínculos** cuando borrás un archivo que tiene un vínculo duro. Esto se pregunta mucho.

Decime **«seguí»**.

<<<<<< MENSAJE 17 >>>>>>

Confirmé la fig. 4-35 (raíz → nodo-i 6 → bloque 132 → nodo-i 26 → bloque 406 → mbox = nodo-i 60). Ahora armo el simulador de vínculos (fig. 4-17) y de búsqueda de rutas.

<<<<<< MENSAJE 18 >>>>>>

# Tema 5 de 11: Implementación de directorios y vínculos ★

### Parte A: ¿qué guarda una entrada de directorio? (fig. 4-14, págs. 280–281)

La función del directorio es **traducir un nombre ASCII** en «lo necesario para encontrar los datos». Según el método de asignación, eso es:
- en la **contigua**, la dirección de todo el archivo;
- en las **enlazadas** (con o sin FAT), el **primer bloque**;
- con **nodos-i**, el **número de nodo-i**.

La pregunta de diseño es **dónde van los atributos**:

```
 (a) ATRIBUTOS EN LA ENTRADA            (b) ENTRADA → NODO-I
     (estilo Windows / MS-DOS)              (estilo UNIX)
 ┌─────────┬──────────────────┐        ┌─────────┬────┐     ┌─────────────┐
 │ juegos  │ atributos + dir. │        │ juegos  │ 12 │ ──► │ nodo-i 12:  │
 │ correo  │ atributos + dir. │        │ correo  │ 40 │     │ atributos + │
 │ noticias│ atributos + dir. │        │ noticias│  7 │     │ direcciones │
 └─────────┴──────────────────┘        └─────────┴────┘     └─────────────┘
```

En **UNIX V7**, la entrada tiene **solo dos campos**: el nombre (**14 bytes**) y el número de nodo-i (**2 bytes**). Por eso **un sistema de archivos admite como máximo 64 K archivos** (2¹⁶) (fig. 4-33, pág. 321).

**Nombres largos (fig. 4-15).** Reservar 255 caracteres en cada entrada desperdicia espacio. Hay dos alternativas:

| | **En línea** (fig. 4-15a) | **En un heap** (fig. 4-15b) |
|---|---|---|
| Cómo | cada entrada lleva su longitud, los atributos y el nombre, rellenado hasta completar una palabra | entradas de tamaño fijo con un **puntero** al nombre, que vive en un heap al final del directorio |
| − | al borrar queda un **hueco variable** (es la fragmentación de la contigua, pero se puede compactar porque el directorio está en RAM); una entrada puede cruzar páginas → **fallo de página** | hay que administrar el heap; también puede haber fallos de página |
| + | — | al borrar, el próximo archivo **siempre entra**; no hace falta relleno |

**Búsqueda rápida (págs. 281–282).** Normalmente se busca **lineal**. Hay dos formas de acelerar:
- **Tabla hash** por directorio. Si dos nombres caen en la misma ranura, se encadenan en una lista enlazada. Vale la pena con directorios de cientos o miles de archivos; a cambio, la administración es más compleja.
- **Caché de búsquedas**, que sirve si pocos archivos concentran la mayoría de los accesos.

### Parte B: buscar `/usr/ast/mbox` (fig. 4-35, págs. 322–323)

```
 nodo-i raíz        bloque 1          nodo-i 6        bloque 132       nodo-i 26       bloque 406
 (lugar FIJO) ──►  1  .           ──► bloque=132 ──►  6  .         ──► bloque=406 ──► 26  .
                   1  ..                              1  ..                            6  ..
                   4  bin                            19  dick                         64  becas
                   ...                               51  jim                          92  libros
                   6  usr ◄─ está                    26  ast ◄─ está                  60  mbox ◄─ ¡acá!
                   8  tmp                            45  bal                          81  minix
```
**Se alterna nodo-i → bloque de directorio → nodo-i → …** Al final, el **nodo-i 60 se lee a RAM** y queda ahí hasta el `close`.

Sin caché, eso son **7 lecturas**: 3 directorios × 2 (su nodo-i y su bloque) + el nodo-i final. Una ruta relativa se busca igual, pero arrancando en el directorio de trabajo; `..` es **una entrada más**, con el número de nodo-i del padre.

### Parte C: archivos compartidos y vínculos (figs. 4-16 y 4-17, págs. 283–285)

Con vínculos, el sistema de archivos deja de ser un árbol y pasa a ser un **DAG** (grafo acíclico dirigido).

**Por qué hace falta el nodo-i:** si el directorio guardara las direcciones de disco y se copiaran en el directorio de B, cuando C agregara bloques **B no los vería**. La solución es que las direcciones vivan en **una estructura del archivo** (el nodo-i) y que los dos directorios **apunten a ella**.

```
 VÍNCULO DURO (ln)                         VÍNCULO SIMBÓLICO (ln -s)
 dir C: (datos, 20) ──┐                    dir C: (datos, 20) ───► nodo-i 20 (dueño C, cont 1)
                      ├─► nodo-i 20        dir B: (datos, 21) ───► nodo-i 21 tipo LINK
 dir B: (datos, 20) ──┘   dueño C                                  contenido: "/home/c/datos"
                          contador = 2
```

**La historia de la fig. 4-17, con vínculo DURO:**

| Paso | Contador del nodo-i 20 | Qué pasa |
|---|---|---|
| C crea `datos` | 1 | |
| B hace `ln` | **2** | el **dueño sigue siendo C** |
| C hace `rm` | **1** | se borra **solo la entrada de C**; el archivo **sigue vivo** para B |
| B hace `rm` | **0** | recién ahora se liberan el nodo-i y los bloques |

⚠️ **Por qué no se libera al borrar C:** B quedaría apuntando a un nodo-i inválido, que **podría reasignarse a otro archivo**. Y el sistema no puede ir a borrar la entrada de B, porque **el nodo-i no sabe qué directorios lo apuntan**: podrían ser ilimitados.

⚠️ **La consecuencia:** C sigue siendo dueño y **se le sigue cobrando la cuota** por un archivo que ya «borró», hasta que B lo borre.

**Con vínculo SIMBÓLICO:** solo C tiene el puntero al nodo-i. Si C borra, el archivo **se destruye de verdad** y el simbólico de B queda **colgado**: «No such file or directory». Si B borra su simbólico, el original no se entera.

| | Duro | Simbólico |
|---|---|---|
| Qué es | otra entrada **al mismo nodo-i** | un **archivo nuevo** (tipo LINK) que contiene **una ruta** |
| Contador del original | **sube** | **no cambia** |
| Si el dueño borra | sigue vivo (contador > 0) | queda **colgado** |
| Costo | ninguno extra | un nodo-i (y quizá un bloque) más, y **más lento**: hay que recorrer la ruta |
| Alcance | **mismo sistema de archivos** | puede cruzar discos y **hasta máquinas** |

**Un problema de los dos:** el archivo tiene **varias rutas**. Un programa de respaldo puede copiarlo **dos veces** y, al restaurarlo, crear dos archivos en vez de uno vinculado.

### 🎛 Simulador: [vinculos_rutas.html](unidades/u04-archivos/visuales/vinculos_rutas.html) (ya te lo abrí)

- **Pestaña 1:** la fig. 4-17 paso a paso (crear → `ln` o `ln -s` → `cat` → `rm` de C → `cat` de B → `rm` de B). Muestra los directorios de C y B, la tabla de nodos-i con el contador y el dueño, y la salida de la terminal, incluido el **vínculo colgado**.
- **Pestaña 2:** la búsqueda de `/usr/ast/mbox` sobre los datos reales de la fig. 4-35. También trae rutas relativas (`../jim`, `mbox`) y un nombre que no existe, con el conteo de lecturas.

Ideas clave:
- **Duro = mismo nodo-i, sube el contador. Borrar = unlink.** El archivo se libera recién con el contador en **0**.
- ⚠️ El duro sobrevive al `rm` del dueño, y la cuota **la sigue pagando el dueño**.
- ⚠️ El simbólico guarda una **ruta**: si el original se borra o se renombra, queda colgado.
- 🧠 Buscar una ruta alterna nodo-i y bloque: sin caché, son **2 lecturas por directorio recorrido + 1**.

🔗 **U2:** «el sistema no puede encontrar todas las entradas que apuntan a un nodo-i» es el mismo problema que el de los **punteros colgantes**. Por eso se usa un **contador de referencias**, como con la memoria compartida.

📖 *Tanenbaum 4.3.3–4.3.4, págs. 280–285; 4.5.3, págs. 321–323 · Resumen de la cátedra, págs. 11–12.*

---

### Preguntas rápidas

**1.** Ana crea `/home/ana/informe`, que queda en el nodo-i 40. Después, en orden:
1. Luis ejecuta `ln /home/ana/informe /home/luis/inf`.
2. Luis ejecuta `ln -s /home/ana/informe /home/luis/atajo`.
3. Ana ejecuta `rm /home/ana/informe`.

- a) ¿Cuánto vale el contador del nodo-i 40 después de cada paso?
- b) ¿Qué pasa si Luis hace `cat inf` y qué pasa si hace `cat atajo`?
- c) ¿A quién se le cobra el espacio del archivo?

**2.** ¿Por qué no se puede hacer un vínculo **duro** entre dos particiones distintas y uno **simbólico** sí?

<<<<<< MENSAJE 19 >>>>>>

# Corrección del tema 5

**1. a) ⚠️ Parcial.** La consigna pedía el valor **después de cada paso**, y el **3** es el que cambia todo:

| Paso | Contador del nodo-i 40 | Por qué |
|---|---|---|
| Ana crea | 1 | la entrada de Ana |
| `ln` (duro) | **2** | otra entrada al **mismo** nodo-i |
| `ln -s` (simbólico) | **2** | el simbólico es **otro** nodo-i (con una ruta adentro): no toca el 40 |
| Ana hace `rm` | **1** | se borra la entrada de Ana; queda **la de `inf`** |

**b) ❌ Incorrecta.** Respondiste como si Ana no hubiera borrado nada, pero el paso 3 ya pasó:
- `cat inf` → **funciona**. `inf` apunta directo al nodo-i 40, que sigue vivo con contador 1.
- `cat atajo` → **falla**: *«No such file or directory»*. El atajo guarda el **texto** `/home/ana/informe`, el kernel busca ese nombre en el directorio de Ana y **ya no existe**. Queda **colgado**.

**c) ❌ Incorrecta, y con los roles invertidos.**
- Se le cobra a **Ana**: el nodo-i dice **dueño = Ana**, y crear un vínculo **no cambia el dueño**. Ana «borró» el archivo, pero lo sigue pagando hasta que Luis borre `inf`.
- Lo que mantiene vivo el archivo es **`inf` (el duro)**, no `atajo`. El simbólico **nunca** mantiene vivo nada: ni siquiera cuenta en el contador.

**2. ✅ Correcta.** Para completarla, decí el **porqué técnico**:
- La entrada de directorio es solo **(nombre, número de nodo-i)**, sin ningún dato de la partición.
- El número de nodo-i **es local** a cada sistema de archivos: «nodo-i 40» en `/dev/sda1` y «nodo-i 40» en `/dev/sdb1` son archivos distintos. Un vínculo duro hacia otra partición no tendría forma de decir *de cuál*.
- El simbólico guarda una **ruta**, y la ruta se resuelve con la búsqueda normal, que sí cruza puntos de montaje y hasta puede ir a otra máquina.

---

### Te lo explico de otra forma, porque esto se toma siempre

Pensá el **nodo-i como una casa**, y las **entradas de directorio como llaves**.

- **Vínculo duro = hacerle una copia de la llave a Luis.** Ahora hay 2 llaves (contador 2). Si Ana tira la suya, Luis sigue entrando, y la casa se demuele recién cuando **no queda ninguna llave** (contador 0). La escritura sigue a nombre de Ana: **paga Ana**.
- **Vínculo simbólico = darle a Luis un papelito que dice «la casa está en la calle Ana 123».** No es una llave (el contador no sube). Si Ana tira su llave y era la única, la casa se demuele, y cuando Luis va con el papelito encuentra **un terreno vacío**: está colgado.

🧠 **Regla para recitar:** *«el duro cuenta, el simbólico apunta»*. El duro suma al contador y mantiene vivo el archivo. El simbólico es una ruta escrita, que puede quedar colgada.

**Pregunta de control rápida** (antes de seguir al tema 6):

Mismo escenario, pero ahora el paso 3 lo hace **Luis**: `rm /home/luis/inf`. ¿Cuánto queda el contador del nodo-i 40, y funcionan `cat /home/ana/informe` y `cat /home/luis/atajo`?

<<<<<< MENSAJE 20 >>>>>>

# Tema 6 de 11: LFS, bitácora y VFS

Son tres ideas distintas sobre **cómo diseñar un sistema de archivos moderno**:
- **LFS**, para escribir rápido;
- **bitácora**, para no romperse si se corta la luz;
- **VFS**, para que convivan muchos sistemas de archivos.

⚠️ El resumen de la cátedra solo trae LFS, pero el programa nombra «actualización atómica, transacciones» y «VFS». Así que esta parte la basé en el libro.

---

### 1) LFS: sistema de archivos estructurado por registro (págs. 285–287)

**El problema:** las CPU y las RAM crecen muchísimo, pero el **tiempo de búsqueda del disco casi no mejora**. Con cachés grandes, casi todas las lecturas salen de RAM, así que lo que va al disco son **escrituras chicas**. Y una escritura chica es carísima: 50 µs de escritura después de 10 ms de búsqueda y 4 ms de rotación da **menos del 1 %** de eficiencia.

Crear un archivo en UNIX obliga a escribir el nodo-i del directorio, el bloque del directorio, el nodo-i del archivo y el archivo: muchas escrituras chicas en lugares distintos.

**La idea:** tratar el disco entero como **un registro (log)**:

```
 RAM: búfer de escrituras pendientes ──(periódicamente)──► UN segmento grande (~1 MB)
                                                            al FINAL del registro
 DISCO (búfer circular):
 ┌────────┬────────┬────────┬────────┬────────┬──────────┐
 │ seg 1  │ seg 2  │ seg 3  │ seg 4  │ seg 5  │  libre   │
 └────────┴────────┴────────┴────────┴────────┴──────────┘
   ▲ el LIMPIADOR lee segmentos viejos,          ▲ el ESCRITOR agrega
     rescata lo vivo y libera el segmento          segmentos nuevos acá
```

- Cada segmento mezcla nodos-i, bloques de directorio y datos, y empieza con un **resumen de segmento** que dice qué contiene.
- Los nodos-i **ya no están en un lugar fijo**: hay un **mapa de nodos-i** (indexado por número), guardado en disco y cacheado en RAM.
- El **hilo limpiador** recorre el registro en círculo: descarta lo viejo, reescribe lo vivo en el segmento nuevo y libera el segmento original.
- **+** Es un orden de magnitud más rápido que UNIX en escrituras chicas, e igual o mejor en lecturas y escrituras grandes. **−** Es muy incompatible con los sistemas existentes, y por eso **casi no se usa**.

🔗 **U3:** el limpiador hace lo mismo que la **compactación**, y el búfer circular es la misma idea que el **reloj**.

---

### 2) Bitácora (journaling) ★ (págs. 287–288)

**El problema:** borrar un archivo en UNIX son **tres escrituras**:

```
 A. Quitar la entrada del directorio
 B. Liberar el nodo-i (a la reserva de nodos-i libres)
 C. Devolver los bloques (a la reserva de bloques libres)
```

Si se corta la luz en el medio, **ningún orden es seguro**:

| Orden | Se cae después de… | Resultado |
|---|---|---|
| A, B, C | A | nodo-i y bloques **en el limbo**: no son de nadie, pero tampoco están libres |
| A, B, C | A y B | se pierden los **bloques** |
| **B** primero | B | el nodo-i se reasigna, y la entrada vieja **abre otro archivo** |
| **C** primero | C | los bloques se reutilizan y **dos archivos comparten bloques** |

**La solución, en orden:**
1. Escribir en el disco una **entrada de bitácora** con las tres acciones (y, si hace falta, releerla para verificarla).
2. Recién entonces hacer A, B y C.
3. Si todo salió bien, **borrar la entrada**.
4. Si se cae: al re-arrancar se mira la bitácora y se **rehacen** las operaciones pendientes, las veces que haga falta.

⚠️ **La condición clave: las operaciones tienen que ser idempotentes**, es decir, que repetirlas no cambie el resultado. Hay que rehacerlas sin saber cuáles se alcanzaron a hacer:

| Operación | ¿Idempotente? |
|---|---|
| «Marcar en el mapa de bits el bloque *n* como libre» | ✅ sí |
| «Buscar en el directorio y eliminar la entrada `foobar`» | ✅ sí |
| «Agregar los bloques del nodo-i *K* al **final de la lista libre**» | ❌ **no**: si ya estaban, quedan **duplicados** |
| «Buscar en la lista libre y agregar el bloque *n* **si no está**» | ✅ sí (más cara) |

**Transacción atómica** (idea de bases de datos): `begin transaction … end transaction` agrupa operaciones, y se hacen **todas o ninguna**.

**Quiénes la usan:** **NTFS** (desde Windows NT, 1993), **ReiserFS** (el primero en Linux, pero incompatible con ext2) y **ext3** (bitácora y **compatible con ext2**).

---

### 3) VFS: sistema de archivos virtual (fig. 4-18, págs. 288–291)

**El problema:** en una misma máquina hay NTFS, FAT32, un CD ISO 9660, un disco en red…
- **Windows** los separa con **letras de unidad** (C:, D:) y no los integra.
- **UNIX** los **monta** en un solo árbol: ext2 en `/`, ext3 en `/usr`, ReiserFS en `/home`, el CD en `/mnt`. El usuario ve una sola jerarquía.

```
       proceso:  open / read / write / lseek / close
                          │   ← interfaz SUPERIOR = POSIX
               ┌──────────▼───────────┐
               │   VFS (lo común):    │  tabla de montaje, descriptores,
               │                      │  nodos-v en RAM
               └──┬───────┬───────┬───┘
                  │       │       │   ← interfaz INFERIOR = «interfaz de VFS»
               [ext3]  [FAT32]  [NFS]     (cada FS registra sus funciones)
                  └───────┴───┬───┘
                        caché de búfer → disco / red
```

**`open("/usr/include/unistd.h")` paso a paso:**
1. Al montarse, cada FS se **registra** y le da al VFS su **vector de funciones**.
2. El VFS analiza la ruta, ve que hay un FS montado en `/usr` y busca su **superbloque**.
3. Busca `include/unistd.h` desde la raíz de ese FS.
4. Crea un **nodo-v** en RAM, con los datos del nodo-i y el **puntero a la tabla de funciones** de ese FS.
5. Agrega una entrada en la **tabla de descriptores** del proceso y devuelve el **descriptor**.
6. Cada `read` sigue el camino descriptor → nodo-v → la función `read` **del FS concreto**. Al VFS no le importa si los datos vienen del disco, de la red o de un USB.

🧠 La motivación original de Sun fue **NFS**: poder montar sistemas de archivos **remotos** como si fueran locales.

🔗 **U1:** el VFS es lo mismo que la **capa independiente del dispositivo** en E/S: una interfaz común arriba y los «controladores» (FS concretos) abajo. Es orientado a objetos aunque esté escrito en C: los objetos son el superbloque, el nodo-v y el directorio.

### 🎛 Simulador: [bitacora.html](unidades/u04-archivos/visuales/bitacora.html) (ya te lo abrí)

- Elegís el **orden** (A→B→C, B primero o C primero), **con o sin bitácora**, si los bloques se liberan con **mapa de bits** (idempotente) o **lista libre** (no idempotente), y **en qué momento se cae**.
- Al re-arrancar se crean dos archivos nuevos que reusan lo libre, y un diagnóstico te dice si el disco quedó sano: limbo, nombre que abre otro archivo, bloques compartidos o perdidos.
- Probá: **sin bitácora**, cualquier caída rompe algo. **Con bitácora y mapa de bits**, nunca. **Con bitácora y lista libre**, falla si la caída es después de C.
- Abajo está el **VFS en capas** con la secuencia del `open`.

Ideas clave:
- **Bitácora = anotar en el disco antes de hacer**, y al re-arrancar **rehacer**.
- ⚠️ Sin bitácora, **ningún orden** de A, B y C es seguro.
- ⚠️ Rehacer exige **idempotencia**: «marcar libre» sí, «agregar al final de la lista» no.
- 🧠 VFS: **POSIX arriba**, **funciones de cada FS abajo**. El nodo-v es el nodo-i «genérico» en RAM.

📖 *Tanenbaum 4.3.5–4.3.7, págs. 285–291 · Resumen de la cátedra, pág. 19 (LFS).*

---

### Preguntas rápidas

**1.** Un sistema **sin bitácora** borra archivos en este orden: primero **libera el nodo-i** y después **borra la entrada del directorio**. Se corta la luz justo entre los dos pasos. Al re-arrancar, un usuario crea un archivo nuevo. ¿Qué problema concreto aparece? ¿Cómo lo evitaría una bitácora?

**2.** ¿Cuáles de estas operaciones son **idempotentes**? Justificá cada una.
- a) «Poner en 1 (libre) el bit 500 del mapa de bits.»
- b) «Incrementar en 1 el contador de vínculos del nodo-i 7.»
- c) «Si en el directorio existe la entrada `foobar`, borrarla.»

<<<<<< MENSAJE 21 >>>>>>

# Corrección del tema 6

**1. ⚠️ Parcial.** Vas bien, pero te faltó **el problema concreto**, que es lo que pide la consigna:

1. El nodo-i 7 ya figura **libre**, pero la entrada `foobar → 7` **sigue en el directorio** (eso es lo que llamaste «aislada»: es una **entrada colgada**).
2. El usuario crea un archivo nuevo y el sistema le da un nodo-i libre: **el 7**.
3. Ahora `foobar` apunta a un nodo-i que es **de otro archivo**. Quien abra `foobar` **lee y escribe los datos del archivo nuevo**.

Sobre la bitácora, un ajuste: no «empieza de cero» ni deshace nada.
- **Antes** de tocar nada, se escribe en el disco la entrada con las acciones pendientes.
- Al re-arrancar, si esa entrada sigue ahí, se **rehacen** todas las acciones hasta completarlas.
- Hay que rehacer **todas** porque no se sabe cuáles se alcanzaron a hacer. Por eso tienen que ser idempotentes.

**2. ❌ Acá se mezcló el concepto.** Juzgaste si cada operación era «la correcta» para borrar un archivo, pero la pregunta era otra:

> **Idempotente = hacerla 2 veces deja el mismo resultado que hacerla 1 vez.**

No importa si la operación «tiene sentido»: importa qué pasa **si la repetís**.

| | ¿Idempotente? | Por qué |
|---|---|---|
| **a)** poner en 1 el bit 500 | ✅ **SÍ** | La primera vez queda en 1; la segunda, sigue en 1. **Fija un valor.** (En el libro, en el mapa de bits libre = 1; en la fig. 4-22, 1 = libre.) |
| **b)** incrementar el contador del nodo-i 7 | ❌ **NO** | Si valía 1: una vez da 2, dos veces da 3. Cada repetición **suma**. (Pusiste «falso», que coincide, pero por otra razón.) |
| **c)** borrar `foobar` si existe | ✅ **SÍ** | La primera vez la borra; la segunda no la encuentra y no hace nada. Bien. |

### Otra forma de verlo

Pensá en el **botón de un ascensor**: apretar «piso 5» tres veces es igual que apretarlo una, porque el ascensor va al 5. Eso es idempotente.

Un **interruptor de luz que alterna** (apagado ↔ encendido) **no** lo es: dos apretadas te dejan donde estabas, y tres te cambian el estado.

🧠 **Regla rápida para el examen:**
- **«Fijar / poner en X / borrar si existe / agregar si no está»** → idempotente.
- **«Sumar / incrementar / agregar al final / alternar»** → **NO** idempotente.

**Control rápido (respondé solo sí o no):**
- a) «Poner el tamaño del archivo en 4096 bytes.»
- b) «Agregar 512 bytes al final del archivo.»
- c) «Decrementar en 1 el contador de vínculos.»

<<<<<< MENSAJE 22 >>>>>>

Antes, la respuesta del control, para que la tengas: **a) sí** (fija un valor), **b) no** (agrega al final), **c) no** (resta).

<<<<<< MENSAJE 23 >>>>>>

Para el tema 7 uso lo que ya había verificado contra el libro y la práctica al preparar la unidad. Armo una calculadora (fragmentación, tamaño de bloque y bloques libres) y empezamos.

<<<<<< MENSAJE 24 >>>>>>

# Tema 7 de 11: Administración del espacio en disco ★

### La intuición

El disco se reparte en **cajas de tamaño fijo** (bloques). Si las cajas son grandes, mudás todo en pocos viajes, pero un objeto chico ocupa una caja entera y desperdicia lugar. Si son chicas, no desperdiciás, pero necesitás muchísimos viajes.

Ese es todo el dilema del tamaño de bloque.

### 1) ¿Por qué bloques? (pág. 292)

Guardar un archivo en **n bytes contiguos** tiene el problema de que, si crece, **hay que moverlo**, y en disco eso es carísimo. Por eso casi todos los sistemas usan **bloques fijos, no necesariamente contiguos**.

🔗 **U3:** es la misma decisión que entre **segmentación** (contiguo) y **paginación** (bloques fijos).

### 2) Tamaño de bloque (figs. 4-20 y 4-21, págs. 292–295)

```
 tiempo para leer un bloque de k bytes
   = búsqueda + media rotación + transferencia
   =   5 ms   +   4,165 ms    + (k / 1 MB) × 8,33 ms
                 └──── ~9,2 ms casi fijos ────┘
```

| Bloque | Tiempo por acceso | Velocidad | Eficiencia de espacio (archivos de 4 KB) |
|---|---|---|---|
| 1 KB | 9,17 ms | ~0,1 MB/s | 100 % |
| 4 KB | 9,20 ms | ~0,45 MB/s | 100 % |
| 8 KB | 9,23 ms | ~0,9 MB/s | **50 %** |
| 64 KB | 9,71 ms | ~6,6 MB/s | **≈ 7 %** |

```
    ▲                                         ━━ velocidad: sube casi lineal
    │  ┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅
    │                     ┅┅┅
    │                         ┅┅         ━━━━━━
    │                            ┅┅━━━━━━
    │                     ━━━━━━━━━┅┅┅
    │          ━━━━━━━━━━              ┅┅┅┅┅┅  ┅┅ eficiencia: se desploma
    └────────────────────────────────────────►  tamaño de bloque
      1K   2K   4K   8K   16K  32K  64K
```

**Conclusiones del libro:**
- El acceso está **dominado por la búsqueda y la rotación**: cuanto más se trae por acceso, mejor.
- **Velocidad y espacio están en conflicto**: las curvas se cruzan cerca de 64 KB, y ahí las dos son malas. No hay tamaño ideal.
- **Mediciones** (VU de Ámsterdam, 2005): el 59 % de los archivos tiene **4 KB o menos**. Pero el 93 % de los bloques del disco los usa el 10 % de los archivos más grandes. Así que el desperdicio de los archivos chicos casi no se nota en el total.
- Históricamente se usaron **1 a 4 KB**. Con discos de varios TB, podría convenir **64 KB** y aceptar el desperdicio.

### 3) Fragmentación interna: el ejercicio de la práctica ★

*FAT32 con el bloque igual al marco de página (**4 KB**), sectores de **512 B**, y un ejecutable de **3.712.518 B**.*

```
a) Sectores por bloque = 4096 / 512 = 8

b) BPB, bytes por sector (desplazamientos 0x0B y 0x0C, little-endian):
   512 = 0x0200   →   0x0B = 00 ,  0x0C = 02

c) 3.712.518 div 4096 = 906 bloques llenos
   resto = 3.712.518 − 906 × 4096 = 3.712.518 − 3.710.976 = 1542 B   (van en el bloque 907)
   fragmentación interna = 4096 − 1542 = 2554 B
   ocupa 907 bloques = 3.715.072 B en disco
```

⚠️ **Errata de la práctica:** la versión escrita dice **2580,48 B**, porque hizo 906,37 → 0,37 × 4096. **Está mal**: el 0,37 viene redondeado. Usá siempre el **resto exacto de la división entera**. La resolución manuscrita de la misma práctica llega a **2554**.

### 4) Registro de bloques libres (figs. 4-22 y 4-23, págs. 295–297)

```
 (a) LISTA ENLAZADA de bloques               (b) MAPA DE BITS
 ┌────────────┐   ┌────────────┐              1 bit por bloque del disco
 │ 42  136    │   │ 230  162   │              1 = libre · 0 = ocupado
 │ 210 97 ... │──►│ 612  342...│──► ...       1001101101101100
 │ (255 nºs + │   │            │              0110110111110111
 │  1 puntero)│   │            │              1010110110110110
 └────────────┘   └────────────┘
  bloque de 1 KB / números de 32 bits = 256 → 255 libres + 1 al siguiente
```

**Ejemplo del libro:** 500 GB con bloques de 1 KB son **≈ 488 millones de bloques**.

| | Cuenta | Resultado |
|---|---|---|
| Lista | 488 M / 255 | **≈ 1,9 millones de bloques** |
| Mapa de bits | 488 M bits / 8 / 1024 | **≈ 60.000 bloques** |

- El mapa gana porque usa **1 bit** por bloque, contra **32 bits** de la lista. La lista solo ocupa menos con el **disco casi lleno** (con estos números, menos del 3 % libre).
- A favor de la lista: sus bloques **son bloques libres**, así que en la práctica «no cuestan».
- A favor del mapa: asignando desde un mismo pedazo del mapa, los bloques quedan **cerca** y el brazo se mueve menos.
- **Variante:** guardar **series** (primer bloque + cantidad) en vez de bloques sueltos. Es buenísimo con el disco poco fragmentado y malo si está muy fragmentado.

**El detalle de la fig. 4-23:** en RAM se tiene **un solo bloque de punteros**. Si está casi lleno y entran y salen archivos temporales chicos, se escribe y se relee del disco sin parar. La solución es **dividirlo** para que el bloque en RAM quede **por la mitad**: así absorbe tanto altas como bajas sin E/S.

### 5) Cuotas de disco (fig. 4-24, págs. 297–298)

- Al abrir un archivo, su entrada en la tabla de archivos abiertos apunta al **registro de cuota del dueño**.
- Cada bloque nuevo **se le carga al dueño** y se compara contra dos límites:
  - **Suave**: se puede pasar durante la sesión. Al iniciar sesión pasado del límite, recibe una **advertencia**; si se le acaban las advertencias, **no puede entrar** hasta hablar con el administrador.
  - **Duro**: **nunca** se pasa; el intento da **error**.
- Hay límites iguales (suave y duro) para la **cantidad de archivos**.

🔗 **Tema 5:** por esto el **vínculo duro le sigue costando cuota al dueño** después de su `rm`.

### 🎛 Calculadoras: [espacio_disco.html](unidades/u04-archivos/visuales/espacio_disco.html) (ya te la abrí)

1. **Fragmentación interna**, con el ejercicio de la práctica cargado y el paso a paso (incluye el BPB). La barra muestra cuánto del último bloque se usa.
2. **Tamaño de bloque**: las dos curvas de la fig. 4-21 con el bloque elegido marcado. Cambiá el tamaño típico de archivo y la búsqueda.
3. **Lista contra mapa de bits**: mové el porcentaje de bloques libres y mirá en qué punto la lista pasa a ocupar menos.

Ideas clave:
- **Fragmentación interna = bloque − resto** (resto exacto, nunca el decimal).
- ⚠️ La errata de la práctica: **2554 B, no 2580,48**.
- ⚠️ **Bloque grande = rápido y con desperdicio.** No existe un tamaño ideal.
- 🧠 **Mapa: 1 bit por bloque del disco. Lista: 32 bits por bloque libre.** La lista gana solo con el disco casi lleno.

📖 *Tanenbaum 4.4.1, págs. 292–298 · Resumen de la cátedra, págs. 19–20 · Práctica, ejercicio 5 (FAT32).*

---

### Preguntas rápidas

**1. (Estilo final)** Un FAT32 usa clusters de **8 KB** y sectores de **512 B**. Se guarda un archivo de **1.000.000 bytes**.
- a) ¿Cuántos sectores tiene cada cluster?
- b) ¿Cuántos clusters ocupa el archivo y cuánto espacio en disco usa?
- c) ¿Cuánta fragmentación interna hay?

**2.** Un servidor tiene un disco de 1 TB **casi lleno**: solo el **2 %** de los bloques está libre. ¿Qué ocupa menos espacio para registrar los libres, la lista enlazada o el mapa de bits? ¿Por qué?

<<<<<< MENSAJE 25 >>>>>>

# Corrección del tema 7

### Pregunta 1: el planteo está bien, pero hay dos errores de cuenta

**a) ✅ 16 sectores.** 8192 / 512 = 16.

**b) ✅ 123 clusters. ❌ El espacio en disco es otro.**

```
1.000.000 div 8192 = 122 clusters llenos   → 122 × 8192 = 999.424 B
resto = 1.000.000 − 999.424 = 576 B          → va en el cluster 123
espacio en disco = 123 × 8192 = 1.007.616 B
```

Vos pusiste 1.008.192, que da justo **576 de más**: sumaste el resto encima de los 123 clusters. El resto ya está **adentro** del cluster 123. El espacio en disco es siempre **clusters × tamaño del cluster**, sin sumar nada más.

**c) ❌ Son 7616 B, no 448.**

```
fragmentación interna = 8192 − 576 = 7616 B
```

Creo que tus 448 salen de pensar en **sectores**: 576 B ocupan 1 sector lleno y 64 B del segundo, y 512 − 64 = 448.

⚠️ **Pero el sistema de archivos asigna clusters enteros, no sectores.** Aunque el último cluster use 2 de sus 16 sectores, los 16 quedan reservados para ese archivo. La fragmentación se mide contra la **unidad de asignación**, que acá es el cluster.

🧠 Dato curioso: este archivo desperdicia casi un cluster entero (93 %), porque el resto le quedó muy chico. Es el peor caso.

### Pregunta 2: ✅ correcta, con el razonamiento justo

Con números (bloques de 1 KB y números de 32 bits):

```
1 TB / 1 KB = 2^30 ≈ 1.074 millones de bloques

Mapa de bits: 2^30 bits / 8 / 1024           = 131.072 bloques   (fijo, no depende de cuántos haya libres)
Lista (2 % libre): 21,5 M libres / 255       ≈  84.200 bloques   ← gana
```

- La lista gana porque el disco está **por debajo del ~3 % libre**. Ese es el punto donde se cruzan las dos.
- **Para el final:** el mapa ocupa **siempre lo mismo**, porque representa todo el disco. La lista **crece con la cantidad de libres**.
- Encima, los bloques de la lista **son bloques libres**, así que en la práctica no le roban espacio a nadie.

### Diagnóstico del tema 7

- **Firme:** la idea de lista contra mapa de bits.
- **A cuidar:** la cuenta de fragmentación.

Para no volver a errarle:

```
1) n_llenos = tamaño div bloque
2) resto    = tamaño − n_llenos × bloque
3) bloques  = n_llenos + 1   (si resto > 0)
4) disco    = bloques × bloque
5) frag     = bloque − resto          ← contra el BLOQUE / CLUSTER, nunca contra el sector
```

Si querés practicarla, en [espacio_disco.html](unidades/u04-archivos/visuales/espacio_disco.html) poné 1.000.000 B, bloque de 8 KB y sector de 512 B, y vas a ver las mismas cuentas paso a paso.

¿Seguimos con el **tema 8: respaldos, consistencia (fsck) y caché de bloques**?

<<<<<< MENSAJE 26 >>>>>>

Armo el simulador de fsck (consistencia de bloques y de directorios), que es lo práctico que se toma de este tema.

<<<<<< MENSAJE 27 >>>>>>

Estoy terminando de enlazar el simulador (el texto decía «contra», no «que»).

<<<<<< MENSAJE 28 >>>>>>

# Tema 8 de 11: Respaldos, consistencia (fsck) y rendimiento

Este tema son **tres herramientas para que el sistema de archivos sobreviva**:

```
   RESPALDOS                CONSISTENCIA (fsck)              RENDIMIENTO
   "si se pierde todo"      "si se cortó la luz a mitad"     "que no sea lento"
   vaciado físico/lógico    bloques + directorios            caché · lectura adelantada
   incremental                                               brazo cerca · desfragmentar
```

---

## 8.1 Respaldos (págs. 298–304)

**Para qué sirven:** para recuperarse de un **desastre** (el disco se rompe, un incendio) y de la **estupidez** (borraste algo que necesitabas; por eso existe la Papelera).

**Qué hay que decidir:**
- **Qué respaldar.** No todo: ni los binarios reinstalables, ni los temporales, ni `/dev`. Este último es **peligroso**, porque el respaldo se colgaría leyendo un dispositivo.
- **Incremental.** Un vaciado completo cada semana o cada mes, más uno diario de lo que cambió. Al restaurar, va primero el completo y después **todos los incrementales en orden**.
- **Compresión.** Ahorra espacio, pero un solo error en la cinta puede arruinar todo.
- **Sistema activo.** Si se modifica mientras se copia, el respaldo queda inconsistente. La solución son las **instantáneas** (snapshots).
- **Guardar las cintas fuera del sitio**, para que un incendio no se lleve también el respaldo.

| | **Vaciado físico** | **Vaciado lógico** |
|---|---|---|
| Qué copia | bloques 0 … n, en orden | recorre el árbol y copia lo modificado desde una fecha |
| A favor | simple, rápido, casi sin errores | incremental, restaura **un** archivo |
| En contra | no saltea directorios, no es incremental, no restaura archivos sueltos | más complejo |

**El algoritmo de UNIX (fig. 4-25)** usa un mapa de bits indexado por nodo-i y tiene 4 fases:

```
1) marcar los archivos modificados y TODOS los directorios
2) desmarcar los directorios que no tienen nada modificado debajo
3) vaciar los directorios marcados (con sus atributos)
4) vaciar los archivos marcados
```

⚠️ **Se vacían directorios que no cambiaron** si están **en el camino** a algo modificado. Así se puede restaurar en un disco nuevo, o recuperar `/usr/jhs/proy/nr3/planes/resumen` aunque hayan borrado `nr3`.

🧠 **Trampas al restaurar:**
- La lista de libres **no se respalda**: se reconstruye como complemento de los bloques usados.
- Un archivo con **varios vínculos** se restaura **una sola vez**.
- Los **huecos** de un archivo no se restauran como ceros (si no, un `core` restaurado ocuparía todo el espacio de direcciones).
- Los archivos especiales (por ejemplo, los pipes con nombre) no se vacían.

---

## 8.2 Consistencia: fsck (págs. 304–307) ★ práctico

Si el sistema se cae antes de escribir los bloques modificados, el FS puede quedar inconsistente. Es grave si eran bloques de **nodos-i, directorios o la lista de libres**. **fsck** (UNIX) o **scandisk** (Windows) lo verifican **usando la redundancia** del propio FS.

### a) Bloques: dos tablas de contadores

- **«En uso»**: se leen todos los nodos-i y se suma 1 por cada bloque que lista cada uno.
- **«Libres»**: se suma 1 por cada vez que el bloque aparece en la lista o en el mapa.

**Regla:** en cada bloque, **uso + libres = 1**.

```
 Bloque   0 1 2 3 4 5 6 7 …
 (b) uso  1 1 0 1 0 1 1 1     bloque 2: 0 y 0 → FALTANTE
     lib  0 0 0 0 1 0 0 0        → se agrega a libres (solo desperdiciaba)

 (c) lib  0 0 1 0 2 0 0 0     bloque 4: 2 en libres → DUPLICADO EN LIBRES
                                 → se reconstruye la lista
                                 (con mapa de bits es IMPOSIBLE)

 (d) uso  1 1 0 1 0 2 1 1     bloque 5: 2 en uso → DUPLICADO DE DATOS  ← el peor
                                 → copiarlo a un bloque libre, darle la copia
                                   a uno de los archivos y AVISAR al usuario
```

⚠️ En el caso (d), la estructura queda bien, pero **seguramente uno de los dos archivos tiene basura**. Si no se arreglara, al borrar uno de los archivos el bloque quedaría **libre y en uso a la vez**.

### b) Directorios: contador por **nodo-i**

fsck recorre el árbol desde la raíz y cuenta **en cuántos directorios aparece cada nodo-i** (los vínculos duros suman; los simbólicos no). Después compara con la **cuenta de vínculos** guardada en el nodo-i:

| Caso | Qué pasa | Gravedad |
|---|---|---|
| cuenta **>** entradas | nunca llega a 0, el nodo-i no se libera | desperdicio |
| cuenta **<** entradas | al borrar un nombre llega a 0, se libera, y **el otro nombre queda apuntando a un nodo-i que se va a reasignar** | **catastrófico** |

En los dos casos el arreglo es el mismo: **cuenta = cantidad real de entradas**.

🔗 La cuenta baja es **exactamente el desastre del tema 6**: el nombre viejo termina abriendo otro archivo. Y la **bitácora** existe para no tener que correr fsck sobre todo el disco.

También marca como sospechosos los modos raros como `0007` y los archivos del superusuario con **SETUID** dentro de directorios de usuarios.

---

## 8.3 Rendimiento (págs. 307–312)

Leer una palabra de memoria tarda unos 10 ns; ir al disco, unos 5–10 ms. Es **un millón de veces** más lento.

**Caché de bloques (fig. 4-28):** una tabla de hash por dirección de bloque y una lista doblemente enlazada en orden de uso (LRU).

```
 pedido de bloque ─► ¿está en la caché (hash)? ─ sí ─► se usa, sin disco
                                 │ no
                                 ▼
                     sacar uno (LRU), escribirlo si estaba modificado,
                     leer el pedido del disco a la caché
```

- 🔗 **U3:** es reemplazo de páginas (FIFO, segunda oportunidad, LRU), y el bit de modificado es el **bit M**.
- ⚠️ **El LRU exacto acá SÍ es posible** (hay pocas referencias), **pero no conviene**: un bloque de nodos-i modificado podría quedar mucho tiempo sin escribirse. Por eso se usa un **LRU modificado**:
  - los bloques **esenciales para la consistencia** (todo menos los datos) **se escriben apenas se modifican**;
  - los que no se van a volver a usar pronto van **al frente** de la lista, para reutilizarse primero.

| **UNIX: `sync` cada 30 s** (programa *update*) | **Windows histórico: write-through** |
|---|---|
| + junta escrituras: 1 KB escrito carácter por carácter = 1 E/S | − 1 E/S por carácter |
| − si se cae, se pierden hasta 30 s | + sacar el disquete no rompía nada |
| se impuso con los discos rígidos | hoy existe `FlushFileBuffers` y NTFS tiene bitácora |

**Otras tres técnicas:**
- **Lectura adelantada:** cuando se pide el bloque k, se trae también el k+1. Solo sirve con acceso secuencial: hay **un bit por archivo abierto**, y cada `seek` lo pasa a «aleatorio».
- **Menos movimiento del brazo:**
  - asignar bloques cercanos (fácil con mapa de bits, 🔗 tema 7);
  - poner los nodos-i **en el medio del disco**, o usar **grupos de cilindros** con sus propios nodos-i, bloques y lista libre (fig. 4-29).
- **Desfragmentar:** mover los archivos para hacerlos contiguos (`defrag`). No se pueden mover el archivo de paginación, el de hibernación ni la bitácora. ext2 y ext3 casi no lo necesitan.

### 🎛 Simulador: [fsck.html](unidades/u04-archivos/visuales/fsck.html) (ya te lo abrí)

- **Pestaña 1:** las dos tablas de bloques paso a paso, con los 4 casos de la fig. 4-27, el ejemplo resuelto y un caso mixto. Podés escribir tus propias filas.
- **Pestaña 2:** el recorrido de directorios con la cuenta alta y la baja, y su reparación.
- **Pestaña 3:** los paneles + y − de vaciado físico contra lógico, y de `sync` contra write-through.

📖 *Tanenbaum 4.4.2–4.4.5, págs. 298–312.*

---

### Preguntas rápidas

**1. (Estilo final)** Después de un corte de luz, fsck arma estas tablas en un disco de 10 bloques:

```
 Bloque   0 1 2 3 4 5 6 7 8 9
 En uso   1 0 1 1 2 0 0 1 0 1
 Libres   0 0 0 0 0 1 2 0 1 1
```

- a) Diagnosticá cada bloque con problema y decí cómo lo repara fsck.
- b) ¿Alguno de esos problemas sería imposible si se usara mapa de bits en vez de lista? ¿Cuál y por qué?

**2.** Un usuario de Linux copia un trabajo a un pendrive y lo saca **sin expulsarlo**. Al abrirlo en otra máquina, el archivo está vacío o corrupto. ¿Por qué pasa esto en UNIX y no pasaba con la escritura inmediata (write-through) del Windows viejo? ¿Qué hace «expulsar» por debajo?

<<<<<< MENSAJE 29 >>>>>>

# Corrección del tema 8

### 1a) Bien encaminada: dos bloques correctos y dos a medias

| Bloque | uso / libres | Tu respuesta | Corrección |
|---|---|---|---|
| 1 | 0 / 0 | ✅ faltante, se agrega a libres | — |
| 4 | 2 / 0 | 🟡 la idea está | Faltan dos cosas (abajo) |
| 6 | 0 / 2 | ✅ duplicado en libres, se reconstruye la lista | — |
| 9 | 1 / 1 | ❌ «ver cuál fue el paso reciente» | fsck no puede saber eso (abajo) |

**Bloque 4.** Tenías la mitad: fsck toma un bloque libre (el **5**, el primero libre) y lo saca de la lista. Te faltó:
- **Copiar el contenido** del bloque 4 en el bloque 5 y darle la copia a **uno** de los dos archivos. Si solo agregás un puntero a un bloque vacío, ese archivo pierde sus datos.
- **Avisarle al usuario**, porque seguramente uno de los dos archivos tiene basura y fsck no sabe cuál.

**Bloque 9.** fsck **no tiene historial**: no sabe qué pasó primero. Solo ve dos tablas. La regla es:

```
 en uso por un archivo  +  figura como libre   →   se SACA DE LA LISTA DE LIBRES
```

**Nunca** se le saca el bloque al archivo, porque perderías datos. Si en cambio lo dejás en la lista de libres, el próximo archivo que se cree podría recibirlo y **pisar** los datos.

🧠 **Idea para recordar:** fsck reconstruye la lista de libres como el **complemento de los bloques que usan los nodos-i**. Con eso se arreglan de un saque los bloques 1, 6 y 9. Solo el **duplicado de datos** (bloque 4) necesita un tratamiento especial.

### 1b) ✅ Correcta

El **bloque 6** (duplicado en libres) es imposible con mapa de bits: un bit vale 0 o 1, no puede valer 2.

⚠️ Ojo con generalizar: el mapa de bits **no** evita los otros casos.
- El faltante (1) también puede pasar con un bit en 0 y ningún nodo-i que lo use.
- El de uso y libre a la vez (9) también: un bit en «libre» mientras un nodo-i lo usa.
- El duplicado de datos (4) está en los nodos-i, no en el registro de libres.

### 2) ✅ Correcta, y nombraste el desmontaje, bien ahí

Para afinar el porqué:
- Con escritura **diferida**, el `write` termina cuando los datos llegan a la **caché en RAM**, no al pendrive. Pasan al disco recién con `sync`, que el programa *update* corre cada 30 s.
- Si lo sacás antes, los datos **nunca llegaron** al pendrive. Peor todavía, pueden haber llegado **a medias** los metadatos: nodo-i o FAT, directorio, lista de libres. Eso lo deja **corrupto**, no solo vacío. 🔗 Es el problema de consistencia de este mismo tema.
- Con **write-through**, cada bloque iba al disco en el momento, así que el medio siempre estaba al día. Era más lento, pero se podía sacar sin riesgo.
- **Expulsar = `sync` + desmontar** (se saca de la tabla de montaje), y recién ahí es seguro sacarlo.

### Diagnóstico

- **Firme:** los casos de fsck y la caché con `sync`.
- **A pulir:** el duplicado de datos (**copiar el contenido + avisar**) y el caso de uso y libre (**se saca de libres, nunca del archivo**).

¿Seguimos con el **tema 9: ejemplos de sistemas de archivos** (CD-ROM / ISO 9660, MS-DOS FAT, UNIX V7, y una pasada por NTFS y NFS)?

<<<<<< MENSAJE 30 >>>>>>

Armo la página de este tema: paneles comparativos de los 4 sistemas, una calculadora de FAT-12/16/32 y el codificador de fecha y hora de MS-DOS.

<<<<<< MENSAJE 31 >>>>>>

# Tema 9 de 11: Ejemplos de sistemas de archivos

Este tema no trae teoría nueva: es **ver aplicado** lo de los temas 3 y 4. Cada sistema real eligió una forma de guardar los bloques:

```
                ¿dónde están los bloques?        ¿y los libres?
 ISO 9660   →   CONTIGUOS (inicio + tamaño)      no se registran
 MS-DOS     →   FAT (lista enlazada en RAM)      la misma FAT
 UNIX V7    →   NODO-I (10 directos + indir.)    lista libre
 NTFS       →   TIRADAS en la MFT                mapa de bits
```

⚠️ El **resumen de la cátedra no cubre este tema**. Lo que sigue sale del libro (4.5, 11.8 y 10.6.4), y el programa lo pide en «NTFS» y «servidores de archivos».

---

## 9.1 CD-ROM: ISO 9660 (págs. 312–316)

**Intuición:** se escribe **una sola vez**, así que todo es simplísimo. No hace falta registrar bloques libres porque nunca se borra nada.

- **Objetivo:** que cualquier CD se lea en cualquier máquina. Por eso los números binarios se guardan **dos veces**, en little-endian y en big-endian.
- No hay cilindros sino **una espiral**. Bloques de 2352 B, de los cuales **2048 son datos útiles**.
- **Estructura:** 16 bloques libres (para el arranque, por ejemplo), después el **descriptor de volumen primario** y después el directorio raíz.
- **Archivos contiguos:** la entrada del directorio guarda **primer bloque + tamaño** y con eso basta (🔗 asignación contigua, tema 3).
- **Nombres:** `NOMBRE.EXT;versión`, solo mayúsculas, compatibles con MS-DOS.
- **Límites:** máximo **8 niveles** de directorios; los años se cuentan desde 1900, así que hay un problema en **2156**.
- **Niveles:**
  - **1:** 8+3 y contiguo;
  - **2:** nombres de hasta 31 caracteres;
  - **3:** archivos en varias secciones.
- **Extensiones**, que van en el campo «uso del sistema», así un lector viejo las ignora:
  - **Rock Ridge (UNIX):** PX para los permisos rwx, SL para los vínculos simbólicos, NM para nombres largos, TF para los 3 tiempos.
  - **Joliet (Microsoft):** 64 caracteres Unicode y más de 8 niveles.

⚠️ **Errata del libro:** dice que se adoptó en «1998». **Es 1988**, como dice el mismo libro unas páginas después.

## 9.2 MS-DOS / FAT (págs. 316–320) ★

**Entrada de directorio fija de 32 bytes (fig. 4-31):**

```
 ┌────────┬───┬───┬──────────┬────┬─────┬──────┬────────┐
 │ nombre │ext│atr│reservado │hora│fecha│1er bl│ tamaño │
 │   8    │ 3 │ 1 │    10    │ 2  │  2  │  2   │   4    │  = 32 bytes
 └────────┴───┴───┴──────────┴────┴─────┴──────┴────────┘
```

- **Atributos:** solo lectura, **archivado** (los programas de respaldo lo apagan y cualquier modificación lo vuelve a prender), oculto y sistema.
- **Hora** en 16 bits: horas (5), minutos (6) y **segundos / 2** (5). Por eso la precisión es **±2 s**: 65.536 valores no alcanzan para los 86.400 segundos de un día.
- **Fecha:** año − 1980 (7 bits), mes (4) y día (5). El último año posible es 1980 + 127 = **2107**.
- **Bloques:** la entrada tiene el **primer bloque** y el resto se sigue en la **FAT**, en RAM (🔗 tema 3).
- **Libres:** la **misma FAT**, con un código especial. No hace falta ni mapa de bits ni lista.

**Las versiones de FAT:**

| | Bits | Bloque | Partición máx. |
|---|---|---|---|
| FAT-12 | 12 | 0,5–4 KB | 2–16 MB (disquetes) |
| FAT-16 | 16 | 2–32 KB | hasta **2 GB** (64K × 32 KB) |
| FAT-32 | **28** ⚠️ | 4–32 KB | 1 TB con 4 KB y **tope de 2 TB** (2⁹ × 2³²) |

**El ejemplo del libro, una partición de 2 GB:**
- **FAT-16** está obligada a usar bloques de **32 KB**. Con archivos de 8 KB, **se desperdician 3/4 del disco**.
- **FAT-32** puede usar bloques de **4 KB**, así que no hay desperdicio. Pero la FAT tiene 2 GB / 4 KB = 512K entradas × 4 B = **2 MB de RAM**.

🧠 Es el mismo compromiso del tema 7: **bloque chico = menos desperdicio, tabla más grande**.

## 9.3 UNIX V7 (págs. 320–324)

```
 Entrada de directorio (16 B):   ┌──────────┬────────────────┐
                                 │ nº nodo-i│     nombre     │
                                 │   2 B    │     14 B       │
                                 └──────────┴────────────────┘
```

- Todo lo demás (tamaño, 3 tiempos, dueño, permisos, **cuenta de vínculos** y direcciones) está en el **nodo-i**.
- **10 directos**, más indirecto simple, doble y triple (🔗 tema 4).
- Con 2 B de número de nodo-i, el máximo es **64K archivos por FS**.
- Nombres de hasta 14 caracteres, con cualquier ASCII salvo `/` y NUL.
- 🔗 La búsqueda de `/usr/ast/mbox` (7 lecturas) ya la hiciste en el tema 5.

## 9.4 NTFS (11.8, págs. 906–915)

- Direcciones de **64 bits**, nombres de **255 caracteres Unicode** y clusters de 512 B a 64 KB (casi siempre **4 KB**).
- Un archivo es un **conjunto de atributos** (flujos), no solo una secuencia de bytes. Puede tener flujos extra, como `foo:flujo1`, que **se pierden al copiar** a otro FS.
- **MFT (Master File Table):** registros de **1 KB**, uno por archivo, con pares (encabezado de atributo, valor).
  - Si el valor es **corto, va adentro** del registro: los archivos chicos ni siquiera usan bloques.
  - Si es largo, es **no residente** y el registro apunta a otro lado.
- **Los bloques van en tiradas** (fig. 11-43): pares (dirección, longitud). Ejemplo: `(20,4) (64,2) (80,3)` = 9 bloques en 3 tiradas.
- **Los primeros 16 registros son metadatos:**
  - 0 = `$Mft`, la propia MFT, que **es un archivo**;
  - 1 = el espejo de la MFT;
  - 2 = `$LogFile`, la **bitácora** (🔗 tema 6);
  - 5 = la raíz;
  - 6 = `$Bitmap`, los **libres**;
  - 8 = los bloques defectuosos;
  - 9 = `$Secure`, la seguridad.

## 9.5 NFS: servidores de archivos (10.6.4 y 8.4.4)

- El servidor **exporta** directorios (`/etc/exports`) y el cliente los **monta** donde quiere.
  - El mismo archivo puede llamarse `/usr/ast/trabajo/proy1/a` en un cliente y `/mnt/proy1/a` en otro.
  - El servidor no conoce el punto de montaje.
- **Dos protocolos:**
  - **montaje**, que devuelve un *manejador de archivo*;
  - **acceso** (lookup, read, write).
- **NFSv3 no tiene estado:** no hay open ni close en el servidor.
  - **+** Si el servidor se cae y rearranca, no se pierde nada.
  - **−** Los bloqueos de archivos necesitan otro mecanismo.
  - **NFSv4 sí tiene estado.**
- **Implementación:** el **VFS** (🔗 tema 6) tiene un nodo-v por archivo abierto. El nodo-v apunta a un **nodo-i** si el archivo es local, o a un **nodo-r** si es remoto; en ese caso el cliente NFS manda el mensaje al servidor.
- **Problema de caché:** dos clientes pueden tener el mismo bloque en caché. Se parchea con temporizadores (**3 s** para datos, **30 s** para directorios).
- **Semántica de sesión:** los cambios los ven los demás **recién cuando se cierra el archivo**. Si dos lo modifican a la vez, **gana el que cierra último**.
- **Transparencia de localización** (la ruta no dice dónde está el archivo) **≠ independencia de ubicación** (se puede mover sin cambiarle el nombre). El montaje remoto **no** tiene independencia de ubicación.

### 🎛 [ejemplos_fs.html](unidades/u04-archivos/visuales/ejemplos_fs.html) (ya te la abrí)

1. **Los 4 sistemas lado a lado**, con la entrada de directorio dibujada a escala y sus + y −.
2. **Calculadora de FAT-12/16/32**: partición máxima, la tabla de la fig. 4-32 marcada, la FAT en RAM y el desperdicio. Trae botones con el ejemplo de 2 GB.
3. **Fecha y hora de MS-DOS en bits**: probá una hora con segundos impares y el botón «último día posible».
4. **NFS**: el montaje, las capas y la comparación con y sin estado.

📖 *Tanenbaum 4.5 (págs. 312–324), 11.8 (906–915), 10.6.4 (796–803), 8.4.4 (591–596).*

---

### Preguntas rápidas

**1. (Estilo final)** Tenés una partición de **1 GB** y archivos de **2 KB** en promedio.
- a) Con **FAT-16**, ¿cuál es el bloque **más chico** que podés usar para cubrir 1 GB? ¿Qué porcentaje se desperdicia con cada archivo?
- b) Con **FAT-32** y bloques de **4 KB**, ¿cuánta RAM ocupa la FAT? ¿Y el desperdicio?

**2.** Un cliente está leyendo un archivo por NFSv3 y **el servidor se reinicia** en el medio. Cuando vuelve, el cliente sigue leyendo como si nada. ¿Por qué es posible? ¿Qué tendría que pasar si fuera un servidor con estado?

<<<<<< MENSAJE 32 >>>>>>

# Corrección del tema 9

### 1) ✅ Todo correcto

**a) Bloque de 16 KB, con 87,5 % de desperdicio.** El razonamiento (2¹⁶ entradas, y partición / entradas = bloque mínimo) es exactamente el que se pide.

Para cerrar el dato: en la fig. 4-32, FAT-16 con 16 KB da justo **1024 MB**. Tu partición usa el **100 %** de lo direccionable, o sea que estás **al límite**: si la partición creciera un poco, tendrías que pasar a 32 KB y el desperdicio subiría a 30/32 ≈ 94 %.

**b) 256K entradas × 4 B = 1 MB de RAM, con 50 % de desperdicio.** ✅ Y bien la aclaración de que la entrada ocupa 32 bits pero usa 28.

🧠 La comparación que querría ver en un final: FAT-32 **cambia RAM por disco**. Gasta 1 MB de RAM para pasar de 87,5 % a 50 % de desperdicio. Con FAT-16, la tabla ocupa 64K × 2 B = **128 KB**.

### 2) ✅ Correcta y completa

- **Sin estado:** cada `read` trae el manejador, el desplazamiento y la cantidad, así que no hay nada que perder. Bien explicado, y bien nombrado que no hay `open` ni `close` remotos.
- **Con estado:** se pierden las tablas de archivos abiertos y de bloqueos, y hace falta recuperarlas.

Una aclaración: el «período de gracia» donde los clientes reclaman sus bloqueos es correcto para NFSv4 real, pero **el Tanenbaum no lo describe**. En el examen, quedate con lo del libro: *v3 sin estado → al caer no se pierde nada, pero los bloqueos necesitan un mecanismo aparte; v4 con estado → admite `open`, porque el servidor guarda las estructuras de los archivos abiertos.*

### Un comentario de tutor

Las respuestas están muy prolijas, con fórmulas formateadas. Si las armaste con ayuda, está perfecto para estudiar, pero en el final vas a tener que llegar solo a **2¹⁶ → 64K entradas → 1 GB / 64K = 16 KB**. Probá hacer esa cadena de cabeza una vez más antes de dormir.

### Diagnóstico

- **Firme:** las cuentas de FAT y NFS sin estado contra con estado.

---

¿Seguimos con el **tema 10: protección**? Tiene dominios, matriz de protección, ACL contra capacidades, Bell-La Padula, Biba y canales encubiertos. Es mucho concepto de examen.

<<<<<< MENSAJE 33 >>>>>>

Armo la página de protección: la matriz editable con sus vistas de ACL y capacidades, el evaluador de ACL en orden, Bell-La Padula contra Biba, y el canal encubierto.

<<<<<< MENSAJE 34 >>>>>>

Ya está verificado (36 OK). Lo enlazo y te paso la clase.

<<<<<< MENSAJE 35 >>>>>>

# Tema 10 de 11: Protección

### La intuición

Pensá en un edificio con muchas puertas. Se puede controlar de dos formas:
- **un guardia en cada puerta** con la lista de quién puede pasar: eso es la **ACL**;
- **un llavero para cada persona** con las llaves de las puertas que puede abrir: eso es la **capacidad**.

Es la misma información guardada al revés.

⚠️ El **resumen de la cátedra no cubre este tema**. Viene del libro, capítulo 9.3, y el programa lo pide.

---

## 10.1 Dominios y POLA (págs. 622–625)

- **Objeto:** lo que se protege, sea hardware (CPU, impresora) o software (archivo, semáforo). Cada uno tiene sus **operaciones**: read y write para un archivo, up y down para un semáforo.
- **Derecho:** el permiso para hacer una operación.
- **Dominio:** un conjunto de pares **(objeto, derechos)**. Suele ser un usuario, pero puede ser un grupo.
- **POLA** (*principio de menor autoridad*): cada dominio tiene **lo mínimo necesario**.

```
   Fig. 9-4                 ┌──────────── Dominio 2 ────────────┐
  ┌── Dominio 1 ──┐         │ Archivo1[RW] Archivo4[RWX]        │
  │ Archivo1[R]   │         │ Archivo5[RW]   ┌─────────────┐    │
  │ Archivo2[RW]  │         │                │Impresora1[W]│ ◄── en D2 y D3, mismos derechos
  └───────────────┘         └────────────────┼─────────────┼────┘
   Archivo1: en D1 (R) y en D2 (RW) ◄── mismo objeto, distintos derechos
                                     Dominio 3: Archivo6[RWX] Plotter2[W]
```

**En UNIX, el dominio es el par (UID, GID).** Hay dos formas de **cambiar de dominio**:
- una **llamada al sistema**, que pasa de modo usuario a modo kernel (🔗 U1);
- un `exec` de un archivo con **SETUID o SETGID**, que le cambia al proceso el UID o el GID efectivo.

## 10.2 Matriz de protección (págs. 625–626)

Filas = dominios, columnas = objetos, y cada celda tiene los derechos.

```
           F1    F2    F3          ← Fig. 9-7 / 9-9
    A      RW    R     ·
    B      R     RW    RWX
    C      ·     R     RX
           │                ─────────────────── fila de B = su LISTA DE CAPACIDADES
           └─ columna de F1 = su ACL
```

- **El cambio de dominio** se modela poniendo los **dominios como objetos**, con el derecho **enter** (fig. 9-6). Así se representa un programa SETUID: D1 puede entrar a D2, pero no volver.
- La matriz **no se guarda entera**, porque es enorme y **casi vacía**. Se guarda **por columnas o por filas**, solo con lo que no está vacío.

## 10.3 ACL: por columnas (págs. 626–628)

Cada **objeto** tiene una lista ordenada de quién puede y qué:

```
 F1: A: RW; B: R          F2: A: R; B: RW; C: R          F3: B: RWX; C: RX
```

- **Con grupos (roles):** las entradas son `usuario, grupo: derechos`.
  - Tana, que es administradora (sysadm) y miembro de fanpichones, puede escribir el archivo de contraseñas **solo si inició sesión como sysadm**.
  - `tana, *: RW` le da acceso con cualquier grupo.
- **Se aplica la primera entrada que coincide.**
  - `virgil, *: (nada); *, *: RW` deja pasar a todos **menos a Virgil**.
  - Si invertís el orden, Virgil entra.
- **Revocar es fácil:** se edita la ACL.
  - ⚠️ Pero si se revisa solo al hacer `open`, **un archivo ya abierto conserva los derechos** que tenía.

## 10.4 Capacidades: por filas (págs. 628–631)

Cada **proceso** tiene su **lista-C**. Cada capacidad es un **identificador de objeto + un mapa de bits de derechos**.

**Hay que impedir que el usuario las falsifique.** Tres métodos:
1. **Arquitectura etiquetada:** un bit extra por palabra de memoria que solo toca el kernel (IBM AS/400).
2. **La lista-C dentro del SO**, y el proceso la usa **por posición**: «leer de la capacidad 2». Es la idea de los **descriptores de archivo** de UNIX (Hydra).
3. **Cifrada en espacio de usuario** (Amoeba, fig. 9-10):

```
   ┌──────────┬────────┬──────────┬────────────────────────────────────┐
   │ servidor │ objeto │ derechos │ f(objeto, derechos, comprobación)  │
   └──────────┴────────┴──────────┴────────────────────────────────────┘
   f = función de una vía · la comprobación es un número aleatorio que el servidor NUNCA envía
   → si cambiás "R" por "RW", no podés fabricar el 4.º campo
```

## 10.5 ACL contra capacidades ★ (pág. 631)

| | **ACL** | **Capacidades** |
|---|---|---|
| Verificar un acceso | puede ser una búsqueda larga | inmediato («capacidad 3») |
| Revocar | **fácil y selectivo** | **difícil**: están repartidas por todos lados |
| Revocar en Amoeba | — | cambiar la comprobación → **invalida a todos** |
| Encapsular un proceso | difícil | fácil |
| Se borra el objeto | se va con su ACL | quedan capacidades colgadas |

**El ejemplo resuelto:** sacarle a B la lectura de F1.
- **Con ACL:** se edita la ACL de F1 y listo.
- **Con capacidades administradas por el kernel:** hay que *encontrar* la capacidad de B.
- **Con Amoeba:** se cambia la comprobación de F1, y **A también pierde la suya**.

## 10.6 Sistemas confiables y TCB (págs. 631–633)

- **Sistema confiable:** declaró formalmente sus requisitos de seguridad y los cumple.
- **TCB** (*base de cómputo confiable*): el hardware y el software **mínimos** que hacen cumplir la seguridad. Incluye casi todo el hardware, parte del kernel y los programas SETUID de root.
- **Monitor de referencia:** el punto de la TCB por donde pasan **todas** las llamadas de seguridad (como `open`). No hay forma de saltearlo.
- 🧠 **«Las características son enemigas de la seguridad»:** solo un sistema simple puede ser seguro.

## 10.7 Seguridad multinivel (págs. 633–636)

- **Discrecional:** decide el dueño del archivo.
- **Obligatorio:** decide la organización (militares, hospitales).
- Los niveles van de 0 a 3: no clasificado, confidencial, secreto, alto secreto.

```
            BELL-LA PADULA (secreto)            BIBA (integridad)
 leer       solo MI nivel o ABAJO               solo MI nivel o ARRIBA
            "no leer hacia arriba"              "no leer hacia abajo"
 escribir   solo MI nivel o ARRIBA              solo MI nivel o ABAJO
            "no escribir hacia abajo"           "no escribir hacia arriba"
 resultado  la información solo SUBE            lo de abajo no ensucia lo de arriba
```

🧠 **Bell-La Padula:** el general lee los informes del teniente, y el teniente le puede **escribir** al general, pero no al revés: si no, el general filtraría secretos hacia abajo.

⚠️ **Los dos modelos están en conflicto directo**, así que es difícil tener los dos a la vez.

**Harrison et al.** definieron 6 primitivas: create y delete object, create y delete domain, insert y remove right. Para un sistema arbitrario **no se puede probar** que nunca llegue a un estado no autorizado; para uno concreto, sí.

## 10.8 Canales encubiertos (págs. 636–641)

**Modelo de Lampson:** un **cliente** le da sus datos a un **servidor**, y un **colaborador** quiere robárselos. El problema de impedirlo se llama **confinamiento**.

La matriz puede prohibir que el servidor escriba archivos o le mande mensajes. Pero el servidor puede **modular algo observable**, un bit por intervalo:
- **CPU:** a fondo para un 1, inactiva para un 0. El colaborador mide su propio tiempo de respuesta. Es ruidoso, pero con **Hamming** se vuelve confiable.
- **Fallos de página:** muchos para un 1, ninguno para un 0.
- **Bloquear un archivo** (fig. 9-15, flujo `11010100`): ni siquiera hace falta que el colaborador pueda abrirlo.

⚠️ **Ningún modelo basado en la matriz puede evitarlos.** Encontrarlos todos es muy difícil y cerrarlos, casi imposible.

- **Esteganografía:** esconder **que existe** el mensaje. El ejemplo del libro: 5 obras de Shakespeare en los bits bajos de una foto de cebras, 1024 × 768 × 3 bits = 294.912 B.
- **Marcas de agua:** el mismo truco para probar la autoría.
- 🧠 El programa de la materia dice «canales de **conversión**»: es el mismo tema, que en el libro se llama canales **encubiertos** (*covert channels*).

### 🎛 [proteccion.html](unidades/u04-archivos/visuales/proteccion.html) (ya te la abrí)

1. **La matriz editable:** tocás un derecho y se actualizan en vivo la ACL y las listas-C. Pasando el mouse por una celda se pinta su columna y su fila. El botón «Quitarle a B la lectura de F1» compara los tres casos de revocación.
2. **La ACL en orden, paso a paso:** Tana con sus dos roles, Virgil y el caso del orden invertido.
3. **Bell-La Padula contra Biba:** elegís el nivel del proceso y ves qué puede leer y escribir en cada modelo.
4. **El canal encubierto:** escribís bits y elegís la técnica.

📖 *Tanenbaum 9.3, págs. 622–641.*

---

### Preguntas rápidas

**1. (Estilo final)** Tenés esta matriz de protección:

```
           notas.txt   nomina.db   compilar
  Ana      RW          ·           X
  Beto     R           RW          ·
  Caro     ·           R           RX
```

- a) Escribí las **ACL** de cada objeto y las **listas de capacidades** de cada usuario.
- b) Hay que quitarle a Beto **todo** acceso a `nomina.db`. ¿Qué hay que hacer con ACL? ¿Y con capacidades cifradas tipo Amoeba? ¿Qué le pasa a Caro en cada caso?

**2.** Dos situaciones:
- a) Un proceso de nivel **Secreto** quiere **escribir** un informe en un archivo **Confidencial**. ¿Lo permite Bell-La Padula? ¿Y Biba? ¿Por qué?
- b) Un archivo tiene la ACL `*, alumnos: R; juan, *: RW`. Juan, que inició sesión con el grupo **alumnos**, quiere **escribir**. ¿Puede? ¿Por qué?

<<<<<< MENSAJE 36 >>>>>>

# Corrección del tema 10

### 1a) ✅ Correcta

Las ACL son las columnas y las listas-C son las filas, todo bien.

Un detalle de forma: en una ACL **no se escribe** a quien «no entra». La lista guarda solo las celdas no vacías, y quien no figura no tiene acceso. Queda así:

```
notas.txt: Ana: RW; Beto: R       nomina.db: Beto: RW; Caro: R       compilar: Ana: X; Caro: RX
```

Esa es justamente la razón de guardarla así: **no gastar lugar en las celdas vacías**.

### 1b) ✅ Correcta

- **Con ACL:** se borra la entrada de Beto en la ACL de `nomina.db`, y Caro **no se entera**. Eso es la revocación selectiva.
- **Con Amoeba:** se cambia la comprobación de `nomina.db`, y la capacidad de Caro **también deja de valer**. El servidor tiene que **darle una capacidad nueva** a Caro (y a todos los que tengan que conservar el acceso), pero no a Beto.

🧠 Dos cosas para sumar puntos en el examen:
- Con ACL, si Beto **ya tenía abierto** `nomina.db` y la ACL se revisa solo en `open`, conserva el acceso **hasta que cierre**.
- Con capacidades, Beto pudo haberle **copiado** la suya a otro antes, y hay que encontrarlas todas.

### 2a) ✅ El resultado está bien, pero la razón de Bell-La Padula no

- **Bell-La Padula: NO**, por la **propiedad \*: no escribir hacia abajo**.
  - ⚠️ El motivo no es «me puedo equivocar». El modelo supone que **el proceso puede ser malicioso**, por ejemplo un troyano que corre con tu nivel.
  - Si un proceso Secreto pudiera escribir en Confidencial, **copiaría información secreta a un nivel donde la leen personas sin autorización**. Por eso la información solo puede **subir**.
- **Biba: SÍ**, por la integridad simple: escribir hacia **abajo** está permitido. Lo de arriba no se ensucia, porque un nivel alto es más confiable que uno bajo. ✅
- 🧠 Este es un ejemplo exacto del **conflicto directo** entre los dos modelos: en la misma situación, uno dice que no y el otro que sí.

### 2b) ✅ Correcta

Juan coincide con la primera entrada (`*, alumnos`), que solo da **R**, así que no puede escribir. La entrada `juan, *: RW` **nunca se llega a mirar**.

⚠️ Esta es la trampa típica: **gana la primera que coincide, no la más específica**. Para que Juan pueda escribir, su entrada tiene que ir **antes**.

### Diagnóstico

- **Firme:** ACL contra capacidades, la revocación y la ACL ordenada.
- **A pulir:** el *porqué* de Bell-La Padula. Pensalo como **fuga hacia abajo**, no como un error humano.

---

¿Seguimos con el **tema 11, el último: Linux** (ext2, ext3, las tres tablas de archivos abiertos, `/proc`) y los **comandos de la cátedra** (`fstab`, `lsblk`, `mount`, `ln`)? Después hacemos el cierre de la unidad.

<<<<<< MENSAJE 37 >>>>>>

Armo el simulador de las tres tablas (descriptores → descripción de archivo abierto → nodos-i) con los tres diseños del libro, y un explicador de líneas de `/etc/fstab`.

<<<<<< MENSAJE 38 >>>>>>

# Tema 11 de 11: el sistema de archivos de Linux y los comandos de la cátedra

Es el **caso de estudio** que junta todo lo de la unidad en un sistema real:

```
 llamadas (open, read, lseek…) ──► VFS (superbloque, nodo-i, dentry, file)
                                        │
                     ┌──────────────────┼──────────────────┐
                    ext2               ext3               /proc
            grupos de bloques     ext2 + bitácora     archivos que no
            2 mapas de bits         (JBD)             existen en disco
```

---

## 11.1 Conceptos y llamadas al sistema (10.6.1–10.6.2, págs. 779–787)

- **Archivo:** una secuencia de bytes, sin distinguir ASCII de binario. Nombres de hasta 255 caracteres; las **extensiones son convenciones**, no las exige el sistema.
- **Archivos especiales:**
  - **de caracteres:** `/dev/tty`, `/dev/lp`;
  - **de bloques:** `/dev/hd1`, que permite leer la partición cruda (así trabajan `mkfs` y **fsck**, 🔗 tema 8).
- **Montaje:** un solo árbol. El DVD se monta en `/b` en vez de aparecer como `D:`.
- **Bloqueo POSIX:** desde un byte hasta el archivo entero.
  - **Compartido:** varios a la vez.
  - **Exclusivo:** ninguno más.
  - Si A bloquea 4–7, B 6–9 y C 2–11 (todos compartidos), un pedido **exclusivo del byte 9** espera a que liberen **B y C**.

| Llamada | Qué hace |
|---|---|
| `fd = open(nombre, cómo)` | devuelve el **descriptor libre más chico** |
| `creat(nombre, modo)` | crea el archivo, o lo **trunca a 0** si existía |
| `n = read(fd, buf, n)` / `write` | avanzan la **posición** del archivo |
| `lseek(fd, desp, de_dónde)` | mueve la posición. 🧠 **Nunca mueve el brazo del disco**, solo cambia un número |
| `stat` / `fstat` | dispositivo, nº de nodo-i, modo, vínculos, dueño, grupo, tamaño, 3 tiempos |
| `link` / `unlink` | 🔗 tema 5: con el último `unlink`, el archivo desaparece |

Los descriptores **0, 1 y 2** (entrada, salida y error estándar) ya están abiertos. Por eso `sort` no sabe a qué archivo escribe: el shell redirigió el fd 1 antes de arrancarlo.

## 11.2 El VFS de Linux (pág. 787)

🔗 Es el tema 6 hecho realidad, con 4 objetos:
- **superbloque:** describe un FS;
- **nodo-i:** describe un archivo;
- **dentry:** una entrada de directorio, un componente de la ruta. Se guardan en caché, la *dentry_cache*;
- **file:** un archivo abierto, el que crea `open`.

## 11.3 ext2 (págs. 788–793) ★

```
 ┌───────┬─────────────┬─────────────┬─────────────┬─────
 │bloque0│   grupo 0   │   grupo 1   │   grupo 2   │ …
 │(boot) │             │             │             │
 └───────┴──────┬──────┴─────────────┴─────────────┴─────
                ▼
  ┌──────────┬──────────┬──────────┬──────────┬────────┬───────────────┐
  │superblq. │descriptor│ mapa bits│ mapa bits│ nodos-i│ bloques de    │
  │          │ de grupo │ BLOQUES  │ NODOS-I  │        │ datos         │
  └──────────┴──────────┴──────────┴──────────┴────────┴───────────────┘
```

- **Dos mapas de bits** de un bloque cada uno (🔗 tema 7). Con bloques de 1 KB: 8192 bloques y 8192 nodos-i por grupo.
- **Política de ubicación:** el archivo va al **mismo grupo que su directorio**, y los datos al mismo grupo que su nodo-i (🔗 los grupos de cilindros del tema 8). Además preasigna **8 bloques extra** para que el archivo crezca sin fragmentarse.
- **Nodo-i de 128 B.** La raíz es el **nodo-i 2**, porque el 1 se reserva para los bloques defectuosos. Tiene **12 directos** y después simple, doble y triple, más un **número de generación** que sube cada vez que el nodo-i se reutiliza.
- **Directorio (fig. 10-32):** entradas de la forma (nº de nodo-i, `rec_len`, tipo, longitud del nombre, nombre), **sin ordenar**.
  - 🧠 Al borrar `voluminoso`, el `rec_len` de la entrada anterior se **agranda** y la tapa. No se compacta nada.

**El ejemplo resuelto: `lseek` al byte 300.000**, con bloques de 1 KB y 256 direcciones por bloque.

```
 bloque lógico = 300.000 div 1024 = 292      desplazamiento = 300.000 − 292·1024 = 992
 0–11 directos  ·  12–267 simple (256)  ·  268 en adelante → DOBLE
 292 − 268 = 24 → entrada 24 div 256 = 0 del doble · entrada 24 mod 256 = 24 del simple
 lecturas (con el nodo-i en RAM): doble → simple → datos = 3
```

⚠️ **Errata del libro:** escribe «10 + 2¹⁶ bloques», que mezcla los **10** directos de V7 con los **12** de Linux. Con 12 directos son 12 + 256 + 65.536 bloques.

### Las tres tablas (fig. 10-34) ★★

```
  proceso A                proceso B
 ┌─ descriptores ─┐      ┌─ descriptores ─┐          ① por proceso
 │ fd 3 ──┐       │      │ fd 3 ──┐       │
 └────────┼───────┘      └────────┼───────┘
          ▼                       ▼
   ┌──────────────┐        ┌──────────────┐           ② descripción de archivo abierto
   │ POSICIÓN 120 │        │ POSICIÓN 0   │              (posición + modo)
   └──────┬───────┘        └──────┬───────┘
          └───────────┬───────────┘
                      ▼
               ┌────────────┐                         ③ nodo-i (uno por archivo abierto)
               │ nodo-i 42  │
               └────────────┘
```

**¿Por qué hace falta la tabla del medio?** El libro descarta dos diseños:
1. **Posición en el nodo-i:** dos procesos **no relacionados** compartirían la posición, y uno le correría la lectura al otro.
2. **Posición en el descriptor:** en `(p1; p2) > x`, p2 hereda una **copia** de la posición del shell, que sigue en 0, y **pisa** lo que escribió p1.

La solución es la tabla intermedia:
- **`fork`** copia el descriptor, pero apunta a la **misma** descripción, así que la posición se **comparte**.
- **`open`** crea una descripción **nueva**, con posición **propia**.

## 11.4 ext3: con bitácora (págs. 793–795)

🔗 Es el tema 6 aplicado:
- Un **registro de transacciones** secuencial, que es rápido porque el brazo no salta.
- Después se **confirma** cada cambio en su lugar. Si se cae, al reiniciar se recorre el registro.
- **Compatible con ext2:** mismas estructuras.
- El registro es un **búfer circular** y lo maneja el **JBD**, con tres niveles:
  - **registro del diario:** un cambio dentro de un bloque;
  - **operación atómica:** todos los cambios de una llamada, por ejemplo un `write`. Se aplican **todos o ninguno**;
  - **transacción:** varias operaciones juntas, por eficiencia.
- Se configura para registrar **todo** o **solo los metadatos**. Lo segundo es más rápido, pero **no protege los datos**.

## 11.5 /proc (pág. 795)

- Hay un directorio por **PID** (`/proc/619`). Sus archivos **no existen en el disco**: el kernel los genera al leerlos.
- También tiene información de CPU, particiones, módulos y más.
- 🔗 U2 y U3: `/proc/PID/status` y `/proc/meminfo`.

## 11.6 Comandos de la cátedra ★

**`/etc/fstab`**, con 6 columnas:

```
 UUID=xxxx-xxxx   /home    ext4    defaults    0      2
 └─ dispositivo   └─ punto └─ tipo └─ opciones └─dump └─ pass (orden de fsck: 1 raíz · 2 resto · 0 no)
```

⚠️ **fstab dice qué se monta *al arrancar*, no qué está montado ahora.** Lo montado ahora se ve con `cat /proc/mounts`, `mount` o `findmnt`.

**`lsblk -f`** muestra NAME, FSTYPE, FSVER, LABEL, UUID, FSAVAIL, FSUSE% y MOUNTPOINTS.

**La práctica de la imagen de disco:**

```
 dd if=/dev/zero of=mi_imagen.img bs=1M count=100   → 100 MB de ceros (todavía no es un FS)
 mkfs.ext4 mi_imagen.img                             → ahora sí: un FS ext4 adentro
 sudo mount -o loop mi_imagen.img /mnt/mi_imagen     → loop: un archivo como dispositivo de bloques
 df -h | grep mi_imagen                              → espacio
 sudo umount /mnt/mi_imagen                          → desmontar (hace sync, 🔗 tema 8)
 … | sudo tee -a /etc/fstab ;  sudo mount -a         → que se monte sola, y probarlo
```

⚠️ **Lo que no está en el material:**
- El programa nombra **ext4, xfs, btrfs y zfs**, pero el libro llega hasta ext3 y la cartilla solo los nombra como valores de FSTYPE.
- La pregunta típica de **«averiguar el tamaño de bloque de una partición ext4»** no tiene comando en la cartilla. Como complemento fuera del material: `sudo tune2fs -l /dev/sdXN` (la línea *Block size*) o `stat -f /punto`.

### 🎛 [tres_tablas.html](unidades/u04-archivos/visuales/tres_tablas.html) (ya te la abrí)

1. **Las tres tablas paso a paso.** Elegís **dónde se guarda la posición** (Linux real, en el descriptor o en el nodo-i) y uno de 4 escenarios: `(p1; p2) > x`, procesos no relacionados, `fork` y doble `open`. Así ves **en qué escenario falla cada diseño**.
2. **El explicador de `/etc/fstab`:** pegás una línea y te explica las 6 columnas, con avisos si el *pass* está mal. Debajo está la tabla de comandos.

Para el ejemplo del byte 300.000 usá el preset **ext2** de [inodos.html](unidades/u04-archivos/visuales/inodos.html).

📖 *Tanenbaum 10.6.1–10.6.3, págs. 779–796 · Cartilla de comandos de la cátedra.*

---

### Preguntas rápidas (las últimas de la unidad)

**1. (Estilo final)** Un proceso P hace `fd = open("datos", O_RDONLY)`, lee 100 bytes y después hace `fork()`. El hijo H lee 50 bytes. Mientras tanto, un proceso Q que no tiene nada que ver hace su propio `open("datos")` y lee 10 bytes.
- a) ¿Desde qué byte lee H? ¿Y Q?
- b) Si ahora P hace `read(fd, buf, 20)`, ¿desde qué byte lee? ¿Cuántas entradas hay en cada una de las tres tablas para el archivo `datos`?

**2.**
- a) En ext2, con bloques de 1 KB y direcciones de 4 B, un proceso lee el **byte 20.000**. ¿Qué bloque lógico es, en qué nivel cae, qué entrada usa y cuántas lecturas a disco hacen falta, con el nodo-i ya en memoria?
- b) Explicá esta línea de fstab: `UUID=ab12 /datos xfs ro,noauto 0 0`. ¿Se monta al arrancar? ¿La revisa fsck?

<<<<<< MENSAJE 39 >>>>>>

# Corrección del tema 11

### 1) ✅ Todo correcto

- **a)** H lee desde el **100**, porque comparte la descripción con P después del `fork`. Q lee desde el **0**, porque su `open` crea una descripción propia.
- **b)** P lee desde el **150**, porque H avanzó la posición compartida.
- **Tablas:** 3 descriptores, 2 descripciones y 1 nodo-i. Es la respuesta exacta.

🧠 Es el caso que más se toma de este tema, y lo resolviste completo.

### 2) ✅ Todo correcto

- **a)** El bloque lógico es el **19**, con desplazamiento 544. Cae en el indirecto simple, entrada **7**, con **2 lecturas**.
- **b)** Las 6 columnas están bien, y también las conclusiones:
  - `noauto` → **no** se monta al arrancar;
  - pass `0` → fsck **no** la revisa.

  Para sumar: aunque tenga `noauto`, como está en fstab alcanza con `mount /datos`, sin repetir el dispositivo ni el tipo.

### Sobre el formato

La respuesta terminaba con «¡Felicitaciones! Ya resolviste…», así que la armaste con otra IA. Para entender está bárbaro, pero para el final te recomiendo un ejercicio: **tapá la respuesta y rehacé de cabeza el 1b y el 2a**, que son los dos que más se toman. Si te salen solos, el tema está firme de verdad. El cuestionario de la unidad te va a servir para medir lo que te sale sin ayuda.

---

# 🏁 Cierre de la Unidad 4: Sistemas de archivos

### Lo más importante, en 8 puntos

1. **Archivo = abstracción del disco.** Nombre, tipo, acceso secuencial o aleatorio, atributos. Ruta **absoluta** (desde `/`) contra **relativa** (desde el directorio de trabajo), más `.` y `..`.
2. **Las tres formas de guardar los bloques:**
   - **contigua:** rápida, pero fragmenta (es la del CD-ROM);
   - **lista enlazada / FAT:** la tabla está en RAM, y en la cadena **se cuentan clusters, no saltos**;
   - **nodo-i:** solo en RAM los de archivos abiertos, con directos, simple, doble y triple.
3. **Cuentas de nodo-i ★:**
   - máximo = (D + P + P² + P³) · B, con P = B / tamaño de puntero;
   - lecturas con el nodo-i en RAM: directo 1, simple 2, doble 3, triple 4.
4. **Vínculos:**
   - **duro** = otra entrada al **mismo nodo-i**. Sube el contador, el archivo sigue vivo después del `rm` y la cuota la paga el dueño. No cruza particiones.
   - **simbólico** = un archivo con una **ruta**. Puede quedar colgado y sí cruza particiones.
5. **Consistencia:**
   - El orden del borrado importa (directorio → nodo-i → bloques).
   - La **bitácora** hace atómicas las operaciones y exige que sean **idempotentes**: «poner un bit en 1» sí lo es; «incrementar» no.
   - Si no hay bitácora, **fsck** compara contadores: de bloques (uso + libres = 1) y de directorios (cuenta del nodo-i contra entradas reales).
6. **Espacio en disco ★:**
   - **fragmentación interna = bloque − resto**, siempre con el resto exacto (la errata de la práctica: **2554, no 2580,48**);
   - bloque grande = rápido pero con desperdicio;
   - **mapa de bits** (1 bit por bloque, tamaño fijo) contra **lista** (32 bits por bloque libre; gana con el disco casi lleno).
7. **Protección:**
   - matriz por columnas = **ACL** (revocar es fácil y selectivo);
   - por filas = **capacidades** (verificar es rápido; revocar es difícil);
   - en una ACL **gana la primera entrada que coincide**;
   - **Bell-La Padula** (secreto: no leer arriba, no escribir abajo) contra **Biba** (integridad: al revés);
   - los **canales encubiertos** no los frena ninguna matriz.
8. **Linux:**
   - ext2 tiene grupos de bloques con **2 mapas de bits**;
   - las **3 tablas** (descriptor → descripción con **posición** → nodo-i): `fork` comparte la posición y `open` no;
   - ext3 = ext2 + bitácora;
   - **fstab** tiene 6 columnas (la última es el orden de fsck) y dice lo que se monta **al arrancar**.

### Lo que más se toma en los finales

| Tipo | Ejercicio |
|---|---|
| 🔢 Práctico | Seguir una **cadena FAT** y calcular cuántos bloques ocupa y qué espacio desperdicia |
| 🔢 Práctico | **Tamaño máximo con nodo-i** y **en qué nivel cae un byte**, con cuántas lecturas |
| 🔢 Práctico | **Fragmentación interna en FAT32** (sectores por bloque, BPB, resto exacto) |
| 🔢 Práctico | Diagnosticar las **tablas de fsck** |
| 🧠 Concepto | Vínculo duro contra simbólico: contador, `rm`, cuota, particiones |
| 🧠 Concepto | ACL contra capacidades y la revocación; Bell-La Padula contra Biba |
| 🧠 Concepto | Las 3 tablas con `fork` y `open` |
| 🐧 Linux | Leer una línea de **fstab** y los comandos `lsblk`, `mount`, `ln` |

### ⚠️ Tus errores de la unidad (van al mapa conceptual)

- **Tema 5:** creer que el **simbólico** mantiene vivo el archivo. Es el **duro**, y la cuota la paga el dueño.
- **Tema 6:** confundir *idempotente* con «está bien hecho». Y olvidarte de que el nodo-i liberado **se reasigna**, así que el nombre viejo abre otro archivo.
- **Tema 7:** medir la fragmentación contra el **sector** en vez del **cluster** (448 en vez de 7616), y sumar dos veces el resto.
- **Tema 8:** en un duplicado de datos, olvidarte de **copiar el contenido y avisar**. En el caso de uso y libre a la vez, el bloque se saca de la **lista de libres, nunca del archivo**.
- **Tema 10:** justificar Bell-La Padula con «me puedo equivocar». Es **fuga de información hacia abajo**, por ejemplo con un troyano.

---

### ¿Cómo seguimos?

Según el plan, después de la clase vienen:
1. el **`repaso_u04.pdf`**, con todo lo que vimos en el chat;
2. la ampliación del **mapa conceptual** con la U4 y sus cruces con U1–U3 (incluye tus ⚠️);
3. el **cuestionario de la U4**, difícil, sin las respuestas a la vista.

Decime **«cuestionario unidad 4»** y te armo las tres cosas en ese orden.

<<<<<< MENSAJE 40 >>>>>>

Dale: el cuestionario de la U4 queda pendiente junto con los de la U1, U2 y U3. Ahora armo el PDF de repaso, el mapa conceptual y los nodos del mapa gráfico. Primero miro cómo se hicieron en la U3.