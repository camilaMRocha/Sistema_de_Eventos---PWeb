from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import FornecedorCreate, FornecedorResponse

router = APIRouter(prefix="/fornecedores", tags=["Fornecedores"])

@router.post("", response_model=FornecedorResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_fornecedor(dados: FornecedorCreate):
    """Realiza o cadastro de uma nova empresa fornecedora na plataforma."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_usuario FROM usuario WHERE email = %s", (dados.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail já cadastrado no sistema."
            )

        cursor.execute("SELECT id_fornecedor FROM fornecedor WHERE cnpj = %s", (dados.cnpj,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CNPJ já cadastrado no sistema."
            )

        sql_usuario = """
            INSERT INTO usuario (email, senha, tipo_usuario, foto_perfil)
            VALUES (%s, %s, 'Fornecedor', %s)
        """
        cursor.execute(sql_usuario, (dados.email, dados.senha, dados.foto_perfil))
        id_usuario = cursor.lastrowid

        sql_fornecedor = """
            INSERT INTO fornecedor (
                id_usuario, nome_fornecedor, cnpj, data_nascimento_responsavel,
                telefone, categoria_atuacao, rua, numero, bairro, cidade, estado,
                cep, complemento, nome_banco, agencia, tipo_conta, titular_conta
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql_fornecedor, (
            id_usuario, dados.nome_fornecedor, dados.cnpj, dados.data_nascimento_responsavel,
            dados.telefone, dados.categoria_atuacao, dados.rua, dados.numero, dados.bairro,
            dados.cidade, dados.estado, dados.cep, dados.complemento, dados.nome_banco,
            dados.agencia, dados.tipo_conta, dados.titular_conta
        ))
        id_fornecedor = cursor.lastrowid

        conn.commit()

        return FornecedorResponse(
            id_fornecedor=id_fornecedor,
            id_usuario=id_usuario,
            nome_fornecedor=dados.nome_fornecedor,
            cnpj=dados.cnpj,
            telefone=dados.telefone,
            categoria_atuacao=dados.categoria_atuacao,
            email=dados.email,
            cidade=dados.cidade,
            estado=dados.estado,
            data_nascimento_responsavel=dados.data_nascimento_responsavel,
            rua=dados.rua,
            numero=dados.numero,
            bairro=dados.bairro,
            cep=dados.cep,
            complemento=dados.complemento,
            nome_banco=dados.nome_banco,
            agencia=dados.agencia,
            tipo_conta=dados.tipo_conta,
            titular_conta=dados.titular_conta,
            foto_perfil=dados.foto_perfil
        )
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cadastrar fornecedor: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[FornecedorResponse])
def listar_fornecedores():
    """Retorna a lista de todos os fornecedores cadastrados."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT f.*, u.email, u.foto_perfil
            FROM fornecedor f
            JOIN usuario u ON f.id_usuario = u.id_usuario
            ORDER BY f.id_fornecedor DESC
        """
        cursor.execute(sql)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_fornecedor}", response_model=FornecedorResponse)
def buscar_fornecedor_por_id(id_fornecedor: int):
    """Busca os dados de um fornecedor pelo seu identificador."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT f.*, u.email, u.foto_perfil
            FROM fornecedor f
            JOIN usuario u ON f.id_usuario = u.id_usuario
            WHERE f.id_fornecedor = %s
        """
        cursor.execute(sql, (id_fornecedor,))
        fornecedor = cursor.fetchone()
        if not fornecedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor não encontrado."
            )
        return fornecedor
    finally:
        cursor.close()
        conn.close()
