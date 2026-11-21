from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import EventoCreate, EventoUpdate, EventoResponse

router = APIRouter(prefix="/eventos", tags=["Eventos"])

@router.post("", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_evento(dados: EventoCreate):
    """Realiza o cadastro de um novo evento pelo cliente."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_cliente FROM cliente WHERE id_cliente = %s", (dados.id_cliente,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado."
            )

        cursor.execute("SELECT id_categoria FROM categoria WHERE id_categoria = %s", (dados.id_categoria,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada."
            )

        sql = """
            INSERT INTO evento (
                id_cliente, id_categoria, nome_evento, formato, visibilidade,
                data_hora_inicio, data_hora_termino, descricao_evento, orcamento_estimado
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados.id_cliente, dados.id_categoria, dados.nome_evento,
            dados.formato or 'Presencial', dados.visibilidade or 'Privado',
            dados.data_hora_inicio, dados.data_hora_termino,
            dados.descricao_evento, dados.orcamento_estimado or 0.0
        ))
        id_evento = cursor.lastrowid

        if dados.fotos_urls:
            for ordem, url in enumerate(dados.fotos_urls, start=1):
                if url and url.strip():
                    cursor.execute(
                        "INSERT INTO evento_imagem (id_evento, url_imagem, ordem) VALUES (%s, %s, %s)",
                        (id_evento, url.strip(), ordem)
                    )

        conn.commit()

        cursor.execute("""
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            WHERE e.id_evento = %s
        """, (id_evento,))
        evento = cursor.fetchone()
        evento["fotos_urls"] = dados.fotos_urls or []
        return evento
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cadastrar evento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/cliente/{id_cliente}", response_model=List[EventoResponse])
def listar_eventos_do_cliente(id_cliente: int):
    """Retorna a lista de eventos pertencentes a um cliente específico com status de reserva e pagamento."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento,
                   l.nome AS local_reservado, r.id_local, r.id_reserva, r.status_reserva, r.valor_total AS valor_reserva,
                   pg.id_pagamento, pg.status_pagamento, pg.metodo_pagamento, pg.data_pagamento,
                   av.id_avaliacao, av.nota AS nota_avaliacao, av.comentario AS comentario_avaliacao
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            LEFT JOIN reserva r ON r.id_evento = e.id_evento AND r.status_reserva <> 'Cancelado'
            LEFT JOIN local l ON r.id_local = l.id_local
            LEFT JOIN pagamento pg ON pg.id_reserva = r.id_reserva AND pg.status_pagamento = 'Aprovado'
            LEFT JOIN avaliacao av ON av.id_reserva = r.id_reserva
            WHERE e.id_cliente = %s
            ORDER BY e.data_hora_inicio DESC
        """
        cursor.execute(sql, (id_cliente,))
        eventos = cursor.fetchall()

        for ev in eventos:
            cursor.execute(
                "SELECT url_imagem FROM evento_imagem WHERE id_evento = %s ORDER BY ordem ASC",
                (ev["id_evento"],)
            )
            imagens = [img["url_imagem"] for img in cursor.fetchall()]
            ev["fotos_urls"] = imagens

        return eventos
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_evento}", response_model=EventoResponse)
def buscar_evento_por_id(id_evento: int):
    """Busca os detalhes de um evento específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento,
                   l.nome AS local_reservado, r.id_local, r.id_reserva, r.status_reserva, r.valor_total AS valor_reserva,
                   pg.id_pagamento, pg.status_pagamento, pg.metodo_pagamento, pg.data_pagamento,
                   av.id_avaliacao, av.nota AS nota_avaliacao, av.comentario AS comentario_avaliacao
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            LEFT JOIN reserva r ON r.id_evento = e.id_evento AND r.status_reserva <> 'Cancelado'
            LEFT JOIN local l ON r.id_local = l.id_local
            LEFT JOIN pagamento pg ON pg.id_reserva = r.id_reserva AND pg.status_pagamento = 'Aprovado'
            LEFT JOIN avaliacao av ON av.id_reserva = r.id_reserva
            WHERE e.id_evento = %s
        """
        cursor.execute(sql, (id_evento,))
        evento = cursor.fetchone()
        if not evento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado."
            )

        cursor.execute(
            "SELECT url_imagem FROM evento_imagem WHERE id_evento = %s ORDER BY ordem ASC",
            (id_evento,)
        )
        evento["fotos_urls"] = [img["url_imagem"] for img in cursor.fetchall()]
        return evento
    finally:
        cursor.close()
        conn.close()

@router.put("/{id_evento}", response_model=EventoResponse)
def atualizar_evento(id_evento: int, dados: EventoUpdate):
    """Atualiza as informações de um evento existente."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM evento WHERE id_evento = %s", (id_evento,))
        evento_atual = cursor.fetchone()
        if not evento_atual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado."
            )

        # Bloquear alteração de eventos que já foram concluídos
        cursor.execute(
            "SELECT id_reserva FROM reserva WHERE id_evento = %s AND status_reserva = 'Concluido'",
            (id_evento,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Eventos já concluídos não podem ser alterados para preservação do histórico contábil."
            )

        campos = []
        valores = []

        if dados.nome_evento is not None:
            campos.append("nome_evento = %s")
            valores.append(dados.nome_evento)
        if dados.id_categoria is not None:
            campos.append("id_categoria = %s")
            valores.append(dados.id_categoria)
        if dados.formato is not None:
            campos.append("formato = %s")
            valores.append(dados.formato)
        if dados.visibilidade is not None:
            campos.append("visibilidade = %s")
            valores.append(dados.visibilidade)
        if dados.data_hora_inicio is not None:
            campos.append("data_hora_inicio = %s")
            valores.append(dados.data_hora_inicio)
        if dados.data_hora_termino is not None:
            campos.append("data_hora_termino = %s")
            valores.append(dados.data_hora_termino)
        if dados.descricao_evento is not None:
            campos.append("descricao_evento = %s")
            valores.append(dados.descricao_evento)
        if dados.orcamento_estimado is not None:
            campos.append("orcamento_estimado = %s")
            valores.append(dados.orcamento_estimado)

        if campos:
            valores.append(id_evento)
            sql = f"UPDATE evento SET {', '.join(campos)} WHERE id_evento = %s"
            cursor.execute(sql, tuple(valores))

        if dados.fotos_urls is not None:
            cursor.execute("DELETE FROM evento_imagem WHERE id_evento = %s", (id_evento,))
            for ordem, url in enumerate(dados.fotos_urls, start=1):
                if url and url.strip():
                    cursor.execute(
                        "INSERT INTO evento_imagem (id_evento, url_imagem, ordem) VALUES (%s, %s, %s)",
                        (id_evento, url.strip(), ordem)
                    )

        conn.commit()

        cursor.execute("""
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            WHERE e.id_evento = %s
        """, (id_evento,))
        evento = cursor.fetchone()
        cursor.execute(
            "SELECT url_imagem FROM evento_imagem WHERE id_evento = %s ORDER BY ordem ASC",
            (id_evento,)
        )
        evento["fotos_urls"] = [img["url_imagem"] for img in cursor.fetchall()]
        return evento
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar evento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.delete("/{id_evento}")
def excluir_evento(id_evento: int):
    """Exclui um evento da plataforma."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_evento FROM evento WHERE id_evento = %s", (id_evento,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado."
            )

        # Bloquear exclusão de eventos concluídos
        cursor.execute(
            "SELECT id_reserva FROM reserva WHERE id_evento = %s AND status_reserva = 'Concluido'",
            (id_evento,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Eventos com reservas concluídas não podem ser excluídos para preservação de histórico contábil."
            )

        cursor.execute("DELETE FROM evento WHERE id_evento = %s", (id_evento,))
        conn.commit()
        return {"mensagem": "Evento excluído com sucesso."}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir evento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()
