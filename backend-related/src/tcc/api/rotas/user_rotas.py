from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional

from src.tcc.api.schemas.usuario_schema import UsuarioCriarRequest, UsuarioAlterarRequest, UsuarioResponse

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

@router.post(
    "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo usuario"
)
def criar_usuario(
    dados: UsuarioCriarRequest,
    session: Session = Depends(obter_sessao)
):

    usuario = ModeloUsuario(
        email=dados.email,
        senha_hash=dados.senha,
        tipo_perfil=dados.tipo_perfil.value,
        ativo=True
    )
    repositorio = RepositorioUsuario(session)
    usuario_criado = repositorio.criar(usuario)
    return usuario_criado

@router.get(
    "",
    response_model=list[UsuarioResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar usuarios"
)
def listar_usuarios(session: Session = Depends(obter_sessao)):
    repositorio = RepositorioUsuario(session)
    usuarios = repositorio.listar()
    return usuarios

@router.get(
    "/{id}",
    response_model=UsuarioResponse,
    status_code=status.HTTP_200_OK,
    summary="Buscar usuario filtrando pelo ID"
)
def buscar_usuario(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioUsuario(session)
    usuario = repositorio.buscar_por_id(id)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario não encontrado")
    return usuario

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Inativar/usuario"
)
def inativar_usuario(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioUsuario(session)
    inativou = repositorio.remover(id)
    if not inativou:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario não encontrado")

def deletar_usuario(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioUsuario(session)
    deletou = repositorio.deletar(id)
    if not deletou:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario não encontrado")

@router.delete(
    "/{id}/deletar",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar usuario"
)
@router.put(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Alterar dados do usuario"
)
def alterar_usuario(id: int, dados: UsuarioAlterarRequest, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioUsuario(session)
    alterou = repositorio.editar(id, dados.email, dados.tipo_perfil.value)
    if not alterou:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario não encontrado")

@router.put(
    "/{id}/ativar",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Ativar usuario"
)
def ativar_usuario(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioUsuario(session)
    ativou = repositorio.ativar(id)
    if not ativou:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario não encontrado.")

@router.get(
    "/perfil/verificar",
    status_code=status.HTTP_200_OK,
    summary="Verificar se o usuario autenticado possui perfil de cliente ou tecnico"
)
def verificar_perfil(
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    email = token_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Token invalido: email nao encontrado")

    # Buscar usuario pelo email
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_email(email)
    if not usuario:
        # Usuario nao existe localmente ainda, entao nao tem perfil
        return {"exists": False, "type": None}

    # Verificar se tem perfil de cliente
    cliente_repo = RepositorioCliente(session)
    cliente = cliente_repo.buscar_por_usuario_id(usuario.id)
    if cliente:
        return {"exists": True, "type": "cliente"}

    # Verificar se tem perfil de tecnico (profissional)
    profissional_repo = RepositorioProfissional(session)
    profissional = profissional_repo.buscar_por_usuario_id(usuario.id)
    if profissional:
        return {"exists": True, "type": "tecnico"}

    # Nenhum perfil encontrado
    return {"exists": False, "type": None}