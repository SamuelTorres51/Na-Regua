from datetime import datetime, timezone
import pytest

from application.common.exceptions import (
    EmailJaCadastradoError,
    ProfissionalNaoEncontradoError,
    ValidationError,
)
from application.use_cases.profissionais.atualizar_profissional import (
    AtualizarProfissionalInput,
    AtualizarProfissionalUseCase,
)
from application.use_cases.profissionais.buscar_profissional_por_id import (
    BuscarProfissionalPorIdUseCase,
)
from application.use_cases.profissionais.cadastrar_profissional import (
    CadastrarProfissionalInput,
    CadastrarProfissionalUseCase,
)
from application.use_cases.profissionais.inativar_profissional import (
    InativarProfissionalUseCase,
)
from application.use_cases.profissionais.listar_profissionais import (
    ListarProfissionaisUseCase,
)
from application.use_cases.profissionais.reativar_profissional import (
    ReativarProfissionalUseCase,
)
from domain.entities.profissional import Profissional
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.profissional_repository import ProfissionalRepository


class InMemoryProfissionalRepository(ProfissionalRepository):
    def __init__(self) -> None:
        self.profissionais: list[Profissional] = []
        self._next_id = 1

    def buscar_por_id(self, profissional_id: int) -> Profissional | None:
        for p in self.profissionais:
            if p.id == profissional_id:
                return p
        return None

    def buscar_por_email(self, email: str) -> Profissional | None:
        for p in self.profissionais:
            if p.email.lower() == email.lower():
                return p
        return None

    def listar(self, apenas_ativos: bool = False) -> list[Profissional]:
        if apenas_ativos:
            return [p for p in self.profissionais if p.ativo]
        return list(self.profissionais)

    def criar(self, profissional: Profissional) -> Profissional:
        novo = Profissional(
            id=self._next_id,
            nome=profissional.nome,
            email=profissional.email,
            telefone=profissional.telefone,
            senha_hash=profissional.senha_hash,
            perfil=PerfilAcesso.PROFISSIONAL,
            ativo=profissional.ativo,
            criado_em=datetime.now(timezone.utc),
        )
        self._next_id += 1
        self.profissionais.append(novo)
        return novo

    def atualizar(self, profissional: Profissional) -> Profissional:
        for idx, p in enumerate(self.profissionais):
            if p.id == profissional.id:
                self.profissionais[idx] = profissional
                return profissional
        raise ValueError("Profissional não encontrado")


def test_cadastrar_profissional_com_sucesso():
    repo = InMemoryProfissionalRepository()
    use_case = CadastrarProfissionalUseCase(repo)

    profissional = use_case.execute(
        CadastrarProfissionalInput(
            nome="Carlos Barbeiro",
            email="carlos@naregua.com",
            telefone="86999992222",
            senha="senhaSegura123",
        )
    )

    assert profissional.id == 1
    assert profissional.nome == "Carlos Barbeiro"
    assert profissional.email == "carlos@naregua.com"
    assert profissional.perfil == PerfilAcesso.PROFISSIONAL
    assert profissional.ativo is True


def test_cadastrar_profissional_validacoes():
    repo = InMemoryProfissionalRepository()
    use_case = CadastrarProfissionalUseCase(repo)

    # Nome vazio
    with pytest.raises(ValidationError, match="O nome não pode estar vazio"):
        use_case.execute(
            CadastrarProfissionalInput(
                nome="  ",
                email="carlos@naregua.com",
                telefone="86999992222",
                senha="senhaSegura123",
            )
        )

    # Email inválido
    with pytest.raises(ValidationError, match="Formato de e-mail inválido"):
        use_case.execute(
            CadastrarProfissionalInput(
                nome="Carlos",
                email="carlos-sem-arroba",
                telefone="86999992222",
                senha="senhaSegura123",
            )
        )

    # Telefone curto
    with pytest.raises(ValidationError, match="entre 10 e 20 caracteres"):
        use_case.execute(
            CadastrarProfissionalInput(
                nome="Carlos",
                email="carlos@naregua.com",
                telefone="123",
                senha="senhaSegura123",
            )
        )

    # Senha curta
    with pytest.raises(ValidationError, match="mínimo 8 caracteres"):
        use_case.execute(
            CadastrarProfissionalInput(
                nome="Carlos",
                email="carlos@naregua.com",
                telefone="86999992222",
                senha="curta",
            )
        )


def test_cadastrar_profissional_email_duplicado():
    repo = InMemoryProfissionalRepository()
    use_case = CadastrarProfissionalUseCase(repo)

    dados = CadastrarProfissionalInput(
        nome="Carlos",
        email="carlos@naregua.com",
        telefone="86999992222",
        senha="senhaSegura123",
    )
    use_case.execute(dados)

    with pytest.raises(EmailJaCadastradoError):
        use_case.execute(dados)


def test_listar_profissionais_e_filtro_ativos():
    repo = InMemoryProfissionalRepository()
    use_case_cadastrar = CadastrarProfissionalUseCase(repo)
    use_case_listar = ListarProfissionaisUseCase(repo)

    p1 = use_case_cadastrar.execute(
        CadastrarProfissionalInput(
            nome="Carlos 1",
            email="c1@naregua.com",
            telefone="86999991111",
            senha="senhaSegura123",
        )
    )
    p2 = use_case_cadastrar.execute(
        CadastrarProfissionalInput(
            nome="Carlos 2",
            email="c2@naregua.com",
            telefone="86999992222",
            senha="senhaSegura123",
        )
    )

    # Inativa p2
    InativarProfissionalUseCase(repo).execute(p2.id)

    todos = use_case_listar.execute(apenas_ativos=False)
    assert len(todos) == 2

    ativos = use_case_listar.execute(apenas_ativos=True)
    assert len(ativos) == 1
    assert ativos[0].id == p1.id


def test_buscar_profissional_por_id():
    repo = InMemoryProfissionalRepository()
    criado = CadastrarProfissionalUseCase(repo).execute(
        CadastrarProfissionalInput(
            nome="Marcos",
            email="marcos@naregua.com",
            telefone="86999993333",
            senha="senhaSegura123",
        )
    )

    encontrado = BuscarProfissionalPorIdUseCase(repo).execute(criado.id)
    assert encontrado.nome == "Marcos"

    with pytest.raises(ProfissionalNaoEncontradoError):
        BuscarProfissionalPorIdUseCase(repo).execute(999)


def test_atualizar_profissional():
    repo = InMemoryProfissionalRepository()
    criado = CadastrarProfissionalUseCase(repo).execute(
        CadastrarProfissionalInput(
            nome="Marcos",
            email="marcos@naregua.com",
            telefone="86999993333",
            senha="senhaSegura123",
        )
    )

    atualizado = AtualizarProfissionalUseCase(repo).execute(
        AtualizarProfissionalInput(
            id=criado.id,
            nome="Marcos Vinicius",
            telefone="86988884444",
        )
    )

    assert atualizado.nome == "Marcos Vinicius"
    assert atualizado.telefone == "86988884444"


def test_inativar_e_reativar_profissional():
    repo = InMemoryProfissionalRepository()
    criado = CadastrarProfissionalUseCase(repo).execute(
        CadastrarProfissionalInput(
            nome="Joao",
            email="joao@naregua.com",
            telefone="86999995555",
            senha="senhaSegura123",
        )
    )
    assert criado.ativo is True

    # Inativar
    inativado = InativarProfissionalUseCase(repo).execute(criado.id)
    assert inativado.ativo is False

    # Reativar
    reativado = ReativarProfissionalUseCase(repo).execute(criado.id)
    assert reativado.ativo is True
