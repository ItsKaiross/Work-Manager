import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="my_database"
)

cursor = conn.cursor()

with open("schema.sql", "r") as f:
    sql = f.read()

for result in cursor.execute(sql, multi=True):
    pass

conn.commit()
conn.close()