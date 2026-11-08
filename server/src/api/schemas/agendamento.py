from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from domain.enums.status_agendamento import StatusAgendamento


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
    cliente_id: int = Field(
        validation_alias=AliasChoices("clienteId", "cliente_id"),
        serialization_alias="clienteId",
    )
    profissional_id: int = Field(
        validation_alias=AliasChoices("profissionalId", "profissional_id"),
        serialization_alias="profissionalId",
    )
    servico_id: int = Field(
        validation_alias=AliasChoices("servicoId", "servico_id"),
        serialization_alias="servicoId",
    )
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

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
