"""unifica heads das migrations

Revision ID: 5b2c3d4e5f6a
Revises: 4a1f2c3d4e5f, 7380303b8d90
Create Date: 2026-11-05
"""
from typing import Sequence, Union


revision: str = "5b2c3d4e5f6a"
down_revision: Union[tuple[str, str], None] = (
    "4a1f2c3d4e5f",
    "7380303b8d90",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
