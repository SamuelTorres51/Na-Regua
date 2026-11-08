from application.common.exceptions import AvaliacaoNaoPermitidaError
from domain.entities.avaliacao import Avaliacao
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.avaliacao_repository import AvaliacaoRepository


class ListarAvaliacoesDoClienteUseCase:
    def __init__(self, repository: AvaliacaoRepository) -> None:
        self.repository = repository

    def execute(self, usuario_atual: Usuario) -> list[Avaliacao]:
        if usuario_atual.perfil != PerfilAcesso.CLIENTE:
            raise AvaliacaoNaoPermitidaError(
                "Apenas clientes podem consultar o proprio historico de avaliacoes."
            )

        return self.repository.listar(cliente_id=usuario_atual.id)
