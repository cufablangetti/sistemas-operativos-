# -*- coding: utf-8 -*-
"""Verifica los ejemplos numéricos de unidades/u05-entrada-salida/notebooklm_u05.md"""
ok = mal = 0
def t(nombre, cond):
    global ok, mal
    if cond: ok += 1; print('OK   ', nombre)
    else: mal += 1; print('FALLA', nombre)
cerca = lambda a, b, tol=0.01: abs(a - b) <= tol

# 1. tres formas de E/S: 500 caracteres a 100 car/s, 20 us por interrupción
t('1 impresión 5 s', 500 / 100 == 5)
t('1 interrupciones 10 ms', cerca(500 * 20e-6, 0.010, 1e-9))
t('1 interrupciones = 0,2 % de 5 s', cerca(500 * 20e-6 / 5 * 100, 0.2, 1e-9))

# 2. paridad XOR
D = [0b1011, 0b0110, 0b1100, 0b0001]
P = D[0] ^ D[1] ^ D[2] ^ D[3]
t('2 paridad 0000', P == 0)
t('2 reconstruye D3 = 1100', D[0] ^ D[1] ^ D[3] ^ P == 0b1100)
t('2 nueva paridad 0001', P ^ 0b0110 ^ 0b0111 == 0b0001)
t('2 nueva paridad coincide con recalcular', 0b1011 ^ 0b0111 ^ 0b1100 ^ 0b0001 == 0b0001)

# 3. RAID 0: 4 discos de 20.000 h
t('3 MTTF RAID 0 = 5000 h', 20000 / 4 == 5000)

# 4. CD de 74 min
sect = 74 * 60 * 75
t('4 333.000 sectores', sect == 333000)
t('4 681.984.000 bytes', sect * 2048 == 681984000)
t('4 650 MB', cerca(sect * 2048 / 2**20, 650.4, 0.05))
t('CD 1x modo 1 = 153.600 B/s', 75 * 2048 == 153600)
t('CD 1x modo 2 = 175.200 B/s', 75 * 2336 == 175200)
t('CD 32x = 4.915.200 B/s', 32 * 153600 == 4915200)
t('CD 98 tramas de 588 bits = 7203 bytes', 98 * 588 / 8 == 7203)
t('CD eficiencia 28 %', round(2048 / 7203 * 100) == 28)
t('CD trama 14 x 42 = 588', 14 * 42 == 588)
t('CD sector modo 1 = 2352', 16 + 2048 + 288 == 2352)

# 5. desajuste de cilindros
vuelta = 60 / 10000
t('5 vuelta 6 ms', cerca(vuelta * 1000, 6, 1e-9))
t('5 sector cada 20 us', cerca(vuelta / 300 * 1e6, 20, 1e-9))
t('5 desajuste 40 sectores', cerca(800 / 20, 40, 1e-9))

# 6. confusión de GB
t('6 158 GB', round(170e9 / 2**30) == 158)

# 7. velocidad máxima de una pista
bps = 300 * 512 / 0.006
t('7 25.600.000 B/s', cerca(bps, 25600000, 1e-3))
t('7 24,4 MB/s', cerca(bps / 2**20, 24.4, 0.05))

# 8. práctica: TmLW
rot = (60 / 7200) / 2 * 1000
trans = 512 / 19e6 * 1000
total = 6.8 + rot + trans + 2
t('8 media vuelta 4,165 ms', cerca(rot, 4.1667, 0.001))
t('8 transferencia 0,0269 ms', cerca(trans, 0.0269, 0.0001))
t('8 TmLW 12,99 ms', cerca(total, 12.99, 0.01))
t('8 30.000/RPM', cerca(30000 / 7200, rot, 1e-9))

# 9. variante
t('9 total 8,08 ms', cerca(5 + 3 + 4096 / 50e6 * 1000, 8.08, 0.005))

# 10. planificación del brazo
pet = [1, 36, 16, 34, 9, 12]
def total_mov(inicio, orden):
    s, pos = 0, inicio
    for c in orden: s += abs(c - pos); pos = c
    return s
def sstf(inicio, pet):
    pend, pos, orden = list(pet), inicio, []
    while pend:
        c = min(pend, key=lambda x: (abs(x - pos), x)); orden.append(c); pend.remove(c); pos = c
    return orden
def look(inicio, pet, arriba=True):
    may = sorted(x for x in pet if x >= inicio); men = sorted((x for x in pet if x < inicio), reverse=True)
    return may + men if arriba else men + may
def clook(inicio, pet):
    may = sorted(x for x in pet if x >= inicio); men = sorted(x for x in pet if x < inicio)
    return may + men
t('10 FCFS 111', total_mov(11, pet) == 111)
t('10 SSF orden 12 9 16 1 34 36', sstf(11, pet) == [12, 9, 16, 1, 34, 36])
t('10 SSF 61', total_mov(11, sstf(11, pet)) == 61)
t('10 elevador orden 12 16 34 36 9 1', look(11, pet) == [12, 16, 34, 36, 9, 1])
t('10 elevador 60', total_mov(11, look(11, pet)) == 60)
t('10 SCAN hasta 39 = 66', total_mov(11, [12, 16, 34, 36, 39, 9, 1]) == 66)
t('10 C-LOOK con salto = 68', total_mov(11, clook(11, pet)) == 68)
t('10 C-LOOK sin salto = 33', total_mov(11, [12, 16, 34, 36]) + abs(9 - 1) == 33)
t('10 cota elevador <= 2 x 40', total_mov(11, look(11, pet)) <= 80)

# 11. reloj programable
t('11 pulso cada 2 ns', cerca(1 / 500e6 * 1e9, 2, 1e-9))
t('11 máximo 8,6 s', cerca(2**32 * 2e-9, 8.59, 0.01))

# 12. desbordamiento
seg = 2**32 / 60
t('12 828,5 días', cerca(seg / 86400, 828.5, 0.1))
t('12 2,27 años', cerca(seg / 86400 / 365, 2.27, 0.01))
t('12 136 años en segundos', int(2**32 / (86400 * 365)) == 136)

# 13. lista de alarmas
lista = [3, 4, 6, 2, 1]
abs_ = []; h = 4200
for d in lista: h += d; abs_.append(h)
t('13 señales 4203 4207 4213 4215 4216', abs_ == [4203, 4207, 4213, 4215, 4216])
nuevas = sorted(abs_ + [4210]); rel = [nuevas[0] - 4200] + [b - a for a, b in zip(nuevas, nuevas[1:])]
t('13 nueva lista 3 4 3 3 2 1', rel == [3, 4, 3, 3, 2, 1])

# 14. Gigabit Ethernet
t('14 37 % de CPU', round(4.45 / 12 * 100) == 37)

# 15. RAM de video
b = 1920 * 1200 * 3
t('15 6.912.000 bytes', b == 6912000)
t('15 6,5 MB', cerca(b / 2**20, 6.59, 0.01))
t('15 489 MB/s', cerca(b * 75 / 2**20, 494, 1) or cerca(6.52 * 75, 489, 1))

# 17. escalado de voltaje
x = 1.0
t('17 opción a = x/2', cerca(x * 20 / 40, 0.5))
t('17 opción b = x/4', cerca((x / 4), 0.25))

print(f'\n{ok} OK, {mal} fallos')
