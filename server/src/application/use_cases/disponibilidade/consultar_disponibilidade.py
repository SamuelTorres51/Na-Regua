from collections.abc import Callable
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from application.common.exceptions import (
    ProfissionalNaoEncontradoError,
    ProfissionalServicoNaoEncontradoError,
    ServicoNaoEncontradoError,
    ValidationError,
)
from application.use_cases.agendamentos.criar_agendamento import (
    ANTECEDENCIA_MINIMA,
    FORTALEZA_TZ,
    JANELA_MAXIMA,
)
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.horario_repository import HorarioRepository
from domain.repositories.profissional_repository import ProfissionalRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.servico_repository import ServicoRepository
from domain.services.disponibilidade import DiaDisponibilidade, calcular_dia

PASSO_DA_GRADE = timedelta(minutes=30)


@dataclass(frozen=True)
class ConsultarDisponibilidadeInput:
    profissional_id: int
    servico_id: int
    de: date | None = None
    ate: date | None = None


class ConsultarDisponibilidadeUseCase:
    def __init__(
        self,
        profissional_repository: ProfissionalRepository,
        servico_repository: ServicoRepository,
        profissional_servico_repository: ProfissionalServicoRepository,
        agendamento_repository: AgendamentoRepository,
        horario_repository: HorarioRepository,
        relogio: Callable[[], datetime] | None = None,
    ) -> None:
        self.profissional_repository = profissional_repository
        self.servico_repository = servico_repository
        self.profissional_servico_repository = profissional_servico_repository
        self.agendamento_repository = agendamento_repository
        self.horario_repository = horario_repository
        self.relogio = relogio or (lambda: datetime.now(FORTALEZA_TZ))

    def execute(self, dados: ConsultarDisponibilidadeInput) -> list[DiaDisponibilidade]:
        if dados.de is not None and dados.ate is not None and dados.ate < dados.de:
            raise ValidationError("A data final não pode ser anterior à data inicial.")

        profissional = self.profissional_repository.buscar_por_id(
            dados.profissional_id
        )
        if profissional is None or not profissional.ativo:
            raise ProfissionalNaoEncontradoError(
                "Profissional não encontrado ou inativo."
            )

        servico = self.servico_repository.buscar_por_id(dados.servico_id)
        if servico is None or not servico.ativo:
            raise ServicoNaoEncontradoError(
                f"Serviço com ID {dados.servico_id} não encontrado ou inativo."
            )

        if not self.profissional_servico_repository.existe(
            dados.profissional_id,
            dados.servico_id,
        ):
            raise ProfissionalServicoNaoEncontradoError(
                "O profissional selecionado não oferece o serviço informado."
            )

        agora = self.relogio().astimezone(FORTALEZA_TZ)
        inicio_maximo = agora + JANELA_MAXIMA
        primeiro_dia = max(dados.de or agora.date(), agora.date())
        ultimo_dia = min(dados.ate or inicio_maximo.date(), inicio_maximo.date())
        if ultimo_dia < primeiro_dia:
            return []

        funcionamento = self.horario_repository.listar_funcionamento()
        jornada = self.horario_repository.buscar_jornada(dados.profissional_id)
        ocupados = self.agendamento_repository.listar_ocupados(
            dados.profissional_id,
            datetime.combine(primeiro_dia, time.min, FORTALEZA_TZ),
            datetime.combine(ultimo_dia + timedelta(days=1), time.min, FORTALEZA_TZ),
        )

        return [
            calcular_dia(
                dia,
                funcionamento=funcionamento,
                jornada=jornada,
                ocupados=ocupados,
                duracao=timedelta(minutes=servico.duracao_minutos),
                passo=PASSO_DA_GRADE,
                inicio_minimo=agora + ANTECEDENCIA_MINIMA,
                inicio_maximo=inicio_maximo,
                fuso=FORTALEZA_TZ,
            )
            for dia in _dias_entre(primeiro_dia, ultimo_dia)
        ]


def _dias_entre(primeiro: date, ultimo: date) -> list[date]:
    return [
        primeiro + timedelta(days=deslocamento)
        for deslocamento in range((ultimo - primeiro).days + 1)
    ]
