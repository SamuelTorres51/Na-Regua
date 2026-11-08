"""cria tabela de notificacoes

Revision ID: 8e5f6a7b8c9d
Revises: 7d4e5f6a7b8c
Create Date: 2026-11-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM


revision: str = "8e5f6a7b8c9d"
down_revision: Union[str, None] = "7d4e5f6a7b8c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TIPO_NOTIFICACAO_ENUM = PG_ENUM(
    "confirmacao_agendamento",
    "novo_agendamento",
    "cancelamento_agendamento",
    "lembrete_agendamento",
    name="tiponotificacao",
    create_type=False,
)


def upgrade() -> None:
    conn = op.get_bind()
    # Cria o tipo enum no PostgreSQL caso nao exista
    conn.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tiponotificacao') THEN
                    CREATE TYPE tiponotificacao AS ENUM (
                        'confirmacao_agendamento',
                        'novo_agendamento',
                        'cancelamento_agendamento',
                        'lembrete_agendamento'
                    );
                END IF;
            END
            $$;
            """
        )
    )

    op.create_table(
        "notificacoes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("agendamento_id", sa.Integer(), nullable=True),
        sa.Column("tipo", TIPO_NOTIFICACAO_ENUM, nullable=False),
        sa.Column("mensagem", sa.String(length=500), nullable=False),
        sa.Column(
            "enviada_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "lida",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["agendamento_id"], ["agendamentos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_notificacoes_usuario_lida",
        "notificacoes",
        ["usuario_id", "lida"],
    )
    op.create_index(
        "ix_notificacoes_agendamento_tipo",
        "notificacoes",
        ["agendamento_id", "tipo"],
    )


def downgrade() -> None:
    op.drop_index("ix_notificacoes_agendamento_tipo", table_name="notificacoes")
    op.drop_index("ix_notificacoes_usuario_lida", table_name="notificacoes")
    op.drop_table("notificacoes")
    op.get_bind().execute(sa.text("DROP TYPE IF EXISTS tiponotificacao;"))

