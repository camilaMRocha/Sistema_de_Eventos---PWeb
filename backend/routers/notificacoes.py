from fastapi import APIRouter, status
from typing import List
from backend.database import criar_conexao
from backend.schemas.notificacao import NotificacaoCreate, NotificacaoResponse

router = APIRouter(prefix="/notificacoes", tags=["Notificações"])


def enviar_notificacao_usuario(id_usuario: int, mensagem: str):
    """Grava uma notificação para um usuário específico."""
    conn = criar_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO notificacao (id_usuario, mensagem, data_envio, visualizada) VALUES (%s, %s, NOW(), FALSE)",
            (id_usuario, mensagem)
        )
        conn.commit()
    except Exception as e:
        print(f"Erro ao enviar notificação: {e}")
    finally:
        cursor.close()
        conn.close()

def notificar_cliente(id_cliente: int, mensagem: str):
    """Descobre o id_usuario de um cliente e grava a notificação."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_usuario FROM cliente WHERE id_cliente = %s", (id_cliente,))
        cli = cursor.fetchone()
        if cli:
            cursor.execute(
                "INSERT INTO notificacao (id_usuario, mensagem, data_envio, visualizada) VALUES (%s, %s, NOW(), FALSE)",
                (cli["id_usuario"], mensagem)
            )
            conn.commit()
    except Exception as e:
        print(f"Erro ao notificar cliente: {e}")
    finally:
        cursor.close()
        conn.close()

def notificar_fornecedor(id_fornecedor: int, mensagem: str):
    """Descobre o id_usuario de um fornecedor e grava a notificação."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_usuario FROM fornecedor WHERE id_fornecedor = %s", (id_fornecedor,))
        forn = cursor.fetchone()
        if forn:
            cursor.execute(
                "INSERT INTO notificacao (id_usuario, mensagem, data_envio, visualizada) VALUES (%s, %s, NOW(), FALSE)",
                (forn["id_usuario"], mensagem)
            )
            conn.commit()
    except Exception as e:
        print(f"Erro ao notificar fornecedor: {e}")
    finally:
        cursor.close()
        conn.close()



@router.get("/pendentes/{id_usuario}", response_model=List[NotificacaoResponse])
def listar_notificacoes_pendentes(id_usuario: int):
    """Retorna todas as notificações não lidas de um usuário utilizando a View 1.2."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT id_notificacao, id_usuario, mensagem, data_envio, FALSE AS visualizada
            FROM vw_notificacoes_pendentes
            WHERE id_usuario = %s
            ORDER BY data_envio DESC
        """
        cursor.execute(sql, (id_usuario,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/usuario/{id_usuario}", response_model=List[NotificacaoResponse])
def listar_todas_notificacoes_usuario(id_usuario: int, limit: int = 50):
    """Retorna todas as notificações do usuário (lidas e não lidas) com limite configurável."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT id_notificacao, id_usuario, mensagem, data_envio, visualizada
            FROM notificacao
            WHERE id_usuario = %s
            ORDER BY data_envio DESC
            LIMIT %s
        """
        cursor.execute(sql, (id_usuario, limit))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/contador/{id_usuario}")
def contar_notificacoes_pendentes(id_usuario: int):
    """Retorna a contagem de notificações não lidas para exibição do selo no sino."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = "SELECT COUNT(*) AS total_pendentes FROM vw_notificacoes_pendentes WHERE id_usuario = %s"
        cursor.execute(sql, (id_usuario,))
        resultado = cursor.fetchone()
        return {"total_pendentes": resultado["total_pendentes"] if resultado else 0}
    finally:
        cursor.close()
        conn.close()

@router.put("/{id_notificacao}/lida")
def marcar_como_lida(id_notificacao: int):
    """Marca uma notificação específica como lida."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("UPDATE notificacao SET visualizada = TRUE WHERE id_notificacao = %s", (id_notificacao,))
        conn.commit()
        return {"mensagem": "Notificação marcada como lida."}
    finally:
        cursor.close()
        conn.close()

@router.put("/usuario/{id_usuario}/marcar-todas-lidas")
def marcar_todas_como_lidas(id_usuario: int):
    """Marca todas as notificações pendentes de um usuário como lidas."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("UPDATE notificacao SET visualizada = TRUE WHERE id_usuario = %s", (id_usuario,))
        conn.commit()
        return {"mensagem": "Todas as notificações foram marcadas como lidas."}
    finally:
        cursor.close()
        conn.close()

@router.post("", response_model=NotificacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_notificacao(dados: NotificacaoCreate):
    """Cria manualmente uma notificação para um usuário."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = "INSERT INTO notificacao (id_usuario, mensagem, data_envio, visualizada) VALUES (%s, %s, NOW(), FALSE)"
        cursor.execute(sql, (dados.id_usuario, dados.mensagem))
        id_notificacao = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM notificacao WHERE id_notificacao = %s", (id_notificacao,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
