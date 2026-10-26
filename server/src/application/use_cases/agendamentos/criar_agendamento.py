from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from application.common.exceptions import (
    HorarioIndisponivelError,
    ValidationError,
)
from domain.entities.agendamento import Agendamento
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository


@dataclass(frozen=True)
class CriarAgendamentoInput:
    cliente_id: int
    profissional_id: int
    servico_id: int
    inicio: datetime
    duracao_minutos: int


class CriarAgendamentoUseCase:
    def __init__(self, agendamento_repository: AgendamentoRepository) -> None:
        self.agendamento_repository = agendamento_repository

    def validate(self, dados: CriarAgendamentoInput) -> None:
        if dados.cliente_id <= 0:
            raise ValidationError("O cliente informado é inválido.")
        if dados.profissional_id <= 0:
            raise ValidationError("O profissional informado é inválido.")
        if dados.servico_id <= 0:
            raise ValidationError("O serviço informado é inválido.")
        if dados.duracao_minutos <= 0 or dados.duracao_minutos > 480:
            raise ValidationError(
                "A duração deve estar entre 1 e 480 minutos."
            )
        if dados.inicio.tzinfo is None or dados.inicio.utcoffset() is None:
            raise ValidationError(
                "O início deve informar o fuso horário, por exemplo -03:00."
            )

        agora = datetime.now(timezone.utc)
        inicio = dados.inicio.astimezone(timezone.utc)
        if inicio <= agora:
            raise ValidationError("O agendamento deve ocorrer no futuro.")

    def execute(self, dados: CriarAgendamentoInput) -> Agendamento:
        self.validate(dados)
        inicio = dados.inicio.astimezone(timezone.utc)
        fim = inicio + timedelta(minutes=dados.duracao_minutos)

        if (
            self.agendamento_repository.buscar_conflito(
                dados.profissional_id,
                inicio,
                fim,
            )
            is not None
        ):
            raise HorarioIndisponivelError(
                "O profissional já possui um agendamento nesse horário."
            )

        return self.agendamento_repository.criar(
            Agendamento(
                id=None,
                cliente_id=dados.cliente_id,
                profissional_id=dados.profissional_id,
                servico_id=dados.servico_id,
                inicio=inicio,
                duracao_minutos=dados.duracao_minutos,
                status=StatusAgendamento.AGENDADO,
                criado_em=datetime.now(timezone.utc),
            )
        )
