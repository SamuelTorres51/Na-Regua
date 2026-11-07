from datetime import datetime, timedelta, timezone

import pytest

from application.common.exceptions import (
    AgendamentoConflitanteError,
    AgendamentoNaoPermitidoError,
    ClienteNaoEncontradoError,
    ProfissionalServicoNaoEncontradoError,
    ValidationError,
)
from application.use_cases.agendamentos.criar_agendamento import (
    CriarAgendamentoInput,
    CriarAgendamentoUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.entities.servico import Servico
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.servico_repository import ServicoRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.usuario_repository import UsuarioRepository


class InMemoryAgendamentoRepository(AgendamentoRepository):
    def __init__(self) -> None:
        self.agendamentos: list[Agendamento] = []

    def criar(self, agendamento: Agendamento) -> Agendamento:
        criado = Agendamento(
            id=len(self.agendamentos) + 1,
            cliente_id=agendamento.cliente_id,
            profissional_id=agendamento.profissional_id,
            servico_id=agendamento.servico_id,
            inicio=agendamento.inicio,
            duracao_minutos=agendamento.duracao_minutos,
            status=agendamento.status,
            criado_em=agendamento.criado_em,
        )
        self.agendamentos.append(criado)
        return criado

    def listar(
        self,
        *,
        inicio: datetime | None = None,
        fim: datetime | None = None,
        profissional_id: int | None = None,
        cliente_id: int | None = None,
        status: StatusAgendamento | None = None,
    ) -> list[Agendamento]:
        return [
            agendamento
            for agendamento in self.agendamentos
            if (
                inicio is None
                or agendamento.inicio >= inicio
            )
            and (fim is None or agendamento.inicio <= fim)
            and (
                profissional_id is None
                or agendamento.profissional_id == profissional_id
            )
            and (cliente_id is None or agendamento.cliente_id == cliente_id)
            and (status is None or agendamento.status == status)
        ]

    def existe_conflito_profissional(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return self._existe_conflito("profissional_id", profissional_id, inicio, fim)

    def existe_conflito_cliente(
        self,
        cliente_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return self._existe_conflito("cliente_id", cliente_id, inicio, fim)

    def _existe_conflito(
        self,
        campo: str,
        valor: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        for agendamento in self.agendamentos:
            if getattr(agendamento, campo) != valor:
                continue
            if agendamento.status not in (
                StatusAgendamento.AGENDADO,
                StatusAgendamento.CONFIRMADO,
                StatusAgendamento.EM_ATENDIMENTO,
            ):
                continue
            agendamento_fim = agendamento.inicio + timedelta(
                minutes=agendamento.duracao_minutos
            )
            if agendamento.inicio < fim and agendamento_fim > inicio:
                return True
        return False


class InMemoryUsuarioRepository(UsuarioRepository):
    def __init__(self, usuarios: list[Usuario]) -> None:
        self.usuarios = usuarios

    def buscar_por_id(self, usuario_id: int) -> Usuario | None:
        return next((u for u in self.usuarios if u.id == usuario_id), None)

    def buscar_por_email(self, email: str) -> Usuario | None:
        return next((u for u in self.usuarios if u.email == email), None)

    def criar(self, usuario: Usuario) -> Usuario:
        self.usuarios.append(usuario)
        return usuario

    def atualizar(self, usuario: Usuario) -> Usuario:
        return usuario


class InMemoryServicoRepository(ServicoRepository):
    def __init__(self, servico: Servico) -> None:
        self.servico = servico

    def buscar_por_id(self, servico_id: int) -> Servico | None:
        return self.servico if self.servico.id == servico_id else None

    def buscar_por_nome(self, nome: str) -> Servico | None:
        return self.servico if self.servico.nome == nome else None

    def listar(self, apenas_ativos: bool = False) -> list[Servico]:
        if apenas_ativos and not self.servico.ativo:
            return []
        return [self.servico]

    def criar(self, servico: Servico) -> Servico:
        self.servico = servico
        return servico

    def atualizar(self, servico: Servico) -> Servico:
        self.servico = servico
        return servico

    def deletar(self, servico_id: int) -> bool:
        return self.servico.id == servico_id


class InMemoryProfissionalServicoRepository(ProfissionalServicoRepository):
    def __init__(self, associacoes: set[tuple[int, int]]) -> None:
        self.associacoes = associacoes

    def associar(self, profissional_servico):
        self.associacoes.add(
            (profissional_servico.profissional_id, profissional_servico.servico_id)
        )
        return profissional_servico

    def remover(self, profissional_id: int, servico_id: int) -> bool:
        associacao = (profissional_id, servico_id)
        if associacao not in self.associacoes:
            return False
        self.associacoes.remove(associacao)
        return True

    def existe(self, profissional_id: int, servico_id: int) -> bool:
        return (profissional_id, servico_id) in self.associacoes

    def listar_servicos_por_profissional(self, profissional_id: int) -> list[int]:
        return [
            servico_id
            for profissional, servico_id in self.associacoes
            if profissional == profissional_id
        ]

    def listar_profissionais_por_servico(self, servico_id: int) -> list[int]:
        return [
            profissional_id
            for profissional_id, servico in self.associacoes
            if servico == servico_id
        ]


def _usuario(
    id: int,
    perfil: PerfilAcesso,
    ativo: bool = True,
) -> Usuario:
    return Usuario(
        id=id,
        nome=f"Usuário {id}",
        email=f"usuario{id}@example.com",
        telefone="86999999999",
        senha_hash="hash",
        perfil=perfil,
        ativo=ativo,
        criado_em=datetime.now(timezone.utc),
    )


def _criar_caso(
    *,
    cliente_ativo: bool = True,
    profissional_ativo: bool = True,
    servico_ativo: bool = True,
) -> tuple[CriarAgendamentoUseCase, Usuario, Usuario, Usuario]:
    cliente = _usuario(1, PerfilAcesso.CLIENTE, cliente_ativo)
    outro_cliente = _usuario(4, PerfilAcesso.CLIENTE)
    profissional = _usuario(2, PerfilAcesso.PROFISSIONAL, profissional_ativo)
    admin = _usuario(3, PerfilAcesso.ADMINISTRADOR)
    repositorio_usuarios = InMemoryUsuarioRepository(
        [cliente, outro_cliente, profissional, admin]
    )
    repositorio_servicos = InMemoryServicoRepository(
        Servico(
            id=10,
            nome="Corte",
            descricao="",
            duracao_minutos=30,
            preco=30,
            ativo=servico_ativo,
        )
    )
    caso = CriarAgendamentoUseCase(
        InMemoryAgendamentoRepository(),
        repositorio_usuarios,
        repositorio_servicos,
        InMemoryProfissionalServicoRepository({(profissional.id, 10)}),
    )
    return caso, cliente, profissional, admin


def test_cria_agendamento_com_duracao_e_status_do_servico() -> None:
    caso, cliente, profissional, _ = _criar_caso()
    inicio = datetime.now(timezone.utc) + timedelta(hours=1)

    agendamento = caso.execute(
        CriarAgendamentoInput(
            cliente_id=cliente.id,
            profissional_id=profissional.id,
            servico_id=10,
            inicio=inicio,
        ),
        cliente,
    )

    assert agendamento.id == 1
    assert agendamento.duracao_minutos == 30
    assert agendamento.status == StatusAgendamento.AGENDADO


def test_cliente_nao_pode_criar_para_outro_cliente() -> None:
    caso, cliente, profissional, _ = _criar_caso()

    with pytest.raises(AgendamentoNaoPermitidoError):
        caso.execute(
            CriarAgendamentoInput(
                cliente_id=4,
                profissional_id=profissional.id,
                servico_id=10,
                inicio=datetime.now(timezone.utc) + timedelta(hours=1),
            ),
            cliente,
        )


def test_rejeita_profissional_sem_associacao_com_servico() -> None:
    caso, cliente, profissional, _ = _criar_caso()
    caso.profissional_servico_repository = InMemoryProfissionalServicoRepository(
        set()
    )

    with pytest.raises(ProfissionalServicoNaoEncontradoError):
        caso.execute(
            CriarAgendamentoInput(
                cliente_id=cliente.id,
                profissional_id=profissional.id,
                servico_id=10,
                inicio=datetime.now(timezone.utc) + timedelta(hours=1),
            ),
            cliente,
        )


def test_rejeita_cliente_inativo() -> None:
    caso, cliente, profissional, admin = _criar_caso(cliente_ativo=False)

    with pytest.raises(ClienteNaoEncontradoError):
        caso.execute(
            CriarAgendamentoInput(
                cliente_id=cliente.id,
                profissional_id=profissional.id,
                servico_id=10,
                inicio=datetime.now(timezone.utc) + timedelta(hours=1),
            ),
            admin,
        )


def test_rejeita_antecedencia_e_janela_maxima() -> None:
    caso, cliente, profissional, _ = _criar_caso()

    for inicio in (
        datetime.now(timezone.utc) + timedelta(minutes=29),
        datetime.now(timezone.utc) + timedelta(days=15, minutes=1),
    ):
        with pytest.raises(ValidationError):
            caso.execute(
                CriarAgendamentoInput(
                    cliente_id=cliente.id,
                    profissional_id=profissional.id,
                    servico_id=10,
                    inicio=inicio,
                ),
                cliente,
            )


def test_rejeita_conflito_de_horario() -> None:
    caso, cliente, profissional, _ = _criar_caso()
    inicio = datetime.now(timezone.utc) + timedelta(hours=1)
    dados = CriarAgendamentoInput(
        cliente_id=cliente.id,
        profissional_id=profissional.id,
        servico_id=10,
        inicio=inicio,
    )

    caso.execute(dados, cliente)

    with pytest.raises(AgendamentoConflitanteError):
        caso.execute(
            CriarAgendamentoInput(
                cliente_id=cliente.id,
                profissional_id=profissional.id,
                servico_id=10,
                inicio=inicio + timedelta(minutes=15),
            ),
            cliente,
        )
