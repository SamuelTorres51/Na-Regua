from datetime import datetime, timezone
import pytest

from application.common.exceptions import (
    CredenciaisInvalidasError,
    EmailJaCadastradoError,
    ValidationError,
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
