from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from api.dependencies import (
    get_associar_profissional_servico_use_case,
    get_current_user,
    get_listar_profissionais_do_servico_use_case,
    get_listar_servicos_do_profissional_use_case,
    get_remover_profissional_servico_use_case,
)
from application.common.exceptions import (
    ProfissionalServicoDuplicadoError,
    ProfissionalServicoNaoEncontradoError,
)
from application.use_cases.profissional_servico.associar_profissional_servico import (
    AssociarProfissionalServicoUseCase,
)
from application.use_cases.profissional_servico.listar_profissionais_do_servico import (
    ListarProfissionaisDoServicoUseCase,
)
from application.use_cases.profissional_servico.listar_servicos_do_profissional import (
    ListarServicosDoProfissionalUseCase,
)
from application.use_cases.profissional_servico.remover_profissional_servico import (
    RemoverProfissionalServicoUseCase,
)
from domain.entities.profissional_servico import ProfissionalServico
from domain.entities.servico import Servico
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.servico_repository import ServicoRepository
from domain.repositories.usuario_repository import UsuarioRepository
from main import app


class InMemoryProfissionalServicoRepository(ProfissionalServicoRepository):
    def __init__(self) -> None:
        self.associacoes: list[ProfissionalServico] = []

    def associar(self, profissional_servico: ProfissionalServico) -> ProfissionalServico:
        self.associacoes.append(profissional_servico)
        return profissional_servico

    def remover(self, profissional_id: int, servico_id: int) -> bool:
        for associacao in self.associacoes:
            if (
                associacao.profissional_id == profissional_id
                and associacao.servico_id == servico_id
            ):
                self.associacoes.remove(associacao)
                return True
        return False

    def existe(self, profissional_id: int, servico_id: int) -> bool:
        return any(
            associacao.profissional_id == profissional_id
            and associacao.servico_id == servico_id
            for associacao in self.associacoes
        )

    def listar_servicos_por_profissional(self, profissional_id: int) -> list[int]:
        return [
            associacao.servico_id
            for associacao in self.associacoes
            if associacao.profissional_id == profissional_id
        ]

    def listar_profissionais_por_servico(self, servico_id: int) -> list[int]:
        return [
            associacao.profissional_id
            for associacao in self.associacoes
            if associacao.servico_id == servico_id
        ]


class InMemoryUsuarioRepository(UsuarioRepository):
    def __init__(self, usuarios: list[Usuario]) -> None:
        self.usuarios = usuarios

    def buscar_por_id(self, usuario_id: int) -> Usuario | None:
        return next((usuario for usuario in self.usuarios if usuario.id == usuario_id), None)

    def buscar_por_email(self, email: str) -> Usuario | None:
        return next((usuario for usuario in self.usuarios if usuario.email == email), None)

    def criar(self, usuario: Usuario) -> Usuario:
        self.usuarios.append(usuario)
        return usuario

    def atualizar(self, usuario: Usuario) -> Usuario:
        return usuario


class InMemoryServicoRepository(ServicoRepository):
    def __init__(self, servicos: list[Servico]) -> None:
        self.servicos = servicos

    def buscar_por_id(self, servico_id: int) -> Servico | None:
        return next((servico for servico in self.servicos if servico.id == servico_id), None)

    def buscar_por_nome(self, nome: str) -> Servico | None:
        return next((servico for servico in self.servicos if servico.nome == nome), None)

    def listar(self, apenas_ativos: bool = False) -> list[Servico]:
        if apenas_ativos:
            return [servico for servico in self.servicos if servico.ativo]
        return list(self.servicos)

    def criar(self, servico: Servico) -> Servico:
        self.servicos.append(servico)
        return servico

    def atualizar(self, servico: Servico) -> Servico:
        return servico

    def deletar(self, servico_id: int) -> bool:
        return bool(self.servicos.pop(servico_id))


def _usuario(usuario_id: int, perfil: PerfilAcesso) -> Usuario:
    return Usuario(
        id=usuario_id,
        nome=f"Usuário {usuario_id}",
        email=f"usuario{usuario_id}@example.com",
        telefone="86999999999",
        senha_hash="hash",
        perfil=perfil,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def _caso() -> tuple[
    AssociarProfissionalServicoUseCase,
    InMemoryProfissionalServicoRepository,
    Usuario,
    Servico,
]:
    profissional = _usuario(1, PerfilAcesso.PROFISSIONAL)
    servico = Servico(2, "Corte", "", 30, 30.0)
    associacao_repository = InMemoryProfissionalServicoRepository()
    caso = AssociarProfissionalServicoUseCase(
        associacao_repository,
        InMemoryUsuarioRepository([profissional]),
        InMemoryServicoRepository([servico]),
    )
    return caso, associacao_repository, profissional, servico


def test_associa_profissional_e_servico_e_rejeita_duplicidade() -> None:
    caso, repository, profissional, servico = _caso()

    associacao = caso.execute(profissional.id, servico.id)

    assert associacao == ProfissionalServico(profissional.id, servico.id)
    with pytest.raises(ProfissionalServicoDuplicadoError):
        caso.execute(profissional.id, servico.id)
    assert repository.existe(profissional.id, servico.id)


def test_remove_associacao() -> None:
    caso, repository, profissional, servico = _caso()
    caso.execute(profissional.id, servico.id)
    remover = RemoverProfissionalServicoUseCase(repository)

    remover.execute(profissional.id, servico.id)

    assert not repository.existe(profissional.id, servico.id)
    with pytest.raises(ProfissionalServicoNaoEncontradoError):
        remover.execute(profissional.id, servico.id)


def test_listagens_por_profissional_e_servico() -> None:
    caso, repository, profissional, servico = _caso()
    caso.execute(profissional.id, servico.id)
    profissionais = InMemoryUsuarioRepository([profissional])
    servicos = InMemoryServicoRepository([servico])

    servicos_do_profissional = ListarServicosDoProfissionalUseCase(
        repository,
        servicos,
        profissionais,
    ).execute(profissional.id)
    profissionais_do_servico = ListarProfissionaisDoServicoUseCase(
        repository,
        type("ProfissionalRepository", (), {
            "buscar_por_id": profissionais.buscar_por_id,
        })(),
        servicos,
    ).execute(servico.id)

    assert [item.id for item in servicos_do_profissional] == [servico.id]
    assert [item.id for item in profissionais_do_servico] == [profissional.id]


def test_rotas_de_associacao_exigem_administrador() -> None:
    cliente = _usuario(10, PerfilAcesso.CLIENTE)
    app.dependency_overrides[get_current_user] = lambda: cliente
    client = TestClient(app)

    response = client.post("/profissionais/1/servicos/2")

    assert response.status_code == 403
    app.dependency_overrides.clear()
