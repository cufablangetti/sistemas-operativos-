# Respuestas — Cuestionario Unidad 1

> **NO MOSTRAR AL ESTUDIANTE** salvo que lo pida explícitamente.
> Todos los ejercicios numéricos están verificados con `_trabajo/verificar_cuestionario_u01.py`.

Total: 100 puntos.

---

## Parte A — Opción múltiple (18 p)

### 1. (3 p) → **b)**

El hardware verifica el bit de modo del PSW, impide la ejecución y genera un trap al kernel.

**Por qué las otras están mal:**
- **a)** El SO no "revierte" nada: la instrucción nunca llega a ejecutarse.
- **c)** Es el error conceptual clásico. Describe lo que pasaría *si* la protección no existiera.
- **d)** Deshabilitar interrupciones es una operación global del procesador, no por proceso.

**Clave de corrección:** si eligió c), señalar que la protección es **preventiva** (barrera previa), no un castigo posterior, y que la detecta el **hardware**, no el SO.

*(Tanenbaum, cap. 1.3.1, impresas 19–23)*

### 2. (3 p) → **c)**

Los tres métodos insumen el mismo tiempo total; lo que varía es el consumo de CPU.

**Por qué las otras están mal:**
- **a)** Distractor principal. El DMA **no acelera la transferencia**: la duración la impone el dispositivo.
- **b)** Falso: para un dispositivo muy rápido, una interrupción por byte es peor que el DMA, y en el arranque se usa E/S programada porque no hay manejadores de interrupción instalados todavía.
- **d)** Invertido: en E/S programada la CPU queda **sondeando** (espera ocupada), no bloqueada.

*(Tanenbaum, cap. 1.3.5, impresas 27–30)*

### 3. (3 p) → **c)**

TRAP cambia el modo de ejecución y salta a una dirección fija; la llamada a procedimiento no cambia el modo y puede saltar a cualquier dirección.

**Por qué las otras están mal:**
- **a)** Las dos guardan la dirección de retorno.
- **b)** Está invertido: TRAP es el que **no** puede saltar a una dirección arbitraria. Ese es justamente el control de seguridad.
- **d)** Solo TRAP cambia el modo.

*(Tanenbaum, cap. 1.6, impresas 50–52)*

### 4. (3 p) → **c)**

El driver corre en modo usuario y solicita la operación al microkernel mediante una llamada al sistema; el microkernel verifica que el puerto le corresponda y la ejecuta.

**Por qué las otras están mal:**
- **a)** En un microkernel los drivers **no** corren en modo kernel: esa es toda su razón de ser.
- **b)** Si cediera los privilegios permanentemente, se perdería la protección y la estructura no tendría sentido.
- **d)** El servidor de archivos también corre en modo usuario.

**Concepto que se evalúa:** *mecanismo en el kernel, política en el espacio de usuario*. El microkernel le da acceso **solo a los puertos de su dispositivo**.

*(Tanenbaum, cap. 1.7.3, impresas 64–67)*

### 5. (3 p) → **b)**

`AH = 09h`, dirección en `DS:DX`, cadena terminada en `$`.

**Por qué las otras están mal:**
- **a)** Mezcla la función 02h (un carácter, en DL) con una cadena. Es el error típico nº 4 de la cátedra.
- **c)** Mezcla la 09h de DOS con los parámetros de la **13h de INT 10h** (ES:BP y longitud en CX). Distractor fuerte.
- **d)** `0Eh` es de **INT 10h**, no de INT 21h, y muestra un solo carácter desde AL.

*(Apunte: Interrupciones (1).pdf y Tp5 - Tabla Interrupciones.pdf)*

### 6. (3 p) → **b)**

Procesamiento por lotes, sin multiprogramación.

**Clave:** la pista decisiva es *"un único trabajo en memoria por vez"*. Lotes = trabajos en fila, sin pausas entre ellos. Multiprogramación = **varios en memoria simultáneamente**. Se pueden combinar, pero acá explícitamente no están combinados.

*(Tanenbaum, cap. 1.2.2 y 1.2.3, impresas 8–12)*

---

## Parte B — Verdadero o falso justificado (10 p, 2 p cada ítem)

### 7a) **FALSO**

El disco contiene **dos recursos distintos**: la superficie magnética se multiplexa en el **espacio** (cada usuario recibe sus bloques), pero el **brazo/cabezal**, que es uno solo, se multiplexa en el **tiempo**. De ahí salen los algoritmos de planificación de disco (FCFS, SSTF, SCAN) de la Unidad 5.

*Puntaje parcial (1 p): si responde "falso" sin identificar los dos recursos.*

### 7b) **FALSO**

En la estructura por capas **todo sigue corriendo en modo kernel**, solo que organizado jerárquicamente. Un driver que falla tumba el sistema igual que en la monolítica. Lo que aportan las capas es **claridad y facilidad de depuración**, no tolerancia a fallas. La confiabilidad la da el **microkernel**, que saca los drivers a modo usuario.

*Este ítem detecta un error que es muy común. Si lo falla, reexplicar con la visualización.*

### 7c) **FALSO**

Muestra la cadena **y después basura**. La función 09h recorre la memoria desde `DS:DX` imprimiendo caracteres y **solo se detiene al encontrar un `$`**. Sin el terminador sigue leyendo bytes de memoria —restos de otros programas— e interpretándolos como caracteres, hasta toparse con un `$` por casualidad.

### 7d) **FALSO**

El BIOS **nunca lee un archivo**. Solo sabe pedirle al hardware *"dame el sector 0"*, que es una operación nativa de la controladora del disco. El concepto de archivo es una abstracción construida por software sobre miles de sectores, y entenderla exigiría conocer el formato de cada sistema de archivos. Por eso el BIOS puede arrancar cualquier disco sin saber si tiene NTFS, ext4 o FAT32.

### 7e) **FALSO**

Se lee **exactamente la misma cantidad de datos** del disco. Lo que se reduce es la cantidad de **llamadas al sistema**, es decir, de cruces de la frontera usuario→kernel, cada uno con su TRAP, cambio de modo y consulta de tabla.

---

## Parte C — Ejercicios prácticos (34 p)

### 8. (6 p) Jerarquía de memoria

**a) (4 p)**

```
Acierto (90 %):  2 ns
Fallo   (10 %):  2 ns (consultar la caché) + 60 ns (ir a la RAM) = 62 ns

Tm = 0,90 × 2 + 0,10 × 62
   = 1,8 + 6,2
   = 8,00 ns

Mejora = 60 / 8,00 = 7,50 veces más rápido que sin caché
```

**Error frecuente:** olvidar sumar el tiempo de consultar la caché en el caso de fallo (daría 0,90×2 + 0,10×60 = 7,8 ns). *Restar 1 p.*

**b) (2 p)**

```
h × 2 + (1 − h) × 62 ≤ 6
2h + 62 − 62h ≤ 6
−60h ≤ −56
h ≥ 56/60 = 0,9333  →  93,33 %

Comprobación: 0,9333 × 2 + 0,0667 × 62 = 6,00 ns ✓
```

Observación que suma: subir de 90 % a 93,33 % de aciertos mejora el tiempo un 25 %. **La caché vale lo que vale la localidad del programa.**

*(Tanenbaum, cap. 1.3.2, impresas 23–26)*

### 9. (8 p) Costo de CPU de la entrada/salida

**a) (1 p)**
```
Duración total = 2048 bytes × 25 µs = 51.200 µs = 51,2 ms
IGUAL en los tres métodos: la impone el dispositivo.
```

**b) (5 p)**

| Método | Cálculo | CPU | % sobre 51,2 ms |
|---|---|---|---|
| Programada | sondea toda la transferencia | 51.200 µs | **100 %** |
| Interrupciones | 2048 × 8 µs | 16.384 µs | **32 %** |
| DMA | 30 µs setup + 8 µs interrupción | 38 µs | **0,0742 %** |

**c) (2 p)**
```
51.200 − 16.384 = 34.816 µs = 34,816 ms libres (el 68 %)
```

**Observación de nivel alto (bonus, no obligatoria):** con estos números, la E/S por interrupciones ya consume un **32 %** de la CPU, muy lejos del 5 % del ejemplo visto en clase. La razón es que la relación entre el costo de la interrupción (8 µs) y el tiempo por byte (25 µs) es mucho menos favorable. **Cuanto más rápido el dispositivo, menos sirven las interrupciones por byte.**

### 10. (5 p) Multiprogramación

**a) (3 p)** Modelo: aprovechamiento = 1 − p^n, con p = 0,60

```
n = 1  →  1 − 0,60    = 0,4000  →  40,00 %
n = 2  →  1 − 0,36    = 0,6400  →  64,00 %
n = 4  →  1 − 0,1296  = 0,8704  →  87,04 %
```

**b) (2 p)**
```
1 − 0,6^n > 0,90   →   0,6^n < 0,10   →   n > log(0,10)/log(0,60) = 4,508

→ n = 5 procesos

Comprobación: n=4 → 87,04 % (no alcanza);  n=5 → 92,22 % ✓
```

*Aceptar también la resolución por tabla, probando valores.*

*(Tanenbaum, cap. 2.1.7, impresas 93–95)*

### 11. (6 p) Sector de arranque

**a) (2 p) → 64 bytes.**

La tabla del MBR tiene **siempre 4 entradas de 16 bytes**, estén usadas o no, porque son de **tamaño fijo**. Que haya 3 particiones en vez de 4 no cambia nada: la cuarta entrada existe, vacía.

**El concepto que se evalúa:** la tabla **describe** las particiones, no las contiene. Un renglón de 16 bytes describe una partición de cualquier tamaño porque solo guarda números (sector de inicio y cantidad de sectores).

*Si contestó algo proporcional al tamaño de las particiones (4 TB, etc.), es el error conceptual central del tema: 0 p en este ítem y reexplicar.*

**b) (1 p) → 446 bytes.** `512 − 64 − 2 = 446`

**c) (3 p)**

El MBR guarda "cantidad de sectores" en un campo de **4 bytes**. El valor máximo es 2³² − 1 sectores, que a 512 bytes por sector da:

```
(2³² − 1) × 512 B = 2.199.023.255.040 B ≈ 2,00 TB
```

Una partición de 4 TB **no entra en el campo**. El límite no viene del disco ni del sistema de archivos: **viene del tamaño del casillero en la tabla**.

**Solución:** usar **GPT** en lugar de MBR. GPT usa campos de 8 bytes, lo que lleva el límite a (2⁶⁴ − 1) × 512 B ≈ 8 ZB, y además admite muchas más particiones que 4.

### 12. (4 p) Llamadas al sistema

**a) (2 p)**
```
64 KB = 64 × 1024 = 65.536 bytes

Con buffer de  2 KB:  65.536 / 2.048  = 32 llamadas a read()
Con buffer de 16 KB:  65.536 / 16.384 =  4 llamadas a read()
                                          → 8 veces menos
```

**b) (2 p)**

- **Se ahorra:** el trabajo del kernel. 28 cruces menos de la frontera usuario→kernel, cada uno con su TRAP, cambio de modo, consulta de la tabla de manejadores y retorno (los 11 pasos de `read`).
- **NO se ahorra:** la lectura del disco. Se traen exactamente los mismos 64 KB.

### 13. (5 p) Interrupciones por segundo

**a) (1 p)**
```
10 int/s × 5 µs = 50 µs de CPU por segundo = 0,005 %  → despreciable
```

**b) (2 p)**
```
50 MB/s = 52.428.800 bytes/s → 52.428.800 interrupciones por segundo
52.428.800 × 5 µs = 262,14 segundos de CPU... por cada segundo real

NO es viable: harían falta unas 262 CPUs dedicadas solo a atender interrupciones.
```

*Aceptar también el cálculo con 50.000.000 si usó MB decimales: da 250 s. El orden de magnitud es lo que importa.*

**c) (2 p)**
```
52.428.800 / 4.096 = 12.800 bloques por segundo → 12.800 interrupciones
12.800 × 5 µs = 64.000 µs = 0,064 s de CPU por segundo = 6,4 %
```

**Observación clave:** el DMA **no elimina las interrupciones**, las reduce a una por transferencia. Pasar de 52 millones a 12.800 por segundo es lo que hace viable un disco rápido.

---

## Parte D — Desarrollo (13 p)

### 14. (5 p) Las dos funciones del SO

Debe incluir:

**Máquina extendida (2 p).** La arquitectura a nivel de lenguaje máquina es *primitiva y compleja de programar*. La abstracción es la clave para lidiar con esa complejidad, y la principal es el **archivo**. Ejemplo: leer un archivo sin SO exige encender el motor del disco, esperar la velocidad, mover el brazo al cilindro, esperar el sector, leer los bits, verificar el código de error y apagar el motor; con SO es `read(fd, buf, nbytes)`.

**Administrador de recursos (2 p).** Provee una **asignación ordenada y controlada** de procesadores, memorias y dispositivos de E/S entre programas que compiten. Ejemplo: decidir qué proceso usa la CPU, o asignar espacio en disco y llevar registro de quién usa cada bloque.

**Por qué no están relacionadas (1 p).** Una se trata de **esconder complejidad** (es un problema de interfaz, de cara al programador); la otra de **repartir escasez** (es un problema de asignación, de cara al hardware). Un sistema de un solo usuario y un solo proceso necesitaría la primera pero casi nada de la segunda.

**Multiplexajes (obligatorio para el puntaje completo):**
- **Tiempo:** los usuarios toman turnos → CPU, impresora.
- **Espacio:** cada uno recibe una parte → memoria principal, disco.

*(Tanenbaum, cap. 1.1, impresas 3–7)*

### 15. (4 p) La cadena de arranque

Secuencia esperada (2 p):

1. Se enciende; la CPU ejecuta el **BIOS**, que está en ROM/flash en la motherboard.
2. El BIOS cuenta la RAM, verifica dispositivos básicos y explora los buses ISA y PCI.
3. Consulta la **memoria CMOS** para saber cuál es el dispositivo de arranque.
4. Lee el **primer sector** (sector de booteo / MBR), lo carga en memoria y lo ejecuta.
5. El código del MBR busca en su **tabla de particiones** cuál está **activa** y salta a su primer sector.
6. Ahí está el **cargador secundario** (GRUB), que lee el kernel y le pasa el control.
7. El SO carga los drivers, inicializa sus tablas, crea los procesos de segundo plano y arranca el login o la GUI.

**Por qué dos cargadores (2 p):** el código del MBR tiene **446 bytes**, porque los otros 66 los ocupan la tabla de particiones (64) y la firma `55AA` (2). En 446 bytes no entra un cargador capaz de entender ext4 o NTFS, recorrer directorios, mostrar un menú y descomprimir un kernel. Por eso su único trabajo es **encontrar la partición activa y cargar a alguien más grande**, que ya no tiene ese límite de tamaño.

### 16. (4 p) La llamada al sistema

**Definición (1 p):** la interfaz que permite a los programas de usuario solicitar servicios al sistema operativo; es la frontera exacta entre modo usuario y modo kernel.

**Pasos (2 p)** — se acepta agrupado, no hace falta enumerar los 11:
1–3. El programa mete los parámetros en la pila, en orden inverso (nbytes, &buf, fd); el segundo se pasa **por referencia**.
4. Llama al procedimiento de biblioteca `read`.
5. Ese procedimiento coloca el **número de llamada al sistema** en un registro.
6. Ejecuta **TRAP**.
7. El kernel usa el número como índice en una tabla de manejadores.
8. Se ejecuta el manejador.
9–11. Retorna al procedimiento de biblioteca, de ahí al programa, y el programa limpia la pila.

**Cambio de modo (1 p):** se produce en el **paso 6, con la instrucción TRAP**, y se revierte al volver al espacio de usuario en el paso 9.

**Suma (no obligatorio):** mencionar que la llamada puede **bloquear** al proceso: si no hay datos disponibles, el SO ejecuta otro proceso y los pasos 9–11 se completan más tarde.

---

## Parte E — Escenarios (13 p)

### 17. (5 p) "Missing operating system"

**a) (2 p)** La falla está en el **paso 5**: el código del MBR ya se ejecutó correctamente, recorrió los 4 renglones de la tabla de particiones y **ninguno tiene la marca de activa**, así que no sabe a dónde saltar. La cadena se corta entre el MBR y el cargador secundario.

**b) (1 p)** **No.** Los archivos están intactos; las cuatro particiones están completas. Lo que falta es **un bit** en la tabla de particiones.

**c) (2 p)** Causa más probable: ninguna partición está marcada como activa (o se corrompió el byte del indicador). Se repara **marcando una partición como activa** con una herramienta de particionado (`fdisk`, `diskpart`), arrancando desde un medio externo. No hace falta tocar ningún archivo ni reinstalar nada.

*Aceptar también como causa alternativa la pérdida de la firma `55AA`, siempre que lo justifique.*

### 18. (4 p) Caracteres raros después del mensaje

**El error (1 p):** falta el carácter **`$`** al final de la cadena.

**Qué está haciendo el sistema (2 p):** la función `AH=09h` recorre la memoria a partir de `DS:DX` enviando a pantalla un byte tras otro, y **la única condición de corte es encontrar un `$`**. Al no estar el terminador, sigue leyendo los bytes que están físicamente después de la cadena —código, restos de otros programas, datos sin inicializar— e interpretando cada uno como un carácter ASCII. Se detiene recién cuando encuentra un `$` por casualidad, lo que puede ocurrir 5 o 500 bytes después.

**Corrección (1 p):** declarar la cadena terminada en `$`:
`MSG DB 'mensaje correcto$'`

*Descartar la hipótesis de DS está explícito en el enunciado, así que si lo atribuye a DS, el ítem está mal.*

### 19. (4 p) Marcapasos y servidor de renderizado

**Marcapasos → microkernel (1,5 p).** Es un sistema de **tiempo real duro**: una falla tiene consecuencias físicas irreversibles. El microkernel saca los drivers a modo usuario, de modo que un driver con errores —la causa más frecuente de caídas— no puede tumbar el sistema; el SO lo detecta, lo mata y lo reinicia. Es la razón por la que QNX, un microkernel, se usa en sistemas médicos, aviónica y automotriz.

**Servidor de renderizado → monolítica (1,5 p).** El requisito explícito es rendimiento bruto. En una estructura monolítica las operaciones internas del SO son llamadas a procedimiento directas, sin paso de mensajes entre procesos. Es la estructura más rápida.

**Por qué NO capas para el marcapasos (1 p).** Porque **en la estructura por capas todo sigue corriendo en modo kernel**. El orden jerárquico mejora la claridad de diseño y la depuración, pero **no aporta ningún aislamiento**: un driver que falla en la capa de E/S derriba el sistema igual que en la monolítica. Claridad de diseño no es tolerancia a fallas.

---

## Parte F — Integración (12 p)

### 20. (6 p) Rendimiento de las estructuras

**a) (4 p)**
```
MONOLÍTICA
100.000 op/s × 0,05 µs = 5.000 µs = 5 ms de CPU por segundo
                                   → 0,50 % de la CPU

MICROKERNEL
100.000 op/s × 2 µs = 200.000 µs = 200 ms de CPU por segundo
                                  → 20,00 % de la CPU

El microkernel gasta 40 veces más CPU solo en comunicación interna.
```

**b) (2 p)**

Un **20 % de la CPU** consumido únicamente en comunicación interna del sistema operativo —antes de ejecutar una sola línea de código útil del usuario— es un costo inaceptable para un sistema de uso general, donde el rendimiento es visible para el usuario y la caída ocasional es tolerable.

**La solución de Linux:** es **monolítico**, pero con **módulos cargables**: porciones de código (típicamente drivers y sistemas de archivos) que se insertan y se quitan del kernel **en caliente**, sin reiniciar. Conserva el rendimiento del monolito (siguen siendo llamadas a procedimiento) y gana parte de la flexibilidad del microkernel, aunque **no su aislamiento**: un módulo con errores sigue corriendo en modo kernel y puede tumbar el sistema.

### 21. (3 p) La idea común

**La idea (1 p):** poner una **cantidad chica de un recurso rápido y caro** delante de una **cantidad grande de un recurso lento y barato**, apostando a que los accesos se concentran en una fracción pequeña del total. Es la **localidad de referencia**.

**Los tres casos (2 p, aprox. 0,7 c/u):**

| | Rápido (el que "cachea") | Lento (el grande) |
|---|---|---|
| **Caché de memoria** | caché L1/L2 dentro de la CPU | memoria principal (RAM) |
| **Memoria virtual** | **memoria principal (RAM)** | disco |
| **Buffer de lectura** | el buffer en memoria del proceso | el dispositivo / las llamadas al sistema |

**El detalle elegante (bonus):** la RAM es el recurso *lento* en el primer caso y el *rápido* en el segundo. No hay nada intrínsecamente rápido o lento: todo depende de con qué se lo compare.

### 22. (3 p) Compartir obliga a proteger

**(1 p cada momento):**

1. **Multiplexaje en el espacio (tema 1).** Cuando se reparte la memoria o el disco entre varios programas, surge de inmediato el problema de que uno escriba en el pedazo de otro. Tanenbaum lo dice explícitamente: el multiplexaje en el espacio *"genera problemas de equidad y protección, y corresponde al sistema operativo resolverlos"*.

2. **La aparición histórica de la multiprogramación (tema 7).** No bastó con tener la idea de meter varios trabajos en memoria a la vez: **hizo falta hardware de protección**, y por eso la multiprogramación recién fue posible en la tercera generación, con la IBM 360. La segunda generación no podía, aunque la idea existiera.

3. **Integrados vs. de bolsillo (tema 8).** Es la relación leída al revés: un sistema **integrado** tiene la certeza de que **nunca ejecutará software no confiable**, porque todo está en ROM y el usuario no instala nada. Al no compartir la máquina con código ajeno, **no necesita protección**, y el diseño se simplifica. Un celular, que sí corre apps de terceros, no puede darse ese lujo.

*Aceptar como tercer momento, alternativamente, la separación modo kernel / modo usuario (tema 2) o el aislamiento entre máquinas virtuales (tema 9), si está bien justificado.*

---

## Guía de nota

| Puntaje | Nota sobre 10 | Diagnóstico |
|---|---|---|
| 90–100 | 9–10 | Dominio sólido |
| 75–89 | 7,5–8,9 | Buen dominio, repasar lo puntual |
| 60–74 | 6–7,4 | Aprobado, pero con huecos a reforzar |
| 45–59 | 4,5–5,9 | Insuficiente: reexplicar los temas débiles |
| < 45 | < 4,5 | Rehacer la unidad |

### Preguntas que marcan temas débiles

| Si falló… | El tema débil es | Qué hacer |
|---|---|---|
| 1, 4, 19 | Modo kernel/usuario y protección | Reexplicar el tema 2. Visualización de estructuras |
| 2, 9, 13 | Las tres formas de E/S | Simulador `es_programada_interrupciones_dma.html` |
| 5, 18 | INT 21h y la cadena con `$` | Simulador `interrupciones_8086.html` |
| 6, 10 | Lotes vs multiprogramación | Reexplicar con la cadena de agujeros de tiempo muerto |
| 11, 15, 17 | Arranque, MBR y particiones | Visualización `arranque_y_sector_de_booteo.html`. **Insistir con que la tabla describe, no contiene** |
| 7b, 19, 20 | Estructuras y el intercambio rendimiento/confiabilidad | Visualización `estructuras_de_so.html` |
| 3, 12, 16 | Llamadas al sistema y TRAP | Reexplicar los 11 pasos |
