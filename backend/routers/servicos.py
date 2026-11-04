from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import ServicoCreate, ServicoResponse, ServicoViewResponse

router = APIRouter(prefix="/servicos", tags=["Serviços"])

@router.post("", response_model=ServicoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_servico(dados: ServicoCreate):
    """Cadastra um novo serviço oferecido por um fornecedor."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = %s", (dados.id_fornecedor,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor informado não encontrado."
            )

        if dados.id_funcionario is not None:
            cursor.execute(
                "SELECT id_funcionario FROM funcionario WHERE id_funcionario = %s AND id_fornecedor = %s",
                (dados.id_funcionario, dados.id_fornecedor)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="O funcionário responsável deve pertencer ao mesmo fornecedor."
                )

        sql = """
            INSERT INTO servico (id_fornecedor, id_funcionario, nome, categoria, preco, descricao)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados.id_fornecedor, dados.id_funcionario, dados.nome,
            dados.categoria, dados.preco, dados.descricao
        ))
        id_servico = cursor.lastrowid
        conn.commit()

        return ServicoResponse(
            id_servico=id_servico,
            id_fornecedor=dados.id_fornecedor,
            nome=dados.nome,
            categoria=dados.categoria,
            preco=dados.preco,
            descricao=dados.descricao,
            id_funcionario=dados.id_funcionario
        )
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[ServicoViewResponse])
def listar_servicos():
    """Retorna todos os serviços cadastrados na plataforma com nome do fornecedor e responsável."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_servico, nome, categoria, preco, nome_fornecedor, funcionario_responsavel FROM vw_servicos ORDER BY id_servico DESC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/fornecedor/{id_fornecedor}", response_model=List[ServicoResponse])
def listar_servicos_por_fornecedor(id_fornecedor: int):
    """Retorna todos os serviços de um fornecedor específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM servico WHERE id_fornecedor = %s ORDER BY id_servico DESC", (id_fornecedor,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_servico}", response_model=ServicoResponse)
def buscar_servico_por_id(id_servico: int):
    """Busca os dados de um serviço pelo seu identificador."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM servico WHERE id_servico = %s", (id_servico,))
        servico = cursor.fetchone()
        if not servico:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Serviço não encontrado."
            )
        return servico
    finally:
        cursor.close()
        conn.close()
