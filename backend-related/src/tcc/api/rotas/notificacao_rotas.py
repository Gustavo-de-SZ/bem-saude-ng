from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import get_client_user, require_any_profile
from src.tcc.infraestrutura.banco_dados.modelos.modelo_notificacao import ModeloNotificacao
from src.tcc.api.schemas.notificacao_schema import NotificacaoResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/notificacoes", tags=["Notificacoes"])

@router.get("", response_model=List[NotificacaoResponse])
def listar_notificacoes(session: Session = Depends(obter_sessao), current_user = Depends(require_any_profile(["PROFISSIONAL", "CLIENTE"]))):
    notificacoes = session.query(ModeloNotificacao).filter(ModeloNotificacao.usuario_id == current_user.id).order_by(ModeloNotificacao.criado_em.desc()).all()
    return notificacoes

@router.put("/ler")
def marcar_todas_lidas(session: Session = Depends(obter_sessao), current_user = Depends(require_any_profile(["PROFISSIONAL", "CLIENTE"]))):
    session.query(ModeloNotificacao).filter(ModeloNotificacao.usuario_id == current_user.id).update({"lida": True})
    session.commit()
    return {"message": "Notificações marcadas como lidas"}
