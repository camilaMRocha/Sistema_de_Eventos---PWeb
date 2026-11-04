from fastapi import APIRouter, HTTPException, status
from backend.database import criar_conexao
from backend.schemas import LoginRequest

router = APIRouter(tags=["Autenticação"])

@router.post("/login")
def autenticar_usuario(dados: LoginRequest):
    """Valida as credenciais de acesso de um usuário."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql_usuario = """
            SELECT id_usuario, email, senha, tipo_usuario, foto_perfil
            FROM usuario
            WHERE email = %s
        """
        cursor.execute(sql_usuario, (dados.email,))
        usuario = cursor.fetchone()

        if not usuario or usuario["senha"] != dados.senha:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos."
            )

        resposta = {
            "id_usuario": usuario["id_usuario"],
            "email": usuario["email"],
            "tipo_usuario": usuario["tipo_usuario"],
            "foto_perfil": usuario["foto_perfil"]
        }

        if usuario["tipo_usuario"] == "Cliente":
            cursor.execute("SELECT id_cliente, nome FROM cliente WHERE id_usuario = %s", (usuario["id_usuario"],))
            cliente = cursor.fetchone()
            if cliente:
                resposta["id_perfil"] = cliente["id_cliente"]
                resposta["nome"] = cliente["nome"]

        elif usuario["tipo_usuario"] == "Fornecedor":
            cursor.execute("SELECT id_fornecedor, nome_fornecedor FROM fornecedor WHERE id_usuario = %s", (usuario["id_usuario"],))
            fornecedor = cursor.fetchone()
            if fornecedor:
                resposta["id_perfil"] = fornecedor["id_fornecedor"]
                resposta["nome"] = fornecedor["nome_fornecedor"]

        return resposta
    finally:
        cursor.close()
        conn.close()
