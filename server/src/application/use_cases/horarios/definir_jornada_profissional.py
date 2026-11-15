from application.common.exceptions import (
    ProfissionalNaoEncontradoError,
    ValidationError,
)
from application.use_cases.horarios.validacao import validar_turnos
from domain.entities.turno import Turno
from domain.repositories.horario_repository import HorarioRepository
from domain.repositories.profissional_repository import ProfissionalRepository


class DefinirJornadaProfissionalUseCase:
    def __init__(
        self,
        profissional_repository: ProfissionalRepository,
        horario_repository: HorarioRepository,
    ) -> None:
        self.profissional_repository = profissional_repository
        self.horario_repository = horario_repository

    def execute(
        self,
        profissional_id: int,
        turnos: list[Turno] | None,
    ) -> list[Turno] | None:
        """Define a jornada própria; None faz o profissional seguir a barbearia."""
        if self.profissional_repository.buscar_por_id(profissional_id) is None:
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {profissional_id} não encontrado."
            )

        if turnos is not None:
            if not turnos:
                raise ValidationError(
                    "Informe ao menos um turno ou envie null para o profissional "
                    "seguir o horário da barbearia."
                )
            turnos = validar_turnos(turnos)

        return self.horario_repository.definir_jornada(profissional_id, turnos)
