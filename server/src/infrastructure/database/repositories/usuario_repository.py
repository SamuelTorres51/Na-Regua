from sqlalchemy import select
from sqlalchemy.orm import Session
 
from domain.entities.usuario import Usuario
from domain.repositories.usuario_repository import UsuarioRepository
from infrastructure.database.models.usuario_model import UsuarioModel
 
 
class SqlAlchemyUsuarioRepository(UsuarioRepository):
    def __init__(self, db: Session) -> None:
        self._db = db
 
    def buscar_por_id(self, usuario_id: int) -> Usuario | None:
        model = self._db.get(UsuarioModel, usuario_id)
        return _para_entidade(model) if model is not None else None
 
    def buscar_por_email(self, email: str) -> Usuario | None:
        model = self._db.scalar(
            select(UsuarioModel).where(UsuarioModel.email == email)
        )
        return _para_entidade(model) if model is not None else None
 
    def criar(self, usuario: Usuario) -> Usuario:
        model = UsuarioModel(
            nome=usuario.nome,
            email=usuario.email,
            telefone=usuario.telefone,
            senha_hash=usuario.senha_hash,
            perfil=usuario.perfil,
            ativo=usuario.ativo,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return _para_entidade(model)
 
 
def _para_entidade(model: UsuarioModel) -> Usuario:
    return Usuario(
        id=model.id,
        nome=model.nome,
        email=model.email,
        telefone=model.telefone,
        senha_hash=model.senha_hash,
        perfil=model.perfil,
        ativo=model.ativo,
        criado_em=model.criado_em,
    )