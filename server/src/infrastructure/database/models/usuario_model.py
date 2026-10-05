from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from domain.enums.perfil_acesso import PerfilAcesso
from infrastructure.database.models.base import Base


class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
        index=True,
    )

    telefone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    senha_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    perfil: Mapped[PerfilAcesso] = mapped_column(
        Enum(
            PerfilAcesso,
            values_callable=lambda enum_type: [
                perfil.value for perfil in enum_type
            ],
        ),
        nullable=False,
    )

    ativo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )