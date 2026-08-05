from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase
import enum

class TipoEquipamentoEnum(enum.Enum):
    NOTEBOOK = "Notebook"
    DESKTOP = "Desktop"
    IMPRESSORA = "Impressora"
    SERVIDOR = "Servidor"
    REDE = "Rede"
    OUTRO = "Outro"

class ModeloEquipamento(ModeloBase):
    __tablename__ = "equipamentos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(String(100), nullable=False)
    marca = Column(String(100), nullable=False)
    modelo = Column(String(100), nullable=False)
    numero_serie = Column(String(100), nullable=True)
    patrimonio = Column(String(100), nullable=True)
    observacoes = Column(String(255), nullable=True)
    data_registro = Column(String(20), nullable=True)

    # Foreign keys
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Relationships
    cliente = relationship("ModeloCliente", back_populates="equipamentos")
    usuario = relationship("ModeloUsuario")