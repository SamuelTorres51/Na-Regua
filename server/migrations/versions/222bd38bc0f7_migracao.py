"""migracao

Revision ID: 222bd38bc0f7
Revises: 9ffec06768e7
Create Date: 2026-10-06 18:45:02.872335
"""
from typing import Sequence, Union

from alembic import op


revision: str = '222bd38bc0f7'
down_revision: Union[str, None] = '9ffec06768e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # A tabela usuarios já foi criada pela migration 0001_base.
    pass


def downgrade() -> None:
    pass
