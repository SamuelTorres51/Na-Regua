from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.dependencies import (
    get_contar_notificacoes_nao_lidas_use_case,
    get_current_admin,
    get_current_user,
    get_listar_notificacoes_use_case,
    get_marcar_notificacao_lida_use_case,
    get_processar_lembretes_use_case,
)
from api.schemas.notificacao import (
    ContadorNotificacoesResponse,
    NotificacaoResponse,
    ProcessarLembretesRequest,
    ProcessarLembretesResponse,
)
from application.common.exceptions import (
    NotificacaoNaoEncontradaError,
    NotificacaoNaoPermitidaError,
)
from application.use_cases.notificacoes.contar_notificacoes_nao_lidas import (
    ContarNotificacoesNaoLidasUseCase,
)
from application.use_cases.notificacoes.listar_notificacoes import (
    ListarNotificacoesUseCase,
)
from application.use_cases.notificacoes.marcar_notificacao_lida import (
    MarcarNotificacaoLidaUseCase,
)
from application.use_cases.notificacoes.processar_lembretes import (
    ProcessarLembretesUseCase,
)
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/notificacoes", tags=["Notificações"])


@router.get(
    "",
    response_model=list[NotificacaoResponse],
    summary="Listar notificações do usuário autenticado",
)
def listar_notificacoes(
    usuario_atual: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        ListarNotificacoesUseCase,
        Depends(get_listar_notificacoes_use_case),
    ],
    apenas_nao_lidas: Annotated[
        bool,
        Query(description="Filtrar apenas notificações não lidas"),
    ] = False,
) -> list[NotificacaoResponse]:
    notificacoes = use_case.execute(
        usuario_id=usuario_atual.id,
        apenas_nao_lidas=apenas_nao_lidas,
    )
    return [NotificacaoResponse.model_validate(n) for n in notificacoes]


@router.get(
    "/nao-lidas/count",
    response_model=ContadorNotificacoesResponse,
    summary="Obter contagem de notificações não lidas do usuário autenticado",
)
def contar_notificacoes_nao_lidas(
    usuario_atual: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        ContarNotificacoesNaoLidasUseCase,
        Depends(get_contar_notificacoes_nao_lidas_use_case),
    ],
) -> ContadorNotificacoesResponse:
    total = use_case.execute(usuario_id=usuario_atual.id)
    return ContadorNotificacoesResponse(total_nao_lidas=total)


@router.patch(
    "/{notificacao_id}/ler",
    response_model=NotificacaoResponse,
    summary="Marcar uma notificação como lida",
)
def marcar_como_lida(
    notificacao_id: int,
    usuario_atual: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        MarcarNotificacaoLidaUseCase,
        Depends(get_marcar_notificacao_lida_use_case),
    ],
) -> NotificacaoResponse:
    try:
        atualizada = use_case.execute(
            notificacao_id=notificacao_id,
            usuario_id=usuario_atual.id,
        )
        return NotificacaoResponse.model_validate(atualizada)
    except NotificacaoNaoEncontradaError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except NotificacaoNaoPermitidaError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error


@router.post(
    "/processar-lembretes",
    response_model=ProcessarLembretesResponse,
    summary="Processar e disparar notificações de lembrete (RF65) (Apenas Administrador)",
)
def processar_lembretes(
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        ProcessarLembretesUseCase,
        Depends(get_processar_lembretes_use_case),
    ],
    request: ProcessarLembretesRequest = ProcessarLembretesRequest(),
) -> ProcessarLembretesResponse:
    geradas = use_case.execute(janela_horas=request.janela_horas)
    return ProcessarLembretesResponse(
        total_processados=len(geradas),
        notificacoes=[NotificacaoResponse.model_validate(n) for n in geradas],
    )

