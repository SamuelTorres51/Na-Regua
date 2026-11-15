from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

from application.common.exceptions import (
    ForaDoHorarioDeAtendimentoError,
    ProfissionalNaoEncontradoError,
    ProfissionalServicoNaoEncontradoError,
    ValidationError,
)
from application.use_cases.agendamentos.criar_agendamento import (
    CriarAgendamentoInput,
    CriarAgendamentoUseCase,
)
from application.use_cases.disponibilidade.consultar_disponibilidade import (
    ConsultarDisponibilidadeInput,
    ConsultarDisponibilidadeUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.entities.periodo import Periodo
from domain.entities.profissional import Profissional
from domain.entities.servico import Servico
from domain.entities.turno import Turno
from domain.entities.usuario import Usuario
from domain.enums.dia_semana import DiaSemana
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.enums.status_disponibilidade import StatusDisponibilidade
from domain.repositories.horario_repository import HorarioRepository
from domain.services.disponibilidade import (
    cabe_no_expediente,
    calcular_dia,
    periodos_de_trabalho,
)
from tests.test_agendamentos_use_cases import (
    InMemoryAgendamentoRepository,
    InMemoryProfissionalServicoRepository,
    InMemoryServicoRepository,
    _criar_caso,
)
from tests.test_profissionais_use_cases import InMemoryProfissionalRepository

FORTALEZA = ZoneInfo("America/Fortaleza")
SEGUNDA = date(2026, 11, 16)
DOMINGO = date(2026, 11, 22)
MEIA_HORA = timedelta(minutes=30)
SERVICO_ID = 10


class InMemoryHorarioRepository(HorarioRepository):
    def __init__(
        self,
        funcionamento: list[Turno] | None = None,
        jornadas: dict[int, list[Turno]] | None = None,
    ) -> None:
        self.funcionamento = list(funcionamento or [])
        self.jornadas = dict(jornadas or {})

    def listar_funcionamento(self) -> list[Turno]:
        return list(self.funcionamento)

    def definir_funcionamento(self, turnos: list[Turno]) -> list[Turno]:
        self.funcionamento = list(turnos)
        return self.listar_funcionamento()

    def buscar_jornada(self, profissional_id: int) -> list[Turno] | None:
        turnos = self.jornadas.get(profissional_id)
        return list(turnos) if turnos else None

    def definir_jornada(
        self,
        profissional_id: int,
        turnos: list[Turno] | None,
    ) -> list[Turno] | None:
        if turnos:
            self.jornadas[profissional_id] = list(turnos)
        else:
            self.jornadas.pop(profissional_id, None)
        return self.buscar_jornada(profissional_id)


def turnos(dias: list[DiaSemana], *faixas: tuple[str, str]) -> list[Turno]:
    return [
        Turno(dia, time.fromisoformat(inicio), time.fromisoformat(fim))
        for dia in dias
        for inicio, fim in faixas
    ]


DIAS_DE_FUNCIONAMENTO = [dia for dia in DiaSemana if dia != DiaSemana.DOMINGO]
EXPEDIENTE_DA_BARBEARIA = turnos(
    DIAS_DE_FUNCIONAMENTO,
    ("08:00", "12:00"),
    ("14:00", "18:00"),
)


def _as(dia: date, horario: str) -> datetime:
    return datetime.combine(dia, time.fromisoformat(horario), FORTALEZA)


def _periodo(dia: date, inicio: str, fim: str) -> Periodo:
    return Periodo(_as(dia, inicio), _as(dia, fim))


def _calcular_segunda(
    duracao_minutos: int,
    *,
    ocupados: list[Periodo] | None = None,
    funcionamento: list[Turno] = EXPEDIENTE_DA_BARBEARIA,
    jornada: list[Turno] | None = None,
    inicio_minimo: str = "00:00",
):
    return calcular_dia(
        SEGUNDA,
        funcionamento=funcionamento,
        jornada=jornada,
        ocupados=ocupados or [],
        duracao=timedelta(minutes=duracao_minutos),
        passo=MEIA_HORA,
        inicio_minimo=_as(SEGUNDA, inicio_minimo),
        inicio_maximo=_as(SEGUNDA, "23:59"),
        fuso=FORTALEZA,
    )


def _horarios_da_manha(dia) -> list[str]:
    return [f"{horario:%H:%M}" for horario in dia.horarios if horario.hour < 12]


def _horarios(dia) -> list[str]:
    return [f"{horario:%H:%M}" for horario in dia.horarios]


# Cálculo dos horários


def test_servico_mais_longo_nao_e_oferecido_antes_de_outro_agendamento() -> None:
    cliente_1 = [_periodo(SEGUNDA, "09:00", "09:30")]

    trinta = _calcular_segunda(30, ocupados=cliente_1)
    quarenta_e_cinco = _calcular_segunda(45, ocupados=cliente_1)

    assert _horarios_da_manha(trinta) == [
        "08:00", "08:30", "09:30", "10:00", "10:30", "11:00", "11:30",
    ]
    assert _horarios_da_manha(quarenta_e_cinco) == [
        "08:00", "09:30", "10:00", "10:30", "11:00",
    ]


def test_servico_nao_invade_a_pausa_do_almoco_nem_o_fim_do_expediente() -> None:
    horarios = _horarios(_calcular_segunda(45))

    assert "11:00" in horarios
    assert "11:30" not in horarios
    assert not [horario for horario in horarios if "12:00" <= horario < "14:00"]
    assert horarios[-1] == "17:00"


def test_encaixa_logo_apos_atendimento_que_termina_fora_da_grade() -> None:
    dia = _calcular_segunda(30, ocupados=[_periodo(SEGUNDA, "09:30", "10:15")])

    assert _horarios_da_manha(dia) == [
        "08:00", "08:30", "09:00", "10:15", "10:30", "11:00", "11:30",
    ]


def test_respeita_a_antecedencia_minima_arredondando_para_a_grade() -> None:
    dia = _calcular_segunda(30, inicio_minimo="10:07")

    assert _horarios_da_manha(dia) == ["10:30", "11:00", "11:30"]


def test_agendamento_em_outro_fuso_ocupa_o_mesmo_instante() -> None:
    em_utc = Periodo(
        datetime(2026, 11, 16, 12, 0, tzinfo=timezone.utc),
        datetime(2026, 11, 16, 12, 30, tzinfo=timezone.utc),
    )

    assert "09:00" not in _horarios(_calcular_segunda(30, ocupados=[em_utc]))


# Jornada do profissional


def test_profissional_sem_jornada_segue_o_horario_integral_da_barbearia() -> None:
    assert periodos_de_trabalho(
        EXPEDIENTE_DA_BARBEARIA, None, SEGUNDA, FORTALEZA
    ) == [
        _periodo(SEGUNDA, "08:00", "12:00"),
        _periodo(SEGUNDA, "14:00", "18:00"),
    ]


def test_jornada_propria_fica_limitada_ao_funcionamento_da_barbearia() -> None:
    jornada = turnos([DiaSemana.SEGUNDA], ("07:00", "10:00"), ("15:00", "20:00"))

    assert periodos_de_trabalho(
        EXPEDIENTE_DA_BARBEARIA, jornada, SEGUNDA, FORTALEZA
    ) == [
        _periodo(SEGUNDA, "08:00", "10:00"),
        _periodo(SEGUNDA, "15:00", "18:00"),
    ]


def test_turnos_encostados_formam_um_unico_periodo() -> None:
    funcionamento = turnos([DiaSemana.SEGUNDA], ("08:00", "18:00"))
    jornada = turnos([DiaSemana.SEGUNDA], ("08:00", "12:00"), ("12:00", "14:00"))

    expediente = periodos_de_trabalho(funcionamento, jornada, SEGUNDA, FORTALEZA)

    assert expediente == [_periodo(SEGUNDA, "08:00", "14:00")]
    assert cabe_no_expediente(_periodo(SEGUNDA, "11:45", "12:15"), expediente)


def test_status_de_cada_dia() -> None:
    def status(dia: date, **kwargs) -> StatusDisponibilidade:
        return calcular_dia(
            dia,
            funcionamento=EXPEDIENTE_DA_BARBEARIA,
            jornada=kwargs.get("jornada"),
            ocupados=kwargs.get("ocupados", []),
            duracao=MEIA_HORA,
            passo=MEIA_HORA,
            inicio_minimo=_as(SEGUNDA, "00:00"),
            inicio_maximo=_as(DOMINGO, "23:59"),
            fuso=FORTALEZA,
        ).status

    agenda_cheia = [
        _periodo(SEGUNDA, "08:00", "12:00"),
        _periodo(SEGUNDA, "14:00", "18:00"),
    ]

    assert status(SEGUNDA) == StatusDisponibilidade.DISPONIVEL
    assert status(SEGUNDA, ocupados=agenda_cheia) == StatusDisponibilidade.LOTADO
    assert status(DOMINGO) == StatusDisponibilidade.FECHADO
    assert (
        status(SEGUNDA, jornada=turnos([DiaSemana.TERCA], ("08:00", "12:00")))
        == StatusDisponibilidade.FOLGA
    )


# Caso de uso da consulta


def _profissional(ativo: bool = True) -> Profissional:
    return Profissional(
        id=None,
        nome="Bruno",
        email="bruno@naregua.com",
        telefone="86999990000",
        senha_hash="hash",
        perfil=PerfilAcesso.PROFISSIONAL,
        ativo=ativo,
        criado_em=datetime.now(timezone.utc),
    )


def _agendamento(inicio: datetime, status: StatusAgendamento) -> Agendamento:
    return Agendamento(
        id=None,
        cliente_id=99,
        profissional_id=1,
        servico_id=SERVICO_ID,
        inicio=inicio,
        duracao_minutos=30,
        status=status,
    )


def criar_consulta(
    *,
    agora: datetime | None = None,
    agendamentos: list[Agendamento] | None = None,
    jornada: list[Turno] | None = None,
    profissional_ativo: bool = True,
    associado: bool = True,
) -> ConsultarDisponibilidadeUseCase:
    profissionais = InMemoryProfissionalRepository()
    profissional = profissionais.criar(_profissional(profissional_ativo))

    repositorio_agendamentos = InMemoryAgendamentoRepository()
    for agendamento in agendamentos or []:
        repositorio_agendamentos.criar(agendamento)

    return ConsultarDisponibilidadeUseCase(
        profissionais,
        InMemoryServicoRepository(
            Servico(
                id=SERVICO_ID,
                nome="Corte",
                descricao="",
                duracao_minutos=30,
                preco=30,
            )
        ),
        InMemoryProfissionalServicoRepository(
            {(profissional.id, SERVICO_ID)} if associado else set()
        ),
        repositorio_agendamentos,
        InMemoryHorarioRepository(
            EXPEDIENTE_DA_BARBEARIA,
            {profissional.id: jornada} if jornada else None,
        ),
        relogio=lambda: agora or _as(SEGUNDA, "07:00"),
    )


def test_consulta_cobre_hoje_e_os_proximos_quinze_dias() -> None:
    dias = criar_consulta().execute(ConsultarDisponibilidadeInput(1, SERVICO_ID))

    assert len(dias) == 16
    assert dias[0].data == SEGUNDA
    assert dias[-1].data == SEGUNDA + timedelta(days=15)
    assert dias[0].horarios[0] == _as(SEGUNDA, "08:00")
    assert dias[6].status == StatusDisponibilidade.FECHADO


def test_agendamentos_ativos_ocupam_e_cancelados_liberam_o_horario() -> None:
    consulta = criar_consulta(
        agendamentos=[
            _agendamento(_as(SEGUNDA, "09:00"), StatusAgendamento.AGENDADO),
            _agendamento(_as(SEGUNDA, "10:00"), StatusAgendamento.CANCELADO),
        ]
    )

    segunda = consulta.execute(
        ConsultarDisponibilidadeInput(1, SERVICO_ID, de=SEGUNDA, ate=SEGUNDA)
    )[0]

    assert "09:00" not in _horarios(segunda)
    assert "10:00" in _horarios(segunda)


def test_consulta_usa_a_jornada_propria_do_profissional() -> None:
    consulta = criar_consulta(jornada=turnos([DiaSemana.SEGUNDA], ("14:00", "16:00")))

    dias = consulta.execute(
        ConsultarDisponibilidadeInput(
            1, SERVICO_ID, de=SEGUNDA, ate=SEGUNDA + timedelta(days=1)
        )
    )

    assert _horarios(dias[0]) == ["14:00", "14:30", "15:00", "15:30"]
    assert dias[1].status == StatusDisponibilidade.FOLGA


def test_periodo_e_limitado_a_janela_de_agendamento() -> None:
    dias = criar_consulta().execute(
        ConsultarDisponibilidadeInput(
            1,
            SERVICO_ID,
            de=SEGUNDA - timedelta(days=3),
            ate=SEGUNDA + timedelta(days=40),
        )
    )

    assert dias[0].data == SEGUNDA
    assert dias[-1].data == SEGUNDA + timedelta(days=15)


def test_rejeita_periodo_invertido() -> None:
    with pytest.raises(ValidationError):
        criar_consulta().execute(
            ConsultarDisponibilidadeInput(
                1, SERVICO_ID, de=SEGUNDA, ate=SEGUNDA - timedelta(days=1)
            )
        )


def test_rejeita_profissional_inativo() -> None:
    with pytest.raises(ProfissionalNaoEncontradoError):
        criar_consulta(profissional_ativo=False).execute(
            ConsultarDisponibilidadeInput(1, SERVICO_ID)
        )


def test_rejeita_servico_que_o_profissional_nao_oferece() -> None:
    with pytest.raises(ProfissionalServicoNaoEncontradoError):
        criar_consulta(associado=False).execute(
            ConsultarDisponibilidadeInput(1, SERVICO_ID)
        )


# Criação de agendamento (RN02)


def _proxima_segunda_as(horario: str) -> datetime:
    hoje = datetime.now(FORTALEZA).date()
    return _as(hoje + timedelta(days=7 - hoje.weekday()), horario)


def criar_caso_com_horarios(
    jornada: list[Turno] | None = None,
) -> tuple[CriarAgendamentoUseCase, Usuario, Usuario]:
    caso, cliente, profissional, _ = _criar_caso()
    caso.horario_repository = InMemoryHorarioRepository(
        EXPEDIENTE_DA_BARBEARIA,
        {profissional.id: jornada} if jornada else None,
    )
    return caso, cliente, profissional


def _agendar(
    caso: CriarAgendamentoUseCase,
    cliente: Usuario,
    profissional: Usuario,
    inicio: datetime,
) -> Agendamento:
    return caso.execute(
        CriarAgendamentoInput(
            cliente_id=cliente.id,
            profissional_id=profissional.id,
            servico_id=SERVICO_ID,
            inicio=inicio,
        ),
        cliente,
    )


def test_cria_agendamento_dentro_do_expediente_da_barbearia() -> None:
    caso, cliente, profissional = criar_caso_com_horarios()

    agendamento = _agendar(caso, cliente, profissional, _proxima_segunda_as("09:00"))

    assert agendamento.id == 1


@pytest.mark.parametrize("horario", ["12:30", "11:45", "17:45", "07:30"])
def test_rejeita_agendamento_que_nao_cabe_inteiro_no_expediente(horario: str) -> None:
    caso, cliente, profissional = criar_caso_com_horarios()

    with pytest.raises(ForaDoHorarioDeAtendimentoError):
        _agendar(caso, cliente, profissional, _proxima_segunda_as(horario))


def test_rejeita_agendamento_fora_da_jornada_propria() -> None:
    caso, cliente, profissional = criar_caso_com_horarios(
        jornada=turnos([DiaSemana.SEGUNDA], ("14:00", "18:00"))
    )

    with pytest.raises(ForaDoHorarioDeAtendimentoError):
        _agendar(caso, cliente, profissional, _proxima_segunda_as("09:00"))

    assert _agendar(caso, cliente, profissional, _proxima_segunda_as("14:00")).id == 1
