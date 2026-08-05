#!/usr/bin/env python3
"""
Migration script to rename cpf column to cnpj in the profissionais table.
"""

from sqlalchemy import create_engine, text
from src.tcc.api.configuracoes import configuracoes

def upgrade():
    """Rename cpf column to cnpj in profissionais table."""
    engine = create_engine(configuracoes.DATABASE_URL)
    with engine.connect() as conn:
        # Check if the column exists before trying to rename it
        result = conn.execute(text("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'profissionais'
            AND COLUMN_NAME = 'cpf'
        """))

        if result.fetchone():
            # Rename the column from cpf to cnpj
            conn.execute(text("ALTER TABLE profissionais CHANGE cpf cnpj VARCHAR(20)"))
            print("Successfully renamed cpf column to cnpj in profissionais table.")
        else:
            print("Column 'cpf' not found in profissionais table. It may have already been renamed.")

def downgrade():
    """Rename cnpj column back to cpf in profissionais table."""
    engine = create_engine(configuracoes.DATABASE_URL)
    with engine.connect() as conn:
        # Check if the column exists before trying to rename it
        result = conn.execute(text("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'profissionais'
            AND COLUMN_NAME = 'cnpj'
        """))

        if result.fetchone():
            # Rename the column from cnpj back to cpf
            conn.execute(text("ALTER TABLE profissionais CHANGE cnpj cpf VARCHAR(20)"))
            print("Successfully renamed cnpj column back to cpf in profissionais table.")
        else:
            print("Column 'cnpj' not found in profissionais table. It may have already been renamed back.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()