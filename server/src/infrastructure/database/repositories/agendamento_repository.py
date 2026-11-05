from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from domain.entities.agendamento import Agendamento
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from infrastructure.database.models.agendamento_model import AgendamentoModel


_STATUS_ATIVOS = (
    StatusAgendamento.AGENDADO,
    StatusAgendamento.CONFIRMADO,
    StatusAgendamento.EM_ATENDIMENTO,
)


class SqlAlchemyAgendamentoRepository(AgendamentoRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def criar(self, agendamento: Agendamento) -> Agendamento:
        model = AgendamentoModel(
            cliente_id=agendamento.cliente_id,
            profissional_id=agendamento.profissional_id,
            servico_id=agendamento.servico_id,
            inicio=agendamento.inicio,
            duracao_minutos=agendamento.duracao_minutos,
            status=agendamento.status,
            criado_em=agendamento.criado_em,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return _para_entidade(model)

    def listar(
        self,
        *,
        inicio: datetime | None = None,
        fim: datetime | None = None,
        profissional_id: int | None = None,
        cliente_id: int | None = None,
        status: StatusAgendamento | None = None,
    ) -> list[Agendamento]:
        query = select(AgendamentoModel).order_by(AgendamentoModel.inicio)

        if inicio is not None:
            query = query.where(AgendamentoModel.inicio >= inicio)
        if fim is not None:
            query = query.where(AgendamentoModel.inicio <= fim)
        if profissional_id is not None:
            query = query.where(AgendamentoModel.profissional_id == profissional_id)
        if cliente_id is not None:
            query = query.where(AgendamentoModel.cliente_id == cliente_id)
        if status is not None:
            query = query.where(AgendamentoModel.status == status)

        return [_para_entidade(model) for model in self._db.scalars(query).all()]

    def existe_conflito_profissional(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return self._existe_conflito(
            AgendamentoModel.profissional_id == profissional_id,
            inicio,
            fim,
        )

    def existe_conflito_cliente(
        self,
        cliente_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return self._existe_conflito(
            AgendamentoModel.cliente_id == cliente_id,
            inicio,
            fim,
        )

    def _existe_conflito(
        self,
        titular_condition: object,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        query = select(AgendamentoModel.id).where(
            titular_condition,
            AgendamentoModel.status.in_(_STATUS_ATIVOS),
            AgendamentoModel.inicio < fim,
            AgendamentoModel.inicio
            + func.make_interval(
                0,
                0,
                0,
                0,
                0,
                AgendamentoModel.duracao_minutos,
            )
            > inicio,
        )
        return self._db.scalar(query) is not None


def _para_entidade(model: AgendamentoModel) -> Agendamento:
    return Agendamento(
        id=model.id,
        cliente_id=model.cliente_id,
        profissional_id=model.profissional_id,
        servico_id=model.servico_id,
        inicio=model.inicio,
        duracao_minutos=model.duracao_minutos,
        status=model.status,
        criado_em=model.criado_em,
    )
