
# uvicorn src.tcc.principal:app --reload


import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.tcc.api.configuracoes import configuracoes


logger = logging.getLogger(__name__)



engine = create_engine(
    configuracoes.DATABASE_URL,
    echo=False,
    pool_pre_ping=True, 
    pool_size=5, 
    max_overflow=10 
)


SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)


def obter_sessao() -> Session:
    db = SessionLocal()
    try:
        logger.debug("Sessão de banco de dados criada")
        yield db
    finally:
        db.close() 
        logger.debug("Sessão de banco de dados fechada")

