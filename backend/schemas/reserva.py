from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservaCreate(BaseModel):
    id_evento: int
    id_local: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    valor_total: Optional[float] = None

class ReservaStatusUpdate(BaseModel):
    status_reserva: str

class ReservaResponse(BaseModel):
    id_reserva: int
    id_evento: int
    id_local: int
    nome_evento: Optional[str] = None
    nome_local: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    proprietario: Optional[str] = None
    contato_proprietario: Optional[str] = None
    status_reserva: str
    data_hora_inicio: datetime
    data_hora_fim: datetime
    valor_total: float
