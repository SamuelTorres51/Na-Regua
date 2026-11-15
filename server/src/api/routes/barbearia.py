from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import (
    get_consultar_horario_funcionamento_use_case,
    get_current_admin,
    get_definir_horario_funcionamento_use_case,
)
from api.schemas.horario import (
    HorarioFuncionamentoRequest,
    HorarioFuncionamentoResponse,
    TurnoSchema,
)
from application.common.exceptions import ValidationError
from application.use_cases.horarios.consultar_horario_funcionamento import (
    ConsultarHorarioFuncionamentoUseCase,
)
from application.use_cases.horarios.definir_horario_funcionamento import (
    DefinirHorarioFuncionamentoUseCase,
)
from domain.entities.turno import Turno
from domain.entities.usuario import Usuario

router = APIRouter(prefix="/barbearia", tags=["Barbearia"])


@router.get(
    "/horarios",
    response_model=HorarioFuncionamentoResponse,
    summary="Consultar o horário de funcionamento da barbearia",
    description="Dias sem turnos são dias em que a barbearia fica fechada.",
)
def consultar_horario_funcionamento(
    use_case: Annotated[
        ConsultarHorarioFuncionamentoUseCase,
        Depends(get_consultar_horario_funcionamento_use_case),
    ],
) -> HorarioFuncionamentoResponse:
    return _resposta(use_case.execute())


@router.put(
    "/horarios",
    response_model=HorarioFuncionamentoResponse,
    summary="Definir o horário de funcionamento da barbearia (Apenas Administrador)",
    description=(
        "Substitui todos os turnos. Profissionais sem jornada própria passam "
        "a seguir o novo horário."
    ),
)
def definir_horario_funcionamento(
    request: HorarioFuncionamentoRequest,
    _admin: Annotated[Usuario, Depends(get_current_admin)],
    use_case: Annotated[
        DefinirHorarioFuncionamentoUseCase,
        Depends(get_definir_horario_funcionamento_use_case),
    ],
) -> HorarioFuncionamentoResponse:
    try:
        turnos = use_case.execute(
            [turno.para_entidade() for turno in request.turnos]
        )
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    return _resposta(turnos)


def _resposta(turnos: list[Turno]) -> HorarioFuncionamentoResponse:
    return HorarioFuncionamentoResponse(
        turnos=[TurnoSchema.model_validate(turno) for turno in turnos]
    )
