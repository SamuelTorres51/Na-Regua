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


class SenhaInvalidaError(ApplicationError):
    """Lançada quando a senha atual fornecida está incorreta."""


class ServicoNaoEncontradoError(ApplicationError):
    """Lançada quando um serviço solicitado não é encontrado."""


class ServicoNomeDuplicadoError(ApplicationError):
    """Lançada quando já existe um serviço cadastrado com o mesmo nome."""


class ProfissionalNaoEncontradoError(ApplicationError):
    """Lançada quando um profissional solicitado não é encontrado."""


class ClienteNaoEncontradoError(ApplicationError):
    """Lançada quando um cliente solicitado não é encontrado."""


class AgendamentoConflitanteError(ApplicationError):
    """Lançada quando o horário solicitado já está ocupado."""


class AgendamentoNaoPermitidoError(ApplicationError):
    """Lançada quando o usuário não pode criar o agendamento solicitado."""


class AgendamentoNaoEncontradoError(ApplicationError):
    """Lançada quando um agendamento solicitado não é encontrado."""


class AgendamentoNaoPodeSerCanceladoError(ApplicationError):
    """Lançada quando um agendamento não atende às regras de cancelamento."""


class AgendamentoStatusInvalidoError(ApplicationError):
    """Lançada quando uma transição de status não é permitida."""


class AvaliacaoNaoPermitidaError(ApplicationError):
    """Lançada quando o usuário não pode avaliar o agendamento informado."""


class AvaliacaoAgendamentoNaoConcluidoError(ApplicationError):
    """Lançada quando tentam avaliar um agendamento ainda não concluído."""


class AvaliacaoJaRegistradaError(ApplicationError):
    """Lançada quando um agendamento já possui uma avaliação."""


class ProfissionalServicoDuplicadoError(ApplicationError):
    """Lançada quando a associação já existe."""


class ProfissionalServicoNaoEncontradoError(ApplicationError):
    """Lançada quando a associação não existe."""


class NotificacaoNaoEncontradaError(ApplicationError):
    """Lançada quando uma notificação solicitada não é encontrada."""


class NotificacaoNaoPermitidaError(ApplicationError):
    """Lançada quando o usuário tenta acessar ou modificar uma notificação de outro usuário."""

