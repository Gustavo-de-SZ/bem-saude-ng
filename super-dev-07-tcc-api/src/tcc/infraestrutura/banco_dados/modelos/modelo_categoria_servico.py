from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase


class ModeloCategoriaServico(ModeloBase):
    __tablename__ = "categorias_servico"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False, unique=True)

    # Relacionamentos
    chamados = relationship("ModeloChamado", back_populates="categoria")