from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.infraestrutura.repositorios.favorito_repositorio import RepositorioFavorito
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.api.schemas.profissional_schema import ProfissionalCriarRequest, ProfissionalResponse
from src.tcc.api.auth import verify_token

router = APIRouter(
    prefix="/profissionais",
    tags=["Profissionais"]
)

@router.post(
    "",
    response_model=ProfissionalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo profissional"
)
def criar_profissional(
    dados: ProfissionalCriarRequest,
    session: Session = Depends(obter_sessao)
):
        repositorio = RepositorioProfissional(session)
        profissional = repositorio.criar(
            email=dados.email,
            senha_hash=dados.senha,
            nome_fantasia=dados.nome_fantasia,
            cpf=dados.cpf,
            telefone=dados.telefone,
            descricao_servicos=dados.descricao_servicos
        )
        return ProfissionalResponse(
            id=profissional.id,
            usuario_id=profissional.usuario_id,
            nome_fantasia=profissional.nome_fantasia,
            cpf=profissional.cpf,
            telefone=profissional.telefone,
            descricao_servicos=profissional.descricao_servicos,
            aprovado_pelo_admin=profissional.aprovado_pelo_admin,
            criado_em=profissional.criado_em,
            email=profissional.usuario.email
        )
    


@router.get(
    "",
    response_model=list[ProfissionalResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar profissionais"
)
def listar_profissionais(session: Session = Depends(obter_sessao)):
    repositorio = RepositorioProfissional(session)
    profissionais = repositorio.listar()
    return [
        ProfissionalResponse(
            id=profissional.id,
            usuario_id=profissional.usuario_id,
            nome_fantasia=profissional.nome_fantasia,
            cpf=profissional.cpf,
            telefone=profissional.telefone,
            descricao_servicos=profissional.descricao_servicos,
            aprovado_pelo_admin=profissional.aprovado_pelo_admin,
            criado_em=profissional.criado_em,
            email=profissional.usuario.email
        )
        for profissional in profissionais
    ]

@router.get(
    "/aprovados",
    response_model=list[ProfissionalResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar profissionais aprovados"
)
def listar_profissionais_aprovados(session: Session = Depends(obter_sessao)):
    repositorio = RepositorioProfissional(session)
    profissionais = repositorio.listar_aprovados()
    return [
        ProfissionalResponse(
            id=profissional.id,
            usuario_id=profissional.usuario_id,
            nome_fantasia=profissional.nome_fantasia,
            cpf=profissional.cpf,
            telefone=profissional.telefone,
            descricao_servicos=profissional.descricao_servicos,
            aprovado_pelo_admin=profissional.aprovado_pelo_admin,
            criado_em=profissional.criado_em,
            email=profissional.usuario.email
        )
        for profissional in profissionais
    ]

@router.get(
    "/{id}",
    response_model=ProfissionalResponse,
    status_code=status.HTTP_200_OK,
    summary="Buscar profissional por ID"
)
def buscar_profissional(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioProfissional(session)
    profissional = repositorio.buscar_por_id(id)
    if not profissional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    return ProfissionalResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cpf=profissional.cpf,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )

@router.patch(
    "/{id}/aprovar",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Aprovar profissional pelo admin"
)
def aprovar_profissional(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioProfissional(session)
    aprovou = repositorio.aprovar(id)
    if not aprovou:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )

@router.patch(
    "/{id}/rejeitar",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Rejeitar profissional"
)
def rejeitar_profissional(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioProfissional(session)
    rejeitou = repositorio.rejeitar(id)
    if not rejeitou:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar profissional"
)
def deletar_profissional(id: int, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioProfissional(session)
    deletou = repositorio.deletar(id)
    if not deletou:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )

@router.post(
    "/{id}/favoritar",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Marcar profissional como favorito"
)
def favoritar_profissional(
    id: int,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Get user email from token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token: missing email")

    # Get user by email
    usuario_repositorio = RepositorioUsuario(session)
    usuario = usuario_repositorio.buscar_por_email(user_email)
    if not usuario:
        raise HTTPException(status_code=404, detail="User not found")

    # Get client by user ID
    cliente_repositorio = RepositorioCliente(session)
    cliente = cliente_repositorio.buscar_por_usuario_id(usuario.id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Client profile not found for user")

    cliente_id = cliente.id
    repositorio_favorito = RepositorioFavorito(session)
    repositorio_profissional = RepositorioProfissional(session)

    profissional = repositorio_profissional.buscar_por_id(id)
    if not profissional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )

    favorito = repositorio_favorito.adicionar_favorito(cliente_id, id)
    return {"message": "Profissional marcado como favorito"}

@router.delete(
    "/{id}/favoritar",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Remover profissional dos favoritos"
)
def desfavoritar_profissional(
    id: int,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Get user email from token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token: missing email")

    # Get user by email
    usuario_repositorio = RepositorioUsuario(session)
    usuario = usuario_repositorio.buscar_por_email(user_email)
    if not usuario:
        raise HTTPException(status_code=404, detail="User not found")

    # Get client by user ID
    cliente_repositorio = RepositorioCliente(session)
    cliente = cliente_repositorio.buscar_por_usuario_id(usuario.id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Client profile not found for user")

    cliente_id = cliente.id
    repositorio_favorito = RepositorioFavorito(session)
    repositorio_profissional = RepositorioProfissional(session)

    profissional = repositorio_profissional.buscar_por_id(id)
    if not profissional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )

    removido = repositorio_favorito.remover_favorito(cliente_id, id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profissional não estava nos favoritos"
        )

    return {"message": "Profissional removido dos favoritos"}

@router.get(
    "/favoritos",
    response_model=List[ProfissionalResponse],  # REUSE EXISTING SCHEMA
    status_code=status.HTTP_200_OK,
    summary="Listar profissionais favoritos do cliente"
)
def listar_favoritos(session: Session = Depends(obter_sessao), token_data: dict = Depends(verify_token)):
    # Get user email from token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token: missing email")

    # Get user by email
    usuario_repositorio = RepositorioUsuario(session)
    usuario = usuario_repositorio.buscar_por_email(user_email)
    if not usuario:
        raise HTTPException(status_code=404, detail="User not found")

    # Get client by user ID
    cliente_repositorio = RepositorioCliente(session)
    cliente = cliente_repositorio.buscar_por_usuario_id(usuario.id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Client profile not found for user")

    cliente_id = cliente.id
    repositorio_favorito = RepositorioFavorito(session)
    profissionais = repositorio_favorito.listar_favoritos_por_cliente(cliente_id)

    return [
        ProfissionalResponse(
            id=p.id,
            usuario_id=p.usuario_id,
            nome_fantasia=p.nome_fantasia,
            cpf=p.cpf,
            telefone=p.telefone,
            descricao_servicos=p.descricao_servicos,
            aprovado_pelo_admin=p.aprovado_pelo_admin,
            criado_em=p.criado_em,
            email=p.usuario.email
        )
        for p in profissionais
    ]
