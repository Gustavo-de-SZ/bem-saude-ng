import { Injectable, inject, InjectionToken } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, timeout, catchError } from 'rxjs/operators';

export const REAL_AUTH0_TOKEN = new InjectionToken<any>('REAL_AUTH0_TOKEN');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // We make the original Auth0Service optional so it doesn't break if not fully configured
  private auth0 = inject(REAL_AUTH0_TOKEN, { optional: true });

  // Local simulated state
  private mockUser$ = new BehaviorSubject<any>(null);
  private mockIsAuthenticated$ = new BehaviorSubject<boolean>(false);
  private mockIsLoading$ = new BehaviorSubject<boolean>(false);
  private realIsAuthenticated = false;

  constructor() {
    // Load existing mock user session if present
    const savedUser = localStorage.getItem('tcc_mock_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.mockUser$.next(user);
        this.mockIsAuthenticated$.next(true);
      } catch (e) {
        localStorage.removeItem('tcc_mock_user');
      }
    }

    if (this.auth0) {
      this.auth0.isAuthenticated$.pipe(
        timeout(10000),
        catchError((err: any) => {
          console.warn('Auth0 isAuthenticated$ timeout or error in constructor', err);
          return of(false);
        })
      ).subscribe((auth: boolean) => {
        this.realIsAuthenticated = auth;
      });
    }
  }

  private base64url(str: string): string {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Combined user$ state (prioritizes mock authentication)
  public user$ = new Observable<any>(subscriber => {
    this.mockIsAuthenticated$.subscribe(isMockAuth => {
      if (isMockAuth) {
        this.mockUser$.subscribe(u => subscriber.next(u));
      } else if (this.auth0) {
        this.auth0.user$.pipe(
          timeout(10000),
          catchError((err: any) => {
            console.warn('Auth0 user$ timeout or error, returning null', err);
            return of(null);
          })
        ).subscribe((u: any) => subscriber.next(u));
      } else {
        subscriber.next(null);
      }
    });
  });

  // Combined isAuthenticated$ state
  public isAuthenticated$ = new Observable<boolean>(subscriber => {
    this.mockIsAuthenticated$.subscribe(isMockAuth => {
      if (isMockAuth) {
        subscriber.next(true);
      } else if (this.auth0) {
        this.auth0.isAuthenticated$.pipe(
          timeout(10000),
          catchError((err: any) => {
            console.warn('Auth0 isAuthenticated$ timeout or error, returning false', err);
            return of(false);
          })
        ).subscribe((auth: boolean) => subscriber.next(auth));
      } else {
        subscriber.next(false);
      }
    });
  });

  // Combined isLoading$ state
  public isLoading$ = new Observable<boolean>(subscriber => {
    this.mockIsLoading$.subscribe(isMockLoading => {
      if (isMockLoading) {
        subscriber.next(true);
      } else if (this.auth0) {
        this.auth0.isLoading$.pipe(
          timeout(10000),
          catchError((err: any) => {
            console.warn('Auth0 isLoading$ timeout or error, returning false', err);
            return of(false);
          })
        ).subscribe((loading: boolean) => subscriber.next(loading));
      } else {
        subscriber.next(false);
      }
    });
  });

  /**
   * Simulates a login session as a technician or client
   */
  simularLogin(role: 'Tecnico' | 'Cliente' | 'Admin'): void {
    const mockUser = {
      sub: role === 'Admin' ? 'auth0|mockadmin123' : (role === 'Tecnico' ? 'auth0|mocktecnico123' : 'auth0|mockcliente123'),
      name: role === 'Admin' ? 'Administrador' : (role === 'Tecnico' ? 'Profissional de TI (Simulado)' : 'Cliente de Teste (Simulado)'),
      given_name: role === 'Admin' ? 'Admin' : (role === 'Tecnico' ? 'Profissional' : 'Cliente'),
      email: role === 'Admin' ? 'admin@tcc-ng.com' : (role === 'Tecnico' ? 'tecnico@tcc-ng.com' : 'cliente@tcc-ng.com'),
      picture: role === 'Admin' ? 'https://picsum.photos/seed/admin/200/200' : (role === 'Tecnico' ? 'https://picsum.photos/seed/tecnico/200/200' : 'https://picsum.photos/seed/cliente/200/200'),
      'https://tcc-ng.com/roles': [role]
    };
    localStorage.setItem('tcc_mock_user', JSON.stringify(mockUser));
    this.mockUser$.next(mockUser);
    this.mockIsAuthenticated$.next(true);
  }

  /**
   * Simulates a login session for a completely new user without a profile (Triggers Onboarding)
   */
  simularLoginNovo(): void {
    const mockUser = {
      sub: 'auth0|mocknewuser123',
      name: 'João da Silva',
      given_name: 'João',
      email: 'joao.silva@exemplo.com',
      picture: 'https://picsum.photos/seed/joaosilva/200/200',
      'https://tcc-ng.com/roles': []
    };
    localStorage.removeItem('tcc_profile_completed_joao.silva@exemplo.com');
    localStorage.setItem('tcc_mock_user', JSON.stringify(mockUser));
    this.mockUser$.next(mockUser);
    this.mockIsAuthenticated$.next(true);
  }

  loginWithRedirect(options?: any): void {
    if (this.auth0) {
      this.auth0.loginWithRedirect(options);
    } else {
      console.warn('Auth0 service not available.');
    }
  }

  login(): void {
    this.loginWithRedirect();
  }

  logout(options?: any): void {
    localStorage.removeItem('tcc_mock_user');
    this.mockUser$.next(null);
    this.mockIsAuthenticated$.next(false);
    if (this.auth0) {
      this.auth0.logout(options);
    }
  }

  getToken(): Observable<string> {
    if (this.mockIsAuthenticated$.value) {
      const mockPayload = {
        sub: this.mockUser$.value?.sub,
        email: this.mockUser$.value?.email,
        'https://tcc-ng.com/roles': this.mockUser$.value?.['https://tcc-ng.com/roles']
      };
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(mockPayload));
      const signature = 'mock_signature';
      return of(`${header}.${payload}.${signature}`);
    }
    
    if (this.auth0 && this.realIsAuthenticated) {
      return this.auth0.getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://api.tcc-ng.com'
        }
      }).pipe(
        timeout(10000),
        catchError(err => {
          console.warn('Auth0 getAccessTokenSilently timeout or error', err);
          // Fall back to mock token on auth0 error
          const defaultMockPayload = {
            sub: 'auth0|mocktecnico123',
            email: 'tecnico@tcc-ng.com',
            'https://tcc-ng.com/roles': ['Tecnico']
          };
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify(defaultMockPayload));
          const signature = 'mock_signature';
          return of(`${header}.${payload}.${signature}`);
        })
      );
    }

    // Default fallback mock token when not authenticated, to prevent hanging
    // in iframe preview and let mock API requests execute instantly
    const defaultMockPayload = {
      sub: 'auth0|mocktecnico123',
      email: 'tecnico@tcc-ng.com',
      'https://tcc-ng.com/roles': ['Tecnico']
    };
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(defaultMockPayload));
    const signature = 'mock_signature';
    return of(`${header}.${payload}.${signature}`);
  }

  getAccessTokenSilently(options?: any): Observable<string> {
    return this.getToken();
  }
}

/**
 * Custom guard function that supports both real Auth0 and mock sessions.
 * Redirects unauthenticated users to the landing page.
 */
export const appAuthGuardFn: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated$.pipe(
    take(1),
    map(authenticated => {
      if (authenticated) {
        return true;
      }
      router.navigate(['']);
      return false;
    })
  );
};
