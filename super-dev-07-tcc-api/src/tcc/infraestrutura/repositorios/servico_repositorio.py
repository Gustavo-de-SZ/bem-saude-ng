from sqlalchemy.orm import Session
from typing import List, Optional
from ..banco_dados.modelos.modelo_servico import ModeloServico

class RepositorioServico:
    def __init__(self, session: Session):
        self.session = session

    def listar_por_usuario(self, usuario_id: int) -> List[ModeloServico]:
        """Retorna apenas os serviços criados por este usuário/técnico específico."""
        return self.session.query(ModeloServico).filter(ModeloServico.usuario_id == usuario_id).all()

    def criar(self, usuario_id: int, icone: str, titulo: str, status: str, cliente: str,
              data: str, duracao: str, valor: float, equipamento_id: int = None) -> ModeloServico:
        """Cria o serviço vinculando-o ao ID do técnico logado."""
        servico = ModeloServico(
            usuario_id=usuario_id,
            icone=icone,
            titulo=titulo,
            status=status,
            cliente=cliente,
            data=data,
            duracao=duracao,
            valor=valor,
            equipamento_id=equipamento_id
        )
        self.session.add(servico)
        self.session.commit()
        self.session.refresh(servico)
        return servico

    def buscar_por_titulo_e_usuario(self, titulo: str, usuario_id: int) -> Optional[ModeloServico]:
        """Retorna o serviço com o título especificado que pertence ao usuário dado."""
        return self.session.query(ModeloServico).filter(
            ModeloServico.titulo == titulo,
            ModeloServico.usuario_id == usuario_id
        ).first()

    def atualizar(self, titulo: str, usuario_id: int, icone: str = None, status: str = None,
                  cliente: str = None, data: str = None, duracao: str = None,
                  valor: float = None, equipamento_id: int = None) -> bool:
        """Atualiza o serviço com o título especificado que pertence ao usuário dado."""
        servico = self.buscar_por_titulo_e_usuario(titulo, usuario_id)
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
        if equipamento_id is not None:
            update_data['equipamento_id'] = equipamento_id

        if update_data:
            self.session.query(ModeloServico).filter(ModeloServico.id == servico.id).update(update_data)
            self.session.commit()
            return True
        return False

    def deletar(self, titulo: str, usuario_id: int) -> bool:
        """Deleta o serviço com o título especificado que pertence ao usuário dado."""
        servico = self.buscar_por_titulo_e_usuario(titulo, usuario_id)
        if not servico:
            return False

        self.session.delete(servico)
        self.session.commit()
        return True