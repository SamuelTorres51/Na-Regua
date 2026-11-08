"""cria tabela de cancelamentos

Revision ID: 7d4e5f6a7b8c
Revises: 6c3d4e5f6a7b
Create Date: 2026-11-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7d4e5f6a7b8c"
down_revision: Union[str, None] = "6c3d4e5f6a7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cancelamentos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("agendamento_id", sa.Integer(), nullable=False),
        sa.Column("autor_id", sa.Integer(), nullable=False),
        sa.Column("motivo", sa.String(length=500), nullable=False),
        sa.Column(
            "cancelado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["agendamento_id"],
            ["agendamentos.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["autor_id"],
            ["usuarios.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "agendamento_id",
            name="uq_cancelamentos_agendamento_id",
        ),
    )


def downgrade() -> None:
    op.drop_table("cancelamentos")
