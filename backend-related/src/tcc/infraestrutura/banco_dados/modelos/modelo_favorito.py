from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase
from datetime import datetime

class ModeloFavorito(ModeloBase):
    __tablename__ = "favoritos"
    __table_args__ = (
        UniqueConstraint('cliente_id', 'profissional_id', name='uq_cliente_profissional'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    profissional_id = Column(Integer, ForeignKey("profissionais.id"), nullable=False)
    criado_em = Column(DateTime, default=datetime.now, nullable=False)

    # RELATIONSHIPS
    # cliente = relationship("ModeloCliente", back_populates="favoritos")
    # profissional = relationship("ModeloProfissional", back_populates="favoritos_del")