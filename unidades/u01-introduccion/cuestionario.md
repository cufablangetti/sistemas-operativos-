# Cuestionario — Unidad 1

**Sistemas Operativos — UTN FRM**
Introducción, hardware y estructura de los sistemas operativos

---

**Total: 100 puntos. Se aprueba con 60.**
**Tiempo sugerido: 90 minutos.**

En las preguntas de opción múltiple hay **una sola** respuesta correcta, salvo que se indique lo contrario.
En las de verdadero o falso, **una respuesta sin justificar no suma puntos**.
En los ejercicios numéricos, **mostrá el procedimiento**: el resultado solo vale la mitad.

---

## Parte A — Opción múltiple (18 puntos)

### 1. (3 p)
Un programa de usuario ejecuta una instrucción que intenta deshabilitar las interrupciones del procesador. ¿Qué ocurre?

a) El sistema operativo detecta la instrucción, la revierte y continúa la ejecución del programa.
b) El hardware verifica el bit de modo del PSW, impide la ejecución y genera un trap al kernel.
c) La instrucción se ejecuta y el sistema operativo deja de responder hasta el próximo reinicio.
d) La instrucción se ejecuta, pero solo afecta las interrupciones del propio proceso.

### 2. (3 p)
Respecto de las tres formas de realizar una operación de entrada/salida, ¿cuál afirmación es correcta?

a) El DMA reduce el tiempo total de la transferencia porque evita que la CPU intervenga.
b) La E/S por interrupciones es siempre preferible a la E/S programada, sin importar el dispositivo.
c) Los tres métodos insumen el mismo tiempo total de transferencia; lo que varía es el consumo de CPU.
d) La E/S programada no consume CPU durante la espera, porque el proceso queda bloqueado.

### 3. (3 p)
¿Cuál de estas opciones describe correctamente las diferencias entre la instrucción TRAP y una instrucción de llamada a procedimiento?

a) TRAP guarda la dirección de retorno y la llamada a procedimiento no.
b) TRAP puede saltar a cualquier dirección del kernel; la llamada a procedimiento, solo dentro del programa.
c) TRAP cambia el modo de ejecución y salta a una dirección fija; la llamada a procedimiento no cambia el modo y puede saltar a cualquier dirección.
d) Ambas cambian el modo de ejecución, pero solo TRAP guarda el PSW.

### 4. (3 p)
En un sistema operativo con estructura de **microkernel**, el driver de la placa de red necesita escribir en un registro de E/S del dispositivo. ¿Cómo lo hace?

a) El driver corre en modo kernel junto al microkernel, así que escribe directamente en el registro.
b) El driver corre en modo usuario y escribe directamente, porque el microkernel le cedió permanentemente los privilegios.
c) El driver corre en modo usuario y solicita la operación al microkernel mediante una llamada al sistema; el microkernel verifica que el puerto le corresponda y la ejecuta.
d) El driver no puede acceder al hardware: debe pedírselo al servidor de archivos, que sí corre en modo kernel.

### 5. (3 p)
Se desea mostrar en pantalla la cadena `PARCIAL` usando los servicios del DOS. ¿Cuál combinación es correcta?

a) `AH = 02h`, con la dirección de la cadena en `DL`
b) `AH = 09h`, con la dirección de la cadena en `DS:DX` y la cadena terminada en `$`
c) `AH = 09h`, con la dirección de la cadena en `ES:BP` y la longitud en `CX`
d) `AH = 0Eh`, con la dirección de la cadena en `DS:DX`

### 6. (3 p)
Un sistema ejecuta trabajos desde una cinta, uno inmediatamente después del otro, sin intervención del operador, manteniendo **un único trabajo en memoria por vez**. ¿Cómo se clasifica?

a) Multiprogramación sin tiempo compartido
b) Procesamiento por lotes, sin multiprogramación
c) Multiprogramación con particiones fijas
d) Tiempo compartido con spooling

---

## Parte B — Verdadero o falso justificado (10 puntos)

### 7. (2 p cada ítem)
Indicá si cada afirmación es verdadera o falsa y **justificá en una o dos oraciones**. Una respuesta sin justificación no suma.

**a)** El sistema operativo multiplexa el disco únicamente en el espacio.

**b)** Una estructura por capas ofrece mayor tolerancia a fallas que una monolítica, porque un error queda confinado a su capa.

**c)** Si se omite el carácter `$` al final de una cadena y se la muestra con `INT 21h / AH=09h`, el programa no muestra nada.

**d)** El BIOS necesita conocer el sistema de archivos de la partición de arranque para poder iniciar la máquina.

**e)** Aumentar el tamaño del buffer de lectura reduce la cantidad de datos que hay que traer del disco.

---

## Parte C — Ejercicios prácticos (34 puntos)

### 8. (6 p) Jerarquía de memoria
Una computadora tiene una caché con tiempo de acceso de **2 ns** y una memoria principal con tiempo de acceso de **60 ns**. Ante un fallo de caché, primero se consulta la caché y después la memoria principal.

**a)** Si la tasa de aciertos es del **90 %**, calculá el tiempo medio de acceso y cuántas veces más rápido resulta el sistema respecto de no tener caché. (4 p)

**b)** ¿Qué tasa de aciertos haría falta para que el tiempo medio de acceso baje a **6 ns**? (2 p)

### 9. (8 p) Costo de CPU de la entrada/salida
Un dispositivo transfiere **2048 bytes** y entrega **un byte cada 25 µs**. Atender una interrupción le cuesta a la CPU **8 µs**. Configurar el chip DMA cuesta **30 µs** adicionales.

**a)** Calculá la duración total de la transferencia. (1 p)

**b)** Calculá el tiempo de CPU consumido y el porcentaje sobre la duración total para los tres métodos: E/S programada, E/S por interrupciones y E/S con DMA. (5 p)

**c)** Con E/S por interrupciones, ¿cuántos milisegundos de CPU quedan libres para otros procesos? (2 p)

### 10. (5 p) Multiprogramación
En un sistema, cada proceso pasa el **60 %** de su tiempo esperando operaciones de entrada/salida.

**a)** ¿Cuál es el aprovechamiento de la CPU con 1, 2 y 4 procesos en memoria? (3 p)

**b)** ¿Cuántos procesos hacen falta, como mínimo, para superar el **90 %** de aprovechamiento? Justificá el cálculo. (2 p)

### 11. (6 p) Sector de arranque
Un disco de 6 TB está dividido en **3 particiones primarias**: una de 4 TB, una de 1,5 TB y una de 0,5 TB.

**a)** ¿Cuántos bytes ocupa la tabla de particiones del MBR en este disco? Justificá. (2 p)

**b)** ¿Cuántos bytes quedan disponibles para el código de arranque? (1 p)

**c)** Al intentar crear la partición de 4 TB, la herramienta de particionado informa un error. ¿Por qué ocurre y cómo se resuelve? (3 p)

### 12. (4 p) Llamadas al sistema
Un programa lee completo un archivo de **64 KB**.

**a)** ¿Cuántas llamadas a `read()` realiza con un buffer de 2 KB y cuántas con uno de 16 KB? (2 p)

**b)** ¿Qué se ahorra exactamente al usar el buffer más grande, y qué **no** se ahorra? (2 p)

### 13. (5 p) Interrupciones por segundo
Atender una interrupción cuesta **5 µs** de CPU.

**a)** Un teclado genera 10 interrupciones por segundo. ¿Qué porcentaje de CPU consume? (1 p)

**b)** Un disco transfiere 50 MB/s. Si generara una interrupción por byte, ¿cuántos segundos de CPU por segundo haría falta? ¿Es viable? (2 p)

**c)** Con DMA y bloques de 4 KB, ¿cuántas interrupciones por segundo genera ese mismo disco y qué porcentaje de CPU consume? (2 p)

---

## Parte D — Desarrollo (13 puntos)

### 14. (5 p)
Explicá las **dos funciones** del sistema operativo según Tanenbaum y mostrá, con un ejemplo concreto de cada una, por qué se afirma que **no están relacionadas entre sí**. Incluí en tu respuesta los dos tipos de multiplexaje y a qué recurso corresponde cada uno.

### 15. (4 p)
Describí la **cadena de arranque** desde que se presiona el botón de encendido hasta que aparece la pantalla de login. Explicá **por qué hacen falta dos cargadores** y no uno solo.

### 16. (4 p)
Explicá qué es una **llamada al sistema** y describí los pasos que ocurren desde que un programa en C invoca `read(fd, buf, nbytes)` hasta que recupera el control. Indicá en qué momento exacto se produce el cambio de modo.

---

## Parte E — Escenarios (13 puntos)

### 17. (5 p)
Una máquina tiene cuatro particiones primarias, cada una con un sistema operativo instalado y funcionando correctamente. Al encenderla aparece el mensaje *"Missing operating system"*.

**a)** ¿En qué eslabón exacto de la cadena de arranque se produce la falla? (2 p)
**b)** ¿Se perdieron los archivos del disco? Justificá. (1 p)
**c)** ¿Cuál es la causa más probable y cómo se repara? (2 p)

### 18. (4 p)
Un desarrollador reporta: *"mi programa en ensamblador muestra el mensaje correcto, pero después de él aparecen caracteres raros y símbolos en la pantalla"*. El código usa `INT 21h` con `AH = 09h` y `DS` está correctamente cargado.

Identificá el error, explicá **técnicamente qué está haciendo el sistema** cuando aparecen esos símbolos, y corregilo.

### 19. (4 p)
Un equipo discute qué estructura de sistema operativo usar para un **marcapasos** y para un **servidor de renderizado de video** donde el rendimiento bruto es lo único que importa.

Elegí una estructura para cada caso y justificá. Explicá además por qué **no** elegirías la estructura por capas para el marcapasos, aunque ofrezca mayor claridad de diseño.

---

## Parte F — Integración (12 puntos)

### 20. (6 p) Rendimiento de las estructuras
Un sistema operativo realiza **100.000 operaciones internas por segundo** (por ejemplo, que el subsistema de archivos le pida algo al subsistema de E/S). En una estructura monolítica, cada operación es una llamada a procedimiento que cuesta **0,05 µs**. En un microkernel, cada operación es un paso de mensajes que cuesta **2 µs**.

**a)** Calculá el porcentaje de CPU que consume la comunicación interna en cada estructura. (4 p)
**b)** A la luz de ese número, explicá por qué los sistemas operativos de uso general siguen siendo monolíticos, y qué solución de compromiso adoptó Linux. (2 p)

### 21. (3 p)
Tres conceptos de esta unidad comparten la misma idea de fondo: la **caché de memoria**, la **memoria virtual** y el **buffer de lectura**.

¿Cuál es esa idea común? Explicá qué recurso hace de "rápido" y cuál de "lento" en cada uno de los tres casos.

### 22. (3 p)
A lo largo de la unidad apareció varias veces la siguiente relación: *compartir un recurso entre varios obliga a protegerlo*.

Mostrá cómo se manifiesta esa relación en **tres** momentos distintos de la unidad: en el multiplexaje de recursos, en la aparición histórica de la multiprogramación, y en la diferencia entre sistemas operativos integrados y de bolsillo.

---

**Fin del cuestionario.**

Cuando termines, pasame tus respuestas acá en el chat o dejalas en
`unidades/u01-introduccion/correcciones/mis_respuestas_u01.md` y decime **"corregí la unidad 1"**.
