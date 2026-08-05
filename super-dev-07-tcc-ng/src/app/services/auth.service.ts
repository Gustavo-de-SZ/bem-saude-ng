import { Injectable, inject, InjectionToken } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, catchError } from 'rxjs/operators';

export const REAL_AUTH0_TOKEN = new InjectionToken<any>('REAL_AUTH0_TOKEN');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0 = inject(REAL_AUTH0_TOKEN, { optional: true });

  constructor() {
  }

  public user$ = new Observable<any>(subscriber => {
    if (this.auth0) {
      this.auth0.user$.subscribe((u: any) => subscriber.next(u));
    } else {
      subscriber.next(null);
    }
  });

  public isAuthenticated$ = new Observable<boolean>(subscriber => {
    if (this.auth0) {
      this.auth0.isAuthenticated$.subscribe((auth: boolean) => subscriber.next(auth));
    } else {
      subscriber.next(false);
    }
  });

  public isLoading$ = new Observable<boolean>(subscriber => {
    if (this.auth0) {
      this.auth0.isLoading$.subscribe((loading: boolean) => subscriber.next(loading));
    } else {
      subscriber.next(false);
    }
  });

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
    if (this.auth0) {
      this.auth0.logout(options);
    }
  }

  getToken(): Observable<string> {
    if (this.auth0) {
      return this.auth0.getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://api.tcc-ng.com'
        }
      });
    }
    return of('');
  }

  getAccessTokenSilently(options?: any): Observable<string> {
    return this.getToken();
  }
}

/**
 * Custom guard function that supports Auth0 sessions.
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
