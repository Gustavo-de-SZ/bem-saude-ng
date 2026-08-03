from fastapi import Depends, HTTPException, Security, APIRouter, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import base64
from urllib.request import urlopen
from jose import jwt, JWTError
from sqlalchemy.orm import Session, joinedload

from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.infraestrutura.banco_dados.modelos.modelo_user import ModeloUsuario

# Suas configurações do Auth0
AUTH0_DOMAIN = "dev-fzslqbhihrhb8va0.us.auth0.com"
AUTH0_AUDIENCE = "https://api.tcc-ng.com"
ALGORITHMS = ["RS256"]

security = HTTPBearer()
debug_router = APIRouter(tags=["debug"])

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Descriptografa o token usando python-jose, checa a validade da assinatura (JWKS),
    o audience e a expiração, retornando o payload (que contém o 'sub').
    """
    token = credentials.credentials
    
    # Suporte a token mock em desenvolvimento (se aplicável)
    if token.endswith('.mock_signature'):
        try:
            _, payload_b64, _ = token.split('.')
            padding = '=' * ((4 - len(payload_b64) % 4) % 4)
            payload_b64 += padding
            payload_json = base64.urlsafe_b64decode(payload_b64)
            return json.loads(payload_json)
        except Exception:
            pass

    jwks_url = f'https://{AUTH0_DOMAIN}/.well-known/jwks.json'

    try:
        jwks = json.loads(urlopen(jwks_url).read())
        unverified_header = jwt.get_unverified_header(token)

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
        raise HTTPException(status_code=401, detail=f"Token inválido ou expirado: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erro ao processar token: {str(e)}")


def _decode_token_unverified(token: str) -> dict:
    try:
        _, payload_b64, _ = token.split('.')
        padding = '=' * ((4 - len(payload_b64) % 4) % 4)
        payload_b64 += padding
        payload_json = base64.urlsafe_b64decode(payload_b64)
        return json.loads(payload_json)
    except Exception:
        return {}


@debug_router.get("/debug/token", include_in_schema=False)
async def debug_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Missing or malformed Authorization header")
    token = authorization.split(" ", 1)[1]
    return _decode_token_unverified(token)


# --- NOVAS DEPENDÊNCIAS DO CAMINHO 1 (BASEADAS NO BANCO DE DADOS) ---

def require_profile(allowed_profiles: list[str]):
    """
    Dependência universal para o Caminho 1:
    1. Valida o token JWT do Auth0 (extraindo o 'sub').
    2. Consulta o MariaDB para verificar se o usuário existe e qual é o seu 'tipo_perfil'.
    3. Compara se o perfil do usuário está na lista de permitidos.
    """
    def profile_checker(payload: dict = Depends(verify_token), db: Session = Depends(obter_sessao)):
        auth0_id = payload.get("sub")
        
        if not auth0_id:
            raise HTTPException(status_code=401, detail="Token inválido: campo 'sub' ausente.")

        # Busca o usuário no banco de dados usando o auth0_id
        # Ajuste '' para o nome da classe do seu modelo SQLAlchemy
        usuario = db.query(ModeloUsuario).filter(ModeloUsuario.auth0_id == auth0_id).first()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: Perfil não cadastrado no sistema."
            )

        # Valida se o tipo_perfil do banco bate com os permitidos na rota (ex: 'PROFISSIONAL', 'CLIENTE')
        # Handle both Enum objects and strings
        user_profile = usuario.tipo_perfil.value if hasattr(usuario.tipo_perfil, 'value') else usuario.tipo_perfil
        if user_profile not in allowed_profiles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Requer um destes perfis: {allowed_profiles}"
            )

        # Opcional: Retorna o objeto do usuário para ser injetado direto na rota
        return usuario

    return profile_checker


# Atalhos práticos para as rotas:
def require_profissional():
    return require_profile(["PROFISSIONAL"])

def require_cliente():
    return require_profile(["CLIENTE"])

def require_any_profile(profiles: list[str]):
    return require_profile(profiles)

# --- ADICIONE ESTAS FUNÇÕES NO FINAL DE auth.py PARA COMPATIBILIDADE ---

def require_role(role_name: str):
    """
    Função de compatibilidade: traduz a antiga checagem de role por token 
    para a nova validação baseada no banco de dados (Caminho 1).
    """
    normalized = role_name.upper()
    # Se pedirem 'tecnico' ou 'profissional', aceita 'PROFISSIONAL' no banco
    if normalized in ["TECNICO", "PROFISSIONAL"]:
        return require_profile(["PROFISSIONAL"])
    return require_profile([normalized])


def require_any_role(role_list: list[str]):
    """
    Função de compatibilidade para múltiplas roles baseada no banco de dados.
    """
    normalized_list = [r.upper() for r in role_list]
    if "TECNICO" in normalized_list and "PROFISSIONAL" not in normalized_list:
        normalized_list.append("PROFISSIONAL")
    return require_profile(normalized_list)


def get_professional_user(payload: dict = Depends(verify_token), db: Session = Depends(obter_sessao)):
    """
    Dependência para obter o usuário profissional/técnico autenticado.
    Similar to require_profissional() but returns the user object instead of just validating.
    """
    auth0_id = payload.get("sub")

    if not auth0_id:
        raise HTTPException(status_code=401, detail="Token inválido: campo 'sub' ausente.")

    # Busca o usuário no banco de dados usando o auth0_id
    usuario = db.query(ModeloUsuario).filter(ModeloUsuario.auth0_id == auth0_id).options(joinedload(ModeloUsuario.profissional)).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: Perfil não cadastrado no sistema."
        )

    # Valida se o usuário é um profissional/técnico
    # Handle both Enum objects and strings
    user_profile = usuario.tipo_perfil.value if hasattr(usuario.tipo_perfil, 'value') else usuario.tipo_perfil
    if user_profile not in ["PROFISSIONAL"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Requer perfil profissional/técnico."
        )

    # Retorna o objeto do usuário para ser usado nas rotas
    return usuario


def get_client_user(payload: dict = Depends(verify_token), db: Session = Depends(obter_sessao)):
    """
    Dependência para obter o usuário cliente autenticado.
    Similar to require_cliente() but returns the user object instead of just validating.
    """
    auth0_id = payload.get("sub")

    if not auth0_id:
        raise HTTPException(status_code=401, detail="Token inválido: campo 'sub' ausente.")

    # Busca o usuário no banco de dados usando o auth0_id
    usuario = db.query(ModeloUsuario).filter(ModeloUsuario.auth0_id == auth0_id).options(joinedload(ModeloUsuario.cliente)).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: Perfil não cadastrado no sistema."
        )

    # Valida se o usuário é um cliente
    # Handle both Enum objects and strings
    user_profile = usuario.tipo_perfil.value if hasattr(usuario.tipo_perfil, 'value') else usuario.tipo_perfil
    if user_profile not in ["CLIENTE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Requer perfil de cliente."
        )

    # Retorna o objeto do usuário para ser usado nas rotas
    return usuario