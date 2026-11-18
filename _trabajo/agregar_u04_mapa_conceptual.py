# -*- coding: utf-8 -*-
"""Agrega la rama U4 (_trabajo/mapa_rama_u04.md) al final de plan/mapa_conceptual.md,
actualiza el encabezado y suma las reconexiones U4 en "La idea que une todo".
No borra nada de lo existente. Copia previa: _trabajo/mapa_conceptual_antes_u04.md"""
import io, sys
P = 'plan/mapa_conceptual.md'
s = io.open(P, encoding='utf-8').read()
if '{#u4}' in s:
    sys.exit('La rama U4 ya está agregada.')
rama = io.open('_trabajo/mapa_rama_u04.md', encoding='utf-8').read()

def reemplazar(viejo, nuevo):
    global s
    assert s.count(viejo) == 1, viejo
    s = s.replace(viejo, nuevo)

reemplazar('Unidades incluidas: 1, 2 y 3. Última ampliación: 12 de noviembre de 2026.',
           'Unidades incluidas: 1, 2, 3 y 4. Última ampliación: 18 de noviembre de 2026.')
reemplazar('`repaso_u02.pdf` o `repaso_u03.pdf`', '`repaso_u02.pdf`, `repaso_u03.pdf` o `repaso_u04.pdf`')
c = 'y la RAM guarda páginas del disco (memoria virtual) [[u3-paginacion]].'
reemplazar(c, c + ' En la U4, la **caché de bloques** guarda bloques del disco en RAM [[u4-cache-bufer]].')
d = 'y en el paginador externo de la memoria virtual [[u3-fallo]].'
reemplazar(d, d + ' En la U4, el **VFS** fija la interfaz y cada sistema de archivos concreto pone su implementación [[u4-vfs]].')
e = '- 🧠 **Esperar sin gastar CPU = BLOQUEADO.**'
reemplazar(e, '- 🧠 **Una tabla por recurso no escala; una por lo que está en uso, sí.** La tabla de páginas lineal contra la invertida [[u3-invertida]], y en la U4 la FAT (proporcional al disco) contra los nodos-i (proporcionales a los archivos abiertos) [[u4-fat-vs-nodoi]].\n'
              '- 🧠 **Lo contiguo es rápido pero fragmenta afuera; los bloques fijos no, pero desperdician adentro.** Segmentación contra paginación [[u3-pag-vs-seg]], y en la U4 asignación contigua contra bloques [[u4-asignacion]] y la fragmentación interna del último bloque [[u4-frag-interna]].\n' + e)
s = s.rstrip('\n') + '\n' + rama
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok: rama U4 agregada')
