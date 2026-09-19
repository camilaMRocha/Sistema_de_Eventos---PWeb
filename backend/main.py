from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
    LocalUpdate,
    LocalResponse,
    LocalCardResponse,
    EventoCreate,
    EventoUpdate,
    EventoResponse,
    ReservaCreate,
    ReservaStatusUpdate,
    ReservaResponse
)

app = FastAPI(
    title="HeyEvents API",
    description="API para gestão e organização de eventos",
    version="1.0.0"
)

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.get("/")
def pagina_inicial():
    return FileResponse("frontend/index.html")

@app.get("/login")
def pagina_login():
    return FileResponse("frontend/login.html")

@app.get("/cadastro")
def pagina_cadastro():
    return FileResponse("frontend/cadastro.html")

@app.get("/meus-eventos")
def pagina_meus_eventos():
    return FileResponse("frontend/meus_eventos.html")

@app.get("/cadastro-de-evento")
def pagina_cadastro_evento():
    return FileResponse("frontend/cadastro_evento.html")

@app.get("/reserva")
def pagina_reserva():
    return FileResponse("frontend/reserva.html")

@app.get("/cadastro-de-cliente")
def pagina_cadastro_cliente():
    return FileResponse("frontend/cadastro_cliente.html")

@app.get("/cadastro-de-fornecedor")
def pagina_cadastro_fornecedor():
    return FileResponse("frontend/cadastro_fornecedor.html")

@app.get("/cadastro-de-funcionario")
def pagina_cadastro_funcionario():
    return FileResponse("frontend/cadastro_funcionario.html")

@app.get("/cadastro-de-local")
def pagina_cadastro_local():
    return FileResponse("frontend/cadastro_local.html")

@app.get("/visualizar-locais")
def pagina_visualizar_locais():
    return FileResponse("frontend/locais.html")

@app.get("/cadastro-de-servico")
def pagina_cadastro_servico():
    return FileResponse("frontend/cadastro_servico.html")

@app.get("/visualizar-servicos")
def pagina_visualizar_servicos():
    return FileResponse("frontend/servicos.html")

@app.get("/status")
def health_check():
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

@app.put("/locais/{id_local}", response_model=LocalCardResponse)
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

@app.delete("/locais/{id_local}")
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


@app.post("/eventos", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_evento(dados: EventoCreate):
    """Realiza o cadastro de um novo evento pelo cliente."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_cliente FROM cliente WHERE id_cliente = %s", (dados.id_cliente,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado."
            )

        cursor.execute("SELECT id_categoria FROM categoria WHERE id_categoria = %s", (dados.id_categoria,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada."
            )

        sql = """
            INSERT INTO evento (
                id_cliente, id_categoria, nome_evento, formato, visibilidade,
                data_hora_inicio, data_hora_termino, descricao_evento, orcamento_estimado
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados.id_cliente, dados.id_categoria, dados.nome_evento,
            dados.formato or 'Presencial', dados.visibilidade or 'Privado',
            dados.data_hora_inicio, dados.data_hora_termino,
            dados.descricao_evento, dados.orcamento_estimado or 0.0
        ))
        id_evento = cursor.lastrowid

        if dados.fotos_urls:
            for ordem, url in enumerate(dados.fotos_urls, start=1):
                if url and url.strip():
                    cursor.execute(
                        "INSERT INTO evento_imagem (id_evento, url_imagem, ordem) VALUES (%s, %s, %s)",
                        (id_evento, url.strip(), ordem)
                    )

        conn.commit()

        cursor.execute("""
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            WHERE e.id_evento = %s
        """, (id_evento,))
        evento = cursor.fetchone()
        evento["fotos_urls"] = dados.fotos_urls or []
        return evento
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cadastrar evento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@app.get("/eventos/cliente/{id_cliente}", response_model=List[EventoResponse])
def listar_eventos_do_cliente(id_cliente: int):
    """Retorna a lista de eventos pertencentes a um cliente específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento,
                   l.nome AS local_reservado, r.status_reserva
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            LEFT JOIN reserva r ON r.id_evento = e.id_evento AND r.status_reserva <> 'Cancelado'
            LEFT JOIN local l ON r.id_local = l.id_local
            WHERE e.id_cliente = %s
            ORDER BY e.data_hora_inicio DESC
        """
        cursor.execute(sql, (id_cliente,))
        eventos = cursor.fetchall()

        for ev in eventos:
            cursor.execute(
                "SELECT url_imagem FROM evento_imagem WHERE id_evento = %s ORDER BY ordem ASC",
                (ev["id_evento"],)
            )
            imagens = [img["url_imagem"] for img in cursor.fetchall()]
            ev["fotos_urls"] = imagens

        return eventos
    finally:
        cursor.close()
        conn.close()

@app.get("/eventos/{id_evento}", response_model=EventoResponse)
def buscar_evento_por_id(id_evento: int):
    """Busca os detalhes de um evento específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento,
                   l.nome AS local_reservado, r.status_reserva
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            LEFT JOIN reserva r ON r.id_evento = e.id_evento AND r.status_reserva <> 'Cancelado'
            LEFT JOIN local l ON r.id_local = l.id_local
            WHERE e.id_evento = %s
        """
        cursor.execute(sql, (id_evento,))
        evento = cursor.fetchone()
        if not evento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado."
            )

        cursor.execute(
            "SELECT url_imagem FROM evento_imagem WHERE id_evento = %s ORDER BY ordem ASC",
            (id_evento,)
        )
        evento["fotos_urls"] = [img["url_imagem"] for img in cursor.fetchall()]
        return evento
    finally:
        cursor.close()
        conn.close()

@app.put("/eventos/{id_evento}", response_model=EventoResponse)
def atualizar_evento(id_evento: int, dados: EventoUpdate):
    """Atualiza as informações de um evento existente."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM evento WHERE id_evento = %s", (id_evento,))
        evento_atual = cursor.fetchone()
        if not evento_atual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado."
            )

        campos = []
        valores = []

        if dados.nome_evento is not None:
            campos.append("nome_evento = %s")
            valores.append(dados.nome_evento)
        if dados.id_categoria is not None:
            campos.append("id_categoria = %s")
            valores.append(dados.id_categoria)
        if dados.formato is not None:
            campos.append("formato = %s")
            valores.append(dados.formato)
        if dados.visibilidade is not None:
            campos.append("visibilidade = %s")
            valores.append(dados.visibilidade)
        if dados.data_hora_inicio is not None:
            campos.append("data_hora_inicio = %s")
            valores.append(dados.data_hora_inicio)
        if dados.data_hora_termino is not None:
            campos.append("data_hora_termino = %s")
            valores.append(dados.data_hora_termino)
        if dados.descricao_evento is not None:
            campos.append("descricao_evento = %s")
            valores.append(dados.descricao_evento)
        if dados.orcamento_estimado is not None:
            campos.append("orcamento_estimado = %s")
            valores.append(dados.orcamento_estimado)

        if campos:
            valores.append(id_evento)
            sql = f"UPDATE evento SET {', '.join(campos)} WHERE id_evento = %s"
            cursor.execute(sql, tuple(valores))

        if dados.fotos_urls is not None:
            cursor.execute("DELETE FROM evento_imagem WHERE id_evento = %s", (id_evento,))
            for ordem, url in enumerate(dados.fotos_urls, start=1):
                if url and url.strip():
                    cursor.execute(
                        "INSERT INTO evento_imagem (id_evento, url_imagem, ordem) VALUES (%s, %s, %s)",
                        (id_evento, url.strip(), ordem)
                    )

        conn.commit()

        cursor.execute("""
            SELECT e.*, c.nome_categoria, p.nome_categoria AS tipo_evento
            FROM evento e
            JOIN categoria c ON e.id_categoria = c.id_categoria
            LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria
            WHERE e.id_evento = %s
        """, (id_evento,))
        evento = cursor.fetchone()
        cursor.execute(
            "SELECT url_imagem FROM evento_imagem WHERE id_evento = %s ORDER BY ordem ASC",
            (id_evento,)
        )
        evento["fotos_urls"] = [img["url_imagem"] for img in cursor.fetchall()]
        return evento
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar evento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@app.delete("/eventos/{id_evento}")
def excluir_evento(id_evento: int):
    """Exclui um evento da plataforma."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_evento FROM evento WHERE id_evento = %s", (id_evento,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado."
            )

        cursor.execute("DELETE FROM evento WHERE id_evento = %s", (id_evento,))
        conn.commit()
        return {"mensagem": "Evento excluído com sucesso."}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir evento: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@app.post("/reservas", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
def criar_reserva(dados: ReservaCreate):
    """Cria uma nova reserva vinculando um evento a um local."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_evento, nome_evento, id_cliente FROM evento WHERE id_evento = %s", (dados.id_evento,))
        evento = cursor.fetchone()
        if not evento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento informado não encontrado."
            )

        cursor.execute("SELECT id_local, nome, preco_diaria, cidade, estado FROM local WHERE id_local = %s", (dados.id_local,))
        local = cursor.fetchone()
        if not local:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Local informado não encontrado."
            )

        if dados.data_hora_fim <= dados.data_hora_inicio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A data e horário de término devem ser posteriores ao início."
            )

        # Verificar conflito de datas ativas no mesmo local
        sql_conflito = """
            SELECT id_reserva FROM reserva
            WHERE id_local = %s
              AND status_reserva IN ('Pendente', 'Confirmado')
              AND (%s < data_hora_fim AND %s > data_hora_inicio)
        """
        cursor.execute(sql_conflito, (dados.id_local, dados.data_hora_inicio, dados.data_hora_fim))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este espaço já possui uma reserva confirmada ou pendente para as datas e horários selecionados."
            )

        valor_total = dados.valor_total
        if valor_total is None or valor_total <= 0:
            delta_segundos = (dados.data_hora_fim - dados.data_hora_inicio).total_seconds()
            dias = max(1, int((delta_segundos + 86399) // 86400))
            valor_total = float(local["preco_diaria"]) * dias

        sql_insert = """
            INSERT INTO reserva (id_evento, id_local, status_reserva, data_hora_inicio, data_hora_fim, valor_total)
            VALUES (%s, %s, 'Pendente', %s, %s, %s)
        """
        cursor.execute(sql_insert, (dados.id_evento, dados.id_local, dados.data_hora_inicio, dados.data_hora_fim, valor_total))
        id_reserva = cursor.lastrowid
        conn.commit()

        sql_busca = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_reserva = %s
        """
        cursor.execute(sql_busca, (id_reserva,))
        return cursor.fetchone()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar reserva: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()

@app.get("/reservas/cliente/{id_cliente}", response_model=List[ReservaResponse])
def listar_reservas_cliente(id_cliente: int):
    """Lista todas as reservas associadas aos eventos de um cliente específico."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE ev.id_cliente = %s
            ORDER BY r.data_hora_inicio DESC
        """
        cursor.execute(sql, (id_cliente,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@app.get("/reservas/local/{id_local}", response_model=List[ReservaResponse])
def listar_reservas_local(id_local: int):
    """Lista as reservas ativas de um espaço (utilizado para consulta de calendário/disponibilidade)."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_local = %s AND r.status_reserva IN ('Pendente', 'Confirmado')
            ORDER BY r.data_hora_inicio ASC
        """
        cursor.execute(sql, (id_local,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@app.get("/reservas/{id_reserva}", response_model=ReservaResponse)
def buscar_reserva_por_id(id_reserva: int):
    """Retorna os dados completos de uma reserva específica."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_reserva = %s
        """
        cursor.execute(sql, (id_reserva,))
        reserva = cursor.fetchone()
        if not reserva:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada."
            )
        return reserva
    finally:
        cursor.close()
        conn.close()

@app.put("/reservas/{id_reserva}/status", response_model=ReservaResponse)
def atualizar_status_reserva(id_reserva: int, dados: ReservaStatusUpdate):
    """Atualiza o status de uma reserva (ex: Confirmado, Cancelado, Concluido)."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_reserva FROM reserva WHERE id_reserva = %s", (id_reserva,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada."
            )

        cursor.execute("UPDATE reserva SET status_reserva = %s WHERE id_reserva = %s", (dados.status_reserva, id_reserva))
        conn.commit()

        sql = """
            SELECT r.id_reserva, r.id_evento, r.id_local, r.status_reserva,
                   r.data_hora_inicio, r.data_hora_fim, r.valor_total,
                   ev.nome_evento, l.nome AS nome_local, l.cidade, l.estado,
                   fo.nome_fornecedor AS proprietario, fo.telefone AS contato_proprietario
            FROM reserva r
            JOIN evento ev ON r.id_evento = ev.id_evento
            JOIN local l ON r.id_local = l.id_local
            JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
            WHERE r.id_reserva = %s
        """
        cursor.execute(sql, (id_reserva,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@app.delete("/reservas/{id_reserva}")
def cancelar_reserva(id_reserva: int):
    """Cancela ou exclui uma reserva."""
    conn = criar_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_reserva FROM reserva WHERE id_reserva = %s", (id_reserva,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada."
            )

        cursor.execute("DELETE FROM reserva WHERE id_reserva = %s", (id_reserva,))
        conn.commit()
        return {"mensagem": "Reserva cancelada com sucesso."}
    finally:
        cursor.close()
        conn.close()


