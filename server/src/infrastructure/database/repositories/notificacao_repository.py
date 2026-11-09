from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from domain.entities.notificacao import Notificacao
from domain.enums.tipo_notificacao import TipoNotificacao
from domain.repositories.notificacao_repository import NotificacaoRepository
from infrastructure.database.models.notificacao_model import NotificacaoModel


class SqlAlchemyNotificacaoRepository(NotificacaoRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def criar(self, notificacao: Notificacao) -> Notificacao:
        model = NotificacaoModel(
            usuario_id=notificacao.usuario_id,
            agendamento_id=notificacao.agendamento_id,
            tipo=notificacao.tipo,
            mensagem=notificacao.mensagem,
            enviada_em=notificacao.enviada_em,
            lida=notificacao.lida,
        )
        try:
            self._db.add(model)
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def buscar_por_id(self, notificacao_id: int) -> Notificacao | None:
        model = self._db.get(NotificacaoModel, notificacao_id)
        return _para_entidade(model) if model is not None else None

    def listar_por_usuario(
        self,
        usuario_id: int,
        apenas_nao_lidas: bool = False,
    ) -> list[Notificacao]:
        query = (
            select(NotificacaoModel)
            .where(NotificacaoModel.usuario_id == usuario_id)
            .order_by(NotificacaoModel.enviada_em.desc())
        )
        if apenas_nao_lidas:
            query = query.where(NotificacaoModel.lida.is_(False))

        models = self._db.scalars(query).all()
        return [_para_entidade(m) for m in models]

    def marcar_como_lida(self, notificacao_id: int) -> Notificacao | None:
        model = self._db.get(NotificacaoModel, notificacao_id)
        if model is None:
            return None
        model.lida = True
        try:
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def marcar_todas_como_lidas(self, usuario_id: int) -> int:
        stmt = (
            update(NotificacaoModel)
            .where(
                NotificacaoModel.usuario_id == usuario_id,
                NotificacaoModel.lida.is_(False),
            )
            .values(lida=True)
        )
        result = self._db.execute(stmt)
        self._db.commit()
        return result.rowcount

    def contar_nao_lidas(self, usuario_id: int) -> int:
        query = select(func.count(NotificacaoModel.id)).where(
            NotificacaoModel.usuario_id == usuario_id,
            NotificacaoModel.lida.is_(False),
        )
        return self._db.scalar(query) or 0

    def existe_notificacao_agendamento(
        self,
        agendamento_id: int,
        tipo: TipoNotificacao,
    ) -> bool:
        query = select(NotificacaoModel.id).where(
            NotificacaoModel.agendamento_id == agendamento_id,
            NotificacaoModel.tipo == tipo,
        )
        return self._db.scalar(query) is not None

    def rollback(self) -> None:
        self._db.rollback()


def _para_entidade(model: NotificacaoModel) -> Notificacao:
    return Notificacao(
        id=model.id,
        usuario_id=model.usuario_id,
        agendamento_id=model.agendamento_id,
        tipo=model.tipo,
        mensagem=model.mensagem,
        enviada_em=model.enviada_em,
        lida=model.lida,
    )

