from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    senha: str

class UsuarioResponse(BaseModel):
    id_usuario: int
    email: EmailStr
    tipo_usuario: str
    foto_perfil: Optional[str] = None
    data_cadastro: Optional[datetime] = None
