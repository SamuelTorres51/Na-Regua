from collections.abc import Generator

from sqlalchemy.orm import Session

from infrastructure.database.connection import get_db as get_database_session


def get_db() -> Generator[Session, None, None]:
	yield from get_database_session()
