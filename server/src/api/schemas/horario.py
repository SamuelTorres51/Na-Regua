from datetime import time

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_serializer

from domain.entities.turno import Turno
from domain.enums.dia_semana import DiaSemana


class TurnoSchema(BaseModel):
    dia_semana: DiaSemana = Field(
        validation_alias=AliasChoices("diaSemana", "dia_semana"),
        serialization_alias="diaSemana",
    )
    inicio: time = Field(examples=["08:00"])
    fim: time = Field(examples=["12:00"])

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )

    @field_serializer("inicio", "fim")
    def _formatar_horario(self, valor: time) -> str:
        return valor.strftime("%H:%M")

    def para_entidade(self) -> Turno:
        return Turno(dia_semana=self.dia_semana, inicio=self.inicio, fim=self.fim)


class HorarioFuncionamentoRequest(BaseModel):
    turnos: list[TurnoSchema]


class HorarioFuncionamentoResponse(BaseModel):
    turnos: list[TurnoSchema]


class JornadaProfissionalRequest(BaseModel):
    turnos: list[TurnoSchema] | None = Field(
        description=(
            "Turnos da jornada própria do profissional. Envie null para ele "
            "seguir o horário integral da barbearia."
        ),
    )


class JornadaProfissionalResponse(BaseModel):
    profissional_id: int = Field(
        validation_alias=AliasChoices("profissionalId", "profissional_id"),
        serialization_alias="profissionalId",
    )
    personalizada: bool
    turnos: list[TurnoSchema] | None

    model_config = ConfigDict(populate_by_name=True)

    @classmethod
    def criar(
        cls,
        profissional_id: int,
        turnos: list[Turno] | None,
    ) -> "JornadaProfissionalResponse":
        return cls(
            profissional_id=profissional_id,
            personalizada=turnos is not None,
            turnos=(
                [TurnoSchema.model_validate(turno) for turno in turnos]
                if turnos is not None
                else None
            ),
        )
