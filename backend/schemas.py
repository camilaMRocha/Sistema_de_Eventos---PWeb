from pydantic import BaseModel, EmailStr
from typing import Optional, List
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

class CategoriaCreate(BaseModel):
    nome_categoria: str
    id_categoria_pai: Optional[int] = None

class CategoriaResponse(BaseModel):
    id_categoria: int
    nome_categoria: str
    id_categoria_pai: Optional[int] = None

class CategoriaHierarquiaResponse(BaseModel):
    id_categoria: int
    subcategoria: str
    id_categoria_pai: Optional[int] = None
    tipo_evento: Optional[str] = None

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

class LocalCreate(BaseModel):
    id_fornecedor: int
    nome: str
    rua: str
    numero: str
    bairro: str
    cidade: str
    estado: str
    cep: str
    capacidade: int
    preco_diaria: float
    metragem: float
    descricao: Optional[str] = None
    complemento: Optional[str] = None
    quartos: Optional[int] = 0
    banheiros: Optional[int] = 0
    vagas_estacionamento: Optional[int] = 0
    categorias_ids: Optional[List[int]] = None
    fotos_urls: Optional[List[str]] = None

class LocalResponse(BaseModel):
    id_local: int
    id_fornecedor: int
    nome: str
    rua: str
    numero: str
    bairro: str
    cidade: str
    estado: str
    cep: str
    capacidade: int
    preco_diaria: float
    metragem: float
    descricao: Optional[str] = None
    complemento: Optional[str] = None
    quartos: Optional[int] = 0
    banheiros: Optional[int] = 0
    vagas_estacionamento: Optional[int] = 0

class LocalCardResponse(BaseModel):
    id_local: int
    nome: str
    descricao: Optional[str] = None
    preco_diaria: float
    cidade: str
    estado: str
    quartos: Optional[int] = 0
    banheiros: Optional[int] = 0
    vagas_estacionamento: Optional[int] = 0
    metragem: float
    proprietario: str
    contato_proprietario: str
    nota_media: float
    total_avaliacoes: int
    categorias: Optional[str] = None
