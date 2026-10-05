"""usuario

Revision ID: 9ffec06768e7
Revises: 0001_base
Create Date: 2026-09-14 13:29:19.890738
"""
from typing import Sequence, Union

revision: str = '9ffec06768e7'
down_revision: Union[str, None] = '0001_base'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # A tabela usuarios é criada pela 0001_base. Esta revisão não deve
    # removê-la ao aplicar o histórico de migrações.
    pass


def downgrade() -> None:
    pass
