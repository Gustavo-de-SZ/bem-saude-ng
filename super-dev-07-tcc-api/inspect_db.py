import sqlalchemy as db
from src.tcc.api.configuracoes import configuracoes

engine = db.create_engine(configuracoes.DATABASE_URL)
inspector = db.inspect(engine)

tables = inspector.get_table_names()
print("Tables in database:")
for table in tables:
    print(f"  {table}")

for table in ['servicos', 'agendamentos', 'transacoes', 'usuarios', 'clientes', 'profissionais']:
    if table in tables:
        columns = [col['name'] for col in inspector.get_columns(table)]
        print(f"\nTable {table} columns:")
        for col in columns:
            print(f"  {col}")
    else:
        print(f"\nTable {table} not found")