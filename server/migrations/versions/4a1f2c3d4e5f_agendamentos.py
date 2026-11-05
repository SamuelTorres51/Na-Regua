"""cria tabela de agendamentos

Revision ID: 4a1f2c3d4e5f
Revises: 333cd49ef1a2
Create Date: 2026-11-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4a1f2c3d4e5f"
down_revision: Union[str, None] = "333cd49ef1a2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


status_agendamento = sa.Enum(
    "agendado",
    "confirmado",
    "em_atendimento",
    "concluido",
    "cancelado",
    "ausente",
    name="statusagendamento",
)


def upgrade() -> None:
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
            status_agendamento,
            nullable=False,
            server_default="agendado",
        ),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["cliente_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["profissional_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["servico_id"], ["servicos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_agendamentos_profissional_inicio",
        "agendamentos",
        ["profissional_id", "inicio"],
    )
    op.create_index(
        "ix_agendamentos_cliente_inicio",
        "agendamentos",
        ["cliente_id", "inicio"],
    )
    op.create_index(
        "ix_agendamentos_status_inicio",
        "agendamentos",
        ["status", "inicio"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_agendamentos_status_inicio",
        table_name="agendamentos",
    )
    op.drop_index(
        "ix_agendamentos_cliente_inicio",
        table_name="agendamentos",
    )
    op.drop_index(
        "ix_agendamentos_profissional_inicio",
        table_name="agendamentos",
    )
    op.drop_table("agendamentos")
    status_agendamento.drop(op.get_bind(), checkfirst=True)
