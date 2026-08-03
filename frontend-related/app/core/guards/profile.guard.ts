import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { map, catchError, of } from 'rxjs';

export const profileGuardFn: CanActivateFn = (route, state) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.verificarPerfilExistente().pipe(
    map(res => {
      if (res.exists) {
        // Regra 1: Admin no lugar errado
        if (res.type === 'admin' && !state.url.includes('/admin')) {
           router.navigate(['/admin/dashboard']);
           return false;
        }

        // Regra 2: Usuário comum tentando acessar admin
        if (res.type !== 'admin' && state.url.includes('/admin')) {
           router.navigate(['/painel']);
           return false;
        }

        // Regra 3: Técnico ainda não aprovado
        if (res.type === 'tecnico' && res.aprovado === false) {
           router.navigate(['/pendente-aprovacao']);
           return false;
        }

        // Regra 4: Cliente tentando acessar área do técnico
        if (res.type === 'cliente' && state.url.startsWith('/painel')) {
           router.navigate(['/cliente/inicio']);
           return false;
        }

        // Regra 5: Técnico tentando acessar área do cliente
        if (res.type === 'tecnico' && state.url.startsWith('/cliente')) {
           router.navigate(['/painel/dashboard']);
           return false;
        }

        return true;
      }

      // Permitir acesso à tela de completar cadastro
      if (state.url.includes('/completar-cadastro')) {
         return true;
      }

      router.navigate(['/completar-cadastro']);
      return false;
    }),
    catchError(() => of(true))
  );
};
