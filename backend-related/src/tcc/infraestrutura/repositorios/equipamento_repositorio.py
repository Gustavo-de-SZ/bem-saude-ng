from sqlalchemy.orm import Session
from typing import List, Optional
from ..banco_dados.modelos.modelo_equipamento import ModeloEquipamento

class RepositorioEquipamento:
    def __init__(self, session: Session):
        self.session = session

    def listar_por_cliente(self, cliente_id: int) -> List[ModeloEquipamento]:
        """Retorna apenas os equipamentos pertencentes ao cliente especificado."""
        return self.session.query(ModeloEquipamento).filter(ModeloEquipamento.cliente_id == cliente_id).all()

    def criar(self, usuario_id: int, tipo: str, marca: str, modelo: str, cliente_id: int,
              numero_serie: str = None, patrimonio: str = None,
              observacoes: str = None, data_registro: str = None) -> ModeloEquipamento:
        """Cria o equipamento vinculando-o ao usuário e cliente especificados."""
        equipamento = ModeloEquipamento(
            usuario_id=usuario_id,
            tipo=tipo,
            marca=marca,
            modelo=modelo,
            numero_serie=numero_serie,
            patrimonio=patrimonio,
            observacoes=observacoes,
            data_registro=data_registro,
            cliente_id=cliente_id
        )
        self.session.add(equipamento)
        self.session.commit()
        self.session.refresh(equipamento)
        return equipamento

    def buscar_por_id(self, equipamento_id: int) -> Optional[ModeloEquipamento]:
        """Retorna o equipamento com o ID especificado."""
        return self.session.query(ModeloEquipamento).filter(ModeloEquipamento.id == equipamento_id).first()

    def atualizar(self, equipamento_id: int, tipo: str = None, marca: str = None,
                  modelo: str = None, numero_serie: str = None, patrimonio: str = None,
                  observacoes: str = None, data_registro: str = None) -> bool:
        """Atualiza o equipamento com o ID especificado."""
        equipamento = self.buscar_por_id(equipamento_id)
        if not equipamento:
            return False

        update_data = {}
        if tipo is not None:
            update_data['tipo'] = tipo
        if marca is not None:
            update_data['marca'] = marca
        if modelo is not None:
            update_data['modelo'] = modelo
        if numero_serie is not None:
            update_data['numero_serie'] = numero_serie
        if patrimonio is not None:
            update_data['patrimonio'] = patrimonio
        if observacoes is not None:
            update_data['observacoes'] = observacoes
        if data_registro is not None:
            update_data['data_registro'] = data_registro

        if update_data:
            self.session.query(ModeloEquipamento).filter(ModeloEquipamento.id == equipamento_id).update(update_data)
            self.session.commit()
            return True
        return False

    def deletar(self, equipamento_id: int) -> bool:
        """Deleta o equipamento com o ID especificado."""
        equipamento = self.buscar_por_id(equipamento_id)
        if not equipamento:
            return False

        self.session.delete(equipamento)
        self.session.commit()
        return True