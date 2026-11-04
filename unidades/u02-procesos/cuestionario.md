# Cuestionario — Unidad 2

**Sistemas Operativos — UTN FRM**
Procesos, hilos, concurrencia y planificación

---

**Total: 100 puntos. Se aprueba con 60.**
**Tiempo sugerido: 120 minutos.**

En las preguntas de opción múltiple hay **una sola** respuesta correcta, salvo que se indique lo contrario.
En las de verdadero o falso, **una respuesta sin justificar no suma puntos**.
En los ejercicios numéricos, **mostrá el procedimiento**: el resultado solo vale la mitad.
Convención de la cátedra para los desempates en la cola de listos: **entre un proceso que llega y otro que sale de ejecución en el mismo instante, se encola primero el que llega**.

---

## Parte A — Opción múltiple (18 puntos)

### 1. (3 p)
Un proceso en ejecución agota su quantum en un sistema Round Robin. ¿A qué estado pasa?

a) A Bloqueado, porque debe esperar a que el planificador le asigne un nuevo quantum.
b) A Listo, porque sigue pudiendo ejecutar y solo le falta la CPU.
c) A Bloqueado, hasta que llegue la siguiente interrupción de reloj.
d) Sigue en Ejecución si no hay otros procesos, y si los hay pasa a Bloqueado.

### 2. (3 p)
Un programa crea 4 hilos **a nivel de usuario** (biblioteca en espacio de usuario, el kernel no los conoce). Uno de ellos hace un `read` bloqueante sobre el teclado. ¿Qué ocurre?

a) Solo se bloquea ese hilo; el sistema de tiempo de ejecución pasa la CPU a otro hilo del mismo proceso.
b) El kernel bloquea ese hilo y planifica otro hilo del mismo proceso en otra CPU.
c) El kernel bloquea el proceso entero, con sus 4 hilos, porque solo ve un proceso.
d) No se bloquea nadie, porque las llamadas de los hilos de usuario no pasan por el kernel.

### 3. (3 p)
Sobre la solución de Peterson para dos procesos, ¿cuál afirmación es correcta?

a) Garantiza exclusión mutua sin espera ocupada.
b) Sin la variable `turno`, el arreglo `interesado[]` solo ya alcanza para garantizar la exclusión mutua.
c) Garantiza exclusión mutua, pero sigue siendo espera ocupada y puede sufrir inversión de prioridades.
d) Necesita una instrucción de hardware como TSL o XCHG para funcionar.

### 4. (3 p)
En un monitor, un procedimiento hace `signal(c)` sobre una variable de condición en la que **no hay nadie esperando**. ¿Qué pasa?

a) La señal queda guardada y el próximo que haga `wait(c)` sigue de largo.
b) La señal se pierde; las variables de condición no son contadores.
c) El monitor incrementa un contador interno, igual que un `up` sobre un semáforo.
d) Se produce un error en tiempo de ejecución.

### 5. (3 p)
Tres procesos tienen 10, 30 y 60 boletos en un planificador por lotería. ¿Cuál afirmación es correcta?

a) El proceso con 60 boletos ejecuta exactamente el 60 % de cada segundo.
b) A largo plazo, el proceso con 60 boletos obtiene alrededor del 60 % de la CPU, pero en un intervalo corto puede no ganar ningún sorteo.
c) Si el de 10 boletos termina, el de 60 boletos sigue con el 60 % de la CPU.
d) Los boletos son una prioridad: siempre gana el que tiene más.

### 6. (3 p)
En un multiprocesador SMP, ¿por qué conviene que un hilo vuelva a ejecutar en la **misma CPU** en la que ejecutó antes?

a) Porque así no hace falta volver a cargar el BCP.
b) Porque la caché de esa CPU todavía puede tener los bloques del hilo (afinidad de caché).
c) Porque las otras CPU no pueden acceder a su espacio de direcciones.
d) Porque el kernel SMP solo puede ejecutarse en una CPU por vez.

---

## Parte B — Verdadero o falso justificado (12 puntos)

### 7. (2 p cada ítem)

a) Un proceso bloqueado esperando un semáforo consume CPU mientras espera.

b) Si se invierte el orden de los dos `down` del productor (primero `down(&mutex)`, después `down(&vacias)`), el programa sigue funcionando, solo que más lento.

c) El paso de mensajes solo sirve entre máquinas distintas; entre hilos de un mismo proceso no puede usarse.

d) SJF (no apropiativo) da el tiempo de espera promedio mínimo siempre, aunque los procesos lleguen en momentos distintos.

e) La inversión de prioridades puede ocurrir con Peterson o TSL, pero no con semáforos que bloquean al proceso.

f) Cuando una CPU escribe un dato compartido en un multiprocesador con cachés, las copias de ese bloque en las otras cachés se actualizan con el valor nuevo.

---

## Parte C — Ejercicios prácticos (36 puntos)

Para las preguntas 8 a 10 usá estos procesos (prioridad: **menor número = más prioritario**):

| Proceso | Llegada | Ráfaga | Prioridad |
|---|---|---|---|
| A | 0 | 5 | 3 |
| B | 1 | 3 | 1 |
| C | 2 | 1 | 4 |
| D | 4 | 4 | 2 |
| E | 6 | 2 | 1 |

### 8. (10 p) Round Robin
a) Hacé el diagrama de Gantt con **Round Robin, quantum = 2**.
b) Mostrá el contenido de la **cola de listos** en los instantes **t = 3** y **t = 7** (después de procesar las llegadas y salidas de ese instante), y qué proceso está en la CPU.
c) Calculá el tiempo de retorno, de espera y de respuesta de cada proceso, y los tres promedios.

### 9. (8 p) SJF y SRTF
a) Hacé los diagramas de Gantt con **SJF** (no apropiativo) y con **SRTF**.
b) Calculá el tiempo de espera promedio de cada uno.
c) ¿Qué decisión hay que tomar en t = 5 en SRTF? Explicá qué criterio usaste.

### 10. (5 p) Prioridades apropiativas
Hacé el Gantt con **prioridades apropiativas** y calculá el retorno promedio. ¿Qué proceso sufre más y por qué? ¿Cómo lo resolverías?

### 11. (5 p) `fork`
¿Cuántas veces se imprime cada letra? Justificá con el árbol de procesos.

```c
/* Programa 1 */
int main() {
    fork();
    if (fork() == 0)
        fork();
    printf("X\n");
}
```

```c
/* Programa 2 */
int main() {
    for (int i = 0; i < 3; i++)
        if (fork() == 0)
            printf("H\n");
}
```

Para el programa 2, indicá además cuántos procesos existen en total (contando el original).

### 12. (4 p) Condición de carrera
`x` es una variable compartida que vale 0. Dos hilos ejecutan, cada uno, **dos veces** la sentencia `x = x + 1`, que el compilador traduce como: cargar `x` en un registro, sumarle 1, guardar el registro en `x`.

¿Qué valores finales puede tener `x`? Para el valor más chico, mostrá un entrelazado que lo produzca.

### 13. (4 p) Lotería y tiempo real
a) A tiene 20 boletos, B 30 y C 50. C es un cliente que se **bloquea** esperando al servidor A y le transfiere 10 boletos mientras espera. ¿Qué fracción de la CPU recibe cada uno mientras C está bloqueado?

b) Un sistema de tiempo real suave tiene tres eventos periódicos: períodos de 40, 100 y 200 ms, con 10, 30 y 50 ms de CPU respectivamente. Se agrega un cuarto evento con período de 500 ms. ¿Cuánta CPU puede necesitar como máximo para que el sistema siga siendo planificable?

---

## Parte D — Desarrollo (12 puntos)

### 14. (4 p)
Compará los hilos a nivel de usuario y a nivel de kernel en: costo de la conmutación, llamadas bloqueantes, fallos de página y posibilidad de usar varias CPU. ¿Qué intenta lograr la implementación híbrida?

### 15. (4 p)
Explicá por qué `sleep`/`wakeup` falla en el productor-consumidor (la señal de despertar perdida) y cómo lo resuelven los semáforos. ¿Por qué `down` y `up` tienen que ser **atómicas**, y cómo se logra eso en un monoprocesador y en un multiprocesador?

### 16. (4 p)
En la solución correcta de los filósofos comelones (la del libro), ¿para qué sirven el arreglo `estado[]` y el semáforo por filósofo `s[i]`? ¿Por qué "tomar el tenedor izquierdo y después el derecho" puede producir interbloqueo, y por qué esperar un tiempo al azar no es una solución aceptable?

---

## Parte E — Escenarios (12 puntos)

### 17. (4 p)
Un sistema usa Round Robin. Al bajar el quantum de 100 ms a 1 ms, los usuarios notan que el sistema "anda más lento", aunque responde un poco antes a cada tecla. Al subirlo a 2 segundos, los procesos interactivos se vuelven insoportables. ¿Qué está pasando en cada caso? ¿Qué valor razonable propone el libro?

### 18. (4 p)
Un proceso de **alta** prioridad H queda en espera ocupada, haciendo girar un ciclo con TSL, para entrar a una región crítica. La región la tiene un proceso de **baja** prioridad L. El planificador siempre ejecuta al de mayor prioridad que esté listo. El sistema se cuelga con la CPU al 100 %. ¿Por qué? ¿Cómo lo resolverías?

### 19. (4 p)
En una base de datos con lectores y escritores se usa la solución del libro (el primer lector bloquea la base, el último la libera). En horario pico llegan lectores todo el tiempo y los escritores nunca logran actualizar. ¿Por qué pasa esto? Proponé una solución y decí qué se pierde con ella.

---

## Parte F — Integración (10 puntos)

### 20. (5 p) Unidades 1 y 2
Describí paso a paso qué pasa desde que el proceso P1 está en ejecución y hace un `read` de disco, hasta que el proceso P2 empieza a ejecutar. Después, describí qué pasa cuando el disco termina la lectura. Usá: TRAP, modo kernel, bit de modo del PSW, BCP, estados del proceso, planificador, interrupción y controlador de disco.

### 21. (5 p) Unidades 1 y 2
La espera ocupada aparece en las dos unidades: en la E/S programada (U1) y en TSL o Peterson (U2).
a) ¿Qué tienen en común las dos situaciones?
b) ¿Qué mecanismo reemplaza a la espera ocupada en cada una?
c) Explicá por qué, en un **multiprocesador**, la espera ocupada corta (spinlock) puede ser **mejor** que bloquear al proceso.

---

**Fin del cuestionario.**

Cuando termines, pasame tus respuestas acá en el chat o dejalas en
`unidades/u02-procesos/correcciones/mis_respuestas_u02.md` y decime **"corregí la unidad 2"**.
