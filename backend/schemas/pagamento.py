from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class PagamentoCreate(BaseModel):
    id_reserva: Optional[int] = None
    id_venda_ingresso: Optional[int] = None
    valor: float
    metodo_pagamento: Literal["Pix", "Cartao de Credito", "Boleto", "Transferencia"]

class PagamentoResponse(BaseModel):
    id_pagamento: int
    id_reserva: Optional[int] = None
    id_venda_ingresso: Optional[int] = None
    valor: float
    data_pagamento: Optional[datetime] = None
    metodo_pagamento: str
    status_pagamento: str
