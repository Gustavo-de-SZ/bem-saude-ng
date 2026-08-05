from sqlalchemy import Column, String, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase

class ModeloInventario(ModeloBase):
 
    __tablename__ = "inventario"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profissional_id = Column(Integer, ForeignKey("profissionais.id", ondelete="CASCADE"), nullable=False)
    
    nome_item = Column(String(255), nullable=False)
    quantidade_estoque = Column(Integer, default=0)
    preco_unitario = Column(Numeric(10, 2), nullable=True) 
    codigo_barras = Column(String(50), nullable=True)

#    profissional = relationship("ModeloProfissional", back_populates="itens_inventario")