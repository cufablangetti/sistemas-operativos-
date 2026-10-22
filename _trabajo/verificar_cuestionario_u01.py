"""Verificacion de todos los ejercicios numericos del cuestionario de la Unidad 1."""
import math

print("=" * 70)
print("P8 — Jerarquia de memoria con cache")
t_l1, t_ram, h = 2.0, 60.0, 0.90
tm = h * t_l1 + (1 - h) * (t_l1 + t_ram)
print(f"  Tm = {h}x{t_l1} + {1-h:.2f}x({t_l1}+{t_ram}) = {h*t_l1} + {(1-h)*(t_l1+t_ram)} = {tm:.2f} ns")
print(f"  mejora = {t_ram}/{tm:.2f} = {t_ram/tm:.2f}x")
# b) que tasa hace falta para Tm <= 6 ns
# h*2 + (1-h)*62 <= 6  ->  2h + 62 - 62h <= 6  ->  -60h <= -56  ->  h >= 56/60
h_min = (62 - 6) / 60
print(f"  b) para Tm <= 6 ns hace falta h >= {h_min:.4f} = {100*h_min:.2f} %")
print(f"     comprobacion con h={h_min:.4f}: Tm = {h_min*2 + (1-h_min)*62:.2f} ns")

print("=" * 70)
print("P9 — Costo de CPU de las tres formas de E/S")
n, tB, tI, tS = 2048, 25.0, 8.0, 30.0
total = n * tB
cpu_prog = total
cpu_intr = n * tI
cpu_dma = tS + tI
print(f"  duracion total = {n} x {tB} = {total} us = {total/1000} ms  (IGUAL en los tres)")
print(f"  programada     : {cpu_prog} us -> {100*cpu_prog/total:.4f} %")
print(f"  interrupciones : {n} x {tI} = {cpu_intr} us -> {100*cpu_intr/total:.4f} %")
print(f"  DMA            : {tS} + {tI} = {cpu_dma} us -> {100*cpu_dma/total:.4f} %")
print(f"  CPU libre con interrupciones = {total - cpu_intr} us = {(total-cpu_intr)/1000} ms")
print(f"  veces que DMA mejora a interrupciones = {cpu_intr/cpu_dma:.1f}x")

print("=" * 70)
print("P10 — Multiprogramacion: cuantos procesos para superar el 90 %")
p = 0.60
print(f"  modelo: aprovechamiento = 1 - {p}^n")
for nn in range(1, 8):
    ap = 1 - p ** nn
    marca = "  <-- primero que supera 90 %" if ap > 0.90 and 1 - p ** (nn - 1) <= 0.90 else ""
    print(f"    n = {nn} -> {100*ap:.2f} %{marca}")
n_teorico = math.log(0.10) / math.log(p)
print(f"  calculo directo: n > log(0,10)/log({p}) = {n_teorico:.3f}  ->  n = {math.ceil(n_teorico)}")

print("=" * 70)
print("P11 — Tabla de particiones del MBR")
for desc, cant in [("1 particion de 4 TB", 1), ("3 particiones", 3), ("4 particiones", 4)]:
    print(f"  {desc:<22} -> la tabla ocupa SIEMPRE 4 x 16 = 64 bytes (entradas de tamano fijo)")
print(f"  codigo de arranque = 512 - 64 - 2 = {512-64-2} bytes")
limite_mbr = (2**32 - 1) * 512
print(f"  limite MBR: (2^32 - 1) sectores x 512 B = {limite_mbr} B = {limite_mbr/(1024**4):.2f} TB")
limite_gpt = (2**64 - 1) * 512
print(f"  limite GPT: (2^64 - 1) sectores x 512 B = {limite_gpt/(1024**6):.2f} EB (exabytes)")

print("=" * 70)
print("P12 — Llamadas al sistema segun el tamano del buffer")
tam = 64 * 1024
for buf in (1024, 2048, 16384):
    print(f"  archivo de {tam} B con buffer de {buf} B -> {tam//buf} llamadas a read()")
print(f"  pasar de 2 KB a 16 KB: {tam//2048} / {tam//16384} = {(tam//2048)//(tam//16384)}x menos llamadas")

print("=" * 70)
print("P13 — Teclado contra disco: interrupciones por segundo")
for desc, bps, tI2 in [("teclado, 10 teclas/s", 10, 5.0), ("disco, 50 MB/s por byte", 50*1024*1024, 5.0)]:
    cpu_s = bps * tI2 / 1e6
    print(f"  {desc:<26}: {bps:>12} int/s x {tI2} us = {cpu_s:>12.2f} s de CPU por segundo"
          f"  -> {'VIABLE' if cpu_s < 1 else 'IMPOSIBLE'}")
# con DMA y bloques de 4 KB
bloques = 50*1024*1024 / 4096
print(f"  disco con DMA y bloques de 4 KB: {bloques:.0f} int/s x 5 us = {bloques*5/1e6:.4f} s de CPU por segundo -> VIABLE")

print("=" * 70)
print("P20 — Rendimiento: monolitico contra microkernel")
llam, t_call, t_msg = 100000, 0.05, 2.0
print(f"  {llam} operaciones internas por segundo")
print(f"  monolitico (llamada a procedimiento, {t_call} us): {llam*t_call/1000:.1f} ms = {100*llam*t_call/1e6:.2f} % de CPU")
print(f"  microkernel (paso de mensajes, {t_msg} us):        {llam*t_msg/1000:.1f} ms = {100*llam*t_msg/1e6:.2f} % de CPU")
print(f"  el microkernel gasta {t_msg/t_call:.0f}x mas CPU solo en comunicacion interna")

print("=" * 70)
print("TODAS LAS CUENTAS VERIFICADAS")
