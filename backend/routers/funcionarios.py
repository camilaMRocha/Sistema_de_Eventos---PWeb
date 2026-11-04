from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import FuncionarioCreate, FuncionarioResponse

router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])

@router.post("", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_funcionario(dados: FuncionarioCreate):
    """Cadastra um novo profissional vinculado a uma empresa fornecedora."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = %s", (dados.id_fornecedor,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor informado não encontrado."
            )

        cursor.execute("SELECT id_funcionario FROM funcionario WHERE email = %s", (dados.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail de funcionário já cadastrado."
            )

        cursor.execute("SELECT id_funcionario FROM funcionario WHERE cpf_cnpj = %s", (dados.cpf_cnpj,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CPF/CNPJ de funcionário já cadastrado."
            )

        sql = """
            INSERT INTO funcionario (
                id_fornecedor, nome_completo, email, cpf_cnpj, data_nascimento,
                telefone, rua, numero, bairro, cidade, estado, cep,
                funcao_exercida, descricao_funcao, foto_perfil, nome_banco,
                agencia, tipo_conta, titular_conta
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados.id_fornecedor, dados.nome_completo, dados.email, dados.cpf_cnpj,
            dados.data_nascimento, dados.telefone, dados.rua, dados.numero,
            dados.bairro, dados.cidade, dados.estado, dados.cep, dados.funcao_exercida,
            dados.descricao_funcao, dados.foto_perfil, dados.nome_banco,
            dados.agencia, dados.tipo_conta, dados.titular_conta
        ))
        id_funcionario = cursor.lastrowid
        conn.commit()

        return FuncionarioResponse(
            id_funcionario=id_funcionario,
            id_fornecedor=dados.id_fornecedor,
            nome_completo=dados.nome_completo,
            email=dados.email,
            cpf_cnpj=dados.cpf_cnpj,
            telefone=dados.telefone,
            funcao_exercida=dados.funcao_exercida,
            descricao_funcao=dados.descricao_funcao,
            data_nascimento=dados.data_nascimento,
            rua=dados.rua,
            numero=dados.numero,
            bairro=dados.bairro,
            cidade=dados.cidade,
            estado=dados.estado,
            cep=dados.cep,
            nome_banco=dados.nome_banco,
            agencia=dados.agencia,
            tipo_conta=dados.tipo_conta,
            titular_conta=dados.titular_conta,
            foto_perfil=dados.foto_perfil
        )
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[FuncionarioResponse])
def listar_funcionarios():
    """Retorna a lista de todos os funcionários cadastrados."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM funcionario ORDER BY id_funcionario DESC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/fornecedor/{id_fornecedor}", response_model=List[FuncionarioResponse])
def listar_funcionarios_por_fornecedor(id_fornecedor: int):
    """Retorna os funcionários vinculados a um fornecedor específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM funcionario WHERE id_fornecedor = %s ORDER BY id_funcionario DESC", (id_fornecedor,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_funcionario}", response_model=FuncionarioResponse)
def buscar_funcionario_por_id(id_funcionario: int):
    """Busca os dados de um funcionário pelo seu identificador."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM funcionario WHERE id_funcionario = %s", (id_funcionario,))
        funcionario = cursor.fetchone()
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionário não encontrado."
            )
        return funcionario
    finally:
        cursor.close()
        conn.close()
