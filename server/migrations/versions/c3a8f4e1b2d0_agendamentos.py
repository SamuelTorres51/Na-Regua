"""Cria a tabela de agendamentos.

Revision ID: c3a8f4e1b2d0
Revises: 222bd38bc0f7
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM


revision: str = "c3a8f4e1b2d0"
down_revision: Union[str, None] = "222bd38bc0f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    status_enum = PG_ENUM(
        "agendado",
        "confirmado",
        "em_atendimento",
        "concluido",
        "cancelado",
        "ausente",
        name="statusagendamento",
    )
    status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "agendamentos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("cliente_id", sa.Integer(), nullable=False),
        sa.Column("profissional_id", sa.Integer(), nullable=False),
        sa.Column("servico_id", sa.Integer(), nullable=False),
        sa.Column("inicio", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duracao_minutos", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            PG_ENUM(
                "agendado",
                "confirmado",
                "em_atendimento",
                "concluido",
                "cancelado",
                "ausente",
                name="statusagendamento",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_agendamentos_cliente_id",
        "agendamentos",
        ["cliente_id"],
    )
    op.create_index(
        "ix_agendamentos_profissional_id",
        "agendamentos",
        ["profissional_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_agendamentos_profissional_id", table_name="agendamentos")
    op.drop_index("ix_agendamentos_cliente_id", table_name="agendamentos")
    op.drop_table("agendamentos")
    PG_ENUM(name="statusagendamento").drop(op.get_bind(), checkfirst=True)
