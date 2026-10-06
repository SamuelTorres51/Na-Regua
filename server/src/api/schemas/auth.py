from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    email: EmailStr
    telefone: str = Field(min_length=10, max_length=20)
    senha: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str
    perfil: str
    ativo: bool

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UserResponse


class AlterarSenhaRequest(BaseModel):
    senha_atual: str = Field(min_length=1)
    nova_senha: str = Field(min_length=8, max_length=128)


class MensagemResponse(BaseModel):
    mensagem: str