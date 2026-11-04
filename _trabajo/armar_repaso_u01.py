# -*- coding: utf-8 -*-
"""
armar_repaso_u01.py  entrada.md  salida.html

Igual que armar_repaso_u02.py, con la configuracion de la Unidad 1:
la clase completa extraida del chat (_trabajo/u01_clase_chat.md) pasa a
unidades/u01-introduccion/repaso_u01.html, listo para html2pdf.py.
"""
import io
import sys

import armar_repaso_u02 as base

# logistica, entrega de visualizaciones y el cuestionario (no va en el repaso)
base.EXCLUIR = {6, 11, 12, 23, 26, 31, 32, 33, 34, 35, 36}

base.DESDE_TITULO = {
    0: "Unidad 1 — Mapa de la unidad",
    14: "Pará acá",
    28: "Pará acá",
}

base.SECCIONES = [
    (r"^Unidad 1 — Mapa de la unidad", "Mapa de la unidad"),
    (r"^Tema 1 de 8", "Tema 1 — ¿Qué es un sistema operativo?"),
    (r"^Tema 2 de 8", "Tema 2 — Repaso del hardware"),
    (r"^Tema 3 de 8", "Tema 3 — Las tres formas de hacer E/S"),
    (r"^Tema 4 de 8", "Tema 4 — El arranque y el sector de booteo"),
    (r"^Tema 5 de 9", "Tema 5 — Ensamblador e interrupciones del 8086"),
    (r"^Tema 6 de 9", "Tema 6 — Llamadas al sistema"),
    (r"^Tema 7 de 9", "Tema 7 — Historia por generaciones"),
    (r"^Tema 8 de 9", "Tema 8 — Tipos de sistemas operativos"),
    (r"^Tema 9 de 9", "Tema 9 — Estructuras de los sistemas operativos"),
    (r"^Cierre — Unidad 1", "Cierre de la Unidad 1"),
]
base.ABSORBER = []
base.BLOQUES_FUERA = base.BLOQUES_FUERA + [r"Las 4 visualizaciones"]
base.RUIDO = base.RUIDO + [r"^Vas por la mitad", r"^Van tres, cortitas"]

base.PORTADA = """<h1>Unidad 1 — Introducción, hardware y estructura de los SO</h1>
<p class="sub">Sistemas Operativos — UTN FRM — Repaso de la clase completa en el chat: 9 temas, correcciones y cierre</p>
<div class="clave"><b>Cómo leer este repaso.</b> Es la clase tal como se dio, tema por tema, con los mismos
diagramas y las re-explicaciones que pediste. Al final de cada tema están las <b>preguntas de control</b> y su
<b>corrección</b>, donde quedaron marcados los errores que conviene no repetir. La referencia al Tanenbaum está al
final de cada tema. El resumen de todo está en el <b>Cierre de la Unidad 1</b>, en las últimas páginas.</div>
"""

# La explicacion de "llamadas a procedimiento" (msg 22) se pidio durante el tema 6:
# va antes del mensaje 21, que corrige el tema 6 y abre el tema 7.
ORDEN_ANTES = {22: 21}


RESUMEN = "repaso_u01_version_resumida.html"


def anexo_resumen():
    """La version resumida anterior trae datos del libro que en el chat no se
    dijeron tal cual (comandos, POSIX, Win32, errno...). Va completa al final."""
    import os
    import re
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), RESUMEN)
    h = io.open(ruta, encoding="utf-8").read()
    h = re.sub(r"</?(html|body)>", "", h)
    h = re.sub(r"<h1>.*?</h1>\s*<p class=\"sub\">.*?</p>", "", h, flags=re.S)

    def bajar(m):
        nivel = min(int(m.group(1)) + 1, 4)
        texto = m.group(2)
        if nivel == 3:
            texto = "Resumen · " + texto
        return f"<h{nivel}>{texto}</h{nivel}>"
    h = re.sub(r"<h([2-4])>(.*?)</h\1>", bajar, h, flags=re.S)
    return ('<hr/><h2>Anexo — Resumen condensado de la unidad</h2>\n'
            '<div class="clave">La misma unidad en versión corta (la que se armó al cerrar la U1). '
            'Además de servir para un repaso rápido, tiene datos del libro que en el chat no se dijeron '
            'tal cual: la tabla de llamadas POSIX, POSIX contra Win32, <code>errno</code>, la salida de '
            '<code>strace</code>, el exokernel, Babbage y los comandos de las cartillas.</div>\n' + h)


def main():
    entrada, salida = sys.argv[1], sys.argv[2]
    mensajes = base.leer_mensajes(entrada)
    for mover, antes_de in ORDEN_ANTES.items():
        m = next(x for x in mensajes if x[0] == mover)
        mensajes.remove(m)
        i = next(k for k, x in enumerate(mensajes) if x[0] == antes_de)
        mensajes.insert(i, m)
    secciones = base.agrupar(mensajes)
    partes = ["<html><body>", base.PORTADA]
    for k, (titulo, lineas) in enumerate(secciones):
        if titulo == "Introducción":
            continue
        if k > 1:
            partes.append("<hr/>")
        partes.append(f"<h2>{base.inline(titulo)}</h2>")
        partes.append(base.md_a_html(lineas))
    partes.append(anexo_resumen())
    partes.append("</body></html>")
    io.open(salida, "w", encoding="utf-8", newline="\n").write("\n".join(partes))
    for titulo, lineas in secciones:
        print(f"{len(lineas):5d} líneas  {titulo}")


if __name__ == "__main__":
    main()
