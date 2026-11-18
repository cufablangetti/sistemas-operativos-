# -*- coding: utf-8 -*-
"""Verifica los ejemplos numericos de notebooklm_u04.md (Unidad 4)."""
f = 0
def ok(c, m):
    global f
    print(("OK   " if c else "FALLA") + " " + m)
    if not c: f += 1

# 1) FAT del libro (fig. 4-12): A = 4 7 2 10 12, B = 6 3 11 14
FIN = -1
fat = {4: 7, 7: 2, 2: 10, 10: 12, 12: FIN, 6: 3, 3: 11, 11: 14, 14: FIN}
def cadena(ini):
    c = [ini]
    while fat[c[-1]] != FIN: c.append(fat[c[-1]])
    return c
ok(cadena(4) == [4, 7, 2, 10, 12] and cadena(6) == [6, 3, 11, 14], "fig. 4-12: cadenas A y B")
ok(len(cadena(4)) * 256 == 1280, "A con clusters de 256 B ocupa 5 x 256 = 1280 B")

# 2) Practica: FAT32, sector 512 B, bloque 4 KB, archivo de 3712518 B
ok(4096 // 512 == 8, "sectores por bloque = 8")
lleno, resto = divmod(3712518, 4096)
ok((lleno, resto) == (906, 1542), f"3712518 = {lleno} bloques llenos + {resto} B")
ok(4096 - resto == 2554 and (lleno + 1) * 4096 == 3715072, "fragmentacion interna 2554 B; ocupa 907 bloques = 3715072 B")
ok((512).to_bytes(2, "little") == bytes([0x00, 0x02]), "BPB 0x0B-0x0C: 512 = 0x0200 -> bytes 00 02 (little endian)")

# 3) i-nodo con 10 directos, bloque 4 KB, punteros de 4 B
p = 4096 // 4
maxb = (10 + p + p**2 + p**3) * 4096
ok(p == 1024 and maxb == 4402345713664, f"tamano maximo = {maxb} B")
ok(abs(maxb / 2**40 - 4.0039) < 0.001 and abs(maxb / 1e12 - 4.402) < 0.001, f"= {maxb/2**40:.4f} TiB = {maxb/1e12:.3f} TB (no 4,27)")

# 4) Practica: archivo de 5,5 MB, bloque 2 KB, 12 directos, punteros 4 B
p = 2048 // 4
datos = int(5.5 * 1024 * 1024) // 2048
resto = datos - 12 - p
seg = -(-resto // p)
ok(datos == 2816 and p == 512 and resto == 2292 and seg == 5, f"2816 bloques de datos; tras directos y simple quedan {resto} -> {seg} bloques de 2o nivel")
ok(1 + 1 + seg == 7, "bloques indice = 1 simple + 1 doble + 5 = 7")

# 5) Linux ext2 con bloques de 1 KB y punteros de 4 B (libro)
p = 256
ok((12 + p) == 268, "12 directos + simple = 268 KB")
ok(p**3 == 2**24 and 2**24 * 1024 == 16 * 2**30, "triple: 2^24 bloques de 1 KB = 16 GB")

# 6) Lista de bloques libres vs mapa de bits (disco de 500 GB, bloques de 1 KB)
n = 500e9 / 1024
ok(abs(n / 1e6 - 488.28) < 0.01, f"{n/1e6:.1f} millones de bloques")
ok(abs(n / 255 / 1e6 - 1.91) < 0.01, f"lista: {n/255/1e6:.2f} millones de bloques")
ok(abs(n / 8 / 1024 - 59605) < 1, f"mapa de bits: {n/8/1024:.0f} bloques (poco menos de 60000)")

# 7) Tamano de la FAT en memoria
ok(200e6 * 3 / 1e6 == 600 and 200e6 * 4 / 1e6 == 800, "disco 200 GB, bloque 1 KB: 600 u 800 MB de FAT")
ok((2 * 2**30) // 4096 == 512 * 1024 and 512 * 1024 * 4 == 2 * 2**20, "FAT32, particion 2 GB, bloque 4 KB: 512K entradas = 2 MB")
ok(2**16 * 32 * 1024 == 2 * 2**30, "FAT16: 64K entradas de 32 KB = 2 GB")
ok(2**9 * 2**32 == 2 * 2**40, "FAT32 limitada a 2^9 x 2^32 = 2 TB")

# 8) Tiempo de lectura de un bloque (1 MB/pista, rotacion 8,33 ms, busqueda 5 ms)
t = lambda k: 5 + 8.33 / 2 + (k / 2**20) * 8.33
ok(abs(t(4096) - 9.198) < 0.001, f"bloque de 4 KB: {t(4096):.3f} ms")
ok(abs(65536 / (t(65536) / 1000) / 2**20 - 6.45) < 0.01, f"bloque de 64 KB: {t(65536):.2f} ms -> {65536/(t(65536)/1000)/2**20:.2f} MB/s (el libro redondea 6,6)")

# 9) Fecha de MS-DOS: 7 bits de ano desde 1980
ok(1980 + 2**7 - 1 == 2107, "ultimo ano representable: 2107")
ok(2**16 < 86400 and 86400 / 2**16 > 1, "65536 valores no alcanzan para los 86400 s del dia -> precision de 2 s")

# 10) fsck (fig. 4-27)
uso   = [1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,0]
libre_b = [0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,1]
falt = [i for i in range(16) if uso[i] + libre_b[i] == 0]
ok(falt == [2], "fig. 4-27(b): el bloque 2 falta")
print(f"\n{f} fallos")
