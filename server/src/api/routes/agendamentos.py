from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import get_criar_agendamento_use_case, get_current_user
from api.schemas.agendamentos import (
    AgendamentoResponse,
    CriarAgendamentoRequest,
)
from application.common.exceptions import (
    HorarioIndisponivelError,
    ValidationError,
)
from application.use_cases.agendamentos.criar_agendamento import (
    CriarAgendamentoInput,
    CriarAgendamentoUseCase,
)
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.post(
    "",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_agendamento(
    request: CriarAgendamentoRequest,
    usuario: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        CriarAgendamentoUseCase,
        Depends(get_criar_agendamento_use_case),
    ],
) -> AgendamentoResponse:
    try:
        agendamento = use_case.execute(
            CriarAgendamentoInput(
                cliente_id=usuario.id,
                profissional_id=request.profissional_id,
                servico_id=request.servico_id,
                inicio=request.inicio,
                duracao_minutos=request.duracao_minutos,
            )
        )
        return AgendamentoResponse.from_entity(agendamento)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except HorarioIndisponivelError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error