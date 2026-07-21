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
        // Option to verify if they are accessing the right area
        // e.g. state.url.includes('/cliente') and res.type === 'cliente'
        return true;
      }
      router.navigate(['/completar-cadastro']);
      return false;
    }),
    catchError(() => {
      // Falha ao comunicar com o backend
      return of(true); // Allow them through in case of temporary network failure, or false if strictly required
    })
  );
};
