from application.common.exceptions import ProfissionalNaoEncontradoError
from domain.entities.profissional import Profissional
from domain.repositories.profissional_repository import ProfissionalRepository


class InativarProfissionalUseCase:
    def __init__(self, profissional_repository: ProfissionalRepository) -> None:
        self.profissional_repository = profissional_repository

    def execute(self, profissional_id: int) -> Profissional:
        profissional = self.profissional_repository.buscar_por_id(profissional_id)
        if profissional is None:
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {profissional_id} não encontrado."
            )

        profissional.ativo = False
        return self.profissional_repository.atualizar(profissional)
