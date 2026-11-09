from domain.entities.avaliacao import Avaliacao
from domain.repositories.avaliacao_repository import AvaliacaoRepository


class ListarAvaliacoesParaAdministradorUseCase:
    def __init__(self, repository: AvaliacaoRepository) -> None:
        self.repository = repository

    def execute(self) -> list[Avaliacao]:
        return self.repository.listar()
