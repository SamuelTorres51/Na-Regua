from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column

from domain.enums.status_agendamento import StatusAgendamento
from infrastructure.database.models.base import Base


class AgendamentoModel(Base):
    __tablename__ = "agendamentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cliente_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    profissional_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )
    servico_id: Mapped[int] = mapped_column(Integer, nullable=False)
    inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duracao_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[StatusAgendamento] = mapped_column(
        Enum(
            StatusAgendamento,
            values_callable=lambda enum_type: [
                status.value for status in enum_type
            ],
            name="statusagendamento",
        ),
        nullable=False,
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
