import logging
from fastapi import FastAPI, Depends  # Adicionado o Depends aqui
from fastapi.middleware.cors import CORSMiddleware
from src.tcc.api.configuracoes import configuracoes
from src.tcc.api.rotas import chat_rotas
from src.tcc.api.rotas import (
    user_rotas, cliente_rotas, profissional_rotas, categoria_rotas,
    solicitacao_rotas, agendamento_rotas, servico_rotas, transacao_rotas,
    tecnicos_rotas, equipamento_rotas
)
from src.tcc.api.rotas.usuarios_rotas import router as usuarios_router
from src.tcc.api.auth import get_professional_user
from src.tcc.infraestrutura.banco_dados.conexao import engine
from src.tcc.infraestrutura.banco_dados.modelos.modelo_base import Base

# Importa as validações do arquivo auth.py que criamos
# (Ajuste o caminho se você salvou o auth.py dentro de alguma subpasta como src.tcc.api.auth)
from src.tcc.api.auth import verify_token, require_role, debug_router, require_any_role
from sqlalchemy import inspect, text, Integer

logging.basicConfig(
    level=configuracoes.LOG_LEVEL,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H-%M-%S"
)

logger = logging.getLogger(__name__)


def criar_aplicacao() -> FastAPI:
    if configuracoes.prod:
        logger.info("Iniciando aplicação em modo PRODUÇÃO (Swagger desabilitado)")
        app = FastAPI(
            docs_url=True,
            redoc_url=True,
            openapi_url=True
        )
    else:
        logger.info("Iniciando aplicação em modo DESENVOLVIMENTO (Swagger habilitado)")
        app = FastAPI(
            title="tcc api",
            version="1.0.0",
            docs_url="/docs",
            redoc_url="/redoc",
            openapi_url="/openapi.json",
        )

    # Configure CORS for Angular frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200"],  # Angular dev server
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )

    # Ensure database schema is up-to-date
    def _ensure_database_schema():
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        # Ensure usuario_id column exists in servicos, agendamentos, equipamentos and clientes tables
        for table_name, column_name in [('servicos', 'usuario_id'), ('agendamentos', 'usuario_id'), ('equipamentos', 'usuario_id'), ('clientes', 'usuario_id')]:
            if inspector.has_table(table_name):
                columns = [col['name'] for col in inspector.get_columns(table_name)]
                if column_name not in columns:
                    with engine.begin() as conn:
                        # Add the column with a default value that references a valid user
                        # For now, we'll set it to 1 assuming there's at least one user
                        # Note: For clientes table, we'll make it nullable afterwards to support manual clients
                        is_nullable = True if table_name == 'clientes' else False
                        null_constraint = "NULL" if is_nullable else "NOT NULL DEFAULT 1"
                        default_clause = "" if is_nullable else "DEFAULT 1"
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} INTEGER {null_constraint} {default_clause}"))
                        # Add foreign key constraint if it doesn't exist
                        try:
                            conn.execute(text(f"ALTER TABLE {table_name} ADD FOREIGN KEY ({column_name}) REFERENCES usuarios(id)"))
                        except Exception:
                            # Foreign key might already exist or there might be an issue
                            pass

        # NEW: Ensure usuario_id in clientes table can be NULL (for manual clients without login)
        # This ensures consistency in case the column was already present but had wrong constraints
        if inspector.has_table('clientes'):
            with engine.begin() as conn:
                try:
                    # Check if usuario_id column exists and modify it to allow NULL
                    columns = [col['name'] for col in inspector.get_columns('clientes')]
                    if 'usuario_id' in columns:
                        # Alter the column to allow NULL values (but keep NOT NULL for other tables handled above)
                        conn.execute(text("ALTER TABLE clientes MODIFY COLUMN usuario_id INT NULL"))
                except Exception as e:
                    logger.warning(f"Could not modify usuario_id in clientes table to allow NULL: {e}")

        # NEW: Ensure tipo column in equipamentos table is VARCHAR(100) NOT NULL
        if inspector.has_table('equipamentos'):
            with engine.begin() as conn:
                try:
                    # Alter the column to be VARCHAR(100) NOT NULL
                    conn.execute(text("ALTER TABLE equipamentos MODIFY COLUMN tipo VARCHAR(100) NOT NULL"))
                except Exception as e:
                    logger.warning(f"Could not modify tipo column in equipamentos table: {e}")

        # NEW: Ensure data_registro in equipamentos table can be NULL (optional field)
        if inspector.has_table('equipamentos'):
            with engine.begin() as conn:
                try:
                    # Check if data_registro column exists and modify it to allow NULL
                    columns = [col['name'] for col in inspector.get_columns('equipamentos')]
                    if 'data_registro' in columns:
                        # Alter the column to allow NULL values
                        conn.execute(text("ALTER TABLE equipamentos MODIFY COLUMN data_registro VARCHAR(20) NULL"))
                except Exception as e:
                    logger.warning(f"Could not modify data_registro in equipamentos table to allow NULL: {e}")

    _ensure_database_schema()

    logger.info("Registrando rotas")

    # 1. ROTA PÚBLICA: Qualquer pessoa (mesmo deslogada) pode ver as categorias de serviço
    app.include_router(categoria_rotas.router, prefix="/api")
    app.include_router(chat_rotas.router, prefix="/api")

    # USUARIOS ROTAS: Para verificar o status do usuário e obter perfil profissional
    # MUST come before user_rotas to avoid route conflicts with {id} parameter
    app.include_router(
        usuarios_router,
        prefix="/api",
        dependencies=[Depends(verify_token)]
    )

    # 2. ROTAS RESTRITAS APENAS POR TOKEN: Precisa estar logado, independente da role
    app.include_router(
        user_rotas.router,
        prefix="/api",
        dependencies=[Depends(verify_token)]
    )
    app.include_router(
        solicitacao_rotas.router,
        prefix="/api"
    )

    # 3. ROTAS RESTRITAS POR ROLE (RBAC): O Auth0 valida se a role está no token
    app.include_router(
        cliente_rotas.router,
        prefix="/api",
    )
    app.include_router(
        profissional_rotas.router,
        prefix="/api",
    )
    app.include_router(
        tecnicos_rotas.router,
        prefix="/api",
        dependencies=[Depends(verify_token)]  # Changed to only require authentication
    )
    app.include_router(
        agendamento_rotas.router,
        prefix="/api",
        dependencies=[Depends(get_professional_user)]
    )
    app.include_router(
        servico_rotas.router,
        prefix="/api",
        dependencies=[Depends(get_professional_user)]
    )
    app.include_router(
        transacao_rotas.router,
        prefix="/api",
        dependencies=[Depends(get_professional_user)]
    )
    app.include_router(
        equipamento_rotas.router,
        prefix="/api",
        dependencies=[Depends(get_professional_user)]
    )

    if configuracoes.swagger_habilitado:
        app.include_router(debug_router, prefix="/api")

    @app.get("/health", tags=["Sistema"], summary="Health check", description="Verificando se a API está respondendo")
    def health_check():
        return {
            "status": "ok",
            "ambiente": configuracoes.AMBIENTE,
            "swagger_habilitado": configuracoes.swagger_habilitado
        }

    logger.info("Aplicação configurada com sucesso")
    Base.metadata.create_all(engine)
    return app


app = criar_aplicacao()