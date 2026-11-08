from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Cancelamento:
    id: int | None
    agendamento_id: int
    autor_id: int
    motivo: str
    cancelado_em: datetime