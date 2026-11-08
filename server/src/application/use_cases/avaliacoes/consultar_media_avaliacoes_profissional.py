from dataclasses import dataclass

from application.common.exceptions import ProfissionalNaoEncontradoError
from domain.repositories.avaliacao_repository import AvaliacaoRepository
from domain.repositories.profissional_repository import ProfissionalRepository


@dataclass(frozen=True)
class MediaAvaliacoesProfissional:
    profissional_id: int
    media_nota: float | None
    total_avaliacoes: int


class ConsultarMediaAvaliacoesProfissionalUseCase:
    def __init__(
        self,
        profissional_repository: ProfissionalRepository,
        avaliacao_repository: AvaliacaoRepository,
    ) -> None:
        self.profissional_repository = profissional_repository
        self.avaliacao_repository = avaliacao_repository

    def execute(
        self,
        profissional_id: int,
    ) -> MediaAvaliacoesProfissional:
        profissional = self.profissional_repository.buscar_por_id(profissional_id)
        if profissional is None:
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {profissional_id} nao encontrado."
            )

        return MediaAvaliacoesProfissional(
            profissional_id=profissional.id,
            media_nota=self.avaliacao_repository.calcular_media_por_profissional(
                profissional.id
            ),
            total_avaliacoes=self.avaliacao_repository.contar_por_profissional(
                profissional.id
            ),
        )
