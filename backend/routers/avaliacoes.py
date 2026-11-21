from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from backend.database import criar_conexao
from backend.schemas.avaliacao import AvaliacaoCreate, AvaliacaoResponse

router = APIRouter(prefix="/avaliacoes", tags=["Avaliações"])

@router.post("", response_model=AvaliacaoResponse, status_code=status.HTTP_201_CREATED)
def registrar_avaliacao(dados: AvaliacaoCreate):
    """
    Registra ou atualiza a avaliação de um cliente para um local ou serviço vinculado a uma reserva concluída.
    Regras de Negócio aplicadas:
    - RN09 (Exclusividade): Avaliação deve apontar para um local OU serviço, nunca ambos ou nenhum.
    - RN07 (Avaliação Pós-Evento): O cliente só pode avaliar se tiver uma reserva com status 'Concluido'.
    """
    # Validação RN09: exclusividade do alvo
    if (dados.id_local is None and dados.id_servico is None) or (dados.id_local is not None and dados.id_servico is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A avaliação deve referenciar exatamente um alvo: ou um local ou um serviço (RN09)."
        )

    # Validação da nota (1 a 5)
    if dados.nota < 1 or dados.nota > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nota da avaliação deve ser um valor inteiro entre 1 e 5."
        )

    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        # Verificar se o cliente existe
        cursor.execute("SELECT nome FROM cliente WHERE id_cliente = %s", (dados.id_cliente,))
        cli = cursor.fetchone()
        if not cli:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente informado não encontrado."
            )
        nome_cliente = cli["nome"]

        id_reserva_alvo = dados.id_reserva

        # Se id_reserva for fornecido diretamente
        if id_reserva_alvo is not None:
            cursor.execute("""
                SELECT r.id_reserva, r.id_local, r.status_reserva, e.id_cliente
                FROM reserva r
                JOIN evento e ON r.id_evento = e.id_evento
                WHERE r.id_reserva = %s
            """, (id_reserva_alvo,))
            res_info = cursor.fetchone()
            if not res_info:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Reserva informada não encontrada."
                )
            if res_info["id_cliente"] != dados.id_cliente:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Você só pode avaliar reservas dos seus próprios eventos."
                )
            if res_info["status_reserva"] != "Concluido":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Você só pode avaliar um espaço após a realização de um evento com reserva concluída (RN07)."
                )

            id_local_efetivo = dados.id_local or res_info["id_local"]

            # Verificar se já existe avaliação para esta reserva específica (upsert por reserva)
            cursor.execute(
                "SELECT id_avaliacao FROM avaliacao WHERE id_reserva = %s",
                (id_reserva_alvo,)
            )
            existente = cursor.fetchone()
            if existente:
                cursor.execute("""
                    UPDATE avaliacao
                    SET nota = %s, comentario = %s, data_avaliacao = NOW()
                    WHERE id_avaliacao = %s
                """, (dados.nota, dados.comentario, existente["id_avaliacao"]))
                id_avaliacao = existente["id_avaliacao"]
            else:
                cursor.execute("""
                    INSERT INTO avaliacao (id_cliente, id_local, id_servico, id_reserva, nota, comentario, data_avaliacao)
                    VALUES (%s, %s, NULL, %s, %s, %s, NOW())
                """, (dados.id_cliente, id_local_efetivo, id_reserva_alvo, dados.nota, dados.comentario))
                id_avaliacao = cursor.lastrowid

        elif dados.id_local is not None:
            # Caso não tenha enviado id_reserva explicitamente, busca a reserva concluída mais recente
            sql_check = """
                SELECT r.id_reserva
                FROM reserva r
                JOIN evento e ON r.id_evento = e.id_evento
                WHERE e.id_cliente = %s AND r.id_local = %s AND r.status_reserva = 'Concluido'
                ORDER BY r.id_reserva DESC
                LIMIT 1
            """
            cursor.execute(sql_check, (dados.id_cliente, dados.id_local))
            reserva_concluida = cursor.fetchone()
            if not reserva_concluida:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Você só pode avaliar um local após a realização de um evento com reserva concluída (RN07)."
                )
            id_reserva_alvo = reserva_concluida["id_reserva"]

            cursor.execute(
                "SELECT id_avaliacao FROM avaliacao WHERE id_reserva = %s",
                (id_reserva_alvo,)
            )
            existente = cursor.fetchone()
            if existente:
                cursor.execute("""
                    UPDATE avaliacao
                    SET nota = %s, comentario = %s, data_avaliacao = NOW()
                    WHERE id_avaliacao = %s
                """, (dados.nota, dados.comentario, existente["id_avaliacao"]))
                id_avaliacao = existente["id_avaliacao"]
            else:
                cursor.execute("""
                    INSERT INTO avaliacao (id_cliente, id_local, id_servico, id_reserva, nota, comentario, data_avaliacao)
                    VALUES (%s, %s, NULL, %s, %s, %s, NOW())
                """, (dados.id_cliente, dados.id_local, id_reserva_alvo, dados.nota, dados.comentario))
                id_avaliacao = cursor.lastrowid

        elif dados.id_servico is not None:
            sql_check = """
                SELECT rs.id_reserva_servico, r.id_reserva
                FROM reserva_servico rs
                JOIN reserva r ON rs.id_reserva = r.id_reserva
                JOIN evento e ON r.id_evento = e.id_evento
                WHERE e.id_cliente = %s AND rs.id_servico = %s AND r.status_reserva = 'Concluido'
                ORDER BY r.id_reserva DESC
                LIMIT 1
            """
            cursor.execute(sql_check, (dados.id_cliente, dados.id_servico))
            servico_concluido = cursor.fetchone()
            if not servico_concluido:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Você só pode avaliar um serviço após a realização de um evento com reserva concluída (RN07)."
                )
            id_reserva_alvo = servico_concluido["id_reserva"]

            cursor.execute(
                "SELECT id_avaliacao FROM avaliacao WHERE id_cliente = %s AND id_servico = %s AND id_reserva = %s",
                (dados.id_cliente, dados.id_servico, id_reserva_alvo)
            )
            existente = cursor.fetchone()
            if existente:
                cursor.execute("""
                    UPDATE avaliacao
                    SET nota = %s, comentario = %s, data_avaliacao = NOW()
                    WHERE id_avaliacao = %s
                """, (dados.nota, dados.comentario, existente["id_avaliacao"]))
                id_avaliacao = existente["id_avaliacao"]
            else:
                cursor.execute("""
                    INSERT INTO avaliacao (id_cliente, id_local, id_servico, id_reserva, nota, comentario, data_avaliacao)
                    VALUES (%s, NULL, %s, %s, %s, %s, NOW())
                """, (dados.id_cliente, dados.id_servico, id_reserva_alvo, dados.nota, dados.comentario))
                id_avaliacao = cursor.lastrowid

        conn.commit()

        # Obter registro recém-gravado
        cursor.execute("SELECT * FROM avaliacao WHERE id_avaliacao = %s", (id_avaliacao,))
        row = cursor.fetchone()

        return AvaliacaoResponse(
            id_avaliacao=row["id_avaliacao"],
            id_cliente=row["id_cliente"],
            nome_cliente=nome_cliente,
            id_local=row["id_local"],
            id_servico=row["id_servico"],
            id_reserva=row["id_reserva"],
            nota=row["nota"],
            comentario=row["comentario"],
            data_avaliacao=row["data_avaliacao"]
        )
    finally:
        cursor.close()
        conn.close()

@router.get("/local/{id_local}", response_model=List[AvaliacaoResponse])
def listar_avaliacoes_do_local(id_local: int):
    """Retorna o histórico de avaliações e comentários recebidos por um local."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT a.id_avaliacao, a.id_cliente, c.nome AS nome_cliente,
                   a.id_local, a.id_servico, a.id_reserva, a.nota, a.comentario, a.data_avaliacao
            FROM avaliacao a
            JOIN cliente c ON a.id_cliente = c.id_cliente
            WHERE a.id_local = %s
            ORDER BY a.data_avaliacao DESC
        """
        cursor.execute(sql, (id_local,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/local/{id_local}/cliente/{id_cliente}", response_model=Optional[AvaliacaoResponse])
def buscar_avaliacao_cliente_local(id_local: int, id_cliente: int):
    """Busca a última avaliação enviada por um cliente específico para um determinado local."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT a.id_avaliacao, a.id_cliente, c.nome AS nome_cliente,
                   a.id_local, a.id_servico, a.id_reserva, a.nota, a.comentario, a.data_avaliacao
            FROM avaliacao a
            JOIN cliente c ON a.id_cliente = c.id_cliente
            WHERE a.id_local = %s AND a.id_cliente = %s
            ORDER BY a.data_avaliacao DESC
            LIMIT 1
        """
        cursor.execute(sql, (id_local, id_cliente))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@router.get("/cliente/{id_cliente}", response_model=List[AvaliacaoResponse])
def listar_avaliacoes_do_cliente(id_cliente: int):
    """Retorna todas as avaliações feitas por um determinado cliente."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT a.id_avaliacao, a.id_cliente, c.nome AS nome_cliente,
                   a.id_local, a.id_servico, a.id_reserva, a.nota, a.comentario, a.data_avaliacao
            FROM avaliacao a
            JOIN cliente c ON a.id_cliente = c.id_cliente
            WHERE a.id_cliente = %s
            ORDER BY a.data_avaliacao DESC
        """
        cursor.execute(sql, (id_cliente,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
