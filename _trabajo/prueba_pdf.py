"""Prueba: generar un PDF desde HTML con PyMuPDF Story."""
import pymupdf

HTML = """
<html><body>
<h1>Prueba</h1>
<p>Parrafo normal con <b>negrita</b>.</p>
<pre>+-----------+
| diagrama  |
+-----------+</pre>
<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>
</body></html>
"""

CSS = """
body { font-family: sans-serif; font-size: 10pt; }
pre  { font-family: monospace; font-size: 8pt; }
"""

try:
    story = pymupdf.Story(html=HTML, user_css=CSS)
    writer = pymupdf.DocumentWriter("_trabajo/prueba.pdf")
    rect = pymupdf.paper_rect("a4")
    area = rect + (50, 50, -50, -50)
    more = 1
    while more:
        dev = writer.begin_page(rect)
        more, _ = story.place(area)
        story.draw(dev)
        writer.end_page()
    writer.close()
    print("OK: PyMuPDF Story funciona")
except Exception as e:
    print("FALLO Story:", type(e).__name__, e)
