from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_notificacao import ModeloNotificacao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_cliente import ModeloCliente
from src.tcc.infraestrutura.repositorios.servico_repositorio import RepositorioServico
from src.tcc.api.schemas.servico_schema import ServicoCreate, ServicoResponse, ServicoUpdate
from src.tcc.infraestrutura.banco_dados.modelos.modelo_servico import ServicoStatusEnum
from src.tcc.api.auth import get_professional_user

router = APIRouter(
    prefix="/servicos",
    tags=["Serviços"]
)

@router.get(
    "",
    response_model=List[ServicoResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar meus serviços"
)
def listar_servicos(
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioServico(session)
    servicos = repositorio.listar_por_usuario(current_user.id)
    return servicos

@router.get(
    "/{titulo}",
    response_model=ServicoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter meu serviço por título"
)
def obter_servico(
    titulo: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioServico(session)
    servico = repositorio.buscar_por_titulo_e_usuario(titulo, current_user.id)
    if not servico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    return servico

@router.post(
    "",
    response_model=ServicoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo serviço"
)
def criar_servico(
    dados: ServicoCreate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):

    try:
        status_enum = ServicoStatusEnum(dados.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Valores permitidos: {[e.value for e in ServicoStatusEnum]}"
        )

    repositorio = RepositorioServico(session)
    servico = repositorio.criar(
        usuario_id=current_user.id,
        icone=dados.icone,
        titulo=dados.titulo,
        status=dados.status,
        cliente=dados.cliente,
        data=dados.data,
        duracao=dados.duracao,
        valor=dados.valor,
        equipamento_id=dados.equipamento_id
    )
    return servico

@router.put(
    "/{titulo}",
    response_model=ServicoResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar serviço existente"
)
def atualizar_servico(
    titulo: str,
    dados: ServicoUpdate,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioServico(session)

    if dados.status is not None:
        try:
            ServicoStatusEnum(dados.status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status inválido. Valores permitidos: {[e.value for e in ServicoStatusEnum]}"
            )

    sucesso = repositorio.atualizar(
        titulo=titulo,
        usuario_id=current_user.id,
        icone=dados.icone,
        status=dados.status,
        cliente=dados.cliente,
        data=dados.data,
        duracao=dados.duracao,
        valor=dados.valor,
        equipamento_id=dados.equipamento_id
    )

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    servico_atualizado = repositorio.buscar_por_titulo_e_usuario(titulo, current_user.id)
    if not servico_atualizado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado após atualização"
        )
        
    # Send notification to the client if the client is registered
    try:
        # Match client by name - if there is a matching user_id we create notification
        cliente_modelo = session.query(ModeloCliente).filter(ModeloCliente.nome_completo == servico_atualizado.cliente).first()
        if cliente_modelo and cliente_modelo.usuario_id:
            notificacao = ModeloNotificacao(
                usuario_id=cliente_modelo.usuario_id,
                titulo=f"Status do Serviço Atualizado",
                mensagem=f"O serviço '{servico_atualizado.titulo}' mudou para: {servico_atualizado.status.value}",
                tipo="info" if servico_atualizado.status.value != 'Concluído' else "success"
            )
            session.add(notificacao)
            session.commit()
    except Exception as e:
        print(f"Error creating notification: {e}")

    return servico_atualizado

@router.delete(
    "/{titulo}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir serviço"
)
def deletar_servico(
    titulo: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    repositorio = RepositorioServico(session)
    sucesso = repositorio.deletar(titulo, current_user.id)

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    return None