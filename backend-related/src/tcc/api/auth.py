from fastapi import Depends, HTTPException, Security, APIRouter, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import base64
from urllib.request import urlopen
from jose import jwt, JWTError

# Suas configurações do Auth0
AUTH0_DOMAIN = "dev-fzslqbhihrhb8va0.us.auth0.com"
AUTH0_AUDIENCE = "https://api.tcc-ng.com"
NAMESPACE_ROLES = "https://tcc-ng.com/roles"
ALGORITHMS = ["RS256"]

security = HTTPBearer()
debug_router = APIRouter(tags=["debug"])

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Descriptografa o token usando python-jose, checa a validade da assinatura (JWKS),
    o audience e a expiração.
    """
    token = credentials.credentials
    jwks_url = f'https://{AUTH0_DOMAIN}/.well-known/jwks.json'
    
    try:
        # 1. Busca as chaves públicas do Auth0
        jwks = json.loads(urlopen(jwks_url).read())
        
        # 2. Pega o cabeçalho do token para descobrir qual chave (kid) foi usada
        unverified_header = jwt.get_unverified_header(token)
        
        # 3. Procura a chave correspondente
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                
        if rsa_key:
            # 4. Decodifica e valida o token (assinatura, expiração, audience e issuer)
            # O jose ignora o 'azp' e checa apenas se o 'aud' bate com a sua API.
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=AUTH0_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
            
        raise HTTPException(status_code=401, detail="Chave RSA não encontrada.")
        
    except JWTError as e:
        # Se falhar na validação do jose (expirado, audience errado, etc)
        raise HTTPException(status_code=401, detail=f"Token inválido ou expirado: {str(e)}")
    except Exception as e:
        # Qualquer outro erro estrutural
        raise HTTPException(status_code=401, detail=f"Erro ao processar token: {str(e)}")


def _decode_token_unverified(token: str) -> dict:
    """
    Decode a JWT without verification (for debugging only).
    Returns the payload as a dictionary.
    """
    try:
        # Split token and decode payload (second part)
        _, payload_b64, _ = token.split('.')
        # Add padding if needed
        padding = '=' * ((4 - len(payload_b64) % 4) % 4)
        payload_b64 += padding
        payload_json = base64.urlsafe_b64decode(payload_b64)
        return json.loads(payload_json)
    except Exception:
        return {}


@debug_router.get("/debug/token", include_in_schema=False)
async def debug_token(authorization: str = Header(None)):
    """
    Development-only endpoint to decode and return the token payload.
    Only available when swagger is enabled (i.e., non-production).
    Returns the unverified payload of the Authorization Bearer token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Missing or malformed Authorization header")
    token = authorization.split(" ", 1)[1]
    payload = _decode_token_unverified(token)
    return payload


def require_role(required_role: str):
    """
    Dependência extra para exigir uma Role específica (RBAC).
    """
    def role_checker(payload: dict = Depends(verify_token)):
        roles = payload.get(NAMESPACE_ROLES, [])
        if required_role not in roles:
            raise HTTPException(status_code=403, detail="Acesso negado: Privilégios insuficientes")
        return payload
    return role_checker
def require_any_role(required_roles: list):
    """
    Dependência extra para exigir pelo menos uma das Roles especificadas.
    """
    def role_checker(payload: dict = Depends(verify_token)):
        user_roles = payload.get(NAMESPACE_ROLES, [])
        # Verifica se o usuário tem pelo menos uma das roles exigidas
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(status_code=403, detail=f"Acesso negado. Requer uma destas roles: {required_roles}")
        return payload
    return role_checker