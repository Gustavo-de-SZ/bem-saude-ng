import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

export interface TecnicoAdmin {
  id: number;
  usuario_id: number;
  nome_fantasia: string;
  cpf: string;
  telefone: string;
  descricao_servicos: string;
  aprovado_pelo_admin: boolean;
  criado_em: string;
  email?: string; // May need to be joined with users table or populated
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private auth: AuthService
  ) {}

  private getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  getTodosTecnicos(): Observable<TecnicoAdmin[]> {
    return this.auth.getToken().pipe(
      switchMap(token => 
        this.http.get<TecnicoAdmin[]>(`${this.config.getApiUrl()}/profissionais`, {
          headers: this.getHeaders(token)
        })
      )
    );
  }

  getTecnicosPendentes(): Observable<TecnicoAdmin[]> {
    return this.getTodosTecnicos().pipe(
      map(tecnicos => tecnicos.filter(t => !t.aprovado_pelo_admin))
    );
  }

  aprovarTecnico(id: number): Observable<void> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.patch<void>(`${this.config.getApiUrl()}/profissionais/${id}/aprovar`, {}, {
          headers: this.getHeaders(token)
        })
      )
    );
  }

  rejeitarTecnico(id: number): Observable<void> {
    return this.auth.getToken().pipe(
      switchMap(token =>
        this.http.patch<void>(`${this.config.getApiUrl()}/profissionais/${id}/rejeitar`, {}, {
          headers: this.getHeaders(token)
        })
      )
    );
  }
  
  getEstatisticasDashboard(): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        const profissionais$ = this.http.get<any[]>(`${this.config.getApiUrl()}/profissionais`, { headers: this.getHeaders(token) }).pipe(catchError(() => of([])));
        const clientes$ = this.http.get<any[]>(`${this.config.getApiUrl()}/clientes`, { headers: this.getHeaders(token) }).pipe(catchError(() => of([])));

        return forkJoin({
          profissionais: profissionais$,
          clientes: clientes$
        }).pipe(
          map(({ profissionais, clientes }) => {
            const pendentes = profissionais.filter((p: any) => !p.aprovado_pelo_admin).length;
            const totalTecnicos = profissionais.length;
            const totalClientes = clientes.length;

            return {
              pendentes,
              totalTecnicos,
              totalClientes
            };
          })
        );
      })
    );
  }
}
