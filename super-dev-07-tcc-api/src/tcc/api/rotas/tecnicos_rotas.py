from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil
from src.tcc.infraestrutura.banco_dados.modelos.modelo_profissional import ModeloProfissional
from src.tcc.api.schemas.tecnico_schema import TecnicoCreateRequest, TecnicoUpdateRequest, TecnicoResponse
from http import HTTPStatus

router = APIRouter(prefix="/tecnicos", tags=["tecnicos"])


@router.post(
    "",
    response_model=TecnicoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar tecnico"
)
def cadastrar_tecnico(
    dados: TecnicoCreateRequest,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token invalido: 'sub' ausente")

    usuario_repo = RepositorioUsuario(session)
    profissional_repo = RepositorioProfissional(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)

    if usuario:
        # Se usuario já existe, verificar se já tem perfil de cliente
        from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
        cliente_repo = RepositorioCliente(session)
        cliente_existente = cliente_repo.buscar_por_usuario_id(usuario.id)
        if hasattr(cliente_existente, 'id') and cliente_existente.id:
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
    else:
        # Se usuario nao existe, criar usuario e perfil
        user_email = token_data.get("email") or "profissional"
        usuario_obj = ModeloUsuario(
            email=user_email,
            senha_hash=None,
            tipo_perfil=TipoPerfil.PROFISSIONAL,
            ativo=True,
            auth0_id=auth0_id
        )
        usuario = usuario_repo.criar(usuario_obj)

        # Criar perfil de tecnico
        nome_fantasia = user_email.split('@')[0] if '@' in user_email else "profissional"
        profissional = profissional_repo.criar(
            usuario_id=usuario.id,
            nome_fantasia=nome_fantasia,
            cnpj=dados.cnpj if dados.cnpj else None,
            telefone=dados.telefone if dados.telefone else None,
            descricao_servicos=dados.descricao_servicos if dados.descricao_servicos else None
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
    profissional_repo = RepositorioProfissional(session)

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
            cnpj=None, telefone=None, descricao_servicos=None
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
        cnpj=profissional.cnpj,
        telefone=profissional.telefone,
        descricao_servicos=profissional.descricao_servicos,
        aprovado_pelo_admin=profissional.aprovado_pelo_admin,
        criado_em=profissional.criado_em,
        email=profissional.usuario.email
    )