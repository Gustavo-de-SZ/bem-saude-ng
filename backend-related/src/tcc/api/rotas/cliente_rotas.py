from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.api.schemas.cliente_schema import ClienteAuth0Request, ClienteResponse, ClienteUpdateRequest

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)


@router.post(
    "/auth0",
    response_model=ClienteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo cliente a partir de autenticação Auth0 (sem senha)"
)
def criar_cliente_auth0(
    dados: ClienteAuth0Request,
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    # Extrair email do token
    user_email = token_data.get("email")
    if not user_email:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token inválido: email ausente")

    # Opcional: garantir que o email do corpo corresponde ao token (para segurança)
    # Nous allons ignorer l'email du corps et'utiliser celui du token pour éviter l'usurpation
    # if dados.email != user_email:
    #     raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Email no corpo nao corresponde ao token")

    # Verificar se já existe um usuario com esse email
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_email(user_email)

    # Se nao existir usuario, criamos um novo usuario (sem senha) para vincular ao cliente
    if not usuario:
        # Criar usuario com senha nula (auth0 gerencia autenticacao)
        usuario_obj = ModeloUsuario(
            email=user_email,
            senha_hash=None,
            tipo_perfil=TipoPerfil.CLIENTE,
            ativo=True
        )
        usuario = usuario_repo.criar(usuario_obj)
    else:
        # Se o usuario existir, verificamos se ele já tem um perfil de cliente ou tecnico
        # Verificar se já tem perfil de cliente
        cliente_repo = RepositorioCliente(session)
        cliente_existente = cliente_repo.buscar_por_usuario_id(usuario.id)
        if cliente_existente:
            # Já existe perfil de cliente, retornamos o existente
            return ClienteResponse(
                id=cliente_existente.id,
                usuario_id=cliente_existente.usuario_id,
                nome_completo=cliente_existente.nome_completo,
                telefone=cliente_existente.telefone,
                criado_em=cliente_existente.criado_em,
                email=cliente_existente.usuario.email,
                ativo=cliente_existente.ativo,
                empresa=cliente_existente.empresa,
                avaliacao=cliente_existente.avaliacao,
                servicos_ativos=cliente_existente.servicos_ativos,
                servicos_concluidos=cliente_existente.servicos_concluidos,
                endereco=cliente_existente.endereco
            )
        # Verificar se já tem perfil de tecnico (conflito de papel)
        profissional_repo = RepositorioProfissional(session)
        profissional_existente = profissional_repo.buscar_por_usuario_id(usuario.id)
        if profissional_existente:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Usuario já possui perfil de tecnico. Não é possível criar perfil de cliente."
            )

    # Criar perfil de cliente para o usuario
    # Usamos o email do token (não o do corpo) para garantir consistência
    cliente_data = dados.dict()
    # Remover campos que não são usados na criação do cliente pelo repositório
    # (ou mapear para os campos esperados)
    # O repositorio.criar espera: email, senha_hash, nome_completo, telefone, empresa, avaliacao, servicos_ativos, servicos_concluidos, endereco
    # Note: estamos usando o nome do campo 'nome' do DTO para nome_completo
    # Também temos tipoCliente e status que não são usados na criação do cliente pelo repositório, mas podemos salvá-los se quisermos?
    # Por enquanto, vamos apenas usar os campos que o modelo de cliente já tem.
    cliente_to_create = {
        "email": user_email,  # usar o email do token
        "senha_hash": None,   # Auth0 gerencia senha
        "nome_completo": cliente_data.get("nome"),
        "telefone": cliente_data.get("telefone"),
        "empresa": cliente_data.get("empresa"),
        "avaliacao": cliente_data.get("avaliacao", 0),  # padrão 0 se não fornecido
        "servicos_ativos": cliente_data.get("servicosAtivos", 0),
        "servicos_concluidos": cliente_data.get("servicosConcluidos", 0),
        "endereco": cliente_data.get("local")
    }
    # Remover None values? O repositorio.criar pode lidar com None para campos opcionais.
    # Vamos passar o dicionário assim mesmo.

    cliente_repo = RepositorioCliente(session)
    try:
        cliente = cliente_repo.criar(**cliente_to_create)
    except Exception as e:
        # Handle specific integrity errors if needed
        session.rollback()
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar cliente: {str(e)}"
        )

    return ClienteResponse(
        id=cliente.id,
        usuario_id=cliente.usuario_id,
        nome_completo=cliente.nome_completo,
        telefone=cliente.telefone,
        criado_em=cliente.criado_em,
        email=cliente.usuario.email,
        ativo=cliente.usuario.ativo,
        empresa=cliente.empresa,
        avaliacao=cliente.avaliacao,
        servicos_ativos=cliente.servicos_ativos,
        servicos_concluidos=cliente.servicos_concluidos,
        endereco=cliente.endereco
    )


@router.get(
    "/me",
    response_model=ClienteResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter perfil do cliente autenticado"
)
def obter_meu_perfil_cliente(
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

    # Buscar perfil de cliente pelo usuario_id
    cliente_repo = RepositorioCliente(session)
    cliente = cliente_repo.buscar_por_usuario_id(usuario.id)
    if not cliente:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de cliente nao encontrado")

    return ClienteResponse(
        id=cliente.id,
        usuario_id=cliente.usuario_id,
        nome_completo=cliente.nome_completo,
        telefone=cliente.telefone,
        criado_em=cliente.criado_em,
        email=cliente.usuario.email,
        ativo=cliente.usuario.ativo,
        empresa=cliente.empresa,
        avaliacao=cliente.avaliacao,
        servicos_ativos=cliente.servicos_ativos,
        servicos_concluidos=cliente.servicos_concluidos,
        endereco=cliente.endereco
    )


@router.put(
    "/me",
    response_model=ClienteResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar perfil do cliente autenticado"
)
def atualizar_meu_perfil_cliente(
    dados: ClienteUpdateRequest,
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

    # Buscar perfil de cliente pelo usuario_id
    cliente_repo = RepositorioCliente(session)
    cliente = cliente_repo.buscar_por_usuario_id(usuario.id)
    if not cliente:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Perfil de cliente nao encontrado")

    # Atualizar campos fornecidos
    update_data = dados.dict(exclude_unset=True)

    # Mapear nome para nome_completo
    if 'nome' in update_data:
        cliente.nome_completo = update_data.pop('nome')

    # Mapear local para endereco
    if 'local' in update_data:
        cliente.endereco = update_data.pop('local')

    # Atualizar outros campos diretamente
    for field, value in update_data.items():
        if hasattr(cliente, field):
            setattr(cliente, field, value)

    session.commit()
    session.refresh(cliente)

    return ClienteResponse(
        id=cliente.id,
        usuario_id=cliente.usuario_id,
        nome_completo=cliente.nome_completo,
        telefone=cliente.telefone,
        criado_em=cliente.criado_em,
        email=cliente.usuario.email,
        ativo=cliente.usuario.ativo,
        empresa=cliente.empresa,
        avaliacao=cliente.avaliacao,
        servicos_ativos=cliente.servicos_ativos,
        servicos_concluidos=cliente.servicos_concluidos,
        endereco=cliente.endereco
    )