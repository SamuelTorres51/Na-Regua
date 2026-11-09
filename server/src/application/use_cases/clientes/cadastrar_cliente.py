from dataclasses import dataclass
from datetime import datetime, timezone

from application.common.exceptions import EmailJaCadastradoError, ValidationError
from application.use_cases.auth.registrar_usuario import EMAIL_REGEX
from core.security import hash_password
from domain.entities.cliente import Cliente
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.cliente_repository import ClienteRepository


@dataclass(frozen=True)
class CadastrarClienteInput:
    nome: str
    email: str
    telefone: str
    senha: str


class CadastrarClienteUseCase:
    def __init__(self, cliente_repository: ClienteRepository) -> None:
        self.cliente_repository = cliente_repository

    def validate(self, dados: CadastrarClienteInput) -> None:
        nome = dados.nome.strip() if dados.nome else ""
        email = dados.email.strip() if dados.email else ""
        telefone = dados.telefone.strip() if dados.telefone else ""
        senha = dados.senha if dados.senha else ""

        if not nome:
            raise ValidationError("O nome não pode estar vazio.")
        if len(nome) < 3 or len(nome) > 150:
            raise ValidationError("O nome deve ter entre 3 e 150 caracteres.")
        if not email or not EMAIL_REGEX.match(email):
            raise ValidationError("Formato de e-mail inválido.")
        if not telefone or len(telefone) < 10 or len(telefone) > 20:
            raise ValidationError("O telefone deve ter entre 10 e 20 caracteres.")
        if len(senha) < 8:
            raise ValidationError("A senha deve ter no mínimo 8 caracteres.")

    def execute(self, dados: CadastrarClienteInput) -> Cliente:
        self.validate(dados)
        email = dados.email.strip().lower()
        if self.cliente_repository.buscar_por_email(email) is not None:
            raise EmailJaCadastradoError("E-mail já cadastrado")

        return self.cliente_repository.criar(
            Cliente(
                id=None,
                nome=dados.nome.strip(),
                email=email,
                telefone=dados.telefone.strip(),
                senha_hash=hash_password(dados.senha),
                perfil=PerfilAcesso.CLIENTE,
                ativo=True,
                criado_em=datetime.now(timezone.utc),
            )
        )
