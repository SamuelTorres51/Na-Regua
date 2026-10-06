from dataclasses import dataclass

from application.common.exceptions import (
    SenhaInvalidaError,
    UsuarioNaoEncontradoError,
    ValidationError,
)
from core.security import hash_password, verify_password
from domain.repositories.usuario_repository import UsuarioRepository


@dataclass(frozen=True)
class AlterarSenhaInput:
    usuario_id: int
    senha_atual: str
    nova_senha: str


class AlterarSenhaUseCase:
    def __init__(self, usuario_repository: UsuarioRepository) -> None:
        self.usuario_repository = usuario_repository

    def validate(self, dados: AlterarSenhaInput) -> None:
        if not dados.usuario_id:
            raise ValidationError("ID do usuário é obrigatório.")

        senha_atual = dados.senha_atual if dados.senha_atual else ""
        nova_senha = dados.nova_senha if dados.nova_senha else ""

        if not senha_atual:
            raise ValidationError("A senha atual não pode estar vazia.")

        if not nova_senha:
            raise ValidationError("A nova senha não pode estar vazia.")

        if len(nova_senha) < 8:
            raise ValidationError("A nova senha deve ter no mínimo 8 caracteres.")

        if senha_atual == nova_senha:
            raise ValidationError("A nova senha deve ser diferente da senha atual.")

    def execute(self, dados: AlterarSenhaInput) -> None:
        self.validate(dados)

        usuario = self.usuario_repository.buscar_por_id(dados.usuario_id)
        if usuario is None or not usuario.ativo:
            raise UsuarioNaoEncontradoError("Usuário não encontrado.")

        if not verify_password(dados.senha_atual, usuario.senha_hash):
            raise SenhaInvalidaError("A senha atual está incorreta.")

        usuario.senha_hash = hash_password(dados.nova_senha)
        self.usuario_repository.atualizar(usuario)
