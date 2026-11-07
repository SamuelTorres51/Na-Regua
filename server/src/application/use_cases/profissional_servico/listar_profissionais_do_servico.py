from application.common.exceptions import ServicoNaoEncontradoError
from domain.entities.profissional import Profissional
from domain.repositories.profissional_repository import ProfissionalRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.servico_repository import ServicoRepository


class ListarProfissionaisDoServicoUseCase:
    def __init__(
        self,
        associacao_repository: ProfissionalServicoRepository,
        profissional_repository: ProfissionalRepository,
        servico_repository: ServicoRepository,
    ) -> None:
        self.associacao_repository = associacao_repository
        self.profissional_repository = profissional_repository
        self.servico_repository = servico_repository

    def execute(self, servico_id: int) -> list[Profissional]:
        if self.servico_repository.buscar_por_id(servico_id) is None:
            raise ServicoNaoEncontradoError(
                f"Serviço com ID {servico_id} não encontrado."
            )
        profissional_ids = (
            self.associacao_repository.listar_profissionais_por_servico(
                servico_id
            )
        )
        profissionais = (
            self.profissional_repository.buscar_por_id(profissional_id)
            for profissional_id in profissional_ids
        )
        return [profissional for profissional in profissionais if profissional is not None]
