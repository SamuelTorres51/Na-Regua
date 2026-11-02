from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.dependencies import (
    get_atualizar_servico_use_case,
    get_buscar_servico_por_id_use_case,
    get_criar_servico_use_case,
    get_current_admin,
    get_deletar_servico_use_case,
    get_listar_servicos_use_case,
)
from api.schemas.servico import (
    AtualizarServicoRequest,
    CriarServicoRequest,
    ServicoResponse,
)
from application.common.exceptions import (
    ServicoNaoEncontradoError,
    ServicoNomeDuplicadoError,
    ValidationError,
)
from application.use_cases.servicos.atualizar_servico import (
    AtualizarServicoInput,
    AtualizarServicoUseCase,
)
from application.use_cases.servicos.buscar_servico_por_id import (
    BuscarServicoPorIdUseCase,
)
from application.use_cases.servicos.criar_servico import (
    CriarServicoInput,
    CriarServicoUseCase,
)
from application.use_cases.servicos.deletar_servico import (
    DeletarServicoUseCase,
)
from application.use_cases.servicos.listar_servicos import (
    ListarServicosUseCase,
)
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/servicos", tags=["Serviços"])


@router.post(
    "",
    response_model=ServicoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar um novo serviço (Apenas Administrador)",
)
def criar_servico(
    request: CriarServicoRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[CriarServicoUseCase, Depends(get_criar_servico_use_case)],
) -> ServicoResponse:
    try:
        servico = use_case.execute(
            CriarServicoInput(
                nome=request.nome,
                descricao=request.descricao,
                duracao_minutos=request.duracao_minutos,
                preco=request.preco,
                ativo=request.ativo,
            )
        )
        return ServicoResponse.model_validate(servico)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except ServicoNomeDuplicadoError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.get(
    "",
    response_model=list[ServicoResponse],
    summary="Listar todos os serviços",
)
def listar_servicos(
    apenas_ativos: Annotated[
        bool,
        Query(description="Filtrar apenas serviços ativos"),
    ] = False,
    use_case: Annotated[ListarServicosUseCase, Depends(get_listar_servicos_use_case)] = None,
) -> list[ServicoResponse]:
    servicos = use_case.execute(apenas_ativos=apenas_ativos)
    return [ServicoResponse.model_validate(s) for s in servicos]


@router.get(
    "/{servico_id}",
    response_model=ServicoResponse,
    summary="Buscar serviço por ID",
)
def buscar_servico_por_id(
    servico_id: int,
    use_case: Annotated[
        BuscarServicoPorIdUseCase,
        Depends(get_buscar_servico_por_id_use_case),
    ],
) -> ServicoResponse:
    try:
        servico = use_case.execute(servico_id)
        return ServicoResponse.model_validate(servico)
    except ServicoNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.put(
    "/{servico_id}",
    response_model=ServicoResponse,
    summary="Atualizar dados de um serviço (Apenas Administrador)",
)
def atualizar_servico(
    servico_id: int,
    request: AtualizarServicoRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        AtualizarServicoUseCase,
        Depends(get_atualizar_servico_use_case),
    ],
) -> ServicoResponse:
    try:
        servico = use_case.execute(
            AtualizarServicoInput(
                id=servico_id,
                nome=request.nome,
                descricao=request.descricao,
                duracao_minutos=request.duracao_minutos,
                preco=request.preco,
                ativo=request.ativo,
            )
        )
        return ServicoResponse.model_validate(servico)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except ServicoNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except ServicoNomeDuplicadoError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.delete(
    "/{servico_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar um serviço (Apenas Administrador)",
)
def deletar_servico(
    servico_id: int,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        DeletarServicoUseCase,
        Depends(get_deletar_servico_use_case),
    ],
) -> None:
    try:
        use_case.execute(servico_id)
    except ServicoNaoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
