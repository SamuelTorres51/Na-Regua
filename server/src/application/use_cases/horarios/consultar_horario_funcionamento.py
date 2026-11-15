from domain.entities.turno import Turno
from domain.repositories.horario_repository import HorarioRepository


class ConsultarHorarioFuncionamentoUseCase:
    def __init__(self, horario_repository: HorarioRepository) -> None:
        self.horario_repository = horario_repository

    def execute(self) -> list[Turno]:
        return self.horario_repository.listar_funcionamento()
