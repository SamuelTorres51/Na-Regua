from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import (
    get_alterar_senha_use_case,
    get_autenticar_usuario_use_case,
    get_current_user,
    get_registrar_usuario_use_case,
)
from api.schemas.auth import (
    AlterarSenhaRequest,
    AuthResponse,
    LoginRequest,
    MensagemResponse,
    RegisterRequest,
    UserResponse,
)
from application.common.exceptions import (
    CredenciaisInvalidasError,
    EmailJaCadastradoError,
    SenhaInvalidaError,
    UsuarioNaoEncontradoError,
    ValidationError,
)
from application.use_cases.auth.alterar_senha import (
    AlterarSenhaInput,
    AlterarSenhaUseCase,
)
from application.use_cases.auth.autenticar_usuario import (
    AutenticarUsuarioInput,
    AutenticarUsuarioUseCase,
)
from application.use_cases.auth.registrar_usuario import (
    RegistrarUsuarioInput,
    RegistrarUsuarioUseCase,
)
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    use_case: Annotated[
        RegistrarUsuarioUseCase,
        Depends(get_registrar_usuario_use_case),
    ],
) -> AuthResponse:
    try:
        resultado = use_case.execute(
            RegistrarUsuarioInput(
                nome=request.nome,
                email=request.email,
                telefone=request.telefone,
                senha=request.senha,
            )
        )
        return AuthResponse(
            access_token=resultado.access_token,
            token_type=resultado.token_type,
            usuario=resultado.usuario,
        )
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except EmailJaCadastradoError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    use_case: Annotated[
        AutenticarUsuarioUseCase,
        Depends(get_autenticar_usuario_use_case),
    ],
) -> AuthResponse:
    try:
        resultado = use_case.execute(
            AutenticarUsuarioInput(
                email=request.email,
                senha=request.senha,
            )
        )
        return AuthResponse(
            access_token=resultado.access_token,
            token_type=resultado.token_type,
            usuario=resultado.usuario,
        )
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except CredenciaisInvalidasError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
            headers={"WWW-Authenticate": "Bearer"},
        ) from error


@router.get("/me", response_model=UserResponse)
def read_current_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    return usuario


@router.put("/alterar-senha", response_model=MensagemResponse)
def alterar_senha(
    request: AlterarSenhaRequest,
    usuario_atual: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        AlterarSenhaUseCase,
        Depends(get_alterar_senha_use_case),
    ],
) -> MensagemResponse:
    try:
        use_case.execute(
            AlterarSenhaInput(
                usuario_id=usuario_atual.id,
                senha_atual=request.senha_atual,
                nova_senha=request.nova_senha,
            )
        )
        return MensagemResponse(mensagem="Senha alterada com sucesso.")
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except SenhaInvalidaError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except UsuarioNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
