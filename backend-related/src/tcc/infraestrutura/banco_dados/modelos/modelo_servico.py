from sqlalchemy import Column, String, Integer, Enum, DateTime, Numeric
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase
import enum

class ServicoStatusEnum(enum.Enum):
    CONCLUIDO = "Concluído"
    EM_ANDAMENTO = "Em Andamento"
    PENDENTE = "Pendente"
    CANCELADO = "Cancelado"

class ModeloServico(ModeloBase):
    __tablename__ = "servicos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    icone = Column(String(255), nullable=False)
    titulo = Column(String(255), nullable=False, unique=True)
    status = Column(Enum(ServicoStatusEnum), nullable=False)
    cliente = Column(String(255), nullable=False)
    data = Column(String(20), nullable=False)  
    duracao = Column(String(20), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)