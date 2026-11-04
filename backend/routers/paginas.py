from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(tags=["Páginas"])

@router.get("/")
def pagina_inicial():
    return FileResponse("frontend/index.html")

@router.get("/login")
def pagina_login():
    return FileResponse("frontend/login.html")

@router.get("/cadastro")
def pagina_cadastro():
    return FileResponse("frontend/cadastro.html")

@router.get("/meus-eventos")
def pagina_meus_eventos():
    return FileResponse("frontend/meus_eventos.html")

@router.get("/cadastro-de-evento")
def pagina_cadastro_evento():
    return FileResponse("frontend/cadastro_evento.html")

@router.get("/reserva")
def pagina_reserva():
    return FileResponse("frontend/reserva.html")

@router.get("/cadastro-de-local")
def pagina_cadastro_local():
    return FileResponse("frontend/cadastro_local.html")

@router.get("/visualizar-locais")
def pagina_visualizar_locais():
    return FileResponse("frontend/locais.html")

@router.get("/cadastro-de-servico")
def pagina_cadastro_servico():
    return FileResponse("frontend/cadastro_servico.html")

@router.get("/visualizar-servicos")
def pagina_visualizar_servicos():
    return FileResponse("frontend/servicos.html")

@router.get("/status")
def health_check():
    return {"status": "online", "mensagem": "API online"}
