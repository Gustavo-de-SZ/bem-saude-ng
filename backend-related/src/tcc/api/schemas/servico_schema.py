from pydantic import BaseModel
from typing import Optional
from src.tcc.infraestrutura.banco_dados.modelos.modelo_servico import ServicoStatusEnum

class ServicoBase(BaseModel):
    icone: str
    titulo: str
    status: str  # Will validate against enum
    cliente: str
    data: str
    duracao: str
    valor: float

class ServicoCreate(ServicoBase):
    pass

class ServicoResponse(ServicoBase):
    id: int

    class Config:
        from_attributes = True

# For update, all fields optional except titulo (used for lookup)
class ServicoUpdate(BaseModel):
    icone: Optional[str] = None
    status: Optional[str] = None
    cliente: Optional[str] = None
    data: Optional[str] = None
    duracao: Optional[str] = None
    valor: Optional[float] = None