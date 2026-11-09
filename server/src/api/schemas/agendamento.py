from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from domain.enums.status_agendamento import StatusAgendamento


class PessoaAgendamentoResponse(BaseModel):
    id: int
    nome: str


class ServicoAgendamentoResponse(BaseModel):
    id: int
    nome: str


class CriarAgendamentoRequest(BaseModel):
    cliente_id: int = Field(
        gt=0,
        validation_alias=AliasChoices("clienteId", "cliente_id"),
    )
    profissional_id: int = Field(
        gt=0,
        validation_alias=AliasChoices("profissionalId", "profissional_id"),
    )
    servico_id: int = Field(
        gt=0,
        validation_alias=AliasChoices("servicoId", "servico_id"),
    )
    inicio: datetime

    model_config = ConfigDict(populate_by_name=True)


class AtualizarStatusAgendamentoRequest(BaseModel):
    status: StatusAgendamento


class AgendamentoResponse(BaseModel):
    id: int
    inicio: datetime
    duracao_minutos: int = Field(
        validation_alias=AliasChoices("duracaoMinutos", "duracao_minutos"),
        serialization_alias="duracaoMinutos",
    )
    status: str
    criado_em: datetime = Field(
        validation_alias=AliasChoices("criadoEm", "criado_em"),
        serialization_alias="criadoEm",
    )
    cliente: PessoaAgendamentoResponse | None = None
    profissional: PessoaAgendamentoResponse | None = None
    servico: ServicoAgendamentoResponse | None = None

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
