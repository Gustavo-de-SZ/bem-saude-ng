import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Solicitacao } from '../models/solicitacao';
import { ConfigService } from './config.service';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class SolicitacaoService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private auth: AuthService
  ) {}

  private logTokenPayload(token: string): void {
    try {
      // Decode the JWT payload (second part)
      const payloadBase64 = token.split('.')[1];
      // Replace URL-safe characters
      const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64Padding);
      const payload = JSON.parse(payloadJson);
      console.log('Solicitacao Token payload:', payload);
    } catch (e) {
      console.error('Failed to decode token payload', e);
    }
  }

  createSolicitacao(data: Solicitacao): Observable<Solicitacao> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.post<Solicitacao>(`${this.configService.getApiUrl()}/solicitacoes`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  // Optional: get all solicitacoes
  getSolicitacoes(): Observable<Solicitacao[]> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<Solicitacao[]>(`${this.configService.getApiUrl()}/solicitacoes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  updateSolicitacao(solicitacao: Solicitacao): Observable<Solicitacao> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.put<Solicitacao>(`${this.configService.getApiUrl()}/solicitacoes/${solicitacao.id}`, solicitacao, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  deleteSolicitacao(id: string): Observable<void> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.delete<void>(`${this.configService.getApiUrl()}/solicitacoes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }
}