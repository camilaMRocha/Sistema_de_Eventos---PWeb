from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class IngressoCreate(BaseModel):
    id_evento: int
    titulo_ingresso: str
    tipo_ingresso: Literal["Gratuito", "Pago"] = "Pago"
    preco: Optional[float] = 0.0
    quantidade_total: int
    data_hora_inicio_vendas: datetime
    data_hora_termino_vendas: datetime
    quem_pode_comprar: Optional[str] = "Qualquer pessoa"
    permite_troca_titularidade: Optional[bool] = True
    quantidade_min_compra: Optional[int] = 1
    quantidade_max_compra: Optional[int] = 10

class IngressoResponse(BaseModel):
    id_ingresso: int
    id_evento: int
    titulo_ingresso: str
    tipo_ingresso: str
    preco: Optional[float] = 0.0
    quantidade_total: int
    data_hora_inicio_vendas: datetime
    data_hora_termino_vendas: datetime
    quem_pode_comprar: Optional[str] = "Qualquer pessoa"
    permite_troca_titularidade: Optional[bool] = True
    quantidade_min_compra: Optional[int] = 1
    quantidade_max_compra: Optional[int] = 10

class IngressoCompraCreate(BaseModel):
    id_ingresso: int
    id_cliente: int
    quantidade: int

class IngressoVendaResponse(BaseModel):
    id_venda: int
    id_ingresso: int
    id_cliente: int
    quantidade: int
    valor_total: float
    data_compra: Optional[datetime] = None
    codigo_ingresso: str
