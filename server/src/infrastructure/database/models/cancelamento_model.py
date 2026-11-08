from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.models.base import Base


class CancelamentoModel(Base):
    __tablename__ = "cancelamentos"
    __table_args__ = (
        UniqueConstraint(
            "agendamento_id",
            name="uq_cancelamentos_agendamento_id",
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
    )

    autor_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )

    motivo: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    cancelado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
