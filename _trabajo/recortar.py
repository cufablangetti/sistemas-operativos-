"""Recorta rangos de paginas de un PDF a otro PDF.

Uso: recortar.py entrada.pdf salida.pdf ini1-fin1 [ini2-fin2 ...]   (paginas PDF, 1-based, inclusive)
Al terminar muestra la primera y la ultima linea de cada rango, para comprobar el corte.
"""
import sys
import pymupdf

src, dst = sys.argv[1], sys.argv[2]
rangos = []
for r in sys.argv[3:]:
    a, b = r.split("-")
    rangos.append((int(a), int(b)))

doc = pymupdf.open(src)
out = pymupdf.open()
for a, b in rangos:
    out.insert_pdf(doc, from_page=a - 1, to_page=b - 1)
out.save(dst)

print(f"OK -> {dst}  ({out.page_count} paginas)")
print("\n--- Comprobacion del recorte ---")
pos = 0
for a, b in rangos:
    n = b - a + 1
    prim = " ".join(out[pos].get_text().split())[:100]
    ult = " ".join(out[pos + n - 1].get_text().split())[:100]
    print(f"\nRango PDF {a}-{b}  (impresas {a-30}-{b-30})")
    print(f"  primera -> {prim}")
    print(f"  ultima  -> {ult}")
    pos += n
out.close()
doc.close()
