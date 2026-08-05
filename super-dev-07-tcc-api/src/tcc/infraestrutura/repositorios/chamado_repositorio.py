from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado, StatusChamado
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

class RepositorioChamado:
    def __init__(self, session: Session):
        self.session = session

    # ---------- Client-scoped methods ----------
    def listar_por_cliente(self, cliente_id: int) -> List[ModeloChamado]:
        """Get all service requests for a specific client"""
        return self.session.query(ModeloChamado)\
            .filter(ModeloChamado.cliente_id == cliente_id)\
            .order_by(ModeloChamado.criado_em.desc())\
            .all()

    def buscar_por_id_e_cliente(self, chamado_id: int, cliente_id: int) -> Optional[ModeloChamado]:
        """Get a service request by its ID, ensuring it belongs to the client."""
        return self.session.query(ModeloChamado)\
            .filter(
                ModeloChamado.id == chamado_id,
                ModeloChamado.cliente_id == cliente_id
            ).first()

    def atualizar_por_cliente(
        self,
        chamado_id: int,
        cliente_id: int,
        titulo: Optional[str] = None,
        descricao_problema: Optional[str] = None,
        categoria_id: Optional[int] = None,
        status: Optional[StatusChamado] = None,
        profissional_id: Optional[int] = None
    ) -> Optional[ModeloChamado]:
        """Update a service request by ID and client_id, only setting provided fields."""
        chamado = self.buscar_por_id_e_cliente(chamado_id, cliente_id)
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

    def deletar_por_cliente(self, chamado_id: int, cliente_id: int) -> bool:
        """Delete a service request by ID and client_id. Returns True if deleted, False if not found."""
        chamado = self.buscar_por_id_e_cliente(chamado_id, cliente_id)
        if not chamado:
            return False
        self.session.delete(chamado)
        self.session.commit()
        return True

    # ---------- Professional-scoped methods ----------
    def listar_por_profissional(self, profissional_id: int) -> List[ModeloChamado]:
        """Get all service requests for a specific professional"""
        return self.session.query(ModeloChamado)\
            .filter(ModeloChamado.profissional_id == profissional_id)\
            .order_by(ModeloChamado.criado_em.desc())\
            .all()

    def buscar_por_id_e_profissional(self, chamado_id: int, profissional_id: int) -> Optional[ModeloChamado]:
        """Get a service request by its ID, ensuring it belongs to the professional."""
        return self.session.query(ModeloChamado)\
            .filter(
                ModeloChamado.id == chamado_id,
                ModeloChamado.profissional_id == profissional_id
            ).first()

    def atualizar_por_profissional(
        self,
        chamado_id: int,
        profissional_id: int,
        titulo: Optional[str] = None,
        descricao_problema: Optional[str] = None,
        categoria_id: Optional[int] = None,
        status: Optional[StatusChamado] = None,
        profissional_id_novo: Optional[int] = None
    ) -> Optional[ModeloChamado]:
        """Update a service request by ID and professional_id, only setting provided fields."""
        chamado = self.buscar_por_id_e_profissional(chamado_id, profissional_id)
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
        if profissional_id_novo is not None:
            # Allow changing the assigned professional (e.g., reassign)
            chamado.profissional_id = profissional_id_novo
        self.session.commit()
        self.session.refresh(chamado)
        return chamado

    def deletar_por_profissional(self, chamado_id: int, profissional_id: int) -> bool:
        """Delete a service request by ID and professional_id. Returns True if deleted, False if not found."""
        chamado = self.buscar_por_id_e_profissional(chamado_id, profissional_id)
        if not chamado:
            return False
        self.session.delete(chamado)
        self.session.commit()
        return True

    # ---------- General methods (without ownership check) ----------
    def buscar_por_id(self, chamado_id: int) -> Optional[ModeloChamado]:
        """Get a service request by its ID (no ownership check)."""
        return self.session.query(ModeloChamado)\
            .filter(ModeloChamado.id == chamado_id)\
            .first()

    def criar(
        self,
        titulo: str,
        descricao_problema: str,
        cliente_id: int,
        categoria_id: int,
        profissional_id: Optional[int] = None,
        anexo: Optional[str] = None
    ) -> ModeloChamado:
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