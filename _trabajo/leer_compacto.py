# Muestra un rango de lineas del texto extraido, uniendo lineas cortadas en parrafos
import sys, io, re
f, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
ls = io.open(f, encoding='utf-8').read().split('\n')[a-1:b]
out, cur = [], ''
for l in ls:
    s = l.strip()
    if s.startswith('====='):
        out.append(cur); cur=''; out.append(s); continue
    if not s: out.append(cur); cur=''; continue
    if cur.endswith('-'): cur = cur[:-1] + s
    else: cur = (cur + ' ' + s).strip()
out.append(cur)
print('\n'.join(x for x in out if x))
