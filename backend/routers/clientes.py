from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import ClienteCreate, ClienteResponse

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_cliente(dados: ClienteCreate):
    """Realiza o cadastro de um novo cliente na plataforma."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_usuario FROM usuario WHERE email = %s", (dados.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail já cadastrado no sistema."
            )

        cursor.execute("SELECT id_cliente FROM cliente WHERE cpf = %s", (dados.cpf,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CPF já cadastrado no sistema."
            )

        sql_usuario = """
            INSERT INTO usuario (email, senha, tipo_usuario, foto_perfil)
            VALUES (%s, %s, 'Cliente', %s)
        """
        cursor.execute(sql_usuario, (dados.email, dados.senha, dados.foto_perfil))
        id_usuario = cursor.lastrowid

        sql_cliente = """
            INSERT INTO cliente (
                id_usuario, nome, cpf, data_nascimento, telefone,
                rua, numero, bairro, cidade, estado, cep, complemento
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql_cliente, (
            id_usuario, dados.nome, dados.cpf, dados.data_nascimento, dados.telefone,
            dados.rua, dados.numero, dados.bairro, dados.cidade, dados.estado, dados.cep, dados.complemento
        ))
        id_cliente = cursor.lastrowid

        conn.commit()

        return ClienteResponse(
            id_cliente=id_cliente,
            id_usuario=id_usuario,
            nome=dados.nome,
            cpf=dados.cpf,
            telefone=dados.telefone,
            email=dados.email,
            cidade=dados.cidade,
            estado=dados.estado,
            data_nascimento=dados.data_nascimento,
            rua=dados.rua,
            numero=dados.numero,
            bairro=dados.bairro,
            cep=dados.cep,
            complemento=dados.complemento,
            foto_perfil=dados.foto_perfil
        )
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cadastrar cliente: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[ClienteResponse])
def listar_clientes():
    """Retorna a lista de todos os clientes cadastrados."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT c.*, u.email, u.foto_perfil
            FROM cliente c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            ORDER BY c.id_cliente DESC
        """
        cursor.execute(sql)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_cliente}", response_model=ClienteResponse)
def buscar_cliente_por_id(id_cliente: int):
    """Busca os dados de um cliente pelo seu identificador."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT c.*, u.email, u.foto_perfil
            FROM cliente c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            WHERE c.id_cliente = %s
        """
        cursor.execute(sql, (id_cliente,))
        cliente = cursor.fetchone()
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado."
            )
        return cliente
    finally:
        cursor.close()
        conn.close()
