from pydantic import BaseModel, EmailStr
from enum import Enum

class TipoPerfil(str, Enum):
    CLIENTE = "CLIENTE"
    PROFISSIONAL = "PROFISSIONAL" 
    ADMIN = "ADMIN"

class UsuarioCriarRequest(BaseModel):
    email: EmailStr
    senha: str
    tipo_perfil: TipoPerfil

class UsuarioAlterarRequest(BaseModel):
    email: EmailStr | None = None
    tipo_perfil: TipoPerfil | None = None

class UsuarioResponse(BaseModel):
    id: int 
    email: str
    tipo_perfil: TipoPerfil
    ativo: bool 

    class Config:
        from_attributes = True