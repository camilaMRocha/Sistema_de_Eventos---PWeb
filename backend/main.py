from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.routers import (
    paginas,
    auth,
    clientes,
    fornecedores,
    categorias,
    funcionarios,
    servicos,
    locais,
    eventos,
    reservas,
    avaliacoes,
    notificacoes,
    pagamentos,
    ingressos,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from backend.database import criar_conexao
        conn = criar_conexao()
        cursor = conn.cursor()
        cursor.execute("SET NAMES utf8mb4;")
        cursor.execute("""
            UPDATE categoria
            SET nome_categoria = 'Aniversário'
            WHERE id_categoria = 6 AND (nome_categoria LIKE '%├%' OR nome_categoria LIKE '%Ã%');
        """)
        cursor.execute("""
            UPDATE categoria
            SET nome_categoria = 'Chá de Bebê'
            WHERE id_categoria = 9 AND (nome_categoria LIKE '%├%' OR nome_categoria LIKE '%Ã%');
        """)
        cursor.execute("""
            UPDATE categoria
            SET nome_categoria = 'Confraternização'
            WHERE id_categoria = 10 AND (nome_categoria LIKE '%├%' OR nome_categoria LIKE '%Ã%');
        """)
        cursor.execute("""
            UPDATE categoria
            SET nome_categoria = 'Lançamento de Produto'
            WHERE id_categoria = 15 AND (nome_categoria LIKE '%├%' OR nome_categoria LIKE '%Ã%');
        """)
        cursor.execute("""
            UPDATE categoria
            SET nome_categoria = 'Exposição'
            WHERE id_categoria = 18 AND (nome_categoria LIKE '%├%' OR nome_categoria LIKE '%Ã%');
        """)

        cursor.execute("SELECT id_usuario FROM usuario WHERE email = 'admin'")
        admin_user = cursor.fetchone()
        if not admin_user:
            from backend.core.security import gerar_hash_senha
            senha_hash = gerar_hash_senha("pl1914")
            cursor.execute("""
                INSERT INTO usuario (email, senha, tipo_usuario)
                VALUES ('admin', %s, 'Administrador')
            """, (senha_hash,))
            id_usuario_admin = cursor.lastrowid
            cursor.execute("""
                INSERT INTO administrador (id_usuario, nome, nivel_acesso)
                VALUES (%s, 'admin', 'Geral')
            """, (id_usuario_admin,))

        conn.commit()
        cursor.close()
        conn.close()
    except Exception:
        pass
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(paginas.router)
app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(fornecedores.router)
app.include_router(categorias.router)
app.include_router(funcionarios.router)
app.include_router(servicos.router)
app.include_router(locais.router)
app.include_router(eventos.router)
app.include_router(reservas.router)
app.include_router(avaliacoes.router)
app.include_router(notificacoes.router)
app.include_router(pagamentos.router)
app.include_router(ingressos.router)
