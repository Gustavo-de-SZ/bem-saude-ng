from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.agendamento_repositorio import RepositorioAgendamento
from src.tcc.infraestrutura.banco_dados.modelos.modelo_agendamento import ModeloAgendamento
from src.tcc.api.schemas.agendamento_schema import AgendamentoResponse, AgendamentoUpdate, AgendamentoCreate
from src.tcc.api.auth import get_professional_user

router = APIRouter(
    prefix="/agendamentos",
    tags=["Agendamentos"]
)

@router.get(
    "",
    response_model=List[AgendamentoResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar meus agendamentos"
)
def listar_agendamentos(
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamentos = repositorio.listar_por_usuario(current_user.id)

    # Map to frontend-expected format
    return [
        AgendamentoResponse(
            id=str(agendamento.id),
            mes=agendamento.mes,
            dia=agendamento.dia,
            hora=agendamento.hora,
            titulo=agendamento.titulo,
            empresa=agendamento.empresa,
            servico=agendamento.servico,
            cliente=agendamento.cliente,
            status=agendamento.status.value,  # Convert enum to string
            duracao=agendamento.duracao,
            tipo=agendamento.tipo.value if agendamento.tipo else None
        )
        for agendamento in agendamentos
    ]

@router.post(
    "",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo agendamento"
)
def criar_agendamento(
    agendamento: AgendamentoCreate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    # Convert Pydantic model to SQLAlchemy model
    db_agendamento = ModeloAgendamento(
        dia=agendamento.dia,
        hora=agendamento.hora,
        titulo=agendamento.titulo,
        empresa=agendamento.empresa,
        servico=agendamento.servico,
        cliente=agendamento.cliente,
        status=agendamento.status,
        duracao=agendamento.duracao,
        tipo=agendamento.tipo,
        usuario_id=current_user.id
    )
    created_agendamento = repositorio.create(db_agendamento)
    return AgendamentoResponse(
        id=str(created_agendamento.id),
        mes=created_agendamento.mes,
        dia=created_agendamento.dia,
        hora=created_agendamento.hora,
        titulo=created_agendamento.titulo,
        empresa=created_agendamento.empresa,
        servico=created_agendamento.servico,
        cliente=created_agendamento.cliente,
        status=created_agendamento.status.value,
        duracao=created_agendamento.duracao,
        tipo=created_agendamento.tipo.value if created_agendamento.tipo else None
    )

@router.get(
    "/{agendamento_id}",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter meu agendamento por ID"
)
def obter_agendamento_por_id(
    agendamento_id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamento = repositorio.get_by_id_e_usuario(agendamento_id, current_user.id)
    if agendamento is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return AgendamentoResponse(
        id=str(agendamento.id),
        mes=agendamento.mes,
        dia=agendamento.dia,
        hora=agendamento.hora,
        titulo=agendamento.titulo,
        empresa=agendamento.empresa,
        servico=agendamento.servico,
        cliente=agendamento.cliente,
        status=agendamento.status.value,
        duracao=agendamento.duracao,
        tipo=agendamento.tipo.value if agendamento.tipo else None
    )

@router.get(
    "/cliente/{cliente}",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter agendamento por cliente"
)
def obter_agendamento_por_cliente(
    cliente: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamento = repositorio.get_by_cliente_e_usuario(cliente, current_user.id)
    if agendamento is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return AgendamentoResponse(
        id=str(agendamento.id),
        mes=agendamento.mes,
        dia=agendamento.dia,
        hora=agendamento.hora,
        titulo=agendamento.titulo,
        empresa=agendamento.empresa,
        servico=agendamento.servico,
        cliente=agendamento.cliente,
        status=agendamento.status.value,
        duracao=agendamento.duracao,
        tipo=agendamento.tipo.value if agendamento.tipo else None
    )

@router.get(
    "/dia/{dia}",
    response_model=List[AgendamentoResponse],
    status_code=status.HTTP_200_OK,
    summary="Obter meus agendamentos por dia"
)
def obter_agendamentos_por_dia(
    dia: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamentos = repositorio.get_by_dia_e_usuario(dia, current_user.id)
    return [
        AgendamentoResponse(
            id=str(agendamento.id),
            mes=agendamento.mes,
            dia=agendamento.dia,
            hora=agendamento.hora,
            titulo=agendamento.titulo,
            empresa=agendamento.empresa,
            servico=agendamento.servico,
            cliente=agendamento.cliente,
            status=agendamento.status.value,
            duracao=agendamento.duracao,
            tipo=agendamento.tipo.value if agendamento.tipo else None
        )
        for agendamento in agendamentos
    ]

@router.get(
    "/mes/{mes}",
    response_model=List[AgendamentoResponse],
    status_code=status.HTTP_200_OK,
    summary="Obter meus agendamentos por mês"
)
def obter_agendamentos_por_mes(
    mes: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamentos = repositorio.get_by_mes_e_usuario(mes, current_user.id)
    return [
        AgendamentoResponse(
            id=str(agendamento.id),
            mes=agendamento.mes,
            dia=agendamento.dia,
            hora=agendamento.hora,
            titulo=agendamento.titulo,
            empresa=agendamento.empresa,
            servico=agendamento.servico,
            cliente=agendamento.cliente,
            status=agendamento.status.value,
            duracao=agendamento.duracao,
            tipo=agendamento.tipo.value if agendamento.tipo else None
        )
        for agendamento in agendamentos
    ]

@router.get(
    "/search",
    response_model=List[AgendamentoResponse],
    status_code=status.HTTP_200_OK,
    summary="Buscar meus agendamentos por termo (título, cliente, empresa ou serviço)"
)
def buscar_agendamentos(
    term: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamentos = repositorio.search_e_usuario(term, current_user.id)
    return [
        AgendamentoResponse(
            id=str(agendamento.id),
            mes=agendamento.mes,
            dia=agendamento.dia,
            hora=agendamento.hora,
            titulo=agendamento.titulo,
            empresa=agendamento.empresa,
            servico=agendamento.servico,
            cliente=agendamento.cliente,
            status=agendamento.status.value,
            duracao=agendamento.duracao,
            tipo=agendamento.tipo.value if agendamento.tipo else None
        )
        for agendamento in agendamentos
    ]

@router.put(
    "/{agendamento_id}",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar meu agendamento"
)
def atualizar_agendamento(
    agendamento_id: int,
    agendamento_update: AgendamentoUpdate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    agendamento = repositorio.update(agendamento_id, current_user.id, **agendamento_update.model_dump(exclude_unset=True))
    if agendamento is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return AgendamentoResponse(
        id=str(agendamento.id),
        mes=agendamento.mes,
        dia=agendamento.dia,
        hora=agendamento.hora,
        titulo=agendamento.titulo,
        empresa=agendamento.empresa,
        servico=agendamento.servico,
        cliente=agendamento.cliente,
        status=agendamento.status.value,
        duracao=agendamento.duracao,
        tipo=agendamento.tipo.value if agendamento.tipo else None
    )

@router.delete(
    "/{agendamento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir meu agendamento"
)
def excluir_agendamento(
    agendamento_id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioAgendamento(session)
    sucesso = repositorio.delete(agendamento_id, current_user.id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return None