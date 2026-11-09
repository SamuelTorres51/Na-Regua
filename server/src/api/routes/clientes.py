from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.dependencies import (
    get_atualizar_cliente_use_case,
    get_buscar_cliente_por_id_use_case,
    get_cadastrar_cliente_use_case,
    get_current_admin,
    get_inativar_cliente_use_case,
    get_listar_clientes_use_case,
    get_reativar_cliente_use_case,
)
from api.schemas.cliente import (
    AtualizarClienteRequest,
    CadastrarClienteRequest,
    ClienteResponse,
)
from application.common.exceptions import (
    ClienteNaoEncontradoError,
    EmailJaCadastradoError,
    ValidationError,
)
from application.use_cases.clientes.atualizar_cliente import (
    AtualizarClienteInput,
    AtualizarClienteUseCase,
)
from application.use_cases.clientes.buscar_cliente_por_id import (
    BuscarClientePorIdUseCase,
)
from application.use_cases.clientes.cadastrar_cliente import (
    CadastrarClienteInput,
    CadastrarClienteUseCase,
)
from application.use_cases.clientes.inativar_cliente import InativarClienteUseCase
from application.use_cases.clientes.listar_clientes import ListarClientesUseCase
from application.use_cases.clientes.reativar_cliente import ReativarClienteUseCase
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.post(
    "",
    response_model=ClienteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar cliente (Apenas Administrador)",
)
def cadastrar_cliente(
    request: CadastrarClienteRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        CadastrarClienteUseCase,
        Depends(get_cadastrar_cliente_use_case),
    ],
) -> ClienteResponse:
    try:
        cliente = use_case.execute(
            CadastrarClienteInput(
                nome=request.nome,
                email=request.email,
                telefone=request.telefone,
                senha=request.senha,
            )
        )
        return ClienteResponse.model_validate(cliente)
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
    response_model=list[ClienteResponse],
    summary="Listar clientes (Apenas Administrador)",
)
def listar_clientes(
    apenas_ativos: Annotated[
        bool,
        Query(description="Filtrar apenas clientes ativos"),
    ] = False,
    _admin: Annotated[Usuario, Depends(get_current_admin)] = None,
    use_case: Annotated[
        ListarClientesUseCase,
        Depends(get_listar_clientes_use_case),
    ] = None,
) -> list[ClienteResponse]:
    clientes = use_case.execute(apenas_ativos=apenas_ativos)
    return [ClienteResponse.model_validate(cliente) for cliente in clientes]


@router.get(
    "/{cliente_id}",
    response_model=ClienteResponse,
    summary="Buscar cliente por ID (Apenas Administrador)",
)
def buscar_cliente_por_id(
    cliente_id: int,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        BuscarClientePorIdUseCase,
        Depends(get_buscar_cliente_por_id_use_case),
    ],
) -> ClienteResponse:
    try:
        cliente = use_case.execute(cliente_id)
        return ClienteResponse.model_validate(cliente)
    except ClienteNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.put(
    "/{cliente_id}",
    response_model=ClienteResponse,
    summary="Atualizar dados cadastrais de um cliente (Apenas Administrador)",
)
def atualizar_cliente(
    cliente_id: int,
    request: AtualizarClienteRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        AtualizarClienteUseCase,
        Depends(get_atualizar_cliente_use_case),
    ],
) -> ClienteResponse:
    try:
        cliente = use_case.execute(
            AtualizarClienteInput(
                id=cliente_id,
                nome=request.nome,
                email=request.email,
                telefone=request.telefone,
            )
        )
        return ClienteResponse.model_validate(cliente)
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
    except ClienteNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{cliente_id}/inativar",
    response_model=ClienteResponse,
    summary="Inativar cliente (Apenas Administrador)",
)
def inativar_cliente(
    cliente_id: int,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        InativarClienteUseCase,
        Depends(get_inativar_cliente_use_case),
    ],
) -> ClienteResponse:
    try:
        cliente = use_case.execute(cliente_id)
        return ClienteResponse.model_validate(cliente)
    except ClienteNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{cliente_id}/reativar",
    response_model=ClienteResponse,
    summary="Reativar cliente (Apenas Administrador)",
)
def reativar_cliente(
    cliente_id: int,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        ReativarClienteUseCase,
        Depends(get_reativar_cliente_use_case),
    ],
) -> ClienteResponse:
    try:
        cliente = use_case.execute(cliente_id)
        return ClienteResponse.model_validate(cliente)
    except ClienteNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error