# -*- coding: utf-8 -*-
"""extraer_chat.py sesion.jsonl salida.md [texto_de_inicio]
Saca los mensajes de texto del asistente (sin herramientas ni razonamiento)
de una transcripcion de Claude Code, en orden, separados por
<<<<<< MENSAJE n >>>>>> (formato que leen los armar_repaso_uNN.py).
Si se da texto_de_inicio, arranca en el primer mensaje del usuario que lo contiene."""
import io, json, sys
src, dst = sys.argv[1], sys.argv[2]
inicio = sys.argv[3].lower() if len(sys.argv) > 3 else None
mensajes, activo, vistos = [], inicio is None, set()
for linea in io.open(src, encoding="utf-8"):
    try:
        d = json.loads(linea)
    except Exception:
        continue
    if d.get("isSidechain") or d.get("type") not in ("user", "assistant"):
        continue
    m = d.get("message") or {}
    cont = m.get("content")
    textos = [cont] if isinstance(cont, str) else [c.get("text", "") for c in (cont or []) if isinstance(c, dict) and c.get("type") == "text"]
    texto = "\n".join(t for t in textos if t).strip()
    if not texto:
        continue
    if d["type"] == "user":
        if not activo and inicio in texto.lower():
            activo = True
        continue
    if activo and d.get("uuid") not in vistos:
        vistos.add(d.get("uuid"))
        mensajes.append(texto)
with io.open(dst, "w", encoding="utf-8", newline="\n") as f:
    for i, t in enumerate(mensajes):
        f.write(f"\n\n<<<<<< MENSAJE {i} >>>>>>\n\n{t}")
print(len(mensajes), "mensajes")
