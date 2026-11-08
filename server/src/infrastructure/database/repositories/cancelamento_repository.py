from sqlalchemy import select
from sqlalchemy.orm import Session

from domain.entities.cancelamento import Cancelamento
from domain.repositories.cancelamento_repository import CancelamentoRepository
from infrastructure.database.models.cancelamento_model import CancelamentoModel


class SqlAlchemyCancelamentoRepository(CancelamentoRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def criar(self, cancelamento: Cancelamento) -> Cancelamento:
        model = CancelamentoModel(
            agendamento_id=cancelamento.agendamento_id,
            autor_id=cancelamento.autor_id,
            motivo=cancelamento.motivo,
            cancelado_em=cancelamento.cancelado_em,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return _para_entidade(model)

    def buscar_por_agendamento_id(
        self,
        agendamento_id: int,
    ) -> Cancelamento | None:
        query = select(CancelamentoModel).where(
            CancelamentoModel.agendamento_id == agendamento_id
        )
        model = self._db.scalar(query)
        return _para_entidade(model) if model is not None else None


def _para_entidade(model: CancelamentoModel) -> Cancelamento:
    return Cancelamento(
        id=model.id,
        agendamento_id=model.agendamento_id,
        autor_id=model.autor_id,
        motivo=model.motivo,
        cancelado_em=model.cancelado_em,
    )
