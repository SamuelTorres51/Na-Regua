from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from domain.entities.cliente import Cliente
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.cliente_repository import ClienteRepository
from infrastructure.database.models.usuario_model import UsuarioModel


class SqlAlchemyClienteRepository(ClienteRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def buscar_por_id(self, cliente_id: int) -> Cliente | None:
        model = self._db.scalar(
            select(UsuarioModel).where(
                UsuarioModel.id == cliente_id,
                UsuarioModel.perfil == PerfilAcesso.CLIENTE,
            )
        )
        return _para_entidade(model) if model is not None else None

    def criar(self, cliente: Cliente) -> Cliente:
        model = UsuarioModel(
            nome=cliente.nome,
            email=cliente.email,
            telefone=cliente.telefone,
            senha_hash=cliente.senha_hash,
            perfil=PerfilAcesso.CLIENTE,
            ativo=cliente.ativo,
        )
        try:
            self._db.add(model)
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def buscar_por_email(self, email: str) -> Cliente | None:
        model = self._db.scalar(
            select(UsuarioModel).where(
                UsuarioModel.email == email,
                UsuarioModel.perfil == PerfilAcesso.CLIENTE,
            )
        )
        return _para_entidade(model) if model is not None else None

    def listar(self, apenas_ativos: bool = False) -> list[Cliente]:
        query = (
            select(UsuarioModel)
            .where(UsuarioModel.perfil == PerfilAcesso.CLIENTE)
            .order_by(UsuarioModel.nome)
        )
        if apenas_ativos:
            query = query.where(UsuarioModel.ativo.is_(True))

        return [
            _para_entidade(model)
            for model in self._db.scalars(query).all()
        ]

    def atualizar(self, cliente: Cliente) -> Cliente:
        if cliente.id is None:
            raise ValueError("Não é possível atualizar cliente sem ID.")

        model = self._db.get(UsuarioModel, cliente.id)
        if model is None or model.perfil != PerfilAcesso.CLIENTE:
            raise ValueError(f"Cliente com ID {cliente.id} não encontrado.")

        model.nome = cliente.nome
        model.email = cliente.email
        model.telefone = cliente.telefone
        model.ativo = cliente.ativo

        try:
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def rollback(self) -> None:
        self._db.rollback()


def _para_entidade(model: UsuarioModel) -> Cliente:
    return Cliente(
        id=model.id,
        nome=model.nome,
        email=model.email,
        telefone=model.telefone,
        senha_hash=model.senha_hash,
        perfil=PerfilAcesso.CLIENTE,
        ativo=model.ativo,
        criado_em=model.criado_em,
    )
