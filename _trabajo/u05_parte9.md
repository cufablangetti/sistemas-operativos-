
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
