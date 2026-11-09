from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Avaliacao:
    id: int | None
    agendamento_id: int
    cliente_id: int
    profissional_id: int
    nota: int
    comentario: str = ""
    criada_em: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
