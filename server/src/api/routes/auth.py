from typing import Annotated
from fastapi import APIRouter, Depends
from api.dependencies import get_current_user
from api.schemas.auth import UserResponse
from domain.entities.usuario import Usuario
 
router = APIRouter(prefix="/auth", tags=["Autenticação"])
 
 
@router.get("/me", response_model=UserResponse)
def read_current_user(usuario: Annotated[Usuario, Depends(get_current_user)],) -> Usuario:
	return usuario