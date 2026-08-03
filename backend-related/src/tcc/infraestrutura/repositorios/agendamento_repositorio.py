from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..banco_dados.modelos.modelo_agendamento import ModeloAgendamento

class RepositorioAgendamento:
    def __init__(self, session: Session):
        self.session = session

    def listar_por_usuario(self, usuario_id: int) -> List[ModeloAgendamento]:
        """Lista apenas os agendamentos do usuário/profissional especificado."""
        return self.session.query(ModeloAgendamento).filter(ModeloAgendamento.usuario_id == usuario_id).all()

    def get_by_id_e_usuario(self, id: int, usuario_id: int) -> Optional[ModeloAgendamento]:
        """Obtém um agendamento pelo ID, garantir que pertence ao usuário."""
        return self.session.query(ModeloAgendamento).filter(
            ModeloAgendamento.id == id,
            ModeloAgendamento.usuario_id == usuario_id
        ).first()

    def get_by_cliente_e_usuario(self, cliente: str, usuario_id: int) -> Optional[ModeloAgendamento]:
        """Obtém um agendamento pelo nome do cliente, garantindo que pertence ao usuário."""
        return self.session.query(ModeloAgendamento).filter(
            ModeloAgendamento.cliente == cliente,
            ModeloAgendamento.usuario_id == usuario_id
        ).first()

    def get_by_dia_e_usuario(self, dia: str, usuario_id: int) -> List[ModeloAgendamento]:
        """Lista agendamentos por dia, filtrando pelo usuário."""
        return self.session.query(ModeloAgendamento).filter(
            ModeloAgendamento.dia == dia,
            ModeloAgendamento.usuario_id == usuario_id
        ).all()

    def get_by_mes_e_usuario(self, mes: str, usuario_id: int) -> List[ModeloAgendamento]:
        """Lista agendamentos por mês, filtrando pelo usuário."""
        return self.session.query(ModeloAgendamento).filter(
            ModeloAgendamento.mes == mes,
            ModeloAgendamento.usuario_id == usuario_id
        ).all()

    def search_by_cliente_e_usuario(self, cliente: str, usuario_id: int) -> List[ModeloAgendamento]:
        """Busca agendamentos por parte do nome do cliente, filtrando pelo usuário."""
        return self.session.query(ModeloAgendamento).filter(
            ModeloAgendamento.cliente.contains(cliente),
            ModeloAgendamento.usuario_id == usuario_id
        ).all()

    def search_e_usuario(self, term: str, usuario_id: int) -> List[ModeloAgendamento]:
        """Busca agendamentos por termo (título, cliente, empresa, serviço), filtrando pelo usuário."""
        return self.session.query(ModeloAgendamento).filter(
            or_(
                ModeloAgendamento.titulo.contains(term),
                ModeloAgendamento.cliente.contains(term),
                ModeloAgendamento.empresa.contains(term),
                ModeloAgendamento.servico.contains(term)
            ),
            ModeloAgendamento.usuario_id == usuario_id
        ).all()

    def create(self, agendamento: ModeloAgendamento) -> ModeloAgendamento:
        """Cria um novo agendamento (o usuario_id deve já estar definido no objeto)."""
        self.session.add(agendamento)
        self.session.commit()
        self.session.refresh(agendamento)
        return agendamento

    def update(self, id: int, usuario_id: int, **kwargs) -> Optional[ModeloAgendamento]:
        """Atualiza um agendamento pelo ID e usuario_id, retornando o objeto atualizado ou None se não encontrado."""
        agendamento = self.get_by_id_e_usuario(id, usuario_id)
        if agendamento:
            for key, value in kwargs.items():
                setattr(agendamento, key, value)
            self.session.commit()
            self.session.refresh(agendamento)
            return agendamento
        return None

    def delete(self, id: int, usuario_id: int) -> bool:
        """Deleta um agendamento pelo ID e usuario_id. Retorna True se deletado, False se não encontrado."""
        agendamento = self.get_by_id_e_usuario(id, usuario_id)
        if agendamento:
            self.session.delete(agendamento)
            self.session.commit()
            return True
        return False