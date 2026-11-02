from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class CriarServicoRequest(BaseModel):
    nome: str = Field(min_length=2, max_length=150)
    descricao: str = Field(default="", max_length=500)
    duracao_minutos: int = Field(
        gt=0,
        validation_alias=AliasChoices("duracaoMinutos", "duracao_minutos"),
        serialization_alias="duracaoMinutos",
    )
    preco: float = Field(ge=0.0)
    ativo: bool = True

    model_config = ConfigDict(populate_by_name=True)


class AtualizarServicoRequest(BaseModel):
    nome: str = Field(min_length=2, max_length=150)
    descricao: str = Field(default="", max_length=500)
    duracao_minutos: int = Field(
        gt=0,
        validation_alias=AliasChoices("duracaoMinutos", "duracao_minutos"),
        serialization_alias="duracaoMinutos",
    )
    preco: float = Field(ge=0.0)
    ativo: bool = True

    model_config = ConfigDict(populate_by_name=True)


class ServicoResponse(BaseModel):
    id: int
    nome: str
    descricao: str
    duracao_minutos: int = Field(
        validation_alias=AliasChoices("duracaoMinutos", "duracao_minutos"),
        serialization_alias="duracaoMinutos",
    )
    preco: float
    ativo: bool

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
