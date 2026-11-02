from application.common.exceptions import ServicoNaoEncontradoError
from domain.entities.servico import Servico
from domain.repositories.servico_repository import ServicoRepository


class BuscarServicoPorIdUseCase:
    def __init__(self, servico_repository: ServicoRepository) -> None:
        self.servico_repository = servico_repository

    def execute(self, servico_id: int) -> Servico:
        servico = self.servico_repository.buscar_por_id(servico_id)
        if servico is None:
            raise ServicoNaoEncontradoError(f"Serviço com ID {servico_id} não encontrado.")
        return servico
