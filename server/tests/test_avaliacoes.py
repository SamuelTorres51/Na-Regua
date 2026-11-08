from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from api.dependencies import (
    get_criar_avaliacao_use_case,
    get_consultar_media_avaliacoes_profissional_use_case,
    get_current_user,
    get_listar_avaliacoes_do_cliente_use_case,
)
from application.common.exceptions import (
    AvaliacaoAgendamentoNaoConcluidoError,
    AvaliacaoJaRegistradaError,
    AvaliacaoNaoPermitidaError,
    ProfissionalNaoEncontradoError,
    ValidationError,
)
from application.use_cases.avaliacoes.criar_avaliacao import (
    CriarAvaliacaoInput,
    CriarAvaliacaoUseCase,
)
from application.use_cases.avaliacoes.listar_avaliacoes_do_cliente import (
    ListarAvaliacoesDoClienteUseCase,
)
from application.use_cases.avaliacoes.consultar_media_avaliacoes_profissional import (
    ConsultarMediaAvaliacoesProfissionalUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.entities.avaliacao import Avaliacao
from domain.entities.profissional import Profissional
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.avaliacao_repository import AvaliacaoRepository
from main import app
from tests.test_profissionais_use_cases import InMemoryProfissionalRepository


class InMemoryAgendamentoRepository(AgendamentoRepository):
    def __init__(self, agendamento: Agendamento | None) -> None:
        self.agendamento = agendamento

    def criar(self, agendamento: Agendamento) -> Agendamento:
        self.agendamento = agendamento
        return agendamento

    def buscar_por_id(self, agendamento_id: int) -> Agendamento | None:
        if self.agendamento is None or self.agendamento.id != agendamento_id:
            return None
        return self.agendamento

    def atualizar_status(
        self,
        agendamento_id: int,
        status: StatusAgendamento,
    ) -> Agendamento | None:
        agendamento = self.buscar_por_id(agendamento_id)
        if agendamento is not None:
            agendamento.status = status
        return agendamento

    def listar(self, **_kwargs) -> list[Agendamento]:
        return [self.agendamento] if self.agendamento is not None else []

    def existe_conflito_profissional(self, *_args) -> bool:
        return False

    def existe_conflito_cliente(self, *_args) -> bool:
        return False


class InMemoryAvaliacaoRepository(AvaliacaoRepository):
    def __init__(self) -> None:
        self.avaliacoes: list[Avaliacao] = []

    def criar(self, avaliacao: Avaliacao) -> Avaliacao:
        criada = Avaliacao(
            id=len(self.avaliacoes) + 1,
            agendamento_id=avaliacao.agendamento_id,
            cliente_id=avaliacao.cliente_id,
            profissional_id=avaliacao.profissional_id,
            nota=avaliacao.nota,
            comentario=avaliacao.comentario,
            criada_em=avaliacao.criada_em,
        )
        self.avaliacoes.append(criada)
        return criada

    def buscar_por_agendamento_id(
        self,
        agendamento_id: int,
    ) -> Avaliacao | None:
        return next(
            (
                avaliacao
                for avaliacao in self.avaliacoes
                if avaliacao.agendamento_id == agendamento_id
            ),
            None,
        )

    def listar(
        self,
        *,
        cliente_id: int | None = None,
        profissional_id: int | None = None,
    ) -> list[Avaliacao]:
        avaliacoes = [
            avaliacao
            for avaliacao in self.avaliacoes
            if (cliente_id is None or avaliacao.cliente_id == cliente_id)
            and (
                profissional_id is None
                or avaliacao.profissional_id == profissional_id
            )
        ]
        return sorted(avaliacoes, key=lambda avaliacao: avaliacao.criada_em, reverse=True)

    def calcular_media_por_profissional(
        self,
        profissional_id: int,
    ) -> float | None:
        notas = [
            avaliacao.nota
            for avaliacao in self.avaliacoes
            if avaliacao.profissional_id == profissional_id
        ]
        return sum(notas) / len(notas) if notas else None

    def contar_por_profissional(self, profissional_id: int) -> int:
        return sum(
            1
            for avaliacao in self.avaliacoes
            if avaliacao.profissional_id == profissional_id
        )


def _usuario(usuario_id: int, perfil: PerfilAcesso) -> Usuario:
    return Usuario(
        id=usuario_id,
        nome=f"Usuario {usuario_id}",
        email=f"usuario{usuario_id}@example.com",
        telefone="86999999999",
        senha_hash="hash",
        perfil=perfil,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def _agendamento(
    status: StatusAgendamento = StatusAgendamento.CONCLUIDO,
) -> Agendamento:
    return Agendamento(
        id=10,
        cliente_id=1,
        profissional_id=2,
        servico_id=3,
        inicio=datetime.now(timezone.utc),
        duracao_minutos=30,
        status=status,
    )


def _caso(
    status: StatusAgendamento = StatusAgendamento.CONCLUIDO,
) -> tuple[CriarAvaliacaoUseCase, InMemoryAvaliacaoRepository, Usuario]:
    avaliacao_repository = InMemoryAvaliacaoRepository()
    cliente = _usuario(1, PerfilAcesso.CLIENTE)
    return (
        CriarAvaliacaoUseCase(
            InMemoryAgendamentoRepository(_agendamento(status)),
            avaliacao_repository,
        ),
        avaliacao_repository,
        cliente,
    )


def test_cliente_avalia_o_proprio_atendimento_concluido() -> None:
    caso, repository, cliente = _caso()

    avaliacao = caso.execute(
        CriarAvaliacaoInput(10, 5, "  Atendimento excelente.  "),
        cliente,
    )

    assert avaliacao.id == 1
    assert avaliacao.cliente_id == cliente.id
    assert avaliacao.profissional_id == 2
    assert avaliacao.nota == 5
    assert avaliacao.comentario == "Atendimento excelente."
    assert repository.buscar_por_agendamento_id(10) == avaliacao


def test_rejeita_avaliacao_de_agendamento_nao_concluido() -> None:
    caso, _, cliente = _caso(StatusAgendamento.CONFIRMADO)

    with pytest.raises(AvaliacaoAgendamentoNaoConcluidoError):
        caso.execute(CriarAvaliacaoInput(10, 5), cliente)


def test_rejeita_avaliacao_de_outro_cliente_e_nota_invalida() -> None:
    caso, _, _ = _caso()

    with pytest.raises(AvaliacaoNaoPermitidaError):
        caso.execute(
            CriarAvaliacaoInput(10, 5),
            _usuario(99, PerfilAcesso.CLIENTE),
        )

    with pytest.raises(ValidationError):
        caso.execute(CriarAvaliacaoInput(10, 6), _usuario(1, PerfilAcesso.CLIENTE))


def test_rejeita_segunda_avaliacao_para_o_mesmo_agendamento() -> None:
    caso, _, cliente = _caso()
    caso.execute(CriarAvaliacaoInput(10, 4), cliente)

    with pytest.raises(AvaliacaoJaRegistradaError):
        caso.execute(CriarAvaliacaoInput(10, 5), cliente)


def test_endpoint_cria_avaliacao_e_valida_nota() -> None:
    caso, _, cliente = _caso()
    app.dependency_overrides[get_current_user] = lambda: cliente
    app.dependency_overrides[get_criar_avaliacao_use_case] = lambda: caso

    try:
        client = TestClient(app)
        response = client.post(
            "/agendamentos/10/avaliacao",
            json={"nota": 5, "comentario": "Muito bom"},
        )
        nota_invalida = client.post(
            "/agendamentos/10/avaliacao",
            json={"nota": 0},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    assert response.json()["agendamentoId"] == 10
    assert response.json()["clienteId"] == 1
    assert response.json()["profissionalId"] == 2
    assert response.json()["nota"] == 5
    assert nota_invalida.status_code == 422


def test_cliente_consulta_apenas_o_proprio_historico_de_avaliacoes() -> None:
    repository = InMemoryAvaliacaoRepository()
    cliente = _usuario(1, PerfilAcesso.CLIENTE)
    repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=10,
            cliente_id=1,
            profissional_id=2,
            nota=4,
            criada_em=datetime(2026, 11, 1, tzinfo=timezone.utc),
        )
    )
    repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=11,
            cliente_id=1,
            profissional_id=3,
            nota=5,
            criada_em=datetime(2026, 11, 2, tzinfo=timezone.utc),
        )
    )
    repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=12,
            cliente_id=99,
            profissional_id=2,
            nota=1,
            criada_em=datetime(2026, 11, 3, tzinfo=timezone.utc),
        )
    )

    avaliacoes = ListarAvaliacoesDoClienteUseCase(repository).execute(cliente)

    assert [avaliacao.agendamento_id for avaliacao in avaliacoes] == [11, 10]
    assert all(avaliacao.cliente_id == cliente.id for avaliacao in avaliacoes)


def test_endpoint_lista_historico_do_cliente_e_bloqueia_profissional() -> None:
    repository = InMemoryAvaliacaoRepository()
    repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=10,
            cliente_id=1,
            profissional_id=2,
            nota=5,
            comentario="Otimo atendimento",
        )
    )
    use_case = ListarAvaliacoesDoClienteUseCase(repository)
    client = TestClient(app)

    app.dependency_overrides[get_current_user] = lambda: _usuario(
        1,
        PerfilAcesso.CLIENTE,
    )
    app.dependency_overrides[get_listar_avaliacoes_do_cliente_use_case] = lambda: use_case
    try:
        response = client.get("/avaliacoes/minhas")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()[0]["agendamentoId"] == 10
    assert response.json()[0]["nota"] == 5

    app.dependency_overrides[get_current_user] = lambda: _usuario(
        2,
        PerfilAcesso.PROFISSIONAL,
    )
    app.dependency_overrides[get_listar_avaliacoes_do_cliente_use_case] = lambda: use_case
    try:
        sem_permissao = client.get("/avaliacoes/minhas")
    finally:
        app.dependency_overrides.clear()

    assert sem_permissao.status_code == 403


def _profissional(profissional_id: int = 2) -> Profissional:
    return Profissional(
        id=profissional_id,
        nome="Profissional Teste",
        email=f"profissional{profissional_id}@example.com",
        telefone="86999999998",
        senha_hash="hash",
        perfil=PerfilAcesso.PROFISSIONAL,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def test_calcula_media_e_quantidade_de_avaliacoes_do_profissional() -> None:
    avaliacao_repository = InMemoryAvaliacaoRepository()
    profissional_repository = InMemoryProfissionalRepository()
    profissional_repository.profissionais.append(_profissional())
    profissional_repository.profissionais.append(_profissional(3))
    avaliacao_repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=20,
            cliente_id=1,
            profissional_id=2,
            nota=4,
        )
    )
    avaliacao_repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=21,
            cliente_id=3,
            profissional_id=2,
            nota=5,
        )
    )
    avaliacao_repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=22,
            cliente_id=4,
            profissional_id=99,
            nota=1,
        )
    )
    use_case = ConsultarMediaAvaliacoesProfissionalUseCase(
        profissional_repository,
        avaliacao_repository,
    )

    media = use_case.execute(2)

    assert media.profissional_id == 2
    assert media.media_nota == 4.5
    assert media.total_avaliacoes == 2

    sem_avaliacoes = use_case.execute(3)
    assert sem_avaliacoes.media_nota is None
    assert sem_avaliacoes.total_avaliacoes == 0

    with pytest.raises(ProfissionalNaoEncontradoError):
        use_case.execute(999)


def test_endpoint_consulta_media_de_avaliacoes_do_profissional() -> None:
    avaliacao_repository = InMemoryAvaliacaoRepository()
    profissional_repository = InMemoryProfissionalRepository()
    profissional_repository.profissionais.append(_profissional())
    avaliacao_repository.criar(
        Avaliacao(
            id=None,
            agendamento_id=20,
            cliente_id=1,
            profissional_id=2,
            nota=3,
        )
    )
    use_case = ConsultarMediaAvaliacoesProfissionalUseCase(
        profissional_repository,
        avaliacao_repository,
    )
    app.dependency_overrides[
        get_consultar_media_avaliacoes_profissional_use_case
    ] = lambda: use_case

    try:
        response = TestClient(app).get("/profissionais/2/avaliacoes/media")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "profissionalId": 2,
        "mediaNota": 3.0,
        "totalAvaliacoes": 1,
    }
