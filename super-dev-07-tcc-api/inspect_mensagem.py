from sqlalchemy import create_engine, inspect
from src.tcc.api.configuracoes import configuracoes

engine = create_engine(configuracoes.DATABASE_URL)
inspector = inspect(engine)
columns = inspector.get_columns('mensagens')
print("Columns in mensagens table:")
for col in columns:
    print(f"  {col['name']}: {col['type']}")