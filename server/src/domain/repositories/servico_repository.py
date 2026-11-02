from abc import ABC, abstractmethod

from domain.entities.servico import Servico


class ServicoRepository(ABC):
    @abstractmethod
    def buscar_por_id(self, servico_id: int) -> Servico | None: ...

    @abstractmethod
    def buscar_por_nome(self, nome: str) -> Servico | None: ...

    @abstractmethod
    def listar(self, apenas_ativos: bool = False) -> list[Servico]: ...

    @abstractmethod
    def criar(self, servico: Servico) -> Servico: ...

    @abstractmethod
    def atualizar(self, servico: Servico) -> Servico: ...

    @abstractmethod
    def deletar(self, servico_id: int) -> bool: ...
