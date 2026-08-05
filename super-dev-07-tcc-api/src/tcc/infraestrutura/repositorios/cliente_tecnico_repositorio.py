from typing import List
from sqlalchemy.orm import Session
from ..banco_dados.modelos.modelo_cliente_tecnico import ModeloClienteTecnico
from ..banco_dados.modelos.modelo_cliente import ModeloCliente
from ..banco_dados.modelos.modelo_profissional import ModeloProfissional


class ClienteTecnicoRepository:
    def __init__(self, session: Session):
        self.session = session

    def adicionar_vinculo(self, cliente_id: int, profissional_id: int) -> ModeloClienteTecnico:
        """Create a client-professional link"""
        # Check if link already exists
        existente = self.session.query(ModeloClienteTecnico).filter(
            ModeloClienteTecnico.cliente_id == cliente_id,
            ModeloClienteTecnico.profissional_id == profissional_id
        ).first()

        if existente:
            return existente

        vinculo = ModeloClienteTecnico(
            cliente_id=cliente_id,
            profissional_id=profissional_id
        )
        self.session.add(vinculo)
        self.session.commit()
        self.session.refresh(vinculo)
        return vinculo

    def remover_vinculo(self, cliente_id: int, profissional_id: int) -> bool:
        """Remove client-professional link"""
        vinculo = self.session.query(ModeloClienteTecnico).filter(
            ModeloClienteTecnico.cliente_id == cliente_id,
            ModeloClienteTecnico.profissional_id == profissional_id
        ).first()

        if vinculo:
            self.session.delete(vinculo)
            self.session.commit()
            return True
        return False

    def listar_clientes_por_profissional(self, profissional_id: int) -> List[ModeloCliente]:
        """Get all clients for a professional"""
        return self.session.query(ModeloCliente)\
            .join(ModeloClienteTecnico, ModeloCliente.id == ModeloClienteTecnico.cliente_id)\
            .filter(ModeloClienteTecnico.profissional_id == profissional_id)\
            .all()

    def listar_profissionais_por_cliente(self, cliente_id: int) -> List[ModeloProfissional]:
        """Get all professionals for a client"""
        return self.session.query(ModeloProfissional)\
            .join(ModeloClienteTecnico, ModeloProfissional.id == ModeloClienteTecnico.profissional_id)\
            .filter(ModeloClienteTecnico.cliente_id == cliente_id)\
            .all()

    def eh_vinculado(self, cliente_id: int, profissional_id: int) -> bool:
        """Check if client is linked to professional"""
        return self.session.query(ModeloClienteTecnico).filter(
            ModeloClienteTecnico.cliente_id == cliente_id,
            ModeloClienteTecnico.profissional_id == profissional_id
        ).first() is not None