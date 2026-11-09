from application.common.exceptions import (
    NotificacaoNaoEncontradaError,
    NotificacaoNaoPermitidaError,
)
from domain.entities.notificacao import Notificacao
from domain.repositories.notificacao_repository import NotificacaoRepository


class MarcarNotificacaoLidaUseCase:
    def __init__(self, notificacao_repository: NotificacaoRepository) -> None:
        self.notificacao_repository = notificacao_repository

    def execute(self, notificacao_id: int, usuario_id: int) -> Notificacao:
        notificacao = self.notificacao_repository.buscar_por_id(notificacao_id)
        if notificacao is None:
            raise NotificacaoNaoEncontradaError(
                f"Notificação com ID {notificacao_id} não encontrada."
            )

        if notificacao.usuario_id != usuario_id:
            raise NotificacaoNaoPermitidaError(
                "O usuário não tem permissão para alterar esta notificação."
            )

        atualizada = self.notificacao_repository.marcar_como_lida(notificacao_id)
        if atualizada is None:
            raise NotificacaoNaoEncontradaError(
                f"Notificação com ID {notificacao_id} não encontrada."
            )
        return atualizada

