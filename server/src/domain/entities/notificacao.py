from dataclasses import dataclass, field
from datetime import datetime, timezone

from domain.enums.tipo_notificacao import TipoNotificacao


@dataclass
class Notificacao:
    id: int | None
    usuario_id: int
    tipo: TipoNotificacao
    mensagem: str
    enviada_em: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    lida: bool = False
    agendamento_id: int | None = None

