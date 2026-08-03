import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, switchMap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

export interface Mensagem {
  id: string;
  ticketId: string;
  remetenteId: string;
  remetenteNome: string;
  texto: string;
  dataEnvio: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private auth = inject(AuthService);
  private currentRole = 'cliente';

  setRole(role: string) {
      this.currentRole = role;
  }

  getMensagens(ticketId: string): Observable<Mensagem[]> {
    return this.auth.getToken().pipe(
      switchMap(token => 
        this.http.get<any[]>(`${this.config.getApiUrl()}/chat/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          map(res => res.map(m => ({
            id: m.id,
            ticketId: m.ticket_id,
            remetenteId: m.remetente_id,
            remetenteNome: m.remetente_nome,
            texto: m.texto,
            dataEnvio: m.data_envio
          })))
        )
      ),
      catchError(() => of([]))
    );
  }

  enviarMensagemRole(ticketId: string, texto: string, meuUsuarioId: string, meuNome: string): Observable<Mensagem> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        const payload = {
          ticket_id: ticketId,
          remetente_id: meuUsuarioId,
          remetente_nome: meuNome,
          texto: texto
        };
        
        return this.http.post<any>(`${this.config.getApiUrl()}/chat`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          map(m => ({
            id: m.id,
            ticketId: m.ticket_id,
            remetenteId: m.remetente_id,
            remetenteNome: m.remetente_nome,
            texto: m.texto,
            dataEnvio: m.data_envio
          }))
        );
      })
    );
  }

  enviarMensagem(ticketId: string, texto: string): Observable<Mensagem> {
      return this.enviarMensagemRole(ticketId, texto, 'default-id', 'Você');
  }
}
