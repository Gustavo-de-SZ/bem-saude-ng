from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import datetime
from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil
from src.tcc.infraestrutura.banco_dados.modelos.modelo_cliente import ModeloCliente
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado

class RepositorioCliente:
    def __init__(self, sessao: Session):
        self.sessao = sessao

    def criar(self, email: str, senha_hash: str | None, nome_completo: str, telefone: str | None = None, empresa: str | None = None, avaliacao: int = 0, servicos_ativos: int = 0, servicos_concluidos: int = 0, endereco: str | None = None) -> ModeloCliente:
        usuario = ModeloUsuario(
            email=email,
            senha_hash=senha_hash,
            tipo_perfil=TipoPerfil.CLIENTE,
            ativo=True
        )
        self.sessao.add(usuario)
        self.sessao.flush()

        cliente = ModeloCliente(
            usuario_id=usuario.id,
            nome_completo=nome_completo,
            telefone=telefone,
            empresa=empresa,
            avaliacao=avaliacao,
            servicos_ativos=servicos_ativos,
            servicos_concluidos=servicos_concluidos,
            endereco=endereco
        )
        self.sessao.add(cliente)
        self.sessao.commit()
        self.sessao.refresh(cliente)
        return cliente

    def buscar_por_id(self, id: int) -> ModeloCliente | None:
        return self.sessao.query(ModeloCliente).filter(ModeloCliente.id == id).first()

    def buscar_por_usuario_id(self, usuario_id: int) -> ModeloCliente | None:
        return self.sessao.query(ModeloCliente).filter(ModeloCliente.usuario_id == usuario_id).first()

    def listar(self) -> list[ModeloCliente]:
        return self.sessao.query(ModeloCliente).all()

    def editar(self, id: int, nome_completo: str | None = None, telefone: str | None = None) -> bool:
        cliente = self.buscar_por_id(id)
        if not cliente:
            return False

        if nome_completo:
            cliente.nome_completo = nome_completo
        if telefone:
            cliente.telefone = telefone

        self.sessao.commit()
        return True

    def deletar(self, id: int) -> bool:
        cliente = self.buscar_por_id(id)
        if not cliente:
            return False

        self.sessao.delete(cliente)
        self.sessao.commit()
        return True

    def get_estatisticas(self):
        agora = datetime.datetime.now()
        ano = agora.year
        mes = agora.month

        total = self.sessao.query(func.count(ModeloCliente.id)).scalar()
        novos = self.sessao.query(func.count(ModeloCliente.id)).filter(
            extract('year', ModeloCliente.criado_em) == ano,
            extract('month', ModeloCliente.criado_em) == mes
        ).scalar()
        # Count distinct clients that have at least one chamado in current month/year
        ativos = self.sessao.query(func.count(func.distinct(ModeloChamado.cliente_id))).select_from(ModeloChamado).join(
            ModeloCliente, ModeloChamado.cliente_id == ModeloCliente.id
        ).filter(
            extract('year', ModeloChamado.criado_em) == ano,
            extract('month', ModeloChamado.criado_em) == mes
        ).scalar()

        return {
            "total": int(total or 0),
            "ativosEsteMes": int(ativos or 0),
            "novosEsteMes": int(novos or 0)
        }