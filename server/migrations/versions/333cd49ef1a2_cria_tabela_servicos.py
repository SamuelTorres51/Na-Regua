"""cria_tabela_servicos

Revision ID: 333cd49ef1a2
Revises: 222bd38bc0f7
Create Date: 2026-11-02 14:50:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '333cd49ef1a2'
down_revision: Union[str, None] = '222bd38bc0f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'servicos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nome', sa.String(length=150), nullable=False),
        sa.Column('descricao', sa.String(length=500), nullable=False, server_default=''),
        sa.Column('duracao_minutos', sa.Integer(), nullable=False),
        sa.Column('preco', sa.Float(), nullable=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_servicos_nome'), 'servicos', ['nome'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_servicos_nome'), table_name='servicos')
    op.drop_table('servicos')
