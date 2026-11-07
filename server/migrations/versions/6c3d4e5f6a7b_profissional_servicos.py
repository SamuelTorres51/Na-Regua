"""cria associação entre profissionais e serviços

Revision ID: 6c3d4e5f6a7b
Revises: 5b2c3d4e5f6a
Create Date: 2026-11-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6c3d4e5f6a7b"
down_revision: Union[str, None] = "5b2c3d4e5f6a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profissional_servicos",
        sa.Column("profissional_id", sa.Integer(), nullable=False),
        sa.Column("servico_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["profissional_id"],
            ["usuarios.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["servico_id"],
            ["servicos.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("profissional_id", "servico_id"),
    )


def downgrade() -> None:
    op.drop_table("profissional_servicos")
