class ApplicationError(Exception):
    """Base exception for application errors."""


class ValidationError(ApplicationError):
    """Raised when input data fails validation."""


class EmailJaCadastradoError(ApplicationError):
    """Raised when an email is already registered."""


class CredenciaisInvalidasError(ApplicationError):
    """Raised when authentication credentials are invalid."""


class UsuarioNaoEncontradoError(ApplicationError):
    """Raised when a user cannot be found."""


class SenhaInvalidaError(ApplicationError):
    pass


class HorarioIndisponivelError(ApplicationError):
    """Raised when the requested appointment time is occupied."""
