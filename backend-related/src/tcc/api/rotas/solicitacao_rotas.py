from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.chamado_repositorio import RepositorioChamado
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado, StatusChamado
from src.tcc.api.schemas.chamado_schema import ChamadoCreate, ChamadoResponse, ChamadoFrontendResponse, ChamadoUpdate
from src.tcc.api.auth import get_client_user

# NOTE: Fixed 403 error by correcting router dependency in app.py

router = APIRouter(
    prefix="/solicitacoes",
    tags=["Solicitações"]
)

@router.get(
    "",
    response_model=List[ChamadoFrontendResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar minhas solicitações"
)
def listar_solicitacoes(
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_client_user)
):
    if not current_user.cliente:
        return []

    cliente_id = current_user.cliente.id
    repositorio = RepositorioChamado(session)
    chamados = repositorio.listar_por_cliente(cliente_id)

    return [
        ChamadoFrontendResponse(
            id=chamado.id,
            equipamento=chamado.titulo,
            status=chamado.status.value,
            dataCriacao=chamado.criado_em.strftime("%d/%m/%Y")
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
    current_user = Depends(get_client_user)
):
    # Verify client has a profile
    if not current_user.cliente:
        raise HTTPException(status_code=400, detail="Cliente não possui perfil de cliente")

    cliente_id = current_user.cliente.id
    repositorio = RepositorioChamado(session)
    chamado = repositorio.criar(
        titulo=dados.titulo,
        descricao_problema=dados.descricao_problema,
        categoria_id=dados.categoria_id,
        cliente_id=cliente_id,
        anexo=dados.anexo
    )
    return chamado

@router.get(
    "/{id}",
    response_model=ChamadoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter minha solicitação por ID"
)
def obter_solicitacao(
    id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_client_user)
):
    if not current_user.cliente:
        raise HTTPException(status_code=400, detail="Cliente não possui perfil de cliente")

    cliente_id = current_user.cliente.id
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id_e_cliente(id, cliente_id)
    if not chamado:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Solicitação não encontrada")
    return chamado

@router.put(
    "/{id}",
    response_model=ChamadoResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar minha solicitação"
)
def atualizar_solicitacao(
    id: int,
    dados: ChamadoUpdate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_client_user)
):
    if not current_user.cliente:
        raise HTTPException(status_code=400, detail="Cliente não possui perfil de cliente")

    cliente_id = current_user.cliente.id
    repositorio = RepositorioChamado(session)
    chamado = repositorio.atualizar_por_cliente(
        chamado_id=id,
        cliente_id=cliente_id,
        titulo=dados.titulo,
        descricao_problema=dados.descricao_problema,
        categoria_id=dados.categoria_id,
        status=dados.status
    )
    if not chamado:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Solicitação não encontrada")
    return chamado

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir minha solicitação"
)
def excluir_solicitacao(
    id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_client_user)
):
    if not current_user.cliente:
        raise HTTPException(status_code=400, detail="Cliente não possui perfil de cliente")

    cliente_id = current_user.cliente.id
    repositorio = RepositorioChamado(session)
    sucesso = repositorio.deletar_por_cliente(id, cliente_id)
    if not sucesso:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Solicitação não encontrada")
    return None