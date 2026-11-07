from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CadastrarProfissionalRequest(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    email: EmailStr
    telefone: str = Field(min_length=10, max_length=20)
    senha: str = Field(min_length=8, max_length=128)


class AtualizarProfissionalRequest(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    telefone: str = Field(min_length=10, max_length=20)


class ProfissionalResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str
    perfil: str
    ativo: bool
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfissionalServicoResponse(BaseModel):
    profissional_id: int
    servico_id: int

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
