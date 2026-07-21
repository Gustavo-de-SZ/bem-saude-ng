from pydantic import BaseModel, EmailStr
from datetime import datetime

class ProfissionalCriarRequest(BaseModel):
    email: EmailStr
    senha: str
    nome_fantasia: str
    cpf: str
    telefone: str
    descricao_servicos: str | None = None

class ProfissionalResponse(BaseModel):
    id: int
    usuario_id: int
    nome_fantasia: str
    cpf: str
    telefone: str
    descricao_servicos: str | None = None
    aprovado_pelo_admin: bool
    criado_em: datetime
    email: str

    class Config:
        from_attributes = True
