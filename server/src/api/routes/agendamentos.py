from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import get_current_user, get_criar_agendamento_use_case
from api.schemas.agendamento import (
    AgendamentoResponse,
    CriarAgendamentoRequest,
)
from application.common.exceptions import (
    AgendamentoConflitanteError,
    AgendamentoNaoPermitidoError,
    ClienteNaoEncontradoError,
    ProfissionalNaoEncontradoError,
    ServicoNaoEncontradoError,
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
    summary="Criar um agendamento",
)
def criar_agendamento(
    request: CriarAgendamentoRequest,
    usuario_atual: Annotated[Usuario, Depends(get_current_user)],
    use_case: Annotated[
        CriarAgendamentoUseCase,
        Depends(get_criar_agendamento_use_case),
    ],
) -> AgendamentoResponse:
    try:
        agendamento = use_case.execute(
            CriarAgendamentoInput(
                cliente_id=request.cliente_id,
                profissional_id=request.profissional_id,
                servico_id=request.servico_id,
                inicio=request.inicio,
            ),
            usuario_atual,
        )
        return AgendamentoResponse.model_validate(agendamento)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except AgendamentoNaoPermitidoError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error
    except (
        ClienteNaoEncontradoError,
        ProfissionalNaoEncontradoError,
        ServicoNaoEncontradoError,
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except AgendamentoConflitanteError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error