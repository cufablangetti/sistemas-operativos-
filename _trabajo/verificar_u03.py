# -*- coding: utf-8 -*-
"""Verifica los ejemplos numericos de notebooklm_u03.md (Unidad 3, memoria)."""
import math

fallos = 0


def ok(c, m):
    global fallos
    print(("OK   " if c else "FALLA") + " " + m)
    if not c:
        fallos += 1


# 1) multiprogramacion (libro 2.1.7): 512 MB, SO 128, 128 por programa
for n, esp in ((3, 0.488), (7, 0.790), (11, 0.914)):
    u = 1 - 0.8 ** n
    ok(abs(u - esp) < 1e-3, f"1 - 0,8^{n} = {u:.3f}")

# 2) base y limite (fig. 3-3)
base, lim = 16384, 16384
ok(base + 28 == 16412, "JMP 28 -> 16412")
ok(not (20000 < lim), "direccion 20000 >= limite -> fallo")

# 3) algoritmos de asignacion
def asignar(huecos, pedidos, algo):
    h = list(huecos)
    res, ult = [], 0
    for p in pedidos:
        cand = [i for i, x in enumerate(h) if x >= p]
        if algo == "primer":
            i = cand[0]
        elif algo == "mejor":
            i = min(cand, key=lambda k: (h[k], k))
        elif algo == "peor":
            i = max(cand, key=lambda k: (h[k], -k))
        elif algo == "siguiente":
            orden = list(range(ult, len(h))) + list(range(0, ult))
            i = next(k for k in orden if h[k] >= p)
            ult = i
        res.append(huecos[i])
        h[i] -= p
    return res

H = [10, 4, 20, 18, 7, 9, 12, 15]
P = [12, 10, 9]
esperado = {"primer": [20, 10, 18], "mejor": [12, 10, 9], "peor": [20, 18, 15], "siguiente": [20, 18, 9]}
for a, e in esperado.items():
    r = asignar(H, P, a)
    ok(r == e, f"{a} ajuste: {r}")
# fig. 3-6: huecos (inicio, largo) 5/3, 18/2, 29/3 ; pedido de 2
ok(asignar([3, 2, 3], [2], "primer") == [3] and asignar([3, 2, 3], [2], "mejor") == [2], "fig 3-6: primer -> hueco en 5, mejor -> hueco en 18")

# 4) mapa de bits: 32 MB en unidades de 4 KB
unidades = 32 * 2**20 // (4 * 2**10)
ok(unidades == 8192 and unidades // 8 == 1024, "mapa de bits de 32 MB / 4 KB = 8192 bits = 1 KB")

# 5) traduccion con la fig. 3-9 (paginas de 4 KB)
tabla = {0: 2, 1: 1, 2: 6, 3: 0, 4: 4, 5: 3, 9: 5, 11: 7}
def traducir(v, tam, t):
    pag, des = divmod(v, tam)
    return None if pag not in t else t[pag] * tam + des
ok(traducir(0, 4096, tabla) == 8192, "fig 3-9: 0 -> 8192")
ok(traducir(8192, 4096, tabla) == 24576, "fig 3-9: 8192 -> 24576")
ok(traducir(20500, 4096, tabla) == 12308, "fig 3-9: 20500 -> 12308")
ok(traducir(32780, 4096, tabla) is None, "fig 3-9: 32780 -> fallo de pagina (pagina 8)")
ok(traducir(8196, 4096, tabla) == 24580, "fig 3-10: 8196 -> 24580")
ok(traducir(32780, 4096, {**tabla, 8: 1}) == 4108, "tras desalojar el marco 1: 32780 -> 4108")

# 6) estilo catedra
v = 0x2C3A
pag, des = divmod(v, 1024)
ok((pag, des) == (11, 58), "0x2C3A con 1 KB: pagina 11, desplazamiento 58")
ok(5 * 1024 + 58 == 0x143A == 5178, "marco 5 -> 0x143A = 5178")
pag, des = divmod(0x6047, 2048)
ok(pag == 12 and 17 * 2048 + des == 0x8847, "practica: 0x6047 con 2 KB -> pagina 12; marco 17 -> 0x8847")
ok(0xB915 // 2048 == 23, "practica: 0xB915 con 2 KB -> pagina 23")
ok(0x30AE // 4096 == 3, "practica: 0x30AE con 4 KB -> pagina 3")
ok(0b0101010100101001 // 1024 == 21, "examen: 0101 0101 0010 1001 con 1 KB -> pagina 21")

# 7) multinivel
v = 0x00403004
tp1, tp2, d = v >> 22, (v >> 12) & 0x3FF, v & 0xFFF
ok((tp1, tp2, d) == (1, 3, 4), f"0x00403004 -> TP1={tp1}, TP2={tp2}, desplazamiento={d} (el libro en espanol dice TP2=2: errata)")
ok(v == 4206596 and 4 * 2**20 + 3 * 4096 == 4206592, "4.206.596 = 4M + 12.288 + 4")

# 8) tamanos de tablas
ok(2**32 // 4096 == 2**20, "32 bits / 4 KB = 2^20 paginas")
ok(2**20 * 4 == 4 * 2**20, "tabla de un nivel con entradas de 4 bytes = 4 MB por proceso")
ok(2**52 * 8 == 2**55 and 2**55 / 2**50 == 32, "64 bits / 4 KB: 2^52 entradas x 8 bytes = 32 PB")
ok(2**30 // 4096 == 262144, "tabla invertida para 1 GB con 4 KB: 262.144 entradas")

# 9) reemplazo de paginas
def simular(refs, n, algo):
    marcos, fallos_, ultimo, llegada = [], 0, {}, {}
    for t, p in enumerate(refs):
        if p in marcos:
            ultimo[p] = t
            continue
        fallos_ += 1
        if len(marcos) == n:
            if algo == "FIFO":
                v = min(marcos, key=lambda x: llegada[x])
            elif algo == "LRU":
                v = min(marcos, key=lambda x: ultimo[x])
            else:  # optimo
                fut = refs[t + 1:]
                v = max(marcos, key=lambda x: (fut.index(x) if x in fut else 10**9, -marcos.index(x)))
            marcos.remove(v)
        marcos.append(p)
        llegada[p] = t
        ultimo[p] = t
    return fallos_

R = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2]
for algo, e in (("FIFO", 10), ("LRU", 9), ("OPT", 7)):
    f = simular(R, 3, algo)
    ok(f == e, f"cadena 7 0 1 2 0 3 0 4 2 3 0 3 2 con 3 marcos: {algo} = {f} fallos")

# 10) segunda oportunidad, formato catedra
pres = [(21, 30, 1), (7, 45, 1), (12, 80, 0), (3, 120, 1)]   # (pagina, llegada, R) ordenadas por llegada
cola = list(pres)
victima = None
while victima is None:
    p, lleg, r = cola.pop(0)
    if r == 1:
        cola.append((p, 150, 0))
    else:
        victima = p
cola.append((9, 150, 1))
ok(victima == 12 and [c[0] for c in cola] == [3, 21, 7, 9], f"segunda oportunidad: victima {victima}, cola final {[c[0] for c in cola]}")
v = 0x24C5
pag, des = divmod(v, 1024)
ok(pag == 9 and des == 197, "0x24C5 con 1 KB: pagina 9, desplazamiento 197")
ok(14 * 1024 + 197 == 0x38C5 == 14533, "marco 14 -> 0x38C5 = 14533")

# 11) envejecimiento (fig. 3-18)
bits = [[1, 0, 1, 0, 1, 1], [1, 1, 0, 0, 1, 0], [1, 1, 0, 1, 0, 1], [1, 0, 0, 0, 1, 0], [0, 1, 1, 0, 0, 0]]
cont = [0] * 6
for b in bits:
    cont = [(c >> 1) | (r << 7) for c, r in zip(cont, b)]
ok([format(c, "08b") for c in cont] == ["01111000", "10110000", "10001000", "00100000", "01011000", "00101000"], "envejecimiento: contadores tras 5 pulsos (la fig. 3-18 en espanol trae errata en la pagina 2: 10010000)")
ok(cont.index(min(cont)) == 3, "envejecimiento: se desaloja la pagina 3")

# 12) conjunto de trabajo, tau = 500, tiempo virtual 2204
ent = [(2084, 1), (2003, 1), (1980, 1), (1213, 0), (2014, 1), (2020, 1), (2032, 1), (1620, 0)]
cands = [t for t, r in ent if r == 0 and 2204 - t > 600]
ok(cands == [1213], "conjunto de trabajo con tau = 600: solo la de ultimo uso 1213 (edad 991) queda fuera")
ok(2204 - 1620 == 584 and 584 <= 600, "la de 1620 tiene R = 0 pero edad 584 <= 600: sigue en el conjunto")

# 13) tamano de pagina optimo
s, e = 2**20, 8
p = math.sqrt(2 * s * e)
ok(p == 4096, "p = raiz(2 s e) = 4096 con s = 1 MB y e = 8")
ok(s * e / 4096 + 4096 / 2 == 4096, "sobrecarga con p = 4096: 2048 + 2048 = 4096 bytes")

# 14) compactacion e intercambio
ok(abs(2**30 / 4 * 20e-9 - 5.37) < 0.01, "compactar 1 GB a 4 bytes / 20 ns = 5,37 s (el libro: 'unos 5 s')")
ok(2**30 / (100 * 2**20) > 10 - 1e-9 or 1e9 / 100e6 == 10, "1 GB a 100 MB/s = 10 s")

# 15) asignacion de marcos
ok(12416 // 10 == 1241 and 12416 % 10 == 6, "12.416 marcos / 10 procesos = 1241 y sobran 6")

# 16) buddy
def potencia(n):
    k = 1
    while k < n:
        k *= 2
    return k
ok(potencia(65) == 128 and potencia(8) == 8, "colegas: 65 paginas -> bloque de 128 (desperdicio 63)")

print(f"\n{fallos} fallos" if fallos else "\n0 fallos")
