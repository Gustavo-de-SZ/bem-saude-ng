from sqlalchemy.orm import Session
from src.tcc.infraestrutura.banco_dados.modelos.modelo_profissional import ModeloProfissional

class RepositorioProfissional:
    def __init__(self, sessao: Session):
        self.sessao = sessao

    def criar(
        self,
        usuario_id: int,
        nome_fantasia: str | None = None,
        cnpj: str | None = None,
        telefone: str | None = None,
        descricao_servicos: str | None = None
    ) -> ModeloProfissional:
        profissional = ModeloProfissional(
            usuario_id=usuario_id,
            nome_fantasia=nome_fantasia,
            cnpj=cnpj,
            telefone=telefone,
            descricao_servicos=descricao_servicos,
            aprovado_pelo_admin=False
        )
        self.sessao.add(profissional)
        self.sessao.commit()
        self.sessao.refresh(profissional)
        return profissional

    def buscar_por_id(self, id: int) -> ModeloProfissional | None:
        return self.sessao.query(ModeloProfissional).filter(ModeloProfissional.id == id).first()

    def buscar_por_usuario_id(self, usuario_id: int) -> ModeloProfissional | None:
        return self.sessao.query(ModeloProfissional).filter(ModeloProfissional.usuario_id == usuario_id).first()

    def buscar_por_cnpj(self, cnpj: str) -> ModeloProfissional | None:
        return self.sessao.query(ModeloProfissional).filter(ModeloProfissional.cnpj == cnpj).first()

    def listar(self) -> list[ModeloProfissional]:
        return self.sessao.query(ModeloProfissional).all()

    def listar_aprovados(self) -> list[ModeloProfissional]:
        return self.sessao.query(ModeloProfissional).filter(ModeloProfissional.aprovado_pelo_admin == True).all()

    def editar(self, id: int, nome_fantasia: str | None = None, telefone: str | None = None, descricao_servicos: str | None = None) -> bool:
        profissional = self.buscar_por_id(id)
        if not profissional:
            return False

        if nome_fantasia:
            profissional.nome_fantasia = nome_fantasia
        if telefone:
            profissional.telefone = telefone
        if descricao_servicos:
            profissional.descricao_servicos = descricao_servicos

        self.sessao.commit()
        return True

    def aprovar(self, id: int) -> bool:
        profissional = self.buscar_por_id(id)
        if not profissional:
            return False

        profissional.aprovado_pelo_admin = True
        self.sessao.commit()
        return True

    def rejeitar(self, id: int) -> bool:
        profissional = self.buscar_por_id(id)
        if not profissional:
            return False

        profissional.aprovado_pelo_admin = False
        self.sessao.commit()
        return True

    def deletar(self, id: int) -> bool:
        profissional = self.buscar_por_id(id)
        if not profissional:
            return False

        self.sessao.delete(profissional)
        self.sessao.commit()
        return True