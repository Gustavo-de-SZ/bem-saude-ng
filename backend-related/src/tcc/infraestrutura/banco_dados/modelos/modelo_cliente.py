from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .modelo_base import ModeloBase

class ModeloCliente(ModeloBase):

    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, unique=True)

    nome_completo = Column(String(255), nullable=False)
    telefone = Column(String(20), nullable=True)
    empresa = Column(String(255), nullable=True)
    avaliacao = Column(Integer, default=0)
    servicos_ativos = Column(Integer, default=0)
    servicos_concluidos = Column(Integer, default=0)
    endereco = Column(String(255), nullable=True)

    usuario = relationship("ModeloUsuario", back_populates="cliente")
    # favoritos = relationship("ModeloFavorito", back_populates="cliente", cascade="all, delete-orphan")
    # For direct access to favorited professionals
    # favoritos_profissionais = relationship(
    #     "ModeloProfissional",
    #     secondary="favoritos",
    #     primaryjoin="and_(ModeloCliente.id == ModeloFavorito.cliente_id)",
    #     secondaryjoin="and_(ModeloFavorito.profissional_id == ModeloProfissional.id)",
    #     back_populates="clientes_favoritos"
    # )
    chamados = relationship("ModeloChamado", back_populates="cliente")