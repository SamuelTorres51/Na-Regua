from application.common.exceptions import ValidationError
from domain.entities.turno import Turno
from domain.enums.dia_semana import DiaSemana

_NOMES_DOS_DIAS = {
    DiaSemana.SEGUNDA: "segunda-feira",
    DiaSemana.TERCA: "terça-feira",
    DiaSemana.QUARTA: "quarta-feira",
    DiaSemana.QUINTA: "quinta-feira",
    DiaSemana.SEXTA: "sexta-feira",
    DiaSemana.SABADO: "sábado",
    DiaSemana.DOMINGO: "domingo",
}


def validar_turnos(turnos: list[Turno]) -> list[Turno]:
    """Valida os turnos e os devolve ordenados por dia e horário."""
    if not turnos:
        raise ValidationError("Informe ao menos um turno.")

    ordenados = sorted(turnos, key=lambda turno: (turno.dia_semana.indice, turno.inicio))

    for turno in ordenados:
        if turno.inicio >= turno.fim:
            raise ValidationError(
                f"O turno de {_descrever(turno)} deve terminar depois de começar."
            )

    for anterior, atual in zip(ordenados, ordenados[1:]):
        if anterior.dia_semana == atual.dia_semana and atual.inicio < anterior.fim:
            raise ValidationError(
                f"Os turnos de {_descrever(anterior)} e "
                f"{_descrever(atual)} se sobrepõem."
            )

    return ordenados


def _descrever(turno: Turno) -> str:
    return (
        f"{_NOMES_DOS_DIAS[turno.dia_semana]} "
        f"({turno.inicio:%H:%M}–{turno.fim:%H:%M})"
    )
