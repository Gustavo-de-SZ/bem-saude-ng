from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from ..banco_dados.modelos.modelo_transacao import ModeloTransacao

class RepositorioTransacao:
    def __init__(self, session: Session):
        self.session = session

    def listar_todos(self) -> List[ModeloTransacao]:
        return self.session.query(ModeloTransacao).all()

    def get_by_id(self, id: int) -> ModeloTransacao:
        return self.session.query(ModeloTransacao).filter(ModeloTransacao.id == id).first()

    def get_by_titulo(self, titulo: str) -> ModeloTransacao:
        return self.session.query(ModeloTransacao).filter(ModeloTransacao.titulo == titulo).first()

    def get_by_cliente(self, cliente: str) -> ModeloTransacao:
        return self.session.query(ModeloTransacao).filter(ModeloTransacao.cliente == cliente).first()

    def search(self, term: str) -> List[ModeloTransacao]:
        return self.session.query(ModeloTransacao).filter(
            or_(
                ModeloTransacao.titulo.contains(term),
                ModeloTransacao.cliente.contains(term)
            )
        ).all()

    def create(self, transacao: ModeloTransacao) -> ModeloTransacao:
        self.session.add(transacao)
        self.session.commit()
        self.session.refresh(transacao)
        return transacao

    def update(self, id: int, **kwargs) -> ModeloTransacao:
        transacao = self.get_by_id(id)
        if transacao:
            for key, value in kwargs.items():
                setattr(transacao, key, value)
            self.session.commit()
            self.session.refresh(transacao)
        return transacao

    def delete(self, id: int) -> bool:
        transacao = self.get_by_id(id)
        if transacao:
            self.session.delete(transacao)
            self.session.commit()
            return True
        return False