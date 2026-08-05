from sqlalchemy import Column, DateTime
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
 
    pass

class ModeloBase(Base):
  
    __abstract__ = True

    criado_em = Column(DateTime, nullable=False, default=datetime.now)