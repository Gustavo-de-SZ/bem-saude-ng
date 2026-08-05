from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from src.tcc.api.configuracoes import configuracoes

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Obter status do usuário logado (existe perfil e tipo)"
)
def obter_status_usuario(
    session: Session = Depends(obter_sessao),
    token_data: dict = Depends(verify_token)
):
    auth0_id = token_data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido: 'sub' ausente")

    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        return {"exists": False, "type": None}

    # Map enum values to expected string values for frontend compatibility
    tipo_map = {
        "CLIENTE": "cliente",
        "PROFISSIONAL": "tecnico",
        "ADMIN": "admin"
    }
    tipo_str = tipo_map.get(usuario.tipo_perfil.value, usuario.tipo_perfil.value.lower() if hasattr(usuario.tipo_perfil, 'value') else str(usuario.tipo_perfil).lower())

    response = {
        "exists": True,
        "type": tipo_str
    }

    # Add aprovado field for technician type
    if response["type"] == "tecnico" and hasattr(usuario, 'profissional') and usuario.profissional:
        response["aprovado"] = usuario.profissional.aprovado_pelo_admin

    return response