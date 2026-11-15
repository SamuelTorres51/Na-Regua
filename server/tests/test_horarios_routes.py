import pytest
from fastapi.testclient import TestClient

from api.dependencies import (
    get_consultar_disponibilidade_use_case,
    get_consultar_horario_funcionamento_use_case,
    get_consultar_jornada_profissional_use_case,
    get_criar_agendamento_use_case,
    get_current_user,
    get_definir_horario_funcionamento_use_case,
    get_definir_jornada_profissional_use_case,
)
from application.use_cases.horarios.consultar_horario_funcionamento import (
    ConsultarHorarioFuncionamentoUseCase,
)
from application.use_cases.horarios.consultar_jornada_profissional import (
    ConsultarJornadaProfissionalUseCase,
)
from application.use_cases.horarios.definir_horario_funcionamento import (
    DefinirHorarioFuncionamentoUseCase,
)
from application.use_cases.horarios.definir_jornada_profissional import (
    DefinirJornadaProfissionalUseCase,
)
from domain.enums.perfil_acesso import PerfilAcesso
from main import app
from tests.test_agendamentos_use_cases import _usuario
from tests.test_disponibilidade import (
    SEGUNDA,
    InMemoryHorarioRepository,
    _profissional,
    _proxima_segunda_as,
    criar_caso_com_horarios,
    criar_consulta,
)
from tests.test_profissionais_use_cases import InMemoryProfissionalRepository

client = TestClient(app)

TURNOS_DE_SEGUNDA = [
    {"diaSemana": "segunda", "inicio": "08:00", "fim": "12:00"},
    {"diaSemana": "segunda", "inicio": "14:00", "fim": "18:00"},
]


@pytest.fixture(autouse=True)
def _limpar_overrides():
    yield
    app.dependency_overrides.clear()


def _autenticar(perfil: PerfilAcesso) -> None:
    app.dependency_overrides[get_current_user] = lambda: _usuario(50, perfil)


def _usar_horarios_da_barbearia(repositorio: InMemoryHorarioRepository) -> None:
    app.dependency_overrides[get_consultar_horario_funcionamento_use_case] = (
        lambda: ConsultarHorarioFuncionamentoUseCase(repositorio)
    )
    app.dependency_overrides[get_definir_horario_funcionamento_use_case] = (
        lambda: DefinirHorarioFuncionamentoUseCase(repositorio)
    )


def _usar_jornadas(repositorio: InMemoryHorarioRepository) -> int:
    profissionais = InMemoryProfissionalRepository()
    profissional = profissionais.criar(_profissional())
    app.dependency_overrides[get_consultar_jornada_profissional_use_case] = (
        lambda: ConsultarJornadaProfissionalUseCase(profissionais, repositorio)
    )
    app.dependency_overrides[get_definir_jornada_profissional_use_case] = (
        lambda: DefinirJornadaProfissionalUseCase(profissionais, repositorio)
    )
    return profissional.id


def test_admin_define_o_horario_de_funcionamento_da_barbearia() -> None:
    _autenticar(PerfilAcesso.ADMINISTRADOR)
    _usar_horarios_da_barbearia(InMemoryHorarioRepository())

    resposta = client.put("/barbearia/horarios", json={"turnos": TURNOS_DE_SEGUNDA})

    assert resposta.status_code == 200
    assert resposta.json() == {"turnos": TURNOS_DE_SEGUNDA}
    assert client.get("/barbearia/horarios").json() == {"turnos": TURNOS_DE_SEGUNDA}


def test_cliente_nao_pode_definir_o_horario_da_barbearia() -> None:
    _autenticar(PerfilAcesso.CLIENTE)
    _usar_horarios_da_barbearia(InMemoryHorarioRepository())

    resposta = client.put("/barbearia/horarios", json={"turnos": TURNOS_DE_SEGUNDA})

    assert resposta.status_code == 403


def test_rejeita_turnos_sobrepostos() -> None:
    _autenticar(PerfilAcesso.ADMINISTRADOR)
    _usar_horarios_da_barbearia(InMemoryHorarioRepository())

    resposta = client.put(
        "/barbearia/horarios",
        json={
            "turnos": [
                {"diaSemana": "segunda", "inicio": "08:00", "fim": "12:00"},
                {"diaSemana": "segunda", "inicio": "11:00", "fim": "15:00"},
            ]
        },
    )

    assert resposta.status_code == 422
    assert "se sobrepõem" in resposta.json()["detail"]


def test_jornada_null_faz_o_profissional_seguir_a_barbearia() -> None:
    _autenticar(PerfilAcesso.ADMINISTRADOR)
    profissional_id = _usar_jornadas(InMemoryHorarioRepository())
    url = f"/profissionais/{profissional_id}/jornada"

    assert client.get(url).json() == {
        "profissionalId": profissional_id,
        "personalizada": False,
        "turnos": None,
    }

    personalizada = client.put(url, json={"turnos": TURNOS_DE_SEGUNDA})
    assert personalizada.status_code == 200
    assert personalizada.json()["personalizada"] is True
    assert personalizada.json()["turnos"] == TURNOS_DE_SEGUNDA

    herdada = client.put(url, json={"turnos": None})
    assert herdada.status_code == 200
    assert herdada.json() == {
        "profissionalId": profissional_id,
        "personalizada": False,
        "turnos": None,
    }


def test_jornada_vazia_e_rejeitada() -> None:
    _autenticar(PerfilAcesso.ADMINISTRADOR)
    profissional_id = _usar_jornadas(InMemoryHorarioRepository())

    resposta = client.put(
        f"/profissionais/{profissional_id}/jornada",
        json={"turnos": []},
    )

    assert resposta.status_code == 422
    assert "null" in resposta.json()["detail"]


def test_jornada_de_profissional_inexistente() -> None:
    _autenticar(PerfilAcesso.ADMINISTRADOR)
    _usar_jornadas(InMemoryHorarioRepository())

    resposta = client.put("/profissionais/999/jornada", json={"turnos": None})

    assert resposta.status_code == 404


def test_profissional_nao_pode_definir_a_propria_jornada() -> None:
    _autenticar(PerfilAcesso.PROFISSIONAL)
    profissional_id = _usar_jornadas(InMemoryHorarioRepository())

    resposta = client.put(
        f"/profissionais/{profissional_id}/jornada",
        json={"turnos": TURNOS_DE_SEGUNDA},
    )

    assert resposta.status_code == 403


def test_consulta_a_disponibilidade_pela_api() -> None:
    consulta = criar_consulta()
    app.dependency_overrides[get_consultar_disponibilidade_use_case] = lambda: consulta

    resposta = client.get(
        "/profissionais/1/disponibilidade",
        params={"servico_id": 10, "de": SEGUNDA.isoformat(), "ate": SEGUNDA.isoformat()},
    )

    assert resposta.status_code == 200
    [dia] = resposta.json()
    assert dia["data"] == "2026-11-16"
    assert dia["status"] == "disponivel"
    assert dia["horarios"][0] == "2026-11-16T08:00:00-03:00"


def test_consulta_rejeita_servico_que_o_profissional_nao_oferece() -> None:
    consulta = criar_consulta(associado=False)
    app.dependency_overrides[get_consultar_disponibilidade_use_case] = lambda: consulta

    resposta = client.get(
        "/profissionais/1/disponibilidade",
        params={"servico_id": 10},
    )

    assert resposta.status_code == 409


def test_criar_agendamento_fora_do_expediente_retorna_conflito() -> None:
    caso, cliente, profissional = criar_caso_com_horarios()
    app.dependency_overrides[get_current_user] = lambda: cliente
    app.dependency_overrides[get_criar_agendamento_use_case] = lambda: caso

    resposta = client.post(
        "/agendamentos",
        json={
            "clienteId": cliente.id,
            "profissionalId": profissional.id,
            "servicoId": 10,
            "inicio": _proxima_segunda_as("12:30").isoformat(),
        },
    )

    assert resposta.status_code == 409
    assert "fora do horário de atendimento" in resposta.json()["detail"]
