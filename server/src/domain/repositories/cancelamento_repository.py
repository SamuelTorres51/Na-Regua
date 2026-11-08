from abc import ABC, abstractmethod

from domain.entities.cancelamento import Cancelamento


class CancelamentoRepository(ABC):
    @abstractmethod
    def criar(self, cancelamento: Cancelamento) -> Cancelamento: ...

    @abstractmethod
    def buscar_por_agendamento_id(
        self,
        agendamento_id: int,
    ) -> Cancelamento | None: ...
