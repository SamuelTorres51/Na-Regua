class ApplicationError(Exception):
    """Exceção base para erros na camada de aplicação."""


class ValidationError(ApplicationError):
    """Lançada quando os dados de entrada falham na validação de formato ou regras."""


class EmailJaCadastradoError(ApplicationError):
    """Lançada quando uma tentativa de cadastro usa um e-mail já existente."""


class CredenciaisInvalidasError(ApplicationError):
    """Lançada quando as credenciais de autenticação são inválidas ou o usuário está inativo."""


class UsuarioNaoEncontradoError(ApplicationError):
    """Lançada quando um usuário solicitado não é encontrado."""
