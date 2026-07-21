import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
    private auth: AuthService,
    private router: Router
  ) {
    this.verificarECriarPerfilSeNecessario();
  }

  private verificarECriarPerfilSeNecessario(): void {
    // Aguarda autenticação confirmada e dados do usuário disponíveis
    this.auth.isAuthenticated$.pipe(
      filter(authenticated => authenticated),
      switchMap(() => this.auth.user$),
      filter(user => !!user), // Aguarda até ter dados reais do usuário
      take(1) // Pega a primeira emissão válida do usuário
    ).subscribe({
      next: (user) => {
        this.profileService.verificarPerfilExistente().subscribe({
          next: (response) => {
            if (!response.exists) {
              // Redireciona para completar o cadastro se o perfil não existe
              this.router.navigate(['/completar-cadastro']);
            }
          },
          error: (err) => console.error('Erro ao verificar perfil:', err)
        });
      },
      error: (err) => console.error('Erro ao obter dados do usuário:', err)
    });
  }
}