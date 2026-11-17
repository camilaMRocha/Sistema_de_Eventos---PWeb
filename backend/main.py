from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
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
    # Repara automaticamente acentuação UTF-8 em categorias caso o banco tenha sido importado com codificação legada
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

# Configuração de CORS para permitir requisições do front-end (React / Vite, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

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
