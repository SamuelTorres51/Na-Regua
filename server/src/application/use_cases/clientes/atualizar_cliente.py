from dataclasses import dataclass

from application.common.exceptions import (
    ClienteNaoEncontradoError,
    EmailJaCadastradoError,
    ValidationError,
)
from application.use_cases.auth.registrar_usuario import EMAIL_REGEX
from domain.entities.cliente import Cliente
from domain.repositories.cliente_repository import ClienteRepository


@dataclass(frozen=True)
class AtualizarClienteInput:
    id: int
    nome: str
    email: str
    telefone: str


class AtualizarClienteUseCase:
    def __init__(self, cliente_repository: ClienteRepository) -> None:
        self.cliente_repository = cliente_repository

    def validate(self, dados: AtualizarClienteInput) -> None:
        if dados.id <= 0:
            raise ValidationError("ID do cliente inválido.")

        nome = dados.nome.strip()
        if len(nome) < 3 or len(nome) > 150:
            raise ValidationError("O nome deve ter entre 3 e 150 caracteres.")

        email = dados.email.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise ValidationError("Formato de e-mail inválido.")

        telefone = dados.telefone.strip()
        if len(telefone) < 10 or len(telefone) > 20:
            raise ValidationError(
                "O telefone deve ter entre 10 e 20 caracteres."
            )

    def execute(self, dados: AtualizarClienteInput) -> Cliente:
        self.validate(dados)

        cliente = self.cliente_repository.buscar_por_id(dados.id)
        if cliente is None:
            raise ClienteNaoEncontradoError(
                f"Cliente com ID {dados.id} não encontrado."
            )

        email = dados.email.strip().lower()
        if email != cliente.email:
            cliente_com_email = self.cliente_repository.buscar_por_email(email)
            if (
                cliente_com_email is not None
                and cliente_com_email.id != cliente.id
            ):
                raise EmailJaCadastradoError("E-mail já cadastrado.")

        cliente_atualizado = Cliente(
            id=cliente.id,
            nome=dados.nome.strip(),
            email=email,
            telefone=dados.telefone.strip(),
            senha_hash=cliente.senha_hash,
            perfil=cliente.perfil,
            ativo=cliente.ativo,
            criado_em=cliente.criado_em,
        )
        try:
            return self.cliente_repository.atualizar(cliente_atualizado)
        except ValueError as error:
            raise ClienteNaoEncontradoError(
                f"Cliente com ID {dados.id} não encontrado."
            ) from error
