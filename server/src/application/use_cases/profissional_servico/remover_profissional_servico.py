from application.common.exceptions import (
    ProfissionalServicoNaoEncontradoError,
)
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)


class RemoverProfissionalServicoUseCase:
    def __init__(
        self,
        associacao_repository: ProfissionalServicoRepository,
    ) -> None:
        self.associacao_repository = associacao_repository

    def execute(self, profissional_id: int, servico_id: int) -> None:
        removido = self.associacao_repository.remover(
            profissional_id,
            servico_id,
        )
        if not removido:
            raise ProfissionalServicoNaoEncontradoError(
                "A associação entre profissional e serviço não foi encontrada."
            )
