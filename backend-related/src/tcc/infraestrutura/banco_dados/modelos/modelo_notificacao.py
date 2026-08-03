from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .modelo_base import ModeloBase

class ModeloNotificacao(ModeloBase):
    __tablename__ = "notificacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255), nullable=False)
    mensagem = Column(String(500), nullable=False)
    tipo = Column(String(50), nullable=False) # 'info', 'success', 'warning', 'error'
    lida = Column(Boolean, default=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("ModeloUsuario", backref="notificacoes")
