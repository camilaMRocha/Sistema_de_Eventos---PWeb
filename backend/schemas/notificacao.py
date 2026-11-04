from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificacaoCreate(BaseModel):
    id_usuario: int
    mensagem: str

class NotificacaoResponse(BaseModel):
    id_notificacao: int
    id_usuario: int
    mensagem: str
    data_envio: Optional[datetime] = None
    visualizada: bool = False
