from pydantic import BaseModel
from typing import Optional, List

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
    capacidade: Optional[int] = 0
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

class LocalUpdate(BaseModel):
    id_fornecedor: Optional[int] = None
    nome: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    complemento: Optional[str] = None
    capacidade: Optional[int] = None
    preco_diaria: Optional[float] = None
    metragem: Optional[float] = None
    descricao: Optional[str] = None
    quartos: Optional[int] = None
    banheiros: Optional[int] = None
    vagas_estacionamento: Optional[int] = None
    categorias_ids: Optional[List[int]] = None
    fotos_urls: Optional[List[str]] = None
