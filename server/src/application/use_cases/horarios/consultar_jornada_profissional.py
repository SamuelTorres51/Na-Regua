from application.common.exceptions import ProfissionalNaoEncontradoError
from domain.entities.turno import Turno
from domain.repositories.horario_repository import HorarioRepository
from domain.repositories.profissional_repository import ProfissionalRepository


class ConsultarJornadaProfissionalUseCase:
    def __init__(
        self,
        profissional_repository: ProfissionalRepository,
        horario_repository: HorarioRepository,
    ) -> None:
        self.profissional_repository = profissional_repository
        self.horario_repository = horario_repository

    def execute(self, profissional_id: int) -> list[Turno] | None:
        """None indica que o profissional segue o horário da barbearia."""
        if self.profissional_repository.buscar_por_id(profissional_id) is None:
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {profissional_id} não encontrado."
            )
        return self.horario_repository.buscar_jornada(profissional_id)
