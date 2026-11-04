from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class FuncionarioCreate(BaseModel):
    id_fornecedor: int
    nome_completo: str
    email: EmailStr
    cpf_cnpj: str
    telefone: str
    funcao_exercida: str
    descricao_funcao: Optional[str] = None
    data_nascimento: Optional[date] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    nome_banco: Optional[str] = None
    agencia: Optional[str] = None
    tipo_conta: Optional[str] = None
    titular_conta: Optional[str] = None
    foto_perfil: Optional[str] = None

class FuncionarioResponse(BaseModel):
    id_funcionario: int
    id_fornecedor: int
    nome_completo: str
    email: EmailStr
    cpf_cnpj: str
    telefone: str
    funcao_exercida: str
    descricao_funcao: Optional[str] = None
    data_nascimento: Optional[date] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    nome_banco: Optional[str] = None
    agencia: Optional[str] = None
    tipo_conta: Optional[str] = None
    titular_conta: Optional[str] = None
    foto_perfil: Optional[str] = None
