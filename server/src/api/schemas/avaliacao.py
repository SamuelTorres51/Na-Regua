from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class CriarAvaliacaoRequest(BaseModel):
    nota: int = Field(ge=1, le=5)
    comentario: str = Field(default="", max_length=1000)


class AvaliacaoResponse(BaseModel):
    id: int
    agendamento_id: int = Field(
        validation_alias=AliasChoices("agendamentoId", "agendamento_id"),
        serialization_alias="agendamentoId",
    )
    cliente_id: int = Field(
        validation_alias=AliasChoices("clienteId", "cliente_id"),
        serialization_alias="clienteId",
    )
    profissional_id: int = Field(
        validation_alias=AliasChoices("profissionalId", "profissional_id"),
        serialization_alias="profissionalId",
    )
    nota: int
    comentario: str
    criada_em: datetime = Field(
        validation_alias=AliasChoices("criadaEm", "criada_em"),
        serialization_alias="criadaEm",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class MediaAvaliacoesProfissionalResponse(BaseModel):
    profissional_id: int = Field(
        validation_alias=AliasChoices("profissionalId", "profissional_id"),
        serialization_alias="profissionalId",
    )
    media_nota: float | None = Field(
        validation_alias=AliasChoices("mediaNota", "media_nota"),
        serialization_alias="mediaNota",
    )
    total_avaliacoes: int = Field(
        validation_alias=AliasChoices("totalAvaliacoes", "total_avaliacoes"),
        serialization_alias="totalAvaliacoes",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
