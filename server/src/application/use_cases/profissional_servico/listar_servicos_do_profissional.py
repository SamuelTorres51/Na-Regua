from application.common.exceptions import ProfissionalNaoEncontradoError
from domain.entities.servico import Servico
from domain.repositories.profissional_repository import ProfissionalRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.servico_repository import ServicoRepository


class ListarServicosDoProfissionalUseCase:
    def __init__(
        self,
        associacao_repository: ProfissionalServicoRepository,
        servico_repository: ServicoRepository,
        profissional_repository: ProfissionalRepository,
    ) -> None:
        self.associacao_repository = associacao_repository
        self.servico_repository = servico_repository
        self.profissional_repository = profissional_repository

    def execute(self, profissional_id: int) -> list[Servico]:
        if self.profissional_repository.buscar_por_id(profissional_id) is None:
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {profissional_id} não encontrado."
            )
        servico_ids = (
            self.associacao_repository.listar_servicos_por_profissional(
                profissional_id
            )
        )
        servicos = (
            self.servico_repository.buscar_por_id(servico_id)
            for servico_id in servico_ids
        )
        return [servico for servico in servicos if servico is not None]
