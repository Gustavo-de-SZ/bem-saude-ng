from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..banco_dados.modelos.modelo_transacao import ModeloTransacao

class RepositorioTransacao:
    def __init__(self, session: Session):
        self.session = session

    def listar_por_usuario(self, usuario_id: int) -> List[ModeloTransacao]:
        """Lista apenas as transações do usuário/profissional especificado."""
        return self.session.query(ModeloTransacao).filter(ModeloTransacao.usuario_id == usuario_id).all()

    def get_by_id_e_usuario(self, id: int, usuario_id: int) -> Optional[ModeloTransacao]:
        """Obtém uma transação pelo ID, garantindo que pertence ao usuário."""
        return self.session.query(ModeloTransacao).filter(
            ModeloTransacao.id == id,
            ModeloTransacao.usuario_id == usuario_id
        ).first()

    def get_by_titulo_e_usuario(self, titulo: str, usuario_id: int) -> Optional[ModeloTransacao]:
        """Obtém uma transação pelo título, garantindo que pertence ao usuário."""
        return self.session.query(ModeloTransacao).filter(
            ModeloTransacao.titulo == titulo,
            ModeloTransacao.usuario_id == usuario_id
        ).first()

    def get_by_cliente_e_usuario(self, cliente: str, usuario_id: int) -> Optional[ModeloTransacao]:
        """Obtém uma transação pelo nome do cliente, garantindo que pertence ao usuário."""
        return self.session.query(ModeloTransacao).filter(
            ModeloTransacao.cliente == cliente,
            ModeloTransacao.usuario_id == usuario_id
        ).first()

    def search_e_usuario(self, term: str, usuario_id: int) -> List[ModeloTransacao]:
        """Busca transações por termo (título ou cliente), filtrando pelo usuário."""
        return self.session.query(ModeloTransacao).filter(
            or_(
                ModeloTransacao.titulo.contains(term),
                ModeloTransacao.cliente.contains(term)
            ),
            ModeloTransacao.usuario_id == usuario_id
        ).all()

    def create(self, transacao: ModeloTransacao) -> ModeloTransacao:
        """Cria uma nova transação (o usuario_id deve já estar definido no objeto)."""
        self.session.add(transacao)
        self.session.commit()
        self.session.refresh(transacao)
        return transacao

    def update(self, id: int, usuario_id: int, **kwargs) -> Optional[ModeloTransacao]:
        """Atualiza uma transação pelo ID e usuario_id, retornando o objeto atualizado ou None se não encontrado."""
        transacao = self.get_by_id_e_usuario(id, usuario_id)
        if transacao:
            for key, value in kwargs.items():
                setattr(transacao, key, value)
            self.session.commit()
            self.session.refresh(transacao)
            return transacao
        return None

    def delete(self, id: int, usuario_id: int) -> bool:
        """Deleta uma transação pelo ID e usuario_id. Retorna True se deletado, False se não encontrado."""
        transacao = self.get_by_id_e_usuario(id, usuario_id)
        if transacao:
            self.session.delete(transacao)
            self.session.commit()
            return True
        return False