from abc import ABC, abstractmethod
from datetime import datetime

from domain.entities.agendamento import Agendamento


class AgendamentoRepository(ABC):
    @abstractmethod
    def buscar_conflito(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> Agendamento | None: ...

    @abstractmethod
    def criar(self, agendamento: Agendamento) -> Agendamento: ...