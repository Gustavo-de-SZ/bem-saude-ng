import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from .modelo_base import Base

class TipoPerfil(enum.Enum):
    CLIENTE = "CLIENTE"
    PROFISSIONAL = "PROFISSIONAL"
    ADMIN = "ADMIN"

class ModeloUsuario(Base):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=True) 
    tipo_perfil = Column(Enum(TipoPerfil), nullable=False)
    ativo = Column(Boolean, default=True)
    
    cliente = relationship("ModeloCliente", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    profissional = relationship("ModeloProfissional", back_populates="usuario", uselist=False, cascade="all, delete-orphan")