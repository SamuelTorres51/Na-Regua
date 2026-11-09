"""cria tabela de avaliacoes

Revision ID: 9a1b2c3d4e5f
Revises: 8e5f6a7b8c9d
Create Date: 2026-11-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9a1b2c3d4e5f"
down_revision: Union[str, None] = "8e5f6a7b8c9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "avaliacoes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("agendamento_id", sa.Integer(), nullable=False),
        sa.Column("cliente_id", sa.Integer(), nullable=False),
        sa.Column("profissional_id", sa.Integer(), nullable=False),
        sa.Column("nota", sa.Integer(), nullable=False),
        sa.Column(
            "comentario",
            sa.String(length=1000),
            nullable=False,
            server_default="",
        ),
        sa.Column(
            "criada_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "nota BETWEEN 1 AND 5",
            name="ck_avaliacoes_nota_intervalo",
        ),
        sa.ForeignKeyConstraint(
            ["agendamento_id"],
            ["agendamentos.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["cliente_id"],
            ["usuarios.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["profissional_id"],
            ["usuarios.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "agendamento_id",
            name="uq_avaliacoes_agendamento_id",
        ),
    )
    op.create_index(
        "ix_avaliacoes_cliente_criada_em",
        "avaliacoes",
        ["cliente_id", "criada_em"],
    )
    op.create_index(
        "ix_avaliacoes_profissional_criada_em",
        "avaliacoes",
        ["profissional_id", "criada_em"],
    )


def downgrade() -> None:
    op.drop_index("ix_avaliacoes_profissional_criada_em", table_name="avaliacoes")
    op.drop_index("ix_avaliacoes_cliente_criada_em", table_name="avaliacoes")
    op.drop_table("avaliacoes")
