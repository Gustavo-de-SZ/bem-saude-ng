import logging
from fastapi import FastAPI, Depends  # Adicionado o Depends aqui
from fastapi.middleware.cors import CORSMiddleware
from src.tcc.api.configuracoes import configuracoes
from src.tcc.api.rotas import (
    user_rotas, cliente_rotas, profissional_rotas, categoria_rotas,
    solicitacao_rotas, agendamento_rotas, servico_rotas, transacao_rotas,
    tecnicos_rotas
)
from src.tcc.infraestrutura.banco_dados.conexao import engine
from src.tcc.infraestrutura.banco_dados.modelos.modelo_base import Base

# Importa as validações do arquivo auth.py que criamos
# (Ajuste o caminho se você salvou o auth.py dentro de alguma subpasta como src.tcc.api.auth)
from src.tcc.api.auth import verify_token, require_role, debug_router, require_any_role

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

    logger.info("Registrando rotas")

    # 1. ROTA PÚBLICA: Qualquer pessoa (mesmo deslogada) pode ver as categorias de serviço
    app.include_router(categoria_rotas.router, prefix="/api")

    # 2. ROTAS RESTRITAS APENAS POR TOKEN: Precisa estar logado, independente da role
    app.include_router(
        user_rotas.router,
        prefix="/api",
        dependencies=[Depends(verify_token)]
    )
    app.include_router(
        solicitacao_rotas.router,
        prefix="/api",
        dependencies=[Depends(verify_token)]
    )

    # 3. ROTAS RESTRITAS POR ROLE (RBAC): O Auth0 valida se a role está no token
    app.include_router(
        cliente_rotas.router,
        prefix="/api",
        dependencies=[Depends(verify_token)]  # Changed to only require authentication for profile creation
    )
    app.include_router(
        profissional_rotas.router,
        prefix="/api",
        dependencies=[Depends(require_role("Profissional"))]
    )
    app.include_router(
        tecnicos_rotas.router,
        prefix="/api",
        dependencies=[Depends(verify_token)]  # Changed to only require authentication
    )
    app.include_router(
        agendamento_rotas.router,
        prefix="/api",
        dependencies=[Depends(require_role("Profissional"))]
    )
    app.include_router(
        servico_rotas.router,
        prefix="/api",
        dependencies=[Depends(require_role("Profissional"))]
    )
    app.include_router(
        transacao_rotas.router,
        prefix="/api",
        dependencies=[Depends(require_role("Profissional"))]
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