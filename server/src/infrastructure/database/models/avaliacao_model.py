from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.models.base import Base


class AvaliacaoModel(Base):
    __tablename__ = "avaliacoes"
    __table_args__ = (
        CheckConstraint(
            "nota BETWEEN 1 AND 5",
            name="ck_avaliacoes_nota_intervalo",
        ),
        Index(
            "ix_avaliacoes_cliente_criada_em",
            "cliente_id",
            "criada_em",
        ),
        Index(
            "ix_avaliacoes_profissional_criada_em",
            "profissional_id",
            "criada_em",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    agendamento_id: Mapped[int] = mapped_column(
        ForeignKey("agendamentos.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
    )

    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )

    profissional_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )

    nota: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    comentario: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
        default="",
    )

    criada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
