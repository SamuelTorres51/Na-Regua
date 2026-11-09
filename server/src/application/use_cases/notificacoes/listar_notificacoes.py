from domain.entities.notificacao import Notificacao
from domain.repositories.notificacao_repository import NotificacaoRepository


class ListarNotificacoesUseCase:
    def __init__(self, notificacao_repository: NotificacaoRepository) -> None:
        self.notificacao_repository = notificacao_repository

    def execute(
        self,
        usuario_id: int,
        apenas_nao_lidas: bool = False,
    ) -> list[Notificacao]:
        return self.notificacao_repository.listar_por_usuario(
            usuario_id=usuario_id,
            apenas_nao_lidas=apenas_nao_lidas,
        )

