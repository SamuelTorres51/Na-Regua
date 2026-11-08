from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from domain.enums.tipo_notificacao import TipoNotificacao
from infrastructure.database.models.base import Base


class NotificacaoModel(Base):
    __tablename__ = "notificacoes"
    __table_args__ = (
        Index("ix_notificacoes_usuario_lida", "usuario_id", "lida"),
        Index("ix_notificacoes_agendamento_tipo", "agendamento_id", "tipo"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    agendamento_id: Mapped[int | None] = mapped_column(
        ForeignKey("agendamentos.id"),
        nullable=True,
    )

    tipo: Mapped[TipoNotificacao] = mapped_column(
        Enum(
            TipoNotificacao,
            values_callable=lambda enum_type: [
                tipo.value for tipo in enum_type
            ],
            name="tiponotificacao",
        ),
        nullable=False,
    )

    mensagem: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    enviada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    lida: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

