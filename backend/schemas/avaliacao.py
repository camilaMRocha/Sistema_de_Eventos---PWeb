from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AvaliacaoCreate(BaseModel):
    id_cliente: int
    id_local: Optional[int] = None
    id_servico: Optional[int] = None
    nota: int = Field(..., ge=1, le=5, description="Nota de 1 a 5")
    comentario: Optional[str] = None

class AvaliacaoResponse(BaseModel):
    id_avaliacao: int
    id_cliente: int
    nome_cliente: Optional[str] = None
    id_local: Optional[int] = None
    id_servico: Optional[int] = None
    nota: int
    comentario: Optional[str] = None
    data_avaliacao: Optional[datetime] = None
