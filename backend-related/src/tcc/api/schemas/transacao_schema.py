from pydantic import BaseModel
from typing import Optional
from src.tcc.infraestrutura.banco_dados.modelos.modelo_transacao import TransacaoStatusEnum

class TransacaoBase(BaseModel):
    titulo: str
    cliente: str
    data: str
    valor: float
    status: str  # Will validate against enum

class TransacaoCreate(TransacaoBase):
    pass

class TransacaoUpdate(BaseModel):
    titulo: Optional[str] = None
    cliente: Optional[str] = None
    data: Optional[str] = None
    valor: Optional[float] = None
    status: Optional[str] = None

class TransacaoResponse(TransacaoBase):
    id: int

    class Config:
        from_attributes = True