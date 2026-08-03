from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.banco_dados.modelos.modelo_mensagem import ModeloMensagem
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])

class MensagemBase(BaseModel):
    ticket_id: str
    remetente_id: str
    remetente_nome: str
    texto: str

class MensagemResponse(MensagemBase):
    id: int
    data_envio: datetime

    class Config:
        orm_mode = True

@router.get("/{ticket_id}", response_model=List[MensagemResponse])
def get_mensagens(ticket_id: str, session: Session = Depends(obter_sessao), user: dict = Depends(verify_token)):
    mensagens = session.query(ModeloMensagem).filter(ModeloMensagem.ticket_id == ticket_id).order_by(ModeloMensagem.data_envio.asc()).all()
    return mensagens

@router.post("/", response_model=MensagemResponse)
def enviar_mensagem(msg: MensagemBase, session: Session = Depends(obter_sessao), user: dict = Depends(verify_token)):
    nova_msg = ModeloMensagem(
        ticket_id=msg.ticket_id,
        remetente_id=msg.remetente_id,
        remetente_nome=msg.remetente_nome,
        texto=msg.texto
    )
    session.add(nova_msg)
    session.commit()
    session.refresh(nova_msg)
    return nova_msg
