from abc import ABC, abstractmethod

from domain.entities.notificacao import Notificacao
from domain.enums.tipo_notificacao import TipoNotificacao


class NotificacaoRepository(ABC):
    @abstractmethod
    def criar(self, notificacao: Notificacao) -> Notificacao: ...

    @abstractmethod
    def buscar_por_id(self, notificacao_id: int) -> Notificacao | None: ...

    @abstractmethod
    def listar_por_usuario(
        self,
        usuario_id: int,
        apenas_nao_lidas: bool = False,
    ) -> list[Notificacao]: ...

    @abstractmethod
    def marcar_como_lida(self, notificacao_id: int) -> Notificacao | None: ...

    @abstractmethod
    def marcar_todas_como_lidas(self, usuario_id: int) -> int: ...

    @abstractmethod
    def contar_nao_lidas(self, usuario_id: int) -> int: ...

    @abstractmethod
    def existe_notificacao_agendamento(
        self,
        agendamento_id: int,
        tipo: TipoNotificacao,
    ) -> bool: ...

