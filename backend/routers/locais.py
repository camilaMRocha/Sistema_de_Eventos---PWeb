from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from backend.database import criar_conexao
from backend.schemas import LocalCreate, LocalUpdate, LocalResponse, LocalCardResponse

router = APIRouter(prefix="/locais", tags=["Locais"])

@router.post("", response_model=LocalResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_local(dados: LocalCreate):
    """Cadastra um novo espaço para eventos pertencente a um fornecedor."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = %s", (dados.id_fornecedor,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor informado não encontrado."
            )

        sql_local = """
            INSERT INTO local (
                id_fornecedor, nome, rua, numero, bairro, cidade, estado,
                cep, complemento, capacidade, preco_diaria, descricao,
                quartos, banheiros, vagas_estacionamento, metragem
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql_local, (
            dados.id_fornecedor, dados.nome, dados.rua, dados.numero,
            dados.bairro, dados.cidade, dados.estado, dados.cep,
            dados.complemento, dados.capacidade, dados.preco_diaria,
            dados.descricao, dados.quartos, dados.banheiros,
            dados.vagas_estacionamento, dados.metragem
        ))
        id_local = cursor.lastrowid

        if dados.categorias_ids:
            for cat_id in dados.categorias_ids:
                cursor.execute(
                    "INSERT IGNORE INTO local_categoria (id_local, id_categoria) VALUES (%s, %s)",
                    (id_local, cat_id)
                )

        if dados.fotos_urls:
            for idx, url in enumerate(dados.fotos_urls, start=1):
                cursor.execute(
                    "INSERT INTO local_imagem (id_local, url_imagem, ordem) VALUES (%s, %s, %s)",
                    (id_local, url, idx)
                )

        conn.commit()

        return LocalResponse(
            id_local=id_local,
            id_fornecedor=dados.id_fornecedor,
            nome=dados.nome,
            rua=dados.rua,
            numero=dados.numero,
            bairro=dados.bairro,
            cidade=dados.cidade,
            estado=dados.estado,
            cep=dados.cep,
            complemento=dados.complemento,
            capacidade=dados.capacidade,
            preco_diaria=dados.preco_diaria,
            descricao=dados.descricao,
            quartos=dados.quartos,
            banheiros=dados.banheiros,
            vagas_estacionamento=dados.vagas_estacionamento,
            metragem=dados.metragem
        )
    finally:
        cursor.close()
        conn.close()

@router.get("", response_model=List[LocalCardResponse])
def listar_locais(
    cidade: Optional[str] = None,
    capacidade_min: Optional[int] = None,
    preco_max: Optional[float] = None
):
    """Lista todos os locais disponíveis com filtros opcionais de busca."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        filtros = []
        valores = []

        if cidade:
            filtros.append("cidade LIKE %s")
            valores.append(f"%{cidade}%")
        if capacidade_min is not None:
            filtros.append("capacidade >= %s")
            valores.append(capacidade_min)
        if preco_max is not None:
            filtros.append("preco_diaria <= %s")
            valores.append(preco_max)

        clausula_where = ""
        if filtros:
            clausula_where = "WHERE " + " AND ".join(filtros)

        sql = f"SELECT * FROM vw_local_cartao {clausula_where} ORDER BY id_local DESC"
        cursor.execute(sql, tuple(valores))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/fornecedor/{id_fornecedor}", response_model=List[LocalResponse])
def listar_locais_por_fornecedor(id_fornecedor: int):
    """Retorna os locais administrados por um fornecedor específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM local WHERE id_fornecedor = %s ORDER BY id_local DESC", (id_fornecedor,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{id_local}", response_model=LocalCardResponse)
def buscar_local_por_id(id_local: int):
    """Retorna as informações completas de um local específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM vw_local_cartao WHERE id_local = %s", (id_local,))
        local = cursor.fetchone()
        if not local:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Local não encontrado."
            )
        return local
    finally:
        cursor.close()
        conn.close()

@router.put("/{id_local}", response_model=LocalCardResponse)
def atualizar_local(id_local: int, dados: LocalUpdate):
    """Atualiza as informações de um local existente."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM local WHERE id_local = %s", (id_local,))
        local_atual = cursor.fetchone()
        if not local_atual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Local não encontrado."
            )

        campos = []
        valores = []

        if dados.id_fornecedor is not None:
            campos.append("id_fornecedor = %s")
            valores.append(dados.id_fornecedor)
        if dados.nome is not None:
            campos.append("nome = %s")
            valores.append(dados.nome)
        if dados.rua is not None:
            campos.append("rua = %s")
            valores.append(dados.rua)
        if dados.numero is not None:
            campos.append("numero = %s")
            valores.append(dados.numero)
        if dados.bairro is not None:
            campos.append("bairro = %s")
            valores.append(dados.bairro)
        if dados.cidade is not None:
            campos.append("cidade = %s")
            valores.append(dados.cidade)
        if dados.estado is not None:
            campos.append("estado = %s")
            valores.append(dados.estado)
        if dados.cep is not None:
            campos.append("cep = %s")
            valores.append(dados.cep)
        if dados.complemento is not None:
            campos.append("complemento = %s")
            valores.append(dados.complemento)
        if dados.capacidade is not None:
            campos.append("capacidade = %s")
            valores.append(dados.capacidade)
        if dados.preco_diaria is not None:
            campos.append("preco_diaria = %s")
            valores.append(dados.preco_diaria)
        if dados.metragem is not None:
            campos.append("metragem = %s")
            valores.append(dados.metragem)
        if dados.descricao is not None:
            campos.append("descricao = %s")
            valores.append(dados.descricao)
        if dados.quartos is not None:
            campos.append("quartos = %s")
            valores.append(dados.quartos)
        if dados.banheiros is not None:
            campos.append("banheiros = %s")
            valores.append(dados.banheiros)
        if dados.vagas_estacionamento is not None:
            campos.append("vagas_estacionamento = %s")
            valores.append(dados.vagas_estacionamento)

        if campos:
            valores.append(id_local)
            sql = f"UPDATE local SET {', '.join(campos)} WHERE id_local = %s"
            cursor.execute(sql, tuple(valores))

        if dados.categorias_ids is not None:
            cursor.execute("DELETE FROM local_categoria WHERE id_local = %s", (id_local,))
            for cat_id in dados.categorias_ids:
                cursor.execute(
                    "INSERT IGNORE INTO local_categoria (id_local, id_categoria) VALUES (%s, %s)",
                    (id_local, cat_id)
                )

        if dados.fotos_urls is not None:
            cursor.execute("DELETE FROM local_imagem WHERE id_local = %s", (id_local,))
            for idx, url in enumerate(dados.fotos_urls, start=1):
                cursor.execute(
                    "INSERT INTO local_imagem (id_local, url_imagem, ordem) VALUES (%s, %s, %s)",
                    (id_local, url, idx)
                )

        conn.commit()

        cursor.execute("SELECT * FROM vw_local_cartao WHERE id_local = %s", (id_local,))
        return cursor.fetchone()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar local: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@router.delete("/{id_local}")
def excluir_local(id_local: int):
    """Exclui um local do sistema."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_local FROM local WHERE id_local = %s", (id_local,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Local não encontrado."
            )

        cursor.execute("DELETE FROM local WHERE id_local = %s", (id_local,))
        conn.commit()
        return {"mensagem": "Local excluído com sucesso."}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir local: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()
