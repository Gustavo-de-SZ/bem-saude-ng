from fastapi import FastAPI
from src.tcc.api.rotas import cliente_rotas, tecnicos_rotas, solicitacao_rotas, auth, profissional_rotas, chat_rotas
from src.tcc.api.rotas.usuarios_rotas import router as usuarios_router

app = FastAPI()

# Include routers
app.include_router(auth.router)
app.include_router(cliente_rotas.router)
app.include_router(tecnicos_rotas.router)
app.include_router(solicitacao_rotas.router)
app.include_router(usuarios_router)  # New router for usuario endpoints

# Optional: Add CORS middleware if needed
# from fastapi.middleware.cors import CORSMiddleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
app.include_router(profissional_rotas.router)
app.include_router(chat_rotas.router)