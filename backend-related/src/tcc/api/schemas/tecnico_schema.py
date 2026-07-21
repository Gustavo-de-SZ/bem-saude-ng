from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class TecnicCreateRequest(BaseModel):
    email: EmailStr
    nome: str  # will be used as nome_fantasia
    # optional fields that may be provided later
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    descricao_servicos: Optional[str] = None
    # Fields commonly sent by frontend that we want to capture
    especialidadePrincipal: Optional[str] = None
    local: Optional[str] = None
    tempoResposta: Optional[str] = None

    class Config:
        # Allow extra fields beyond those defined (for future compatibility)
        # but we'll define the ones we know about above
        extra = 'ignore'


class TecnicUpdateRequest(BaseModel):
    nome: Optional[str] = None  # will be used as nome_fantasia
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    descricao_servicos: Optional[str] = None
    # Fields commonly sent by frontend that we want to capture
    especialidadePrincipal: Optional[str] = None
    local: Optional[str] = None
    tempoResposta: Optional[str] = None

    class Config:
        extra = 'ignore'


class TecnicResponse(BaseModel):
    id: int
    usuario_id: int
    nome_fantasia: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    descricao_servicos: Optional[str] = None
    aprovado_pelo_admin: bool
    criado_em: datetime
    email: str

    class Config:
        from_attributes = True