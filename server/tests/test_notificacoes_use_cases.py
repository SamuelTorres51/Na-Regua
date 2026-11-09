from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import pytest

from application.common.exceptions import (
    NotificacaoNaoEncontradaError,
    NotificacaoNaoPermitidaError,
)
from application.use_cases.agendamentos.cancelar_agendamento import (
    CancelarAgendamentoInput,
    CancelarAgendamentoUseCase,
)
from application.use_cases.agendamentos.criar_agendamento import (
    CriarAgendamentoInput,
    CriarAgendamentoUseCase,
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
from domain.entities.agendamento import Agendamento
from domain.entities.cancelamento import Cancelamento
from domain.entities.notificacao import Notificacao
from domain.entities.servico import Servico
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.enums.tipo_notificacao import TipoNotificacao
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.cancelamento_repository import CancelamentoRepository
from domain.repositories.notificacao_repository import NotificacaoRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.servico_repository import ServicoRepository
from domain.repositories.usuario_repository import UsuarioRepository

FORTALEZA_TZ = ZoneInfo("America/Fortaleza")


class InMemoryNotificacaoRepository(NotificacaoRepository):
    def __init__(self) -> None:
        self.notificacoes: list[Notificacao] = []
        self._next_id = 1

    def criar(self, notificacao: Notificacao) -> Notificacao:
        nova = Notificacao(
            id=self._next_id,
            usuario_id=notificacao.usuario_id,
            agendamento_id=notificacao.agendamento_id,
            tipo=notificacao.tipo,
            mensagem=notificacao.mensagem,
            enviada_em=notificacao.enviada_em,
            lida=notificacao.lida,
        )
        self._next_id += 1
        self.notificacoes.append(nova)
        return nova

    def buscar_por_id(self, notificacao_id: int) -> Notificacao | None:
        for n in self.notificacoes:
            if n.id == notificacao_id:
                return n
        return None

    def listar_por_usuario(
        self,
        usuario_id: int,
        apenas_nao_lidas: bool = False,
    ) -> list[Notificacao]:
        resultado = [n for n in self.notificacoes if n.usuario_id == usuario_id]
        if apenas_nao_lidas:
            resultado = [n for n in resultado if not n.lida]
        return sorted(resultado, key=lambda n: n.enviada_em, reverse=True)

    def marcar_como_lida(self, notificacao_id: int) -> Notificacao | None:
        for n in self.notificacoes:
            if n.id == notificacao_id:
                n.lida = True
                return n
        return None

    def marcar_todas_como_lidas(self, usuario_id: int) -> int:
        count = 0
        for n in self.notificacoes:
            if n.usuario_id == usuario_id and not n.lida:
                n.lida = True
                count += 1
        return count

    def contar_nao_lidas(self, usuario_id: int) -> int:
        return sum(
            1 for n in self.notificacoes if n.usuario_id == usuario_id and not n.lida
        )

    def existe_notificacao_agendamento(
        self,
        agendamento_id: int,
        tipo: TipoNotificacao,
    ) -> bool:
        return any(
            n.agendamento_id == agendamento_id and n.tipo == tipo
            for n in self.notificacoes
        )


class FakeAgendamentoRepository(AgendamentoRepository):
    def __init__(self) -> None:
        self.agendamentos: list[Agendamento] = []
        self._next_id = 1

    def criar(self, agendamento: Agendamento) -> Agendamento:
        novo = Agendamento(
            id=self._next_id,
            cliente_id=agendamento.cliente_id,
            profissional_id=agendamento.profissional_id,
            servico_id=agendamento.servico_id,
            inicio=agendamento.inicio,
            duracao_minutos=agendamento.duracao_minutos,
            status=agendamento.status,
            criado_em=agendamento.criado_em,
        )
        self._next_id += 1
        self.agendamentos.append(novo)
        return novo

    def buscar_por_id(self, agendamento_id: int) -> Agendamento | None:
        for a in self.agendamentos:
            if a.id == agendamento_id:
                return a
        return None

    def atualizar_status(
        self,
        agendamento_id: int,
        status: StatusAgendamento,
    ) -> Agendamento | None:
        for a in self.agendamentos:
            if a.id == agendamento_id:
                a.status = status
                return a
        return None

    def listar(
        self,
        *,
        inicio: datetime | None = None,
        fim: datetime | None = None,
        profissional_id: int | None = None,
        cliente_id: int | None = None,
        status: StatusAgendamento | None = None,
    ) -> list[Agendamento]:
        res = list(self.agendamentos)
        if inicio is not None:
            res = [a for a in res if a.inicio >= inicio]
        if fim is not None:
            res = [a for a in res if a.inicio <= fim]
        if profissional_id is not None:
            res = [a for a in res if a.profissional_id == profissional_id]
        if cliente_id is not None:
            res = [a for a in res if a.cliente_id == cliente_id]
        if status is not None:
            res = [a for a in res if a.status == status]
        return res

    def existe_conflito_profissional(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return False

    def existe_conflito_cliente(
        self,
        cliente_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return False


class FakeUsuarioRepository(UsuarioRepository):
    def __init__(self, usuarios: list[Usuario]) -> None:
        self.usuarios = usuarios

    def buscar_por_id(self, usuario_id: int) -> Usuario | None:
        for u in self.usuarios:
            if u.id == usuario_id:
                return u
        return None

    def buscar_por_email(self, email: str) -> Usuario | None:
        for u in self.usuarios:
            if u.email == email:
                return u
        return None

    def criar(self, usuario: Usuario) -> Usuario:
        return usuario

    def atualizar(self, usuario: Usuario) -> Usuario:
        return usuario


class FakeServicoRepository(ServicoRepository):
    def __init__(self, servicos: list[Servico]) -> None:
        self.servicos = servicos

    def buscar_por_id(self, servico_id: int) -> Servico | None:
        for s in self.servicos:
            if s.id == servico_id:
                return s
        return None

    def buscar_por_nome(self, nome: str) -> Servico | None:
        return None

    def listar(self, apenas_ativos: bool = False) -> list[Servico]:
        return self.servicos

    def criar(self, servico: Servico) -> Servico:
        return servico

    def atualizar(self, servico: Servico) -> Servico:
        return servico

    def deletar(self, servico_id: int) -> bool:
        return True


class FakeCancelamentoRepository(CancelamentoRepository):
    def __init__(self) -> None:
        self.cancelamentos: list[Cancelamento] = []

    def criar(self, cancelamento: Cancelamento) -> Cancelamento:
        self.cancelamentos.append(cancelamento)
        return cancelamento

    def buscar_por_agendamento_id(self, agendamento_id: int) -> Cancelamento | None:
        for c in self.cancelamentos:
            if c.agendamento_id == agendamento_id:
                return c
        return None


class FakeProfissionalServicoRepository(ProfissionalServicoRepository):
    def existe(self, profissional_id: int, servico_id: int) -> bool:
        return True

    def associar(self, profissional_servico):
        return profissional_servico

    def remover(self, profissional_id: int, servico_id: int) -> bool:
        return True

    def listar_servicos_por_profissional(self, profissional_id: int) -> list[int]:
        return []

    def listar_profissionais_por_servico(self, servico_id: int) -> list[int]:
        return []


def test_listar_notificacoes_e_filtro():
    repo = InMemoryNotificacaoRepository()
    use_case = ListarNotificacoesUseCase(repo)

    n1 = repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Confirmado 1",
            enviada_em=datetime.now(timezone.utc),
            lida=False,
        )
    )
    n2 = repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.NOVO_AGENDAMENTO,
            mensagem="Lida 2",
            enviada_em=datetime.now(timezone.utc),
            lida=True,
        )
    )
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=2,
            tipo=TipoNotificacao.LEMBRETE_AGENDAMENTO,
            mensagem="Outro usuario",
            enviada_em=datetime.now(timezone.utc),
            lida=False,
        )
    )

    todas = use_case.execute(usuario_id=1, apenas_nao_lidas=False)
    assert len(todas) == 2

    nao_lidas = use_case.execute(usuario_id=1, apenas_nao_lidas=True)
    assert len(nao_lidas) == 1
    assert nao_lidas[0].id == n1.id


def test_marcar_notificacao_lida_sucesso():
    repo = InMemoryNotificacaoRepository()
    use_case = MarcarNotificacaoLidaUseCase(repo)

    notif = repo.criar(
        Notificacao(
            id=None,
            usuario_id=10,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Teste",
            enviada_em=datetime.now(timezone.utc),
            lida=False,
        )
    )
    atualizada = use_case.execute(notificacao_id=notif.id, usuario_id=10)
    assert atualizada.lida is True


def test_marcar_notificacao_lida_outro_usuario_negado():
    repo = InMemoryNotificacaoRepository()
    use_case = MarcarNotificacaoLidaUseCase(repo)

    notif = repo.criar(
        Notificacao(
            id=None,
            usuario_id=10,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Teste",
            enviada_em=datetime.now(timezone.utc),
            lida=False,
        )
    )
    with pytest.raises(NotificacaoNaoPermitidaError):
        use_case.execute(notificacao_id=notif.id, usuario_id=99)


def test_marcar_notificacao_lida_nao_encontrada():
    repo = InMemoryNotificacaoRepository()
    use_case = MarcarNotificacaoLidaUseCase(repo)

    with pytest.raises(NotificacaoNaoEncontradaError):
        use_case.execute(notificacao_id=999, usuario_id=1)


def test_contar_notificacoes_nao_lidas():
    repo = InMemoryNotificacaoRepository()
    use_case = ContarNotificacoesNaoLidasUseCase(repo)

    repo.criar(
        Notificacao(
            id=None,
            usuario_id=5,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="msg 1",
            enviada_em=datetime.now(timezone.utc),
            lida=False,
        )
    )
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=5,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="msg 2",
            enviada_em=datetime.now(timezone.utc),
            lida=False,
        )
    )
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=5,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="msg 3",
            enviada_em=datetime.now(timezone.utc),
            lida=True,
        )
    )

    assert use_case.execute(usuario_id=5) == 2


def test_criar_agendamento_dispara_rf62_e_rf63():
    notif_repo = InMemoryNotificacaoRepository()
    agendamento_repo = FakeAgendamentoRepository()
    cliente = Usuario(
        id=1,
        nome="Cliente Joao",
        email="joao@teste.com",
        telefone="86999990001",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )
    profissional = Usuario(
        id=2,
        nome="Barbeiro Carlos",
        email="carlos@teste.com",
        telefone="86999990002",
        senha_hash="hash",
        perfil=PerfilAcesso.PROFISSIONAL,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )
    usuario_repo = FakeUsuarioRepository([cliente, profissional])
    servico = Servico(
        id=10,
        nome="Corte Degradê",
        descricao="Corte com navalha",
        duracao_minutos=30,
        preco=35.0,
        ativo=True,
    )
    servico_repo = FakeServicoRepository([servico])
    ps_repo = FakeProfissionalServicoRepository()

    use_case = CriarAgendamentoUseCase(
        agendamento_repository=agendamento_repo,
        usuario_repository=usuario_repo,
        servico_repository=servico_repo,
        profissional_servico_repository=ps_repo,
        notificacao_repository=notif_repo,
    )

    inicio = datetime.now(FORTALEZA_TZ) + timedelta(hours=2)
    dados = CriarAgendamentoInput(
        cliente_id=1,
        profissional_id=2,
        servico_id=10,
        inicio=inicio,
    )

    criado = use_case.execute(dados, usuario_atual=cliente)
    assert criado.id is not None

    # Verifica RF62: notificação para o cliente
    notifs_cliente = notif_repo.listar_por_usuario(usuario_id=1)
    assert len(notifs_cliente) == 1
    assert notifs_cliente[0].tipo == TipoNotificacao.CONFIRMACAO_AGENDAMENTO
    assert "Corte Degradê" in notifs_cliente[0].mensagem
    assert "realizado com sucesso" in notifs_cliente[0].mensagem

    # Verifica RF63: notificação para o profissional
    notifs_prof = notif_repo.listar_por_usuario(usuario_id=2)
    assert len(notifs_prof) == 1
    assert notifs_prof[0].tipo == TipoNotificacao.NOVO_AGENDAMENTO
    assert "Cliente Joao" in notifs_prof[0].mensagem
    assert "Corte Degradê" in notifs_prof[0].mensagem


def test_cancelar_agendamento_pela_barbearia_dispara_rf64():
    notif_repo = InMemoryNotificacaoRepository()
    agendamento_repo = FakeAgendamentoRepository()
    cancelamento_repo = FakeCancelamentoRepository()
    servico = Servico(
        id=10,
        nome="Barba Terapia",
        descricao="",
        duracao_minutos=30,
        preco=30.0,
    )
    servico_repo = FakeServicoRepository([servico])

    inicio = datetime.now(FORTALEZA_TZ) + timedelta(hours=5)
    agendamento = agendamento_repo.criar(
        Agendamento(
            id=None,
            cliente_id=1,
            profissional_id=2,
            servico_id=10,
            inicio=inicio,
            duracao_minutos=30,
            status=StatusAgendamento.AGENDADO,
        )
    )

    admin = Usuario(
        id=99,
        nome="Admin Barbearia",
        email="admin@barbearia.com",
        telefone="86999990099",
        senha_hash="hash",
        perfil=PerfilAcesso.ADMINISTRADOR,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )

    use_case = CancelarAgendamentoUseCase(
        agendamento_repository=agendamento_repo,
        cancelamento_repository=cancelamento_repo,
        notificacao_repository=notif_repo,
        servico_repository=servico_repo,
    )

    use_case.execute(
        CancelarAgendamentoInput(
            agendamento_id=agendamento.id,
            motivo="Barbearia em reforma emergencial",
        ),
        usuario_atual=admin,
    )

    # Verifica RF64: notificação enviada ao cliente
    notifs_cliente = notif_repo.listar_por_usuario(usuario_id=1)
    assert len(notifs_cliente) == 1
    assert notifs_cliente[0].tipo == TipoNotificacao.CANCELAMENTO_AGENDAMENTO
    assert "cancelado pela barbearia" in notifs_cliente[0].mensagem
    assert "reforma emergencial" in notifs_cliente[0].mensagem


def test_cancelar_agendamento_pelo_cliente_nao_dispara_rf64():
    notif_repo = InMemoryNotificacaoRepository()
    agendamento_repo = FakeAgendamentoRepository()
    cancelamento_repo = FakeCancelamentoRepository()
    servico_repo = FakeServicoRepository([])

    inicio = datetime.now(FORTALEZA_TZ) + timedelta(hours=5)
    agendamento = agendamento_repo.criar(
        Agendamento(
            id=None,
            cliente_id=1,
            profissional_id=2,
            servico_id=10,
            inicio=inicio,
            duracao_minutos=30,
            status=StatusAgendamento.AGENDADO,
        )
    )

    cliente = Usuario(
        id=1,
        nome="Cliente Joao",
        email="joao@teste.com",
        telefone="86999990001",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )

    use_case = CancelarAgendamentoUseCase(
        agendamento_repository=agendamento_repo,
        cancelamento_repository=cancelamento_repo,
        notificacao_repository=notif_repo,
        servico_repository=servico_repo,
    )

    use_case.execute(
        CancelarAgendamentoInput(
            agendamento_id=agendamento.id,
            motivo="Imprevisto pessoal",
        ),
        usuario_atual=cliente,
    )

    # Cliente cancelou por si mesmo -> não deve gerar notificação de cancelamento pela barbearia
    notifs_cliente = notif_repo.listar_por_usuario(usuario_id=1)
    assert len(notifs_cliente) == 0


def test_processar_lembretes_rf65():
    notif_repo = InMemoryNotificacaoRepository()
    agendamento_repo = FakeAgendamentoRepository()
    servico = Servico(
        id=5,
        nome="Corte e Barba",
        descricao="",
        duracao_minutos=45,
        preco=60.0,
    )
    servico_repo = FakeServicoRepository([servico])

    agora = datetime.now(FORTALEZA_TZ)
    # Agendamento dentro da janela de 2 horas (em 1 hora e meia)
    a1 = agendamento_repo.criar(
        Agendamento(
            id=None,
            cliente_id=10,
            profissional_id=2,
            servico_id=5,
            inicio=agora + timedelta(minutes=90),
            duracao_minutos=45,
            status=StatusAgendamento.AGENDADO,
        )
    )
    # Agendamento fora da janela (em 5 horas)
    agendamento_repo.criar(
        Agendamento(
            id=None,
            cliente_id=11,
            profissional_id=2,
            servico_id=5,
            inicio=agora + timedelta(hours=5),
            duracao_minutos=45,
            status=StatusAgendamento.AGENDADO,
        )
    )

    use_case = ProcessarLembretesUseCase(
        agendamento_repository=agendamento_repo,
        servico_repository=servico_repo,
        notificacao_repository=notif_repo,
    )

    geradas = use_case.execute(janela_horas=2)
    assert len(geradas) == 1
    assert geradas[0].usuario_id == 10
    assert geradas[0].tipo == TipoNotificacao.LEMBRETE_AGENDAMENTO
    assert "Lembrete: você possui um agendamento para Corte e Barba" in geradas[0].mensagem

    # Execução repetida não deve duplicar o lembrete
    geradas_segunda_vez = use_case.execute(janela_horas=2)
    assert len(geradas_segunda_vez) == 0
