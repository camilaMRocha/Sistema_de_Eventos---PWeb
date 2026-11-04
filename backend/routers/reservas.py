from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import ReservaCreate, ReservaStatusUpdate, ReservaResponse

router = APIRouter(prefix="/reservas", tags=["Reservas"])

@router.post("", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
def criar_reserva(dados: ReservaCreate):
    """Cria uma nova reserva vinculando um evento a um local."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_evento, nome_evento, id_cliente FROM evento WHERE id_evento = %s", (dados.id_evento,))
        evento = cursor.fetchone()
        if not evento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento informado não encontrado."
            )

        cursor.execute("SELECT id_local, nome, preco_diaria, cidade, estado FROM local WHERE id_local = %s", (dados.id_local,))
        local = cursor.fetchone()
        if not local:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Local informado não encontrado."
            )

        if dados.data_hora_fim <= dados.data_hora_inicio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A data e horário de término devem ser posteriores ao início."
            )

        sql_conflito = """
            SELECT id_reserva FROM reserva
            WHERE id_local = %s
              AND status_reserva IN ('Pendente', 'Confirmado')
              AND (%s < data_hora_fim AND %s > data_hora_inicio)
        """
        cursor.execute(sql_conflito, (dados.id_local, dados.data_hora_inicio, dados.data_hora_fim))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este espaço já possui uma reserva confirmada ou pendente para as datas e horários selecionados."
            )

        valor_total = dados.valor_total
        if valor_total is None or valor_total <= 0:
            delta_segundos = (dados.data_hora_fim - dados.data_hora_inicio).total_seconds()
            dias = max(1, int((delta_segundos + 86399) // 86400))
            valor_total = float(local["preco_diaria"]) * dias

        sql_insert = """
            INSERT INTO reserva (id_evento, id_local, status_reserva, data_hora_inicio, data_hora_fim, valor_total)
            VALUES (%s, %s, 'Pendente', %s, %s, %s)
        """
        cursor.execute(sql_insert, (dados.id_evento, dados.id_local, dados.data_hora_inicio, dados.data_hora_fim, valor_total))
        id_reserva = cursor.lastrowid
        conn.commit()

        sql_busca = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_reserva = %s
        """
        cursor.execute(sql_busca, (id_reserva,))
        return cursor.fetchone()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar reserva: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/cliente/{id_cliente}", response_model=List[ReservaResponse])
def listar_reservas_cliente(id_cliente: int):
    """Lista todas as reservas associadas aos eventos de um cliente específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE ev.id_cliente = %s
            ORDER BY r.data_hora_inicio DESC
        """
        cursor.execute(sql, (id_cliente,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/local/{id_local}", response_model=List[ReservaResponse])
def listar_reservas_local(id_local: int):
    """Lista as reservas ativas de um espaço (utilizado para consulta de calendário/disponibilidade)."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_local = %s AND r.status_reserva IN ('Pendente', 'Confirmado')
            ORDER BY r.data_hora_inicio ASC
        """
        cursor.execute(sql, (id_local,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_reserva}", response_model=ReservaResponse)
def buscar_reserva_por_id(id_reserva: int):
    """Retorna os dados completos de uma reserva específica."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_reserva = %s
        """
        cursor.execute(sql, (id_reserva,))
        reserva = cursor.fetchone()
        if not reserva:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada."
            )
        return reserva
    finally:
        cursor.close()
        conn.close()

@router.put("/{id_reserva}/status", response_model=ReservaResponse)
def atualizar_status_reserva(id_reserva: int, dados: ReservaStatusUpdate):
    """Atualiza o status de uma reserva (ex: Confirmado, Cancelado, Concluido)."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_reserva FROM reserva WHERE id_reserva = %s", (id_reserva,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada."
            )

        cursor.execute("UPDATE reserva SET status_reserva = %s WHERE id_reserva = %s", (dados.status_reserva, id_reserva))
        conn.commit()

        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_reserva = %s
        """
        cursor.execute(sql, (id_reserva,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@router.delete("/{id_reserva}")
def cancelar_reserva(id_reserva: int):
    """Cancela ou exclui uma reserva."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_reserva FROM reserva WHERE id_reserva = %s", (id_reserva,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada."
            )

        cursor.execute("DELETE FROM reserva WHERE id_reserva = %s", (id_reserva,))
        conn.commit()
        return {"mensagem": "Reserva cancelada com sucesso."}
    finally:
        cursor.close()
        conn.close()
