from http import HTTPStatus
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.categoria_repositorio import RepositorioCategoria
from src.tcc.api.schemas.categoria_schema import CategoriaResponse

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

@router.get(
    "",
    response_model=List[str],  
    status_code=status.HTTP_200_OK,
    summary="Listar nomes das categorias"
)
def listar_categorias(session: Session = Depends(obter_sessao)):
    repositorio = RepositorioCategoria(session)
    return repositorio.listar_nomes()