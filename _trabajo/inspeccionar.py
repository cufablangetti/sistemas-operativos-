"""Inspecciona los PDF de material_so: paginas, texto extraible, primeras lineas."""
import sys, glob, os
import pymupdf

for path in sorted(glob.glob(os.path.join("material_so", "*.pdf"))):
    doc = pymupdf.open(path)
    n = doc.page_count
    # muestreo de texto
    idx = sorted(set([0, min(1, n-1), n//4, n//2, (3*n)//4, n-1]))
    chars = 0
    for i in idx:
        chars += len(doc[i].get_text().strip())
    prom = chars / max(1, len(idx))
    print("=" * 90)
    print(f"ARCHIVO: {os.path.basename(path)}")
    print(f"  paginas: {n} | chars/pag (muestra de {len(idx)}): {prom:.0f} | "
          f"{'TEXTO OK' if prom > 100 else 'POSIBLE ESCANEADO'}")
    first = doc[0].get_text().strip()
    print("  --- pag 1 (primeros 700 chars) ---")
    print("  " + (first[:700].replace("\n", "\n  ") if first else "(sin texto)"))
    doc.close()
