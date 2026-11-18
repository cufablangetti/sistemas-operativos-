
## 6. Relojes

Los relojes (temporizadores) son esenciales en cualquier sistema multiprogramado: mantienen la hora del día y evitan que un proceso monopolice la CPU, entre otras cosas. Un reloj no es un dispositivo de bloque ni de carácter, pero su software toma la forma de un driver.

### 6.1 Hardware de reloj

Hay dos tipos:
1. Los más simples se conectan a la línea de energía de 110 o 220 voltios y producen una interrupción en cada ciclo de voltaje, a 50 o 60 Hz. Antes dominaban; hoy son raros.
2. El reloj programable (figura 5-32 del libro: un oscilador de cristal que manda pulsos a un contador que se decrementa con cada pulso, y un registro contenedor que se usa para cargar el contador). Un cristal de cuarzo bien cortado y montado bajo tensión genera una señal periódica muy precisa, de varios cientos de megahertz, que se puede multiplicar hasta 1000 MHz o más. Esa señal alimenta al contador, que cuenta hacia abajo hasta cero; al llegar a cero produce una interrupción de la CPU.

Modos de operación del reloj programable:
- Modo de un solo disparo: al iniciarse, copia el registro contenedor en el contador y lo decrementa con cada pulso del cristal. Al llegar a cero, interrumpe y se detiene hasta que el software lo vuelva a iniciar.
- Modo de onda cuadrada: al llegar a cero e interrumpir, el registro contenedor se copia automáticamente en el contador y todo se repite indefinidamente. Esas interrupciones periódicas se llaman pulsos de reloj (clock ticks).

Ventaja: la frecuencia de interrupción se controla por software.

Ejemplo resuelto 11 (rango de un reloj programable, datos del libro). Con un cristal de 500 MHz, el contador recibe un pulso cada 1 / 500.000.000 s = 2 ns. Con un registro de 32 bits sin signo, el intervalo máximo es 2³² × 2 ns = 4.294.967.296 × 2 ns ≈ 8,6 s. Se pueden programar interrupciones desde cada 2 ns hasta cada 8,6 s.

Los chips de reloj suelen tener dos o tres relojes programables independientes y más opciones (contar hacia arriba o abajo, deshabilitar interrupciones).

Reloj de respaldo: para no perder la hora al apagar, casi todas las computadoras tienen un reloj alimentado por batería, con circuitos de bajo consumo como los de los relojes digitales. Se lee al arrancar. Si no lo hay, el software le pide la fecha y hora al usuario, o la obtiene de un host remoto con un protocolo estándar. La hora se convierte en la cantidad de pulsos desde un momento de referencia: en UNIX, las 12 a. m. UTC (tiempo universal coordinado, antes llamado del meridiano de Greenwich) del 1 de enero de 1970; en Windows, el 1 de enero de 1980. En cada pulso el tiempo real se incrementa en uno. Hay utilitarios para poner a mano el reloj del sistema y el de respaldo, y para sincronizarlos.

(Tanenbaum, cap. 5.5.1, págs. 388–390) (Relación con la Unidad 1: el reloj CMOS con pila)

### 6.2 Software de reloj

El hardware solo genera interrupciones a intervalos conocidos; todo lo demás lo hace el driver del reloj. Sus tareas típicas:

1. Mantener la hora del día (tiempo real).
2. Evitar que los procesos se ejecuten más tiempo del permitido.
3. Contabilizar el uso de la CPU.
4. Manejar la llamada al sistema alarm de los procesos de usuario.
5. Proveer temporizadores guardianes (watchdogs) para partes del propio sistema.
6. Hacer perfilamiento, supervisión y estadísticas.

Tarea 1: la hora del día. Alcanza con incrementar un contador en cada pulso, pero hay que cuidar la cantidad de bits. Con un reloj de 60 Hz, un contador de 32 bits se desborda en aproximadamente 2 años, así que no se puede guardar la hora como pulsos desde 1970 en 32 bits. Tres soluciones (figura 5-33 del libro, tres registros dibujados):
- (a) Un contador de 64 bits con la hora del día en pulsos. Mantenerlo es más costoso, porque se actualiza muchas veces por segundo.
- (b) La hora del día en segundos (32 bits), con un contador subsidiario que cuenta los pulsos del segundo actual hasta completar un segundo. Como 2³² segundos son más de 136 años, sirve hasta el siglo XXII.
- (c) Un contador en pulsos (32 bits) relativo al momento en que arrancó el sistema, más el tiempo de inicio del sistema guardado en segundos. Cuando se lee el reloj de respaldo o el usuario ingresa la hora, se calcula y guarda el tiempo de inicio; al pedir la hora, se suma el tiempo de inicio con el contador.

Ejemplo resuelto 12 (desbordamiento del contador). 2³² = 4.294.967.296 pulsos. A 60 pulsos por segundo: 4.294.967.296 / 60 = 71.582.788 segundos. Dividido por 86.400 segundos por día: 828,5 días, unos 2,27 años. En cambio, contando segundos: 4.294.967.296 / (86.400 × 365) ≈ 136 años.

Tarea 2: el quantum. Al iniciar un proceso, el planificador inicializa un contador con su quantum en pulsos de reloj. En cada interrupción de reloj, el driver lo decrementa en 1. Al llegar a cero, llama al planificador para que elija otro proceso.

Tarea 3: contabilizar la CPU. La forma más precisa es arrancar un segundo temporizador, distinto del principal, cada vez que arranca un proceso, y leerlo cuando se detiene; ese temporizador se guarda al llegar una interrupción y se restaura al terminarla. Una forma más simple y menos precisa es tener en una variable global un puntero a la entrada de la tabla de procesos del proceso actual e incrementar un campo de esa entrada en cada pulso: cada pulso se le "carga" al proceso que estaba ejecutando. Problema menor: si durante el proceso hubo muchas interrupciones, igual se le carga el pulso completo aunque no haya podido trabajar mucho. Contabilizar bien la CPU durante las interrupciones es muy complicado y casi no se hace.

Tarea 4: alarmas. Un proceso puede pedir que el sistema le avise después de cierto intervalo, con una señal, interrupción o mensaje. Usos: en redes, retransmitir un paquete que no se reconoció a tiempo; en instrucción asistida por computadora, darle la respuesta al estudiante que no contestó a tiempo. Como no hay un reloj físico por petición, el driver simula varios relojes virtuales con uno solo. Una forma: una tabla con el momento de cada señal pendiente y una variable con la próxima. Si hay muchas, es más eficiente una lista enlazada ordenada por tiempo.

Figura 5-34 del libro (simulación de varios temporizadores con un solo reloj): hora actual 4200; variable "siguiente señal" = 3; encabezado de reloj apuntando a una lista enlazada con los valores 3, 4, 6, 2, 1. Cada entrada dice cuántos pulsos después de la anterior hay que esperar. Así, hay señales pendientes para 4200 + 3 = 4203, 4203 + 4 = 4207, 4207 + 6 = 4213, 4213 + 2 = 4215 y 4215 + 1 = 4216. En cada pulso se decrementa "siguiente señal". Cuando llega a 0 se produce la señal del primer elemento, ese elemento se saca de la lista, y "siguiente señal" toma el valor de la nueva cabeza (en el ejemplo, 4).

Ejemplo resuelto 13 (agregar una alarma a la lista). Con la lista anterior (hora 4200; señales en 4203, 4207, 4213, 4215 y 4216), un proceso pide una alarma para 4210.
1. Se recorre la lista acumulando: 4203, 4207, 4213. La nueva va entre 4207 y 4213.
2. Su valor relativo es 4210 − 4207 = 3.
3. El elemento siguiente (el de 4213) pasa de 6 a 4213 − 4210 = 3.
4. La lista queda 3, 4, 3, 3, 2, 1, con señales en 4203, 4207, 4210, 4213, 4215 y 4216.

En cada interrupción de reloj el driver hace varias cosas: incrementar el tiempo real, decrementar el quantum y ver si llegó a 0, contabilizar la CPU y decrementar el contador de alarma. Cada una está diseñada para ser muy rápida, porque se repite muchas veces por segundo.

Tarea 5: temporizadores guardianes (watchdogs). Partes del sistema operativo también necesitan temporizadores. Ejemplo: los disquetes no giran cuando no se usan, para evitar el desgaste del medio y de la cabeza. Para leer, hay que arrancar el motor y esperar a que gire a velocidad completa. El driver del disquete arranca el motor y pone un temporizador guardián que interrumpe pasado un intervalo suficientemente largo (no hay un interruptor que avise que llegó a velocidad). El mecanismo es igual al de las señales de usuario, pero al vencer, en vez de producir una señal, el driver del reloj llama a un procedimiento que dio quien pidió el temporizador. Ese procedimiento puede hacer lo que haga falta. Se usa porque dentro del kernel las interrupciones son incómodas y las señales no existen. Solo funciona si el driver del reloj y el procedimiento están en el mismo espacio de direcciones.

Tarea 6: perfilamiento. Algunos sistemas permiten que un programa pida un histograma de su contador de programa para ver en qué gasta el tiempo. En cada pulso, si el proceso actual se está perfilando, el driver calcula a qué receptáculo (un rango de direcciones) corresponde el PC actual y lo incrementa en uno. También sirve para perfilar el propio sistema.

(Tanenbaum, cap. 5.5.2, págs. 390–392) (Relación con la Unidad 2: quantum de Round Robin, contabilidad de la CPU y señales)

### 6.3 Temporizadores de software

La mayoría de las computadoras tiene un segundo reloj programable para que un programa pida interrupciones a la velocidad que necesite. Mientras la frecuencia sea baja, no hay problema. El problema aparece con frecuencias muy altas. Idea de Aron y Druschel (1999):

Hay dos formas de enterarse de un evento de E/S:
- Interrupciones: baja latencia (ocurren justo después del evento), pero en las CPU modernas tienen mucha sobrecarga, por el cambio de contexto y su efecto en la línea de tubería, el TLB y la caché.
- Sondeo: la aplicación pregunta ella misma. Evita las interrupciones, pero tiene latencia: si el evento ocurre justo después de un sondeo, espera casi todo el intervalo. En promedio, la latencia es la mitad del intervalo de sondeo.

Para algunas aplicaciones ninguna de las dos sirve. Ejemplo: Gigabit Ethernet puede enviar o aceptar un paquete completo cada 12 µs. Una interrupción cada 12 µs, medida en un Pentium II de 300 MHz, tarda 4,45 µs: apenas mejor que en los años 70, cuando en una minicomputadora una interrupción costaba cuatro ciclos (guardar el PC y el PSW en la pila y cargar un PC y un PSW nuevos). Hoy la línea de tubería, la MMU, el TLB y la caché aumentan mucho la sobrecarga, y probablemente empeore con el tiempo.

Ejemplo resuelto 14 (costo de las interrupciones en Gigabit Ethernet). Una interrupción cada 12 µs que cuesta 4,45 µs ocupa 4,45 / 12 = 0,37, es decir, alrededor del 37 % de la CPU (el libro habla de interrupciones que ocupan el 35 % de la CPU).

Temporizadores de software: evitan las interrupciones. Cada vez que el kernel se ejecuta por otra razón, justo antes de volver a modo usuario, mira el reloj de tiempo real para ver si venció un temporizador de software. Si venció, hace el evento programado (transmitir paquetes, ver si llegó uno) sin cambiar a modo kernel, porque ya está ahí. Después lo reprograma: copia el valor actual del reloj y le suma el intervalo.

Los temporizadores de software avanzan al ritmo en que se entra al kernel por otras razones:
1. Llamadas al sistema.
2. Fallos del TLB.
3. Fallos de página.
4. Interrupciones de E/S.
5. La CPU queda inactiva.

Aron y Druschel midieron con varias cargas (servidor web a plena carga, servidor web con un cálculo en segundo plano, audio en tiempo real por Internet y recompilación del kernel de UNIX): el tiempo promedio entre entradas al kernel varió de 2 µs a 18 µs, y casi la mitad de las entradas eran llamadas al sistema. Así que es viable un temporizador de software cada 12 µs, aunque a veces se pase del plazo. Para enviar o sondear paquetes, un retraso ocasional de 10 µs es mejor que interrupciones que ocupen el 35 % de la CPU. Para acotar los períodos sin entradas al kernel, se puede programar el segundo temporizador de hardware cada 1 ms: si la aplicación tolera 1000 paquetes por segundo en intervalos ocasionales, la combinación de temporizadores de software y un temporizador de hardware de baja frecuencia es mejor que solo interrupciones o solo sondeo.

(Tanenbaum, cap. 5.5.3, págs. 393–394) (Relación con el tema 2: interrupciones contra sondeo)

Según la cátedra: los relojes permiten mantener la hora, evitar que un proceso monopolice la CPU y medir el uso del sistema; aunque no son de bloque ni de carácter, su software se implementa como un driver.

---
