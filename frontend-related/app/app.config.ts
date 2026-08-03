import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideAuth0, authHttpInterceptorFn, AuthService as Auth0Service } from '@auth0/auth0-angular';
import { provideAnimations } from '@angular/platform-browser/animations';
// Configuração do PrimeNG v18
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { AuthService as CustomAuthService, REAL_AUTH0_TOKEN } from './services/auth.service';

const auth0Config = provideAuth0({
  domain: 'dev-fzslqbhihrhb8va0.us.auth0.com',
  clientId: '0ack0PPx1NHjUHy5ym4R3rsmBjjnzBwN',
  
  // A MÁGICA ACONTECE AQUI: Salva o token fisicamente no navegador
  cacheLocation: 'localstorage', 
  
  authorizationParams: {
    redirect_uri: window.location.origin + '/painel',
    audience: 'https://api.tcc-ng.com',
  },
  httpInterceptor: {
    allowedList: [
      {
        uri: 'http://localhost:8000/*', 
        tokenOptions: {
          authorizationParams: {
            audience: 'https://api.tcc-ng.com'
          }
        }
      }
    ]
  }
});

const auth0ProvidersRaw = (auth0Config as any).ɵproviders || auth0Config;
const processedAuth0Providers = (Array.isArray(auth0ProvidersRaw) ? auth0ProvidersRaw : [auth0ProvidersRaw]).map((p: any) => {
  if (p === Auth0Service) {
    return { provide: REAL_AUTH0_TOKEN, useClass: Auth0Service };
  } else if (p && typeof p === 'object' && p.provide === Auth0Service) {
    return { ...p, provide: REAL_AUTH0_TOKEN };
  }
  return p;
});

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideHttpClient(withInterceptors([authHttpInterceptorFn, errorInterceptor])),
    { provide: Auth0Service, useExisting: CustomAuthService },
    provideAnimations(), // OBRIGATÓRIO para os painéis flutuantes não quebrarem
    providePrimeNG({
      theme: {
        preset: Aura, // Tema base limpo e moderno
        options: {
          darkModeSelector: '.tp-dark-theme' // Força o tema claro conforme o seu design
        }
      },
      translation: {
        dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
        monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        today: 'Hoje',
        clear: 'Limpar',
        dateFormat: 'dd/mm/yy',
        firstDayOfWeek: 0
      }
    }),
    
    processedAuth0Providers
  ]
};