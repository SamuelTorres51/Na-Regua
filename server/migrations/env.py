from logging.config import fileConfig
from pathlib import Path
import sys

from alembic import context
from sqlalchemy import engine_from_config, pool

src_path = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(src_path))

from core.config import settings
from infrastructure.database.models.base import Base
from infrastructure.database.models.usuario_model import UsuarioModel as _UsuarioModel
from infrastructure.database.models.servico_model import ServicoModel as _ServicoModel
from infrastructure.database.models.agendamento_model import (
    AgendamentoModel as _AgendamentoModel,
)
from infrastructure.database.models.profissional_servico_model import (
    ProfissionalServicoModel as _ProfissionalServicoModel,
)
from infrastructure.database.models.cancelamento_model import (
    CancelamentoModel as _CancelamentoModel,
)
from infrastructure.database.models.notificacao_model import (
    NotificacaoModel as _NotificacaoModel,
)
from infrastructure.database.models.avaliacao_model import (
    AvaliacaoModel as _AvaliacaoModel,
)

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
