from collections.abc import Generator
from typing import Annotated
 
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
 
from core.security import decode_access_token
from domain.entities.usuario import Usuario
from domain.repositories.usuario_repository import UsuarioRepository
from infrastructure.database.connection import get_db as get_database_session
from infrastructure.database.repositories.usuario_repository import (SqlAlchemyUsuarioRepository,)
 
bearer_scheme = HTTPBearer(auto_error=False)
 
 
def get_db() -> Generator[Session, None, None]:
	yield from get_database_session()
 
 
def get_usuario_repository(db: Annotated[Session, Depends(get_db)],) -> UsuarioRepository:
	return SqlAlchemyUsuarioRepository(db)
 
 
def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)], repository: Annotated[UsuarioRepository, Depends(get_usuario_repository)],) -> Usuario:
	if credentials is None or credentials.scheme.lower() != "bearer":
		raise _credenciais_invalidas()
 
	try:
		payload = decode_access_token(credentials.credentials)
	except ValueError as error:
		raise _credenciais_invalidas() from error
 
	usuario_id = payload.get("sub")
	if usuario_id is None:
		raise _credenciais_invalidas()
 
	try:
		identificador = int(usuario_id)
	except (TypeError, ValueError) as error:
		raise _credenciais_invalidas() from error
 
	usuario = repository.buscar_por_id(identificador)
	if usuario is None or not usuario.ativo:
		raise _credenciais_invalidas()
 
	return usuario
 
 
def _credenciais_invalidas() -> HTTPException:
	return HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Credenciais inválidas ou expiradas.",
		headers={"WWW-Authenticate": "Bearer"},
	)