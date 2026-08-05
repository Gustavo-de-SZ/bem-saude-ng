from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from pydantic import BaseModel
from typing import Optional

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.infraestrutura.repositorios.favorito_repositorio import RepositorioFavorito
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.api.schemas.profissional_schema import ProfissionalCriarRequest, ProfissionalResponse, ProfissionalUpdateRequest
from src.tcc.api.auth import verify_token, get_professional_user, get_client_user
from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil


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
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token inválido: 'sub' ausente")

    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuário não encontrado. Complete o cadastro primeiro.")

    # Se o usuário já possui perfil profissional, retornar o existente
    if usuario.profissional:
        prof = usuario.profissional
        return ProfissionalResponse(
            id=prof.id,
            usuario_id=prof.usuario_id,
            nome_fantasia=prof.nome_fantasia,
            cnpj=prof.cnpj,
            telefone=prof.telefone,
            descricao_servicos=prof.descricao_servicos,
            aprovado_pelo_admin=prof.aprovado_pelo_admin,
            criado_em=prof.criado_em,
            email=prof.usuario.email
        )
    # Se o usuário já possui perfil de cliente, conflito (não pode ser ambos)
    if usuario.cliente:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Usuário já possui perfil de cliente. Não é possível criar perfil de profissional."
        )

    # Caso contrário, criar o perfil profissional
    repositorio = RepositorioProfissional(session)
    profissional = repositorio.criar(
        usuario_id=usuario.id,
        nome_fantasia=dados.nome_fantasia,
        cnpj=dados.cnpj,
        telefone=dados.telefone,
        descricao_servicos=dados.descricao_servicos
    )

    # Atualizar o tipo_perfil do usuario para refletir o perfil criado
    usuario.tipo_perfil = TipoPerfil.PROFISSIONAL
    usuario_repo.sessao.commit()

    return ProfissionalResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cnpj=profissional.cnpj,
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
def listar_profissionais(
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    repo = RepositorioProfissional(session)
    profissionais = repo.listar()
    
    return [
        ProfissionalResponse(
            id=p.id,
            usuario_id=p.usuario_id,
            nome_fantasia=p.nome_fantasia,
            cnpj=p.cnpj,
            telefone=p.telefone,
            descricao_servicos=p.descricao_servicos,
            aprovado_pelo_admin=p.aprovado_pelo_admin,
            criado_em=p.criado_em,
            email=p.usuario.email if p.usuario else None
        )
        for p in profissionais
    ]


@router.get(
    "/aprovados",
    response_model=list[ProfissionalResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar profissionais aprovados"
)
def listar_profissionais_aprovados(
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    profissional = current_user.profissional
    if not profissional or not profissional.aprovado_pelo_admin:
        return []
    return [
        ProfissionalResponse(
            id=profissional.id,
            usuario_id=profissional.usuario_id,
            nome_fantasia=profissional.nome_fantasia,
            cnpj=profissional.cnpj,
            telefone=profissional.telefone,
            descricao_servicos=profissional.descricao_servicos,
            aprovado_pelo_admin=profissional.aprovado_pelo_admin,
            criado_em=profissional.criado_em,
            email=profissional.usuario.email
        )
    ]




@router.get(
    "/me",
    response_model=ProfissionalResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter perfil do profissional autenticado"
)
def obter_meu_perfil_profissional(
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    # current_user is guaranteed to be a professional due to get_professional_user dependency
    profissional = current_user.profissional
    if not profissional:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de profissional não encontrado")

    return ProfissionalResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cnpj=profissional.cnpj,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )


@router.put(
    "/me",
    response_model=ProfissionalResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar perfil do profissional autenticado"
)
def atualizar_meu_perfil_profissional(
    dados: ProfissionalUpdateRequest,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    # current_user is guaranteed to be a professional due to get_professional_user dependency
    profissional = current_user.profissional
    if not profissional:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de profissional não encontrado")

    # Atualizar campos fornecidos
    update_data = dados.dict(exclude_unset=True)

    # Mapear nome para nome_completo
    if 'nome' in update_data:
        profissional.nome_fantasia = update_data.pop('nome')

    # Atualizar outros campos diretamente
    for field, value in update_data.items():
        if hasattr(profissional, field):
            setattr(profissional, field, value)

    session.commit()
    session.refresh(profissional)

    return ProfissionalResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cnpj=profissional.cnpj,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )
@router.get(
    "/favoritos",
    response_model=List[ProfissionalResponse],  # REUSE EXISTING SCHEMA
    status_code=status.HTTP_200_OK,
    summary="Listar profissionais favoritos do cliente"
)
def listar_favoritos(
    session: Session = Depends(obter_sessao),
    current_user: ModeloUsuario = Depends(get_client_user)
):
    # current_user is guaranteed to be a client due to get_client_user dependency
    if not current_user.cliente:
        return []
    cliente_id = current_user.cliente.id
    repositorio_favorito = RepositorioFavorito(session)
    profissionais = repositorio_favorito.listar_favoritos_por_cliente(cliente_id)

    return [
        ProfissionalResponse(
            id=p.id,
            usuario_id=p.usuario_id,
            nome_fantasia=p.nome_fantasia,
            cnpj=p.cnpj,
            telefone=p.telefone,
            descricao_servicos=p.descricao_servicos,
            aprovado_pelo_admin=p.aprovado_pelo_admin,
            criado_em=p.criado_em,
            email=p.usuario.email
        )
        for p in profissionais
    ]

@router.get(
    "/{id}",
    response_model=ProfissionalResponse,
    status_code=status.HTTP_200_OK,
    summary="Buscar profissional por ID"
)
def buscar_profissional(
    id: int,
    session: Session = Depends(obter_sessao),
    current_user = Depends(get_professional_user)
):
    # current_user is the Usuario object
    profissional = current_user.profissional
    if not profissional or profissional.id != id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    return ProfissionalResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cnpj=profissional.cnpj,
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
def aprovar_profissional(
    id: int,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Verify admin role
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token inválido: 'sub' ausente")
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuário não encontrado")
    if usuario.tipo_perfil != TipoPerfil.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: requer perfil de administrador"
        )
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
def rejeitar_profissional(
    id: int,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Verify admin role
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token inválido: 'sub' ausente")
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuário não encontrado")
    if usuario.tipo_perfil != TipoPerfil.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: requer perfil de administrador"
        )
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
    # Get user auth0_id (sub) from token
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")

    # Get user by auth0_id
    usuario_repositorio = RepositorioUsuario(session)
    usuario = usuario_repositorio.buscar_por_auth0_id(auth0_id)
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
    # Get user auth0_id (sub) from token
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")

    # Get user by auth0_id
    usuario_repositorio = RepositorioUsuario(session)
    usuario = usuario_repositorio.buscar_por_auth0_id(auth0_id)
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


