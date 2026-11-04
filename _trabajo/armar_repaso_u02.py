# -*- coding: utf-8 -*-
"""
armar_repaso_u02.py  entrada.md  salida.html

Arma el HTML del repaso de la Unidad 2 a partir de los mensajes de la clase
extraidos del chat (_trabajo/u02_clase_chat.md). Saca los mensajes de
logistica, ordena los temas con titulos h2 y convierte el Markdown al HTML
que entiende html2pdf.py (cajas .clave, <pre> para los diagramas).
"""
import html
import io
import re
import sys

# Mensajes que son solo logistica (cronograma, "guarde el estado", etc.)
EXCLUIR = {1, 14, 22, 25, 41, 45, 54}

# Mensajes donde lo util empieza recien en un titulo dado
DESDE_TITULO = {
    4: "Pará acá",
    21: "Pará acá",
    43: "Las dos preguntas del 7.2",
}

# Bloques (titulo -> hasta el proximo titulo de igual o mayor nivel) a eliminar
BLOQUES_FUERA = [
    r"🖥️ El simulador",
    r"Marcador del tema 6",
    r"Lo que sigue",
    r"Dónde quedás",
    r"Dónde quedamos",
]

# Titulos h1 que abren una seccion nueva -> titulo h2 del repaso
SECCIONES = [
    (r"^Unidad 2 — Mapa de la unidad", "Mapa de la unidad"),
    (r"^Tema 1 de 10", "Tema 1 — Qué es un proceso"),
    (r"^Tema 2 de 10", "Tema 2 — Estados del proceso y el BCP"),
    (r"^Tema 3 de 10", "Tema 3 — Hilos: el modelo clásico"),
    (r"^Tema 4 de 10", "Tema 4 — Implementación de hilos"),
    (r"^Tema 5 de 10", "Tema 5 — Condiciones de carrera y regiones críticas"),
    (r"^Tema 6 de 10", "Tema 6 — Exclusión mutua con espera ocupada"),
    (r"^Tema 7 — Semáforos", "Tema 7.1 — Dormir y despertar (sleep y wakeup)"),
    (r"^7\.2 — Semáforos", "Tema 7.2 — Semáforos"),
    (r"^Tema 7\.3", "Tema 7.3 — Mutexes"),
    (r"^Tema 7\.4 — Monitores", "Tema 7.4a — Monitores"),
    (r"^Tema 7\.4b", "Tema 7.4b — Paso de mensajes y barreras"),
    (r"^Tema 8 — Planificación", "Tema 8.1 — Planificación: conceptos y métricas"),
    (r"^Tema 8\.2", "Tema 8.2 — Algoritmos por lotes: FCFS, SJF y SRTF"),
    (r"^Tema 8\.3 — Round Robin", "Tema 8.3 — Round Robin"),
    (r"^Tema 8\.3 \(continuación\)", "Tema 8.3b — Planificación por prioridades"),
    (r"^Tema 8\.3 \(cierre\)", "Tema 8.3c — Más corto a continuación, garantizada, lotería y partes equitativas"),
    (r"^Tema 8\.4", "Tema 8.4 — Planificación de tiempo real"),
    (r"^Tema 8\.5", "Tema 8.5 — Política contra mecanismo"),
    (r"^Tema 8\.6", "Tema 8.6 — Planificación de hilos"),
    (r"^Tema 9 — Problemas", "Tema 9.1 — Los filósofos comelones"),
    (r"^Tema 9\.2", "Tema 9.2 — Lectores y escritores"),
    (r"^Tema 10 — Sistemas", "Tema 10.1 — Hardware de multiprocesador"),
    (r"^10\.2 — ", "Tema 10.2 — Los tres tipos de SO multiprocesador"),
    (r"^10\.3 — ", "Tema 10.3 — Sincronización de multiprocesadores"),
    (r"^10\.4 — ", "Tema 10.4 — Planificación de multiprocesadores"),
    (r"^🏁 Cierre de la Unidad 2", "Cierre de la Unidad 2"),
]

# Titulos h1 que quedan absorbidos por la seccion anterior (no generan titulo)
ABSORBER = [r"^7\.1 — Dormir", r"^10\.1 — Hardware"]

# Lineas de conversacion que no van en un documento de repaso
RUIDO = [
    r"Decime \*\*",
    r"^Vas \*\*\d+ de 10\*\*",
    r"^¿Se entiende\?",
    r"^¿Seguimos",
    r"^¿Vamos al tema",
    r"^Te armo el diagrama",
    r"^Te abrí",
    r"^Se te abrió",
    r"^Ahí está, se te abrió",
    r"^Ya tengo el material",
]


def leer_mensajes(ruta):
    texto = io.open(ruta, encoding="utf-8").read()
    partes = re.split(r"\n\n<<<<<< MENSAJE (\d+) >>>>>>\n\n", texto)[1:]
    return [(int(partes[i]), partes[i + 1]) for i in range(0, len(partes), 2)]


def recortar_desde(texto, titulo):
    lineas = texto.split("\n")
    for i, l in enumerate(lineas):
        if re.match(r"^#{1,4} ", l) and titulo in l:
            return "\n".join(lineas[i:])
    return texto


def quitar_bloques(lineas):
    """Saca los bloques cuyo titulo coincide con BLOQUES_FUERA."""
    salida, saltando, nivel_salto, en_pre = [], False, 0, False
    for l in lineas:
        if l.startswith("```"):
            en_pre = not en_pre
        m = None if en_pre else re.match(r"^(#{1,4}) (.+)", l)
        if m:
            nivel = len(m.group(1))
            if saltando and nivel <= nivel_salto:
                saltando = False
            if not saltando and any(re.search(p, m.group(2)) for p in BLOQUES_FUERA):
                saltando, nivel_salto = True, nivel
                continue
        if not saltando:
            salida.append(l)
    return salida


def agrupar(mensajes):
    """Devuelve [(titulo_seccion, [lineas markdown])] en orden."""
    secciones = [["Introducción", []]]
    for n, cuerpo in mensajes:
        if n in EXCLUIR:
            continue
        if n in DESDE_TITULO:
            cuerpo = recortar_desde(cuerpo, DESDE_TITULO[n])
        lineas = quitar_bloques(cuerpo.split("\n"))
        en_pre = False
        for l in lineas:
            if l.startswith("```"):
                en_pre = not en_pre
                secciones[-1][1].append(l)
                continue
            if not en_pre:
                m = re.match(r"^# (.+)", l)
                if m:
                    t = m.group(1).strip()
                    nueva = next((h2 for p, h2 in SECCIONES if re.search(p, t)), None)
                    if nueva:
                        secciones.append([nueva, []])
                        continue
                    if any(re.search(p, t) for p in ABSORBER):
                        continue
                    l = "## " + t  # otro h1 interno: baja a subtitulo
                if any(re.search(p, l.strip()) for p in RUIDO):
                    continue
            secciones[-1][1].append(l)
        secciones[-1][1].append("")
    return [s for s in secciones if any(x.strip() for x in s[1])]


# ---------------------------------------------------------------- Markdown

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
    return t


def celdas(fila):
    fila = fila.strip()
    if fila.startswith("|"):
        fila = fila[1:]
    if fila.endswith("|"):
        fila = fila[:-1]
    return [c.strip() for c in fila.split("|")]


def md_a_html(lineas):
    out, i, n = [], 0, len(lineas)
    while i < n:
        l = lineas[i]
        s = l.strip()
        if s.startswith("```"):
            j, bloque = i + 1, []
            while j < n and not lineas[j].strip().startswith("```"):
                bloque.append(lineas[j].rstrip())
                j += 1
            while bloque and not bloque[0].strip():
                bloque.pop(0)
            while bloque and not bloque[-1].strip():
                bloque.pop()
            if bloque:
                out.append("<pre>" + html.escape("\n".join(bloque), quote=False) + "</pre>")
            i = j + 1
            continue
        if not s:
            i += 1
            continue
        if re.fullmatch(r"-{3,}|\*{3,}", s):
            out.append("<hr/>")
            i += 1
            continue
        m = re.match(r"^(#{2,6}) (.+)", s)
        if m:
            nivel = min(len(m.group(1)) + 1, 4)  # ## -> h3, ### -> h4
            titulo = m.group(2).strip()
            if re.match(r"^(Pará acá|Dos preguntas|Una pregunta)", titulo):
                titulo = "Preguntas de control"
            out.append(f"<h{nivel}>{inline(titulo)}</h{nivel}>")
            i += 1
            continue
        if s.startswith("|"):
            filas = []
            while i < n and lineas[i].strip().startswith("|"):
                filas.append(lineas[i])
                i += 1
            filas = [f for f in filas if not re.fullmatch(r"\|?[\s:\-|]+\|?", f.strip())]
            if filas:
                h = "".join(f"<th>{inline(c)}</th>" for c in celdas(filas[0]))
                cuerpo = "".join(
                    "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in celdas(f)) + "</tr>"
                    for f in filas[1:])
                out.append(f"<table><tr>{h}</tr>{cuerpo}</table>")
            continue
        if s.startswith(">"):
            bloque = []
            while i < n and lineas[i].strip().startswith(">"):
                bloque.append(lineas[i].strip().lstrip(">").strip())
                i += 1
            # se unen antes de convertir, para que una negrita que cruza dos lineas no se rompa
            texto = inline("\x00".join(b for b in bloque if b)).replace("\x00", "<br/>")
            out.append('<div class="clave">' + texto + "</div>")
            continue
        if re.match(r"^([-*•]|\d+[.)]) ", s):
            ordenada = bool(re.match(r"^\d+[.)] ", s))
            items = []
            while i < n:
                t = lineas[i].strip()
                m2 = re.match(r"^([-*•]|\d+[.)]) (.+)", t)
                if not m2:
                    if t and lineas[i].startswith("   ") and items:
                        items[-1] += " " + t  # continuacion del item
                        i += 1
                        continue
                    break
                items.append(m2.group(2))
                i += 1
            tag = "ol" if ordenada else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
            continue
        parrafo = [s]
        i += 1
        while i < n:
            t = lineas[i].strip()
            if (not t or t.startswith(("```", "#", "|", ">")) or re.fullmatch(r"-{3,}", t)
                    or re.match(r"^([-*•]|\d+[.)]) ", t)):
                break
            parrafo.append(t)
            i += 1
        out.append("<p>" + " ".join(inline(p) for p in parrafo) + "</p>")
    return "\n".join(out)


PORTADA = """<h1>Unidad 2 — Procesos, hilos, concurrencia y planificación</h1>
<p class="sub">Sistemas Operativos — UTN FRM — Repaso de la clase completa en el chat: 10 temas, correcciones y cierre</p>
<div class="clave"><b>Cómo leer este repaso.</b> Es la clase tal como se dio, tema por tema, con los mismos
diagramas. Al final de cada tema están las <b>preguntas de control</b> y, a continuación, su <b>corrección</b>:
ahí quedaron marcados los errores que conviene no repetir. La referencia al Tanenbaum está al final
de cada tema. El resumen de todo está en el <b>Cierre de la Unidad 2</b>, en las últimas páginas.</div>
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
