from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from domain.entities.servico import Servico
from domain.repositories.servico_repository import ServicoRepository
from infrastructure.database.models.servico_model import ServicoModel


class SqlAlchemyServicoRepository(ServicoRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def buscar_por_id(self, servico_id: int) -> Servico | None:
        model = self._db.get(ServicoModel, servico_id)
        return _para_entidade(model) if model is not None else None

    def buscar_por_nome(self, nome: str) -> Servico | None:
        model = self._db.scalar(
            select(ServicoModel).where(ServicoModel.nome == nome)
        )
        return _para_entidade(model) if model is not None else None

    def listar(self, apenas_ativos: bool = False) -> list[Servico]:
        query = select(ServicoModel).order_by(ServicoModel.nome)
        if apenas_ativos:
            query = query.where(ServicoModel.ativo.is_(True))
        models = self._db.scalars(query).all()
        return [_para_entidade(m) for m in models]

    def criar(self, servico: Servico) -> Servico:
        model = ServicoModel(
            nome=servico.nome,
            descricao=servico.descricao,
            duracao_minutos=servico.duracao_minutos,
            preco=servico.preco,
            ativo=servico.ativo,
        )
        try:
            self._db.add(model)
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def atualizar(self, servico: Servico) -> Servico:
        if servico.id is None:
            raise ValueError("Não é possível atualizar serviço sem ID.")
        model = self._db.get(ServicoModel, servico.id)
        if model is None:
            raise ValueError(f"Serviço com ID {servico.id} não encontrado.")
        model.nome = servico.nome
        model.descricao = servico.descricao
        model.duracao_minutos = servico.duracao_minutos
        model.preco = servico.preco
        model.ativo = servico.ativo
        try:
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def deletar(self, servico_id: int) -> bool:
        model = self._db.get(ServicoModel, servico_id)
        if model is None:
            return False
        try:
            self._db.delete(model)
            self._db.commit()
            return True
        except IntegrityError:
            self._db.rollback()
            raise

    def rollback(self) -> None:
        self._db.rollback()


def _para_entidade(model: ServicoModel) -> Servico:
    return Servico(
        id=model.id,
        nome=model.nome,
        descricao=model.descricao,
        duracao_minutos=model.duracao_minutos,
        preco=model.preco,
        ativo=model.ativo,
    )
