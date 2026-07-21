import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../services/auth.service';

// interface back
interface InfoUsuario {
  nome: string;
  cargo: string;
  temNotificacao: boolean;
}

@Component({
  selector: 'app-topbar-tecnico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="tcc-topbar">

      <div class="tcc-search-wrapper">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Buscar clientes, chamados..."
          (input)="onSearch($event)"
        >
      </div>

      <div class="tcc-topbar-actions">

        <button class="tcc-toggle-mode" (click)="toggleTheme()">
          <i [class]="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button class="tcc-notification-btn">
          <i class="pi pi-bell"></i>
          @if (usuario.temNotificacao) {
            <span class="tcc-badge"></span>
          }
        </button>

        <div class="tcc-divider"></div>

        <div class="tcc-profile-section">
          <div class="tcc-profile-info">
            <span class="tcc-profile-name">{{ usuario.nome }}</span>
            <span class="tcc-profile-role">{{ usuario.cargo }}</span>
          </div>
          <div class="tcc-profile-avatar">
            <i class="pi pi-user"></i>
          </div>
        </div>

      </div>
    </header>
  `,
  styles: [`
    .tcc-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      background-color: transparent;
      width: 100%;
    }


    .tcc-search-wrapper {
      position: relative;
      width: 100%;
      max-width: 480px;

      i {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--tcc-text-muted);
        font-size: 18px;
      }

      input {
        width: 100%;
        padding: 14px 16px 14px 44px;
        background-color: var(--tcc-bg);
        border: 1px solid var(--tcc-border);
        border-radius: var(--tcc-radius);
        color: var(--tcc-text-main);
        font-size: 15px;
        transition: all 0.2s ease;

        &::placeholder {
          color: var(--tcc-text-muted);
        }

        &:focus {
          outline: none;
          border-color: var(--tcc-primary);
          box-shadow: 0 0 0 3px #3b82f61a;
          background-color: var(--tcc-surface);
        }
      }
    }


    .tcc-topbar-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }


    .tcc-notification-btn {
      background: transparent;
      border: none;
      color: var(--tcc-text-main);
      font-size: 20px;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;

      &:hover {
        color: var(--tcc-primary);
      }

      .tcc-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background-color: #ef4444;
        border-radius: 50%;
        border: 2px solid var(--tcc-bg);
      }
    }


    .tcc-divider {
      width: 1px;
      height: 32px;
      background-color: var(--tcc-border);
    }


    .tcc-profile-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 4px;
      border-radius: var(--tcc-radius);
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--tcc-surface-hover);
      }
    }

    .tcc-profile-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .tcc-profile-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--tcc-text-main);
    }

    .tcc-profile-role {
      font-size: 13px;
      color: var(--tcc-text-muted);
      margin-top: 2px;
    }

    .tcc-profile-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: #3b82f61a;
      color: var(--tcc-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
  `]
})
export class TopbarTecnico {
  usuario: InfoUsuario = {
    nome: '',
    cargo: '',
    temNotificacao: false
  };

  isDark: boolean;

  private themeService = inject(ThemeService);
  // Injetamos o serviço Auth0
  private authService = inject(AuthService);

  constructor() {
    this.isDark = this.themeService.isDark();
    this.setupUserSubscription();
  }

  private setupUserSubscription(): void {
    // O Auth0 injeta o usuário automaticamente aqui
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.usuario.nome = user.name || 'Usuário';
        
        // Aqui pegamos o cargo (Role) que configuramos na Action do Auth0
        // Lembre-se de usar o namespace exato que você configurou no Auth0
        const roles = user['https://tcc-ng.com/roles'] || [];
        this.usuario.cargo = roles.length > 0 ? roles[0] : 'Técnico';
        
        this.usuario.temNotificacao = false;
      }
    });
  }

  toggleTheme() {
    this.themeService.toggle();
    this.isDark = this.themeService.isDark();
  }

  onSearch(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    console.log('Buscando:', valor);
  }
}