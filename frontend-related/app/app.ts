import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileService } from './services/profile.service';
import { AuthService } from './services/auth.service';
import { filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tcc-ng');

  constructor(
    private profileService: ProfileService,
    private auth: AuthService
  ) {
    this.verificarECriarPerfilSeNecessario();
  }

  private verificarECriarPerfilSeNecessario(): void {
    // Aguarda autenticação confirmada
    this.auth.isAuthenticated$.pipe(
      filter(authenticated => authenticated),
      take(1),
      switchMap(() => this.auth.user$.pipe(take(1)))
    ).subscribe(user => {
      if (user) {
        this.profileService.verificarPerfilExistente().subscribe({
          next: (response) => {
            if (!response.exists) {
              // Perfil não existe, criar baseado no role
              const roles = user['https://tcc-ng.com/roles'] || [];
              const userRole = roles.length > 0 ? roles[0] : 'tecnico'; // padrão para tecnico

              let perfilData: any = {
                email: user.email,
                nome: user.name || user.given_name || 'Usuário'
              };

              if (userRole.toLowerCase() === 'cliente') {
                this.profileService.criarPerfilCliente(perfilData).subscribe({
                  next: (cliente) => {
                    console.log('Perfil de cliente criado:', cliente);
                    // Opcional: marcar no app_metadata que perfil foi criado
                  },
                  error: (err) => console.error('Erro ao criar perfil de cliente:', err)
                });
              } else {
                // Assumindo tecnico como padrão
                this.profileService.criarPerfilTecnico(perfilData).subscribe({
                  next: (tecnico) => {
                    console.log('Perfil de técnico criado:', tecnico);
                  },
                  error: (err) => console.error('Erro ao criar perfil de técnico:', err)
                });
              }
            }
          },
          error: (err) => console.error('Erro ao verificar perfil:', err)
        });
      }
    });
  }
}