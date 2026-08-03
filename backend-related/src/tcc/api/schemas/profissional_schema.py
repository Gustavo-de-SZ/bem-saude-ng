from pydantic import BaseModel, EmailStr
from datetime import datetime

class ProfissionalCriarRequest(BaseModel):
    email: EmailStr
    senha: str
    nome_fantasia: str
    cnpj: str | None = None
    telefone: str
    descricao_servicos: str | None = None

class ProfissionalUpdateRequest(BaseModel):
    nome_fantasia: str | None = None
    cnpj: str | None = None
    telefone: str | None = None
    descricao_servicos: str | None = None

class ProfissionalResponse(BaseModel):
    id: int
    usuario_id: int
    nome_fantasia: str
    cnpj: str | None = None
    telefone: str
    descricao_servicos: str | None = None
    aprovado_pelo_admin: bool
    criado_em: datetime
    email: str

    class Config:
        from_attributes = True
