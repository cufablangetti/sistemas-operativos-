# Verifica fork, condicion de carrera, loteria y tiempo real del cuestionario U2.
from fractions import Fraction as F
from itertools import permutations

# --- fork: fork(); if (fork()==0) fork(); printf("X")
def prog1():
    procs = [0]                      # un proceso
    procs = procs * 2                # fork()
    total = 0
    for _ in procs:
        total += 1                   # padre del segundo fork: no entra al if
        total += 2                   # hijo (fork()==0) hace fork(): hijo + nieto
    return total
print("fork prog1, X impresas:", prog1())

# --- fork: for (i=0;i<3;i++) if (fork()==0) printf("H");
def prog2():
    h = 0
    def corre(i):
        nonlocal h
        cuenta = 1
        while i < 3:
            # fork: el hijo imprime y sigue el bucle desde i+1
            h += 1
            cuenta += corre(i + 1)
            i += 1
        return cuenta
    n = corre(0)
    return n, h
print("fork prog2 (procesos, H):", prog2())

# --- carrera: x=0; dos hilos, cada uno hace 2 veces  r=x; r=r+1; x=r
def finales():
    ops = lambda h: [(h, 'ld'), (h, 'st')] * 2
    res = set()
    seq = ['A'] * 4 + ['B'] * 4
    for orden in set(permutations(seq)):
        x, reg, pc = 0, {'A': 0, 'B': 0}, {'A': 0, 'B': 0}
        for h in orden:
            if pc[h] % 2 == 0: reg[h] = x + 1
            else: x = reg[h]
            pc[h] += 1
        res.add(x)
    return sorted(res)
print("carrera valores finales:", finales())

# --- loteria
A, B, C = 20, 30, 50
print("loteria inicial:", F(A, 100), F(B, 100), F(C, 100))
print("C bloqueado dona 10 a A:", F(A + 10, A + 10 + B), F(B, A + 10 + B))

# --- tiempo real
u = F(10, 40) + F(30, 100) + F(50, 200)
print("U tres primeros:", u, "-> C max del cuarto (P=500):", (1 - u) * 500)
