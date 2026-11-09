from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import (
    get_current_admin,
    get_current_user,
    get_listar_avaliacoes_do_cliente_use_case,
    get_listar_avaliacoes_para_administrador_use_case,
)
from api.schemas.avaliacao import AvaliacaoResponse
from application.common.exceptions import AvaliacaoNaoPermitidaError
from application.use_cases.avaliacoes.listar_avaliacoes_do_cliente import (
    ListarAvaliacoesDoClienteUseCase,
)
from application.use_cases.avaliacoes.listar_avaliacoes_para_administrador import (
    ListarAvaliacoesParaAdministradorUseCase,
)
from domain.entities.usuario import Usuario


router = APIRouter(prefix="/avaliacoes", tags=["Avaliacoes"])


@router.get(
    "",
    response_model=list[AvaliacaoResponse],
    summary="Listar avaliacoes para administradores",
)
def listar_avaliacoes(
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        ListarAvaliacoesParaAdministradorUseCase,
        Depends(get_listar_avaliacoes_para_administrador_use_case),
    ],
) -> list[AvaliacaoResponse]:
    avaliacoes = use_case.execute()
    return [AvaliacaoResponse.model_validate(avaliacao) for avaliacao in avaliacoes]


@router.get(
    "/minhas",
    response_model=list[AvaliacaoResponse],
    summary="Listar historico de avaliacoes do cliente autenticado",
)
def listar_minhas_avaliacoes(
    usuario_atual: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        ListarAvaliacoesDoClienteUseCase,
        Depends(get_listar_avaliacoes_do_cliente_use_case),
    ],
) -> list[AvaliacaoResponse]:
    try:
        avaliacoes = use_case.execute(usuario_atual)
        return [AvaliacaoResponse.model_validate(avaliacao) for avaliacao in avaliacoes]
    except AvaliacaoNaoPermitidaError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error
