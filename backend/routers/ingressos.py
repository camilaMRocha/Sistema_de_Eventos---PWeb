import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from backend.database import criar_conexao
from backend.schemas.ingresso import (
    IngressoCreate,
    IngressoResponse,
    IngressoCompraCreate,
    IngressoVendaResponse,
)

router = APIRouter(prefix="/ingressos", tags=["Ingressos"])

@router.post("", response_model=IngressoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_ingresso(dados: IngressoCreate):
    if dados.quantidade_total <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A quantidade total de ingressos deve ser maior que zero."
        )

    inicio_vendas = dados.data_hora_inicio_vendas or datetime.now()
    termino_vendas = dados.data_hora_termino_vendas or datetime(2035, 12, 31, 23, 59, 59)

    if termino_vendas <= inicio_vendas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data de término das vendas deve ser posterior à data de início."
        )

    if dados.quantidade_min_compra and dados.quantidade_max_compra:
        if dados.quantidade_max_compra < dados.quantidade_min_compra:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A quantidade máxima por compra deve ser maior ou igual à mínima."
            )

    preco_efetivo = 0.0 if dados.tipo_ingresso == "Gratuito" else (dados.preco or 0.0)

    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_evento FROM evento WHERE id_evento = %s", (dados.id_evento,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento informado não encontrado."
            )

        sql = """
            INSERT INTO ingresso (
                id_evento, titulo_ingresso, tipo_ingresso, preco,
                quantidade_total, quem_pode_comprar, permite_troca_titularidade,
                inicio_vendas_por, quantidade_min_compra, quantidade_max_compra,
                data_hora_inicio_vendas, data_hora_termino_vendas
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados.id_evento,
            dados.titulo_ingresso,
            dados.tipo_ingresso,
            preco_efetivo,
            dados.quantidade_total,
            dados.quem_pode_comprar or "Qualquer pessoa",
            1 if dados.permite_troca_titularidade else 0,
            "Data específica",
            dados.quantidade_min_compra or 1,
            dados.quantidade_max_compra or 10,
            inicio_vendas,
            termino_vendas
        ))
        id_ingresso = cursor.lastrowid
        conn.commit()

        return IngressoResponse(
            id_ingresso=id_ingresso,
            id_evento=dados.id_evento,
            titulo_ingresso=dados.titulo_ingresso,
            tipo_ingresso=dados.tipo_ingresso,
            preco=preco_efetivo,
            quantidade_total=dados.quantidade_total,
            quantidade_vendida=0,
            quantidade_disponivel=dados.quantidade_total,
            status_estoque="Disponivel",
            data_hora_inicio_vendas=inicio_vendas,
            data_hora_termino_vendas=termino_vendas,
            quem_pode_comprar=dados.quem_pode_comprar or "Qualquer pessoa",
            permite_troca_titularidade=dados.permite_troca_titularidade,
            quantidade_min_compra=dados.quantidade_min_compra or 1,
            quantidade_max_compra=dados.quantidade_max_compra or 10
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/evento/{id_evento}", response_model=List[IngressoResponse])
def listar_ingressos_evento(id_evento: int):
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT i.*,
                   COALESCE(SUM(iv.quantidade), 0) AS quantidade_vendida,
                   (i.quantidade_total - COALESCE(SUM(iv.quantidade), 0)) AS quantidade_disponivel,
                   CASE
                       WHEN (i.quantidade_total - COALESCE(SUM(iv.quantidade), 0)) <= 0 THEN 'Esgotado'
                       ELSE 'Disponivel'
                   END AS status_estoque
            FROM ingresso i
            LEFT JOIN ingresso_venda iv ON iv.id_ingresso = i.id_ingresso
            WHERE i.id_evento = %s
            GROUP BY i.id_ingresso
            ORDER BY i.id_ingresso ASC
        """
        cursor.execute(sql, (id_evento,))
        rows = cursor.fetchall()
        resultado = []
        for r in rows:
            resultado.append(IngressoResponse(
                id_ingresso=r["id_ingresso"],
                id_evento=r["id_evento"],
                titulo_ingresso=r["titulo_ingresso"],
                tipo_ingresso=r["tipo_ingresso"],
                preco=float(r["preco"]) if r["preco"] is not None else 0.0,
                quantidade_total=r["quantidade_total"],
                quantidade_vendida=int(r["quantidade_vendida"]),
                quantidade_disponivel=max(0, int(r["quantidade_disponivel"])),
                status_estoque=r["status_estoque"],
                data_hora_inicio_vendas=r["data_hora_inicio_vendas"],
                data_hora_termino_vendas=r["data_hora_termino_vendas"],
                quem_pode_comprar=r.get("quem_pode_comprar") or "Qualquer pessoa",
                permite_troca_titularidade=bool(r.get("permite_troca_titularidade", True)),
                quantidade_min_compra=r.get("quantidade_min_compra", 1),
                quantidade_max_compra=r.get("quantidade_max_compra", 10)
            ))
        return resultado
    finally:
        cursor.close()
        conn.close()

@router.post("/comprar", response_model=IngressoVendaResponse, status_code=status.HTTP_201_CREATED)
def comprar_ingresso(dados: IngressoCompraCreate):
    if dados.quantidade <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A quantidade de ingressos deve ser de pelo menos 1 unidade."
        )

    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_cliente, nome FROM cliente WHERE id_cliente = %s", (dados.id_cliente,))
        cli = cursor.fetchone()
        if not cli:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado."
            )

        cursor.execute("""
            SELECT i.*, e.nome_evento, e.data_hora_inicio
            FROM ingresso i
            JOIN evento e ON i.id_evento = e.id_evento
            WHERE i.id_ingresso = %s
        """, (dados.id_ingresso,))
        ing = cursor.fetchone()
        if not ing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingresso não encontrado."
            )

        agora = datetime.now()
        if agora < ing["data_hora_inicio_vendas"] or agora > ing["data_hora_termino_vendas"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="As vendas para este ingresso não estão ativas no momento (RN11)."
            )

        min_qtd = ing.get("quantidade_min_compra") or 1
        max_qtd = ing.get("quantidade_max_compra") or 10
        if dados.quantidade < min_qtd or dados.quantidade > max_qtd:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A quantidade deve ser entre {min_qtd} e {max_qtd} ingressos por compra (RN12)."
            )

        cursor.execute(
            "SELECT COALESCE(SUM(quantidade), 0) AS total_vendido FROM ingresso_venda WHERE id_ingresso = %s",
            (dados.id_ingresso,)
        )
        vendido_info = cursor.fetchone()
        vendido = int(vendido_info["total_vendido"]) if vendido_info else 0
        disponivel = ing["quantidade_total"] - vendido

        if dados.quantidade > disponivel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estoque insuficiente. Restam apenas {disponivel} ingresso(s) disponíveis (RN10)."
            )

        preco_unit = float(ing["preco"]) if ing["tipo_ingresso"] == "Pago" and ing["preco"] else 0.0
        valor_total = round(preco_unit * dados.quantidade, 2)
        codigo_ingresso = f"HEY-{uuid.uuid4().hex[:8].upper()}"

        cursor.execute("""
            INSERT INTO ingresso_venda (id_ingresso, id_cliente, quantidade, valor_total, data_compra, codigo_ingresso)
            VALUES (%s, %s, %s, %s, NOW(), %s)
        """, (dados.id_ingresso, dados.id_cliente, dados.quantidade, valor_total, codigo_ingresso))
        id_venda = cursor.lastrowid

        if valor_total > 0:
            cursor.execute("""
                INSERT INTO pagamento (id_reserva, id_venda_ingresso, valor, metodo_pagamento, status_pagamento, data_pagamento)
                VALUES (NULL, %s, %s, %s, 'Aprovado', NOW())
            """, (id_venda, valor_total, dados.metodo_pagamento or "Pix"))

        conn.commit()

        try:
            from backend.routers.notificacoes import notificar_cliente
            msg = f"Sua compra de {dados.quantidade} ingresso(s) para o evento '{ing['nome_evento']}' foi confirmada! Código do ingresso: {codigo_ingresso}."
            notificar_cliente(dados.id_cliente, msg)
        except Exception:
            pass

        return IngressoVendaResponse(
            id_venda=id_venda,
            id_ingresso=dados.id_ingresso,
            id_cliente=dados.id_cliente,
            quantidade=dados.quantidade,
            valor_total=valor_total,
            data_compra=agora,
            codigo_ingresso=codigo_ingresso,
            nome_evento=ing["nome_evento"],
            titulo_ingresso=ing["titulo_ingresso"],
            data_hora_inicio=ing["data_hora_inicio"],
            local_nome=None
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/meus-ingressos/{id_cliente}", response_model=List[IngressoVendaResponse])
def listar_meus_ingressos(id_cliente: int):
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT iv.id_venda, iv.id_ingresso, iv.id_cliente, iv.quantidade,
                   iv.valor_total, iv.data_compra, iv.codigo_ingresso,
                   i.titulo_ingresso, e.nome_evento, e.data_hora_inicio,
                   l.nome AS local_nome
            FROM ingresso_venda iv
            JOIN ingresso i ON iv.id_ingresso = i.id_ingresso
            JOIN evento e ON i.id_evento = e.id_evento
            LEFT JOIN reserva r ON r.id_evento = e.id_evento AND r.status_reserva <> 'Cancelado'
            LEFT JOIN local l ON r.id_local = l.id_local
            WHERE iv.id_cliente = %s
            ORDER BY iv.data_compra DESC
        """
        cursor.execute(sql, (id_cliente,))
        rows = cursor.fetchall()
        resultado = []
        for r in rows:
            resultado.append(IngressoVendaResponse(
                id_venda=r["id_venda"],
                id_ingresso=r["id_ingresso"],
                id_cliente=r["id_cliente"],
                quantidade=r["quantidade"],
                valor_total=float(r["valor_total"]),
                data_compra=r["data_compra"],
                codigo_ingresso=r["codigo_ingresso"],
                nome_evento=r["nome_evento"],
                titulo_ingresso=r["titulo_ingresso"],
                data_hora_inicio=r["data_hora_inicio"],
                local_nome=r.get("local_nome")
            ))
        return resultado
    finally:
        cursor.close()
        conn.close()

@router.delete("/{id_ingresso}", status_code=status.HTTP_200_OK)
def excluir_ingresso(id_ingresso: int):
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) AS total FROM ingresso_venda WHERE id_ingresso = %s", (id_ingresso,))
        vendas = cursor.fetchone()
        if vendas and vendas["total"] > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir um ingresso que já possui compras registradas."
            )

        cursor.execute("DELETE FROM ingresso WHERE id_ingresso = %s", (id_ingresso,))
        conn.commit()
        return {"mensagem": "Ingresso excluído com sucesso."}
    finally:
        cursor.close()
        conn.close()
