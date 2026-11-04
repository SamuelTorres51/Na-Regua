from dataclasses import dataclass, field
from datetime import datetime, timezone

from domain.enums.status_agendamento import StatusAgendamento


@dataclass
class Agendamento:
    id: int | None
    cliente_id: int
    profissional_id: int
    servico_id: int
    inicio: datetime
    duracao_minutos: int
    status: StatusAgendamento = StatusAgendamento.AGENDADO
    criado_em: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )