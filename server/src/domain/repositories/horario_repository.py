from abc import ABC, abstractmethod

from domain.entities.turno import Turno


class HorarioRepository(ABC):
    @abstractmethod
    def listar_funcionamento(self) -> list[Turno]: ...

    @abstractmethod
    def definir_funcionamento(self, turnos: list[Turno]) -> list[Turno]: ...

    @abstractmethod
    def buscar_jornada(self, profissional_id: int) -> list[Turno] | None:
        """None quando o profissional não tem jornada própria e segue a barbearia."""

    @abstractmethod
    def definir_jornada(
        self,
        profissional_id: int,
        turnos: list[Turno] | None,
    ) -> list[Turno] | None:
        """Substitui a jornada; None remove a jornada própria do profissional."""
