from pydantic import BaseModel
from typing import Optional

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
