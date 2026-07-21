import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Agendamento } from '../models/agendamento';
import { ConfigService } from './config.service';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
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
      console.log('Agenda Token payload:', payload);
    } catch (e) {
      console.error('Failed to decode token payload', e);
    }
  }

  getAgendamentos(): Observable<Agendamento[]> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<Agendamento[]>(`${this.configService.getApiUrl()}/agendamentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  addAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.post<Agendamento>(`${this.configService.getApiUrl()}/agendamentos`, agendamento, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  updateAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.put<Agendamento>(`${this.configService.getApiUrl()}/agendamentos/${agendamento.id}`, agendamento, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  deleteAgendamento(id: string): Observable<void> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.delete<void>(`${this.configService.getApiUrl()}/agendamentos/${id}`, {
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