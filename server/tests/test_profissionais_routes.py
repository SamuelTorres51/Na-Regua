from datetime import datetime, timezone

from fastapi.testclient import TestClient

from api.dependencies import (
    get_atualizar_profissional_use_case,
    get_buscar_profissional_por_id_use_case,
    get_cadastrar_profissional_use_case,
    get_current_user,
    get_inativar_profissional_use_case,
    get_listar_profissionais_use_case,
    get_reativar_profissional_use_case,
)
from application.use_cases.profissionais.atualizar_profissional import (
    AtualizarProfissionalUseCase,
)
from application.use_cases.profissionais.buscar_profissional_por_id import (
    BuscarProfissionalPorIdUseCase,
)
from application.use_cases.profissionais.cadastrar_profissional import (
    CadastrarProfissionalUseCase,
)
from application.use_cases.profissionais.inativar_profissional import (
    InativarProfissionalUseCase,
)
from application.use_cases.profissionais.listar_profissionais import (
    ListarProfissionaisUseCase,
)
from application.use_cases.profissionais.reativar_profissional import (
    ReativarProfissionalUseCase,
)
from domain.entities.administrador import Administrador
from domain.entities.cliente import Cliente
from domain.enums.perfil_acesso import PerfilAcesso
from main import app
from tests.test_profissionais_use_cases import InMemoryProfissionalRepository

client = TestClient(app)


def _criar_admin() -> Administrador:
    return Administrador(
        id=1,
        nome="Admin Chefe",
        email="admin@naregua.com",
        telefone="86999990000",
        senha_hash="hash",
        perfil=PerfilAcesso.ADMINISTRADOR,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def _criar_cliente() -> Cliente:
    return Cliente(
        id=2,
        nome="Cliente Comum",
        email="cliente@gmail.com",
        telefone="86999991111",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def test_cliente_bloqueado_ao_cadastrar_profissional():
    repo = InMemoryProfissionalRepository()
    app.dependency_overrides[get_current_user] = _criar_cliente
    app.dependency_overrides[get_cadastrar_profissional_use_case] = (
        lambda: CadastrarProfissionalUseCase(repo)
    )

    res = client.post(
        "/profissionais",
        json={
            "nome": "Barbeiro Silva",
            "email": "barbeiro@naregua.com",
            "telefone": "86999992222",
            "senha": "senhaSegura123",
        },
    )

    assert res.status_code == 403
    assert "apenas administradores" in res.json()["detail"].lower()
    app.dependency_overrides.clear()


def test_nao_autenticado_ao_cadastrar_profissional():
    res = client.post(
        "/profissionais",
        json={
            "nome": "Barbeiro Silva",
            "email": "barbeiro@naregua.com",
            "telefone": "86999992222",
            "senha": "senhaSegura123",
        },
    )

    assert res.status_code == 401


def test_admin_cadastra_e_gerencia_profissional_com_sucesso():
    repo = InMemoryProfissionalRepository()

    app.dependency_overrides[get_current_user] = _criar_admin
    app.dependency_overrides[get_cadastrar_profissional_use_case] = (
        lambda: CadastrarProfissionalUseCase(repo)
    )
    app.dependency_overrides[get_listar_profissionais_use_case] = (
        lambda: ListarProfissionaisUseCase(repo)
    )
    app.dependency_overrides[get_buscar_profissional_por_id_use_case] = (
        lambda: BuscarProfissionalPorIdUseCase(repo)
    )
    app.dependency_overrides[get_atualizar_profissional_use_case] = (
        lambda: AtualizarProfissionalUseCase(repo)
    )
    app.dependency_overrides[get_inativar_profissional_use_case] = (
        lambda: InativarProfissionalUseCase(repo)
    )
    app.dependency_overrides[get_reativar_profissional_use_case] = (
        lambda: ReativarProfissionalUseCase(repo)
    )

    # 1. Cadastrar profissional
    res_cadastrar = client.post(
        "/profissionais",
        json={
            "nome": "Carlos Barbeiro",
            "email": "carlos@naregua.com",
            "telefone": "86999992222",
            "senha": "senhaSegura123",
        },
    )
    assert res_cadastrar.status_code == 201
    dados = res_cadastrar.json()
    assert dados["id"] == 1
    assert dados["nome"] == "Carlos Barbeiro"
    assert dados["email"] == "carlos@naregua.com"
    assert dados["perfil"] == "profissional"
    assert dados["ativo"] is True

    # 2. Listar profissionais
    res_listar = client.get("/profissionais")
    assert res_listar.status_code == 200
    assert len(res_listar.json()) == 1

    # 3. Buscar profissional por ID
    res_buscar = client.get("/profissionais/1")
    assert res_buscar.status_code == 200
    assert res_buscar.json()["nome"] == "Carlos Barbeiro"

    # 4. Atualizar profissional
    res_atualizar = client.put(
        "/profissionais/1",
        json={
            "nome": "Carlos Mestre das Tesouras",
            "telefone": "86988887777",
        },
    )
    assert res_atualizar.status_code == 200
    assert res_atualizar.json()["nome"] == "Carlos Mestre das Tesouras"
    assert res_atualizar.json()["telefone"] == "86988887777"

    # 5. Inativar profissional
    res_inativar = client.patch("/profissionais/1/inativar")
    assert res_inativar.status_code == 200
    assert res_inativar.json()["ativo"] is False

    # 6. Reativar profissional
    res_reativar = client.patch("/profissionais/1/reativar")
    assert res_reativar.status_code == 200
    assert res_reativar.json()["ativo"] is True

    app.dependency_overrides.clear()


def test_cliente_bloqueado_ao_inativar_profissional():
    repo = InMemoryProfissionalRepository()
    app.dependency_overrides[get_current_user] = _criar_cliente
    app.dependency_overrides[get_inativar_profissional_use_case] = (
        lambda: InativarProfissionalUseCase(repo)
    )

    res = client.patch("/profissionais/1/inativar")
    assert res.status_code == 403

    app.dependency_overrides.clear()
