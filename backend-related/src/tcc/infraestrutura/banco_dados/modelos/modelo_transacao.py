from sqlalchemy import Column, String, Integer, Enum, DateTime, Numeric
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase
import enum

class TransacaoStatusEnum(enum.Enum):
    PAGO = "Pago"
    PENDENTE = "Pendente"

class ModeloTransacao(ModeloBase):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    titulo = Column(String(255), nullable=False)
    cliente = Column(String(255), nullable=False)
    data = Column(String(20), nullable=False)  # Stored as string to match API
    valor = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(TransacaoStatusEnum), nullable=False)