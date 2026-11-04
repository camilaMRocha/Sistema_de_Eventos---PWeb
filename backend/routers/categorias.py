from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import CategoriaCreate, CategoriaResponse, CategoriaHierarquiaResponse

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.post("", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_categoria(dados: CategoriaCreate):
    """Cadastra uma nova categoria ou subcategoria no sistema."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        if dados.id_categoria_pai is not None:
            cursor.execute("SELECT id_categoria FROM categoria WHERE id_categoria = %s", (dados.id_categoria_pai,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoria pai informada não existe."
                )

        sql = "INSERT INTO categoria (nome_categoria, id_categoria_pai) VALUES (%s, %s)"
        cursor.execute(sql, (dados.nome_categoria, dados.id_categoria_pai))
        id_categoria = cursor.lastrowid
        conn.commit()

        return CategoriaResponse(
            id_categoria=id_categoria,
            nome_categoria=dados.nome_categoria,
            id_categoria_pai=dados.id_categoria_pai
        )
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[CategoriaResponse])
def listar_categorias():
    """Retorna todas as categorias cadastradas."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_categoria, nome_categoria, id_categoria_pai FROM categoria ORDER BY id_categoria ASC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/hierarquia", response_model=List[CategoriaHierarquiaResponse])
def listar_categorias_hierarquia():
    """Retorna a lista de categorias com os nomes dos tipos pais resolvidos."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_categoria, subcategoria, id_categoria_pai, tipo_evento FROM vw_categoria_hierarquia ORDER BY id_categoria ASC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/tipos", response_model=List[CategoriaResponse])
def listar_tipos_eventos():
    """Retorna apenas as categorias principais (sem pai)."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_categoria, nome_categoria, id_categoria_pai FROM categoria WHERE id_categoria_pai IS NULL ORDER BY nome_categoria ASC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/subcategorias/{id_pai}", response_model=List[CategoriaResponse])
def listar_subcategorias(id_pai: int):
    """Retorna as subcategorias vinculadas a uma categoria pai específica."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_categoria, nome_categoria, id_categoria_pai FROM categoria WHERE id_categoria_pai = %s ORDER BY nome_categoria ASC", (id_pai,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
