from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.dependencies import (
    get_atualizar_profissional_use_case,
    get_buscar_profissional_por_id_use_case,
    get_cadastrar_profissional_use_case,
    get_current_admin,
    get_inativar_profissional_use_case,
    get_listar_profissionais_use_case,
    get_reativar_profissional_use_case,
)
from api.schemas.profissional import (
    AtualizarProfissionalRequest,
    CadastrarProfissionalRequest,
    ProfissionalResponse,
)
from application.common.exceptions import (
    EmailJaCadastradoError,
    ProfissionalNaoEncontradoError,
    ValidationError,
)
from application.use_cases.profissionais.atualizar_profissional import (
    AtualizarProfissionalInput,
    AtualizarProfissionalUseCase,
)
from application.use_cases.profissionais.buscar_profissional_por_id import (
    BuscarProfissionalPorIdUseCase,
)
from application.use_cases.profissionais.cadastrar_profissional import (
    CadastrarProfissionalInput,
    CadastrarProfissionalUseCase,
)
from application.use_cases.profissionais.inativar_profissional import (
    InativarProfissionalUseCase,
)
from application.use_cases.profissionais.listar_profissionais import (
    ListarProfissionaisUseCase,
)
from application.use_cases.profissionais.reativar_profissional import (
    ReativarProfissionalUseCase,
)
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])


@router.post(
    "",
    response_model=ProfissionalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar um novo profissional (Apenas Administrador)",
)
def cadastrar_profissional(
    request: CadastrarProfissionalRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        CadastrarProfissionalUseCase,
        Depends(get_cadastrar_profissional_use_case),
    ],
) -> ProfissionalResponse:
    try:
        profissional = use_case.execute(
            CadastrarProfissionalInput(
                nome=request.nome,
                email=request.email,
                telefone=request.telefone,
                senha=request.senha,
            )
        )
        return ProfissionalResponse.model_validate(profissional)
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


@router.get(
    "",
    response_model=list[ProfissionalResponse],
    summary="Listar profissionais",
)
def listar_profissionais(
    apenas_ativos: Annotated[
        bool,
        Query(description="Filtrar apenas profissionais ativos"),
    ] = False,
    use_case: Annotated[
        ListarProfissionaisUseCase,
        Depends(get_listar_profissionais_use_case),
    ] = None,
) -> list[ProfissionalResponse]:
    profissionais = use_case.execute(apenas_ativos=apenas_ativos)
    return [ProfissionalResponse.model_validate(p) for p in profissionais]


@router.get(
    "/{profissional_id}",
    response_model=ProfissionalResponse,
    summary="Buscar profissional por ID",
)
def buscar_profissional_por_id(
    profissional_id: int,
    use_case: Annotated[
        BuscarProfissionalPorIdUseCase,
        Depends(get_buscar_profissional_por_id_use_case),
    ],
) -> ProfissionalResponse:
    try:
        profissional = use_case.execute(profissional_id)
        return ProfissionalResponse.model_validate(profissional)
    except ProfissionalNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.put(
    "/{profissional_id}",
    response_model=ProfissionalResponse,
    summary="Atualizar dados cadastrais de um profissional (Apenas Administrador)",
)
def atualizar_profissional(
    profissional_id: int,
    request: AtualizarProfissionalRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        AtualizarProfissionalUseCase,
        Depends(get_atualizar_profissional_use_case),
    ],
) -> ProfissionalResponse:
    try:
        profissional = use_case.execute(
            AtualizarProfissionalInput(
                id=profissional_id,
                nome=request.nome,
                telefone=request.telefone,
            )
        )
        return ProfissionalResponse.model_validate(profissional)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except ProfissionalNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{profissional_id}/inativar",
    response_model=ProfissionalResponse,
    summary="Inativar profissional (Apenas Administrador)",
)
def inativar_profissional(
    profissional_id: int,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        InativarProfissionalUseCase,
        Depends(get_inativar_profissional_use_case),
    ],
) -> ProfissionalResponse:
    try:
        profissional = use_case.execute(profissional_id)
        return ProfissionalResponse.model_validate(profissional)
    except ProfissionalNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{profissional_id}/reativar",
    response_model=ProfissionalResponse,
    summary="Reativar profissional (Apenas Administrador)",
)
def reativar_profissional(
    profissional_id: int,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        ReativarProfissionalUseCase,
        Depends(get_reativar_profissional_use_case),
    ],
) -> ProfissionalResponse:
    try:
        profissional = use_case.execute(profissional_id)
        return ProfissionalResponse.model_validate(profissional)
    except ProfissionalNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
