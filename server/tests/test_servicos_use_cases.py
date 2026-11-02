import pytest

from application.common.exceptions import (
    ServicoNaoEncontradoError,
    ServicoNomeDuplicadoError,
    ValidationError,
)
from application.use_cases.servicos.atualizar_servico import (
    AtualizarServicoInput,
    AtualizarServicoUseCase,
)
from application.use_cases.servicos.buscar_servico_por_id import (
    BuscarServicoPorIdUseCase,
)
from application.use_cases.servicos.criar_servico import (
    CriarServicoInput,
    CriarServicoUseCase,
)
from application.use_cases.servicos.deletar_servico import (
    DeletarServicoUseCase,
)
from application.use_cases.servicos.listar_servicos import (
    ListarServicosUseCase,
)
from domain.entities.servico import Servico
from domain.repositories.servico_repository import ServicoRepository


class InMemoryServicoRepository(ServicoRepository):
    def __init__(self) -> None:
        self.servicos: list[Servico] = []
        self._next_id = 1

    def buscar_por_id(self, servico_id: int) -> Servico | None:
        for s in self.servicos:
            if s.id == servico_id:
                return s
        return None

    def buscar_por_nome(self, nome: str) -> Servico | None:
        for s in self.servicos:
            if s.nome.lower() == nome.lower():
                return s
        return None

    def listar(self, apenas_ativos: bool = False) -> list[Servico]:
        if apenas_ativos:
            return [s for s in self.servicos if s.ativo]
        return list(self.servicos)

    def criar(self, servico: Servico) -> Servico:
        novo = Servico(
            id=self._next_id,
            nome=servico.nome,
            descricao=servico.descricao,
            duracao_minutos=servico.duracao_minutos,
            preco=servico.preco,
            ativo=servico.ativo,
        )
        self._next_id += 1
        self.servicos.append(novo)
        return novo

    def atualizar(self, servico: Servico) -> Servico:
        for idx, s in enumerate(self.servicos):
            if s.id == servico.id:
                self.servicos[idx] = servico
                return servico
        raise ValueError("Serviço não encontrado")

    def deletar(self, servico_id: int) -> bool:
        for idx, s in enumerate(self.servicos):
            if s.id == servico_id:
                self.servicos.pop(idx)
                return True
        return False


def test_criar_servico_com_sucesso():
    repo = InMemoryServicoRepository()
    use_case = CriarServicoUseCase(repo)

    servico = use_case.execute(
        CriarServicoInput(
            nome="Corte Degradê",
            descricao="Corte moderno com acabamento na navalha",
            duracao_minutos=30,
            preco=35.0,
            ativo=True,
        )
    )

    assert servico.id == 1
    assert servico.nome == "Corte Degradê"
    assert servico.preco == 35.0
    assert servico.duracao_minutos == 30
    assert servico.ativo is True


def test_criar_servico_validacoes():
    repo = InMemoryServicoRepository()
    use_case = CriarServicoUseCase(repo)

    # Nome vazio
    with pytest.raises(ValidationError, match="O nome do serviço não pode estar vazio"):
        use_case.execute(
            CriarServicoInput(
                nome="   ",
                descricao="teste",
                duracao_minutos=30,
                preco=20.0,
            )
        )

    # Duração menor ou igual a zero
    with pytest.raises(ValidationError, match="duração do serviço deve ser maior que 0"):
        use_case.execute(
            CriarServicoInput(
                nome="Barba",
                descricao="teste",
                duracao_minutos=0,
                preco=20.0,
            )
        )

    # Preço negativo
    with pytest.raises(ValidationError, match="preço do serviço não pode ser negativo"):
        use_case.execute(
            CriarServicoInput(
                nome="Barba",
                descricao="teste",
                duracao_minutos=20,
                preco=-5.0,
            )
        )


def test_criar_servico_nome_duplicado():
    repo = InMemoryServicoRepository()
    use_case = CriarServicoUseCase(repo)

    use_case.execute(
        CriarServicoInput(
            nome="Corte Degradê",
            descricao="desc",
            duracao_minutos=30,
            preco=35.0,
        )
    )

    with pytest.raises(ServicoNomeDuplicadoError):
        use_case.execute(
            CriarServicoInput(
                nome="Corte Degradê",
                descricao="outra desc",
                duracao_minutos=40,
                preco=40.0,
            )
        )


def test_listar_servicos_e_filtro_ativos():
    repo = InMemoryServicoRepository()
    use_case_criar = CriarServicoUseCase(repo)
    use_case_listar = ListarServicosUseCase(repo)

    use_case_criar.execute(
        CriarServicoInput(
            nome="Corte 1",
            descricao="",
            duracao_minutos=30,
            preco=30.0,
            ativo=True,
        )
    )
    use_case_criar.execute(
        CriarServicoInput(
            nome="Corte 2 Inativo",
            descricao="",
            duracao_minutos=30,
            preco=30.0,
            ativo=False,
        )
    )

    todos = use_case_listar.execute(apenas_ativos=False)
    assert len(todos) == 2

    apenas_ativos = use_case_listar.execute(apenas_ativos=True)
    assert len(apenas_ativos) == 1
    assert apenas_ativos[0].nome == "Corte 1"


def test_buscar_servico_por_id():
    repo = InMemoryServicoRepository()
    use_case_criar = CriarServicoUseCase(repo)
    use_case_buscar = BuscarServicoPorIdUseCase(repo)

    criado = use_case_criar.execute(
        CriarServicoInput(
            nome="Barba Terapia",
            descricao="desc",
            duracao_minutos=25,
            preco=25.0,
        )
    )

    encontrado = use_case_buscar.execute(criado.id)
    assert encontrado.nome == "Barba Terapia"

    with pytest.raises(ServicoNaoEncontradoError):
        use_case_buscar.execute(999)


def test_atualizar_servico_com_sucesso():
    repo = InMemoryServicoRepository()
    use_case_criar = CriarServicoUseCase(repo)
    use_case_atualizar = AtualizarServicoUseCase(repo)

    criado = use_case_criar.execute(
        CriarServicoInput(
            nome="Cabelo",
            descricao="Corte simples",
            duracao_minutos=30,
            preco=30.0,
        )
    )

    atualizado = use_case_atualizar.execute(
        AtualizarServicoInput(
            id=criado.id,
            nome="Cabelo e Barba",
            descricao="Combo especial",
            duracao_minutos=45,
            preco=50.0,
            ativo=True,
        )
    )

    assert atualizado.nome == "Cabelo e Barba"
    assert atualizado.preco == 50.0
    assert atualizado.duracao_minutos == 45


def test_atualizar_servico_conflito_nome():
    repo = InMemoryServicoRepository()
    use_case_criar = CriarServicoUseCase(repo)
    use_case_atualizar = AtualizarServicoUseCase(repo)

    use_case_criar.execute(
        CriarServicoInput(nome="Serviço A", descricao="", duracao_minutos=20, preco=20.0)
    )
    s2 = use_case_criar.execute(
        CriarServicoInput(nome="Serviço B", descricao="", duracao_minutos=20, preco=20.0)
    )

    with pytest.raises(ServicoNomeDuplicadoError):
        use_case_atualizar.execute(
            AtualizarServicoInput(
                id=s2.id,
                nome="Serviço A",
                descricao="",
                duracao_minutos=20,
                preco=20.0,
                ativo=True,
            )
        )


def test_deletar_servico():
    repo = InMemoryServicoRepository()
    use_case_criar = CriarServicoUseCase(repo)
    use_case_deletar = DeletarServicoUseCase(repo)

    criado = use_case_criar.execute(
        CriarServicoInput(nome="Sobrancelha", descricao="", duracao_minutos=10, preco=10.0)
    )

    use_case_deletar.execute(criado.id)
    assert repo.buscar_por_id(criado.id) is None

    with pytest.raises(ServicoNaoEncontradoError):
        use_case_deletar.execute(criado.id)
