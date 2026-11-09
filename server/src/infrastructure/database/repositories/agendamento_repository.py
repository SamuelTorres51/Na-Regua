from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from domain.entities.agendamento import (
    Agendamento,
    PessoaAgendamento,
    ServicoAgendamento,
)
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from infrastructure.database.models.agendamento_model import AgendamentoModel
from infrastructure.database.models.servico_model import ServicoModel
from infrastructure.database.models.usuario_model import UsuarioModel


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
        return _para_entidade(model, self._db)

    def buscar_por_id(self, agendamento_id: int) -> Agendamento | None:
        model = self._db.get(AgendamentoModel, agendamento_id)
        return _para_entidade(model, self._db) if model is not None else None

    def atualizar_status(
        self,
        agendamento_id: int,
        status: StatusAgendamento,
    ) -> Agendamento | None:
        model = self._db.get(AgendamentoModel, agendamento_id)
        if model is None:
            return None
        model.status = status
        self._db.commit()
        self._db.refresh(model)
        return _para_entidade(model, self._db)

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

        return [
            _para_entidade(model, self._db)
            for model in self._db.scalars(query).all()
        ]

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


def _para_entidade(model: AgendamentoModel, db: Session) -> Agendamento:
    cliente = db.get(UsuarioModel, model.cliente_id)
    profissional = db.get(UsuarioModel, model.profissional_id)
    servico = db.get(ServicoModel, model.servico_id)
    return Agendamento(
        id=model.id,
        cliente_id=model.cliente_id,
        profissional_id=model.profissional_id,
        servico_id=model.servico_id,
        inicio=model.inicio,
        duracao_minutos=model.duracao_minutos,
        status=model.status,
        criado_em=model.criado_em,
        cliente=(
            PessoaAgendamento(id=cliente.id, nome=cliente.nome)
            if cliente is not None
            else None
        ),
        profissional=(
            PessoaAgendamento(id=profissional.id, nome=profissional.nome)
            if profissional is not None
            else None
        ),
        servico=(
            ServicoAgendamento(
                id=servico.id,
                nome=servico.nome,
                preco=servico.preco,
            )
            if servico is not None
            else None
        ),
    )
