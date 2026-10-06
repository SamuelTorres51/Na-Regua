from dataclasses import dataclass
from datetime import datetime, timezone
import re

from application.common.exceptions import EmailJaCadastradoError, ValidationError
from core.security import create_access_token, hash_password
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.usuario_repository import UsuarioRepository

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


@dataclass(frozen=True)
class RegistrarUsuarioInput:
    nome: str
    email: str
    telefone: str
    senha: str


@dataclass(frozen=True)
class RegistrarUsuarioOutput:
    access_token: str
    token_type: str
    usuario: Usuario


class RegistrarUsuarioUseCase:
    def __init__(self, usuario_repository: UsuarioRepository) -> None:
        self.usuario_repository = usuario_repository

    def validate(self, dados: RegistrarUsuarioInput) -> None:
        nome = dados.nome.strip() if dados.nome else ""
        email = dados.email.strip() if dados.email else ""
        telefone = dados.telefone.strip() if dados.telefone else ""
        senha = dados.senha if dados.senha else ""

        if not nome:
            raise ValidationError("O nome não pode estar vazio.")
        if len(nome) < 3 or len(nome) > 150:
            raise ValidationError("O nome deve ter entre 3 e 150 caracteres.")

        if not email:
            raise ValidationError("O e-mail não pode estar vazio.")
        if not EMAIL_REGEX.match(email):
            raise ValidationError("Formato de e-mail inválido.")

        if not telefone:
            raise ValidationError("O telefone não pode estar vazio.")
        if len(telefone) < 10 or len(telefone) > 20:
            raise ValidationError("O telefone deve ter entre 10 e 20 caracteres.")

        if not senha:
            raise ValidationError("A senha não pode estar vazia.")
        if len(senha) < 8:
            raise ValidationError("A senha deve ter no mínimo 8 caracteres.")

    def execute(self, dados: RegistrarUsuarioInput) -> RegistrarUsuarioOutput:
        self.validate(dados)

        email = dados.email.strip().lower()
        if self.usuario_repository.buscar_por_email(email) is not None:
            raise EmailJaCadastradoError("E-mail já cadastrado")

        novo_usuario = Usuario(
            id=None,
            nome=dados.nome.strip(),
            email=email,
            telefone=dados.telefone.strip(),
            senha_hash=hash_password(dados.senha),
            perfil=PerfilAcesso.CLIENTE,
            ativo=True,
            criado_em=datetime.now(timezone.utc),
        )

        try:
            usuario_criado = self.usuario_repository.criar(novo_usuario)
        except Exception as exc:
            # Em caso de race condition no banco capturada como duplicidade
            if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
                raise EmailJaCadastradoError("E-mail já cadastrado") from exc
            raise

        token = create_access_token({"sub": str(usuario_criado.id)})

        return RegistrarUsuarioOutput(
            access_token=token,
            token_type="bearer",
            usuario=usuario_criado,
        )
