from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.equipamento_repositorio import RepositorioEquipamento
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.api.auth import verify_token, require_profissional
from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import TipoPerfil
from src.tcc.infraestrutura.banco_dados.modelos.modelo_equipamento import TipoEquipamentoEnum
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.api.schemas.equipamento_schema import EquipamentoCreate, EquipamentoResponse, EquipamentoUpdate

router = APIRouter(
    prefix="/clientes/{clienteId}/equipamentos",
    tags=["Equipamentos"]
)

@router.post(
    "",
    response_model=EquipamentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo equipamento"
)
def criar_equipamento(
    clienteId: int,
    dados: EquipamentoCreate,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Verificar se o cliente existe e se o clienteId no path corresponde ao no corpo

    cliente_repo = RepositorioCliente(session)
    cliente = cliente_repo.buscar_por_id(clienteId)
    if not cliente:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Cliente não encontrado"
        )

    # Validar o tipo de equipamento
    try:
        tipo_enum = TipoEquipamentoEnum(dados.tipo)
    except ValueError:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=f"Tipo de equipamento inválido. Valores permitidos: {[e.value for e in TipoEquipamentoEnum]}"
        )

    # Obter o usuário autenticado
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token inválido: 'sub' ausente")

    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuário não encontrado")

    # Criar o equipamento vinculando-o ao usuario logado
    repositorio = RepositorioEquipamento(session)
    equipamento = repositorio.criar(
        usuario_id=usuario.id,
        tipo=dados.tipo,
        marca=dados.marca,
        modelo=dados.modelo,
        numero_serie=dados.numero_serie,
        patrimonio=dados.patrimonio,
        observacoes=dados.observacoes,
        data_registro=dados.data_registro,
        cliente_id=clienteId
    )

    return EquipamentoResponse(
        id=equipamento.id,
        tipo=equipamento.tipo.value if isinstance(equipamento.tipo, TipoEquipamentoEnum) else equipamento.tipo,
        marca=equipamento.marca,
        modelo=equipamento.modelo,
        numeroSerie=equipamento.numero_serie,
        patrimonio=equipamento.patrimonio,
        observacoes=equipamento.observacoes,
        dataRegistro=equipamento.data_registro,
        clienteId=equipamento.cliente_id
    )

@router.get(
    "",
    response_model=List[EquipamentoResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar equipamentos por cliente"
)
def listar_equipamentos_por_cliente(
    clienteId: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_profissional())
):
    # Verificar se o cliente existe
    cliente_repo = RepositorioCliente(session)
    cliente = cliente_repo.buscar_por_id(clienteId)
    if not cliente:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Cliente não encontrado"
        )

    # Listar equipamentos do cliente
    repositorio = RepositorioEquipamento(session)
    equipamentos = repositorio.listar_por_cliente(clienteId)

    # Converter para response model
    return [
        EquipamentoResponse(
            id=equipamento.id,
            tipo=equipamento.tipo.value if isinstance(equipamento.tipo, TipoEquipamentoEnum) else equipamento.tipo,
            marca=equipamento.marca,
            modelo=equipamento.modelo,
            numeroSerie=equipamento.numero_serie,
            patrimonio=equipamento.patrimonio,
            observacoes=equipamento.observacoes,
            dataRegistro=equipamento.data_registro,
            clienteId=equipamento.cliente_id
        )
        for equipamento in equipamentos
    ]