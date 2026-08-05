from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_categoria_servico import ModeloCategoriaServico
from sqlalchemy.orm import Session
from typing import List

class RepositorioCategoria:
    def __init__(self, session: Session):
        self.session = session

    def listar_nomes(self) -> List[str]:
        """Returns ONLY category names as strings (for frontend)"""
        return [c.nome for c in self.session.query(ModeloCategoriaServico.nome).all()]