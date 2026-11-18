# -*- coding: utf-8 -*-
"""Verifica los ejercicios numericos del cuestionario de la U3."""
import math
f = 0
def ok(c, m):
    global f
    print(("OK   " if c else "FALLA") + " " + m)
    if not c: f += 1

# C8: segunda oportunidad, 1 KB, 16 bits, instante 300, escritura en 0x1E9C
d = 0x1E9C; pag, desp = d >> 10, d & 0x3FF
ok(pag == 7 and desp == 0x29C == 668, f"C8a: pagina {pag}, desp {desp} (0x{desp:X})")
tabla = {3: [150, 1, 0, 1, 12], 4: [210, 0, 0, 1, 5], 7: [None, 0, 0, 0, None], 8: [120, 1, 1, 1, 9], 13: [180, 0, 1, 1, 2], 16: [260, 1, 0, 1, 14]}
cola = sorted([p for p in tabla if tabla[p][3]], key=lambda p: tabla[p][0])
salvadas = []
while True:
    p = cola.pop(0)
    if tabla[p][1]:
        tabla[p][1] = 0; tabla[p][0] = 300; cola.append(p); salvadas.append(p)
    else:
        vict = p; break
marco = tabla[vict][4]
tabla[vict][3] = 0; tabla[vict][4] = None
tabla[7] = [300, 1, 1, 1, marco]; cola.append(7)
ok(salvadas == [8, 3] and vict == 13 and marco == 2, f"C8b: salvadas {salvadas}, victima {vict} (M=1 -> disco), marco {marco}")
fis = (marco << 10) | desp
ok(fis == 0x0A9C == 2716, f"C8d: fisica 0x{fis:04X} = {fis}")
final = " -> ".join(f"{p}({tabla[p][1]})" for p in reversed(cola))
ok(final == "7(1) -> 3(0) -> 8(0) -> 16(1) -> 4(0)", "C8e: cola final " + final)

# C9: conteo de fallos con 3 marcos
cad = [1, 3, 0, 3, 5, 6, 3, 1, 6, 4, 5, 3]
def fifo(c, n):
    m, q, fa = set(), [], 0
    for x in c:
        if x in m: continue
        fa += 1
        if len(m) == n: m.remove(q.pop(0))
        m.add(x); q.append(x)
    return fa
def lru(c, n):
    m, fa = [], 0
    for x in c:
        if x in m: m.remove(x); m.append(x); continue
        fa += 1
        if len(m) == n: m.pop(0)
        m.append(x)
    return fa
def opt(c, n):
    m, fa = [], 0
    for i, x in enumerate(c):
        if x in m: continue
        fa += 1
        if len(m) == n:
            fut = c[i + 1:]
            v = max(m, key=lambda p: fut.index(p) if p in fut else 10**9)
            m.remove(v)
        m.append(x)
    return fa
r = (fifo(cad, 3), lru(cad, 3), opt(cad, 3))
print("   C9 FIFO/LRU/OPT =", r, " con 4 marcos:", (fifo(cad, 4), lru(cad, 4), opt(cad, 4)))
ok(r[2] <= r[1] and r[2] <= r[0], "C9: el optimo es el minimo")

# C10: multinivel 10|10|12
v = 0x0080A7F4
ok((v >> 22, (v >> 12) & 0x3FF, v & 0xFFF) == (2, 10, 0x7F4), f"C10a: TP1 {v>>22}, TP2 {(v>>12)&0x3FF}, desp 0x{v&0xFFF:X} = {v&0xFFF}")
ok((v >> 22) * 4 == 8, "C10a: trozo de 8 a 12 MB")
ok(2**20 * 4 == 4 * 2**20, "C10b: un nivel = 4 MB")
tablas = 1 + 1 + 2 + 1
ok(tablas * 4 == 20, f"C10c: {tablas} tablas = {tablas*4} KB")

# C11: Pentium
sel = 0x0035
ok((sel >> 3, (sel >> 2) & 1, sel & 3) == (6, 1, 1), f"C11a: indice {sel>>3}, TI {(sel>>2)&1} (LDT), RPL {sel&3}")
tam = 3 * 4096
ok(0x2F10 < tam and 0x3010 >= tam and tam == 12288, f"C11b: tamano {tam}; 0x2F10={0x2F10} entra, 0x3010={0x3010} trap")
lin = 0x00A00000 + 0x2F10
ok(lin == 0x00A02F10 and (lin >> 22, (lin >> 12) & 0x3FF, lin & 0xFFF) == (2, 0x202, 0xF10), f"C11c: lineal 0x{lin:08X}, Dir {lin>>22}, Pag {(lin>>12)&0x3FF} (0x202), Desp 0xF10")
ok((0x01C3D << 12) | 0xF10 == 0x01C3DF10, "C11d: fisica 0x01C3DF10")

# C12: tamano de pagina
s, e = 2 * 2**20, 4
p = math.sqrt(2 * s * e)
ok(p == 4096, f"C12a: p optimo {p:.0f}")
sob = lambda p: s * e / p + p / 2
ok(sob(4096) == 4096 and sob(1024) == 8704, f"C12b: sobrecarga 4 KB = {sob(4096):.0f} B; 1 KB = {sob(1024):.0f} B")

# C13: segmentacion
seg = {0: (1200, 500, "X"), 1: (3000, 2000, "RW"), 2: (800, 300, "R")}
def tr(s_, d_, op):
    b, l, pr = seg[s_]
    if d_ >= l: return "trap limite"
    if {"leer": "R", "escribir": "W", "ejecutar": "X"}[op] not in pr: return "trap proteccion"
    return b + d_
res = [tr(2, 299, "leer"), tr(1, 2000, "escribir"), tr(0, 120, "ejecutar"), tr(2, 10, "escribir")]
ok(res == [1099, "trap limite", 1320, "trap proteccion"], f"C13: {res}")

# D15: envejecimiento vs NFU
R = [(1, 0, 1), (0, 1, 1), (1, 1, 0), (0, 0, 1)]
env, nfu = [0, 0, 0], [0, 0, 0]
for fila in R:
    for i, b in enumerate(fila):
        env[i] = (env[i] >> 1) | (b << 7); nfu[i] += b
ok(env == [80, 96, 176] and nfu == [2, 2, 3], f"D15: envejecimiento {[format(x,'08b') for x in env]} = {env}; NFU {nfu}")

# E19: WSClock, tau 500, t 3000
pags = [("A", 2300, 0, 1), ("B", 2900, 1, 0), ("C", 2600, 0, 0), ("D", 2200, 0, 0)]
vic, escr = None, []
for n, u, r_, m in pags:
    if r_: continue
    if 3000 - u > 500:
        if m: escr.append(n)
        else: vic = n; break
ok(vic == "D" and escr == ["A"], f"E19: victima {vic}, escritura planificada {escr}")

# F21: cache 2048 lineas de 64 B
a = 0x00012345
ok((a & 0x3F, (a >> 6) & 0x7FF) == (5, 1165), f"F21: byte {a&0x3F}, linea {(a>>6)&0x7FF} (0x{(a>>6)&0x7FF:X})")
print(f"\n{f} fallos")
