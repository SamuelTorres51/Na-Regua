from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.models.base import Base


class ProfissionalServicoModel(Base):
    __tablename__ = "profissional_servicos"

    profissional_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        primary_key=True,
    )

    servico_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("servicos.id", ondelete="RESTRICT"),
        primary_key=True,
    )
