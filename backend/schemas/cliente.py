from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class ClienteCreate(BaseModel):
    email: EmailStr
    senha: str
    nome: str
    cpf: str
    telefone: str
    cidade: str
    estado: str
    data_nascimento: Optional[date] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    complemento: Optional[str] = None
    foto_perfil: Optional[str] = None

class ClienteResponse(BaseModel):
    id_cliente: int
    id_usuario: int
    nome: str
    cpf: str
    telefone: str
    email: EmailStr
    cidade: str
    estado: str
    data_nascimento: Optional[date] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    complemento: Optional[str] = None
    foto_perfil: Optional[str] = None
