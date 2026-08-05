from sqlalchemy import create_engine, inspect
from src.tcc.api.configuracoes import configuracoes

engine = create_engine(configuracoes.DATABASE_URL)
inspector = inspect(engine)

tables = inspector.get_table_names()
print("Tables:", tables)

for table_name in ['servicos', 'agendamentos']:
    if table_name in tables:
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        print(f"Table {table_name} columns: {columns}")
    else:
        print(f"Table {table_name} does not exist")