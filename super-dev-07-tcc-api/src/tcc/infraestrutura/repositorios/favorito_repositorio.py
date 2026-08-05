from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_favorito import ModeloFavorito
from src.tcc.infraestrutura.banco_dados.modelos.modelo_profissional import ModeloProfissional
from sqlalchemy.orm import Session
from typing import List

class RepositorioFavorito:
    def __init__(self, session: Session):
        self.session = session

    def adicionar_favorito(self, cliente_id: int, profissional_id: int) -> ModeloFavorito:
        """Add professional to client's favorites"""
        existente = self.session.query(ModeloFavorito).filter(
            ModeloFavorito.cliente_id == cliente_id,
            ModeloFavorito.profissional_id == profissional_id
        ).first()

        if existente:
            return existente  

        favorito = ModeloFavorito(
            cliente_id=cliente_id,
            profissional_id=profissional_id
        )
        self.session.add(favorito)
        self.session.commit()
        self.session.refresh(favorito)
        return favorito

    def remover_favorito(self, cliente_id: int, profissional_id: int) -> bool:
        """Remove professional from client's favorites"""
        favorito = self.session.query(ModeloFavorito).filter(
            ModeloFavorito.cliente_id == cliente_id,
            ModeloFavorito.profissional_id == profissional_id
        ).first()

        if favorito:
            self.session.delete(favorito)
            self.session.commit()
            return True
        return False

    def listar_favoritos_por_cliente(self, cliente_id: int) -> List[ModeloProfissional]:
        """Get all favorited professionals for a client"""
        return self.session.query(ModeloProfissional)\
            .join(ModeloFavorito, ModeloProfissional.id == ModeloFavorito.profissional_id)\
            .filter(ModeloFavorito.cliente_id == cliente_id)\
            .all()

    def eh_favorito(self, cliente_id: int, profissional_id: int) -> bool:
        """Check if professional is favorited by client"""
        return self.session.query(ModeloFavorito).filter(
            ModeloFavorito.cliente_id == cliente_id,
            ModeloFavorito.profissional_id == profissional_id
        ).first() is not None