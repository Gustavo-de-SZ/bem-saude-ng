from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from src.tcc.infraestrutura.banco_dados.modelos.modelo_base import ModeloBase

class ModeloMensagem(ModeloBase):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, index=True, nullable=False)
    remetente_id = Column(String, nullable=False)
    remetente_nome = Column(String, nullable=False)
    texto = Column(Text, nullable=False)
    data_envio = Column(DateTime, default=datetime.utcnow)
