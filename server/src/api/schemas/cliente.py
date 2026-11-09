from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AtualizarClienteRequest(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    email: EmailStr
    telefone: str = Field(min_length=10, max_length=20)


class ClienteResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str
    perfil: str
    ativo: bool
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
