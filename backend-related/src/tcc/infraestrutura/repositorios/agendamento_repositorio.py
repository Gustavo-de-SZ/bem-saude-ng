from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..banco_dados.modelos.modelo_agendamento import ModeloAgendamento

class RepositorioAgendamento:
    def __init__(self, session: Session):
        self.session = session

    def listar_todos(self) -> List[ModeloAgendamento]:
        return self.session.query(ModeloAgendamento).all()

    def get_by_id(self, id: int) -> ModeloAgendamento:
        return self.session.query(ModeloAgendamento).filter(ModeloAgendamento.id == id).first()

    def get_by_cliente(self, cliente: str) -> ModeloAgendamento:
        return self.session.query(ModeloAgendamento).filter(ModeloAgendamento.cliente == cliente).first()

    def get_by_dia(self, dia: str) -> List[ModeloAgendamento]:
        return self.session.query(ModeloAgendamento).filter(ModeloAgendamento.dia == dia).all()

    def get_by_mes(self, mes: str) -> List[ModeloAgendamento]:
        return self.session.query(ModeloAgendamento).filter(ModeloAgendamento.mes == mes).all()

    def search_by_cliente(self, cliente: str) -> List[ModeloAgendamento]:
        return self.session.query(ModeloAgendamento).filter(ModeloAgendamento.cliente.contains(cliente)).all()

    def search(self, term: str) -> List[ModeloAgendamento]:
        return self.session.query(ModeloAgendamento).filter(
            or_(
                ModeloAgendamento.titulo.contains(term),
                ModeloAgendamento.cliente.contains(term),
                ModeloAgendamento.empresa.contains(term),
                ModeloAgendamento.servico.contains(term)
            )
        ).all()

    def create(self, agendamento: ModeloAgendamento) -> ModeloAgendamento:
        self.session.add(agendamento)
        self.session.commit()
        self.session.refresh(agendamento)
        return agendamento

    def update(self, id: int, **kwargs) -> ModeloAgendamento:
        agendamento = self.get_by_id(id)
        if agendamento:
            for key, value in kwargs.items():
                setattr(agendamento, key, value)
            self.session.commit()
            self.session.refresh(agendamento)
        return agendamento

    def delete(self, id: int) -> bool:
        agendamento = self.get_by_id(id)
        if agendamento:
            self.session.delete(agendamento)
            self.session.commit()
            return True
        return False