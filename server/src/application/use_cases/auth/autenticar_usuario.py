from dataclasses import dataclass
import re

from application.common.exceptions import CredenciaisInvalidasError, ValidationError
from core.security import create_access_token, verify_password
from domain.entities.usuario import Usuario
from domain.repositories.usuario_repository import UsuarioRepository

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


@dataclass(frozen=True)
class AutenticarUsuarioInput:
    email: str
    senha: str


@dataclass(frozen=True)
class AutenticarUsuarioOutput:
    access_token: str
    token_type: str
    usuario: Usuario


class AutenticarUsuarioUseCase:
    def __init__(self, usuario_repository: UsuarioRepository) -> None:
        self.usuario_repository = usuario_repository

    def validate(self, dados: AutenticarUsuarioInput) -> None:
        email = dados.email.strip() if dados.email else ""
        senha = dados.senha if dados.senha else ""

        if not email:
            raise ValidationError("O e-mail não pode estar vazio.")
        if not EMAIL_REGEX.match(email):
            raise ValidationError("Formato de e-mail inválido.")

        if not senha:
            raise ValidationError("A senha não pode estar vazia.")

    def execute(self, dados: AutenticarUsuarioInput) -> AutenticarUsuarioOutput:
        self.validate(dados)

        email = dados.email.strip().lower()
        usuario = self.usuario_repository.buscar_por_email(email)

        if (
            usuario is None
            or not usuario.ativo
            or not verify_password(dados.senha, usuario.senha_hash)
        ):
            raise CredenciaisInvalidasError("E-mail ou senha inválidos")

        token = create_access_token({"sub": str(usuario.id)})

        return AutenticarUsuarioOutput(
            access_token=token,
            token_type="bearer",
            usuario=usuario,
        )
