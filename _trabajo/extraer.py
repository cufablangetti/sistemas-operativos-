"""Extrae texto de un PDF a un .txt. Uso: extraer.py entrada.pdf salida.txt [inicio] [fin] (1-based, inclusive)"""
import sys
import pymupdf

src, dst = sys.argv[1], sys.argv[2]
doc = pymupdf.open(src)
ini = int(sys.argv[3]) if len(sys.argv) > 3 else 1
fin = int(sys.argv[4]) if len(sys.argv) > 4 else doc.page_count

with open(dst, "w", encoding="utf-8") as f:
    for i in range(ini - 1, min(fin, doc.page_count)):
        f.write(f"\n===== [PDF pag {i+1}] =====\n")
        f.write(doc[i].get_text())
print(f"OK -> {dst}  (paginas {ini}-{fin} de {doc.page_count})")
