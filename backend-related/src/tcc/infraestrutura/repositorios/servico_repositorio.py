from sqlalchemy.orm import Session
from typing import List, Optional
from ..banco_dados.modelos.modelo_servico import ModeloServico

class RepositorioServico:
    def __init__(self, session: Session):
        self.session = session

    def listar_todos(self) -> List[ModeloServico]:
        return self.session.query(ModeloServico).all()

    def buscar_por_titulo(self, titulo: str) -> Optional[ModeloServico]:
        return self.session.query(ModeloServico).filter(ModeloServico.titulo == titulo).first()

    def criar(self, icone: str, titulo: str, status: str, cliente: str,
              data: str, duracao: str, valor: float) -> ModeloServico:
        servico = ModeloServico(
            icone=icone,
            titulo=titulo,
            status=status,
            cliente=cliente,
            data=data,
            duracao=duracao,
            valor=valor
        )
        self.session.add(servico)
        self.session.commit()
        self.session.refresh(servico)
        return servico

    def atualizar(self, titulo: str, icone: str = None, status: str = None,
                  cliente: str = None, data: str = None, duracao: str = None,
                  valor: float = None) -> bool:
        servico = self.buscar_por_titulo(titulo)
        if not servico:
            return False

        update_data = {}
        if icone is not None:
            update_data['icone'] = icone
        if status is not None:
            update_data['status'] = status
        if cliente is not None:
            update_data['cliente'] = cliente
        if data is not None:
            update_data['data'] = data
        if duracao is not None:
            update_data['duracao'] = duracao
        if valor is not None:
            update_data['valor'] = valor

        if update_data:
            self.session.query(ModeloServico).filter(ModeloServico.titulo == titulo).update(update_data)
            self.session.commit()
            return True
        return False

    def deletar(self, titulo: str) -> bool:
        servico = self.buscar_por_titulo(titulo)
        if not servico:
            return False

        self.session.delete(servico)
        self.session.commit()
        return True