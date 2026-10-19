"""Calcula el desfase entre pagina impresa y pagina PDF del Tanenbaum.

Busca en el encabezado/pie de cada pagina PDF un numero suelto (el folio impreso)
y lo compara con el numero de pagina del PDF.
"""
import re
import pymupdf

SRC = "material_so/2-Sistemas operativos moderno 3ed Tanenbaum.pdf"
doc = pymupdf.open(SRC)

def folio(i):
    """Devuelve el folio impreso detectado en la pagina PDF i (0-based), o None."""
    lineas = [l.strip() for l in doc[i].get_text().splitlines() if l.strip()]
    # descartamos la marca de agua
    lineas = [l for l in lineas if "FreeLibros" not in l]
    if not lineas:
        return None
    candidatas = lineas[:2] + lineas[-3:]
    for l in candidatas:
        if re.fullmatch(r"\d{1,4}", l):
            return int(l)
    return None

print("--- Muestreo de folios (PDF -> impresa) ---")
filas = []
for i in range(24, doc.page_count, 1):
    f = folio(i)
    if f is not None:
        filas.append((i + 1, f, (i + 1) - f))

from collections import Counter
cnt = Counter(d for _, _, d in filas)
print("Desfases detectados (PDF - impresa) y su frecuencia:")
for d, c in cnt.most_common(10):
    print(f"  desfase {d:>4} : {c} paginas")

print("\n--- Verificacion en inicios de capitulo (pagina impresa segun el indice) ---")
# cap -> pagina impresa de inicio, segun el indice general
caps = {1: 1, 2: 83, 3: 175, 4: 255, 5: 329, 6: 433, 7: 467, 8: 523, 9: 611, 10: 719, 11: 813}
desfase_mas_comun = cnt.most_common(1)[0][0]
for cap, imp in caps.items():
    pdf = imp + desfase_mas_comun
    if pdf - 1 >= doc.page_count:
        continue
    txt = " ".join(doc[pdf - 1].get_text().split())
    print(f"  cap {cap:>2} | impresa {imp:>4} -> PDF {pdf:>4} | folio leido: {folio(pdf-1)} | {txt[:90]}")
doc.close()
