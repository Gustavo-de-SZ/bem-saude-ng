import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { switchMap, tap, timeout, catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

interface Tecnico {
  id: number;
  usuario_id: number;
  nome_fantasia: string;
  cnpj?: string;
  telefone?: string;
  descricao_servicos?: string;
  aprovado_pelo_admin: boolean;
  criado_em: string;
  email: string;
}

interface ProfileResponse {
  exists: boolean;
  type: 'cliente' | 'tecnico' | 'admin' | null;
  aprovado?: boolean; // <-- Adicionado
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileState$ = new BehaviorSubject<{checked: boolean, exists: boolean, type: 'cliente' | 'tecnico' | 'admin' | null, aprovado?: boolean}>({ checked: false, exists: false, type: null });

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private auth: AuthService
  ) {
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.clearProfileState();
      }
    });
  }

  private logTokenPayload(token: string): void {
    try {
      // Decode the JWT payload (second part)
      const payloadBase64 = token.split('.')[1];
      // Replace URL-safe characters
      const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64Padding);
      const payload = JSON.parse(payloadJson);
      // console.log('Profile Service Token payload:', payload);
    } catch (e) {
      console.error('Failed to decode token payload', e);
    }
  }

  verificarPerfilExistente(force = false): Observable<ProfileResponse> {
    if (!force && this.profileState$.value.checked) {
      return of({
        exists: this.profileState$.value.exists,
        type: this.profileState$.value.type,
        aprovado: this.profileState$.value.aprovado
      });
    }

    return this.auth.getToken().pipe(
      timeout(10000), // Increased timeout for token retrieval
      switchMap(token => {
        return this.http.get<ProfileResponse>(`${this.configService.getApiUrl()}/usuarios/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000), // Increased timeout for HTTP request
          tap(res => {
            // 3. Salvar no estado
            this.profileState$.next({
              checked: true,
              exists: res.exists,
              type: res.type,
              aprovado: res.aprovado
            });
          }),
          catchError(err => {
            console.error('Erro ao buscar perfil do usuário:', err);
            // On error, return last known state to prevent incorrect redirects
            // This avoids sending users to completion page on temporary failures
            return of(this.profileState$.value);
          })
        );
      }),
      catchError(err => {
        console.error('Erro ao obter token de autenticação:', err);
        // If we can't get a token, assume no profile exists to block false redirects
        return of({ exists: false, type: null as 'cliente' | 'tecnico' | 'admin' | null, aprovado: false });
      })
    );
  }

  setPerfilCriado(type: 'cliente' | 'tecnico' | 'admin', aprovado?: boolean): void {
    this.profileState$.next({ checked: true, exists: true, type, aprovado });
  }

  clearProfileState(): void {
    this.profileState$.next({ checked: false, exists: false, type: null });
  }

  criarPerfilCliente(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.auth.getToken().pipe(
      timeout(10000),
      switchMap(token => {
        // Decode token to get email and auth0_id
        const payloadBase64 = token.split('.')[1];
        const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(payloadBase64Padding);
        const payload = JSON.parse(payloadJson);

        // Add email and auth0_id to the cliente data
        // Only add email if it's present and non-empty in the token
        const enhancedData = {
          ...clienteData,
          auth0_id: payload.sub
        };
        if (payload.email !== undefined && payload.email !== null && payload.email.trim() !== '') {
          enhancedData.email = payload.email;
        }

        return this.http.post<Cliente>(`${this.configService.getApiUrl()}/clientes/auth0`, enhancedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000)
        );
      })
    );
  }

  criarPerfilTecnico(tecnicoData: Partial<Tecnico>): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      timeout(10000),
      switchMap(token => {
        // Decode token to get email and auth0_id
        const payloadBase64 = token.split('.')[1];
        const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(payloadBase64Padding);
        const payload = JSON.parse(payloadJson);

        // Add email and auth0_id to the tecnico data
        // Only add email if it's present and non-empty in the token
        const enhancedData = {
          ...tecnicoData,
          auth0_id: payload.sub
        };
        if (payload.email !== undefined && payload.email !== null && payload.email.trim() !== '') {
          enhancedData.email = payload.email;
        }

        return this.http.post<Tecnico>(`${this.configService.getApiUrl()}/tecnicos`, enhancedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000)
        );
      })
    );
  }

  // NEW METHODS FOR SETTINGS PAGE
  obterPerfilTecnico(): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      timeout(10000),
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<Tecnico>(`${this.configService.getApiUrl()}/tecnicos/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000)
        );
      })
    );
  }

  atualizarPerfilTecnico(tecnicoData: Partial<Tecnico>): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      timeout(10000),
      switchMap(token => {
        // Decode token to get auth0_id
        const payloadBase64 = token.split('.')[1];
        const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(payloadBase64Padding);
        const payload = JSON.parse(payloadJson);

        // Add auth0_id to the tecnico data
        const enhancedData = {
          ...tecnicoData,
          auth0_id: payload.sub
        };

        return this.http.put<Tecnico>(`${this.configService.getApiUrl()}/tecnicos/me`, enhancedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000)
        );
      })
    );
  }

  obterPerfilCliente(): Observable<Cliente> {
    return this.auth.getToken().pipe(
      timeout(10000),
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<Cliente>(`${this.configService.getApiUrl()}/clientes/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000)
        );
      })
    );
  }

  atualizarPerfilCliente(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.auth.getToken().pipe(
      timeout(10000),
      switchMap(token => {
        // Decode token to get auth0_id
        const payloadBase64 = token.split('.')[1];
        const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(payloadBase64Padding);
        const payload = JSON.parse(payloadJson);

        // Add auth0_id to the cliente data
        const enhancedData = {
          ...clienteData,
          auth0_id: payload.sub
        };

        return this.http.put<Cliente>(`${this.configService.getApiUrl()}/clientes/me`, enhancedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(15000)
        );
      })
    );
  }
}