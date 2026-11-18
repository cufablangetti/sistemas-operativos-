# -*- coding: utf-8 -*-
"""
armar_repaso_u04.py  entrada.md  salida.html

Arma el HTML del repaso de la Unidad 4 a partir de los mensajes de la clase
extraidos del chat con extraer_chat.py (_trabajo/u04_clase_chat.md).
Reusa el conversor Markdown -> HTML de armar_repaso_u02.py.
"""
import io, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from armar_repaso_u02 import md_a_html, inline, leer_mensajes, recortar_desde

# Mensajes de logistica, de herramientas o de estado ("lo verifico", "lo enlazo"...)
EXCLUIR_CORTOS = 400                 # menos caracteres = mensaje de herramientas
EXCLUIR = {1}                        # duracion de la unidad
DESDE_TITULO = {}
TITULO_EXTRA = {}
# Titulos de bloque que se sacan (descripcion de los simuladores, logistica, comentarios de formato)
FUERA = [r"🎛", r"Sobre el formato", r"Un comentario de tutor", r"¿Cómo seguimos\?"]
SECCIONES = [
    (r"^Mapa de la unidad", "Mapa de la unidad"),
    (r"^Tema 1 de 11", "Tema 1 — Archivos"),
    (r"^Tema 2 de 11", "Tema 2 — Directorios"),
    (r"^Tema 3 de 11", "Tema 3 — Implementación: distribución del disco y asignación (contigua, enlazada, FAT)"),
    (r"^Tema 4 de 11", "Tema 4 — Nodos-i"),
    (r"^Tema 5 de 11", "Tema 5 — Implementación de directorios y vínculos"),
    (r"^Tema 6 de 11", "Tema 6 — LFS, bitácora y VFS"),
    (r"^Tema 7 de 11", "Tema 7 — Administración del espacio en disco"),
    (r"^Tema 8 de 11", "Tema 8 — Respaldos, consistencia (fsck) y rendimiento"),
    (r"^Tema 9 de 11", "Tema 9 — Ejemplos: ISO 9660, MS-DOS, UNIX V7, NTFS y NFS"),
    (r"^Tema 10 de 11", "Tema 10 — Protección"),
    (r"^Tema 11 de 11", "Tema 11 — El sistema de archivos de Linux y los comandos de la cátedra"),
    (r"Cierre de la Unidad 4", "Cierre de la Unidad 4"),
]
ABSORBER = [r"^Unidad 4: Sistemas de archivos$"]
RUIDO = [r"^Escribí \*\*«", r"^Te abrí", r"^Te dejé abierto", r"^Cuando quieras", r"^Decime \*\*", r"^¿Seguimos con", r"^¿Seguimos\?"]


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


PORTADA = """<h1>Unidad 4 — Sistemas de archivos</h1>
<p class="sub">Sistemas Operativos — UTN FRM — Repaso de la clase completa en el chat: 11 temas, correcciones y cierre</p>
<div class="clave"><b>Cómo leer este repaso.</b> Es la clase tal como se dio, tema por tema, con los mismos
diagramas y ejemplos. Al final de cada tema están las <b>preguntas de control</b> y, a continuación, su
<b>corrección</b>: ahí quedaron marcados los errores que conviene no repetir (⚠️). La referencia al Tanenbaum
está en cada bloque. Los simuladores interactivos de cada tema están en <b>visuales/index.html</b>.
El resumen de todo y <b>lo que más se toma</b> está en el <b>Cierre de la Unidad 4</b>, en las últimas páginas.</div>
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
