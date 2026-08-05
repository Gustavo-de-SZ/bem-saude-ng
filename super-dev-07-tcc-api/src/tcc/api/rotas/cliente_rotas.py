from http import HTTPStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario, TipoPerfil
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token, require_profissional, require_any_profile, get_client_user
from src.tcc.infraestrutura.repositorios.cliente_repositorio import RepositorioCliente
from src.tcc.infraestrutura.repositorios.cliente_tecnico_repositorio import ClienteTecnicoRepository
from src.tcc.infraestrutura.repositorios.profissional_repositorio import RepositorioProfissional
from src.tcc.api.schemas.cliente_schema import ClienteAuth0Request, ClienteResponse, ClienteUpdateRequest


# Schema for manually created clients by technicians (without Auth0 login)
class ClienteManuelRequest(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    empresa: Optional[str] = None
    local: Optional[str] = None
    avaliacao: Optional[float] = 0.0
    servicosAtivos: Optional[int] = 0
    servicosConcluidos: Optional[int] = 0
    status: Optional[str] = None
    tipoCliente: Optional[str] = None

    class Config:
        extra = 'allow'  # Allow extra fields from frontend


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
    # Extrair auth0_id (sub) do token
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Token inválido: 'sub' ausente")

    # 4. Verificar se já existe usuario com esse auth0_id ou por email
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    user_email = token_data.get("email")
    email_to_use = user_email if user_email else dados.email
    usuario_encontrado = False
    usuario_criado_agora = False

    if not usuario and email_to_use:
        # Try to find by email to link existing account
        usuario = usuario_repo.buscar_por_email(email_to_use)
        if usuario:
            # Link this auth0_id to the existing user (if not already linked)
            if usuario.auth0_id != auth0_id:
                usuario.auth0_id = auth0_id
                session.commit()  # Persist the auth0_id update immediately
            usuario_encontrado = True
    if not usuario:
        # Se nao existir usuario no banco, criamos um novo
        if not email_to_use:
            raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail='Email não fornecido')
        usuario_obj = ModeloUsuario(
            email=email_to_use,
            senha_hash=None,
            tipo_perfil=TipoPerfil.CLIENTE,
            ativo=True,
            auth0_id=auth0_id
        )
        usuario = usuario_repo.criar(usuario_obj)

        # Garantir que o tipo_perfil do usuario esteja correto
        usuario.tipo_perfil = TipoPerfil.CLIENTE
        usuario_repo.sessao.commit()
        usuario_criado_agora = True
    else:
        # Encontramos o usuario (por auth0_id ou por email na tentativa acima)
        usuario_encontrado = True
        usuario_criado_agora = False

    # Verificar se ja tem perfil de cliente
    cliente_repo = RepositorioCliente(session)
    cliente_existente = cliente_repo.buscar_por_usuario_id(usuario.id)
    if cliente_existente:
        # Ja existe perfil de cliente, retornamos o existente
        return ClienteResponse(
            id=cliente_existente.id,
            usuario_id=cliente_existente.usuario_id,
            nome_completo=cliente_existente.nome_completo,
            telefone=cliente_existente.telefone,
            criado_em=cliente_existente.criado_em,
            email=cliente_existente.usuario.email,
            ativo=cliente_existente.usuario.ativo,
            empresa=cliente_existente.empresa,
            avaliacao=cliente_existente.avaliacao,
            servicos_ativos=cliente_existente.servicos_ativos,
            servicos_concluidos=cliente_existente.servicos_concluidos,
            endereco=cliente_existente.endereco
        )
    # Verificar se ja tem perfil de tecnico (conflito de papel) - so eh relevante se o usuario ja existia
    if usuario_encontrado:
        profissional_repo = RepositorioProfissional(session)
        profissional_existente = profissional_repo.buscar_por_usuario_id(usuario.id)
        if profissional_existente:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail='Usuario ja possui perfil de tecnico. Nao e possivel criar perfil de cliente.'
            )

    # Definir o tipo_perfil do usuario como CLIENTE se ele ja existia
    # Se o usuario foi criado agora, ja tem o tipo_perfil correto (TipoPerfil.CLIENTE) da criacao
    if usuario_encontrado:
        usuario.tipo_perfil = TipoPerfil.CLIENTE
        usuario_repo.sessao.commit()

    # Se o usuario existir, vamos usar o email do usuario (do banco) por motivos de seguranca
    # (nao usar email do token ou do corpo da requisicao para evitar spoofing)
    email_to_use = usuario.email

    # Criar perfil de cliente para o usuario (manualmente, para nao criar outro usuario)
    cliente_data = dados.dict()
    cliente_to_create = {
        "usuario_id": usuario.id,
        "nome_completo": cliente_data.get("nome"),
        "telefone": cliente_data.get("telefone"),
        "empresa": cliente_data.get("empresa"),
        "endereco": cliente_data.get("local"),
        "avaliacao": cliente_data.get("avaliacao", 0),  # padrao 0 se nao fornecido
        "servicos_ativos": cliente_data.get("servicosAtivos", 0),
        "servicos_concluidos": cliente_data.get("servicosConcluidos", 0)
    }

    try:
        cliente = ModeloCliente(**cliente_to_create)
        session.add(cliente)
        session.commit()
        session.refresh(cliente)
    except Exception as e:
        session.rollback()
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email ja cadastrado"
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
    current_user: ModeloUsuario = Depends(get_client_user)
):
    # current_user is guaranteed to be a client due to get_client_user dependency
    cliente = current_user.cliente
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
    current_user: ModeloUsuario = Depends(get_client_user)
):
    cliente = current_user.cliente
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


from src.tcc.infraestrutura.banco_dados.modelos.modelo_cliente import ModeloCliente
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado, StatusChamado

@router.get(
    "",
    response_model=list[ClienteResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar clientes para o painel do profissional"
)
def listar_clientes_para_tecnico(
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_profissional())
):
    # Return only clients associated with the logged-in professional
    cliente_tecnico_repo = ClienteTecnicoRepository(session)
    profissional_id = current_user.profissional.id
    clientes = cliente_tecnico_repo.listar_clientes_por_profissional(profissional_id)

    # Map to ClienteResponse format
    resultado = []
    for cliente in clientes:
        q_ativos = session.query(ModeloChamado).filter(
            ModeloChamado.cliente_id == cliente.id,
            ModeloChamado.profissional_id == profissional_id,
            ModeloChamado.status.in_([StatusChamado.ABERTO, StatusChamado.EM_ORCAMENTO, StatusChamado.EM_ANDAMENTO])
        ).count()
        
        q_concluidos = session.query(ModeloChamado).filter(
            ModeloChamado.cliente_id == cliente.id,
            ModeloChamado.profissional_id == profissional_id,
            ModeloChamado.status == StatusChamado.CONCLUIDO
        ).count()
        
        resultado.append(
            ClienteResponse(
                id=cliente.id,
                usuario_id=cliente.usuario_id,
                nome_completo=cliente.nome_completo,
                telefone=cliente.telefone,
                criado_em=cliente.criado_em,
                email=cliente.usuario.email if cliente.usuario else None,
                ativo=q_ativos > 0,
                empresa=cliente.empresa,
                avaliacao=cliente.avaliacao,
                servicos_ativos=q_ativos,
                servicos_concluidos=q_concluidos,
                endereco=cliente.endereco
            )
        )
    return resultado


@router.get(
    "/stats",
    status_code=status.HTTP_200_OK,
    summary="Obter estatisticas dos clientes"
)
def obter_estatisticas_clientes(
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL", "CLIENTE"]))
):
    # Get the user's profile type to determine what stats to return
    user_profile = current_user.tipo_perfil.value if hasattr(current_user.tipo_perfil, 'value') else current_user.tipo_perfil

    if user_profile == "PROFISSIONAL":
        cliente_tecnico_repo = ClienteTecnicoRepository(session)
        profissional_id = current_user.profissional.id
        clientes = cliente_tecnico_repo.listar_clientes_por_profissional(profissional_id)

        total = len(clientes)
        ativos = 0
        for c in clientes:
            is_active = session.query(ModeloChamado).filter(
                ModeloChamado.cliente_id == c.id,
                ModeloChamado.profissional_id == profissional_id,
                ModeloChamado.status.in_([StatusChamado.ABERTO, StatusChamado.EM_ORCAMENTO, StatusChamado.EM_ANDAMENTO])
            ).count() > 0
            if is_active:
                ativos += 1

        return {
            "total": total,
            "ativos": ativos,
            "inativos": total - ativos
        }
    else:
        total = session.query(ModeloCliente).count()
        ativos = session.query(ModeloCliente).filter(ModeloCliente.servicos_ativos > 0).count()
        return {
            "total": total,
            "ativos": ativos,
            "inativos": total - ativos
        }


@router.post(
    "/tecnico",
    status_code=status.HTTP_201_CREATED,
    summary="Criar cliente manualmente pelo técnico (sem login)"
)
def criar_cliente_manual_tecnico(
    dados: ClienteManuelRequest,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_profissional())
):
    # 1. Instancia o novo cliente informando que ele não tem conta no sistema (usuario_id = None)
    novo_cliente = ModeloCliente(
        usuario_id=None,
        nome_completo=dados.nome,
        telefone=dados.telefone,
        empresa=dados.empresa,
        endereco=dados.local,
        avaliacao=float(dados.avaliacao) if dados.avaliacao is not None else 0.0,
        servicos_ativos=int(dados.servicosAtivos) if dados.servicosAtivos is not None else 0,
        servicos_concluidos=int(dados.servicosConcluidos) if dados.servicosConcluidos is not None else 0
    )

    # 2. Faz o vínculo N:N automaticamente!
    # O SQLAlchemy vai pegar o ID do novo cliente, o ID do técnico logado
    # e inserir na tabela 'cliente_tecnico' por trás dos panos.
    novo_cliente.profissionais.append(current_user.profissional)

    try:
        session.add(novo_cliente)
        session.commit()
        session.refresh(novo_cliente)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao salvar cliente: {str(e)}")

    # Retorna os dados formatados conforme o seu ClienteResponse
    return ClienteResponse(
        id=novo_cliente.id,
        usuario_id=novo_cliente.usuario_id,
        nome_completo=novo_cliente.nome_completo,
        telefone=novo_cliente.telefone,
        criado_em=novo_cliente.criado_em,
        email=dados.email,  # O email manual que veio do form
        ativo=True,
        empresa=novo_cliente.empresa,
        avaliacao=novo_cliente.avaliacao,
        servicos_ativos=novo_cliente.servicos_ativos,
        servicos_concluidos=novo_cliente.servicos_concluidos,
        endereco=novo_cliente.endereco
    )



@router.get(
    "/email/{identificador}",
    response_model=ClienteResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter cliente por email, id ou nome"
)
def obter_cliente_por_email(
    identificador: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL", "CLIENTE"]))
):
    # Buscar cliente por email, id
    if "@" in identificador:
        cliente = session.query(ModeloCliente).join(ModeloUsuario).filter(ModeloUsuario.email == identificador).first()
    elif identificador.isdigit():
        cliente = session.query(ModeloCliente).filter(ModeloCliente.id == int(identificador)).first()
    else:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Identificador invalido: deve ser email ou id numerico")
        
    if not cliente:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Cliente não encontrado")

    # Verificar permissões: cliente pode ver apenas seu próprio perfil, profissional pode ver clientes associados
    user_profile = current_user.tipo_perfil.value if hasattr(current_user.tipo_perfil, 'value') else current_user.tipo_perfil

    if user_profile == "CLIENTE" and cliente.usuario_id != current_user.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado")

    if user_profile == "PROFISSIONAL":
        # Verificar se o profissional está associado a este cliente
        cliente_tecnico_repo = ClienteTecnicoRepository(session)
        cliente_associado = cliente_tecnico_repo.eh_vinculado(cliente.id, current_user.profissional.id)
        if not cliente_associado:
            raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado")

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
    "/email/{identificador}",
    response_model=ClienteResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar cliente por email, id ou nome"
)
def atualizar_cliente_por_email(
    identificador: str,
    dados: ClienteUpdateRequest,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL", "CLIENTE"]))
):
    # Buscar cliente por email, id
    if "@" in identificador:
        cliente = session.query(ModeloCliente).join(ModeloUsuario).filter(ModeloUsuario.email == identificador).first()
    elif identificador.isdigit():
        cliente = session.query(ModeloCliente).filter(ModeloCliente.id == int(identificador)).first()
    else:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Identificador invalido: deve ser email ou id numerico")

    if not cliente:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Cliente não encontrado")

    # Verificar permissões: cliente pode atualizar apenas seu próprio perfil, profissional pode atualizar clientes associados
    user_profile = current_user.tipo_perfil.value if hasattr(current_user.tipo_perfil, 'value') else current_user.tipo_perfil

    if user_profile == "CLIENTE" and cliente.usuario_id != current_user.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado")

    if user_profile == "PROFISSIONAL":
        # Verificar se o profissional está associado a este cliente
        cliente_tecnico_repo = ClienteTecnicoRepository(session)
        cliente_associado = cliente_tecnico_repo.eh_vinculado(cliente.id, current_user.profissional.id)
        if not cliente_associado:
            raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado")

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


@router.delete(
    "/email/{email}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir cliente por email"
)
def excluir_cliente_por_email(
    email: str,
    session: Session = Depends(obter_sessao),
    current_user = Depends(require_any_profile(["PROFISSIONAL", "CLIENTE"]))
):
    # Buscar cliente por email
    cliente = session.query(ModeloCliente).join(ModeloUsuario).filter(ModeloUsuario.email == email).first()

    if not cliente:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Cliente não encontrado")

    # Verificar permissões: cliente pode excluir apenas seu próprio perfil, profissional pode excluir clientes associados
    user_profile = current_user.tipo_perfil.value if hasattr(current_user.tipo_perfil, 'value') else current_user.tipo_perfil

    if user_profile == "CLIENTE" and cliente.usuario_id != current_user.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado")

    if user_profile == "PROFISSIONAL":
        # Verificar se o profissional está associado a este cliente
        cliente_tecnico_repo = ClienteTecnicoRepository(session)
        cliente_associado = cliente_tecnico_repo.eh_vinculado(cliente.id, current_user.profissional.id)
        if not cliente_associado:
            raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado")

    # Excluir o usuário (o cliente será excluído devido ao cascade)
    usuario = cliente.usuario
    session.delete(usuario)
    session.commit()

    return None