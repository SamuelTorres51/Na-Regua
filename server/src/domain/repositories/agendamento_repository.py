from abc import ABC, abstractmethod
from datetime import datetime

from domain.entities.agendamento import Agendamento
from domain.enums.status_agendamento import StatusAgendamento


class AgendamentoRepository(ABC):
    @abstractmethod
    def criar(self, agendamento: Agendamento) -> Agendamento: ...

    @abstractmethod
    def buscar_por_id(self, agendamento_id: int) -> Agendamento | None: ...

    @abstractmethod
    def atualizar_status(
        self,
        agendamento_id: int,
        status: StatusAgendamento,
    ) -> Agendamento | None: ...

    @abstractmethod
    def listar(
        self,
        *,
        inicio: datetime | None = None,
        fim: datetime | None = None,
        profissional_id: int | None = None,
        cliente_id: int | None = None,
        status: StatusAgendamento | None = None,
    ) -> list[Agendamento]: ...

    @abstractmethod
    def existe_conflito_profissional(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool: ...

    @abstractmethod
    def existe_conflito_cliente(
        self,
        cliente_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool: ...