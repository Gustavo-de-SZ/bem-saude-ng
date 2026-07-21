from sqlalchemy.orm import Session
from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario

class RepositorioUsuario:
    def __init__(self, sessao: Session):
        self.sessao = sessao

    def criar(self, usuario: ModeloUsuario) -> ModeloUsuario:
        self.sessao.add(usuario)
        self.sessao.commit()
        self.sessao.refresh(usuario) 
        return usuario

    def editar(self, id: int, email: str, tipo_perfil: str):
        modelo = self.sessao.query(ModeloUsuario).filter(ModeloUsuario.id == id).first()
        if not modelo:
            return False
        
        modelo.email = email
        modelo.tipo_perfil = tipo_perfil

        self.sessao.commit()
        return True

    def remover(self, id: int):
        usuario = self.sessao.query(ModeloUsuario).filter(ModeloUsuario.id == id).first()
        if not usuario:
            return False
        
        usuario.ativo = False
        self.sessao.commit()
        return True
    
    
    def deletar(self, id: int):
        usuario = self.sessao.query(ModeloUsuario).filter(ModeloUsuario.id == id).first()
        if not usuario:
            return False
        
        self.sessao.delete(usuario)
        self.sessao.commit()
        return True

    def ativar(self, id: int):
        usuario = self.sessao.query(ModeloUsuario).filter(ModeloUsuario.id == id).first()
        if not usuario:
            return False
        
        usuario.ativo = True
        self.sessao.commit()
        return True

    def listar(self) -> list[ModeloUsuario]:
        return self.sessao.query(ModeloUsuario).order_by(ModeloUsuario.email).all()

    def buscar_por_email(self, email: str) -> ModeloUsuario | None:
        return self.sessao.query(ModeloUsuario).filter(ModeloUsuario.email == email).first()

    def buscar_por_id(self, id: int) -> ModeloUsuario | None:
        return self.sessao.query(ModeloUsuario).filter(ModeloUsuario.id == id).first()

    def buscar_por_email(self, email: str) -> ModeloUsuario | None:
        return self.sessao.query(ModeloUsuario).filter(ModeloUsuario.email == email).first()