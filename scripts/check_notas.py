import sqlite3

# Conectar ao banco
conn = sqlite3.connect('smartspend.db')
cursor = conn.cursor()

# Verificar notas
cursor.execute('SELECT COUNT(*) FROM notas')
count = cursor.fetchone()[0]
print(f'Total de notas: {count}')

if count > 0:
    cursor.execute('SELECT id, mercado, total FROM notas')
    notas = cursor.fetchall()
    print('Notas no banco:')
    for nota in notas:
        print(f'  ID: {nota[0]} | Mercado: {nota[1]} | Total: R${nota[2]}')
else:
    print('Nenhuma nota encontrada no banco')

conn.close()
