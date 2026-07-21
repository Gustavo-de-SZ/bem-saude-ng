from pydantic import BaseModel
from typing import Optional
from src.tcc.infraestrutura.banco_dados.modelos.modelo_agendamento import AgendamentoStatusEnum, AgendamentoTipoEnum

class AgendamentoBase(BaseModel):
    mes: Optional[str] = None
    dia: str
    hora: str
    titulo: Optional[str] = None
    empresa: Optional[str] = None
    servico: Optional[str] = None
    cliente: Optional[str] = None
    status: str  # Return enum value as string
    duracao: Optional[str] = None
    tipo: Optional[str] = None

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoUpdate(BaseModel):
    mes: Optional[str] = None
    dia: Optional[str] = None
    hora: Optional[str] = None
    titulo: Optional[str] = None
    empresa: Optional[str] = None
    servico: Optional[str] = None
    cliente: Optional[str] = None
    status: Optional[str] = None
    duracao: Optional[str] = None
    tipo: Optional[str] = None

class AgendamentoResponse(AgendamentoBase):
    id: str  # Return as string to match frontend expectation

    class Config:
        from_attributes = True