from abc import ABC, abstractmethod
 
from domain.entities.usuario import Usuario
 
 
class UsuarioRepository(ABC):
    @abstractmethod
    def buscar_por_id(self, usuario_id: int) -> Usuario | None: ...
 
    @abstractmethod
    def buscar_por_email(self, email: str) -> Usuario | None: ...
 
    @abstractmethod
    def criar(self, usuario: Usuario) -> Usuario: ...