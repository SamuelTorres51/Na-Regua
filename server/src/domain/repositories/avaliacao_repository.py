from abc import ABC, abstractmethod

from domain.entities.avaliacao import Avaliacao


class AvaliacaoRepository(ABC):
    @abstractmethod
    def criar(self, avaliacao: Avaliacao) -> Avaliacao: ...

    @abstractmethod
    def buscar_por_agendamento_id(
        self,
        agendamento_id: int,
    ) -> Avaliacao | None: ...

    @abstractmethod
    def listar(
        self,
        *,
        cliente_id: int | None = None,
        profissional_id: int | None = None,
    ) -> list[Avaliacao]: ...

    @abstractmethod
    def calcular_media_por_profissional(
        self,
        profissional_id: int,
    ) -> float | None: ...
