from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from api.dependencies import get_current_user, get_usuario_repository
from api.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from core.security import create_access_token, hash_password, verify_password
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.usuario_repository import UsuarioRepository
from infrastructure.database.repositories.usuario_repository import (
    SqlAlchemyUsuarioRepository,
)


router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> AuthResponse:
    email = request.email.strip().lower()
    if repository.buscar_por_email(email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    usuario = Usuario(
        id=None,
        nome=request.nome.strip(),
        email=email,
        telefone=request.telefone.strip(),
        senha_hash=hash_password(request.senha),
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )

    try:
        criado = repository.criar(usuario)
    except IntegrityError:
        if isinstance(repository, SqlAlchemyUsuarioRepository):
            repository.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        ) from None

    return _auth_response(criado)


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> AuthResponse:
    usuario = repository.buscar_por_email(request.email.strip().lower())
    if (
        usuario is None
        or not usuario.ativo
        or not verify_password(request.senha, usuario.senha_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _auth_response(usuario)


@router.get("/me", response_model=UserResponse)
def read_current_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    return usuario


def _auth_response(usuario: Usuario) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token({"sub": str(usuario.id)}),
        usuario=usuario,
    )
