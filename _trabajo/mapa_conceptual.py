# -*- coding: utf-8 -*-
"""
mapa_conceptual.py  [--armar]

Genera las dos salidas del mapa conceptual acumulativo a partir de su
fuente unica, plan/mapa_conceptual.md:

    visuales/mapa_conceptual.html   interactivo (buscador, ramas colapsables,
                                    cruces entre unidades clickeables)
    _trabajo/mapa_conceptual_imprimir.html  -> plan/mapa_conceptual.pdf
                                    (se convierte con html2pdf.py)

Con --armar, antes concatena _trabajo/mapa_partes/*.md en
plan/mapa_conceptual.md (solo se usa la primera vez; despues el .md es la
fuente y se edita a mano, agregando cada unidad nueva).

Sintaxis del .md:
    # Unidad {#id}        ## Tema {#id}        ### Concepto {#id}
    > referencia (una o varias lineas, justo debajo del titulo)
    texto suelto          -> descripcion del nodo
    - item {#id}          -> sub-concepto (sangria de 2 espacios por nivel)
    1. paso               -> paso numerado de una secuencia
    [[id]]                -> enlace a otro nodo
"""
import glob
import html
import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = os.path.join(RAIZ, "plan", "mapa_conceptual.md")
HTML_INTERACTIVO = os.path.join(RAIZ, "visuales", "mapa_conceptual.html")
HTML_IMPRIMIR = os.path.join(RAIZ, "_trabajo", "mapa_conceptual_imprimir.html")

MARCAS = {
    "⚠️": "error", "🔗": "cruce", "🔢": "secuencia", "🧠": "memoria",
    "⚖️": "par", "📌": "trampa", "❓": "duda",
}


def armar():
    partes = sorted(glob.glob(os.path.join(RAIZ, "_trabajo", "mapa_partes", "*.md")))
    texto = "\n\n".join(io.open(p, encoding="utf-8").read().strip() for p in partes)
    io.open(MD, "w", encoding="utf-8", newline="\n").write(texto + "\n")
    print("Armado", MD, "desde", len(partes), "partes")


# ------------------------------------------------------------------ parser

class Nodo:
    def __init__(self, nivel, texto, tipo):
        self.nivel, self.tipo, self.hijos, self.refs, self.desc = nivel, tipo, [], [], []
        self.id = None
        m = re.search(r"\s*\{#([\w-]+)\}", texto)
        if m:
            self.id = m.group(1)
            texto = texto[: m.start()] + texto[m.end():]
        self.texto = texto.strip()
        # la marca vale si el emoji aparece en el texto propio del nodo;
        # todo nodo con un [[enlace]] cuenta ademas como cruce entre unidades
        self.marcas = [v for k, v in MARCAS.items() if k in self.texto]
        if "[[" in self.texto and "cruce" not in self.marcas:
            self.marcas.append("cruce")


def parsear(md):
    raiz = Nodo(0, "raíz", "raiz")
    pila_tit = [raiz]          # cadena de titulos abiertos
    pila_items = []            # (sangria, nodo) de la lista actual
    ultimo = raiz
    for linea in md.split("\n"):
        if not linea.strip():
            continue
        m = re.match(r"^(#{1,3}) (.+)", linea)
        if m:
            nivel = len(m.group(1))
            n = Nodo(nivel, m.group(2), "titulo")
            while pila_tit[-1].nivel >= nivel:
                pila_tit.pop()
            pila_tit[-1].hijos.append(n)
            pila_tit.append(n)
            pila_items, ultimo = [], n
            continue
        if linea.startswith(">"):
            ultimo.refs.append(linea.lstrip(">").strip())
            continue
        m = re.match(r"^( *)(- |\d+\. )(.+)", linea)
        if m:
            sangria = len(m.group(1))
            tipo = "paso" if m.group(2)[0].isdigit() else "item"
            n = Nodo(0, m.group(3), tipo)
            while pila_items and pila_items[-1][0] >= sangria:
                pila_items.pop()
            padre = pila_items[-1][1] if pila_items else pila_tit[-1]
            padre.hijos.append(n)
            pila_items.append((sangria, n))
            ultimo = n
            continue
        # linea de continuacion o parrafo
        if pila_items and linea.startswith(" "):
            pila_items[-1][1].texto += " " + linea.strip()
        else:
            pila_tit[-1].desc.append(linea.strip())
    return raiz


def indexar(nodo, ids, camino=()):
    if nodo.id:
        if nodo.id in ids:
            raise SystemExit(f"id repetido: {nodo.id}")
        ids[nodo.id] = (nodo, camino)
    for h in nodo.hijos:
        indexar(h, ids, camino + ((nodo.texto if nodo.tipo == "titulo" else None),))
    return ids


def sin_marcas(nodo):
    nodo.marcas = []
    for h in nodo.hijos:
        sin_marcas(h)


def titulo_corto(nodo):
    t = re.sub(r"\[\[[\w-]+\]\]", "", nodo.texto)
    t = re.sub(r"^[^\w*ÁÉÍÓÚáéíóúÑñ¿¡(`]+", "", t)  # saca emojis iniciales
    m = re.match(r"\*\*(.+?)\*\*", t)
    if m:
        t = m.group(1)
    elif nodo.tipo != "titulo":
        t = re.split(r" — ", t)[0]
    t = re.sub(r"[*`]", "", t)
    return t.strip()[:80]


def inline(t, ids, enlazar=True):
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)

    def enlace(m):
        destino = m.group(1)
        if destino not in ids:
            raise SystemExit(f"enlace a un id inexistente: [[{destino}]]")
        nodo = ids[destino][0]
        nombre = html.escape(titulo_corto(nodo), quote=False)
        unidad = destino.split("-")[0].upper()
        if enlazar:
            return f'<a class="x" href="#{destino}" data-ir="{destino}">→ {unidad}: {nombre}</a>'
        return f'<span class="x">(→ {unidad}: {nombre})</span>'

    return re.sub(r"\[\[([\w-]+)\]\]", enlace, t)


# ------------------------------------------------------------- interactivo

def a_dict(nodo, ids):
    d = {"t": inline(nodo.texto, ids), "k": nodo.tipo, "m": nodo.marcas}
    if nodo.id:
        d["id"] = nodo.id
    if nodo.refs:
        d["r"] = [inline(r, ids) for r in nodo.refs]
    if nodo.desc:
        d["d"] = [inline(x, ids) for x in nodo.desc]
    if nodo.hijos:
        d["h"] = [a_dict(h, ids) for h in nodo.hijos]
    if nodo.tipo == "titulo":
        d["n"] = nodo.nivel
    return d


def contar(nodo, c):
    for m in nodo.marcas:
        c[m] = c.get(m, 0) + 1
    c["nodos"] = c.get("nodos", 0) + 1
    for h in nodo.hijos:
        contar(h, c)
    return c


PLANTILLA = io.open(os.path.join(RAIZ, "_trabajo", "mapa_conceptual_plantilla.html"),
                    encoding="utf-8").read() if os.path.exists(
    os.path.join(RAIZ, "_trabajo", "mapa_conceptual_plantilla.html")) else None


def interactivo(raiz, ids):
    datos = [a_dict(h, ids) for h in raiz.hijos]
    c = contar(raiz, {})
    js = json.dumps(datos, ensure_ascii=False).replace("</", "<\\/")
    salida = PLANTILLA.replace("/*__DATOS__*/null", js).replace(
        "__RESUMEN__", f'{c["nodos"] - 1} nodos · {c.get("secuencia", 0)} secuencias · '
                       f'{c.get("cruce", 0)} cruces · {c.get("error", 0)} errores marcados')
    io.open(HTML_INTERACTIVO, "w", encoding="utf-8", newline="\n").write(salida)
    print("Escrito", HTML_INTERACTIVO, c)


# --------------------------------------------------------------- imprimir

def lista_imprimir(hijos, ids):
    if not hijos:
        return ""
    pasos = all(h.tipo == "paso" for h in hijos)
    tag = "ol" if pasos else "ul"
    out = [f"<{tag}>"]
    for h in hijos:
        out.append("<li>" + inline(h.texto, ids, enlazar=False) + lista_imprimir(h.hijos, ids) + "</li>")
    out.append(f"</{tag}>")
    return "".join(out)


def nodo_imprimir(n, ids, out):
    if n.tipo == "titulo":
        h = {1: "h1", 2: "h2", 3: "h3"}[n.nivel]
        out.append(f"<{h}>{inline(n.texto, ids, enlazar=False)}</{h}>")
        for r in n.refs:
            out.append(f'<p class="ref">{inline(r, ids, enlazar=False)}</p>')
        for d in n.desc:
            out.append(f"<p>{inline(d, ids, enlazar=False)}</p>")
        items = [h_ for h_ in n.hijos if h_.tipo != "titulo"]
        out.append(lista_imprimir(items, ids))
        for h_ in n.hijos:
            if h_.tipo == "titulo":
                nodo_imprimir(h_, ids, out)


def recolectar(nodo, marca, camino, out):
    if marca in nodo.marcas:
        out.append((camino, nodo))
    for h in nodo.hijos:
        recolectar(h, marca, camino + ([titulo_corto(nodo)] if nodo.tipo == "titulo" else []), out)


def imprimir(raiz, ids):
    out = ["<html><body>",
           "<h1>Mapa conceptual — Sistemas Operativos</h1>",
           '<p class="sub">UTN FRM — Mapa acumulativo · Unidades 1 y 2 · '
           "Las referencias 📖 son del Tanenbaum (páginas impresas); las 📄 son del PDF de repaso de cada unidad.</p>"]
    for h in raiz.hijos:
        nodo_imprimir(h, ids, out)
    for marca, titulo in (("error", "Anexo A — Todos los errores que ya cometí (⚠️)"),
                          ("cruce", "Anexo B — Todas las conexiones entre unidades (🔗)"),
                          ("trampa", "Anexo C — Todas las trampas de examen (📌)")):
        filas = []
        recolectar(raiz, marca, [], filas)
        out.append(f"<h1>{titulo}</h1><ul>")
        for camino, n in filas:
            ubic = " › ".join(c for c in camino if c and c != "raíz")
            out.append(f'<li><span class="ref">{html.escape(ubic)}</span><br/>'
                       f"{inline(n.texto, ids, enlazar=False)}</li>")
        out.append("</ul>")
    out.append("</body></html>")
    # el PDF no tiene el glifo del cerebro: en papel la nota de memoria va con la lamparita
    texto = "\n".join(out).replace("🧠", "💡")
    io.open(HTML_IMPRIMIR, "w", encoding="utf-8", newline="\n").write(texto)
    print("Escrito", HTML_IMPRIMIR)


def main():
    if "--armar" in sys.argv:
        armar()
    raiz = parsear(io.open(MD, encoding="utf-8").read())
    ids = indexar(raiz, {})
    if "guia" in ids:  # la leyenda explica las marcas, no las usa
        sin_marcas(ids["guia"][0])
    interactivo(raiz, ids)
    imprimir(raiz, ids)


if __name__ == "__main__":
    main()
