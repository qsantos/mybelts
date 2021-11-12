import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

config = context.config

fileConfig(config.config_file_name)  # type: ignore

sys.path.insert(0, os.getcwd())

if True:  # placate isort
    from skills.config import POSTGRES_URI
    from skills.schema import Base

# connect to project's models
target_metadata = Base.metadata

# define POSTGRES_URI in .ini file
config.set_section_option(config.config_ini_section, 'POSTGRES_URI', POSTGRES_URI)


def run_migrations_offline() -> None:
    url = config.get_main_option('sqlalchemy.url')
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
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
