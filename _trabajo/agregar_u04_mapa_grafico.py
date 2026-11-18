# -*- coding: utf-8 -*-
"""Agrega la U4 a visuales/mapa_grafico.html SOLO sumando entradas a NODOS,
CRUCES y una opcion del selector (regla: no cambiar nada de lo existente)."""
import io, os, shutil

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(RAIZ, "visuales", "mapa_grafico.html")
COPIA = os.path.join(RAIZ, "_trabajo", "mapa_grafico_antes_u04.html")

NODOS = [
    ("u4", "so", "se conforma por", "U4 — Sistemas de archivos", "Cómo guardar información que sobreviva al proceso en un disco de bloques", "u4"),
    ("u4t1", "u4", "abarca", "Archivos", "Unidad lógica, independiente del proceso y persistente", "u4-archivos"),
    ("u4a", "u4t1", "operaciones", "create · open · read/write · close", "open trae atributos y direcciones a RAM; close fuerza el último bloque", "u4-operaciones"),
    ("u4b", "u4t1", "ojo", "Bit x y número mágico", "En UNIX la extensión no decide si se ejecuta", "u4-archivos", "error"),
    ("u4t2", "u4", "abarca", "Directorios y rutas", "Un solo nivel choca; el jerárquico es un árbol", "u4-directorios"),
    ("u4c", "u4t2", "nombra con", "Absoluta / relativa", "La absoluta empieza con /; la relativa, desde el directorio de trabajo", "u4-rutas"),
    ("u4d", "u4c", "ojo", "/ al principio = absoluta", "Aunque venga después de los ..", "u4-rutas", "error"),
    ("u4e", "u4t2", "trampa", "Vacío = solo . y ..", "rmdir lo borra; cualquier otra entrada da Directory not empty", "u4-directorios", "trampa"),
    ("u4t3", "u4", "abarca", "Asignación ★", "¿Qué bloques son de qué archivo?", "u4-asignacion"),
    ("u4f", "u4t3", "reparte", "MBR y partición", "MBR → partición activa → bloque de arranque; superbloque con el número mágico", "u4-asignacion"),
    ("u4g", "u4t3", "1.", "Contigua", "Inicio + cantidad; una búsqueda; fragmentación externa (CD-ROM)", "u4-asignacion"),
    ("u4h", "u4t3", "2.", "Lista enlazada", "Cada bloque apunta al siguiente; acceso aleatorio lentísimo", "u4-asignacion"),
    ("u4i", "u4t3", "3.", "FAT ★", "FAT[c] = el bloque que sigue a c; la tabla entera en RAM", "u4-fat"),
    ("u4j", "u4i", "trampa", "Contar clusters, no saltos", "Termina en la entrada que tiene FF; 7 flechas = 8 clusters", "u4-fat", "trampa"),
    ("u4k", "u4i", "ojo", "Escribir la cadena", "En el final la parte b vale 15 p: sin desarrollo queda parcial", "u4-fat", "error"),
    ("u4t4", "u4", "abarca", "Nodos-i ★", "Una ficha por archivo: atributos + direcciones", "u4-nodoi"),
    ("u4l", "u4t4", "compara", "FAT vs. nodos-i", "FAT ∝ disco; nodos-i ∝ archivos abiertos", "u4-fat-vs-nodoi"),
    ("u4m", "u4t4", "fórmula", "(D + P + P² + P³)·B", "P = bloque / puntero. 10 dir, 4 KB, 4 B → ≈ 4 TiB (errata: 4,27 TB)", "u4-nodoi"),
    ("u4n", "u4t4", "cuenta", "Bloques índice", "En el doble: el doble + cada sencillo que cuelga", "u4-nodoi", "trampa"),
    ("u4o", "u4t4", "ubica", "¿En qué nivel cae un byte?", "Lecturas con el nodo-i en RAM: 1, 2, 3, 4 (+1 si no está)", "u4-ubicar-byte"),
    ("u4t5", "u4", "abarca", "Directorios por dentro y vínculos ★", "La entrada guarda el nº de nodo-i (V7: 14 + 2 B)", "u4-vinculos"),
    ("u4p", "u4t5", "busca", "/usr/ast/mbox", "Raíz → bl 1 → nodo-i 6 → bl 132 → 26 → bl 406 → 60: 7 lecturas", "u4-ruta-mbox"),
    ("u4q", "u4t5", "comparte con", "Vínculo duro", "Mismo nodo-i, el contador sube; no cruza particiones", "u4-duro"),
    ("u4r", "u4q", "trampa", "El dueño sigue pagando", "Tras su rm el archivo vive y la cuota es del dueño", "u4-duro", "trampa"),
    ("u4s", "u4t5", "comparte con", "Vínculo simbólico", "Un archivo con una ruta; queda colgado; cruza discos", "u4-simbolico"),
    ("u4t", "u4s", "ojo", "El simbólico NO mantiene vivo", "«El duro cuenta, el simbólico apunta» · contador 1, 2, 2, 1", "u4-simbolico", "error"),
    ("u4t6", "u4", "abarca", "LFS, bitácora y VFS", "Escribir rápido, no romperse, convivir", "u4-bitacora"),
    ("u4u", "u4t6", "escribe en", "LFS", "Segmentos grandes al final de un registro circular + limpiador", "u4-bitacora"),
    ("u4v", "u4t6", "sobrevive con", "Bitácora ★", "Anotar → hacer A, B, C → borrar la entrada; al caer, rehacer", "u4-journaling"),
    ("u4w", "u4v", "exige", "Idempotencia", "Fijar = sí; incrementar o agregar al final = no", "u4-idempotente", "error"),
    ("u4x", "u4v", "ojo", "Nodo-i reasignado", "La entrada vieja abre el archivo nuevo", "u4-journaling", "error"),
    ("u4y", "u4t6", "integra con", "VFS", "POSIX arriba, interfaz VFS abajo; nodo-v con las funciones del FS", "u4-vfs"),
    ("u4t7", "u4", "abarca", "Espacio en disco ★", "Bloques fijos, no contiguos", "u4-espacio"),
    ("u4z", "u4t7", "decide", "Tamaño de bloque", "Grande = rápido con desperdicio; no hay tamaño ideal", "u4-espacio"),
    ("u4aa", "u4t7", "calcula", "Fragmentación interna ★", "bloque − resto exacto. FAT32: 2554 B (errata 2580,48)", "u4-frag-interna"),
    ("u4ab", "u4aa", "ojo", "Contra el cluster, no el sector", "7616, no 448; el resto ya está adentro del último cluster", "u4-frag-interna", "error"),
    ("u4ac", "u4t7", "registra libres", "Lista vs. mapa de bits", "Mapa: 1 bit por bloque, fijo. Lista: gana con el disco casi lleno", "u4-libres"),
    ("u4ad", "u4t7", "limita", "Cuotas", "Suave (advertencias) y duro (error); se le cobran al dueño", "u4-espacio"),
    ("u4t8", "u4", "abarca", "Respaldos, fsck y caché", "Confiabilidad y rendimiento", "u4-confiabilidad"),
    ("u4ae", "u4t8", "respalda", "Vaciado físico / lógico", "UNIX en 4 fases: marcar, desmarcar, directorios, archivos", "u4-respaldos"),
    ("u4af", "u4t8", "verifica", "fsck ★", "uso + libres = 1: faltante, duplicado en libres, duplicado de datos", "u4-fsck"),
    ("u4ag", "u4af", "ojo", "Copiar y avisar; sacar de libres", "Duplicado: copiar el contenido. En uso y libre: nunca del archivo", "u4-fsck", "error"),
    ("u4ah", "u4af", "directorios", "Cuenta vs. entradas", "Alta = desperdicio · baja = catastrófico", "u4-fsck"),
    ("u4ai", "u4t8", "acelera con", "Caché de bloques", "LRU modificado: lo esencial se escribe ya; sync cada 30 s", "u4-cache-bufer"),
    ("u4t9", "u4", "abarca", "Ejemplos reales", "CD-ROM, MS-DOS, V7, NTFS, NFS", "u4-ejemplos"),
    ("u4aj", "u4t9", "una escritura", "ISO 9660", "Contiguo, sin libres, binarios dos veces (errata: 1988)", "u4-ejemplos"),
    ("u4ak", "u4t9", "entrada de 32 B", "MS-DOS / FAT-12/16/32", "FAT-32 usa 28 bits; tope 2 TB; hora ±2 s, año 2107", "u4-msdos", "trampa"),
    ("u4al", "u4t9", "registros de 1 KB", "NTFS", "MFT; tiradas (dirección, longitud); $LogFile = bitácora", "u4-ntfs"),
    ("u4am", "u4t9", "en red", "NFS", "v3 sin estado · v4 con estado; nodo-v → nodo-r", "u4-nfs"),
    ("u4t10", "u4", "abarca", "Protección", "Dominios, matriz, ACL, capacidades, multinivel", "u4-proteccion"),
    ("u4an", "u4t10", "por columnas", "ACL", "Revocar fácil y selectivo; gana la primera entrada que coincide", "u4-acl", "trampa"),
    ("u4ao", "u4t10", "por filas", "Capacidades", "Verificar rápido; revocar difícil (Amoeba: a todos)", "u4-capacidades"),
    ("u4ap", "u4t10", "secreto", "Bell-La Padula", "No leer arriba, no escribir abajo; Biba al revés", "u4-blp"),
    ("u4aq", "u4ap", "ojo", "Fuga hacia abajo", "No es «me puedo equivocar»: es un troyano filtrando", "u4-blp", "error"),
    ("u4ar", "u4t10", "fuga", "Canales encubiertos", "CPU, paginación, bloqueos: ninguna matriz los frena", "u4-canales"),
    ("u4t11", "u4", "abarca", "Linux ★", "Llamadas, ext2, ext3, /proc, comandos", "u4-linux"),
    ("u4as", "u4t11", "organiza", "ext2", "Grupos de bloques con 2 mapas de bits; raíz = nodo-i 2; 12 directos", "u4-ext2"),
    ("u4at", "u4t11", "lee con", "Las 3 tablas ★★", "Descriptor → descripción (posición) → nodo-i. fork comparte, open no", "u4-tres-tablas"),
    ("u4au", "u4t11", "con bitácora", "ext3", "ext2 + JBD: registro, operación atómica, transacción", "u4-linux"),
    ("u4av", "u4t11", "configura", "fstab y comandos", "6 columnas; dice qué se monta al arrancar. lsblk -f, mount, ln", "u4-comandos", "trampa"),
]

CRUCES = [
    ("u1n", "u4f", "el mismo MBR"),
    ("u1f", "u4ai", "la jerarquía otra vez"),
    ("u1s", "u4a", "son llamadas al sistema"),
    ("u1g", "u4y", "capa independiente del dispositivo"),
    ("u1e", "u4t10", "cambio de dominio"),
    ("u2b", "u4at", "el hijo comparte la posición"),
    ("u2b", "u4t2", "hereda el directorio de trabajo"),
    ("u3inv", "u4l", "solo lo que está en uso"),
    ("u3s", "u4i", "una entrada por recurso no escala"),
    ("u3ao", "u4g", "fragmentación externa"),
    ("u3ag", "u4z", "el mismo compromiso"),
    ("u3t7", "u4ai", "mismos algoritmos de reemplazo"),
    ("u3y", "u4u", "registro circular"),
    ("u3au", "u4t11", "/proc/meminfo"),
    ("u4x", "u4ah", "el mismo desastre"),
    ("u4q", "u4ad", "la cuota es del dueño"),
    ("u4v", "u4au", "ext3 = ext2 + bitácora"),
    ("u4v", "u4al", "$LogFile"),
    ("u4y", "u4am", "nodo-v → nodo-r"),
    ("u4ac", "u4as", "dos mapas de bits"),
    ("u4o", "u4as", "12 directos"),
]


def js(t):
    return "[" + ", ".join('"%s"' % x.replace('"', '\\"') for x in t) + "],"


def main():
    s = io.open(P, encoding="utf-8", newline="").read()
    if '["u4", "so"' in s:
        print("La U4 ya estaba en el mapa: no se hace nada")
        return
    shutil.copyfile(P, COPIA)
    nl = "\r\n" if "\r\n" in s else "\n"

    def agregar(ancla, extra):
        nonlocal s
        assert s.count(ancla) == 1, ancla
        s = s.replace(ancla, ancla + extra)

    agregar('["u3av", "u3t11", "Windows", "Fallo suave / duro y 5 listas", "Modificadas, en espera, libres, en ceros, defectuosas", "u3-windows"],' + nl,
            nl + "// ---------------- U4 (agregado 2026-11-18)" + nl + nl.join(js(n) for n in NODOS) + nl)
    agregar('["u3ad", "u3au", "si/so altos"],' + nl,
            "// cruces con la U4 (agregado 2026-11-18)" + nl + nl.join(js(c) for c in CRUCES) + nl)
    agregar('      <option value="u3">Solo la Unidad 3</option>' + nl,
            '      <option value="u4">Solo la Unidad 4</option>' + nl)
    io.open(P, "w", encoding="utf-8", newline="").write(s)
    print(len(NODOS), "nodos y", len(CRUCES), "cruces agregados; copia previa en", COPIA)


if __name__ == "__main__":
    main()
