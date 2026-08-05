from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from src.tcc.api.rotas import cliente_rotas, tecnicos_rotas, solicitacao_rotas, auth, profissional_rotas, chat_rotas, agendamento_rotas
from src.tcc.api.rotas.usuarios_rotas import router as usuarios_router

app = FastAPI(title="TechConnect API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the exception here if you have a logger
    return JSONResponse(
        status_code=500,
        content={"message": "Ocorreu um erro interno no servidor."},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "Erro de validação nos dados enviados.", "details": exc.errors()},
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API está rodando."}

# Include routers
app.include_router(auth.router)
app.include_router(cliente_rotas.router)
app.include_router(tecnicos_rotas.router)
app.include_router(solicitacao_rotas.router)
app.include_router(usuarios_router)
app.include_router(profissional_rotas.router)
app.include_router(chat_rotas.router)

app.include_router(agendamento_rotas.router)
