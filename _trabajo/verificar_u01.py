"""Verificacion de los ejemplos numericos de la Unidad 1."""

print("A) Tiempo medio de acceso con cache")
t_l1, t_ram, h = 1.0, 10.0, 0.95
tm = h * t_l1 + (1 - h) * (t_l1 + t_ram)
print(f"   Tm = {h}*{t_l1} + {1-h:.2f}*({t_l1}+{t_ram}) = {tm:.2f} ns")
print(f"   sin cache seria {t_ram} ns -> mejora {t_ram/tm:.2f}x")

print("\nB) Costo de CPU de las tres formas de hacer E/S")
n_bytes, t_byte_us, t_int_us, t_dma_us = 1000, 100, 5, 5
total_ms = n_bytes * t_byte_us / 1000
print(f"   La transferencia completa dura {total_ms:.0f} ms en los tres casos")
print(f"   Espera ocupada : CPU ocupada {total_ms:.0f} ms = 100.0 %")
cpu_int = n_bytes * t_int_us / 1000
print(f"   Interrupciones : {n_bytes} int x {t_int_us} us = {cpu_int:.0f} ms = {100*cpu_int/total_ms:.1f} %")
cpu_dma = 1 * t_dma_us / 1000
print(f"   DMA            : 1 int x {t_dma_us} us = {cpu_dma:.3f} ms = {100*cpu_dma/total_ms:.3f} %")

print("\nC) Aprovechamiento de CPU con multiprogramacion: 1 - p^n, con p = 0.8")
p = 0.8
for n in (1, 2, 3, 4, 5, 10):
    print(f"   n = {n:>2} procesos -> {100*(1 - p**n):.2f} %")

print("\nD) Estructura del sector de arranque (MBR), 512 bytes")
cod, tabla, firma = 446, 4 * 16, 2
print(f"   codigo de arranque : bytes 0 a {cod-1} ({cod} bytes)")
print(f"   tabla de particiones: bytes {cod} a {cod+tabla-1} (4 entradas x 16 = {tabla} bytes)")
print(f"   firma 55AA          : bytes {cod+tabla} a {cod+tabla+firma-1}")
print(f"   total = {cod}+{tabla}+{firma} = {cod+tabla+firma} bytes  -> {'OK' if cod+tabla+firma == 512 else 'ERROR'}")

print("\nE) Lectura de un archivo de 8 KB con read() de 512 bytes")
tam, buf = 8 * 1024, 512
print(f"   {tam} / {buf} = {tam//buf} llamadas al sistema read()")
print(f"   con un buffer de 4096 bytes: {tam//4096} llamadas -> {buf*1.0/4096:.3f} veces menos trabajo de kernel")
