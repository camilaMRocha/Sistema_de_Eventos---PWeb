from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EventoCreate(BaseModel):
    id_cliente: int
    id_categoria: int
    nome_evento: str
    formato: Optional[str] = "Presencial"
    visibilidade: Optional[str] = "Privado"
    data_hora_inicio: datetime
    data_hora_termino: datetime
    descricao_evento: Optional[str] = None
    orcamento_estimado: Optional[float] = 0.0
    fotos_urls: Optional[List[str]] = None

class EventoUpdate(BaseModel):
    nome_evento: Optional[str] = None
    id_categoria: Optional[int] = None
    formato: Optional[str] = None
    visibilidade: Optional[str] = None
    data_hora_inicio: Optional[datetime] = None
    data_hora_termino: Optional[datetime] = None
    descricao_evento: Optional[str] = None
    orcamento_estimado: Optional[float] = None
    fotos_urls: Optional[List[str]] = None

class EventoResponse(BaseModel):
    id_evento: int
    id_cliente: int
    id_categoria: int
    nome_categoria: Optional[str] = None
    tipo_evento: Optional[str] = None
    nome_evento: str
    formato: str
    visibilidade: str
    data_hora_inicio: datetime
    data_hora_termino: datetime
    descricao_evento: Optional[str] = None
    orcamento_estimado: Optional[float] = 0.0
    fotos_urls: Optional[List[str]] = None
    local_reservado: Optional[str] = None
    status_reserva: Optional[str] = None
