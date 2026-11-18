# -*- coding: utf-8 -*-
"""
armar_repaso_u03.py  entrada.md  salida.html

Arma el HTML del repaso de la Unidad 3 a partir de los mensajes de la clase
extraidos del chat con extraer_chat.py (_trabajo/u03_clase_chat.md).
Reusa el conversor Markdown -> HTML de armar_repaso_u02.py.
"""
import io, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from armar_repaso_u02 import md_a_html, inline, leer_mensajes, recortar_desde

# Mensajes de logistica, de herramientas o de estado ("lo verifico", "lo agrego al indice"...)
EXCLUIR_CORTOS = 400                 # menos caracteres = mensaje de herramientas
EXCLUIR = {1, 20, 41}                # duracion de la unidad, anuncio del tema 7, "cuanto falta"
DESDE_TITULO = {6: "Dos preguntas", 10: "Dos preguntas"}   # se saltea la presentacion del simulador
# Mensajes que responden una duda suelta: se les pone un titulo
TITULO_EXTRA = {
    21: "Duda: ¿qué función de hash usa la tabla de páginas invertida?",
    33: "Duda: ¿las columnas de la fig. 3-18 son las páginas?",
    34: "Duda: ¿el contador cuenta el número o las veces que hubo un 1?",
    55: "Cómo resolver el ejercicio del Pentium: ¿binario o hexa?",
}
# Titulos de bloque que se sacan (descripcion de los simuladores, logistica)
FUERA = [r"🎛", r"🧮", r"Lo que sigue"]
SECCIONES = [
    (r"^Mapa de la unidad", "Mapa de la unidad"),
    (r"^Tema 1 de 11", "Tema 1 — La jerarquía de memoria y el administrador de memoria"),
    (r"^Tema 2 de 11", "Tema 2 — Sin abstracción de memoria y el espacio de direcciones"),
    (r"^Tema 3 de 11", "Tema 3 — Intercambio y administración de la memoria libre"),
    (r"^Tema 4 de 11", "Tema 4 — Memoria virtual y paginación"),
    (r"^Tema 5 ", "Tema 5 — La tabla de páginas por dentro y el TLB"),
    (r"^Tema 6 ", "Tema 6 — Tablas de páginas para memorias grandes"),
    (r"^Tema 7 \(parte A\)", "Tema 7A — Algoritmos de reemplazo de páginas"),
    (r"^Tema 7 \(parte B\)", "Tema 7B — LRU y sus aproximaciones; conjunto de trabajo y WSClock"),
    (r"^Tema 8A", "Tema 8A — Cuestiones de diseño: sobrepaginación, local/global, tamaño de página"),
    (r"^Tema 8B", "Tema 8B — Compartir memoria: páginas y bibliotecas compartidas, copia en escritura"),
    (r"^Tema 9", "Tema 9 — Cuestiones de implementación: el fallo de página paso a paso"),
    (r"^Tema 10A", "Tema 10A — Segmentación"),
    (r"^Tema 10B", "Tema 10B — Segmentación con paginación: MULTICS y Pentium"),
    (r"^Tema 11:", "Tema 11 — Casos de estudio: caché y Linux"),
    (r"^Tema 11C", "Tema 11C — El administrador de memoria de Windows"),
    (r"^🎓 Cierre", "Cierre de la Unidad 3"),
]
ABSORBER = [r"^Unidad 3: Administración de memoria$"]
RUIDO = [r"^Escribí \*\*«", r"^Te abrí", r"^Te dejé abierto", r"^Cuando quieras", r"^Decime \*\*"]


def quitar_visuales(lineas):
    """Saca desde un titulo de FUERA hasta el proximo titulo (de cualquier nivel) o '---'."""
    out, salto, en_pre = [], False, False
    for l in lineas:
        if l.startswith("```"):
            en_pre = not en_pre
        if not en_pre:
            m = re.match(r"^#{1,4} (.+)", l)
            if m or re.fullmatch(r"-{3,}", l.strip()):
                salto = bool(m) and any(re.search(p, m.group(1)) for p in FUERA)
                if salto:
                    continue
        if not salto:
            out.append(l)
    return out


def agrupar(mensajes):
    secciones = [["Introducción", []]]
    for n, cuerpo in mensajes:
        if n in EXCLUIR or len(cuerpo) < EXCLUIR_CORTOS:
            continue
        if n in DESDE_TITULO:
            cuerpo = recortar_desde(cuerpo, DESDE_TITULO[n])
        if n in TITULO_EXTRA:
            cuerpo = f"## {TITULO_EXTRA[n]}\n\n{cuerpo}"
        en_pre = False
        for l in quitar_visuales(cuerpo.split("\n")):
            if l.startswith("```"):
                en_pre = not en_pre
                secciones[-1][1].append(l)
                continue
            if not en_pre:
                m = re.match(r"^#{1,2} (.+)", l)
                if m:
                    t = m.group(1).strip()
                    nueva = next((h2 for p, h2 in SECCIONES if re.search(p, t)), None)
                    if nueva:
                        secciones.append([nueva, []])
                        continue
                    if any(re.search(p, t) for p in ABSORBER):
                        continue
                    l = "## " + t
                if any(re.search(p, l.strip()) for p in RUIDO):
                    continue
            secciones[-1][1].append(l)
        secciones[-1][1].append("")
    return [s for s in secciones if any(x.strip() for x in s[1])]


PORTADA = """<h1>Unidad 3 — Administración de memoria</h1>
<p class="sub">Sistemas Operativos — UTN FRM — Repaso de la clase completa en el chat: 11 temas, correcciones y cierre</p>
<div class="clave"><b>Cómo leer este repaso.</b> Es la clase tal como se dio, tema por tema, con los mismos
diagramas y ejemplos. Al final de cada tema están las <b>preguntas de control</b> y, a continuación, su
<b>corrección</b>: ahí quedaron marcados los errores que conviene no repetir (⚠️). La referencia al Tanenbaum
está en cada bloque. Los simuladores interactivos de cada tema están en <b>visuales/index.html</b>.
El resumen de todo y <b>lo que más se toma</b> está en el <b>Cierre de la Unidad 3</b>, en las últimas páginas.</div>
"""


def main():
    entrada, salida = sys.argv[1], sys.argv[2]
    secciones = agrupar(leer_mensajes(entrada))
    partes = ["<html><body>", PORTADA]
    for k, (titulo, lineas) in enumerate(secciones):
        if titulo == "Introducción":
            continue
        if k > 1:
            partes.append("<hr/>")
        partes.append(f"<h2>{inline(titulo)}</h2>")
        partes.append(md_a_html(lineas))
    partes.append("</body></html>")
    io.open(salida, "w", encoding="utf-8", newline="\n").write("\n".join(partes))
    for titulo, lineas in secciones:
        print(f"{len(lineas):5d} líneas  {titulo}")


if __name__ == "__main__":
    main()
