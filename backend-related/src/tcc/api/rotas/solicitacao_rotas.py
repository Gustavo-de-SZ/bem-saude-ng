from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.chamado_repositorio import RepositorioChamado
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.api.schemas.chamado_schema import ChamadoCreate, ChamadoResponse, ChamadoFrontendResponse, ChamadoUpdate
from src.tcc.api.auth import verify_token

router = APIRouter(
    prefix="/solicitacoes",
    tags=["Solicitações"]
)

@router.get(
    "",
    response_model=List[ChamadoFrontendResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar solicitações do cliente"
)
def listar_solicitacoes(session: Session = Depends(obter_sessao), token_data: dict = Depends(verify_token)):
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
    repositorio = RepositorioChamado(session)
    chamados = repositorio.listar_por_cliente(cliente_id)

    # MAP to frontend expected format
    return [
        ChamadoFrontendResponse(
            id=chamado.id,
            equipamento=chamado.titulo,  # <-- MAP titulo -> equipamento
            status=chamado.status.value, # <-- MAP enum -> string
            dataCriacao=chamado.criado_em.strftime("%d/%m/%Y")  # <-- FORMAT DATE
        )
        for chamado in chamados
    ]

@router.post(
    "",
    response_model=ChamadoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar nova solicitação"
)
def criar_solicitacao(
    dados: ChamadoCreate,
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

    # GET CLIENT ID FROM CONTEXT (NOW PROPERLY AUTHENTICATED)
    cliente_id = cliente.id

    # YOU NEED TO GET categoria_id FROM FRONTEND PAYLOAD OR CONTEXT
    # For now, assume frontend sends it (adjust as needed)
    categoria_id = dados.categoria_id

    repositorio = RepositorioChamado(session)
    chamado = repositorio.criar(
        titulo=dados.titulo,
        descricao_problema=dados.descricao_problema,
        cliente_id=cliente_id,
        categoria_id=categoria_id
        # profissional_id=None by default
    )
    return chamado


@router.get(
    "/{id}",
    response_model=ChamadoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter solicitação por ID"
)
def obter_solicitacao(
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
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id(id)
    if not chamado or chamado.cliente_id != cliente_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitação não encontrada")
    return chamado


@router.put(
    "/{id}",
    response_model=ChamadoResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar solicitação"
)
def atualizar_solicitacao(
    id: int,
    dados: ChamadoUpdate,
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
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id(id)
    if not chamado or chamado.cliente_id != cliente_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitação não encontrada")

    # Update only provided fields
    update_data = dados.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chamado, field, value)

    session.commit()
    session.refresh(chamado)
    return chamado


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir solicitação"
)
def excluir_solicitacao(
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
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id(id)
    if not chamado or chamado.cliente_id != cliente_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitação não encontrada")

    sucesso = repositorio.deletar(id)
    if not sucesso:
        # Should not happen if we found the chamado, but just in case
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitação não encontrada")
    return None