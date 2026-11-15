from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from domain.entities.turno import Turno
from domain.enums.dia_semana import DiaSemana
from domain.repositories.horario_repository import HorarioRepository
from infrastructure.database.models.horario_funcionamento_model import (
    HorarioFuncionamentoModel,
)
from infrastructure.database.models.turno_profissional_model import (
    TurnoProfissionalModel,
)


class SqlAlchemyHorarioRepository(HorarioRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def listar_funcionamento(self) -> list[Turno]:
        models = self._db.scalars(
            select(HorarioFuncionamentoModel).order_by(
                HorarioFuncionamentoModel.dia_semana,
                HorarioFuncionamentoModel.inicio,
            )
        ).all()
        return [_para_turno(model) for model in models]

    def definir_funcionamento(self, turnos: list[Turno]) -> list[Turno]:
        try:
            self._db.execute(delete(HorarioFuncionamentoModel))
            self._db.add_all(
                HorarioFuncionamentoModel(**_colunas(turno)) for turno in turnos
            )
            self._db.commit()
        except SQLAlchemyError:
            self._db.rollback()
            raise
        return self.listar_funcionamento()

    def buscar_jornada(self, profissional_id: int) -> list[Turno] | None:
        models = self._db.scalars(
            select(TurnoProfissionalModel)
            .where(TurnoProfissionalModel.profissional_id == profissional_id)
            .order_by(
                TurnoProfissionalModel.dia_semana,
                TurnoProfissionalModel.inicio,
            )
        ).all()
        return [_para_turno(model) for model in models] or None

    def definir_jornada(
        self,
        profissional_id: int,
        turnos: list[Turno] | None,
    ) -> list[Turno] | None:
        try:
            self._db.execute(
                delete(TurnoProfissionalModel).where(
                    TurnoProfissionalModel.profissional_id == profissional_id
                )
            )
            self._db.add_all(
                TurnoProfissionalModel(profissional_id=profissional_id, **_colunas(turno))
                for turno in turnos or []
            )
            self._db.commit()
        except SQLAlchemyError:
            self._db.rollback()
            raise
        return self.buscar_jornada(profissional_id)


def _colunas(turno: Turno) -> dict:
    return {
        "dia_semana": turno.dia_semana.indice,
        "inicio": turno.inicio,
        "fim": turno.fim,
    }


def _para_turno(model: HorarioFuncionamentoModel | TurnoProfissionalModel) -> Turno:
    return Turno(
        dia_semana=DiaSemana.do_indice(model.dia_semana),
        inicio=model.inicio,
        fim=model.fim,
    )
