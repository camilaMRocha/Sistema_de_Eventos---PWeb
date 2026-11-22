from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "HeyEvents API"
    PROJECT_DESCRIPTION: str = "API para gestão e organização de eventos"
    VERSION: str = "1.0.0"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

settings = Settings()
