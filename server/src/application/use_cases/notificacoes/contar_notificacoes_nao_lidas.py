from domain.repositories.notificacao_repository import NotificacaoRepository


class ContarNotificacoesNaoLidasUseCase:
    def __init__(self, notificacao_repository: NotificacaoRepository) -> None:
        self.notificacao_repository = notificacao_repository

    def execute(self, usuario_id: int) -> int:
        return self.notificacao_repository.contar_nao_lidas(usuario_id)

