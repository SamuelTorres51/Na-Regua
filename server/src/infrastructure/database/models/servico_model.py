from sqlalchemy import Boolean, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.models.base import Base


class ServicoModel(Base):
    __tablename__ = "servicos"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
        index=True,
    )

    descricao: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="",
    )

    duracao_minutos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    preco: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    ativo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
