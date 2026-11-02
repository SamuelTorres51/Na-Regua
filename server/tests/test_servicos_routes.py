from datetime import datetime, timezone

from fastapi.testclient import TestClient

from api.dependencies import (
    get_atualizar_servico_use_case,
    get_buscar_servico_por_id_use_case,
    get_criar_servico_use_case,
    get_current_user,
    get_deletar_servico_use_case,
    get_listar_servicos_use_case,
)
from application.use_cases.servicos.atualizar_servico import AtualizarServicoUseCase
from application.use_cases.servicos.buscar_servico_por_id import BuscarServicoPorIdUseCase
from application.use_cases.servicos.criar_servico import CriarServicoUseCase
from application.use_cases.servicos.deletar_servico import DeletarServicoUseCase
from application.use_cases.servicos.listar_servicos import ListarServicosUseCase
from domain.entities.administrador import Administrador
from domain.entities.cliente import Cliente
from domain.enums.perfil_acesso import PerfilAcesso
from main import app
from tests.test_servicos_use_cases import InMemoryServicoRepository

client = TestClient(app)


def _criar_admin() -> Administrador:
    return Administrador(
        id=1,
        nome="Admin Barbearia",
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
        nome="Cliente Silva",
        email="cliente@gmail.com",
        telefone="86999991111",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def test_cliente_bloqueado_ao_criar_servico():
    repo = InMemoryServicoRepository()
    app.dependency_overrides[get_current_user] = _criar_cliente
    app.dependency_overrides[get_criar_servico_use_case] = lambda: CriarServicoUseCase(repo)

    res = client.post(
        "/servicos",
        json={
            "nome": "Corte",
            "duracaoMinutos": 30,
            "preco": 30.0,
        },
    )

    assert res.status_code == 403
    assert "apenas administradores" in res.json()["detail"].lower()
    app.dependency_overrides.clear()


def test_administrador_cria_servico_com_sucesso():
    repo = InMemoryServicoRepository()
    app.dependency_overrides[get_current_user] = _criar_admin
    app.dependency_overrides[get_criar_servico_use_case] = lambda: CriarServicoUseCase(repo)
    app.dependency_overrides[get_listar_servicos_use_case] = lambda: ListarServicosUseCase(repo)
    app.dependency_overrides[get_buscar_servico_por_id_use_case] = lambda: BuscarServicoPorIdUseCase(repo)
    app.dependency_overrides[get_atualizar_servico_use_case] = lambda: AtualizarServicoUseCase(repo)
    app.dependency_overrides[get_deletar_servico_use_case] = lambda: DeletarServicoUseCase(repo)

    # 1. Criar serviço
    res_criar = client.post(
        "/servicos",
        json={
            "nome": "Barba Completa",
            "descricao": "Navalha e toalha quente",
            "duracaoMinutos": 35,
            "preco": 40.0,
            "ativo": True,
        },
    )
    assert res_criar.status_code == 201
    dados = res_criar.json()
    assert dados["id"] == 1
    assert dados["nome"] == "Barba Completa"
    assert dados["duracaoMinutos"] == 35
    assert dados["preco"] == 40.0

    # 2. Listar serviços (público / cliente)
    res_listar = client.get("/servicos")
    assert res_listar.status_code == 200
    assert len(res_listar.json()) == 1

    # 3. Buscar serviço por id
    res_buscar = client.get("/servicos/1")
    assert res_buscar.status_code == 200
    assert res_buscar.json()["nome"] == "Barba Completa"

    # 4. Atualizar serviço
    res_atualizar = client.put(
        "/servicos/1",
        json={
            "nome": "Barba VIP",
            "descricao": "Navalha, toalha quente e massagem",
            "duracaoMinutos": 45,
            "preco": 55.0,
            "ativo": True,
        },
    )
    assert res_atualizar.status_code == 200
    assert res_atualizar.json()["nome"] == "Barba VIP"
    assert res_atualizar.json()["preco"] == 55.0

    # 5. Deletar serviço
    res_deletar = client.delete("/servicos/1")
    assert res_deletar.status_code == 204

    # 6. Conferir que foi deletado
    res_apos_deletar = client.get("/servicos/1")
    assert res_apos_deletar.status_code == 404

    app.dependency_overrides.clear()
