from abc import ABC, abstractmethod

from domain.entities.cliente import Cliente


class ClienteRepository(ABC):
    @abstractmethod
    def criar(self, cliente: Cliente) -> Cliente: ...

    @abstractmethod
    def buscar_por_id(self, cliente_id: int) -> Cliente | None: ...

    @abstractmethod
    def buscar_por_email(self, email: str) -> Cliente | None: ...

    @abstractmethod
    def listar(self, apenas_ativos: bool = False) -> list[Cliente]: ...

    @abstractmethod
    def atualizar(self, cliente: Cliente) -> Cliente: ...