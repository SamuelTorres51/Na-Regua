from datetime import datetime, timezone

from fastapi.testclient import TestClient

from api.dependencies import (
    get_atualizar_cliente_use_case,
    get_buscar_cliente_por_id_use_case,
    get_current_user,
    get_inativar_cliente_use_case,
    get_listar_clientes_use_case,
)
from application.use_cases.clientes.atualizar_cliente import AtualizarClienteUseCase
from application.use_cases.clientes.buscar_cliente_por_id import (
    BuscarClientePorIdUseCase,
)
from application.use_cases.clientes.inativar_cliente import InativarClienteUseCase
from application.use_cases.clientes.listar_clientes import ListarClientesUseCase
from domain.entities.administrador import Administrador
from domain.entities.cliente import Cliente
from domain.enums.perfil_acesso import PerfilAcesso
from main import app
from tests.test_clientes_use_cases import InMemoryClienteRepository

client = TestClient(app)


def _admin() -> Administrador:
    return Administrador(
        id=1,
        nome="Admin",
        email="admin@example.com",
        telefone="86999990000",
        senha_hash="hash",
        perfil=PerfilAcesso.ADMINISTRADOR,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


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
        telefone="86999991111",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=ativo,
        criado_em=datetime.now(timezone.utc),
    )


def _configurar(repository: InMemoryClienteRepository) -> None:
    app.dependency_overrides[get_current_user] = _admin
    app.dependency_overrides[get_listar_clientes_use_case] = (
        lambda: ListarClientesUseCase(repository)
    )
    app.dependency_overrides[get_buscar_cliente_por_id_use_case] = (
        lambda: BuscarClientePorIdUseCase(repository)
    )
    app.dependency_overrides[get_atualizar_cliente_use_case] = (
        lambda: AtualizarClienteUseCase(repository)
    )
    app.dependency_overrides[get_inativar_cliente_use_case] = (
        lambda: InativarClienteUseCase(repository)
    )


def test_admin_lista_clientes_e_filtra_ativos() -> None:
    repository = InMemoryClienteRepository(
        [_cliente(1), _cliente(2, ativo=False)]
    )
    _configurar(repository)

    try:
        response = client.get("/clientes")
        ativos_response = client.get("/clientes?apenas_ativos=true")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert [cliente["id"] for cliente in response.json()] == [1, 2]
    assert [cliente["id"] for cliente in ativos_response.json()] == [1]


def test_cliente_sem_permissao_nao_lista_clientes() -> None:
    app.dependency_overrides[get_current_user] = lambda: _cliente(1)

    try:
        response = client.get("/clientes")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403


def test_admin_atualiza_cliente() -> None:
    repository = InMemoryClienteRepository([_cliente(1)])
    _configurar(repository)

    try:
        response = client.put(
            "/clientes/1",
            json={
                "nome": "Cliente Atualizado",
                "email": "atualizado@example.com",
                "telefone": "86988887777",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["nome"] == "Cliente Atualizado"
    assert repository.buscar_por_id(1).email == "atualizado@example.com"


def test_atualizacao_rejeita_email_duplicado() -> None:
    repository = InMemoryClienteRepository(
        [_cliente(1), _cliente(2, email="existente@example.com")]
    )
    _configurar(repository)

    try:
        response = client.put(
            "/clientes/1",
            json={
                "nome": "Cliente Atualizado",
                "email": "existente@example.com",
                "telefone": "86988887777",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 409


def test_busca_cliente_inexistente_retorna_404() -> None:
    repository = InMemoryClienteRepository([])
    _configurar(repository)

    try:
        response = client.get("/clientes/99")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404


def test_inativacao_preserva_cliente_e_remove_da_lista_de_ativos() -> None:
    repository = InMemoryClienteRepository([_cliente(1)])
    _configurar(repository)

    try:
        inativar_response = client.patch("/clientes/1/inativar")
        ativos_response = client.get("/clientes?apenas_ativos=true")
    finally:
        app.dependency_overrides.clear()

    assert inativar_response.status_code == 200
    assert inativar_response.json()["ativo"] is False
    assert repository.buscar_por_id(1) is not None
    assert ativos_response.json() == []
