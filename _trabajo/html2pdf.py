"""Convierte un HTML a PDF con PyMuPDF Story.

Uso: html2pdf.py entrada.html salida.pdf
Pensado para los documentos de repaso de cada unidad.
"""
import sys
import pymupdf

src, dst = sys.argv[1], sys.argv[2]

with open(src, encoding="utf-8") as f:
    html = f.read()

CSS = """
body      { font-family: sans-serif; font-size: 9.5pt; line-height: 1.45; color: #1b1f24; }
h1        { font-size: 19pt; color: #4a35a8; margin: 0 0 2pt 0; }
h2        { font-size: 13.5pt; color: #4a35a8; margin: 16pt 0 5pt 0; }
h3        { font-size: 11pt; color: #2d3440; margin: 11pt 0 3pt 0; }
h4        { font-size: 9.5pt; color: #5b6572; margin: 8pt 0 2pt 0; }
p         { margin: 0 0 5pt 0; }
ul, ol    { margin: 3pt 0 6pt 0; }
li        { margin: 1pt 0; }
pre       { font-family: monospace; font-size: 7.3pt; line-height: 1.32;
            background: #f2f3f6; padding: 6pt; margin: 5pt 0; color: #1b1f24; }
code      { font-family: monospace; font-size: 8.6pt; background: #f2f3f6; }
table     { width: 100%; margin: 5pt 0 8pt 0; font-size: 8.6pt; }
th        { background: #e9e6f7; text-align: left; padding: 3pt 5pt; font-size: 8pt; color: #3a2b80; }
td        { padding: 3pt 5pt; border-bottom: 1px solid #dcdfe4; vertical-align: top; }
.sub      { color: #5b6572; font-size: 9pt; margin: 0 0 10pt 0; }
.ref      { color: #5b6572; font-size: 8.3pt; margin: 4pt 0 10pt 0; }
.clave    { background: #f4f1fd; padding: 6pt 8pt; margin: 6pt 0; }
.ojo      { background: #fdf3e6; padding: 6pt 8pt; margin: 6pt 0; }
.err      { background: #fdeeee; padding: 6pt 8pt; margin: 6pt 0; }
.ej       { background: #eef7f1; padding: 6pt 8pt; margin: 6pt 0; }
b, strong { color: #1b1f24; }
hr        { margin: 12pt 0; }
"""

story = pymupdf.Story(html=html, user_css=CSS)
writer = pymupdf.DocumentWriter(dst)
rect = pymupdf.paper_rect("a4")
area = rect + (48, 46, -48, -46)

paginas = 0
more = 1
while more:
    dev = writer.begin_page(rect)
    more, _ = story.place(area)
    story.draw(dev)
    writer.end_page()
    paginas += 1
    if paginas > 200:
        print("ERROR: demasiadas paginas, se corta")
        break
writer.close()

print(f"OK -> {dst}  ({paginas} paginas)")
