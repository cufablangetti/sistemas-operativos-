# Sistemas Operativos — Unidad 2: Procesos, hilos, comunicación entre procesos y planificación

Este documento desarrolla la Unidad 2 del programa de Sistemas Operativos (UTN, Facultad Regional Mendoza, Ingeniería en Sistemas de Información, ciclo 2026), siguiendo el orden de los puntos 2.1 a 2.6 del programa analítico. La fuente principal es Tanenbaum, Sistemas Operativos Modernos, tercera edición, complementada con los apuntes de la cátedra. Al final de cada sección se indica la referencia exacta.

---

## 2.1 Introducción: el modelo de procesos

### 2.1.1 Qué es un proceso

El concepto más importante en cualquier sistema operativo es el de proceso: una abstracción de un programa en ejecución. Los procesos son una de las abstracciones más antiguas e importantes que proporcionan los sistemas operativos, porque ofrecen la capacidad de operar de forma concurrente incluso cuando hay una sola CPU disponible. Dicho de otro modo: convierten una CPU en varias CPU virtuales.

Un proceso es una instancia de un programa en ejecución, incluyendo los valores actuales del contador de programa, los registros y las variables.

**Paralelismo y pseudoparalelismo.** En cualquier sistema de multiprogramación, la CPU conmuta de un proceso a otro con rapidez, ejecutando cada uno durante décimas o centésimas de milisegundo. Hablando en sentido estricto, en cualquier instante la CPU está ejecutando sólo un proceso, pero en el transcurso de un segundo puede trabajar en varios, lo que da la apariencia de paralelismo. A esa apariencia se la llama pseudoparalelismo, para distinguirla del paralelismo verdadero del hardware de los sistemas multiprocesadores, que tienen dos o más CPU compartiendo la misma memoria física.

**La diferencia entre programa y proceso** es sutil pero crucial. Una analogía útil: un programa es como una receta de cocina escrita en un libro, y el proceso es la actividad de cocinar esa receta. El cocinero es la CPU; los ingredientes, los datos de entrada. Si el cocinero interrumpe la torta para atender a un hijo que se cortó un dedo, anota en qué paso de la receta estaba, busca un manual de primeros auxilios y empieza a seguir *otra* receta. Después vuelve a la torta exactamente donde la había dejado. La receta no cambió: lo que se guardó y se restauró fue el estado de la actividad.

En términos formales: el proceso es una actividad que tiene un programa, una entrada, una salida y un **estado**. Varios procesos pueden compartir un solo procesador mediante un algoritmo de planificación.

Descripción de la figura del modelo de procesos: tres dibujos uno al lado del otro. En el primero, cuatro programas apilados dentro de una caja rotulada "memoria", con una sola flecha de ejecución. En el segundo, cuatro líneas horizontales paralelas, una por proceso, rotuladas A, B, C y D, que representan cuatro contadores de programa independientes avanzando a la vez. En el tercero, una sola línea que serpentea alternando entre A, B, C y D, con el rótulo "sólo un programa activo en cada instante". El segundo dibujo es la abstracción; el tercero, la realidad.

### 2.1.2 Creación de procesos

Hay cuatro eventos principales que provocan la creación de un proceso:

1. El arranque del sistema.
2. La ejecución, desde un proceso, de una llamada al sistema para creación de procesos.
3. Una petición de usuario para crear un proceso.
4. El inicio de un trabajo por lotes.

Los procesos que se crean al arrancar y permanecen en segundo plano para manejar actividades como correo electrónico, páginas web, noticias o impresiones se llaman **demonios**. En UNIX se pueden listar con el comando ps.

**La llamada al sistema que crea procesos.** En UNIX hay una sola: **fork**. Esta llamada crea un clon exacto del proceso que la invocó. Después de fork, los dos procesos —padre e hijo— tienen la misma imagen de memoria, las mismas cadenas de entorno y los mismos archivos abiertos. Eso es todo. Por lo general, el proceso hijo ejecuta después **execve**, o una llamada similar, para cambiar su imagen de memoria y ejecutar un programa distinto.

En Windows, en cambio, una sola función de Win32, **CreateProcess**, se encarga de las dos cosas: crea el proceso y carga el programa correcto en él. Es la diferencia de diseño más visible entre los dos sistemas en este tema.

**Ejemplo resuelto paso a paso: qué devuelve fork y cómo se distingue al padre del hijo.**

Planteo: después de un fork existen dos procesos ejecutando exactamente el mismo código. ¿Cómo hace cada uno para saber cuál es?

Paso 1. El padre ejecuta fork. El sistema operativo duplica el proceso: copia su espacio de direcciones, sus descriptores de archivo y su entorno.

Paso 2. Ahora hay dos procesos. Los dos van a continuar ejecutando la instrucción siguiente a fork. Los dos tienen el mismo código.

Paso 3. La diferencia está en el **valor de retorno de fork**, que es distinto en cada uno:

- En el proceso **padre**, fork devuelve el **PID del hijo**, que es un número positivo.
- En el proceso **hijo**, fork devuelve **0**.
- Si hubo un error y no se pudo crear el proceso, fork devuelve **menos uno** y no se crea ningún hijo.

Paso 4. El programa usa ese valor para bifurcar. En pseudocódigo: si el valor devuelto es cero, estoy en el hijo y ejecuto el código del hijo; si es mayor que cero, estoy en el padre y ese número es el PID de mi hijo; si es negativo, informo el error.

Paso 5. Conclusión del ejemplo: el código es idéntico en los dos procesos, y lo único que los distingue es un número. Esta asimetría es la base de todo el modelo de procesos de UNIX.

**Ejemplo resuelto paso a paso: cuántos procesos crean tres fork seguidos.**

Planteo: un programa ejecuta tres llamadas a fork, una después de la otra, sin ninguna condición entre ellas. ¿Cuántos procesos hay al final?

Paso 1. Al principio hay 1 proceso.

Paso 2. El primer fork: el proceso original se duplica. Ahora hay 2.

Paso 3. El segundo fork: lo ejecutan **los dos** procesos existentes, porque los dos siguen avanzando por el mismo código. Cada uno se duplica. Ahora hay 4.

Paso 4. El tercer fork: lo ejecutan los 4. Cada uno se duplica. Ahora hay 8.

Paso 5. Resultado: 2 elevado a 3, igual a **8 procesos** en total, de los cuales 7 son descendientes del original. La regla general es 2 elevado a n, donde n es la cantidad de fork.

Paso 6. Dónde está la trampa: el error típico es pensar que cada fork agrega un proceso, lo que daría 4. No es así: después del primer fork hay dos procesos ejecutando el mismo código, y **cada uno vuelve a hacer el fork siguiente**.

### 2.1.3 Terminación de procesos

Un proceso puede terminar por cuatro razones, dos voluntarias y dos involuntarias:

| Razón | Voluntaria | Qué pasó |
|---|---|---|
| Salida normal | sí | El proceso concluyó su trabajo. Llama a exit en UNIX, ExitProcess en Windows |
| Salida por error | sí | El proceso descubre un error: por ejemplo, se pide compilar un archivo que no existe |
| Error fatal | no | Un error del programa: instrucción ilegal, referencia a memoria inexistente, división entre cero |
| Eliminado por otro proceso | no | Otro proceso ejecuta kill en UNIX, TerminateProcess en Win32 |

La distinción que se toma en los exámenes es la de voluntaria contra involuntaria: las dos primeras las decide el propio proceso, las dos últimas se las imponen desde afuera.

### 2.1.4 Jerarquías de procesos

Cuando un proceso crea otro, en algunos sistemas padre e hijo quedan asociados. El hijo puede crear a su vez más procesos, y así se forma una **jerarquía de procesos**.

En UNIX, un proceso junto con todos sus hijos y descendientes forma un **grupo de procesos**. Cuando el usuario envía una señal desde el teclado, esa señal se envía a todos los procesos del grupo asociado al teclado, y cada proceso puede atraparla, ignorarla o ser eliminado por ella.

Al iniciar la computadora, UNIX crea un proceso especial llamado **init**. Este proceso lee cuántas terminales hay y usa fork para crear un proceso por cada una. Esos procesos esperan un inicio de sesión y, si es exitoso, ejecutan un shell que puede crear más procesos. De ese modo, **todos los procesos del sistema forman un solo árbol, con init en la raíz**.

En Windows **no existe una jerarquía real de procesos**: todos los procesos son iguales. Al crear un proceso, el padre recibe un token o manejador para controlar al hijo, pero puede pasárselo a otro proceso, lo que rompe la jerarquía. En UNIX, en cambio, un proceso no puede desheredar a sus hijos.

Descripción de la figura del árbol de procesos: un diagrama de árbol invertido. En la raíz, un círculo rotulado A. De A bajan dos flechas a dos círculos, B y C. De B baja una flecha a D, y de C bajan dos flechas a E y F. La leyenda dice: A creó dos procesos hijos, B y C; B creó uno, D; C creó dos, E y F.

### 2.1.5 Estados de un proceso

Un proceso puede estar en tres estados:

1. **En ejecución**: está usando la CPU en ese instante.
2. **Listo** (o preparado): es ejecutable, pero se detuvo temporalmente para dejar que se ejecute otro proceso.
3. **Bloqueado**: no puede ejecutarse hasta que ocurra cierto evento externo.

La diferencia entre listo y bloqueado es la que más se confunde y la que más se toma. Un proceso **bloqueado** no puede continuar por lógica: está esperando una entrada que todavía no está disponible. Un proceso **listo** sí podría ejecutarse: lo único que le falta es que el planificador le dé la CPU.

Descripción del diagrama de estados: tres óvalos. Arriba al centro, "En ejecución". Abajo a la izquierda, "Bloqueado". Abajo a la derecha, "Listo". Cuatro flechas conectan los óvalos:

- Flecha 1, de **En ejecución a Bloqueado**: el proceso se bloquea en espera de una entrada.
- Flecha 2, de **En ejecución a Listo**: el planificador elige otro proceso.
- Flecha 3, de **Listo a En ejecución**: el planificador elige este proceso.
- Flecha 4, de **Bloqueado a Listo**: la entrada ya está disponible.

Lo que hay que observar en ese diagrama es que **no existe flecha de Bloqueado a En ejecución**. Un proceso bloqueado nunca pasa directamente a ejecutarse: primero tiene que pasar por Listo.

Las transiciones 2 y 3 las maneja el **planificador de procesos**, y el proceso ni se entera de que ocurrieron. La transición 1 la provoca el propio proceso, al pedir algo que no está disponible. La transición 4 la provoca un evento externo, típicamente una interrupción del dispositivo.

**Ejemplo resuelto paso a paso: seguir los estados de un proceso que lee del disco.**

Planteo: un proceso P está ejecutándose y necesita leer un archivo.

Paso 1. P está **En ejecución**, usando la CPU.

Paso 2. P ejecuta la llamada al sistema read. Los datos no están en memoria: hay que ir al disco, que tarda milisegundos.

Paso 3. El sistema operativo pasa a P a **Bloqueado** (transición 1) y le pide al driver del disco que inicie la operación. P no puede hacer nada hasta que lleguen los datos.

Paso 4. El planificador elige otro proceso Q de la lista de listos y lo pone **En ejecución** (transición 3 para Q). La CPU no queda ociosa: eso es la multiprogramación.

Paso 5. El disco termina y genera una interrupción. El manejador de interrupciones pasa a P de **Bloqueado a Listo** (transición 4). Atención: P **no vuelve a ejecutarse inmediatamente**. Sólo queda habilitado para ser elegido.

Paso 6. Cuando el planificador lo decida, P pasa de **Listo a En ejecución** (transición 3) y continúa después de la instrucción read, con los datos ya en su buffer.

Paso 7. Observación importante: entre los pasos 5 y 6 puede pasar un tiempo largo, según cuántos procesos listos haya y qué algoritmo de planificación se use. El proceso cree que su read tardó todo ese tiempo, pero una parte fue espera de disco y otra fue espera de CPU.

### 2.1.6 Implementación de los procesos: la tabla de procesos y el BCP

Para implementar el modelo de procesos, el sistema operativo mantiene una tabla, que es un arreglo de estructuras, llamada **tabla de procesos**, con una entrada por cada proceso. A esas entradas se las conoce también como **bloques de control de proceso** (BCP).

Cada entrada contiene todo lo necesario para que el proceso pueda reanudarse más tarde como si nunca se hubiera detenido. Los campos se agrupan en tres categorías:

**Administración de procesos:** registros, contador de programa, palabra de estado del programa, apuntador de pila, estado del proceso, prioridad, parámetros de planificación, identificador del proceso (PID), proceso padre, grupo de procesos, señales, hora de inicio del proceso, tiempo de CPU utilizado, tiempo de CPU de los hijos, hora de la siguiente alarma.

**Administración de memoria:** apuntador a la información del segmento de texto (el código), apuntador al segmento de datos, apuntador al segmento de pila.

**Administración de archivos:** directorio raíz, directorio de trabajo, descriptores de archivos abiertos, identificador de usuario (UID), identificador de grupo (GID).

**El cambio de contexto.** Cuando llega una interrupción y hay que cambiar de proceso, ocurre lo siguiente: el hardware mete en la pila el contador de programa y la palabra de estado; el hardware carga un nuevo contador de programa desde el **vector de interrupciones**; un procedimiento en ensamblador guarda los registros en el BCP del proceso actual; se ejecuta el servicio de la interrupción; el planificador decide cuál proceso sigue; y finalmente se cargan los registros y el mapa de memoria del nuevo proceso y se lo pone a correr.

Cada clase de dispositivo de E/S tiene asociada una ubicación fija en memoria llamada **vector de interrupción**, que contiene la dirección del procedimiento de servicio de interrupciones. Es ese mecanismo el que sostiene la ilusión de varios procesos secuenciales corriendo a la vez.

**El cambio de contexto no es gratis.** Implica pasar a modo kernel, guardar registros y estado, cambiar el mapa de memoria y, con frecuencia, invalidar la memoria caché. Demasiadas conmutaciones degradan el rendimiento, y por eso el tamaño del quántum en la planificación por turno circular es un problema de diseño real y no un detalle.

**Comandos de la cátedra relacionados con este tema.** Para observar los procesos de un sistema Linux:

| Comando | Qué muestra |
|---|---|
| ps | Los procesos asociados a la terminal actual: PID, TTY, TIME, CMD |
| ps -e | Todos los procesos del sistema |
| ps -ef | Todos, con información completa: UID, PID, PPID, C, STIME, TTY, TIME, CMD |
| ps -f -p PID | Información detallada de un proceso específico |
| pstree | Los procesos como árbol, mostrando la relación padre-hijo |
| top | En tiempo real: PID, USER, PR, NI, VIRT, RES, SHR, S, porcentaje de CPU, porcentaje de memoria, TIME+, COMMAND |
| htop | Versión interactiva de top; permite buscar, ordenar y terminar procesos |
| pgrep nombre | Devuelve el PID de un proceso buscándolo por su nombre |
| pgrep -a nombre | El PID junto con el comando completo |
| pkill nombre | Termina los procesos que coinciden con el nombre |
| pidstat -p PID 1 | Estadísticas de uso de recursos por proceso |
| ls -la /proc/PID | La información virtual que el kernel mantiene sobre un proceso |
| cat /proc/PID/status | Nombre, estado, PID, PPID, usuario, memoria y cantidad de hilos |
| ls -la /proc/PID/fd | Los descriptores de archivos abiertos por el proceso |
| kill -STOP PID | Suspende temporalmente un proceso |
| kill -CONT PID | Reanuda un proceso suspendido |

Según la cátedra: en el examen se pide la sintaxis completa de estos comandos, no solo el nombre. Por ejemplo, para obtener el PID de Firefox se espera `pgrep firefox` o `ps -ef | grep firefox`, y para suspender y reanudar, `kill -STOP PID` y `kill -CONT PID`.

Referencia: (Tanenbaum, cap. 2.1, págs. 83 a 95). (Apunte: resumen so (5).pdf, sección 2.1). (Apunte: Comandos_Linux-SO (1).pdf).

---

## 2.2 Subprocesos: el modelo clásico de hilos

Nota sobre el orden: el programa de la materia trata los hilos en el punto 2.1 y vuelve sobre ellos en el 2.5. Acá se desarrollan juntos para no partir el tema.

### 2.2.1 Por qué existen los hilos

En los sistemas operativos tradicionales, cada proceso tiene un espacio de direcciones y un solo hilo de control. Pero con frecuencia conviene tener **varios hilos de control en el mismo espacio de direcciones**, ejecutándose en cuasi-paralelo.

Los hilos son, en esencia, miniprocesos dentro de un proceso. Las razones para usarlos son cuatro:

1. **Muchas aplicaciones realizan varias actividades a la vez**, y algunas pueden bloquearse. Dividir la aplicación en hilos secuenciales simplifica el modelo de programación.
2. **Los hilos comparten el mismo espacio de direcciones y los mismos datos.** Esto es esencial para aplicaciones donde los procesos separados no servirían, justamente porque no compartirían memoria.
3. **Son más ligeros que los procesos**: se crean y destruyen mucho más rápido.
4. **Permiten traslapar cálculo y E/S**, mejorando el rendimiento cuando hay operaciones de disco. Y en sistemas con varias CPU, permiten **paralelismo real**.

**Ejemplo del procesador de palabras.** Un hilo interactúa con el usuario recibiendo lo que escribe, otro vuelve a dar formato al documento en segundo plano, y un tercero realiza respaldos automáticos a disco. Si fueran procesos separados no podrían compartir el documento; si fuera un solo hilo, el usuario tendría que esperar a que termine el reformateo antes de poder seguir escribiendo.

**Ejemplo del servidor web.** Un hilo **despachador** recibe las solicitudes que llegan por la red y las asigna a **hilos trabajadores**. Los trabajadores comparten una caché de páginas en memoria y se bloquean si deben ir al disco. Mientras uno espera el disco, otros siguen atendiendo.

**Las tres formas de construir ese servidor web**, que es la comparación que se toma:

| Modelo | Características |
|---|---|
| Hilos | Paralelismo, con llamadas al sistema con bloqueo. Programación simple y buen rendimiento |
| Proceso de un solo hilo | Sin paralelismo, con llamadas al sistema con bloqueo. Programación simple, mal rendimiento: mientras espera el disco la CPU queda inactiva |
| Máquina de estados finitos | Paralelismo, con llamadas al sistema sin bloqueo e interrupciones. Buen rendimiento, pero es muy difícil de programar: hay que guardar a mano el estado de cada petición en una tabla y reaccionar a eventos |

La conclusión del libro es que los hilos combinan lo mejor: **paralelismo con llamadas al sistema con bloqueo**.

### 2.2.2 El modelo clásico de hilos

El modelo clásico separa dos conceptos que en el proceso tradicional están mezclados: el **agrupamiento de recursos** y la **ejecución**.

- El **proceso** agrupa recursos: espacio de direcciones, archivos abiertos, procesos hijos, señales pendientes, información contable.
- El **hilo** es la unidad de ejecución: tiene su contador de programa, sus registros, su pila y su estado.

Por eso a los hilos se los llama también **procesos ligeros**. Y a diferencia de los procesos, que son competitivos y están protegidos unos de otros, los hilos de un mismo proceso **cooperan y no tienen protección entre ellos**: cualquier hilo puede leer, escribir o incluso borrar la pila de otro. Eso no es un error de diseño, es intencional: los hilos de un proceso siempre son de un mismo usuario y están pensados para cooperar.

**Qué tiene cada uno.** Esta tabla es la que más se toma del tema:

| Elementos por proceso (compartidos por todos sus hilos) | Elementos por hilo (propios de cada uno) |
|---|---|
| Espacio de direcciones | Contador de programa |
| Variables globales | Registros |
| Archivos abiertos | Pila |
| Procesos hijos | Estado |
| Alarmas pendientes | |
| Señales y manejadores de señales | |
| Información contable | |

**Por qué cada hilo necesita su propia pila:** porque cada uno tiene un historial de ejecución distinto. La pila guarda las direcciones de retorno y las variables locales de los procedimientos que fueron llamados pero todavía no retornaron, y ese recorrido es diferente en cada hilo.

**Estados y llamadas.** Un hilo puede estar en los mismos estados que un proceso: en ejecución, bloqueado, listo o terminado. Las llamadas principales son thread_create para crear, thread_exit para terminar, thread_join para esperar a que otro hilo termine, y thread_yield para ceder voluntariamente la CPU a otro hilo.

**Las complicaciones que traen los hilos**, que también se preguntan:

- Qué hacer con **fork** en un proceso multihilo: si el padre tiene varios hilos, el hijo debería tenerlos todos o sólo uno.
- Conflictos por **datos compartidos**: archivos, memoria, recursos.
- **Variables globales** como errno, que generan conflictos entre hilos.
- Muchas **bibliotecas no son reentrantes** y fallan con varios hilos.
- La **gestión de señales** se vuelve ambigua: las señales se envían a procesos, no a hilos.
- La administración de **múltiples pilas** no está bien soportada si el kernel no conoce los hilos.

La conclusión del libro: agregar hilos no es automático; convertir un programa de un solo hilo a multihilo requiere rediseñar bibliotecas, semántica de llamadas al sistema y manejo de recursos, manteniendo la compatibilidad con los programas existentes.

### 2.2.3 Implementación de hilos en el espacio de usuario

El kernel **no sabe que los hilos existen**: ve procesos con un solo hilo, como siempre. Los hilos se implementan con una biblioteca y un sistema en tiempo de ejecución que mantiene una **tabla de hilos por proceso**.

Ventajas:

- **Alto rendimiento**: crear, planificar y conmutar hilos es muy rápido, porque no hay traps al kernel. Una conmutación son unas pocas instrucciones de máquina.
- Cada proceso puede usar **su propio algoritmo de planificación**, adaptado a la aplicación.
- **Escalan mejor** cuando hay muchísimos hilos, porque no consumen tablas del kernel.

Desventajas, y son serias:

- Una **llamada al sistema con bloqueo bloquea todo el proceso**, no sólo el hilo que la hizo. Es el defecto central.
- Los **fallos de página** también bloquean a todos los hilos.
- **No hay interrupciones de reloj** dentro del proceso, así que un hilo puede quedarse con la CPU indefinidamente si no la cede voluntariamente.
- Para evitar los bloqueos hacen falta llamadas sin bloqueo, select y envolturas, lo que vuelve el código complejo e ineficiente.

En resumen: son rápidos pero difíciles de usar correctamente, y funcionan mal justamente en las aplicaciones que hacen muchas llamadas al sistema, que son las que más necesitarían hilos.

### 2.2.4 Implementación de hilos en el kernel

El kernel conoce y administra los hilos. Mantiene una **tabla global de hilos** con su estado, registros y demás información. Crear o destruir un hilo requiere una llamada al sistema.

Ventajas:

- Si un hilo se bloquea o sufre un fallo de página, **el kernel puede ejecutar otro hilo del mismo proceso**. Esto es exactamente lo que no podían los hilos de usuario.
- No hacen falta llamadas al sistema sin bloqueo ni envolturas.
- Funcionan bien en aplicaciones con muchas llamadas al sistema.

Desventaja principal:

- **Alta sobrecarga**: crear, destruir y conmutar hilos es mucho más lento porque todo pasa por el kernel. Para reducirla, algunos sistemas reciclan hilos en vez de destruirlos.

Y hay problemas que los hilos de kernel tampoco resuelven: qué hacer con los hilos al ejecutar fork, y cómo manejar las señales, que se envían a procesos y no a hilos.

### 2.2.5 Implementaciones híbridas y activaciones del planificador

**Implementación híbrida.** Combina las dos: el kernel conoce y planifica hilos de kernel, y cada hilo de kernel puede ejecutar **varios hilos de usuario multiplexados** sobre él. El programador decide cuántos hilos de usuario pone sobre cuántos hilos de kernel. Da máxima flexibilidad, combinando rendimiento y control.

**Activaciones del planificador.** Buscan combinar lo mejor de los dos mundos: mantener el paralelismo real y el manejo correcto de bloqueos, pero con menos sobrecarga.

La idea central: el kernel asigna **procesadores virtuales** a cada proceso, y el sistema en tiempo de ejecución, que está en espacio de usuario, decide qué hilos ejecutar en ellos. Cuando un hilo se bloquea por una llamada al sistema o un fallo de página, el kernel notifica al sistema en tiempo de ejecución mediante una **llamada ascendente** (upcall), lo que le permite replanificar otro hilo sin bloquear todo el proceso. Cuando el evento se resuelve, el kernel vuelve a avisar con otra upcall.

La crítica principal: las llamadas ascendentes **rompen el modelo clásico por capas**, porque el kernel llama a código de nivel superior.

**Hilos emergentes.** Técnica usada en sistemas distribuidos: la llegada de un mensaje crea automáticamente un hilo nuevo para procesarlo. Como el hilo empieza desde cero y no hay que restaurar ningún estado, se reduce la latencia. Pueden ejecutarse en el kernel, que es más rápido y potente pero más riesgoso, o en espacio de usuario, que es más seguro.

### 2.2.6 Comparación final de las implementaciones

| | Hilos de usuario | Hilos de kernel | Híbrida |
|---|---|---|---|
| ¿El kernel los conoce? | No | Sí | Parcialmente |
| Dónde está la tabla de hilos | En el proceso | En el kernel | En ambos |
| Costo de conmutar | Muy bajo, unas instrucciones | Alto, conmutación de contexto completa | Intermedio |
| Si un hilo se bloquea | Se bloquea **todo el proceso** | El kernel ejecuta otro hilo | Depende del nivel |
| Planificador propio por aplicación | Sí | No | Sí, en el nivel de usuario |
| Aprovecha varias CPU | No | Sí | Sí |

Referencia: (Tanenbaum, cap. 2.2, págs. 95 a 117). (Apunte: resumen so (5).pdf, sección Hilos).

---

## 2.3 Comunicación entre procesos (IPC)

### 2.3.1 Las tres cuestiones de la IPC

Los procesos necesitan comunicarse entre sí. El ejemplo típico es una canalización del shell, donde la salida de un proceso se pasa como entrada al siguiente. A esto se lo llama **comunicación entre procesos** (Inter Process Communication, IPC), y se busca que ocurra de forma bien estructurada, sin usar interrupciones.

Hay tres cuestiones fundamentales:

1. **Cómo un proceso pasa información a otro.**
2. **Cómo evitar que los procesos se interpongan entre sí** al usar recursos compartidos.
3. **Cómo asegurar la secuencia correcta** cuando hay dependencias: por ejemplo, que un proceso espere a que otro produzca datos.

Las dos últimas también se aplican a los hilos. La primera es más sencilla en hilos, porque comparten el espacio de direcciones, pero la exclusión mutua y la sincronización presentan exactamente los mismos problemas y requieren las mismas soluciones.

### 2.3.2 Condiciones de carrera

**Definición:** una condición de carrera ocurre cuando dos o más procesos leen o escriben datos compartidos, y **el resultado final depende del orden y el momento preciso en que se ejecutaron**.

Son difíciles de depurar porque la mayoría de las veces el programa funciona bien y sólo ocasionalmente falla de manera aparentemente inexplicable, sin que el sistema detecte ningún error.

**Ejemplo resuelto paso a paso: el spooler de impresión.**

Planteo. Un directorio de spooler tiene ranuras numeradas donde se escriben los nombres de los archivos a imprimir. Dos variables compartidas lo controlan: **sal** apunta al siguiente archivo a imprimir, y **ent** apunta a la siguiente ranura libre. Supongamos que las ranuras 0 a 3 están ocupadas, de modo que sal vale 0 y **ent vale 4**. Dos procesos, A y B, quieren poner un archivo en la cola casi al mismo tiempo.

Paso 1. El proceso A lee la variable ent y obtiene el valor **4**. Lo guarda en una variable local suya.

Paso 2. Justo en ese momento se agota el quántum de A y el planificador conmuta al proceso B. A quedó con un 4 guardado y sin haber escrito nada.

Paso 3. El proceso B lee la variable ent y obtiene **4**, el mismo valor, porque A todavía no la actualizó.

Paso 4. B escribe el nombre de su archivo en la ranura 4 y actualiza ent a **5**. Desde el punto de vista de B todo salió perfecto.

Paso 5. En algún momento vuelve a ejecutarse el proceso A, que retoma exactamente donde había quedado: con el valor 4 en su variable local.

Paso 6. A escribe el nombre de su archivo en la ranura **4**, pisando el de B, y actualiza ent a **5**.

Paso 7. Resultado: el directorio del spooler quedó internamente consistente. El demonio de impresión no va a notar nada raro. Pero **el archivo del proceso B nunca se va a imprimir**, y B jamás se va a enterar. Nadie reportó un error.

Paso 8. Lo decisivo del ejemplo: el problema no está en el código de A ni en el de B, que son correctos por separado. Está en que la secuencia leer-modificar-escribir sobre una variable compartida **fue interrumpida en el medio**.

### 2.3.3 Regiones críticas y las cuatro condiciones

La parte del programa donde un proceso accede a memoria compartida, archivos compartidos o cualquier recurso que pueda producir condiciones de carrera se llama **región crítica** o sección crítica. Si se garantiza que nunca haya dos procesos simultáneamente dentro de sus regiones críticas, se evitan las condiciones de carrera. A eso se lo llama **exclusión mutua**.

Pero la exclusión mutua sola no alcanza. Una solución correcta debe cumplir **cuatro condiciones**. Esta lista es de las más tomadas de toda la unidad, y aparece textualmente en los exámenes de la cátedra:

1. **No puede haber dos procesos al mismo tiempo dentro de sus regiones críticas.**
2. **No deben hacerse suposiciones sobre las velocidades ni sobre la cantidad de CPU.**
3. **Ningún proceso que se ejecute fuera de su región crítica puede bloquear a otros procesos.**
4. **Ningún proceso debe esperar indefinidamente** para entrar a su región crítica.

El comportamiento deseado es: un proceso entra a su región crítica; otro que intenta entrar debe esperar; cuando el primero sale, el segundo entra inmediatamente.

Descripción de la figura de la exclusión mutua: dos líneas de tiempo horizontales, una sobre la otra, rotuladas proceso A y proceso B. En la línea de A, un segmento sombreado rotulado "A en su región crítica" entre los instantes T1 y T3. En la línea de B, B intenta entrar en T2, y se dibuja un segmento punteado rotulado "B intenta entrar, se bloquea" entre T2 y T3; a partir de T3 el segmento de B se vuelve sólido y se rotula "B en su región crítica", hasta T4.

### 2.3.4 Exclusión mutua con espera ocupada

Son las soluciones donde el proceso que no puede entrar **se queda evaluando una variable continuamente** hasta que cambie. A eso se lo llama espera ocupada (busy waiting), y a un candado que usa ese método se lo llama **candado de giro** (spin lock).

**Solución 1: deshabilitar las interrupciones.**

El proceso deshabilita las interrupciones al entrar a su región crítica y las rehabilita al salir. Sin interrupciones no hay conmutación de procesos, porque la CPU sólo cambia de proceso cuando ocurre una.

Por qué no sirve como solución general:

- No es seguro permitir que procesos de usuario deshabiliten interrupciones: si uno se olvida de reactivarlas, el sistema queda inutilizado.
- En sistemas multiprocesador, deshabilitar interrupciones **sólo afecta a la CPU que ejecutó la instrucción**; las demás siguen ejecutándose y pueden entrar a la región crítica.

Conclusión: es útil **dentro del kernel**, para proteger estructuras internas por unas pocas instrucciones, pero no es apropiado como mecanismo general para procesos de usuario, y su utilidad disminuye más todavía con los sistemas multinúcleo.

**Solución 2: variables de candado. No funciona.**

Se usa una variable compartida candado, que vale 0 si nadie está en la región crítica y 1 si hay alguien. El proceso verifica el candado; si es 0 lo pone en 1 y entra; si es 1 espera.

El problema es exactamente el mismo del spooler: **dos procesos pueden leer el candado como 0 al mismo tiempo**, ambos lo fijan en 1 y ambos entran. Verificar el candado más de una vez no resuelve nada, porque la condición de carrera puede ocurrir entre dos verificaciones. **No garantiza exclusión mutua: no es una solución válida.**

**Solución 3: alternancia estricta. Funciona pero es inaceptable.**

Una variable compartida turno indica qué proceso puede entrar. Cada proceso espera activamente hasta que turno tenga su valor, y al salir de la región crítica cambia turno para cederle el acceso al otro.

Evita las condiciones de carrera, pero **viola la condición 3**: un proceso fuera de su región crítica no debe bloquear a otros. Si el proceso 0 es lento y está haciendo otra cosa, el proceso 1 queda bloqueado esperando su turno aunque nadie esté usando la región crítica. Los procesos quedan obligados a alternarse estrictamente, y ninguno puede entrar dos veces seguidas.

**Solución 4: el algoritmo de Peterson. Correcto.**

Propuesto por G. L. Peterson en 1981, reemplazó a la solución más compleja de Dekker. Usa dos variables compartidas: **turno** y un arreglo **interesado**, con un elemento por proceso.

El procedimiento de entrada hace tres cosas, en este orden:

1. El proceso marca que **está interesado** en entrar.
2. Establece **turno** con su propio número.
3. **Espera** mientras sea el turno del otro **y** el otro esté interesado.

El procedimiento de salida simplemente marca que ya no está interesado.

Por qué funciona cuando los dos quieren entrar al mismo tiempo: los dos se marcan interesados, y los dos escriben turno. Pero **el último que escribe turno es el que cede el paso**, porque la condición de espera queda cumplida para él. Uno entra y el otro espera. Garantiza exclusión mutua, no exige alternancia estricta y funciona aunque los dos lo intenten simultáneamente. Sigue usando espera ocupada.

**Solución 5: la instrucción TSL. Solución de hardware.**

TSL (Test and Set Lock) es una instrucción del procesador que, **de manera indivisible y atómica**:

1. Lee el valor de una variable compartida (el candado) y lo guarda en un registro.
2. Fija esa variable en un valor distinto de cero.

Mientras se ejecuta TSL, **el procesador bloquea el bus de memoria**, de modo que ningún otro procesador puede acceder a esa variable hasta que la instrucción termine. Esto es muy distinto de deshabilitar interrupciones: deshabilitar interrupciones no evita que otros procesadores accedan a la memoria; bloquear el bus sí.

Uso: si el candado vale 0, el proceso lo fija en 1 y entra; si vale distinto de cero, espera ocupadamente. Al salir, vuelve a poner el candado en 0.

**La instrucción XCHG** intercambia de forma atómica el contenido de un registro con una palabra de memoria, y funciona de manera equivalente a TSL. Las CPU Intel x86 usan XCHG para sincronización de bajo nivel.

### 2.3.5 El problema de la espera ocupada y la inversión de prioridades

Peterson, TSL y XCHG son correctas, pero todas **desperdician CPU** y pueden producir un efecto inesperado y grave.

**Inversión de prioridades.** Planteo: hay dos procesos, H de alta prioridad y L de baja prioridad, y la regla es que H se ejecuta siempre que esté listo.

Paso 1. L entra a su región crítica.
Paso 2. H queda listo y, por tener más prioridad, desplaza a L y empieza a ejecutarse.
Paso 3. H intenta entrar a la región crítica y encuentra el candado tomado, así que entra en **espera ocupada**.
Paso 4. Como H está ejecutándose todo el tiempo en su ciclo de espera, **L nunca vuelve a ser planificado** y por lo tanto nunca sale de su región crítica ni libera el candado.
Paso 5. Resultado: H gira para siempre y L nunca avanza. El sistema se bloquea por completo. Y la causa es, paradójicamente, que H tiene demasiada prioridad.

### 2.3.6 Soluciones sin espera ocupada: dormir y despertar

Para no desperdiciar CPU se introducen primitivas que **bloquean** al proceso en lugar de hacerlo girar:

- **sleep**: hace que el proceso que la invoca se bloquee, quedando inactivo.
- **wakeup**: despierta a un proceso bloqueado.

**El problema del productor-consumidor.** Dos procesos comparten un búfer de tamaño limitado. El productor inserta elementos; el consumidor los retira. Si el búfer está lleno, el productor se duerme; si está vacío, el consumidor se duerme. Cada uno despierta al otro cuando corresponde. Una variable compartida **cuenta** lleva el registro de cuántos elementos hay.

**La condición de carrera fatal de sleep y wakeup**, paso a paso:

Paso 1. El búfer está vacío, es decir cuenta vale 0.
Paso 2. El consumidor lee cuenta y ve 0, así que decide dormirse.
Paso 3. **Justo antes de ejecutar sleep**, se agota su quántum y el planificador conmuta al productor.
Paso 4. El productor inserta un elemento y pone cuenta en 1.
Paso 5. El productor ve que cuenta pasó de 0 a 1, deduce que el consumidor podría estar dormido, y le envía un **wakeup**.
Paso 6. Pero el consumidor **todavía no está dormido**, así que la señal de despertar **se pierde**. No queda registrada en ningún lado.
Paso 7. El consumidor vuelve a ejecutarse y ejecuta el sleep que tenía pendiente. Se duerme.
Paso 8. El productor sigue llenando el búfer hasta que se llena y también se duerme.
Paso 9. Resultado: **los dos duermen para siempre**. El problema central es que una señal de despertar enviada a un proceso que todavía no está dormido se pierde.

**Solución parcial: el bit de espera de despertar.** Si llega un wakeup y el proceso no está dormido, se guarda la señal en un bit. Cuando el proceso intente dormirse, consume ese bit y no se duerme. Funciona en casos simples, pero **no escala** cuando hay muchos procesos, y el problema de fondo sigue existiendo.

### 2.3.7 Semáforos

En 1965, E. W. Dijkstra propuso la solución general: el **semáforo**, una variable entera que cuenta señales de despertar. Vale 0 si no hay ninguna almacenada, y un número positivo si hay una o más pendientes.

Dos operaciones, las dos **atómicas e indivisibles**:

**down** (generalización de sleep):
- Si el valor del semáforo es mayor que 0, lo decrementa y el proceso continúa.
- Si el valor es 0, el proceso se bloquea sin completar la operación.
- La comprobación del valor, su modificación y el eventual bloqueo se hacen **como una sola acción atómica**.

**up** (generalización de wakeup):
- Incrementa el valor del semáforo.
- Si había procesos bloqueados en ese semáforo, despierta a uno de ellos.
- **Ningún proceso se bloquea jamás al ejecutar up.**

La atomicidad es esencial: es lo que evita exactamente la condición de carrera de sleep y wakeup. Se implementa deshabilitando interrupciones brevemente en un solo procesador, o con TSL en multiprocesadores.

**Ejemplo resuelto paso a paso: productor-consumidor con tres semáforos.**

Planteo: un búfer de N ranuras, un productor y un consumidor.

Paso 1. Se definen tres semáforos, cada uno con un propósito distinto:

| Semáforo | Valor inicial | Para qué sirve |
|---|---|---|
| vacias | N | Cuenta las ranuras **libres** |
| llenas | 0 | Cuenta las ranuras **ocupadas** |
| mutex | 1 | Garantiza la **exclusión mutua** sobre el búfer |

Paso 2. El productor, para insertar un elemento, hace en este orden: down sobre **vacias** (si no hay ranura libre, se bloquea), después down sobre **mutex** (toma el acceso exclusivo), inserta el elemento, up sobre **mutex** (libera el acceso) y finalmente up sobre **llenas** (avisa que hay un elemento más).

Paso 3. El consumidor hace el espejo: down sobre **llenas** (si no hay nada, se bloquea), down sobre **mutex**, retira el elemento, up sobre **mutex**, up sobre **vacias**.

Paso 4. Observación clave: hay **dos usos distintos** de los semáforos en esta misma solución. El semáforo **mutex** se usa para **exclusión mutua**, y es un semáforo binario porque sólo vale 0 o 1. Los semáforos **llenas** y **vacias** se usan para **sincronización**, es decir, para garantizar que ciertas secuencias de eventos ocurran en el orden correcto.

Paso 5. **El orden de los down importa, y equivocarse produce un interbloqueo.** Si en el productor se invirtieran los dos down, haciendo primero down sobre mutex y después down sobre vacias, pasaría lo siguiente: con el búfer lleno, el productor tomaría el mutex, se bloquearía esperando una ranura vacía, y se quedaría dormido **con el mutex en su poder**. Cuando el consumidor intentara su down sobre mutex, se bloquearía también. Los dos quedarían bloqueados para siempre. Esa situación se llama **interbloqueo** (deadlock) y es el tema de la Unidad 6.

Paso 6. La regla práctica que se desprende: **primero el semáforo de sincronización, después el de exclusión mutua.** Nunca al revés.

**Semáforos e interrupciones.** Cada dispositivo de E/S puede tener un semáforo asociado, inicializado en 0. El proceso que quiere el dato hace down y se bloquea; el manejador de la interrupción hace up cuando el dato llega, y lo despierta. Así las interrupciones quedan ocultas detrás de una abstracción prolija.

### 2.3.8 Mutexes

Un **mutex** es una versión simplificada del semáforo: sirve **solamente para exclusión mutua**, y no cuenta señales. Puede estar en dos estados: abierto (0) o cerrado (distinto de 0).

Dos operaciones: **mutex_lock**, que adquiere el mutex o bloquea al hilo si está tomado, y **mutex_unlock**, que lo libera y despierta a algún hilo en espera.

Son simples, eficientes e ideales para hilos de nivel usuario.

**Diferencia importante con la espera ocupada en hilos de usuario.** En hilos de nivel usuario no hay un reloj que fuerce el cambio de hilo, así que una espera ocupada podría colgar el proceso entero. Por eso mutex_lock, cuando no consigue el mutex, llama a **thread_yield** para ceder la CPU a otro hilo. Todo ocurre en espacio de usuario, sin ninguna llamada al kernel, y por eso es muy rápido.

**Para que mutexes, semáforos o Peterson funcionen entre procesos distintos** hace falta memoria compartida, porque cada proceso tiene su propio espacio de direcciones. Las opciones son tres: estructuras en el kernel accesibles mediante llamadas al sistema, segmentos de memoria compartida entre procesos, o archivos compartidos, que es el peor caso. Y aunque dos procesos compartan memoria, **siguen sin ser hilos**: conservan sus recursos separados.

**Mutexes en Pthreads.** La biblioteca Pthreads ofrece: pthread_mutex_init, pthread_mutex_destroy, pthread_mutex_lock, pthread_mutex_trylock (que intenta tomarlo y falla en vez de bloquearse) y pthread_mutex_unlock. Los mutexes **no son obligatorios**: el programador tiene que usarlos correctamente, nadie se lo impone.

**Variables de condición.** Permiten que un hilo se bloquee hasta que se cumpla una condición. Las operaciones principales son pthread_cond_wait, pthread_cond_signal y pthread_cond_broadcast, esta última para despertar a varios hilos a la vez.

Tres características que se preguntan:

- **Siempre se usan junto con un mutex.** El patrón es: el hilo cierra el mutex, y si no puede obtener lo que necesita, espera en una variable de condición.
- **pthread_cond_wait libera y recupera el mutex en forma atómica.** Por eso el mutex es uno de sus parámetros.
- **No tienen memoria.** A diferencia de los semáforos, si se envía una señal a una variable de condición donde no hay ningún hilo esperando, **la señal se pierde**.

### 2.3.9 Monitores

Con semáforos, un error mínimo —invertir dos operaciones down— produce un interbloqueo. El libro lo compara con la programación en ensamblador, "sólo que peor", porque los errores son condiciones de carrera e interbloqueos, es decir comportamientos impredecibles e irreproducibles.

Para facilitar la escritura de programas correctos, Brinch Hansen (1973) y Hoare (1974) propusieron una primitiva de sincronización de **mayor nivel**: el **monitor**.

**Definición:** un monitor es una colección de procedimientos, variables y estructuras de datos agrupados en un tipo especial de módulo o paquete. Los procesos pueden llamar a los procedimientos del monitor cuando quieran, pero **no pueden acceder directamente a las estructuras de datos internas** desde procedimientos declarados fuera de él.

**La propiedad que los hace útiles:** sólo puede haber **un proceso activo dentro de un monitor en cualquier instante**. Cuando un proceso llama a un procedimiento del monitor, las primeras instrucciones comprueban si hay otro proceso adentro; si lo hay, el que llama se suspende hasta que el otro salga.

**La diferencia decisiva con los semáforos:** los monitores son una **construcción del lenguaje de programación**, no una biblioteca. El compilador sabe que son especiales y es **el compilador, no el programador**, quien implementa la exclusión mutua en las entradas, típicamente con un mutex o semáforo binario. Como no depende del programador, es mucho menos probable que algo salga mal. Basta con convertir todas las regiones críticas en procedimientos del monitor.

Como C no tiene monitores, el libro los ilustra en un lenguaje imaginario que llama Pidgin Pascal.

**Las variables de condición dentro del monitor.** La exclusión mutua no alcanza: también hace falta que los procesos se bloqueen cuando no puedan continuar. Para eso están las variables de condición, con dos operaciones:

- **wait**: cuando un procedimiento del monitor descubre que no puede continuar (por ejemplo, el productor encuentra el búfer lleno), hace wait sobre una variable de condición. Esto **bloquea al proceso que llama y además permite que otro proceso entre al monitor**.
- **signal**: despierta a un proceso que estaba esperando en esa variable de condición.

**El problema de qué pasa después de signal**, y las dos respuestas clásicas: para evitar tener dos procesos activos en el monitor al mismo tiempo, **Hoare** propuso dejar que el proceso recién despertado se ejecute y suspender al otro; **Brinch Hansen** propuso exigir que el proceso que hace signal **salga inmediatamente del monitor**, es decir, que signal sea la última instrucción del procedimiento. Esta segunda regla es más simple y es la que se suele adoptar.

**Java** ofrece monitores de una forma simplificada: un método declarado con la palabra synchronized garantiza que, una vez que un hilo empezó a ejecutarlo, ningún otro hilo puede ejecutar ningún método synchronized de ese objeto.

### 2.3.10 Pasaje de mensajes y llamada a procedimientos remotos

Los semáforos son demasiado de bajo nivel y los monitores no se pueden usar entre máquinas distintas, porque dependen de memoria compartida y de un compilador. El **pasaje de mensajes** resuelve las dos cosas con dos primitivas que son llamadas al sistema:

- **send(destino, mensaje)**: envía un mensaje a un destino dado.
- **receive(origen, mensaje)**: recibe un mensaje de un origen; si no hay ninguno disponible, el receptor **se bloquea** hasta que llegue uno.

Problemas de diseño propios del pasaje de mensajes:

- **Pérdida de mensajes en la red.** Se resuelve con acuses de recibo: si el emisor no recibe el acuse en cierto tiempo, retransmite.
- **Mensajes duplicados.** Si se pierde el acuse y el emisor retransmite, el receptor puede recibir el mismo mensaje dos veces. Se resuelve numerando los mensajes consecutivamente, para que el receptor reconozca y descarte duplicados.
- **Autenticación.** Cómo sabe el cliente que está hablando con el servidor verdadero y no con un impostor.
- **Rendimiento.** Copiar mensajes es siempre más lento que una operación sobre un semáforo.

**Llamada a procedimiento remoto (RPC).** Es la forma más usada de estructurar el paso de mensajes, y está en el programa de la materia. La idea es hacer que una llamada a un procedimiento que se ejecuta en **otra máquina** se vea, desde el código, exactamente igual que una llamada a un procedimiento local.

Cómo funciona:

1. El cliente llama a un procedimiento local llamado **stub del cliente**, que tiene la misma interfaz que el procedimiento remoto real.
2. El stub del cliente toma los parámetros, los empaqueta en un mensaje —a esto se lo llama **marshalling**— y ejecuta send.
3. El mensaje viaja por la red hasta la máquina del servidor.
4. El **stub del servidor** recibe el mensaje, desempaqueta los parámetros y llama al procedimiento real, de manera local.
5. El procedimiento se ejecuta y devuelve su resultado al stub del servidor, que lo empaqueta y lo manda de vuelta.
6. El stub del cliente lo recibe, lo desempaqueta y retorna al código que hizo la llamada original.

Desde el punto de vista del programador del cliente, **todo lo que pasó entre los pasos 2 y 6 es invisible**: escribió una llamada a procedimiento común. Esa transparencia es el objetivo de RPC.

Sus limitaciones: los parámetros que son punteros no se pueden pasar directamente, porque una dirección de memoria no significa nada en otra máquina; y con lenguajes sin tipado fuerte, el stub no siempre puede saber cuánto ocupa cada parámetro.

### 2.3.11 Barreras

Son un mecanismo de sincronización pensado para grupos de procesos, no para pares. Se usan en cálculos que avanzan por **fases**, donde ningún proceso puede empezar la fase siguiente hasta que **todos** hayan terminado la actual.

Se coloca una barrera al final de cada fase. Cuando un proceso llega a la barrera, se bloquea. Cuando llega el último, todos los procesos se liberan simultáneamente y avanzan juntos.

Descripción de la figura de la barrera: tres dibujos en secuencia. En el primero, cuatro procesos A, B, C y D avanzan hacia una línea vertical gruesa rotulada "barrera"; A, B y C ya la alcanzaron y están detenidos contra ella, D todavía va en camino. En el segundo, los cuatro están detenidos contra la barrera. En el tercero, la barrera desapareció y los cuatro procesos avanzan juntos del otro lado.

Referencia: (Tanenbaum, cap. 2.3, págs. 117 a 145, y cap. 8.2.4, págs. 558 a 560). (Apunte: resumen so (5).pdf, sección Comunicación entre procesos).

---

## 2.4 Planificación de procesos

### 2.4.1 Conceptos generales

Cuando una computadora se multiprograma, hay varios procesos o hilos en estado **listo** compitiendo por la CPU. Si hay una sola CPU, hay que decidir cuál se ejecuta a continuación.

- El **planificador de procesos** es la parte del sistema operativo que toma esa decisión.
- El **algoritmo de planificación** es el criterio que usa para decidir.

**Comportamiento de un proceso.** Todos los procesos alternan entre ráfagas de cálculo y esperas por E/S. Según cuánto duren esas ráfagas se distinguen dos tipos:

| Tipo | Ráfagas de CPU | Esperas de E/S |
|---|---|---|
| **Limitado a cálculos** (CPU-bound) | Largas | Poco frecuentes |
| **Limitado a E/S** (I/O-bound) | Cortas | Frecuentes |

El criterio que define la categoría es **la duración de la ráfaga de CPU, no la de la E/S**. Y hay una tendencia histórica importante: como las CPU se vuelven más rápidas mucho más rápido que los discos, los procesos tienden a ser cada vez más limitados a E/S, y por eso planificarlos bien importa cada vez más.

**Cuándo hay que planificar.** El planificador debe decidir en cinco situaciones:

1. Cuando se **crea** un proceso: decidir si se ejecuta el padre o el hijo.
2. Cuando un proceso **termina**: elegir otro de los listos, o uno inactivo si no hay ninguno.
3. Cuando un proceso **se bloquea**, sea por E/S, por un semáforo o por otra razón.
4. Cuando ocurre una **interrupción de E/S**: decidir si se ejecuta el proceso que acaba de desbloquearse o se continúa con el actual.
5. Cuando ocurre una **interrupción de reloj**: es la que habilita o no la apropiación.

**Apropiativa contra no apropiativa.** Esta distinción es la que más se toma del tema:

| No apropiativa | Apropiativa |
|---|---|
| El proceso se ejecuta **hasta que se bloquea o libera la CPU voluntariamente** | Cada proceso tiene un tiempo máximo asignado |
| No se lo interrumpe por tiempo | Si se le agota el tiempo, se lo suspende y se elige otro |
| Más simple, menos sobrecarga | **Requiere interrupciones de reloj** |
| Si un proceso no coopera, monopoliza la CPU | El sistema mantiene el control |

**Categorías de sistemas y sus metas.** Los algoritmos se agrupan según el tipo de sistema:

| Sistema | Características | Metas propias |
|---|---|---|
| **Por lotes** | No hay usuarios esperando; se aceptan algoritmos no apropiativos | **Rendimiento** (trabajos por hora), **tiempo de retorno**, utilización de la CPU |
| **Interactivos** | Los usuarios esperan respuesta; la apropiación es esencial. Incluye servidores | **Tiempo de respuesta**, **proporcionalidad** (cumplir las expectativas del usuario) |
| **De tiempo real** | Existen tiempos límite; no se ejecutan programas arbitrarios | **Cumplir los plazos**, **predictibilidad** |

Y hay tres metas comunes a **todos** los sistemas: **equidad** (procesos similares reciben servicio similar), **aplicación de las políticas** del sistema, y **balance** (mantener ocupados tanto la CPU como los dispositivos de E/S).

**Las dos métricas que hay que saber calcular**, porque son las que se piden en los ejercicios:

- **Tiempo de retorno** de un proceso = instante en que termina − instante en que llegó. Es todo lo que el proceso pasó en el sistema.
- **Tiempo de espera** de un proceso = tiempo de retorno − tiempo de ráfaga. Es el tiempo que pasó sin ejecutarse, esperando.

### 2.4.2 Planificación en sistemas de procesamiento por lotes

**Primero en llegar, primero en ser atendido (FCFS, First Come First Served).** No apropiativo. Los procesos se ejecutan en estricto orden de llegada, con una sola cola. Es fácil de entender y de implementar, y es equitativo en el sentido formal. Su defecto es grave: **un proceso largo retrasa a todos los que están detrás**, y perjudica especialmente a los procesos limitados a E/S, que tienen ráfagas cortas y quedan atrás de un proceso que calcula durante minutos.

**Trabajo más corto primero (SJF, Shortest Job First).** No apropiativo. Se ejecuta primero el trabajo con la ráfaga más corta. **Minimiza el tiempo de retorno promedio**, pero con una condición importante: **sólo es óptimo si todos los trabajos están disponibles simultáneamente**. Si llegan en momentos distintos, puede no serlo. Además, requiere **conocer de antemano el tiempo de ejecución**, lo que en la práctica obliga a estimarlo.

**Menor tiempo restante a continuación (SRTN o SRTF, Shortest Remaining Time Next).** Es la **versión apropiativa de SJF**. El planificador elige siempre el proceso cuyo **tiempo restante** sea menor. Cuando llega un proceso nuevo, se compara su ráfaga total con el tiempo que le falta al que está ejecutándose, y si el nuevo es menor, **lo desplaza**. Da excelente tiempo de respuesta a los trabajos cortos.

**Ejemplo resuelto paso a paso: comparar los cuatro algoritmos con los mismos datos.**

Planteo. Cuatro procesos, con estos instantes de llegada y ráfagas de CPU. Son los datos de un examen real de la cátedra:

| Proceso | Instante de llegada | Tiempo de ejecución |
|---|---|---|
| A | 0 | 6 |
| B | 2 | 5 |
| C | 4 | 3 |
| D | 6 | 4 |

**Resolución con FCFS.**

Paso 1. Se ordenan por llegada: A, B, C, D.
Paso 2. A se ejecuta de 0 a 6. B de 6 a 11. C de 11 a 14. D de 14 a 18.
Paso 3. Diagrama de Gantt en texto: A ocupa de 0 a 6, B de 6 a 11, C de 11 a 14, D de 14 a 18.
Paso 4. Cálculo de las métricas:

| Proceso | Llegada | Ráfaga | Termina | Retorno | Espera |
|---|---|---|---|---|---|
| A | 0 | 6 | 6 | 6 | 0 |
| B | 2 | 5 | 11 | 9 | 4 |
| C | 4 | 3 | 14 | 10 | 7 |
| D | 6 | 4 | 18 | 12 | 8 |

Paso 5. Retorno promedio = (6 + 9 + 10 + 12) / 4 = **9,25**. Espera promedio = (0 + 4 + 7 + 8) / 4 = **4,75**.

**Resolución con SJF (no apropiativo).**

Paso 1. En el instante 0 el único que llegó es A, así que A se ejecuta de 0 a 6. No se lo puede interrumpir porque el algoritmo no es apropiativo.
Paso 2. En el instante 6 ya llegaron B (ráfaga 5), C (ráfaga 3) y D (ráfaga 4). Se elige **el de ráfaga más corta: C**, con 3.
Paso 3. C se ejecuta de 6 a 9. Quedan B con 5 y D con 4. Se elige **D**.
Paso 4. D se ejecuta de 9 a 13. Queda B, que se ejecuta de 13 a 18.
Paso 5. Secuencia: A, C, D, B. Retorno promedio = **8,50**. Espera promedio = **4,00**.
Paso 6. Comparación con FCFS: el retorno promedio bajó de 9,25 a 8,50. Pero fijarse en B: su tiempo de espera **subió de 4 a 11**, porque es el proceso más largo y quedó relegado. SJF mejora el promedio castigando a los largos.

**Resolución con SRTF (apropiativo).**

Paso 1. En el instante 0 se ejecuta A, al que le faltan 6.
Paso 2. En el instante 2 llega B con ráfaga 5. A A le quedan 4 unidades (6 − 2). Como 4 es menor que 5, **A sigue**.
Paso 3. En el instante 4 llega C con ráfaga 3. A A le quedan 2. Como 2 es menor que 3, **A sigue**.
Paso 4. En el instante 6 llega D con 4, y justo ahí A termina. Quedan B con 5, C con 3 y D con 4: se elige **C**.
Paso 5. C se ejecuta de 6 a 9; después D de 9 a 13; después B de 13 a 18.
Paso 6. Secuencia: A, C, D, B. Retorno promedio = **8,50**. Espera promedio = **4,00**.
Paso 7. Observación importante: en este caso particular **SRTF dio exactamente el mismo resultado que SJF**. Eso pasa porque ningún proceso que llegó tenía una ráfaga menor que el tiempo restante del que estaba corriendo, así que nunca hubo apropiación. No es la regla general: si B hubiera tenido ráfaga 1 en vez de 5, habría desplazado a A en el instante 2.

### 2.4.3 Planificación en sistemas interactivos

**Planificación por turno circular (Round Robin).** Es el algoritmo más usado, simple y equitativo. A cada proceso se le asigna un intervalo de tiempo fijo llamado **quántum**. El proceso se ejecuta hasta que termina, se bloquea, o se le agota el quántum. Si se le agota, se lo interrumpe y **se lo coloca al final de la cola de procesos listos**.

**El problema del tamaño del quántum**, que es el aspecto de diseño que se pregunta:

- **Quántum muy corto**: muchas conmutaciones de proceso, mucho tiempo perdido en sobrecarga administrativa, baja eficiencia de la CPU.
- **Quántum muy largo**: mala respuesta a los procesos interactivos cortos; un proceso puede esperar varios segundos antes de ejecutarse. En el límite, con un quántum infinito, Round Robin degenera en FCFS.
- **Conclusión**: un quántum intermedio, del orden de **20 a 50 milisegundos**, suele ser razonable.

**Ejemplo resuelto paso a paso: Round Robin con quántum 2.**

Planteo: los mismos cuatro procesos de antes. A llega en 0 con ráfaga 6; B en 2 con 5; C en 4 con 3; D en 6 con 4. Quántum igual a 2.

Según la cátedra: la regla de desempate que usan en los exámenes es que **entre un proceso que llega y otro que sale del estado de ejecución, el que se pone antes en la cola es el proceso que llega**. Es decir, primero se encolan las llegadas que ocurrieron durante la rodaja, y después se reencola el proceso que acaba de agotar su quántum. Esto cambia el resultado, así que hay que aplicarlo.

Paso 1. Instante 0. Cola: A. Se ejecuta A de 0 a 2. Le quedan 4. Durante esa rodaja llegó B (en el instante 2). Primero se encola B, después se reencola A. **Cola: B, A.**

Paso 2. Instante 2. Se ejecuta B de 2 a 4. Le quedan 3. Durante la rodaja llegó C (instante 4). Se encola C y después B. **Cola: A, C, B.**

Paso 3. Instante 4. Se ejecuta A de 4 a 6. Le quedan 2. Durante la rodaja llegó D (instante 6). Se encola D y después A. **Cola: C, B, D, A.**

Paso 4. Instante 6. Se ejecuta C de 6 a 8. Le quedan 1. No llegó nadie nuevo. Se reencola C. **Cola: B, D, A, C.**

Paso 5. Instante 8. Se ejecuta B de 8 a 10. Le quedan 1. **Cola: D, A, C, B.**

Paso 6. Instante 10. Se ejecuta D de 10 a 12. Le quedan 2. **Cola: A, C, B, D.**

Paso 7. Instante 12. Se ejecuta A de 12 a 14. Le quedaban 2, así que **A termina** en el instante 14. **Cola: C, B, D.**

Paso 8. Instante 14. Se ejecuta C de 14 a 15. Le quedaba 1, así que **C termina** en 15. **Cola: B, D.**

Paso 9. Instante 15. Se ejecuta B de 15 a 16. Le quedaba 1, así que **B termina** en 16. **Cola: D.**

Paso 10. Instante 16. Se ejecuta D de 16 a 18. Le quedaban 2, así que **D termina** en 18.

Paso 11. Secuencia de ejecución completa: **A, B, A, C, B, D, A, C, B, D**.

Paso 12. Métricas:

| Proceso | Llegada | Ráfaga | Termina | Retorno | Espera |
|---|---|---|---|---|---|
| A | 0 | 6 | 14 | 14 | 8 |
| B | 2 | 5 | 16 | 14 | 9 |
| C | 4 | 3 | 15 | 11 | 8 |
| D | 6 | 4 | 18 | 12 | 8 |

Paso 13. Retorno promedio = (14 + 14 + 11 + 12) / 4 = **12,75**. Espera promedio = (8 + 9 + 8 + 8) / 4 = **8,25**.

Paso 14. Comparación de los tres algoritmos sobre los mismos datos:

| Algoritmo | Retorno promedio | Espera promedio |
|---|---|---|
| FCFS | 9,25 | 4,75 |
| SJF | 8,50 | 4,00 |
| SRTF | 8,50 | 4,00 |
| Round Robin, q = 2 | 12,75 | 8,25 |

Paso 15. Interpretación, que es lo que hay que saber justificar: **Round Robin tiene el peor retorno promedio de los cuatro**, y eso no es un error del cálculo. Round Robin no busca minimizar el retorno promedio: busca **repartir la CPU de forma equitativa y dar buen tiempo de respuesta**. Ningún proceso espera más de (n−1) quántums para tocar la CPU por primera vez, cosa que ni FCFS ni SJF garantizan. Se paga retorno promedio a cambio de equidad y respuesta.

**Planificación por prioridad.** A cada proceso se le asigna una prioridad, y siempre se ejecuta el proceso listo con mayor prioridad. Para evitar que un proceso de alta prioridad monopolice la CPU, se puede **reducir su prioridad con el tiempo**, o limitarle el tiempo máximo de ejecución con un quántum.

Las prioridades pueden ser **estáticas**, asignadas desde el inicio, o **dinámicas**, que cambian según el comportamiento del proceso. Un ejemplo importante de prioridad dinámica: los procesos limitados a E/S deben recibir la CPU rápido para poder iniciar su próxima operación de E/S y liberar la CPU enseguida. Una política simple es asignar una prioridad proporcional a **1 dividido f**, donde f es la fracción del último quántum que el proceso efectivamente usó. Un proceso que usó sólo el 2 por ciento de su quántum obtiene prioridad 50; uno que usó el 50 por ciento obtiene prioridad 2.

**Múltiples colas de prioridad (listas de espera múltiples).** Los procesos se agrupan en clases de prioridad. El planificador ejecuta primero todos los procesos de la clase más alta, usando turno circular dentro de cada clase, y las clases de menor prioridad no se ejecutan mientras haya procesos en las superiores.

El riesgo: si las prioridades no se reajustan, los procesos de baja prioridad pueden **morir de hambre** (starvation, inanición). La solución histórica, usada en CTSS, fue bajar un proceso de clase cada vez que agotaba su quántum completo, y darle quántums cada vez más largos a medida que baja: así un proceso largo recibe pocos quántums pero muy grandes, lo que reduce la cantidad de conmutaciones, y los interactivos quedan arriba.

**El proceso más corto a continuación.** Lleva la idea de SJF a los sistemas interactivos, tratando cada comando como un "trabajo". Como el tiempo real no se conoce, se **estima a partir del comportamiento pasado**, mediante promedios ponderados de ejecuciones anteriores. A esa técnica de estimación se la llama **envejecimiento** (aging): se toma la estimación anterior y la medición nueva y se promedian con un peso, típicamente la mitad y la mitad, de modo que las mediciones viejas van perdiendo influencia.

**Planificación garantizada (conducida por política).** El sistema hace una promesa explícita y la cumple: si hay n procesos activos, cada uno recibirá aproximadamente **1/n** del tiempo de CPU. El sistema mide cuánto recibió realmente cada proceso y cuánto le correspondía, calcula el cociente, y ejecuta al que tenga el cociente más bajo, es decir, al más postergado.

**Planificación por sorteo (lotería).** Cada proceso recibe **boletos de lotería**. En cada decisión de planificación se sortea un boleto y el proceso ganador obtiene la CPU. Más boletos significa más probabilidad.

Sus ventajas, que son las que se preguntan: es muy simple de implementar; es **muy flexible**, porque para dar a un proceso el 20 por ciento de la CPU basta con darle el 20 por ciento de los boletos; tiene alta capacidad de respuesta, porque un proceso que acaba de recibir boletos tiene chance inmediata; y los procesos **pueden transferirse boletos entre sí**, lo que resuelve elegantemente el caso cliente-servidor: el cliente le pasa sus boletos al servidor mientras espera la respuesta, y el servidor se los devuelve al terminar.

**Planificación por partes equitativas.** La planificación se hace **por usuario**, no por proceso. Cada usuario recibe una fracción de la CPU y sus procesos se planifican dentro de ese límite. Ejemplo: si el usuario A tiene 4 procesos y el usuario B tiene 1, y la política es mitad y mitad, el proceso de B recibe el 50 por ciento de la CPU y los cuatro procesos de A se reparten el otro 50 por ciento. Evita que un usuario obtenga más CPU simplemente creando más procesos.

**Planificación de dos y tres niveles.** Está en el programa de la materia. Cuando no todos los procesos caben en memoria principal, se separa la decisión en niveles: el **planificador de bajo nivel** elige, entre los procesos que están **en memoria**, cuál se ejecuta; el **planificador de alto nivel** decide qué procesos se traen del disco a memoria y cuáles se mandan al disco. Un tercer nivel, cuando existe, decide la admisión de trabajos nuevos al sistema. Los criterios que usa el planificador de alto nivel son cuánto tiempo hace que un proceso fue intercambiado, cuánta CPU recibió recientemente, qué tan grande es, y cuál es su prioridad.

### 2.4.4 Planificación en sistemas de tiempo real

En los sistemas de tiempo real el tiempo es crítico: obtener la respuesta correcta fuera de tiempo puede ser tan grave como no obtenerla. Ejemplos: reproductores de audio, control industrial, monitoreo médico, robots.

Se distinguen **tiempo real duro**, donde los tiempos límite deben cumplirse siempre y de manera absoluta, y **tiempo real suave**, donde fallar ocasionalmente es tolerable aunque degrade la calidad.

Los eventos a los que debe responder el sistema pueden ser **periódicos**, si ocurren a intervalos regulares, o **aperiódicos**, si ocurren de forma impredecible.

**Ejemplo resuelto paso a paso: determinar si un sistema es planificable.**

Planteo. Un sistema de tiempo real debe atender tres eventos periódicos. El evento 1 ocurre cada 100 milisegundos y consume 50 milisegundos de CPU. El evento 2 ocurre cada 200 milisegundos y consume 30. El evento 3 ocurre cada 500 milisegundos y consume 100. ¿El sistema es planificable?

Paso 1. La condición de planificabilidad es que la suma de las fracciones de CPU que consume cada evento sea menor o igual a 1. Es decir, la sumatoria de Ci dividido Pi, donde Ci es el tiempo de CPU que requiere el evento i y Pi es su período, debe ser menor o igual a 1.

Paso 2. Se calcula la fracción de cada evento:
- Evento 1: 50 / 100 = 0,50
- Evento 2: 30 / 200 = 0,15
- Evento 3: 100 / 500 = 0,20

Paso 3. Se suman: 0,50 + 0,15 + 0,20 = **0,85**.

Paso 4. Como 0,85 es menor que 1, **el sistema es planificable**. Queda un 15 por ciento de CPU de margen.

Paso 5. Variante: si el evento 3 consumiera 200 milisegundos en vez de 100, su fracción sería 200/500 = 0,40 y la suma daría 0,50 + 0,15 + 0,40 = **1,05**, que es mayor que 1. El sistema **no sería planificable** y no habría forma de garantizar los plazos, por más inteligente que fuera el algoritmo. El problema sería de capacidad, no de planificación.

**Planificación estática y dinámica.** En la **estática**, las decisiones se toman antes de que el sistema empiece a ejecutarse, y requiere información completa por adelantado. En la **dinámica**, se toman en tiempo de ejecución: es más flexible pero menos predecible.

### 2.4.5 Política contra mecanismo, y planificación de hilos

**Política contra mecanismo.** El planificador del kernel no sabe qué hacen los procesos por dentro, pero el proceso padre sí sabe cuál de sus hijos es más importante. La solución es separar las dos cosas: el **mecanismo** de planificación está en el kernel, pero la **política** la fija un proceso de usuario. En la práctica, el kernel usa un algoritmo por prioridad y ofrece una llamada al sistema con la que un proceso puede establecer y modificar las prioridades de sus hijos. Es el mismo principio que aparece en los microkernels de la Unidad 1.

**Planificación de hilos.** Cuando hay varios procesos con varios hilos cada uno, existen dos niveles de paralelismo, y la planificación cambia radicalmente según dónde estén implementados los hilos.

**Con hilos a nivel usuario:** el kernel no sabe que existen. Elige un proceso, por ejemplo A, y le da su quántum completo. El planificador de hilos dentro de A decide cuál de sus hilos ejecutar. Como **no hay interrupciones de reloj dentro del proceso**, ese hilo puede ejecutarse todo el tiempo que quiera. Si consume todo el quántum del proceso, el kernel pasa a otro proceso. El comportamiento antisocial de un hilo **no afecta a los demás procesos**, sólo a sus compañeros de proceso.

**Con hilos a nivel kernel:** el kernel elige un hilo específico, sin tener que tomar en cuenta a qué proceso pertenece. El hilo recibe un quántum y **se lo suspende obligatoriamente** si se excede.

**Ejemplo resuelto paso a paso: la misma carga, dos resultados distintos.**

Planteo. Dos procesos, A y B, con tres hilos cada uno. El quántum del sistema es de 50 milisegundos. Cada hilo trabaja 5 milisegundos y después se bloquea o cede la CPU.

Paso 1. **Con hilos a nivel usuario.** El kernel le da el quántum de 50 milisegundos al proceso A. Dentro de A, sus tres hilos se van turnando de a 5 milisegundos cada uno. En 50 milisegundos entran diez turnos. La secuencia es A1, A2, A3, A1, A2, A3, A1, A2, A3, A1. Recién ahí el kernel conmuta al proceso B.

Paso 2. **Con hilos a nivel kernel.** El kernel ve seis hilos y los planifica a todos juntos. Puede intercalarlos entre procesos. En un período de 30 milisegundos, el orden podría ser A1, B1, A2, B2, A3, B3.

Paso 3. La diferencia decisiva: la secuencia del paso 2, que alterna entre procesos distintos, **es imposible con hilos a nivel usuario**, porque dentro del quántum de A el kernel ni se entera de que hay hilos.

Paso 4. El contrapeso es el rendimiento. Conmutar entre dos hilos de usuario son unas pocas instrucciones de máquina. Conmutar entre dos hilos de kernel exige una **conmutación de contexto completa**: cambiar el mapa de memoria e invalidar la caché, lo que es varias órdenes de magnitud más lento.

Paso 5. Un detalle fino que el kernel puede aprovechar: como sabe que conmutar de un hilo de A a un hilo de B es más caro que conmutar entre dos hilos de A (porque hay que cambiar el mapa de memoria), ante dos hilos de igual importancia **puede dar preferencia al que pertenece al mismo proceso** que el hilo que se acaba de bloquear.

Paso 6. Y una ventaja que sólo tienen los hilos de usuario: pueden usar un **planificador específico para la aplicación**. En el servidor web, el sistema en tiempo de ejecución sabe que si un hilo trabajador se bloqueó, lo mejor es ejecutar el **despachador**, para que ponga a trabajar a otro trabajador. El kernel nunca podría saber eso.

Referencia: (Tanenbaum, cap. 2.4, págs. 145 a 163). (Apunte: resumen so (5).pdf, sección 2.4). (Apunte: imágenes de exámenes de la cátedra, para la regla de desempate de Round Robin).

---

## 2.5 Problemas clásicos de comunicación entre procesos

Estos problemas no son ejercicios artificiales: son modelos de situaciones reales de competencia por recursos y acceso a datos compartidos. Se usan para comparar métodos de sincronización.

### 2.5.1 El problema de los filósofos comelones

**La situación.** Cinco filósofos se sientan alrededor de una mesa circular. Cada uno alterna entre pensar y comer. Para comer necesita **dos tenedores**, el de su izquierda y el de su derecha. Hay exactamente **un tenedor entre cada par de filósofos**, o sea cinco tenedores en total.

Descripción de la figura: un círculo que representa la mesa. Alrededor, cinco círculos pequeños numerados del 0 al 4, que son los filósofos. Entre cada par de filósofos consecutivos, una línea corta radial que representa un tenedor; hay cinco. En el centro de la mesa, un plato grande de espaguetis.

**El objetivo:** permitir que los filósofos coman y piensen sin **interbloqueo**, sin **inanición**, y permitiendo el **mayor paralelismo posible**.

**Ejemplo resuelto paso a paso: por qué fallan las soluciones obvias.**

Intento 1. Cada filósofo toma primero el tenedor izquierdo y después el derecho.

Paso 1. Supongamos que los cinco filósofos tienen hambre exactamente al mismo tiempo.
Paso 2. Los cinco toman su tenedor izquierdo. Ahora los cinco tenedores están tomados.
Paso 3. Los cinco intentan tomar su tenedor derecho, que es el izquierdo de su vecino, y ninguno está disponible.
Paso 4. Los cinco esperan para siempre, cada uno con un tenedor en la mano. **Interbloqueo.**

Intento 2. Igual que el anterior, pero si el tenedor derecho no está disponible, el filósofo suelta el izquierdo y vuelve a intentar.

Paso 1. Los cinco toman el izquierdo, ven que no hay derecho, y sueltan el izquierdo.
Paso 2. Esperan un momento y vuelven a intentar, los cinco a la vez.
Paso 3. Vuelve a pasar exactamente lo mismo, indefinidamente. No hay interbloqueo formal, porque los procesos no están bloqueados, pero **nadie come nunca**. Esto se llama **inanición** (starvation), y en su versión sincronizada, **bloqueo activo** (livelock).

Intento 3. Proteger todo con un único mutex global: el filósofo toma el mutex, come, y lo libera.

Paso 1. Funciona: no hay interbloqueo ni inanición.
Paso 2. Pero sólo **un filósofo puede comer a la vez**, cuando en una mesa de cinco con cinco tenedores podrían comer dos simultáneamente (por ejemplo el 0 y el 2, que no son vecinos).
Paso 3. Es correcto pero **desperdicia la mitad del paralelismo disponible**. Es una solución válida pero mala.

**La solución correcta.**

Paso 1. Cada filósofo tiene un **estado**, que puede ser pensando, hambriento o comiendo.
Paso 2. Se usa un **mutex** para proteger el acceso al arreglo de estados, que es la estructura compartida.
Paso 3. Se usa **un semáforo por filósofo**, inicializado en 0, que sirve para bloquearlo si no puede comer todavía.
Paso 4. Cuando un filósofo tiene hambre, marca su estado como hambriento y ejecuta una prueba: **sólo puede pasar a comer si está hambriento y ninguno de sus dos vecinos está comiendo**. Si la prueba falla, se bloquea en su propio semáforo.
Paso 5. Cuando un filósofo termina de comer, vuelve al estado pensando y **ejecuta la misma prueba sobre sus dos vecinos**, para despertar al que ahora pueda comer.
Paso 6. Resultado: no hay interbloqueo, no hay inanición, y **pueden comer varios filósofos al mismo tiempo siempre que no sean vecinos**, que es el máximo paralelismo posible.

### 2.5.2 El problema de los lectores y escritores

**La situación.** Modela el acceso concurrente a una base de datos. Hay dos tipos de procesos: **lectores**, que sólo consultan datos, y **escritores**, que los modifican.

Las reglas surgen de la naturaleza del problema:

- **Varios lectores pueden leer al mismo tiempo**, porque leer no modifica nada y no se interfieren entre sí.
- **Si un escritor está escribiendo, nadie más puede acceder**, ni lectores ni otros escritores.

**La solución clásica, paso a paso.**

Paso 1. Se lleva una cuenta de cuántos lectores hay activos, protegida por un mutex.
Paso 2. **El primer lector que entra** bloquea la base de datos frente a los escritores, haciendo down sobre un semáforo de la base.
Paso 3. Los lectores siguientes simplemente incrementan la cuenta y entran, sin tocar el semáforo de la base.
Paso 4. Cada lector que sale decrementa la cuenta.
Paso 5. **El último lector que sale** libera la base, haciendo up sobre el semáforo, y recién ahí un escritor puede entrar.
Paso 6. El escritor, para entrar, necesita el semáforo de la base en exclusiva.

**El problema de esta solución.** Supongamos que hay un lector leyendo y llega un escritor. El escritor espera. Mientras espera, llega un segundo lector, que entra sin problema porque la base ya está tomada por lectores. Luego un tercero, un cuarto. Mientras siga llegando al menos un lector antes de que se vaya el último, **la cuenta nunca llega a cero** y el escritor **espera indefinidamente**. Eso es **inanición de escritores**.

**La alternativa.** Dar prioridad a los escritores: cuando un escritor está esperando, los lectores nuevos se encolan detrás de él en vez de entrar directamente. Así, cuando terminan los lectores que ya estaban adentro, entra el escritor. Esto **evita la inanición pero reduce la concurrencia y el rendimiento**, porque los lectores dejan de aprovechar que podrían leer en paralelo.

La elección entre una y otra es una decisión de diseño que depende de la aplicación: no hay una respuesta universalmente correcta.

### 2.5.3 El problema del barbero dormilón

Nota sobre las fuentes: este problema figura en el programa de la materia pero **no está desarrollado en la tercera edición del Tanenbaum**, que trata sólo los filósofos y los lectores y escritores. Lo que sigue es un complemento elaborado para cubrir el punto del programa, basado en la formulación clásica del problema, que aparece en Stallings, Sistemas Operativos, referencia 2 del programa.

**La situación.** Una barbería tiene un barbero, un sillón de atención y N sillas de espera. Si no hay clientes, el barbero se sienta en su sillón y **se duerme**. Cuando llega un cliente:

- Si el barbero está durmiendo, el cliente lo **despierta** y se hace atender.
- Si el barbero está atendiendo a otro cliente y **hay una silla libre**, el cliente se sienta a esperar.
- Si el barbero está ocupado y **todas las sillas están llenas**, el cliente **se va**.

**Qué modela:** es el problema del productor-consumidor con un búfer limitado, donde los clientes son los elementos producidos, el barbero es el consumidor, y las N sillas son el búfer. Lo que agrega respecto del productor-consumidor clásico es que **el productor no se bloquea cuando el búfer está lleno: descarta el elemento**. Ese es el comportamiento de un servidor que rechaza conexiones cuando su cola está saturada.

**La solución con semáforos, paso a paso.**

Paso 1. Se definen tres semáforos y una variable:

| Elemento | Valor inicial | Para qué |
|---|---|---|
| clientes | 0 | Cuenta los clientes que esperan, sin contar al que está en el sillón |
| barberos | 0 | Cuenta los barberos libres, que acá es 0 o 1 |
| mutex | 1 | Exclusión mutua sobre la variable de la cuenta |
| esperando | 0 | Variable común que lleva la cuenta de clientes en espera |

Paso 2. **El barbero**, en un ciclo infinito: hace down sobre **clientes**, lo que lo duerme si no hay ninguno; toma el mutex; decrementa la cuenta de los que esperan; hace up sobre **barberos** para avisar que está listo; libera el mutex; y corta el pelo.

Paso 3. **El cliente que llega**: toma el mutex; mira la cuenta de los que esperan.

Paso 4. Si la cuenta es **menor que N**, hay lugar: incrementa la cuenta, hace up sobre **clientes** (que despierta al barbero si estaba dormido), libera el mutex, hace down sobre **barberos** (que lo bloquea hasta que el barbero esté listo) y se hace cortar el pelo.

Paso 5. Si la cuenta es **igual a N**, no hay lugar: simplemente libera el mutex y **se va de la barbería**. No se bloquea ni espera.

Paso 6. Por qué funciona: el semáforo **clientes** resuelve exactamente la condición de carrera de sleep y wakeup del productor-consumidor. Si un cliente llega justo cuando el barbero está por dormirse, el up sobre clientes queda **contado** en el semáforo y el down del barbero no lo duerme. La señal no se pierde, que era todo el problema.

Referencia: (Tanenbaum, cap. 2.5, págs. 163 a 168). (Apunte: resumen so (5).pdf, sección 2.5). El problema del barbero dormilón es un complemento elaborado, porque no figura en la tercera edición del libro.

---

## 2.6 Multiprocesamiento

### 2.6.1 Hardware de multiprocesador

Un **multiprocesador con memoria compartida** es un sistema de cómputo con dos o más CPU que comparten acceso completo a una memoria RAM común. Un programa que se ejecuta en cualquiera de las CPU ve un espacio de direcciones virtual normal; la única propiedad inusual es que una CPU puede escribir un valor en una posición de memoria y otra CPU puede leerlo inmediatamente después.

**La diferencia con una multicomputadora.** En un multiprocesador, las CPU **comparten memoria física**. En una multicomputadora, cada CPU tiene su propia memoria privada y la comunicación se hace **por paso de mensajes** a través de una red de interconexión. Esta distinción es la que organiza todo el capítulo 8 del libro.

**Tipos de multiprocesadores según el tiempo de acceso a memoria:**

| Tipo | Qué significa | Característica |
|---|---|---|
| **UMA** (Uniform Memory Access) | Acceso uniforme a memoria | Toda la memoria se accede con la **misma velocidad** desde cualquier CPU |
| **NUMA** (Non-Uniform Memory Access) | Acceso no uniforme | El acceso a la memoria **local** de cada CPU es más rápido que a la memoria remota |

En los UMA, la forma más simple de conectar las CPU a la memoria es un **bus único**, pero con más de tres o cuatro CPU el bus se satura y se vuelve el cuello de botella. Para aliviarlo se agrega una **caché a cada CPU**, lo que introduce el problema de mantener la coherencia entre cachés. Otras formas de conexión son los **conmutadores de barras cruzadas** (crossbar), que permiten conexiones simultáneas pero crecen con el cuadrado de la cantidad de nodos, y las **redes de conmutación multietapa**, como la red omega, que son un compromiso entre costo y rendimiento.

### 2.6.2 Tipos de sistemas operativos de multiprocesadores

Hay tres formas de organizar un sistema operativo para varias CPU, y la comparación entre ellas es lo que se pregunta.

**Modelo 1: un sistema operativo por CPU.** La memoria se divide en tantas particiones como CPU haya, y cada CPU recibe su propia memoria privada y su propia copia del sistema operativo. Es simple, pero tiene cuatro defectos serios: no hay un conjunto compartido de procesos, así que una CPU puede estar desbordada mientras otra está ociosa; cada sistema operativo tiene su propia caché de disco, lo que lleva a inconsistencias; no hay forma de compartir páginas de memoria; y, en general, es como tener varias computadoras separadas que casualmente comparten el gabinete.

**Modelo 2: multiprocesadores maestro-esclavo.** Hay **una sola copia** del sistema operativo, que se ejecuta siempre en la CPU 1, el **maestro**. Las demás CPU son **esclavas** y sólo ejecutan programas de usuario. Cuando una esclava necesita un servicio del sistema, se lo pide al maestro.

Resuelve los problemas del modelo anterior: hay una sola estructura de datos con todos los procesos listos, así que cuando una CPU queda libre pide trabajo al maestro y nunca queda ociosa habiendo trabajo. Su defecto es que **el maestro se convierte en un cuello de botella**: con muchas CPU, una sola atendiendo todas las llamadas al sistema no da abasto. Es aceptable con pocas CPU, no con muchas.

**Modelo 3: multiprocesadores simétricos (SMP).** Hay **una sola copia del sistema operativo en memoria, pero cualquier CPU puede ejecutarla**. Se elimina el cuello de botella del maestro, pero aparece uno nuevo: si dos CPU ejecutan código del sistema operativo al mismo tiempo sobre las mismas estructuras de datos, hay condiciones de carrera.

La solución más simple es un **mutex único para todo el sistema operativo**, pero eso lo convierte en un maestro-esclavo disfrazado, porque sólo una CPU por vez puede estar en el kernel. La solución real es **dividir el sistema operativo en regiones críticas independientes**, cada una con su propio mutex: una para la tabla de procesos, otra para el sistema de archivos, otra para la memoria. Así varias CPU pueden estar dentro del kernel al mismo tiempo mientras toquen partes distintas. Esto exige un trabajo cuidadoso para evitar interbloqueos entre esos mutexes.

**Sincronización de multiprocesadores.** Las técnicas de la sección 2.3 no alcanzan tal cual: deshabilitar interrupciones **no sirve**, porque sólo afecta a la CPU que lo hizo. Se requiere TSL o XCHG, que bloquean el bus de memoria, y aun así hay un problema de rendimiento: muchas CPU girando sobre el mismo candado **saturan el bus**. La mejora habitual es el **TSL con reintentos espaciados**: en vez de girar continuamente, el que falla espera un intervalo creciente antes de volver a intentar.

### 2.6.3 Planificación de multiprocesadores

Con varias CPU, la planificación tiene **dos dimensiones**: qué proceso ejecutar y **en cuál CPU ejecutarlo**. Esa segunda dimensión no existe en un monoprocesador.

**Tiempo compartido simple.** Se mantiene una sola estructura de datos con todos los procesos listos, protegida por un mutex. Cuando una CPU queda libre, toma el proceso de mayor prioridad. Funciona, pero tiene dos problemas: la contención por la estructura compartida cuando hay muchas CPU, y la **pérdida de afinidad de caché**: si un proceso se ejecuta alternadamente en CPU distintas, cada vez encuentra la caché fría y pierde rendimiento.

**Planificación por afinidad.** Para resolver lo anterior, se intenta ejecutar cada proceso **en la misma CPU donde se ejecutó la vez anterior**, aprovechando que su información todavía está en la caché de esa CPU. El algoritmo de **dos niveles** asigna cada proceso a una CPU al crearlo, y cada CPU planifica sus propios procesos con su propia cola. Sólo se migra un proceso a otra CPU cuando hay un desbalance importante de carga.

**Comparticion de espacio.** En lugar de repartir el tiempo, se reparten **las CPU**: a un grupo de hilos relacionados se le asignan N CPU al mismo tiempo, y corren en paralelo de verdad hasta terminar. Es útil cuando los hilos de un proceso cooperan estrechamente.

**Planificación por pandillas (gang scheduling).** Resuelve un problema concreto: si dos hilos que se comunican constantemente están planificados en momentos distintos, cada mensaje tarda un quántum entero en ser respondido. La solución es planificar **todos los hilos de un proceso a la vez**, en todas las CPU, y conmutarlos a todos juntos al mismo tiempo, en rodajas sincronizadas. Así, cuando un hilo manda un mensaje, su interlocutor está efectivamente corriendo en ese mismo instante.

### 2.6.4 Paralelismo y tendencias actuales

La distinción entre paralelismo y concurrencia es conceptual y se pregunta:

- **Concurrencia**: varias actividades **progresan** en el mismo período de tiempo, alternándose. Existe aunque haya una sola CPU. Es el pseudoparalelismo.
- **Paralelismo**: varias actividades se **ejecutan literalmente al mismo instante**, lo que exige varias CPU o varios núcleos.

Un sistema multihilo sobre una sola CPU es concurrente pero no paralelo. Sobre un multinúcleo, es las dos cosas.

**Las tendencias actuales** que el libro señala: el aumento de rendimiento ya no viene de subir la frecuencia de reloj sino de **agregar núcleos**, lo que convierte a la planificación de multiprocesadores en un problema cotidiano de cualquier computadora de escritorio y no solo de los grandes servidores. La parte difícil pasa a ser que **las aplicaciones aprovechen** ese poder de cómputo, que es un problema de programación, no de hardware. Y, como se conoce mucho sobre multiprocesadores gracias a décadas de investigación previa, trasladar ese conocimiento a los sistemas multinúcleo no presenta grandes dificultades técnicas.

Referencia: (Tanenbaum, cap. 8.1, págs. 526 a 548).

---

## 2.7 Análisis comparativo: casos de estudio

### 2.7.1 Caso 1: la llamada al sistema fork en Linux

**Conceptos fundamentales.** En Linux, cada proceso ejecuta un programa y tiene un hilo de control inicial. Un proceso se crea con **fork**, que crea una copia exacta del proceso original, y ambos continúan ejecutando el mismo código desde la instrucción siguiente.

**Qué se copia y qué no.** Padre e hijo tienen cada uno su propia imagen de memoria privada. Si el padre modifica una variable después del fork, el cambio **no es visible** para el hijo, y viceversa. Los archivos abiertos, en cambio, **se comparten**: comparten el mismo apuntador de posición, de modo que si el padre lee del archivo, el hijo ve avanzada la posición.

**Copia al escribir.** Copiar toda la imagen de memoria sería muy costoso, sobre todo porque lo habitual es que el hijo ejecute execve inmediatamente después y descarte esa copia. Por eso Linux usa **copy on write**: después del fork, padre e hijo comparten físicamente las mismas páginas, marcadas como de sólo lectura. Si alguno **intenta escribir** en una de ellas, se produce un fallo de protección y recién en ese momento el kernel hace una copia privada de esa página. Se copia sólo lo que efectivamente se modifica.

**El patrón fork + exec, paso a paso.** Es lo que hace el shell cada vez que ejecutás un comando:

Paso 1. El shell lee el comando de la terminal.
Paso 2. El shell ejecuta **fork**, creando un clon de sí mismo.
Paso 3. El proceso hijo ejecuta **execve**, que **reemplaza completamente su imagen de memoria** por la del programa solicitado. El PID no cambia: es el mismo proceso ejecutando otro programa.
Paso 4. El shell padre ejecuta **waitpid**, bloqueándose hasta que el hijo termine.
Paso 5. El hijo ejecuta el programa y al terminar llama a **exit**, devolviendo un código de salida.
Paso 6. El padre se desbloquea, recibe el código de salida y vuelve a mostrar el prompt.

Paso 7. Por qué están separados fork y exec, que es la pregunta de fondo: porque **entre el fork y el exec el hijo puede modificar su entorno**. Ahí es exactamente donde el shell implementa la redirección y las tuberías: después del fork, el hijo cierra su descriptor de salida estándar y lo reemplaza por un archivo o por un extremo de una tubería, **y recién entonces** llama a execve. El programa que se ejecuta no sabe nada de eso: escribe en la salida estándar como siempre. Si fork y exec fueran una sola operación, como CreateProcess en Windows, no habría ningún momento para hacer ese ajuste.

**Implementación de procesos e hilos en Linux.** Linux no distingue internamente entre procesos e hilos: a ambos los llama **tareas** (tasks). Un hilo es simplemente una tarea que **comparte** ciertos recursos con otra. La llamada que lo expresa es **clone**, que recibe banderas indicando exactamente qué compartir: el espacio de direcciones, la tabla de archivos abiertos, los manejadores de señales, el directorio de trabajo. Con todas las banderas activadas, clone crea lo que llamaríamos un hilo; sin ninguna, crea lo que llamaríamos un proceso. **fork es un caso particular de clone**, y esa unificación es una decisión de diseño distintiva de Linux.

### 2.7.2 Caso 2: procesos, hilos y trabajos en Windows

Windows organiza la ejecución en una jerarquía de cuatro niveles, y esta clasificación es la que se toma:

| Concepto | Qué es |
|---|---|
| **Trabajo** (job) | Un conjunto de procesos que comparten cuotas y límites: máximo de memoria, de CPU, de procesos. Sirve para administrar grupos de procesos como una unidad |
| **Proceso** | Un contenedor de recursos: espacio de direcciones, manejadores, y uno o más hilos. **No se ejecuta: contiene** |
| **Hilo** | La unidad que el kernel planifica. Es lo que realmente se ejecuta |
| **Fibra** | Un hilo ligero planificado **íntegramente en espacio de usuario**. El kernel no sabe que existe |

Las fibras son la implementación de hilos de nivel usuario de Windows, con las mismas ventajas y desventajas descritas en la sección 2.2.

**Diferencias de diseño con UNIX**, que es lo que hay que poder contrastar:

- **Creación**: UNIX separa fork (duplicar) de execve (cargar otro programa); Windows los une en **CreateProcess**, que recibe más de diez parámetros.
- **Jerarquía**: en UNIX hay un árbol real con init en la raíz y los procesos no pueden desheredar a sus hijos; en Windows **no hay jerarquía real**, todos los procesos son iguales, y el manejador del hijo puede cederse a otro proceso.
- **Unidad de planificación**: en Linux el kernel planifica tareas; en Windows planifica **hilos**, y el proceso es sólo el contenedor.

**Diagrama de estados y transiciones de un hilo en Windows.** El programa de la materia lo pide explícitamente. Windows usa un modelo más detallado que los tres estados clásicos:

Descripción del diagrama: siete óvalos conectados por flechas. Desde **Inicializado**, una flecha a **Listo**. Desde **Listo**, una flecha a **De reserva** (standby), que significa que el hilo fue elegido para ejecutarse en una CPU pero todavía no empezó; de ahí una flecha a **En ejecución**. Desde **En ejecución** salen tres flechas: una a **En espera** (cuando el hilo se bloquea), otra de vuelta a **Listo** (cuando se le agota el quántum o lo desplaza un hilo de mayor prioridad), y otra a **Terminado**. Desde **En espera**, una flecha a **Transición** (cuando el evento se cumplió pero la pila del hilo fue paginada a disco) y otra directamente a **Listo**. Desde **Transición**, una flecha a **Listo** cuando la pila vuelve a memoria.

Los dos estados que no existen en el modelo clásico de tres estados son **De reserva**, que modela el instante entre que se elige un hilo y que empieza a correr, y **Transición**, que aparece porque la memoria virtual puede haber mandado al disco la pila del hilo mientras estaba bloqueado.

**Thread scheduling en Windows.** El planificador usa **32 niveles de prioridad**, de 0 a 31, divididos en una clase de tiempo real (16 a 31) y una clase variable o dinámica (1 a 15), más el nivel 0 reservado para el hilo de página cero. Dentro de cada nivel se usa turno circular. La prioridad de un hilo de la clase variable **sube temporalmente** cuando termina una operación de E/S, cuando se desbloquea un hilo de una ventana en primer plano, o cuando un hilo llevó demasiado tiempo esperando (para evitar la inanición), y **baja** gradualmente cuando consume su quántum completo. Es exactamente la idea de prioridades dinámicas de la sección 2.4.3.

**Scheduling en multiprocesadores.** Windows mantiene el concepto de **afinidad**: cada hilo tiene un procesador ideal y un procesador anterior, y el planificador intenta ejecutarlo donde su caché esté caliente. También permite fijar un hilo a un subconjunto de CPU mediante una máscara de afinidad.

Referencia: (Tanenbaum, cap. 10.3, págs. 739 a 755, y cap. 11.4). Los detalles de Windows provienen parcialmente de Russinovich y Solomon, Windows Internals, referencia 5 del programa, que no está disponible en el material; el diagrama de estados del hilo y los niveles de prioridad son un complemento elaborado a partir del programa de la materia.

---

## Síntesis de la unidad

Los puntos que conviene tener firmes al terminar la Unidad 2:

1. Un proceso es un programa en ejecución, con su programa, su entrada, su salida y su **estado**. El pseudoparalelismo es la ilusión que produce la conmutación rápida entre procesos sobre una sola CPU.
2. Los tres estados son **en ejecución, listo y bloqueado**, con cuatro transiciones, y **no existe transición directa de bloqueado a en ejecución**: siempre se pasa por listo.
3. El **BCP** o entrada de la tabla de procesos guarda todo lo necesario para reanudar un proceso: registros, contador de programa, estado, prioridad, memoria y archivos abiertos. El cambio de contexto no es gratis.
4. En UNIX, **fork** duplica el proceso y **execve** reemplaza su imagen; están separados para que el hijo pueda ajustar su entorno en el medio, que es donde se implementan la redirección y las tuberías. Windows los une en CreateProcess.
5. Un **hilo** es la unidad de ejecución; el **proceso** es el agrupamiento de recursos. Cada hilo tiene su contador de programa, registros, pila y estado; todo lo demás es del proceso y se comparte.
6. En hilos de **usuario**, una llamada bloqueante bloquea a todo el proceso, pero conmutar es rapidísimo. En hilos de **kernel** es al revés: el kernel puede ejecutar otro hilo del mismo proceso, pero cada conmutación cuesta un cambio de contexto completo.
7. Una **condición de carrera** ocurre cuando el resultado depende del orden y el momento de ejecución de procesos que comparten datos. Se evita garantizando **exclusión mutua** en las regiones críticas, respetando las **cuatro condiciones**.
8. La **espera ocupada** desperdicia CPU y puede producir **inversión de prioridades**. Los **semáforos** la resuelven contando señales con operaciones atómicas down y up; los **mutexes** son su versión binaria; los **monitores** son una construcción del lenguaje donde **el compilador** garantiza la exclusión mutua.
9. En el productor-consumidor con semáforos, **el orden de los down importa**: primero el de sincronización, después el de exclusión mutua. Invertirlos produce un **interbloqueo**.
10. **FCFS** es simple pero castiga a los procesos cortos que quedan detrás de uno largo. **SJF** minimiza el retorno promedio, pero sólo es óptimo si todos llegan juntos, y requiere conocer las ráfagas. **SRTF** es su versión apropiativa. **Round Robin** da el peor retorno promedio pero garantiza equidad y buen tiempo de respuesta, y todo depende del tamaño del quántum.
11. Tiempo de **retorno** = instante de finalización menos instante de llegada. Tiempo de **espera** = retorno menos ráfaga.
12. Los **filósofos comelones** modelan el interbloqueo y la inanición al competir por varios recursos; los **lectores y escritores**, la inanición de escritores al priorizar la concurrencia de lectura.
13. En multiprocesadores, la planificación tiene **dos dimensiones**: qué proceso y en qué CPU. La **afinidad de caché** y la **planificación por pandillas** son las dos ideas que resuelven los problemas que no existen en un monoprocesador.
