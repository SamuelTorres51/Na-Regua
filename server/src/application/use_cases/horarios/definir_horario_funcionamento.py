from application.use_cases.horarios.validacao import validar_turnos
from domain.entities.turno import Turno
from domain.repositories.horario_repository import HorarioRepository


class DefinirHorarioFuncionamentoUseCase:
    def __init__(self, horario_repository: HorarioRepository) -> None:
        self.horario_repository = horario_repository

    def execute(self, turnos: list[Turno]) -> list[Turno]:
        return self.horario_repository.definir_funcionamento(validar_turnos(turnos))
