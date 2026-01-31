import sqlite3

# Conectar ao banco
conn = sqlite3.connect('smartspend.db')
cursor = conn.cursor()

# Verificar tabelas
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()
print('Tabelas:', tables)

# Verificar notas
cursor.execute('SELECT id, mercado, total FROM notas LIMIT 5')
notas = cursor.fetchall()
print('Notas:', notas)

conn.close()
