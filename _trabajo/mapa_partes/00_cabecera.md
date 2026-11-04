# Cómo usar este mapa {#guia}

> Mapa conceptual ACUMULATIVO de Sistemas Operativos (UTN FRM). Unidades incluidas: 1 y 2. Última ampliación: 3 de noviembre de 2026.

Este mapa sirve para dos cosas: **estudiar** (tiene el contenido completo, no un resumen) y **ordenar el repaso** (ves de un vistazo qué entra y en qué orden). Cada rama lleva **dos referencias**: la del libro, para leer la fuente, y la del PDF de repaso, para volver a lo que ya leíste.

- **Leyenda de marcas**
  - 📖 **Referencia al Tanenbaum** — capítulo y páginas impresas del libro (la página del PDF del libro es la impresa + 30).
  - 📄 **Referencia al PDF de repaso** — página real de `repaso_u01.pdf` o `repaso_u02.pdf` y el título de la sección, para volver a lo que ya leíste.
  - 🔢 **Secuencia** — un procedimiento con pasos numerados, para recitarlo en orden.
  - 🧠 **Nota de memoria** — mnemotecnia o regla rápida.
  - ⚖️ **Par que se confunde** — dos cosas parecidas que hay que separar.
  - 📌 **Trampa de examen** — lo que la cátedra pregunta para que te equivoques.
  - ⚠️ **Error que ya cometí** — para no repetirlo.
  - 🔗 **Conexión entre unidades** — se puede hacer clic para saltar a la otra rama.
  - ❓ **Duda que tuve** — preguntas que hice (en el chat o en `googleia.md`) con la respuesta corta.
- **Cómo repasar con el mapa**
  1. Leé la rama de un tema de arriba abajo, en voz alta si podés.
  2. Recitá las secuencias 🔢 sin mirar y después verificá.
  3. Repasá todas las ⚠️ y 📌 juntas antes del examen (en la página interactiva está el filtro "Solo errores").
  4. Si una rama no te sale, andá a la página 📄 del repaso y releé esa sección.
- **Regla de mantenimiento**: el mapa no se reemplaza nunca. En cada unidad nueva se agrega su rama y se reconectan sus conceptos con los de las unidades anteriores. Si se regenera un `repaso_uNN.pdf`, se vuelve a correr `_trabajo/indice_repaso.py` y se actualizan las páginas 📄.

# La idea que une todo {#ideas}

> La misma tensión aparece en toda la materia. Si la reconocés, la mitad de las preguntas de desarrollo se contestan solas.

- 🧠 **Compartir es rápido pero peligroso; aislar es seguro pero caro.**
  - Monolítico contra microkernel [[u1-estructuras]].
  - Hilos contra procesos [[u2-hilos]].
  - Memoria compartida contra paso de mensajes [[u2-mensajes]].
- 🧠 **Un candado grande es correcto y lento; los candados chicos e independientes son correctos y rápidos.**
  - El mutex de toda la mesa de los filósofos contra el `estado[]` de Dijkstra [[u2-filosofos]].
  - SMP con un mutex global contra SMP con un mutex por subsistema [[u2-tipos-so-mp]].
  - Una cola global de listos contra una cola por CPU [[u2-planif-mp]].
- 🧠 **Cuando no podés avanzar, ¿en qué estado te quedás?** Girar = EN EJECUCIÓN (gasta CPU), ceder = LISTO, dormir = BLOQUEADO (no gasta CPU). Es la pregunta de los temas 6 y 7 de la U2 [[u2-tres-esperas]].
- 🧠 **El algoritmo óptimo siempre necesita un dato del futuro.** SJF necesita las ráfagas [[u2-lotes]], el algoritmo de retrospección necesita saber cuánto dura el candado [[u2-sinc-mp]], y en la U3 el reemplazo óptimo de páginas necesita las referencias futuras.
- 🧠 **Mecanismo contra política.** El mecanismo dice *cómo* se puede hacer algo; la política dice *quién y cuándo*. Aparece en el microkernel [[u1-estructuras]] y en la planificación [[u2-politica]].
