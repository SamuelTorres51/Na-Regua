from dataclasses import dataclass
from datetime import time

from domain.enums.dia_semana import DiaSemana


@dataclass(frozen=True)
class Turno:
    """Faixa de atendimento semanal, como "segunda das 08:00 às 12:00".

    A pausa do almoço é representada por dois turnos no mesmo dia.
    """

    dia_semana: DiaSemana
    inicio: time
    fim: time
