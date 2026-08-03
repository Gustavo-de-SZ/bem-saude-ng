import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { NotificacaoService, Notificacao } from '../../../services/notificacao.service';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { ProfileService } from '../../../services/profile.service';
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
  imports: [CommonModule, RouterModule],
  template: `
    <header class="tcc-topbar">



      <div class="tcc-topbar-actions">

        <button class="tcc-toggle-mode" (click)="toggleTheme()">
          <i [class]="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button class="tcc-notification-btn" routerLink="/painel/chat">
          <i class="pi pi-comments"></i>
        </button>

        <button class="tcc-notification-btn" (click)="toggleNotificationsDropdown($event)">
          <i class="pi pi-bell"></i>
          @if (usuario.temNotificacao) {
            <span class="tcc-badge">{{ naoLidasCount > 9 ? '9+' : naoLidasCount }}</span>
          }
        </button>

        @if (showNotificationsDropdown) {
          <div class="notification-dropdown">
            <div class="p-3">
                <h4 class="text-sm font-semibold mb-2 border-b pb-2">Notificações</h4>
                <div class="flex flex-col gap-3 max-h-80 overflow-y-auto">
                    @if (notificacoes.length === 0) {
                        <p class="text-sm text-gray-500 text-center py-4">Nenhuma notificação</p>
                    }
                    @for (notif of notificacoes; track notif.id) {
                        <div class="flex items-start gap-3" [ngClass]="{'opacity-60': notif.lida}">
                            <i class="pi mt-1" [ngClass]="{
                                'pi-info-circle text-blue-500': notif.tipo === 'info',
                                'pi-check-circle text-green-500': notif.tipo === 'success',
                                'pi-exclamation-triangle text-yellow-500': notif.tipo === 'warning',
                                'pi-times-circle text-red-500': notif.tipo === 'error'
                            }"></i>
                            <div>
                                <p class="text-sm m-0 text-gray-800 font-medium">{{ notif.titulo }}</p>
                                <p class="text-xs m-0 text-gray-500">{{ notif.mensagem }}</p>
                            </div>
                        </div>
                    }
                </div>
                <div class="mt-3 pt-2 border-t text-center">
                    <button class="text-xs text-blue-600 hover:underline bg-transparent border-none cursor-pointer" (click)="marcarComoLidas(); toggleNotificationsDropdown($event)">
                        Marcar todas como lidas
                    </button>
                </div>
            </div>
          </div>
        }

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
      justify-content: flex-end;
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
export class TopbarTecnico implements OnInit, OnDestroy {
  private notificacaoService = inject(NotificacaoService);
  notificacoes: Notificacao[] = [];
  naoLidasCount = 0;
  private notifSub?: Subscription;
  usuario: InfoUsuario = {
    nome: '',
    cargo: '',
    temNotificacao: false
  };

  isDark: boolean;

  private themeService = inject(ThemeService);
  // Injetamos o serviço Auth0
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  constructor() {
    this.isDark = this.themeService.isDark();
    this.setupUserSubscription();
  }

  private setupUserSubscription(): void {
    // O Auth0 injeta o usuário automaticamente aqui
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.usuario.nome = user.nickname || user.given_name || (user.name?.includes('@') ? user.name.split('@')[0] : user.name) || 'Usuário';
        const roles = user['https://tcc-ng.com/roles'] || [];
        this.usuario.cargo = roles.length > 0 ? roles[0] : 'Técnico';
        this.usuario.temNotificacao = true;
        
        this.profileService.obterPerfilTecnico().subscribe({
            next: (perfil) => {
                if (perfil.nome_fantasia) {
                    this.usuario.nome = perfil.nome_fantasia;
                }
            },
            error: () => {}
        });
      }
    });
  }

  
  ngOnInit() {
    this.loadNotificacoes();
    this.notifSub = interval(30000).subscribe(() => this.loadNotificacoes());
  }
  
  loadNotificacoes() {
    this.notificacaoService.getNotificacoes().subscribe(notifs => {
      this.notificacoes = notifs;
      this.naoLidasCount = notifs.filter(n => !n.lida).length;
      this.usuario.temNotificacao = this.naoLidasCount > 0;
    });
  }

  marcarComoLidas() {
    this.notificacaoService.marcarLidas().subscribe(() => {
      this.naoLidasCount = 0;
      this.usuario.temNotificacao = false;
      this.notificacoes.forEach(n => n.lida = true);
    });
  }

  ngOnDestroy() {
    if (this.notifSub) this.notifSub.unsubscribe();
  }

  showNotificationsDropdown = false;

  toggleNotificationsDropdown(event: Event) {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    event.stopPropagation(); // Prevent closing when clicking the button
  }

  toggleTheme() {
    this.themeService.toggle();
    this.isDark = this.themeService.isDark();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.showNotificationsDropdown && !(event.target as HTMLElement).closest('.tcc-notification-btn')) {
      this.showNotificationsDropdown = false;
    }
  }

  onSearch(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    console.log('Buscando:', valor);
  }
}