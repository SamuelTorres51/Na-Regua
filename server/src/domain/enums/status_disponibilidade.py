from enum import Enum


class StatusDisponibilidade(str, Enum):
    DISPONIVEL = "disponivel"
    LOTADO = "lotado"
    FOLGA = "folga"
    FECHADO = "fechado"
