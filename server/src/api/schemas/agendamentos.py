from datetime import datetime

from pydantic import BaseModel, Field

from domain.entities.agendamento import Agendamento


class CriarAgendamentoRequest(BaseModel):
    profissional_id: int = Field(gt=0)
    servico_id: int = Field(gt=0)
    inicio: datetime
    duracao_minutos: int = Field(gt=0, le=480)


class AgendamentoResponse(BaseModel):
    id: int
    cliente_id: int
    profissional_id: int
    servico_id: int
    inicio: datetime
    fim: datetime
    duracao_minutos: int
    status: str
    criado_em: datetime

    @classmethod
    def from_entity(cls, agendamento: Agendamento) -> "AgendamentoResponse":
        return cls(
            id=agendamento.id,
            cliente_id=agendamento.cliente_id,
            profissional_id=agendamento.profissional_id,
            servico_id=agendamento.servico_id,
            inicio=agendamento.inicio,
            fim=agendamento.fim,
            duracao_minutos=agendamento.duracao_minutos,
            status=agendamento.status.value,
            criado_em=agendamento.criado_em,
        )
