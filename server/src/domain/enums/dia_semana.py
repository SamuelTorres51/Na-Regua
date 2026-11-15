from datetime import date
from enum import Enum


class DiaSemana(str, Enum):
    SEGUNDA = "segunda"
    TERCA = "terca"
    QUARTA = "quarta"
    QUINTA = "quinta"
    SEXTA = "sexta"
    SABADO = "sabado"
    DOMINGO = "domingo"

    @property
    def indice(self) -> int:
        """Posição no padrão de `date.weekday()`: 0 = segunda ... 6 = domingo."""
        return _ORDEM.index(self)

    @classmethod
    def do_indice(cls, indice: int) -> "DiaSemana":
        return _ORDEM[indice]

    @classmethod
    def da_data(cls, data: date) -> "DiaSemana":
        return _ORDEM[data.weekday()]


_ORDEM: list[DiaSemana] = list(DiaSemana)
