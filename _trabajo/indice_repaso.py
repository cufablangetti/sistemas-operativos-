# -*- coding: utf-8 -*-
"""
indice_repaso.py  repaso_uNN.html  repaso_uNN.pdf  [salida.md]

Saca los titulos del HTML de repaso y busca en que pagina del PDF ya
generado cayo cada uno. Sirve para que el mapa conceptual pueda citar
"(Repaso U2, pag. 14)" y no solo la pagina del Tanenbaum.

Uso tipico (despues de generar el PDF con html2pdf.py):
    python -X utf8 -I _trabajo/indice_repaso.py \
        unidades/u02-procesos/repaso_u02.html \
        unidades/u02-procesos/repaso_u02.pdf \
        _trabajo/indice_repaso_u02.md
"""
import io, re, sys, unicodedata

import pymupdf


def normalizar(t):
    """Minusculas, sin acentos, sin puntuacion ni espacios repetidos."""
    t = unicodedata.normalize("NFKD", t)
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = t.lower()
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def titulos_del_html(ruta):
    html = io.open(ruta, encoding="utf-8").read()
    salida = []
    for m in re.finditer(r"<h([1-4])[^>]*>(.*?)</h\1>", html, re.S | re.I):
        nivel = int(m.group(1))
        texto = re.sub(r"<[^>]+>", "", m.group(2))
        texto = (texto.replace("&amp;", "&").replace("&mdash;", "—")
                      .replace("&nbsp;", " ").replace("&lt;", "<")
                      .replace("&gt;", ">").replace("&quot;", '"'))
        texto = re.sub(r"\s+", " ", texto).strip()
        if texto:
            salida.append((nivel, texto))
    return salida


def paginas_normalizadas(pdf):
    doc = pymupdf.open(pdf)
    paginas = [normalizar(p.get_text()) for p in doc]
    doc.close()
    return paginas


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1

    html, pdf = sys.argv[1], sys.argv[2]
    destino = sys.argv[3] if len(sys.argv) > 3 else None

    titulos = titulos_del_html(html)
    paginas = paginas_normalizadas(pdf)

    filas, sin_encontrar, ultima = [], [], 1
    for nivel, texto in titulos:
        clave = normalizar(texto)
        pag = None
        # Se busca desde la ultima pagina encontrada: los titulos van en orden.
        for desplazamiento in (0, -1):
            arranque = max(0, ultima - 1 + desplazamiento)
            for i in range(arranque, len(paginas)):
                if clave and clave in paginas[i]:
                    pag = i + 1
                    break
            if pag:
                break
        if pag:
            ultima = pag
        else:
            sin_encontrar.append(texto)
        filas.append((nivel, texto, pag))

    lineas = ["| Nivel | Título | Pág. del PDF |", "|---|---|---|"]
    for nivel, texto, pag in filas:
        sangria = "&nbsp;" * 4 * (nivel - 1)
        lineas.append(f"| h{nivel} | {sangria}{texto} | {pag if pag else '?'} |")
    tabla = "\n".join(lineas)

    print(tabla)
    print(f"\n{len(filas)} títulos, {len(paginas)} páginas en el PDF, "
          f"{len(sin_encontrar)} sin ubicar")
    for t in sin_encontrar:
        print("  SIN UBICAR:", t)

    if destino:
        io.open(destino, "w", encoding="utf-8", newline="\n").write(tabla + "\n")
        print("\nEscrito en", destino)
    return 0


if __name__ == "__main__":
    sys.exit(main())
