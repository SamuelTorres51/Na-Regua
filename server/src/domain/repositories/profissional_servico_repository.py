from abc import ABC, abstractmethod

from domain.entities.profissional_servico import ProfissionalServico


class ProfissionalServicoRepository(ABC):
    @abstractmethod
    def associar(
        self,
        profissional_servico: ProfissionalServico,
    ) -> ProfissionalServico: ...

    @abstractmethod
    def remover(self, profissional_id: int, servico_id: int) -> bool: ...

    @abstractmethod
    def existe(self, profissional_id: int, servico_id: int) -> bool: ...

    @abstractmethod
    def listar_servicos_por_profissional(
        self,
        profissional_id: int,
    ) -> list[int]: ...

    @abstractmethod
    def listar_profissionais_por_servico(
        self,
        servico_id: int,
    ) -> list[int]: ...
