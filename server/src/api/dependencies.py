from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.security import decode_access_token
from application.use_cases.auth.alterar_senha import AlterarSenhaUseCase
from application.use_cases.auth.autenticar_usuario import AutenticarUsuarioUseCase
from application.use_cases.auth.registrar_usuario import RegistrarUsuarioUseCase
from application.use_cases.auth.atualizar_perfil import AtualizarPerfilUseCase
from application.use_cases.servicos.atualizar_servico import AtualizarServicoUseCase
from application.use_cases.servicos.buscar_servico_por_id import BuscarServicoPorIdUseCase
from application.use_cases.servicos.criar_servico import CriarServicoUseCase
from application.use_cases.servicos.deletar_servico import DeletarServicoUseCase
from application.use_cases.servicos.listar_servicos import ListarServicosUseCase
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
from application.use_cases.agendamentos.criar_agendamento import (
    CriarAgendamentoUseCase,
)
from application.use_cases.agendamentos.listar_agendamentos import (
    ListarAgendamentosUseCase,
)
from application.use_cases.agendamentos.cancelar_agendamento import (
    CancelarAgendamentoUseCase,
)
from application.use_cases.avaliacoes.criar_avaliacao import (
    CriarAvaliacaoUseCase,
)
from application.use_cases.avaliacoes.listar_avaliacoes_do_cliente import (
    ListarAvaliacoesDoClienteUseCase,
)
from application.use_cases.avaliacoes.consultar_media_avaliacoes_profissional import (
    ConsultarMediaAvaliacoesProfissionalUseCase,
)
from application.use_cases.profissionais.atualizar_profissional import (
    AtualizarProfissionalUseCase,
)
from application.use_cases.profissionais.buscar_profissional_por_id import (
    BuscarProfissionalPorIdUseCase,
)
from application.use_cases.profissionais.cadastrar_profissional import (
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
from application.use_cases.profissional_servico.associar_profissional_servico import (
    AssociarProfissionalServicoUseCase,
)
from application.use_cases.profissional_servico.remover_profissional_servico import (
    RemoverProfissionalServicoUseCase,
)
from application.use_cases.profissional_servico.listar_servicos_do_profissional import (
    ListarServicosDoProfissionalUseCase,
)
from application.use_cases.profissional_servico.listar_profissionais_do_servico import (
    ListarProfissionaisDoServicoUseCase,
)
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.repositories.profissional_repository import ProfissionalRepository
from domain.repositories.servico_repository import ServicoRepository
from domain.repositories.usuario_repository import UsuarioRepository
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.avaliacao_repository import AvaliacaoRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.cancelamento_repository import CancelamentoRepository
from domain.repositories.notificacao_repository import NotificacaoRepository
from infrastructure.database.connection import get_db as get_database_session
from infrastructure.database.repositories.profissional_repository import (
    SqlAlchemyProfissionalRepository,
)
from infrastructure.database.repositories.servico_repository import (
    SqlAlchemyServicoRepository,
)
from infrastructure.database.repositories.usuario_repository import (
    SqlAlchemyUsuarioRepository,
)
from infrastructure.database.repositories.agendamento_repository import (
    SqlAlchemyAgendamentoRepository,
)
from infrastructure.database.repositories.avaliacao_repository import (
    SqlAlchemyAvaliacaoRepository,
)
from infrastructure.database.repositories.profissional_servico_repository import (
    SqlAlchemyProfissionalServicoRepository,
)
from infrastructure.database.repositories.cancelamento_repository import (
    SqlAlchemyCancelamentoRepository,
)
from infrastructure.database.repositories.notificacao_repository import (
    SqlAlchemyNotificacaoRepository,
)


bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    yield from get_database_session()


def get_usuario_repository(
    db: Annotated[Session, Depends(get_db)],
) -> UsuarioRepository:
    return SqlAlchemyUsuarioRepository(db)


def get_registrar_usuario_use_case(
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> RegistrarUsuarioUseCase:
    return RegistrarUsuarioUseCase(repository)


def get_autenticar_usuario_use_case(
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> AutenticarUsuarioUseCase:
    return AutenticarUsuarioUseCase(repository)


def get_alterar_senha_use_case(
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> AlterarSenhaUseCase:
    return AlterarSenhaUseCase(repository)


def get_atualizar_perfil_use_case(
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> AtualizarPerfilUseCase:
    return AtualizarPerfilUseCase(repository)


def get_servico_repository(
    db: Annotated[Session, Depends(get_db)],
) -> ServicoRepository:
    return SqlAlchemyServicoRepository(db)


def get_agendamento_repository(
    db: Annotated[Session, Depends(get_db)],
) -> AgendamentoRepository:
    return SqlAlchemyAgendamentoRepository(db)


def get_avaliacao_repository(
    db: Annotated[Session, Depends(get_db)],
) -> AvaliacaoRepository:
    return SqlAlchemyAvaliacaoRepository(db)


def get_notificacao_repository(
    db: Annotated[Session, Depends(get_db)],
) -> NotificacaoRepository:
    return SqlAlchemyNotificacaoRepository(db)


def get_listar_notificacoes_use_case(
    repository: Annotated[
        NotificacaoRepository,
        Depends(get_notificacao_repository),
    ],
) -> ListarNotificacoesUseCase:
    return ListarNotificacoesUseCase(repository)


def get_marcar_notificacao_lida_use_case(
    repository: Annotated[
        NotificacaoRepository,
        Depends(get_notificacao_repository),
    ],
) -> MarcarNotificacaoLidaUseCase:
    return MarcarNotificacaoLidaUseCase(repository)


def get_contar_notificacoes_nao_lidas_use_case(
    repository: Annotated[
        NotificacaoRepository,
        Depends(get_notificacao_repository),
    ],
) -> ContarNotificacoesNaoLidasUseCase:
    return ContarNotificacoesNaoLidasUseCase(repository)


def get_processar_lembretes_use_case(
    agendamento_repository: Annotated[
        AgendamentoRepository,
        Depends(get_agendamento_repository),
    ],
    servico_repository: Annotated[
        ServicoRepository,
        Depends(get_servico_repository),
    ],
    notificacao_repository: Annotated[
        NotificacaoRepository,
        Depends(get_notificacao_repository),
    ],
) -> ProcessarLembretesUseCase:
    return ProcessarLembretesUseCase(
        agendamento_repository,
        servico_repository,
        notificacao_repository,
    )


def get_cancelamento_repository(
    db: Annotated[Session, Depends(get_db)],
) -> CancelamentoRepository:
    return SqlAlchemyCancelamentoRepository(db)


def get_cancelar_agendamento_use_case(
    agendamento_repository: Annotated[
        AgendamentoRepository,
        Depends(get_agendamento_repository),
    ],
    cancelamento_repository: Annotated[
        CancelamentoRepository,
        Depends(get_cancelamento_repository),
    ],
    notificacao_repository: Annotated[
        NotificacaoRepository,
        Depends(get_notificacao_repository),
    ],
    servico_repository: Annotated[
        ServicoRepository,
        Depends(get_servico_repository),
    ],
) -> CancelarAgendamentoUseCase:
    return CancelarAgendamentoUseCase(
        agendamento_repository,
        cancelamento_repository,
        notificacao_repository,
        servico_repository,
    )


def get_profissional_servico_repository(
    db: Annotated[Session, Depends(get_db)],
) -> ProfissionalServicoRepository:
    return SqlAlchemyProfissionalServicoRepository(db)


def get_criar_agendamento_use_case(
    agendamento_repository: Annotated[
        AgendamentoRepository,
        Depends(get_agendamento_repository),
    ],
    usuario_repository: Annotated[
        UsuarioRepository,
        Depends(get_usuario_repository),
    ],
    servico_repository: Annotated[
        ServicoRepository,
        Depends(get_servico_repository),
    ],
    profissional_servico_repository: Annotated[
        ProfissionalServicoRepository,
        Depends(get_profissional_servico_repository),
    ],
    notificacao_repository: Annotated[
        NotificacaoRepository,
        Depends(get_notificacao_repository),
    ],
) -> CriarAgendamentoUseCase:
    return CriarAgendamentoUseCase(
        agendamento_repository,
        usuario_repository,
        servico_repository,
        profissional_servico_repository,
        notificacao_repository,
    )


def get_listar_agendamentos_use_case(
    repository: Annotated[
        AgendamentoRepository,
        Depends(get_agendamento_repository),
    ],
) -> ListarAgendamentosUseCase:
    return ListarAgendamentosUseCase(repository)


def get_criar_avaliacao_use_case(
    agendamento_repository: Annotated[
        AgendamentoRepository,
        Depends(get_agendamento_repository),
    ],
    avaliacao_repository: Annotated[
        AvaliacaoRepository,
        Depends(get_avaliacao_repository),
    ],
) -> CriarAvaliacaoUseCase:
    return CriarAvaliacaoUseCase(
        agendamento_repository,
        avaliacao_repository,
    )


def get_listar_avaliacoes_do_cliente_use_case(
    repository: Annotated[
        AvaliacaoRepository,
        Depends(get_avaliacao_repository),
    ],
) -> ListarAvaliacoesDoClienteUseCase:
    return ListarAvaliacoesDoClienteUseCase(repository)


def get_criar_servico_use_case(
    repository: Annotated[ServicoRepository, Depends(get_servico_repository)],
) -> CriarServicoUseCase:
    return CriarServicoUseCase(repository)


def get_profissional_repository(
    db: Annotated[Session, Depends(get_db)],
) -> ProfissionalRepository:
    return SqlAlchemyProfissionalRepository(db)


def get_consultar_media_avaliacoes_profissional_use_case(
    profissional_repository: Annotated[
        ProfissionalRepository,
        Depends(get_profissional_repository),
    ],
    avaliacao_repository: Annotated[
        AvaliacaoRepository,
        Depends(get_avaliacao_repository),
    ],
) -> ConsultarMediaAvaliacoesProfissionalUseCase:
    return ConsultarMediaAvaliacoesProfissionalUseCase(
        profissional_repository,
        avaliacao_repository,
    )


def get_associar_profissional_servico_use_case(
    associacao_repository: Annotated[
        ProfissionalServicoRepository,
        Depends(get_profissional_servico_repository),
    ],
    usuario_repository: Annotated[
        UsuarioRepository,
        Depends(get_usuario_repository),
    ],
    servico_repository: Annotated[
        ServicoRepository,
        Depends(get_servico_repository),
    ],
) -> AssociarProfissionalServicoUseCase:
    return AssociarProfissionalServicoUseCase(
        associacao_repository,
        usuario_repository,
        servico_repository,
    )


def get_remover_profissional_servico_use_case(
    associacao_repository: Annotated[
        ProfissionalServicoRepository,
        Depends(get_profissional_servico_repository),
    ],
) -> RemoverProfissionalServicoUseCase:
    return RemoverProfissionalServicoUseCase(associacao_repository)


def get_listar_servicos_do_profissional_use_case(
    associacao_repository: Annotated[
        ProfissionalServicoRepository,
        Depends(get_profissional_servico_repository),
    ],
    servico_repository: Annotated[
        ServicoRepository,
        Depends(get_servico_repository),
    ],
    profissional_repository: Annotated[
        ProfissionalRepository,
        Depends(get_profissional_repository),
    ],
) -> ListarServicosDoProfissionalUseCase:
    return ListarServicosDoProfissionalUseCase(
        associacao_repository,
        servico_repository,
        profissional_repository,
    )


def get_listar_servicos_use_case(
    repository: Annotated[ServicoRepository, Depends(get_servico_repository)],
) -> ListarServicosUseCase:
    return ListarServicosUseCase(repository)


def get_buscar_servico_por_id_use_case(
    repository: Annotated[ServicoRepository, Depends(get_servico_repository)],
) -> BuscarServicoPorIdUseCase:
    return BuscarServicoPorIdUseCase(repository)


def get_atualizar_servico_use_case(
    repository: Annotated[ServicoRepository, Depends(get_servico_repository)],
) -> AtualizarServicoUseCase:
    return AtualizarServicoUseCase(repository)


def get_deletar_servico_use_case(
    repository: Annotated[ServicoRepository, Depends(get_servico_repository)],
) -> DeletarServicoUseCase:
    return DeletarServicoUseCase(repository)


def get_listar_profissionais_do_servico_use_case(
    associacao_repository: Annotated[
        ProfissionalServicoRepository,
        Depends(get_profissional_servico_repository),
    ],
    profissional_repository: Annotated[
        ProfissionalRepository,
        Depends(get_profissional_repository),
    ],
    servico_repository: Annotated[
        ServicoRepository,
        Depends(get_servico_repository),
    ],
) -> ListarProfissionaisDoServicoUseCase:
    return ListarProfissionaisDoServicoUseCase(
        associacao_repository,
        profissional_repository,
        servico_repository,
    )


def get_cadastrar_profissional_use_case(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> CadastrarProfissionalUseCase:
    return CadastrarProfissionalUseCase(repository)


def get_listar_profissionais_use_case(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> ListarProfissionaisUseCase:
    return ListarProfissionaisUseCase(repository)


def get_buscar_profissional_por_id_use_case(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> BuscarProfissionalPorIdUseCase:
    return BuscarProfissionalPorIdUseCase(repository)


def get_atualizar_profissional_use_case(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> AtualizarProfissionalUseCase:
    return AtualizarProfissionalUseCase(repository)


def get_inativar_profissional_use_case(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> InativarProfissionalUseCase:
    return InativarProfissionalUseCase(repository)


def get_reativar_profissional_use_case(
    repository: Annotated[ProfissionalRepository, Depends(get_profissional_repository)],
) -> ReativarProfissionalUseCase:
    return ReativarProfissionalUseCase(repository)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],
) -> Usuario:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _credenciais_invalidas()

    try:
        payload = decode_access_token(credentials.credentials)
        usuario_id = int(payload.get("sub", ""))
    except (ValueError, TypeError) as error:
        raise _credenciais_invalidas() from error

    usuario = repository.buscar_por_id(usuario_id)
    if usuario is None or not usuario.ativo:
        raise _credenciais_invalidas()

    return usuario


def get_current_admin(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.perfil != PerfilAcesso.ADMINISTRADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: apenas administradores podem realizar esta operação.",
        )
    return current_user


def _credenciais_invalidas() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou expiradas.",
        headers={"WWW-Authenticate": "Bearer"},
    )
