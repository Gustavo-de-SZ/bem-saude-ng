"""rename cpf to cnpj for profissionais

Revision ID: 1234567890ab
Revises:
Create Date: 2026-07-29 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1234567890ab'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Rename cpf column to cnpj in profissionais table
    op.alter_column('profissionais', 'cpf', new_column_name='cnpj')


def downgrade():
    # Revert cnpj column back to cpf in profissionais table
    op.alter_column('profissionais', 'cnpj', new_column_name='cpf')