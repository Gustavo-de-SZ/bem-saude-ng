# Import all routers to ensure they are properly initialized
from .agendamento_rotas import router as agendamento_router
from .servico_rotas import router as servico_router
from .transacao_rotas import router as transacao_router
from .user_rotas import router as user_router
from .cliente_rotas import router as cliente_router
from .profissional_rotas import router as profissional_router
from .categoria_rotas import router as categoria_router
from .solicitacao_rotas import router as solicitacao_router