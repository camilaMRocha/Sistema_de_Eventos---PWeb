from pydantic import BaseModel
from typing import Optional

class ServicoCreate(BaseModel):
    id_fornecedor: int
    nome: str
    categoria: str
    preco: float
    descricao: Optional[str] = None
    id_funcionario: Optional[int] = None

class ServicoResponse(BaseModel):
    id_servico: int
    id_fornecedor: int
    nome: str
    categoria: str
    preco: float
    descricao: Optional[str] = None
    id_funcionario: Optional[int] = None

class ServicoViewResponse(BaseModel):
    id_servico: int
    nome: str
    categoria: str
    preco: float
    nome_fornecedor: str
    funcionario_responsavel: Optional[str] = None
