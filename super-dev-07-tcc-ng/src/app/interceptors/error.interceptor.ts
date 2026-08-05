import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        messageService.add({ severity: 'error', summary: 'Sessão Expirada', detail: 'Por favor, faça login novamente.' });
      } else if (error.status === 403) {
        messageService.add({ severity: 'error', summary: 'Acesso Negado', detail: 'Você não tem permissão para realizar esta ação.' });
      } else if (error.status >= 500) {
        messageService.add({ severity: 'error', summary: 'Erro no Servidor', detail: 'Ocorreu um problema no servidor. Tente novamente mais tarde.' });
      } else if (error.status === 0) {
         messageService.add({ severity: 'error', summary: 'Erro de Conexão', detail: 'Não foi possível conectar ao servidor.' });
      }
      return throwError(() => error);
    })
  );
};
