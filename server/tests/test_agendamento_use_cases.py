from datetime import datetime, timedelta, timezone

import pytest

from application.common.exceptions import HorarioIndisponivelError, ValidationError
from application.use_cases.agendamentos.criar_agendamento import (
    CriarAgendamentoInput,
    CriarAgendamentoUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository


class InMemoryAgendamentoRepository(AgendamentoRepository):
    def __init__(self) -> None:
        self.agendamentos: list[Agendamento] = []

    def buscar_conflito(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> Agendamento | None:
        return next(
            (
                item
                for item in self.agendamentos
                if item.profissional_id == profissional_id
                and item.status != StatusAgendamento.CANCELADO
                and item.inicio < fim
                and item.fim > inicio
            ),
            None,
        )

    def criar(self, agendamento: Agendamento) -> Agendamento:
        criado = Agendamento(
            **{
                **agendamento.__dict__,
                "id": len(self.agendamentos) + 1,
            }
        )
        self.agendamentos.append(criado)
        return criado


def _input(**overrides: object) -> CriarAgendamentoInput:
    dados: dict[str, object] = {
        "cliente_id": 1,
        "profissional_id": 2,
        "servico_id": 3,
        "inicio": datetime.now(timezone.utc) + timedelta(days=1),
        "duracao_minutos": 45,
    }
    dados.update(overrides)
    return CriarAgendamentoInput(**dados)


def test_cria_agendamento_com_status_agendado() -> None:
    use_case = CriarAgendamentoUseCase(InMemoryAgendamentoRepository())

    resultado = use_case.execute(_input())

    assert resultado.id == 1
    assert resultado.status is StatusAgendamento.AGENDADO
    assert resultado.cliente_id == 1


def test_rejeita_agendamento_no_passado() -> None:
    use_case = CriarAgendamentoUseCase(InMemoryAgendamentoRepository())

    with pytest.raises(ValidationError, match="futuro"):
        use_case.execute(
            _input(inicio=datetime.now(timezone.utc) - timedelta(minutes=1))
        )


def test_rejeita_conflito_do_mesmo_profissional() -> None:
    repository = InMemoryAgendamentoRepository()
    use_case = CriarAgendamentoUseCase(repository)
    inicio = datetime.now(timezone.utc) + timedelta(days=1)

    use_case.execute(_input(inicio=inicio))

    with pytest.raises(HorarioIndisponivelError):
        use_case.execute(
            _input(
                inicio=inicio + timedelta(minutes=30),
            )
        )
