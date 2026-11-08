from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from domain.entities.avaliacao import Avaliacao
from domain.repositories.avaliacao_repository import AvaliacaoRepository
from infrastructure.database.models.avaliacao_model import AvaliacaoModel


class SqlAlchemyAvaliacaoRepository(AvaliacaoRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def criar(self, avaliacao: Avaliacao) -> Avaliacao:
        model = AvaliacaoModel(
            agendamento_id=avaliacao.agendamento_id,
            cliente_id=avaliacao.cliente_id,
            profissional_id=avaliacao.profissional_id,
            nota=avaliacao.nota,
            comentario=avaliacao.comentario,
            criada_em=avaliacao.criada_em,
        )
        try:
            self._db.add(model)
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def buscar_por_agendamento_id(
        self,
        agendamento_id: int,
    ) -> Avaliacao | None:
        query = select(AvaliacaoModel).where(
            AvaliacaoModel.agendamento_id == agendamento_id
        )
        model = self._db.scalar(query)
        return _para_entidade(model) if model is not None else None

    def listar(
        self,
        *,
        cliente_id: int | None = None,
        profissional_id: int | None = None,
    ) -> list[Avaliacao]:
        query = select(AvaliacaoModel).order_by(AvaliacaoModel.criada_em.desc())

        if cliente_id is not None:
            query = query.where(AvaliacaoModel.cliente_id == cliente_id)
        if profissional_id is not None:
            query = query.where(AvaliacaoModel.profissional_id == profissional_id)

        return [_para_entidade(model) for model in self._db.scalars(query).all()]

    def calcular_media_por_profissional(
        self,
        profissional_id: int,
    ) -> float | None:
        query = select(func.avg(AvaliacaoModel.nota)).where(
            AvaliacaoModel.profissional_id == profissional_id
        )
        media = self._db.scalar(query)
        return float(media) if media is not None else None


def _para_entidade(model: AvaliacaoModel) -> Avaliacao:
    return Avaliacao(
        id=model.id,
        agendamento_id=model.agendamento_id,
        cliente_id=model.cliente_id,
        profissional_id=model.profissional_id,
        nota=model.nota,
        comentario=model.comentario,
        criada_em=model.criada_em,
    )
