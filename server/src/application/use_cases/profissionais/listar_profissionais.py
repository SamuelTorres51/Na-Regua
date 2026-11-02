from domain.entities.profissional import Profissional
from domain.repositories.profissional_repository import ProfissionalRepository


class ListarProfissionaisUseCase:
    def __init__(self, profissional_repository: ProfissionalRepository) -> None:
        self.profissional_repository = profissional_repository

    def execute(self, apenas_ativos: bool = False) -> list[Profissional]:
        return self.profissional_repository.listar(apenas_ativos=apenas_ativos)
