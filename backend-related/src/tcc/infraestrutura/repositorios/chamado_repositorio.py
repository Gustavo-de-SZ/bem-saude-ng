from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado, StatusChamado
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

class RepositorioChamado:
    def __init__(self, session: Session):
        self.session = session

    def listar_por_cliente(self, cliente_id: int) -> List[ModeloChamado]:
        """Get all service requests for a specific client"""
        return self.session.query(ModeloChamado)\
            .filter(ModeloChamado.cliente_id == cliente_id)\
            .order_by(ModeloChamado.criado_em.desc())\
            .all()

    def buscar_por_id(self, chamado_id: int) -> Optional[ModeloChamado]:
        """Get a service request by its ID"""
        return self.session.query(ModeloChamado)\
            .filter(ModeloChamado.id == chamado_id)\
            .first()

    def criar(self,
              titulo: str,
              descricao_problema: str,
              cliente_id: int,
              categoria_id: int,
              profissional_id: Optional[int] = None) -> ModeloChamado:
        """Create new service request"""
        chamado = ModeloChamado(
            titulo=titulo,
            descricao_problema=descricao_problema,
            cliente_id=cliente_id,
            categoria_id=categoria_id,
            profissional_id=profissional_id,
            status=StatusChamado.ABERTO
        )
        self.session.add(chamado)
        self.session.commit()
        self.session.refresh(chamado)
        return chamado

    def atualizar(self,
                  chamado_id: int,
                  titulo: Optional[str] = None,
                  descricao_problema: Optional[str] = None,
                  categoria_id: Optional[int] = None,
                  status: Optional[StatusChamado] = None,
                  profissional_id: Optional[int] = None) -> Optional[ModeloChamado]:
        """Update a service request by ID, only setting provided fields"""
        chamado = self.session.query(ModeloChamado)\
            .filter(ModeloChamado.id == chamado_id)\
            .first()
        if not chamado:
            return None
        if titulo is not None:
            chamado.titulo = titulo
        if descricao_problema is not None:
            chamado.descricao_problema = descricao_problema
        if categoria_id is not None:
            chamado.categoria_id = categoria_id
        if status is not None:
            chamado.status = status
        if profissional_id is not None:
            chamado.profissional_id = profissional_id
        self.session.commit()
        self.session.refresh(chamado)
        return chamado

    def deletar(self, chamado_id: int) -> bool:
        """Delete a service request by ID. Returns True if deleted, False if not found."""
        chamado = self.session.query(ModeloChamado)\
            .filter(ModeloChamado.id == chamado_id)\
            .first()
        if not chamado:
            return False
        self.session.delete(chamado)
        self.session.commit()
        return True