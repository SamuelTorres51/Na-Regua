from domain.entities.servico import Servico
from domain.repositories.servico_repository import ServicoRepository


class ListarServicosUseCase:
    def __init__(self, servico_repository: ServicoRepository) -> None:
        self.servico_repository = servico_repository

    def execute(self, apenas_ativos: bool = False) -> list[Servico]:
        return self.servico_repository.listar(apenas_ativos=apenas_ativos)
