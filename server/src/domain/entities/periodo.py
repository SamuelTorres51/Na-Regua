from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Periodo:
    """Intervalo semiaberto [inicio, fim).

    Um atendimento que termina às 9:00 não conflita com outro que começa às 9:00.
    """

    inicio: datetime
    fim: datetime
