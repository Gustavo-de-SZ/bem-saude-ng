from sqlalchemy import create_engine, inspect, text
from src.tcc.api.configuracoes import configuracoes

engine = create_engine(configuracoes.DATABASE_URL)
inspector = inspect(engine)

if inspector.has_table('mensagens'):
    with engine.begin() as conn:
        try:
            # Check if ticket_id column exists, if not add it
            columns = [col['name'] for col in inspector.get_columns('mensagens')]
            if 'ticket_id' not in columns:
                # Check if the table has any rows
                result = conn.execute(text("SELECT COUNT(*) FROM mensagens"))
                row_count = result.scalar()
                if row_count > 0:
                    print(f"WARNING: Cannot add non-nullable ticket_id column to mensagens table because it contains {row_count} existing rows. Skipping.")
                else:
                    # Add the ticket_id column as VARCHAR(255) NOT NULL with default empty string
                    conn.execute(text("ALTER TABLE mensagens ADD COLUMN ticket_id VARCHAR(255) NOT NULL DEFAULT ''"))
                    print("SUCCESS: Added ticket_id column to mensagens table.")
            else:
                print("INFO: ticket_id column already exists in mensagens table.")
        except Exception as e:
            print(f"ERROR: CouldAdd ticket_id column to mensagens table: {e}")
else:
    print("INFO: mensagens table does not exist. It will be created by the application with the correct schema.")