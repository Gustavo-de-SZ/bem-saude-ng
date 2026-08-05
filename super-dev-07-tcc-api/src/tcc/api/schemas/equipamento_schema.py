from pydantic import BaseModel, Field
from typing import Optional

class EquipamentoBase(BaseModel):
    tipo: str = Field(alias='tipo')
    marca: str = Field(alias='marca')
    modelo: str = Field(alias='modelo')
    numero_serie: Optional[str] = Field(None, alias='numeroSerie')
    patrimonio: Optional[str] = Field(None, alias='patrimonio')
    observacoes: Optional[str] = Field(None, alias='observacoes')
    data_registro: Optional[str] = Field(None, alias='dataRegistro')

    class Config:
        allow_population_by_field_name = True
        orm_mode = True

class EquipamentoCreate(EquipamentoBase):
    pass

class EquipamentoResponse(EquipamentoBase):
    id: int = Field(alias='id')
    cliente_id: int = Field(alias='clienteId')

    class Config:
        allow_population_by_field_name = True
        orm_mode = True

# For update, all fields optional
class EquipamentoUpdate(BaseModel):
    tipo: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    patrimonio: Optional[str] = None
    observacoes: Optional[str] = None
    data_registro: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        orm_mode = True