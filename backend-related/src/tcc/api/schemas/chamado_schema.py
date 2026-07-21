from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import StatusChamado

class ChamadoCreate(BaseModel):
    titulo: str = Field(..., max_length=255, example="Computador não liga")
    descricao_problema: str = Field(..., min_length=10)
    categoria_id: int
    # Note: cliente_id and profissional_id come from context/auth in real app

class ChamadoUpdate(BaseModel):
    titulo: Optional[str] = Field(None, max_length=255)
    descricao_problema: Optional[str] = Field(None, min_length=10)
    categoria_id: Optional[int] = None
    status: Optional[StatusChamado] = None
    profissional_id: Optional[int] = None

    class Config:
        from_attributes = True

class ChamadoResponse(BaseModel):
    id: int
    titulo: str
    descricao_problema: str
    status: StatusChamado
    criado_em: datetime

    class Config:
        from_attributes = True

# Schema specifically for frontend meus-chamados endpoint
class ChamadoFrontendResponse(BaseModel):
    id: int
    equipamento: str  # Maps from titulo
    status: str       # Maps from status.value
    dataCriacao: str  # Format DD/MM/YYYY

    class Config:
        from_attributes = True