from dataclasses import dataclass

from application.common.exceptions import (
    EmailJaCadastradoError,
    UsuarioNaoEncontradoError,
    ValidationError,
)
from application.use_cases.auth.registrar_usuario import EMAIL_REGEX
from domain.entities.usuario import Usuario
from domain.repositories.usuario_repository import UsuarioRepository


@dataclass(frozen=True)
class AtualizarPerfilInput:
    usuario_id: int
    nome: str | None = None
    email: str | None = None
    telefone: str | None = None


class AtualizarPerfilUseCase:
    def __init__(self, usuario_repository: UsuarioRepository) -> None:
        self.usuario_repository = usuario_repository

    def validate(self, dados: AtualizarPerfilInput) -> None:
        if dados.usuario_id <= 0:
            raise ValidationError("O usuário informado é inválido.")
        if dados.nome is None and dados.email is None and dados.telefone is None:
            raise ValidationError("Informe ao menos um campo para atualizar.")

        if dados.nome is not None:
            nome = dados.nome.strip()
            if not nome:
                raise ValidationError("O nome não pode estar vazio.")
            if len(nome) < 3 or len(nome) > 150:
                raise ValidationError("O nome deve ter entre 3 e 150 caracteres.")

        if dados.email is not None:
            email = dados.email.strip().lower()
            if not email:
                raise ValidationError("O e-mail não pode estar vazio.")
            if not EMAIL_REGEX.match(email):
                raise ValidationError("Formato de e-mail inválido.")

        if dados.telefone is not None:
            telefone = dados.telefone.strip()
            if not telefone:
                raise ValidationError("O telefone não pode estar vazio.")
            if len(telefone) < 10 or len(telefone) > 20:
                raise ValidationError(
                    "O telefone deve ter entre 10 e 20 caracteres."
                )

    def execute(self, dados: AtualizarPerfilInput) -> Usuario:
        self.validate(dados)

        usuario = self.usuario_repository.buscar_por_id(dados.usuario_id)
        if usuario is None:
            raise UsuarioNaoEncontradoError("Usuário não encontrado.")

        email = (
            dados.email.strip().lower()
            if dados.email is not None
            else usuario.email
        )
        if email != usuario.email:
            usuario_com_email = self.usuario_repository.buscar_por_email(email)
            if (
                usuario_com_email is not None
                and usuario_com_email.id != usuario.id
            ):
                raise EmailJaCadastradoError("E-mail já cadastrado")

        usuario_atualizado = Usuario(
            id=usuario.id,
            nome=dados.nome.strip() if dados.nome is not None else usuario.nome,
            email=email,
            telefone=(
                dados.telefone.strip()
                if dados.telefone is not None
                else usuario.telefone
            ),
            senha_hash=usuario.senha_hash,
            perfil=usuario.perfil,
            ativo=usuario.ativo,
            criado_em=usuario.criado_em,
        )
        try:
            return self.usuario_repository.atualizar(usuario_atualizado)
        except ValueError as error:
            raise UsuarioNaoEncontradoError("Usuário não encontrado.") from error
