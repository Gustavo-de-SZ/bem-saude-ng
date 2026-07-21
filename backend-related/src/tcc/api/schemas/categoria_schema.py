# Minimal schema - we only need to return strings, but keep for consistency
from pydantic import BaseModel

class CategoriaResponse(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True