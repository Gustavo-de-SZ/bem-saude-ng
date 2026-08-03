import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  criado_em: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private auth = inject(AuthService);

  getNotificacoes(): Observable<Notificacao[]> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.get<Notificacao[]>(`${this.config.getApiUrl()}/notificacoes`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          timeout(15000)
        )
      ),
      catchError(() => of<Notificacao[]>([]))
    );
  }

  marcarLidas(): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.put(`${this.config.getApiUrl()}/notificacoes/ler`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          timeout(15000)
        )
      ),
      catchError(() => of({}))
    );
  }
}
