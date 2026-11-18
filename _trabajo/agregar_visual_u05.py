# -*- coding: utf-8 -*-
"""agregar_visual_u05.py archivo.html "Título" "Descripción larga (índice)" "Tipo" "Título corto (mapa)" "Nota corta (mapa)"
Agrega un gráfico de la U5 al final de visuales/index.html (sección Unidad 5, la crea si no existe)
y a la lista «Unidad 5» de la pestaña 🎛 Gráficos de visuales/mapa_grafico.html, sin tocar lo existente."""
import io, os, sys, html
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
arch, titulo, desc, tipo, tcorto, nota = sys.argv[1:7]
ruta = f"../unidades/u05-entrada-salida/visuales/{arch}"

p = os.path.join(RAIZ, "visuales", "index.html")
s = io.open(p, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in s else "\n"
if ruta in s:
    print("ya estaba en el índice")
else:
    item = (f'  <a class="item" href="{ruta}">{nl}    <strong>{html.escape(titulo)}</strong>{nl}'
            f'    <span>{html.escape(desc)}</span>{nl}  </a>{nl}')
    if "<h2>Unidad 5" not in s:
        item = f"  <h2>Unidad 5 &mdash; Entrada/salida</h2>{nl}" + item
    fin = "</div>" + nl + "</body>"
    assert s.count(fin) == 1, "no encuentro el final del índice"
    s = s.replace(fin, item + fin)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print("agregado al índice")

p = os.path.join(RAIZ, "visuales", "mapa_grafico.html")
s = io.open(p, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in s else "\n"
esc = lambda x: x.replace('"', '\\"')
fila = f'["{ruta}", "{esc(tipo)}", "{esc(tcorto)}", "{esc(nota)}"]'
if ruta in s:
    print("ya estaba en el mapa gráfico")
else:
    cierre = "]" + nl + "  ]]" + nl + "];"
    assert s.count(cierre) == 1, "no encuentro el final de la lista de gráficos"
    if '["Unidad 5", [' in s:
        s = s.replace(cierre, "]," + nl + "    " + fila + nl + "  ]]" + nl + "];")
    else:
        s = s.replace(cierre, "]" + nl + "  ]]," + nl + '  ["Unidad 5", [' + nl + "    " + fila + nl + "  ]]" + nl + "];")
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print("agregado al mapa gráfico")
