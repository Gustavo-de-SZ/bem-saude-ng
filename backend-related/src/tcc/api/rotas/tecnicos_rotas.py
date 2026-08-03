from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.api.schemas.tecnico_schema import TecnicoCreateRequest, TecnicoResponse, TecnicoUpdateRequest

router = APIRouter(
    prefix="/tecnicos",
    tags=["Técnicos"]
)

@router.post(
    "",
    response_model=TecnicoResponse,
    status_code=status.HTTP_200_OK,
    summary="Criar ou recuperar perfil tecnico (profissional) apos autenticacao via Auth0"
)
def criar_tecnico(
    dados: TecnicoCreateRequest,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # 1. Extrair auth0_id (sub) do token
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: 'sub' ausente")

    # 2. Extrair email do token (pode ser None se nao estiver no token)
    user_email = token_data.get("email")

    # 3. Instanciar repositórios
    usuario_repo = RepositorioUsuario(session)
    profissional_repo = RepositorioProfissional(session)
    cliente_repo = RepositorioCliente(session)

    # 4. Verificar se já existe usuario com esse auth0_id ou por email
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    email_to_use = user_email if user_email else dados.email
    if not usuario and email_to_use:
        # Try to find by email to link existing account
        usuario = usuario_repo.buscar_por_email(email_to_use)
        if usuario:
            # Link this auth0_id to the existing user (if not already linked)
            if usuario.auth0_id != auth0_id:
                usuario.auth0_id = auth0_id
                # The session will commit later when the perfil is saved
    if not usuario:
        # Se nao existir usuario no banco, criamos um novo
        if not email_to_use:
            raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Email não fornecido")
        usuario_obj = ModeloUsuario(
            email=email_to_use,
            senha_hash=None,
            tipo_perfil=TipoPerfil.PROFISSIONAL,
            ativo=True,
            auth0_id=auth0_id
        )
        usuario = usuario_repo.criar(usuario_obj)

        # Tratar nome fantasia e descricao
        nome_fantasia_source = email_to_use if email_to_use else "profissional"
        nome_fantasia = dados.nome if dados.nome else (nome_fantasia_source.split('@')[0] if '@' in email_to_use else "profissional")

        descricao_parts = []
        if dados.descricao_servicos:
            descricao_parts.append(dados.descricao_servicos)

        if hasattr(dados, 'especialidadePrincipal') and getattr(dados, 'especialidadePrincipal'):
            descricao_parts.append(f"Especialidade: {getattr(dados, 'especialidadePrincipal')}")

        if hasattr(dados, 'local') and getattr(dados, 'local'):
            descricao_parts.append(f"Local: {getattr(dados, 'local')}")

        if hasattr(dados, 'tempoResposta') and getattr(dados, 'tempoResposta'):
            descricao_parts.append(f"Tempo de resposta: {getattr(dados, 'tempoResposta')}")

        descricao_servicos = " | ".join(descricao_parts) if descricao_parts else None

        # Criar perfil de tecnico utilizando usuario_id
        profissional = profissional_repo.criar(
            usuario_id=usuario.id,
            nome_fantasia=nome_fantasia,
            cnpj=dados.cnpj if dados.cnpj else None, cpf=dados.cpf if dados.cpf else None,
            telefone=dados.telefone if dados.telefone else None,
            descricao_servicos=descricao_servicos
        )

        # Garantir que o tipo_perfil do usuario esteja correto
        usuario.tipo_perfil = TipoPerfil.PROFISSIONAL
        usuario_repo.sessao.commit()

        return TecnicoResponse(
            id=profissional.id,
            usuario_id=profissional.usuario_id,
            nome_fantasia=profissional.nome_fantasia,
            cnpj=profissional.cnpj,
            cpf=profissional.cpf,
            telefone=profissional.telefone,
            descricao_servicos=profissional.descricao_servicos,
            aprovado_pelo_admin=profissional.aprovado_pelo_admin,
            criado_em=profissional.criado_em,
            email=profissional.usuario.email
        )
    else:
        # Se usuario já existe
        profissional_existente = profissional_repo.buscar_por_usuario_id(usuario.id)
        if profissional_existente:
            return TecnicoResponse(
                id=profissional_existente.id,
                usuario_id=profissional_existente.usuario_id,
                nome_fantasia=profissional_existente.nome_fantasia,
                cnpj=profissional_existente.cnpj,
                telefone=profissional_existente.telefone,
                descricao_servicos=profissional_existente.descricao_servicos,
                aprovado_pelo_admin=profissional_existente.aprovado_pelo_admin,
                criado_em=profissional_existente.criado_em,
                email=profissional_existente.usuario.email
            )

        cliente_existente = cliente_repo.buscar_por_usuario_id(usuario.id)
        if cliente_existente:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Usuario ja possui perfil de cliente. Nao e possivel criar perfil de tecnico."
            )

        # Para usuario existente, sempre usar o email do usuario (do banco) por motivos de seguranca
        # (nao usar email do corpo da requisicao para evitar spoofing)
        email_to_use = usuario.email
        nome_fantasia_source = email_to_use if email_to_use else "profissional"
        nome_fantasia = dados.nome if dados.nome else (nome_fantasia_source.split('@')[0] if '@' in email_to_use else "profissional")

        descricao_parts = []
        if dados.descricao_servicos:
            descricao_parts.append(dados.descricao_servicos)

        if hasattr(dados, 'especialidadePrincipal') and getattr(dados, 'especialidadePrincipal'):
            descricao_parts.append(f"Especialidade: {getattr(dados, 'especialidadePrincipal')}")

        if hasattr(dados, 'local') and getattr(dados, 'local'):
            descricao_parts.append(f"Local: {getattr(dados, 'local')}")

        if hasattr(dados, 'tempoResposta') and getattr(dados, 'tempoResposta'):
            descricao_parts.append(f"Tempo de resposta: {getattr(dados, 'tempoResposta')}")

        descricao_servicos = " | ".join(descricao_parts) if descricao_parts else None

        # Criar perfil de tecnico utilizando usuario_id
        profissional = profissional_repo.criar(
            usuario_id=usuario.id,
            nome_fantasia=nome_fantasia,
            cnpj=dados.cnpj if dados.cnpj else None,
            telefone=dados.telefone if dados.telefone else None,
            descricao_servicos=descricao_servicos
        )

        # Atualizar o tipo_perfil do usuario para refletir o perfil criado
        usuario.tipo_perfil = TipoPerfil.PROFISSIONAL
        usuario_repo.sessao.commit()

        return TecnicoResponse(
            id=profissional.id,
            usuario_id=profissional.usuario_id,
            nome_fantasia=profissional.nome_fantasia,
            cnpj=profissional.cnpj,
            cpf=profissional.cpf,
            telefone=profissional.telefone,
            descricao_servicos=profissional.descricao_servicos,
            aprovado_pelo_admin=profissional.aprovado_pelo_admin,
            criado_em=profissional.criado_em,
            email=profissional.usuario.email
        )


@router.get(
    "/me",
    response_model=TecnicoResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter perfil do tecnico autenticado"
)
def obter_meu_perfil_tecnico(
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: 'sub' ausente")

    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)

    if not usuario:
        # Auto-create user and profile
        user_email = token_data.get("email") or "profissional"
        usuario_obj = ModeloUsuario(
            email=user_email,
            senha_hash=None,
            tipo_perfil=TipoPerfil.PROFISSIONAL,
            ativo=True,
            auth0_id=auth0_id
        )
        usuario = usuario_repo.criar(usuario_obj)
        
    profissional = profissional_repo.buscar_por_usuario_id(usuario.id)
    if not profissional:
        # Auto-create profissional profile
        user_email = token_data.get("email") or "profissional"
        nome_fantasia = user_email.split('@')[0] if '@' in user_email else "profissional"
        profissional = profissional_repo.criar(
            usuario_id=usuario.id,
            nome_fantasia=nome_fantasia,
            cnpj=None, cpf=None, telefone=None, descricao_servicos=None
        )


    return TecnicoResponse(
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
    response_model=TecnicoResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar perfil do tecnico autenticado"
)
def atualizar_meu_perfil_tecnico(
    dados: TecnicoUpdateRequest,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: 'sub' ausente")

    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Usuario nao encontrado")

    profissional_repo = RepositorioProfissional(session)
    profissional = profissional_repo.buscar_por_usuario_id(usuario.id)
    if not profissional:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de tecnico nao encontrado")

    update_data = dados.dict(exclude_unset=True)

    if 'nome' in update_data:
        profissional.nome_fantasia = update_data.pop('nome')

    for field, value in update_data.items():
        if hasattr(profissional, field):
            setattr(profissional, field, value)

    session.commit()
    session.refresh(profissional)

    return TecnicoResponse(
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