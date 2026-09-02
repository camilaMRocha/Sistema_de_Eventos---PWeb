from fastapi import FastAPI, HTTPException, status
from typing import List, Optional
from backend.database import criar_conexao
from backend.schemas import (
    ClienteCreate,
    ClienteResponse,
    FornecedorCreate,
    FornecedorResponse,
    LoginRequest,
    CategoriaCreate,
    CategoriaResponse,
    CategoriaHierarquiaResponse,
    FuncionarioCreate,
    FuncionarioResponse,
    ServicoCreate,
    ServicoResponse,
    ServicoViewResponse,
    LocalCreate,
    LocalResponse,
    LocalCardResponse
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

@app.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
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

@app.get("/categorias", response_model=List[CategoriaResponse])
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

@app.get("/categorias/hierarquia", response_model=List[CategoriaHierarquiaResponse])
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

@app.get("/categorias/tipos", response_model=List[CategoriaResponse])
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

@app.get("/categorias/subcategorias/{id_pai}", response_model=List[CategoriaResponse])
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

@app.post("/funcionarios", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED)
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

@app.get("/funcionarios", response_model=List[FuncionarioResponse])
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

@app.get("/funcionarios/fornecedor/{id_fornecedor}", response_model=List[FuncionarioResponse])
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

@app.get("/funcionarios/{id_funcionario}", response_model=FuncionarioResponse)
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

@app.post("/servicos", response_model=ServicoResponse, status_code=status.HTTP_201_CREATED)
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

@app.get("/servicos", response_model=List[ServicoViewResponse])
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

@app.get("/servicos/fornecedor/{id_fornecedor}", response_model=List[ServicoResponse])
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

@app.get("/servicos/{id_servico}", response_model=ServicoResponse)
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

@app.post("/locais", response_model=LocalResponse, status_code=status.HTTP_201_CREATED)
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

@app.get("/locais", response_model=List[LocalCardResponse])
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

@app.get("/locais/fornecedor/{id_fornecedor}", response_model=List[LocalResponse])
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

@app.get("/locais/{id_local}", response_model=LocalCardResponse)
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
