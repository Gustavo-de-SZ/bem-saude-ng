from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.transacao_repositorio import RepositorioTransacao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_transacao import ModeloTransacao
from src.tcc.api.schemas.transacao_schema import TransacaoResponse, TransacaoUpdate, TransacaoCreate
from src.tcc.api.auth import get_professional_user

router = APIRouter(
    prefix="/transacoes",
    tags=["Transações"]
)

@router.get(
    "",
    response_model=List[TransacaoResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar minhas transações"
)
def listar_transacoes(
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    transacoes = repositorio.listar_por_usuario(current_user.id)
    return transacoes

@router.post(
    "",
    response_model=TransacaoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar nova transação"
)
def criar_transacao(
    transacao: TransacaoCreate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    # Convert Pydantic model to SQLAlchemy model
    db_transacao = ModeloTransacao(
        titulo=transacao.titulo,
        cliente=transacao.cliente,
        data=transacao.data,
        valor=transacao.valor,
        status=transacao.status,
        usuario_id=current_user.id
    )
    created_transacao = repositorio.create(db_transacao)
    return TransacaoResponse(
        id=created_transacao.id,
        titulo=created_transacao.titulo,
        cliente=created_transacao.cliente,
        data=created_transacao.data,
        valor=float(created_transacao.valor),
        status=created_transacao.status.value
    )

@router.get(
    "/{transacao_id}",
    response_model=TransacaoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter minha transação por ID"
)
def obter_transacao_por_id(
    transacao_id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    transacao = repositorio.get_by_id_e_usuario(transacao_id, current_user.id)
    if transacao is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao

@router.get(
    "/titulo/{titulo}",
    response_model=TransacaoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter minha transação por título"
)
def obter_transacao_por_titulo(
    titulo: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    transacao = repositorio.get_by_titulo_e_usuario(titulo, current_user.id)
    if transacao is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao

@router.get(
    "/cliente/{cliente}",
    response_model=TransacaoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter minha transação por cliente"
)
def obter_transacao_por_cliente(
    cliente: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    transacao = repositorio.get_by_cliente_e_usuario(cliente, current_user.id)
    if transacao is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao

@router.get(
    "/search",
    response_model=List[TransacaoResponse],
    status_code=status.HTTP_200_OK,
    summary="Buscar minhas transações por termo (título ou cliente)"
)
def buscar_transacoes(
    term: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    transacoes = repositorio.search_e_usuario(term, current_user.id)
    return transacoes

@router.put(
    "/{transacao_id}",
    response_model=TransacaoResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar minha transação"
)
def atualizar_transacao(
    transacao_id: int,
    transacao_update: TransacaoUpdate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    transacao = repositorio.update(transacao_id, current_user.id, **transacao_update.model_dump(exclude_unset=True))
    if transacao is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao

@router.delete(
    "/{transacao_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir minha transação"
)
def excluir_transacao(
    transacao_id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioTransacao(session)
    sucesso = repositorio.delete(transacao_id, current_user.id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return None