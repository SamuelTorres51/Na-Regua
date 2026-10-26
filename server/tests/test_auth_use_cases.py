from datetime import datetime, timezone
import pytest

from application.common.exceptions import (
    CredenciaisInvalidasError,
    EmailJaCadastradoError,
    SenhaInvalidaError,
    UsuarioNaoEncontradoError,
    ValidationError,
)
from application.use_cases.auth.alterar_senha import (
    AlterarSenhaInput,
    AlterarSenhaUseCase,
)
from application.use_cases.auth.atualizar_perfil import (
    AtualizarPerfilInput,
    AtualizarPerfilUseCase,
)
from application.use_cases.auth.autenticar_usuario import (
    AutenticarUsuarioInput,
    AutenticarUsuarioUseCase,
)
from application.use_cases.auth.registrar_usuario import (
    RegistrarUsuarioInput,
    RegistrarUsuarioUseCase,
)
from core.security import hash_password
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.usuario_repository import UsuarioRepository


class InMemoryUsuarioRepository(UsuarioRepository):
    def __init__(self):
        self.usuarios: list[Usuario] = []
        self._next_id = 1

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
        novo = Usuario(
            id=self._next_id,
            nome=usuario.nome,
            email=usuario.email,
            telefone=usuario.telefone,
            senha_hash=usuario.senha_hash,
            perfil=usuario.perfil,
            ativo=usuario.ativo,
            criado_em=usuario.criado_em,
        )
        self._next_id += 1
        self.usuarios.append(novo)
        return novo

    def atualizar(self, usuario: Usuario) -> Usuario:
        for idx, u in enumerate(self.usuarios):
            if u.id == usuario.id:
                self.usuarios[idx] = usuario
                return usuario
        raise ValueError("Usuário não encontrado")


def test_registrar_usuario_com_sucesso():
    repo = InMemoryUsuarioRepository()
    use_case = RegistrarUsuarioUseCase(repo)

    dados = RegistrarUsuarioInput(
        nome="Samuel Torres",
        email="samuel@example.com",
        telefone="86999998888",
        senha="senhaSegura123",
    )
    resultado = use_case.execute(dados)

    assert resultado.usuario.id is not None
    assert resultado.usuario.nome == "Samuel Torres"
    assert resultado.usuario.email == "samuel@example.com"
    assert resultado.access_token is not None
    assert resultado.token_type == "bearer"


def test_registrar_usuario_dados_invalidos_ou_vazios():
    repo = InMemoryUsuarioRepository()
    use_case = RegistrarUsuarioUseCase(repo)

    # Nome vazio
    with pytest.raises(ValidationError, match="O nome não pode estar vazio"):
        use_case.execute(
            RegistrarUsuarioInput(
                nome="   ",
                email="samuel@example.com",
                telefone="86999998888",
                senha="senhaSegura123",
            )
        )

    # Email inválido
    with pytest.raises(ValidationError, match="Formato de e-mail inválido"):
        use_case.execute(
            RegistrarUsuarioInput(
                nome="Samuel",
                email="email-invalido",
                telefone="86999998888",
                senha="senhaSegura123",
            )
        )

    # Senha curta
    with pytest.raises(ValidationError, match="mínimo 8 caracteres"):
        use_case.execute(
            RegistrarUsuarioInput(
                nome="Samuel",
                email="samuel@example.com",
                telefone="86999998888",
                senha="123",
            )
        )


def test_registrar_usuario_email_duplicado():
    repo = InMemoryUsuarioRepository()
    use_case = RegistrarUsuarioUseCase(repo)

    dados = RegistrarUsuarioInput(
        nome="Samuel",
        email="samuel@example.com",
        telefone="86999998888",
        senha="senhaSegura123",
    )
    use_case.execute(dados)

    with pytest.raises(EmailJaCadastradoError):
        use_case.execute(dados)


def test_autenticar_usuario_com_sucesso():
    repo = InMemoryUsuarioRepository()
    usuario = Usuario(
        id=None,
        nome="Samuel",
        email="samuel@example.com",
        telefone="86999998888",
        senha_hash=hash_password("senhaSegura123"),
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )
    repo.criar(usuario)

    use_case = AutenticarUsuarioUseCase(repo)
    resultado = use_case.execute(
        AutenticarUsuarioInput(email="samuel@example.com", senha="senhaSegura123")
    )

    assert resultado.usuario.email == "samuel@example.com"
    assert resultado.access_token is not None


def test_autenticar_usuario_senha_invalida():
    repo = InMemoryUsuarioRepository()
    usuario = Usuario(
        id=None,
        nome="Samuel",
        email="samuel@example.com",
        telefone="86999998888",
        senha_hash=hash_password("senhaSegura123"),
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )
    repo.criar(usuario)

    use_case = AutenticarUsuarioUseCase(repo)
    with pytest.raises(CredenciaisInvalidasError):
        use_case.execute(
            AutenticarUsuarioInput(email="samuel@example.com", senha="senhaErrada")
        )


def test_autenticar_usuario_validacao_campos():
    repo = InMemoryUsuarioRepository()
    use_case = AutenticarUsuarioUseCase(repo)

    with pytest.raises(ValidationError, match="O e-mail não pode estar vazio"):
        use_case.execute(AutenticarUsuarioInput(email="", senha="qualquercoisa"))


def test_alterar_senha_com_sucesso():
    repo = InMemoryUsuarioRepository()
    usuario = Usuario(
        id=None,
        nome="Samuel",
        email="samuel@example.com",
        telefone="86999998888",
        senha_hash=hash_password("senhaAntiga123"),
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )
    salvo = repo.criar(usuario)

    alterar_use_case = AlterarSenhaUseCase(repo)
    alterar_use_case.execute(
        AlterarSenhaInput(
            usuario_id=salvo.id,
            senha_atual="senhaAntiga123",
            nova_senha="novaSenhaForte123",
        )
    )

    # Validar que agora a autenticação funciona com a nova senha
    auth_use_case = AutenticarUsuarioUseCase(repo)
    res = auth_use_case.execute(
        AutenticarUsuarioInput(email="samuel@example.com", senha="novaSenhaForte123")
    )
    assert res.usuario.id == salvo.id

    # E falha com a senha antiga
    with pytest.raises(CredenciaisInvalidasError):
        auth_use_case.execute(
            AutenticarUsuarioInput(email="samuel@example.com", senha="senhaAntiga123")
        )


def test_alterar_senha_atual_incorreta():
    repo = InMemoryUsuarioRepository()
    usuario = Usuario(
        id=None,
        nome="Samuel",
        email="samuel@example.com",
        telefone="86999998888",
        senha_hash=hash_password("senhaAntiga123"),
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )
    salvo = repo.criar(usuario)

    use_case = AlterarSenhaUseCase(repo)
    with pytest.raises(SenhaInvalidaError, match="A senha atual está incorreta"):
        use_case.execute(
            AlterarSenhaInput(
                usuario_id=salvo.id,
                senha_atual="senhaErrada123",
                nova_senha="novaSenhaForte123",
            )
        )


def test_alterar_senha_validacao_nova_senha():
    repo = InMemoryUsuarioRepository()
    use_case = AlterarSenhaUseCase(repo)

    # Nova senha igual à atual
    with pytest.raises(ValidationError, match="deve ser diferente da senha atual"):
        use_case.execute(
            AlterarSenhaInput(
                usuario_id=1,
                senha_atual="mesmaSenha123",
                nova_senha="mesmaSenha123",
            )
        )

    # Nova senha curta
    with pytest.raises(ValidationError, match="no mínimo 8 caracteres"):
        use_case.execute(
            AlterarSenhaInput(
                usuario_id=1,
                senha_atual="senhaAntiga123",
                nova_senha="curta",
            )
        )


def _criar_usuario_teste(
    repo: InMemoryUsuarioRepository,
    *,
    nome: str = "Samuel Torres",
    email: str = "samuel@example.com",
    telefone: str = "86999998888",
) -> Usuario:
    return repo.criar(
        Usuario(
            id=None,
            nome=nome,
            email=email,
            telefone=telefone,
            senha_hash=hash_password("senhaSegura123"),
            perfil=PerfilAcesso.CLIENTE,
            ativo=True,
            criado_em=datetime.now(timezone.utc),
        )
    )


def test_atualizar_perfil_com_sucesso_e_preserva_campos_protegidos():
    repo = InMemoryUsuarioRepository()
    usuario = _criar_usuario_teste(repo)
    use_case = AtualizarPerfilUseCase(repo)

    resultado = use_case.execute(
        AtualizarPerfilInput(
            usuario_id=usuario.id,
            nome="  Samuel Atualizado  ",
            email="SAMUEL.ATUALIZADO@EXAMPLE.COM",
            telefone=" 86988887777 ",
        )
    )

    assert resultado.nome == "Samuel Atualizado"
    assert resultado.email == "samuel.atualizado@example.com"
    assert resultado.telefone == "86988887777"
    assert resultado.senha_hash == usuario.senha_hash
    assert resultado.perfil is usuario.perfil
    assert resultado.ativo is usuario.ativo


def test_atualizar_perfil_parcial_preserva_campos_nao_informados():
    repo = InMemoryUsuarioRepository()
    usuario = _criar_usuario_teste(repo)
    use_case = AtualizarPerfilUseCase(repo)

    resultado = use_case.execute(
        AtualizarPerfilInput(
            usuario_id=usuario.id,
            telefone="86988887777",
        )
    )

    assert resultado.nome == usuario.nome
    assert resultado.email == usuario.email
    assert resultado.telefone == "86988887777"


def test_atualizar_perfil_rejeita_email_duplicado():
    repo = InMemoryUsuarioRepository()
    usuario = _criar_usuario_teste(repo)
    _criar_usuario_teste(
        repo,
        nome="Outro Usuário",
        email="outro@example.com",
        telefone="86988887776",
    )
    use_case = AtualizarPerfilUseCase(repo)

    with pytest.raises(EmailJaCadastradoError):
        use_case.execute(
            AtualizarPerfilInput(
                usuario_id=usuario.id,
                email="OUTRO@EXAMPLE.COM",
            )
        )


@pytest.mark.parametrize(
    ("dados", "mensagem"),
    [
        (
            AtualizarPerfilInput(usuario_id=1),
            "ao menos um campo",
        ),
        (
            AtualizarPerfilInput(usuario_id=1, nome="  "),
            "nome não pode estar vazio",
        ),
        (
            AtualizarPerfilInput(usuario_id=1, email="email-invalido"),
            "Formato de e-mail inválido",
        ),
        (
            AtualizarPerfilInput(usuario_id=1, telefone="123"),
            "telefone deve ter entre 10 e 20",
        ),
    ],
)
def test_atualizar_perfil_rejeita_dados_invalidos(
    dados: AtualizarPerfilInput,
    mensagem: str,
):
    use_case = AtualizarPerfilUseCase(InMemoryUsuarioRepository())

    with pytest.raises(ValidationError, match=mensagem):
        use_case.execute(dados)


def test_atualizar_perfil_rejeita_usuario_inexistente():
    use_case = AtualizarPerfilUseCase(InMemoryUsuarioRepository())

    with pytest.raises(UsuarioNaoEncontradoError, match="não encontrado"):
        use_case.execute(
            AtualizarPerfilInput(
                usuario_id=999,
                nome="Novo Nome",
            )
        )
