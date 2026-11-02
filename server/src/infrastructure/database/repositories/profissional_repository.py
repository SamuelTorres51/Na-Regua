from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from domain.entities.profissional import Profissional
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.profissional_repository import ProfissionalRepository
from infrastructure.database.models.usuario_model import UsuarioModel


class SqlAlchemyProfissionalRepository(ProfissionalRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def buscar_por_id(self, profissional_id: int) -> Profissional | None:
        model = self._db.scalar(
            select(UsuarioModel).where(
                UsuarioModel.id == profissional_id,
                UsuarioModel.perfil == PerfilAcesso.PROFISSIONAL,
            )
        )
        return _para_entidade(model) if model is not None else None

    def buscar_por_email(self, email: str) -> Profissional | None:
        model = self._db.scalar(
            select(UsuarioModel).where(
                UsuarioModel.email == email,
                UsuarioModel.perfil == PerfilAcesso.PROFISSIONAL,
            )
        )
        return _para_entidade(model) if model is not None else None

    def listar(self, apenas_ativos: bool = False) -> list[Profissional]:
        query = select(UsuarioModel).where(
            UsuarioModel.perfil == PerfilAcesso.PROFISSIONAL
        ).order_by(UsuarioModel.nome)

        if apenas_ativos:
            query = query.where(UsuarioModel.ativo.is_(True))

        models = self._db.scalars(query).all()
        return [_para_entidade(m) for m in models]

    def criar(self, profissional: Profissional) -> Profissional:
        model = UsuarioModel(
            nome=profissional.nome,
            email=profissional.email,
            telefone=profissional.telefone,
            senha_hash=profissional.senha_hash,
            perfil=PerfilAcesso.PROFISSIONAL,
            ativo=profissional.ativo,
        )
        try:
            self._db.add(model)
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def atualizar(self, profissional: Profissional) -> Profissional:
        if profissional.id is None:
            raise ValueError("Não é possível atualizar profissional sem ID.")

        model = self._db.get(UsuarioModel, profissional.id)
        if model is None or model.perfil != PerfilAcesso.PROFISSIONAL:
            raise ValueError(f"Profissional com ID {profissional.id} não encontrado.")

        model.nome = profissional.nome
        model.telefone = profissional.telefone
        model.ativo = profissional.ativo
        if profissional.senha_hash:
            model.senha_hash = profissional.senha_hash

        try:
            self._db.commit()
            self._db.refresh(model)
            return _para_entidade(model)
        except IntegrityError:
            self._db.rollback()
            raise

    def rollback(self) -> None:
        self._db.rollback()


def _para_entidade(model: UsuarioModel) -> Profissional:
    return Profissional(
        id=model.id,
        nome=model.nome,
        email=model.email,
        telefone=model.telefone,
        senha_hash=model.senha_hash,
        perfil=PerfilAcesso.PROFISSIONAL,
        ativo=model.ativo,
        criado_em=model.criado_em,
    )
