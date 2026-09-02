from fastapi import FastAPI, HTTPException, status
from typing import List
from backend.database import criar_conexao
from backend.schemas import (
    ClienteCreate,
    ClienteResponse,
    FornecedorCreate,
    FornecedorResponse,
    LoginRequest
)

app = FastAPI(
    title="HeyEvents API",
    description="API para gestão e organização de eventos",
    version="1.0.0"
)

@app.get("/")
def health_check():
    """Verifica se a API está online."""
    return {"status": "online", "mensagem": "API online"}

@app.post("/clientes", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
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

@app.get("/clientes", response_model=List[ClienteResponse])
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

@app.get("/clientes/{id_cliente}", response_model=ClienteResponse)
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

@app.post("/fornecedores", response_model=FornecedorResponse, status_code=status.HTTP_201_CREATED)
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

@app.get("/fornecedores", response_model=List[FornecedorResponse])
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

@app.get("/fornecedores/{id_fornecedor}", response_model=FornecedorResponse)
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

@app.post("/login")
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
