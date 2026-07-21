from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.servico_repositorio import RepositorioServico
from src.tcc.api.schemas.servico_schema import ServicoCreate, ServicoResponse, ServicoUpdate
from src.tcc.infraestrutura.banco_dados.modelos.modelo_servico import ServicoStatusEnum

router = APIRouter(
    prefix="/servicos",
    tags=["Serviços"]
)

@router.get(
    "",
    response_model=List[ServicoResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar todos os serviços"
)
def listar_servicos(session: Session = Depends(obter_sessao)):
    repositorio = RepositorioServico(session)
    servicos = repositorio.listar_todos()
    return servicos

@router.get(
    "/{titulo}",
    response_model=ServicoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter serviço por título"
)
def obter_servico(titulo: str, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioServico(session)
    servico = repositorio.buscar_por_titulo(titulo)
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
    session: Session = Depends(obter_sessao)
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
        icone=dados.icone,
        titulo=dados.titulo,
        status=dados.status,
        cliente=dados.cliente,
        data=dados.data,
        duracao=dados.duracao,
        valor=dados.valor
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
    session: Session = Depends(obter_sessao)
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
        icone=dados.icone,
        status=dados.status,
        cliente=dados.cliente,
        data=dados.data,
        duracao=dados.duracao,
        valor=dados.valor
    )

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )

  
    servico_atualizado = repositorio.buscar_por_titulo(titulo)
    if not servico_atualizado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado após atualização"
        )
    return servico_atualizado

@router.delete(
    "/{titulo}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir serviço"
)
def deletar_servico(titulo: str, session: Session = Depends(obter_sessao)):
    repositorio = RepositorioServico(session)
    sucesso = repositorio.deletar(titulo)

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    return None