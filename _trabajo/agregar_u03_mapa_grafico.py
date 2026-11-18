# -*- coding: utf-8 -*-
"""Agrega la U3 a visuales/mapa_grafico.html SOLO sumando entradas a NODOS,
CRUCES y una opcion del selector (regla: no cambiar nada de lo existente)."""
import io, os, shutil

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(RAIZ, "visuales", "mapa_grafico.html")
COPIA = os.path.join(RAIZ, "_trabajo", "mapa_grafico_antes_u03.html")

NODOS = [
    ("u3", "so", "se conforma por", "U3 — Administración de memoria", "Cómo conviven programas que juntos no entran en la RAM, sin pisarse", "u3"),
    ("u3t1", "u3", "abarca", "Jerarquía y administrador", "El SO administra la RAM; la caché la maneja el hardware", "u3-jerarquia"),
    ("u3a", "u3t1", "funciona por", "Localidad", "La caché vale lo que vale la localidad del programa", "u3-jerarquia"),
    ("u3b", "u3t1", "idea que se repite", "Lo rápido guarda lo más usado", "RAM = caché del disco · TLB = caché de la tabla de páginas", "u3-idea-cache"),
    ("u3t2", "u3", "abarca", "Espacio de direcciones", "Una memoria abstracta por proceso: protección + reubicación", "u3-espacio"),
    ("u3c", "u3t2", "sin abstracción", "Reubicación estática", "El JMP 28 cae en otro programa; sumar la base al cargar es lento", "u3-espacio"),
    ("u3d", "u3t2", "se implementa con", "Base y límite", "¿d ≥ límite? → trap; si no, física = d + base (reubicación dinámica)", "u3-base-limite"),
    ("u3e", "u3d", "ojo", "Límite = tamaño", "Con límite 8000, la 8000 ya es trap: válidas de 0 a 7999", "u3-base-limite", "error"),
    ("u3t3", "u3", "abarca", "Intercambio y memoria libre", "Procesos enteros van y vienen del disco: quedan huecos", "u3-intercambio"),
    ("u3f", "u3t3", "anota con", "Mapa de bits / lista ligada", "Mapa: buscar k ceros es lento. Lista: fusionar con los vecinos al liberar", "u3-intercambio"),
    ("u3g", "u3t3", "elige con", "Primer, siguiente, mejor, peor ajuste", "Primero = rápido. Siguiente retoma desde donde quedó", "u3-ajustes"),
    ("u3h", "u3g", "trampa", "Mejor ajuste desperdicia MÁS", "Deja sobras diminutas inútiles, y además es lento", "u3-ajustes", "trampa"),
    ("u3i", "u3t3", "en Linux", "Colegas (buddy)", "Potencias de 2: fusión rápida, fragmentación interna (65 → 128)", "u3-colegas"),
    ("u3t4", "u3", "abarca", "Paginación ★", "Solo está en RAM lo que se usa; la MMU traduce en cada acceso", "u3-paginacion"),
    ("u3j", "u3t4", "divide en", "Página / marco", "Página = pedazo virtual; marco = pedazo físico del mismo tamaño", "u3-terminos"),
    ("u3k", "u3t4", "traduce", "Cortar y reemplazar ★", "Desp: 1 KB → 10 bits, 2 KB → 11, 4 KB → 12. La página se reemplaza por el marco", "u3-traduccion"),
    ("u3l", "u3k", "ejemplo", "0x2C3A con 1 KB", "Pág. 11, desp 58 → marco 5 → 0x143A", "u3-traduccion"),
    ("u3m", "u3t4", "si no está", "Fallo de página", "Trap al SO; el proceso queda BLOQUEADO mientras llega la página", "u3-paginacion"),
    ("u3t5", "u3", "abarca", "Tabla de páginas y TLB ★", "Traducir rápido", "u3-tabla"),
    ("u3n", "u3t5", "entrada", "P · R · M · protección · marco", "R y M los pone el hardware; P y la protección, el SO", "u3-entrada"),
    ("u3o", "u3n", "trampa", "Sin dirección en disco", "La tabla tiene solo lo que el hardware necesita para traducir", "u3-entrada", "trampa"),
    ("u3p", "u3t5", "acelera con", "TLB", "Memoria asociativa en la MMU, 8 a 64 entradas, búsqueda en paralelo", "u3-tlb"),
    ("u3q", "u3p", "fallos", "Suave vs. duro", "Suave: en RAM pero no en el TLB (ns). Duro: hay que ir al disco (ms)", "u3-suave-duro"),
    ("u3r", "u3q", "ojo", "El M que sale del TLB", "Va a la tabla de páginas, no al disco", "u3-suave-duro", "error"),
    ("u3t6", "u3", "abarca", "Tablas para memorias grandes", "Que la tabla no ocupe 4 MB por proceso", "u3-multinivel"),
    ("u3s", "u3t6", "32 bits", "Multinivel", "TP1 10 | TP2 10 | desp 12. Los huecos no tienen tabla: 16 KB contra 4 MB", "u3-multinivel"),
    ("u3inv", "u3t6", "64 bits", "Invertida", "Una entrada por MARCO y una tabla para todo el sistema; hash + TLB", "u3-invertida"),
    ("u3t7", "u3", "abarca", "Reemplazo de páginas ★", "¿Qué página saco si no hay marcos libres?", "u3-reemplazo"),
    ("u3u", "u3t7", "cota", "Óptimo", "La que se usa más tarde. Imposible: necesita el futuro", "u3-optimo"),
    ("u3v", "u3t7", "usa R y M", "NRU", "Clases 0 a 3; una al azar de la más baja no vacía", "u3-nru"),
    ("u3w", "u3t7", "mejora FIFO", "Segunda oportunidad ★", "R = 1 → R = 0, llegada = ahora, al final. La primera con R = 0 sale", "u3-segunda"),
    ("u3x", "u3w", "ojo", "0x333A y la cola final", "Cola de la más nueva a la más vieja con su R: 9(1) 5(0) 11(0) 14(1)", "u3-segunda", "error"),
    ("u3y", "u3w", "sin mover nodos", "Reloj", "Lista circular con manecilla; mismas víctimas", "u3-reloj"),
    ("u3z", "u3t7", "el mejor realizable", "LRU", "Matriz: fila k en 1, columna k en 0; sale la fila menor", "u3-lru"),
    ("u3aa", "u3z", "aproximado por", "Envejecimiento", "Desplazar a la derecha y meter R por la izquierda; sale el menor", "u3-envejecimiento"),
    ("u3ab", "u3t7", "basado en", "Conjunto de trabajo", "R = 0 y edad > τ de tiempo virtual → fuera del conjunto", "u3-conjunto-trabajo"),
    ("u3ac", "u3ab", "sobre el reloj", "WSClock ★", "Vieja y sucia → se planifica la escritura y la manecilla avanza", "u3-wsclock", "error"),
    ("u3t8", "u3", "abarca", "Diseño ★", "Cuántos marcos, de quién, de qué tamaño, compartidos", "u3-diseno"),
    ("u3ad", "u3t8", "riesgo", "Sobrepaginación", "Σ conjuntos de trabajo > RAM: pagina más de lo que ejecuta", "u3-sobrepaginacion"),
    ("u3ae", "u3ad", "se resuelve con", "Control de carga", "Sacar procesos enteros al disco (swapping). PFF dice cuántos marcos", "u3-control-carga", "error"),
    ("u3af", "u3t8", "política", "Local / global", "Conjunto de trabajo y WSClock solo locales; FIFO y LRU, las dos", "u3-local-global", "trampa"),
    ("u3ag", "u3t8", "fórmula", "p = √(2se)", "En el óptimo los dos términos de la sobrecarga son iguales", "u3-tamano"),
    ("u3ah", "u3t8", "comparte", "Copia en escritura ★", "Tras fork todo queda de solo lectura; al escribir se copia UNA página", "u3-cow"),
    ("u3ai", "u3t8", "comparte", "DLL", "Una sola copia física → código independiente de la posición", "u3-dll", "error"),
    ("u3aj", "u3t8", "limpia", "Demonio de paginación", "Mantiene marcos libres y escribe las sucias antes de que hagan falta", "u3-limpieza"),
    ("u3t9", "u3", "abarca", "Fallo de página: 10 pasos ★", "Trap → registros → página → validar → víctima → disco → tabla → respaldar → planificar → volver", "u3-diez-pasos"),
    ("u3ak", "u3t9", "ojo", "BLOQUEADO → LISTO en el paso 7", "Con la interrupción de disco, no en el 9 (el 9 planifica)", "u3-diez-pasos", "error"),
    ("u3al", "u3t9", "detalle", "Respaldo de instrucción", "El PC vuelve al inicio de la instrucción que falló", "u3-fallo"),
    ("u3am", "u3t9", "con E/S", "Pinning", "Fijar la página del búfer de DMA para que no la elijan como víctima", "u3-pinning"),
    ("u3t10", "u3", "abarca", "Segmentación ★", "Muchos espacios lógicos, de tamaño variable", "u3-segmentacion"),
    ("u3an", "u3t10", "compara", "Paginación vs. segmentación", "Única fila igual: las dos pueden superar la memoria física", "u3-pag-vs-seg", "trampa"),
    ("u3ao", "u3t10", "problema", "Tablero de ajedrez", "Fragmentación externa → compactación (costosa)", "u3-tablero"),
    ("u3ap", "u3t10", "solución", "Segmentos paginados", "Lo lógico de la segmentación + lo práctico de la paginación", "u3-seg-pag"),
    ("u3aq", "u3ap", "1.er caso", "MULTICS", "seg 18 | pág 6 | desp 10. Fallo de segmento ≠ fallo de página", "u3-multics"),
    ("u3ar", "u3ap", "2.º caso", "Pentium", "Selector 13|1|2 → LDT/GDT → base + desp = lineal → Dir|Pág|Desp", "u3-pentium"),
    ("u3as", "u3ar", "protege con", "Anillos 0 a 3", "Datos de un nivel más alto sí; otro nivel solo por compuerta", "u3-anillos"),
    ("u3t11", "u3", "abarca", "Casos de estudio", "Caché, Linux y Windows", "u3-casos"),
    ("u3at", "u3t11", "hardware", "Caché", "Líneas de 64 B; con 4096 líneas: bits 6–17 = línea, 0–5 = byte", "u3-cache"),
    ("u3au", "u3t11", "Linux", "brk, mmap y comandos", "free -h → available · PSS · vmstat: si/so altos = swap", "u3-linux"),
    ("u3av", "u3t11", "Windows", "Fallo suave / duro y 5 listas", "Modificadas, en espera, libres, en ceros, defectuosas", "u3-windows"),
]

CRUCES = [
    ("u1f", "u3b", "la misma idea"),
    ("u1f", "u3p", "caché de traducciones"),
    ("u1e", "u3d", "solo el SO los cambia"),
    ("u1e", "u3as", "anillos 0 y 3"),
    ("u1s", "u3as", "compuerta = TRAP controlado"),
    ("u1j", "u3t9", "mismo esquema"),
    ("u1k", "u3am", "DMA usa direcciones físicas"),
    ("u1c", "u3ae", "grado de multiprogramación"),
    ("u2e", "u3m", "BLOQUEADO mientras llega"),
    ("u2h", "u3t9", "pasos 1–2 y 9–10"),
    ("u2b", "u3ah", "fork sin copiar todo"),
    ("u2ae", "u3u", "necesita el futuro, como SJF"),
    ("u2al", "u3t9", "paginador externo"),
    ("u2as", "u3at", "la caché otra vez"),
    ("u3d", "u3t10", "un par por segmento"),
    ("u3i", "u3au", "Linux usa colegas"),
    ("u3q", "u3av", "mismos nombres"),
    ("u3s", "u3ar", "Dir | Pág | Desp"),
    ("u3ah", "u3av", "COW en Windows"),
    ("u3aj", "u3av", "escritor de modificadas"),
    ("u3ad", "u3au", "si/so altos"),
]


def js(t):
    return "[" + ", ".join('"%s"' % x.replace('"', '\\"') for x in t) + "],"


def main():
    s = io.open(P, encoding="utf-8", newline="").read()
    if '["u3", "so"' in s:
        print("La U3 ya estaba en el mapa: no se hace nada")
        return
    shutil.copyfile(P, COPIA)
    nl = "\r\n" if "\r\n" in s else "\n"

    def agregar(ancla, extra):
        nonlocal s
        assert s.count(ancla) == 1, ancla
        s = s.replace(ancla, ancla + extra)

    agregar('["u2aw", "u2av", "relacionados", "Pandillas ★", "Los hilos del grupo arrancan y terminan juntos cada quantum", "u2-pandillas"],' + nl,
            nl + "// ---------------- U3 (agregado 2026-11-12)" + nl + nl.join(js(n) for n in NODOS) + nl)
    agregar('["u2v", "u2w", "un up se guarda"],' + nl,
            "// cruces con la U3 (agregado 2026-11-12)" + nl + nl.join(js(c) for c in CRUCES) + nl)
    agregar('      <option value="u2">Solo la Unidad 2</option>' + nl,
            '      <option value="u3">Solo la Unidad 3</option>' + nl)
    io.open(P, "w", encoding="utf-8", newline="").write(s)
    print(len(NODOS), "nodos y", len(CRUCES), "cruces agregados; copia previa en", COPIA)


if __name__ == "__main__":
    main()
