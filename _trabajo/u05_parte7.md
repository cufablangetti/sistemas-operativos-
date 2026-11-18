
### 7.6 Clientes delgados

La computación oscila entre centralizada y descentralizada: las primeras computadoras (ENIAC) eran de una persona por vez; después vino el tiempo compartido, con muchas terminales simples contra una computadora central; después la PC, otra vez una computadora por usuario. La PC tiene desventajas graves:
- Cada PC tiene un disco grande y software complejo que hay que mantener; actualizar el sistema operativo en cada equipo cuesta en mano de obra más que el hardware y el software. Con un sistema centralizado se actualizan una o pocas máquinas, con personal experto.
- Pocos usuarios respaldan sus gigabytes de datos; en un sistema centralizado, robots de cintas hacen respaldos cada noche.
- Compartir recursos es más fácil centralizado: 256 usuarios con 256 MB de RAM cada uno tienen casi toda esa RAM ociosa casi siempre; con un sistema central de 64 GB, nadie se queda sin RAM porque esté en la PC de otro. Lo mismo con el disco.
- Hay un cambio de la computación centrada en la PC a la centrada en la Web (por ejemplo, el correo en Gmail, Hotmail o Yahoo).

La mayoría de los usuarios quiere computación interactiva de alto rendimiento sin administrar una computadora. Eso llevó a reexaminar el tiempo compartido con terminales "tontas", hoy llamadas clientes delgados. Las terminales X fueron un paso, pero costaban lo mismo que una PC, hacían menos y requerían mantenimiento.

THINC (Universidad de Columbia): la máquina cliente no tiene inteligencia ni software; es solo una pantalla. Todo el cómputo, incluido armar el mapa de bits a mostrar, se hace en el servidor. El protocolo solo le dice a la pantalla cómo actualizar su RAM de video, con cinco comandos (figura 5-44 del libro):

| Comando | Descripción |
|---|---|
| Raw | muestra datos de píxeles crudos en una ubicación dada (en principio, el único necesario) |
| Copy | copia un área del búfer de pantalla a otras coordenadas (sirve para desplazar sin retransmitir) |
| Sfill | llena un área con un solo color de píxel (fondos uniformes) |
| Pfill | llena un área con un patrón de píxeles (fondos más complejos) |
| Bitmap | llena una región con una imagen de mapa de bits, con color de primer plano y de fondo |

Los cuatro últimos son optimizaciones. Se pueden agrupar varios comandos en un paquete. En el servidor, el software THINC intercepta los comandos gráficos de alto nivel de los programas y los traduce (y reordena) en comandos para el cliente. Las mediciones, con servidores a entre 10 km y 10.000 km del cliente, dieron un rendimiento superior a otros sistemas de red de área amplia, incluso con video en tiempo real.

(Tanenbaum, cap. 5.7, págs. 415–417) (Relación con la Unidad 1: tiempo compartido y la historia de los SO)

---

## 8. Administración de energía

Atención: el programa de la materia no nombra este tema y el resumen de la cátedra no lo cubre. Se incluye porque es parte del capítulo 5 del libro.

La ENIAC tenía 18.000 tubos al vacío y consumía 140.000 watts. Con el transistor el consumo bajó y la industria perdió interés, pero hoy vuelve a importar por dos razones:
1. Las PC de escritorio: una fuente de 200 watts (85 % de eficiencia); 100 millones de máquinas encendidas a la vez consumen 20.000 megawatts, la producción de 20 centrales nucleares promedio. Reducir el consumo a la mitad eliminaría 10.
2. Las computadoras a batería (notebooks, de bolsillo): las baterías duran unas pocas horas y casi no progresan, a diferencia de la ley de Moore.

Dos métodos generales: que el sistema operativo apague las partes que no se usan (sobre todo dispositivos de E/S), y que los programas usen menos energía aun degradando la experiencia del usuario.

### 8.1 Cuestiones de hardware

Baterías desechables (AAA, AA, D: no alcanzan para una notebook) y recargables (níquel-cadmio, reemplazadas por níquel-metal híbrido, y las de ion-litio, mejores y que se recargan sin vaciarse del todo, pero de capacidad limitada).

Los fabricantes diseñan CPU, memoria y dispositivos con varios estados:
- encendido: para usar el dispositivo;
- inactivo: si no se va a usar por poco tiempo; consume menos;
- hibernando: si no se va a usar por más tiempo; consume todavía menos, pero salir de hibernación lleva más tiempo y energía que salir de inactivo;
- apagado: no hace nada ni consume.
El sistema operativo administra las transiciones. Algunas computadoras tienen dos o tres botones de energía (inactivo, hibernación), que solo le mandan una señal al SO.

Preguntas que el SO tiene que responder por cada dispositivo: qué dispositivos se pueden controlar; si son de encendido y apagado o tienen estados intermedios; cuánto se ahorra en bajo consumo; si se gasta energía al reiniciarlo; si hay que guardar contexto al bajar el consumo; cuánto tarda en volver a plena energía.

Consumo de las partes de una notebook (figura 5-45 del libro):

| Dispositivo | Li y colaboradores (1994) | Lorch y Smith (1998) |
|---|---|---|
| Pantalla | 68 % | 39 % |
| CPU | 12 % | 18 % |
| Disco duro | 20 % | 12 % |
| Módem | — | 6 % |
| Sonido | — | 2 % |
| Memoria | 0,5 % | 1 % |
| Otros | — | 22 % |

Weiser y colaboradores no publicaron números, pero concluyeron que los tres grandes consumidores son la pantalla, el disco duro y la CPU, en ese orden.

### 8.2 Cuestiones del sistema operativo

El SO controla todos los dispositivos y decide qué apagar y cuándo. Si apaga algo que se necesita enseguida, hay un retraso molesto; si espera demasiado, desperdicia energía. Lo "bueno" es subjetivo: un usuario acepta que tras 30 segundos sin uso la computadora tarde 2 segundos en responder; otro no.

Pantalla: es el mayor consumidor, por la luz posterior. Muchos SO la apagan tras unos minutos sin actividad (el usuario elige el intervalo). Es un estado inactivo, porque se regenera casi al instante desde la RAM de video. Propuesta de Flinn y Satyanarayanan (2004), figura 5-46 del libro: dividir la pantalla en zonas que se encienden por separado; con 16 zonas y el cursor en la ventana 2, que ocupa 4 zonas abajo a la derecha, alcanza con encender esas 4 y se ahorran 3/4 de la energía de la pantalla. Si el usuario pasa a la ventana 1, que cubre 9 zonas, se gasta más; el administrador de ventanas podría mover la ventana 1 para que quepa en 4 zonas y bajar de 9/16 a 4/16 de la energía máxima.

Disco duro: mantenerlo girando consume mucho. Muchas notebooks lo detienen tras unos segundos o minutos sin uso. Un disco detenido está en hibernación, no inactivo: tarda unos segundos en volver a girar y reiniciarlo gasta bastante energía. Cada disco tiene un tiempo característico Td, su punto de equilibrio, normalmente de 5 a 15 segundos. Si el próximo acceso será dentro de un tiempo t: si t < Td, gasta menos seguir girando que apagar y volver a encender; si t > Td, conviene apagarlo. Con buenas predicciones (por patrones de acceso anteriores) el SO podría decidir bien; en la práctica la mayoría es conservadora y lo detiene recién tras unos minutos. Otras ayudas: una caché de disco grande en RAM (si el bloque está en la caché, o si la escritura se puede guardar en el búfer, no hace falta arrancar el disco), y avisarles a los programas el estado del disco para que retrasen escrituras discrecionales (por ejemplo, el guardado automático de un procesador de textos).

Ejemplo resuelto 16 (punto de equilibrio del disco). Un disco tiene Td = 10 s. Si el SO predice que el próximo acceso será dentro de 4 s, como 4 < 10 conviene dejarlo girando. Si predice 30 s, como 30 > 10 conviene detenerlo.

CPU: se puede poner inactiva por software, con un consumo casi nulo; solo puede despertarse con una interrupción. Además, en muchas computadoras se puede reducir el voltaje, lo que reduce la velocidad del reloj aproximadamente en forma lineal. Como la energía consumida es proporcional al cuadrado del voltaje, con la mitad del voltaje la CPU va a la mitad de velocidad pero gasta un cuarto de la energía.

Ejemplo resuelto 17 (escalado de voltaje, datos del libro). Un visor multimedia tiene que descomprimir y mostrar un cuadro cada 40 ms. A toda velocidad, la CPU gasta x joules si trabaja los 40 ms, y lo hace en 20 ms.
1. Opción a: toda velocidad durante 20 ms y después inactiva 20 ms: gasta x/2 joules.
2. Opción b: mitad de velocidad durante los 40 ms (llega justo al plazo): la potencia es 1/4, así que gasta x/4 joules.
Se hace el mismo trabajo con la mitad de la energía de la opción a (figura 5-47 del libro: dos gráficos de energía contra tiempo; en (a) un bloque de altura 1,00 hasta T/2; en (b) un bloque de altura 0,25 hasta T). Del mismo modo, si un usuario escribe 1 carácter por segundo y procesarlo lleva 100 ms, conviene bajar la velocidad de la CPU por un factor de 10. Es más eficiente operar más lento.

Memoria: dos opciones. Vaciar la caché y apagarla: se puede recargar desde la memoria principal sin perder nada y rápido, así que es un estado inactivo. Más drástico: escribir la memoria principal en el disco y apagarla: hibernación, con un tiempo de recarga considerable, sobre todo si el disco también está apagado. Con la memoria apagada, la CPU también se apaga o ejecuta desde la ROM, y la interrupción que la despierta salta a código en la ROM para recargar la memoria. Vale la pena para períodos largos (horas) si reanudar en unos segundos es mejor que rearrancar el SO desde el disco (un minuto o más).

Comunicación inalámbrica: el radio consume mucho; si siempre está encendido para recibir correo, agota la batería; si se apaga, se pierden mensajes. Propuesta de Kravets y Krishnan (1998): la computadora móvil le avisa a la estación base fija (con memoria y disco grandes y sin restricciones de energía) antes de apagar el radio; la estación guarda los mensajes entrantes en su disco y los envía cuando la móvil vuelve a encender el radio. Los mensajes salientes se guardan en un búfer en la móvil y, si el búfer está por llenarse, se enciende el radio. Cuándo apagarlo y encenderlo: lo decide el usuario o el programa, o tras unos segundos de inactividad, o periódicamente para revisar el tráfico, y siempre cuando el búfer de salida está por llenarse.

Administración térmica: las CPU modernas se calientan muchísimo. En las PC de escritorio el ventilador suele estar siempre encendido. En las notebooks el SO monitorea la temperatura y, cerca del máximo, decide: encender el ventilador (ruido y consumo) o reducir el consumo (bajar la luz de la pantalla, bajar la velocidad de la CPU, detener el disco). El usuario puede indicar de antemano si el ruido del ventilador le molesta.

Administración de baterías: las notebooks usan baterías inteligentes que le informan al SO su voltaje máximo y actual, carga máxima y actual, tasa de descarga máxima y actual, etc., y aceptan cambios de parámetros. Con varias baterías, el SO cambia de una a otra sin cortar la energía. Cuando la última se está agotando, avisa al usuario y hace un apagado ordenado (por ejemplo, para que no se corrompa el sistema de archivos).

Interfaz de drivers: Windows usa ACPI (Advanced Configuration and Power Interface, interfaz avanzada de configuración y energía). El SO les pide a los drivers que informen las capacidades y el estado de sus dispositivos (clave con plug and play, porque al arrancar el SO ni sabe qué dispositivos hay) y les ordena bajar el consumo. También hay tráfico al revés: si el teclado o el ratón detectan actividad tras un período inactivo, es la señal para volver a la operación normal.

### 8.3 Cuestiones de los programas de aplicación

Otra vía: que los programas usen menos energía aunque empeore la experiencia (mejor una experiencia pobre que ninguna cuando se acaba la batería). Normalmente se les avisa cuando la carga baja de un umbral, y cada programa decide entre degradar el rendimiento o arriesgarse. Flinn y Satyanarayanan (2004) estudiaron cómo hacerlo midiendo con una herramienta llamada PowerScope (la computadora conectada a una fuente externa a través de un multímetro digital controlado por software): cuando no hay degradación se presenta la mejor información; con degradación, baja la fidelidad (precisión) de lo que se muestra.

(Tanenbaum, cap. 5.8, págs. 417–425)

---
