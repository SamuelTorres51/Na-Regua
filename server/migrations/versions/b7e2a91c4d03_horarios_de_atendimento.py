"""cria horarios de funcionamento da barbearia e jornadas dos profissionais

Revision ID: b7e2a91c4d03
Revises: 9a1b2c3d4e5f
Create Date: 2026-11-12
"""
from datetime import time
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7e2a91c4d03"
down_revision: Union[str, None] = "9a1b2c3d4e5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Funcionamento inicial: segunda a sábado, 08:00–12:00 e 14:00–18:00.
# Pode ser alterado depois por PUT /barbearia/horarios.
_DIAS_UTEIS = range(6)
_TURNOS_PADRAO = ((time(8), time(12)), (time(14), time(18)))


def upgrade() -> None:
    horarios_funcionamento = op.create_table(
        "horarios_funcionamento",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("dia_semana", sa.SmallInteger(), nullable=False),
        sa.Column("inicio", sa.Time(), nullable=False),
        sa.Column("fim", sa.Time(), nullable=False),
        sa.CheckConstraint(
            "dia_semana BETWEEN 0 AND 6",
            name="ck_horarios_funcionamento_dia_semana",
        ),
        sa.CheckConstraint(
            "inicio < fim",
            name="ck_horarios_funcionamento_intervalo",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.bulk_insert(
        horarios_funcionamento,
        [
            {"dia_semana": dia, "inicio": inicio, "fim": fim}
            for dia in _DIAS_UTEIS
            for inicio, fim in _TURNOS_PADRAO
        ],
    )

    op.create_table(
        "turnos_profissionais",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("profissional_id", sa.Integer(), nullable=False),
        sa.Column("dia_semana", sa.SmallInteger(), nullable=False),
        sa.Column("inicio", sa.Time(), nullable=False),
        sa.Column("fim", sa.Time(), nullable=False),
        sa.CheckConstraint(
            "dia_semana BETWEEN 0 AND 6",
            name="ck_turnos_profissionais_dia_semana",
        ),
        sa.CheckConstraint(
            "inicio < fim",
            name="ck_turnos_profissionais_intervalo",
        ),
        sa.ForeignKeyConstraint(
            ["profissional_id"],
            ["usuarios.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_turnos_profissionais_profissional_id",
        "turnos_profissionais",
        ["profissional_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_turnos_profissionais_profissional_id",
        table_name="turnos_profissionais",
    )
    op.drop_table("turnos_profissionais")
    op.drop_table("horarios_funcionamento")
