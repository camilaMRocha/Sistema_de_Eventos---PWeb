import hashlib
import secrets

def gerar_salt() -> str:
    """Gera um salt aleatório para hash de senha."""
    return secrets.token_hex(16)

def gerar_hash_senha(senha: str, salt: str = None) -> str:
    """Gera o hash SHA-256 seguro da senha com salt."""
    if not salt:
        salt = gerar_salt()
    hash_obj = hashlib.sha256((senha + salt).encode("utf-8"))
    return f"{salt}${hash_obj.hexdigest()}"

def verificar_senha(senha_pura: str, hash_armazenado: str) -> bool:
    """Valida se a senha informada corresponde ao hash ou ao texto puro."""
    if not hash_armazenado:
        return False

    # Suporte para hash com salt: salt$hash
    if "$" in hash_armazenado:
        salt, hash_real = hash_armazenado.split("$", 1)
        hash_calculado = hashlib.sha256((senha_pura + salt).encode("utf-8")).hexdigest()
        return secrets.compare_digest(hash_calculado, hash_real)

    # Suporte transitório para senhas antigas em texto plano
    return secrets.compare_digest(senha_pura, hash_armazenado)
