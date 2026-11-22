from fastapi import APIRouter

router = APIRouter(tags=["Status"])

@router.get("/")
def raiz():
    return {
        "projeto": "HeyEvents API",
        "versao": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }

@router.get("/status")
def health_check():
    return {"status": "online", "mensagem": "API online"}
