from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.tcc.infraestrutura.banco_dados.conexao import obter_sessao
from src.tcc.api.auth import verify_token
from src.tcc.infraestrutura.banco_dados.modelos.modelo_mensagem import ModeloMensagem
from src.tcc.infraestrutura.banco_dados.modelos.modelo_chamado import ModeloChamado
from src.tcc.infraestrutura.repositorios.usuario_repositorio import RepositorioUsuario
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])

class MensagemBase(BaseModel):
    ticket_id: str
    texto: str

class MensagemCreate(MensagemBase):
    pass

class MensagemResponse(MensagemBase):
    id: int
    data_envio: datetime
    remetente_id: str
    remetente_nome: str
    class Config:
        from_attributes = True

def _verificar_acesso_chamado(session: Session, ticket_id: str, token_data: dict):
    if not ticket_id.isdigit():
        raise HTTPException(status_code=400, detail="ticket_id invalido")
    
    auth0_id = token_data.get("sub")
    usuario_repo = RepositorioUsuario(session)
    usuario = usuario_repo.buscar_por_auth0_id(auth0_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario nao encontrado")
            
    chamado = session.query(ModeloChamado).filter(ModeloChamado.id == int(ticket_id)).first()
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado nao encontrado")
                
    is_client = chamado.cliente and chamado.cliente.usuario_id == usuario.id
    is_professional = chamado.profissional and chamado.profissional.usuario_id == usuario.id
            
    if not is_client and not is_professional:
        raise HTTPException(status_code=403, detail="Acesso negado: voce nao participa deste chamado")
            
    return usuario, chamado

@router.get("/{ticket_id}", response_model=List[MensagemResponse])
def get_mensagens(ticket_id: str, session: Session = Depends(obter_sessao), user: dict = Depends(verify_token)):
    _verificar_acesso_chamado(session, ticket_id, user)
    mensagens = session.query(ModeloMensagem).filter(ModeloMensagem.ticket_id == ticket_id).order_by(ModeloMensagem.data_envio.asc()).all()
    return mensagens

@router.post("/", response_model=MensagemResponse)
def enviar_mensagem(msg: MensagemCreate, session: Session = Depends(obter_sessao), user: dict = Depends(verify_token)):
    usuario, chamado = _verificar_acesso_chamado(session, msg.ticket_id, user)
    
    is_client = chamado.cliente and chamado.cliente.usuario_id == usuario.id
    
    if is_client:
        nome = chamado.cliente.nome_completo if chamado.cliente else "Cliente"
    else:
        nome = chamado.profissional.nome_fantasia if chamado.profissional else "Técnico"
        
    nova_msg = ModeloMensagem(
        ticket_id=msg.ticket_id,
        remetente_id=usuario.auth0_id,
        remetente_nome=nome,
        texto=msg.texto
    )
    session.add(nova_msg)
    session.commit()
    session.refresh(nova_msg)
    return nova_msg
