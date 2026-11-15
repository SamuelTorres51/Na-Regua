from abc import ABC, abstractmethod
from datetime import datetime, timedelta

from domain.entities.agendamento import Agendamento
from domain.entities.periodo import Periodo
from domain.enums.status_agendamento import (
    STATUS_QUE_OCUPAM_AGENDA,
    StatusAgendamento,
)


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

    def listar_ocupados(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> list[Periodo]:
        """Períodos dos agendamentos ativos do profissional que tocam [inicio, fim).

        Esta versão genérica se apoia em `listar`; repositórios com banco de
        dados devem sobrescrevê-la com uma consulta direta.
        """
        periodos = []
        for agendamento in self.listar(profissional_id=profissional_id, fim=fim):
            if agendamento.status not in STATUS_QUE_OCUPAM_AGENDA:
                continue
            termino = agendamento.inicio + timedelta(
                minutes=agendamento.duracao_minutos
            )
            if agendamento.inicio < fim and termino > inicio:
                periodos.append(Periodo(agendamento.inicio, termino))
        return periodos