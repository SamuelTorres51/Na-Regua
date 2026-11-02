from abc import ABC, abstractmethod

from domain.entities.profissional import Profissional


class ProfissionalRepository(ABC):
    @abstractmethod
    def buscar_por_id(self, profissional_id: int) -> Profissional | None: ...

    @abstractmethod
    def buscar_por_email(self, email: str) -> Profissional | None: ...

    @abstractmethod
    def listar(self, apenas_ativos: bool = False) -> list[Profissional]: ...

    @abstractmethod
    def criar(self, profissional: Profissional) -> Profissional: ...

    @abstractmethod
    def atualizar(self, profissional: Profissional) -> Profissional: ...
