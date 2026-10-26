from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from domain.entities.agendamento import Agendamento
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from infrastructure.database.models.agendamento_model import AgendamentoModel


class SqlAlchemyAgendamentoRepository(AgendamentoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def buscar_conflito(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> Agendamento | None:
        modelos = self.db.scalars(
            select(AgendamentoModel).where(
                AgendamentoModel.profissional_id == profissional_id,
                AgendamentoModel.status != StatusAgendamento.CANCELADO,
                AgendamentoModel.inicio < fim,
            )
        ).all()

        for modelo in modelos:
            agendamento = _para_entidade(modelo)
            if agendamento.fim > inicio:
                return agendamento
        return None

    def criar(self, agendamento: Agendamento) -> Agendamento:
        modelo = AgendamentoModel(
            cliente_id=agendamento.cliente_id,
            profissional_id=agendamento.profissional_id,
            servico_id=agendamento.servico_id,
            inicio=agendamento.inicio,
            duracao_minutos=agendamento.duracao_minutos,
            status=agendamento.status,
            criado_em=agendamento.criado_em,
        )
        self.db.add(modelo)
        self.db.commit()
        self.db.refresh(modelo)
        return _para_entidade(modelo)


def _para_entidade(modelo: AgendamentoModel) -> Agendamento:
    return Agendamento(
        id=modelo.id,
        cliente_id=modelo.cliente_id,
        profissional_id=modelo.profissional_id,
        servico_id=modelo.servico_id,
        inicio=modelo.inicio,
        duracao_minutos=modelo.duracao_minutos,
        status=modelo.status,
        criado_em=modelo.criado_em,
    )
