import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getMensagens(ticketId: string): Observable<Mensagem[]> {
    // HTTP GET to FastAPI
    return this.http.get<Mensagem[]>(`${this.config.getApiUrl()}/chat/${ticketId}`);
  }

  enviarMensagem(ticketId: string, texto: string): Observable<Mensagem> {
    // HTTP POST to FastAPI
    return this.http.post<Mensagem>(`${this.config.getApiUrl()}/chat/${ticketId}`, { texto });
  }
}