from dataclasses import dataclass
from datetime import datetime, timedelta

from domain.enums.status_agendamento import StatusAgendamento


@dataclass
class Agendamento:
    id: int | None
    cliente_id: int
    profissional_id: int
    servico_id: int
    inicio: datetime
    duracao_minutos: int
    status: StatusAgendamento
    criado_em: datetime

    @property
    def fim(self) -> datetime:
        return self.inicio + timedelta(minutes=self.duracao_minutos)