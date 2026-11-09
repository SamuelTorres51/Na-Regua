from datetime import datetime, timezone

import pytest

from application.common.exceptions import (
    ClienteNaoEncontradoError,
    EmailJaCadastradoError,
    ValidationError,
)
from application.use_cases.clientes.atualizar_cliente import (
    AtualizarClienteInput,
    AtualizarClienteUseCase,
)
from application.use_cases.clientes.buscar_cliente_por_id import (
    BuscarClientePorIdUseCase,
)
from application.use_cases.clientes.inativar_cliente import (
    InativarClienteUseCase,
)
from application.use_cases.clientes.listar_clientes import ListarClientesUseCase
from domain.entities.cliente import Cliente
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.cliente_repository import ClienteRepository


class InMemoryClienteRepository(ClienteRepository):
    def __init__(self, clientes: list[Cliente]) -> None:
        self.clientes = clientes

    def buscar_por_id(self, cliente_id: int) -> Cliente | None:
        return next((cliente for cliente in self.clientes if cliente.id == cliente_id), None)

    def buscar_por_email(self, email: str) -> Cliente | None:
        return next(
            (cliente for cliente in self.clientes if cliente.email == email),
            None,
        )

    def listar(self, apenas_ativos: bool = False) -> list[Cliente]:
        return [
            cliente
            for cliente in self.clientes
            if not apenas_ativos or cliente.ativo
        ]

    def atualizar(self, cliente: Cliente) -> Cliente:
        existente = self.buscar_por_id(cliente.id or 0)
        if existente is None:
            raise ValueError("Cliente não encontrado.")
        self.clientes[self.clientes.index(existente)] = cliente
        return cliente


def _cliente(
    cliente_id: int,
    *,
    email: str | None = None,
    ativo: bool = True,
) -> Cliente:
    return Cliente(
        id=cliente_id,
        nome=f"Cliente {cliente_id}",
        email=email or f"cliente{cliente_id}@example.com",
        telefone="86999999999",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=ativo,
        criado_em=datetime.now(timezone.utc),
    )


def test_lista_clientes_com_filtro_de_ativos() -> None:
    repository = InMemoryClienteRepository([_cliente(1), _cliente(2, ativo=False)])

    clientes = ListarClientesUseCase(repository).execute(apenas_ativos=True)

    assert [cliente.id for cliente in clientes] == [1]


def test_busca_cliente_inexistente() -> None:
    repository = InMemoryClienteRepository([])

    with pytest.raises(ClienteNaoEncontradoError):
        BuscarClientePorIdUseCase(repository).execute(1)


def test_atualiza_dados_do_cliente() -> None:
    repository = InMemoryClienteRepository([_cliente(1)])

    cliente = AtualizarClienteUseCase(repository).execute(
        AtualizarClienteInput(
            id=1,
            nome="Cliente Atualizado",
            email="atualizado@example.com",
            telefone="86988888888",
        )
    )

    assert cliente.nome == "Cliente Atualizado"
    assert cliente.email == "atualizado@example.com"


def test_rejeita_email_de_outro_cliente() -> None:
    repository = InMemoryClienteRepository(
        [_cliente(1), _cliente(2, email="outro@example.com")]
    )

    with pytest.raises(EmailJaCadastradoError):
        AtualizarClienteUseCase(repository).execute(
            AtualizarClienteInput(
                id=1,
                nome="Cliente Atualizado",
                email="outro@example.com",
                telefone="86988888888",
            )
        )


def test_inativar_cliente_preserva_registro() -> None:
    cliente = _cliente(1)
    repository = InMemoryClienteRepository([cliente])

    resultado = InativarClienteUseCase(repository).execute(1)

    assert resultado.ativo is False
    assert repository.buscar_por_id(1) is resultado
