from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column

from domain.enums.status_agendamento import StatusAgendamento
from infrastructure.database.models.base import Base


class AgendamentoModel(Base):
    __tablename__ = "agendamentos"
    __table_args__ = (
        Index("ix_agendamentos_profissional_inicio", "profissional_id", "inicio"),
        Index("ix_agendamentos_cliente_inicio", "cliente_id", "inicio"),
        Index("ix_agendamentos_status_inicio", "status", "inicio"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    profissional_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    servico_id: Mapped[int] = mapped_column(
        ForeignKey("servicos.id"),
        nullable=False,
    )

    inicio: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    duracao_minutos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[StatusAgendamento] = mapped_column(
        Enum(
            StatusAgendamento,
            values_callable=lambda enum_type: [
                status.value for status in enum_type
            ],
            name="statusagendamento",
        ),
        nullable=False,
        default=StatusAgendamento.AGENDADO,
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
