from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import PagamentoCreate, PagamentoResponse
from backend.routers.notificacoes import notificar_cliente, notificar_fornecedor

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

@router.post("", response_model=PagamentoResponse, status_code=status.HTTP_201_CREATED)
def registrar_pagamento(dados: PagamentoCreate):
    """Registra a confirmação de pagamento simulado de uma reserva ou ingresso."""
    if not dados.id_reserva and not dados.id_venda_ingresso:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informe o identificador da reserva ou da venda de ingresso."
        )

    if dados.valor <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O valor do pagamento deve ser superior a zero."
        )

    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        nome_local = None
        nome_evento = None

        if dados.id_reserva:
            sql_reserva = """
                SELECT r.id_reserva, r.status_reserva, r.valor_total,
                       l.id_fornecedor, e.id_cliente,
                       l.nome AS nome_local, e.nome_evento
                FROM reserva r
                JOIN local l ON r.id_local = l.id_local
                JOIN evento e ON r.id_evento = e.id_evento
                WHERE r.id_reserva = %s
            """
            cursor.execute(sql_reserva, (dados.id_reserva,))
            reserva = cursor.fetchone()

            if not reserva:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Reserva informada não encontrada."
                )

            if reserva["status_reserva"] == "Cancelado":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Não é possível realizar pagamento para uma reserva cancelada."
                )

            cursor.execute(
                "SELECT id_pagamento FROM pagamento WHERE id_reserva = %s AND status_pagamento = 'Aprovado'",
                (dados.id_reserva,)
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Esta reserva já possui um pagamento aprovado."
                )

            nome_local = reserva["nome_local"]
            nome_evento = reserva["nome_evento"]

        sql_insert = """
            INSERT INTO pagamento (
                id_reserva, id_venda_ingresso, valor, metodo_pagamento, status_pagamento, data_pagamento
            ) VALUES (%s, %s, %s, %s, 'Aprovado', NOW())
        """
        cursor.execute(sql_insert, (
            dados.id_reserva,
            dados.id_venda_ingresso,
            dados.valor,
            dados.metodo_pagamento
        ))
        id_pagamento = cursor.lastrowid
        conn.commit()

        try:
            if dados.id_reserva:
                valor_fmt = f"R$ {float(dados.valor):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
                notificar_fornecedor(
                    reserva["id_fornecedor"],
                    f"Pagamento de {valor_fmt} ({dados.metodo_pagamento}) recebido para a locação do '{nome_local}' no evento '{nome_evento}'."
                )
                notificar_cliente(
                    reserva["id_cliente"],
                    f"Seu pagamento de {valor_fmt} ({dados.metodo_pagamento}) para a locação do '{nome_local}' foi aprovado com sucesso!"
                )
        except Exception:
            pass

        cursor.execute("SELECT * FROM pagamento WHERE id_pagamento = %s", (id_pagamento,))
        pagamento = cursor.fetchone()
        pagamento["nome_local"] = nome_local
        pagamento["nome_evento"] = nome_evento
        return pagamento

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar pagamento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/reserva/{id_reserva}", response_model=PagamentoResponse)
def buscar_pagamento_por_reserva(id_reserva: int):
    """Busca os dados do pagamento aprovado associado a uma reserva."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT p.*, l.nome AS nome_local, e.nome_evento
            FROM pagamento p
            JOIN reserva r ON p.id_reserva = r.id_reserva
            JOIN local l ON r.id_local = l.id_local
            JOIN evento e ON r.id_evento = e.id_evento
            WHERE p.id_reserva = %s
            ORDER BY p.id_pagamento DESC
            LIMIT 1
        """
        cursor.execute(sql, (id_reserva,))
        pagamento = cursor.fetchone()
        if not pagamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nenhum pagamento registrado para esta reserva."
            )
        return pagamento
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_pagamento}", response_model=PagamentoResponse)
def buscar_pagamento_por_id(id_pagamento: int):
    """Busca os detalhes de um pagamento específico por ID."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT p.*, l.nome AS nome_local, e.nome_evento
            FROM pagamento p
            LEFT JOIN reserva r ON p.id_reserva = r.id_reserva
            LEFT JOIN local l ON r.id_local = l.id_local
            LEFT JOIN evento e ON r.id_evento = e.id_evento
            WHERE p.id_pagamento = %s
        """
        cursor.execute(sql, (id_pagamento,))
        pagamento = cursor.fetchone()
        if not pagamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado."
            )
        return pagamento
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[PagamentoResponse])
def listar_pagamentos():
    """Retorna os pagamentos mais recentes registrados na plataforma."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT p.*, l.nome AS nome_local, e.nome_evento
            FROM pagamento p
            LEFT JOIN reserva r ON p.id_reserva = r.id_reserva
            LEFT JOIN local l ON r.id_local = l.id_local
            LEFT JOIN evento e ON r.id_evento = e.id_evento
            ORDER BY p.data_pagamento DESC
            LIMIT 100
        """
        cursor.execute(sql)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()