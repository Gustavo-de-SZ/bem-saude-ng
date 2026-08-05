from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.chamado_repositorio import RepositorioChamado
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado, StatusChamado
from src.tcc.api.schemas.chamado_schema import ChamadoCreate, ChamadoResponse, ChamadoFrontendResponse, ChamadoUpdate
from src.tcc.api.auth import get_client_user, require_any_profile

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
    current_user = Depends(require_any_profile(["CLIENTE", "PROFISSIONAL"]))
):
    repositorio = RepositorioChamado(session)
    user_profile = current_user.tipo_perfil.value if hasattr(current_user.tipo_perfil, 'value') else current_user.tipo_perfil

    if user_profile == 'CLIENTE' and current_user.cliente:
        chamados = repositorio.listar_por_cliente(current_user.cliente.id)
    elif user_profile == 'PROFISSIONAL' and current_user.profissional:
        chamados = repositorio.listar_por_profissional(current_user.profissional.id)
    else:
        return []

    return [
        ChamadoFrontendResponse(
            id=chamado.id,
            equipamento=chamado.titulo,
            titulo=chamado.titulo,
            status=chamado.status.value,
            dataCriacao=chamado.criado_em.strftime("%d/%m/%Y"),
            data_criacao=chamado.criado_em.strftime("%d/%m/%Y"),
            descricao_problema=chamado.descricao_problema,
            cliente_nome=chamado.cliente.nome_completo if chamado.cliente else "Cliente",
            profissional_nome=chamado.profissional.nome_fantasia if chamado.profissional else "Técnico"
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
    if not current_user.cliente:
        raise HTTPException(status_code=400, detail="Cliente não possui perfil de cliente")

    cliente_id = current_user.cliente.id

    repositorio = RepositorioChamado(session)
    chamado = repositorio.criar(
        titulo=dados.titulo,
        descricao_problema=dados.descricao_problema,
        cliente_id=cliente_id,
        categoria_id=dados.categoria_id,
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
    current_user = Depends(require_any_profile(["CLIENTE", "PROFISSIONAL"]))
):
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id(id)

    if not chamado:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Solicitação não encontrada")

    # Authorization check
    user_profile = current_user.tipo_perfil.value if hasattr(current_user.tipo_perfil, 'value') else current_user.tipo_perfil
    if user_profile == 'CLIENTE' and chamado.cliente_id != current_user.cliente.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Não autorizado")
    if user_profile == 'PROFISSIONAL' and chamado.profissional_id != current_user.profissional.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Não autorizado")

    # Adicionar os nomes para o frontend
    chamado.cliente_nome = chamado.cliente.nome_completo if chamado.cliente else "Cliente"
    chamado.profissional_nome = chamado.profissional.nome_fantasia if chamado.profissional else "Técnico"
    
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

@router.get(
    "/abertas/disponiveis",
    response_model=List[ChamadoFrontendResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar solicitações abertas (sem profissional)"
)
def listar_solicitacoes_abertas(
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL"]))
):
    chamados = session.query(ModeloChamado).filter(ModeloChamado.profissional_id == None).order_by(ModeloChamado.criado_em.desc()).all()
    return [
        ChamadoFrontendResponse(
            id=chamado.id,
            equipamento=chamado.titulo,
            titulo=chamado.titulo,
            status=chamado.status.value,
            dataCriacao=chamado.criado_em.strftime("%d/%m/%Y"),
            data_criacao=chamado.criado_em.strftime("%d/%m/%Y"),
            descricao_problema=chamado.descricao_problema,
            cliente_nome=chamado.cliente.nome_completo if chamado.cliente else "Cliente",
            profissional_nome=chamado.profissional.nome_fantasia if chamado.profissional else "Técnico"
        )
        for chamado in chamados
    ]

@router.post(
    "/{id}/aceitar",
    response_model=ChamadoResponse,
    status_code=status.HTTP_200_OK,
    summary="Aceitar uma solicitação"
)
def aceitar_solicitacao(
    id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL"]))
):
    if not current_user.profissional:
        raise HTTPException(status_code=400, detail="Usuário não possui perfil de profissional")
        
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id(id)
    
    if not chamado:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Solicitação não encontrada")
        
    if chamado.profissional_id is not None:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Solicitação já foi aceita por outro profissional")
        
    chamado.profissional_id = current_user.profissional.id
    chamado.status = StatusChamado.EM_ANDAMENTO
    
    session.commit()
    session.refresh(chamado)
    
    chamado.cliente_nome = chamado.cliente.nome_completo if chamado.cliente else "Cliente"
    chamado.profissional_nome = chamado.profissional.nome_fantasia if chamado.profissional else "Técnico"
    
    return chamado

@router.post(
    "/{id}/concluir",
    response_model=ChamadoResponse,
    status_code=status.HTTP_200_OK,
    summary="Concluir uma solicitação"
)
def concluir_solicitacao(
    id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL"]))
):
    if not current_user.profissional:
        raise HTTPException(status_code=400, detail="Usuário não possui perfil de profissional")
        
    repositorio = RepositorioChamado(session)
    chamado = repositorio.buscar_por_id(id)
    
    if not chamado:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Solicitação não encontrada")
        
    if chamado.profissional_id != current_user.profissional.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Apenas o profissional que aceitou o chamado pode concluí-lo")
        
    chamado.status = StatusChamado.CONCLUIDO
    
    session.commit()
    session.refresh(chamado)
    
    chamado.cliente_nome = chamado.cliente.nome_completo if chamado.cliente else "Cliente"
    chamado.profissional_nome = chamado.profissional.nome_fantasia if chamado.profissional else "Técnico"
    
    return chamado
