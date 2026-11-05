from abc import ABC, abstractmethod
from datetime import datetime

from domain.entities.agendamento import Agendamento


class AgendamentoRepository(ABC):
    @abstractmethod
    def criar(self, agendamento: Agendamento) -> Agendamento: ...

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