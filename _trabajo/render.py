"""Renderiza paginas de un PDF a PNG. Uso: render.py entrada.pdf prefijo pag1 pag2 ..."""
import sys, os
import pymupdf

src, pref = sys.argv[1], sys.argv[2]
pags = [int(x) for x in sys.argv[3:]]
os.makedirs(os.path.dirname(pref) or ".", exist_ok=True)
doc = pymupdf.open(src)
for p in pags:
    pix = doc[p - 1].get_pixmap(dpi=130)
    out = f"{pref}_p{p:03d}.png"
    pix.save(out)
    print(out)
