from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class UsuarioResponse(BaseModel):
    id_usuario: int
    email: EmailStr
    tipo_usuario: str
    foto_perfil: Optional[str] = None
    data_cadastro: Optional[datetime] = None

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

class FornecedorCreate(BaseModel):
    email: EmailStr
    senha: str
    nome_fornecedor: str
    cnpj: str
    telefone: str
    categoria_atuacao: str
    cidade: str
    estado: str
    data_nascimento_responsavel: Optional[date] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    complemento: Optional[str] = None
    nome_banco: Optional[str] = None
    agencia: Optional[str] = None
    tipo_conta: Optional[str] = None
    titular_conta: Optional[str] = None
    foto_perfil: Optional[str] = None

class FornecedorResponse(BaseModel):
    id_fornecedor: int
    id_usuario: int
    nome_fornecedor: str
    cnpj: str
    telefone: str
    categoria_atuacao: str
    email: EmailStr
    cidade: str
    estado: str
    data_nascimento_responsavel: Optional[date] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    complemento: Optional[str] = None
    nome_banco: Optional[str] = None
    agencia: Optional[str] = None
    tipo_conta: Optional[str] = None
    titular_conta: Optional[str] = None
    foto_perfil: Optional[str] = None
