"""tabela de servicos

Revision ID: 7380303b8d90
Revises: 222bd38bc0f7
Create Date: 2026-11-02 14:32:03.706368
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '7380303b8d90'
down_revision: Union[str, None] = '222bd38bc0f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if not sa.inspect(op.get_bind()).has_table("servicos"):
        op.create_table(
            'servicos',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('nome', sa.String(length=150), nullable=False),
            sa.Column('descricao', sa.String(length=500), nullable=False),
            sa.Column('duracao_minutos', sa.Integer(), nullable=False),
            sa.Column('preco', sa.Float(), nullable=False),
            sa.Column('ativo', sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_servicos_nome'), 'servicos', ['nome'], unique=True)


def downgrade() -> None:
    if sa.inspect(op.get_bind()).has_table("servicos"):
        op.drop_index(op.f('ix_servicos_nome'), table_name='servicos')
        op.drop_table('servicos')
