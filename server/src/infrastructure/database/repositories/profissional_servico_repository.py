from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from domain.entities.profissional_servico import ProfissionalServico
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from infrastructure.database.models.profissional_servico_model import (
    ProfissionalServicoModel,
)


class SqlAlchemyProfissionalServicoRepository(ProfissionalServicoRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def associar(
        self,
        profissional_servico: ProfissionalServico,
    ) -> ProfissionalServico:
        model = ProfissionalServicoModel(
            profissional_id=profissional_servico.profissional_id,
            servico_id=profissional_servico.servico_id,
        )
        self._db.add(model)
        self._db.commit()
        return _para_entidade(model)

    def remover(self, profissional_id: int, servico_id: int) -> bool:
        result = self._db.execute(
            delete(ProfissionalServicoModel).where(
                ProfissionalServicoModel.profissional_id == profissional_id,
                ProfissionalServicoModel.servico_id == servico_id,
            )
        )
        self._db.commit()
        return result.rowcount > 0

    def existe(self, profissional_id: int, servico_id: int) -> bool:
        query = select(ProfissionalServicoModel.profissional_id).where(
            ProfissionalServicoModel.profissional_id == profissional_id,
            ProfissionalServicoModel.servico_id == servico_id,
        )
        return self._db.scalar(query) is not None

    def listar_servicos_por_profissional(
        self,
        profissional_id: int,
    ) -> list[int]:
        query = (
            select(ProfissionalServicoModel.servico_id)
            .where(ProfissionalServicoModel.profissional_id == profissional_id)
            .order_by(ProfissionalServicoModel.servico_id)
        )
        return list(self._db.scalars(query).all())

    def listar_profissionais_por_servico(
        self,
        servico_id: int,
    ) -> list[int]:
        query = (
            select(ProfissionalServicoModel.profissional_id)
            .where(ProfissionalServicoModel.servico_id == servico_id)
            .order_by(ProfissionalServicoModel.profissional_id)
        )
        return list(self._db.scalars(query).all())


def _para_entidade(
    model: ProfissionalServicoModel,
) -> ProfissionalServico:
    return ProfissionalServico(
        profissional_id=model.profissional_id,
        servico_id=model.servico_id,
    )
