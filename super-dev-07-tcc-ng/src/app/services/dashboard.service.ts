import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { StatCard } from '../models/stat-card';
import { Agendamento } from '../models/agendamento';
import { ConfigService } from './config.service';
import { AuthService } from '@auth0/auth0-angular';

interface DashboardData {
  stats: StatCard[];
  agendamentos: Agendamento[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
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
      console.log('Dashboard Token payload:', payload);
    } catch (e) {
      console.error('Failed to decode token payload', e);
    }
  }

  getDashboardData(): Observable<DashboardData> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<DashboardData>(`${this.configService.getApiUrl()}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  // Alternative: separate endpoints
  getStats(): Observable<StatCard[]> {
    return this.auth.getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://api.tcc-ng.com'
      }
    }).pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        
        return this.http.get<any>(`${this.configService.getApiUrl()}/clientes/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          map(res => {
            if (Array.isArray(res)) return res; // backend might be fixed already
            
            return [
              {
                titulo: 'Total de Clientes',
                valor: String(res.total || 0),
                descricao: 'Clientes cadastrados',
                icone: 'pi pi-users',
                corClasse: 'tcc-icon-blue'
              },
              {
                titulo: 'Clientes Ativos',
                valor: String(res.ativos || 0),
                descricao: 'Com serviços recentes',
                icone: 'pi pi-check-circle',
                corClasse: 'tcc-icon-green'
              },
              {
                titulo: 'Clientes Inativos',
                valor: String(res.inativos || 0),
                descricao: 'Sem serviços há 30 dias',
                icone: 'pi pi-clock',
                corClasse: 'tcc-icon-orange'
              }
            ];
          })
        );

      })
    );
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
}