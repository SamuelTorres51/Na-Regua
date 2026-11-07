from domain.entities.profissional_servico import ProfissionalServico
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.servico_repository import ServicoRepository
from domain.repositories.usuario_repository import UsuarioRepository
from application.common.exceptions import (
    ProfissionalServicoDuplicadoError,
    ProfissionalNaoEncontradoError,
    ServicoNaoEncontradoError,
)


class AssociarProfissionalServicoUseCase:
    def __init__(
        self,
        associacao_repository: ProfissionalServicoRepository,
        usuario_repository: UsuarioRepository,
        servico_repository: ServicoRepository,
    ) -> None:
        self.associacao_repository = associacao_repository
        self.usuario_repository = usuario_repository
        self.servico_repository = servico_repository

    def execute(
        self,
        profissional_id: int,
        servico_id: int,
    ) -> ProfissionalServico:
        profissional = self.usuario_repository.buscar_por_id(profissional_id)
        if (
            profissional is None
            or profissional.perfil != PerfilAcesso.PROFISSIONAL
        ):
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {profissional_id} não encontrado."
            )

        if self.servico_repository.buscar_por_id(servico_id) is None:
            raise ServicoNaoEncontradoError(
                f"Serviço com ID {servico_id} não encontrado."
            )

        if self.associacao_repository.existe(profissional_id, servico_id):
            raise ProfissionalServicoDuplicadoError(
                "O profissional já está associado a este serviço."
            )

        return self.associacao_repository.associar(
            ProfissionalServico(
                profissional_id=profissional_id,
                servico_id=servico_id,
            )
        )
