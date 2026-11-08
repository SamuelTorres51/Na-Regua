from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class CancelarAgendamentoRequest(BaseModel):
    motivo: str = Field(min_length=1, max_length=500)


class CancelamentoResponse(BaseModel):
    id: int
    agendamento_id: int = Field(
        validation_alias=AliasChoices("agendamentoId", "agendamento_id"),
        serialization_alias="agendamentoId",
    )
    autor_id: int = Field(
        validation_alias=AliasChoices("autorId", "autor_id"),
        serialization_alias="autorId",
    )
    motivo: str
    cancelado_em: datetime = Field(
        validation_alias=AliasChoices("canceladoEm", "cancelado_em"),
        serialization_alias="canceladoEm",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
