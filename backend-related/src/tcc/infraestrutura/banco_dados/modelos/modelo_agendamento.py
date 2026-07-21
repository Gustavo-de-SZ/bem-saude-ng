from sqlalchemy import Column, String, Integer, Enum, DateTime
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase
import enum

class AgendamentoStatusEnum(enum.Enum):
    CONFIRMADO = "Confirmado"
    PENDENTE = "Pendente"
    CONCLUIDO = "Concluído"
    CANCELADO = "Cancelado"

class AgendamentoTipoEnum(enum.Enum):
    PRESENCIAL = "Presencial"
    REMOTO = "Remoto"

class ModeloAgendamento(ModeloBase):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mes = Column(String(20), nullable=True)
    dia = Column(String(10), nullable=False)
    hora = Column(String(10), nullable=False)
    titulo = Column(String(255), nullable=True)
    empresa = Column(String(255), nullable=True)
    servico = Column(String(255), nullable=True)
    cliente = Column(String(255), nullable=True)
    status = Column(Enum(AgendamentoStatusEnum), nullable=False)
    duracao = Column(String(20), nullable=True)
    tipo = Column(Enum(AgendamentoTipoEnum), nullable=True)