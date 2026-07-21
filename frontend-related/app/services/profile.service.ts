import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { switchMap, tap, timeout, catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

interface Tecnico {
  nome: string;
  email: string;
  especialidadePrincipal?: string;
  // outros campos específicos de técnico
}

interface ProfileResponse {
  exists: boolean;
  type: 'cliente' | 'tecnico' | 'admin' | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileState$ = new BehaviorSubject<{checked: boolean, exists: boolean, type: 'cliente' | 'tecnico' | 'admin' | null}>({ checked: false, exists: false, type: null });

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
        type: this.profileState$.value.type
      });
    }

    return this.auth.getToken().pipe(
      switchMap(token => {
        // this.logTokenPayload(token);
        return this.http.get<ProfileResponse>(`${this.configService.getApiUrl()}/usuarios/perfil/verificar`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          timeout(3000),
          tap(res => {
            this.profileState$.next({ checked: true, exists: res.exists, type: res.type });
          }),
          catchError(err => {
            console.error('Erro ao verificar perfil, usando fallback', err);
            // Fallback for iframe preview or when backend is down
            // Assume no profile exists to allow completion flow to proceed
            return of({ exists: false, type: null as any });
          })
        );
      })
    );
  }

  setPerfilCriado(type: 'cliente' | 'tecnico' | 'admin'): void {
    this.profileState$.next({ checked: true, exists: true, type });
  }

  clearProfileState(): void {
    this.profileState$.next({ checked: false, exists: false, type: null });
  }

  criarPerfilCliente(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.post<Cliente>(`${this.configService.getApiUrl()}/clientes/auth0`, clienteData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  criarPerfilTecnico(tecnicoData: Partial<Tecnico>): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.post<Tecnico>(`${this.configService.getApiUrl()}/tecnicos`, tecnicoData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  // NEW METHODS FOR SETTINGS PAGE
  obterPerfilTecnico(): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<Tecnico>(`${this.configService.getApiUrl()}/tecnicos/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  atualizarPerfilTecnico(tecnicoData: Partial<Tecnico>): Observable<Tecnico> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.put<Tecnico>(`${this.configService.getApiUrl()}/tecnicos/me`, tecnicoData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  obterPerfilCliente(): Observable<Cliente> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.get<Cliente>(`${this.configService.getApiUrl()}/clientes/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      })
    );
  }

  atualizarPerfilCliente(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.auth.getToken().pipe(
      switchMap(token => {
        this.logTokenPayload(token);
        return this.http.put<Cliente>(`${this.configService.getApiUrl()}/clientes/me`, clienteData, {
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