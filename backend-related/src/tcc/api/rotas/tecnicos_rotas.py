from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.api.schemas.tecnico_schema import TecnicCreateRequest, TecnicResponse, TecnicUpdateRequest

router = APIRouter(
    prefix="/tecnicos",
    tags=["Técnicos"]
)

@router.post(
    "",
    response_model=TecnicResponse,
    status_code=status.HTTP_200_OK,
    summary="Criar ou recuperar perfil tecnico (profissional) apos autenticacao via Auth0"
)
def criar_tecnico(
    dados: TecnicCreateRequest,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Extrair email do token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: email ausente")

    # Ignorar o email do corpo para evitar spoofing; usamos sempre o email do token

    # Verificar se já existe um usuario com esse email
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_email(user_email)

    # Se nao existir usuario, criamos um novo usuario (sem senha) para vincular ao profissional
    if not usuario:
        # Criar usuario com senha nula (auth0 gerencia autenticacao)
        usuario_obj = ModeloUsuario(
            email=user_email,
            senha_hash=None,
            tipo_perfil=TipoPerfil.PROFISSIONAL,
            ativo=True
        )
        usuario = usuario_repo.criar(usuario_obj)
    else:
        # Se o usuario existir, verificamos se ele já tem um perfil de tecnico
        profissional_repo = RepositorioProfissional(session)
        profissional_existente = profissional_repo.buscar_por_usuario_id(usuario.id)
        if profissional_existente:
            # Já existe perfil de tecnico, retornamos o existente
            return TecnicResponse(
                id=profissional_existente.id,
                usuario_id=profissional_existente.usuario_id,
                nome_fantasia=profissional_existente.nome_fantasia,
                cpf=profissional_existente.cpf,
                telefone=profissional_existente.telefone,
                descricao_servicos=profissional_existente.descricao_servicos,
                aprovado_pelo_admin=profissional_existente.aprovado_pelo_admin,
                criado_em=profissional_existente.criado_em,
                email=profissional_existente.usuario.email
            )
        # Verificar se já tem perfil de cliente (conflito de papel)
        cliente_repo = RepositorioCliente(session)
        cliente_existente = cliente_repo.buscar_por_usuario_id(usuario.id)
        if cliente_existente:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Usuario ja possui perfil de cliente. Nao e possivel criar perfil de tecnico."
            )

    # Criar novo perfil profissional
    # Usar o nome fornecido (do Auth0) como nome_fantasia
    nome_fantasia = dados.nome if dados.nome else user_email.split('@')[0]  # fallback

    # Construir descricao_servicos combinando os campos fornecidos
    descricao_parts = []
    if dados.descricao_servicos:
        descricao_parts.append(dados.descricao_servicos)

    # Adicionar informacoes extras do frontend se fornecidas
    if hasattr(dados, 'especialidadePrincipal') and getattr(dados, 'especialidadePrincipal'):
        descricao_parts.append(f"Especialidade: {getattr(dados, 'especialidadePrincipal')}")

    if hasattr(dados, 'local') and getattr(dados, 'local'):
        descricao_parts.append(f"Local: {getattr(dados, 'local')}")

    if hasattr(dados, 'tempoResposta') and getattr(dados, 'tempoResposta'):
        descricao_parts.append(f"Tempo de resposta: {getattr(dados, 'tempoResposta')}")

    descricao_servicos = " | ".join(descricao_parts) if descricao_parts else None

    profissional = profissional_repo.criar(
        email=user_email,
        senha_hash=None,  # Auth0 gerencia senha
        nome_fantasia=nome_fantasia,
        cpf=cpf if (cpf := dados.cpf) else None,
        telefone=telefone if (telefone := dados.telefone) else None,
        descricao_servicos=descricao_servicos
    )

    return TecnicResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cpf=profissional.cpf,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )


@router.get(
    "/me",
    response_model=TecnicResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter perfil do tecnico autenticado"
)
def obter_meu_perfil_tecnico(
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Obter email do token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: email ausente")

    # Buscar usuario pelo email
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_email(user_email)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario nao encontrado")

    # Buscar perfil de tecnico pelo usuario_id
    profissional_repo = RepositorioProfissional(session)
    profissional = profissional_repo.buscar_por_usuario_id(usuario.id)
    if not profissional:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de tecnico nao encontrado")

    return TecnicResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cpf=profissional.cpf,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )


@router.put(
    "/me",
    response_model=TecnicResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar perfil do tecnico autenticado"
)
def atualizar_meu_perfil_tecnico(
    dados: TecnicUpdateRequest,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Obter email do token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: email ausente")

    # Buscar usuario pelo email
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_email(user_email)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario nao encontrado")

    # Buscar perfil de tecnico pelo usuario_id
    profissional_repo = RepositorioProfissional(session)
    profissional = profissional_repo.buscar_por_usuario_id(usuario.id)
    if not profissional:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de tecnico nao encontrado")

    # Atualizar campos fornecidos
    update_data = dados.dict(exclude_unset=True)

    # Mapear nome para nome_fantasia
    if 'nome' in update_data:
        profissional.nome_fantasia = update_data.pop('nome')

    # Atualizar outros campos diretamente
    for field, value in update_data.items():
        if hasattr(profissional, field):
            setattr(profissional, field, value)

    session.commit()
    session.refresh(profissional)

    return TecnicResponse(
        id=profissional.id,
        usuario_id=profissional.usuario_id,
        nome_fantasia=profissional.nome_fantasia,
        cpf=profissional.cpf,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )