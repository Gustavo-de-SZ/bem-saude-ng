import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { NotificacaoService, Notificacao } from '../../../services/notificacao.service';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topbar-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="tcc-topbar">
      

      <div class="tcc-topbar-actions">
        <button class="tcc-icon-btn" (click)="toggleTheme()">
          <i [class]="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button class="tcc-icon-btn">
          <i class="pi pi-comments"></i>
        </button>

        <button class="tcc-icon-btn tcc-notification-btn">
          <i class="pi pi-bell"></i>
          <span class="tcc-badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
        </button>

        <div class="tcc-divider"></div>

        <div class="tcc-profile-section">
          <div class="tcc-profile-info">
            <span class="tcc-profile-name">{{ userName }}</span>
            <span class="tcc-profile-role">Cliente</span>
          </div>
          <div class="tcc-profile-avatar">
            <i class="pi pi-user"></i>
          </div>
          <i class="pi pi-chevron-down tcc-profile-arrow"></i>
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
        color: var(--tcc-text-muted, #94a3b8);
        font-size: 18px;
      }

      input {
        width: 100%;
        padding: 12px 16px 12px 44px;
        background-color: var(--tcc-bg, #f8fafc);
        border: 1px solid var(--tcc-border, #e2e8f0);
        border-radius: 8px;
        color: var(--tcc-text-main, #0f172a);
        font-size: 14px;
        transition: all 0.2s ease;

        &::placeholder { color: var(--tcc-text-muted, #94a3b8); }
        &:focus {
          outline: none;
          border-color: var(--tcc-primary, #3b82f6);
          background-color: var(--tcc-surface, #ffffff);
        }
      }
    }

    .tcc-topbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .tcc-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background-color: transparent;
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-text-main, #0f172a);
      }
    }

    .tcc-notification-btn {
      position: relative;
      .tcc-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background-color: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--tcc-surface, #ffffff);
      }
    }

    .tcc-divider {
      width: 1px;
      height: 32px;
      background-color: var(--tcc-border, #e2e8f0);
    }

    .tcc-profile-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding-left: 8px;
    }

    .tcc-profile-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .tcc-profile-name { font-size: 14px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }
    .tcc-profile-role { font-size: 12px; color: var(--tcc-text-muted, #64748b); }

    .tcc-profile-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .tcc-profile-arrow { font-size: 12px; color: var(--tcc-text-muted, #94a3b8); }
  `]
})
export class TopbarCliente implements OnInit, OnDestroy {
  private notificacaoService = inject(NotificacaoService);
  notificacoes: Notificacao[] = [];
  naoLidasCount = 0;
  private notifSub?: Subscription;
  isDarkMode = false;
  notificationCount = 0;
  userName = '';

  private authService = inject(AuthService);

  constructor() {
    // Agora o Auth0 nos fornece o objeto user$ automaticamente
    this.authService.user$.subscribe({
      next: (user: any) => {
        if (user) {
          // O Auth0 costuma usar 'name' ou 'given_name'
          this.userName = user.nickname || user.given_name || (user.name?.includes('@') ? user.name.split('@')[0] : user.name) || 'Usuário';
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil do Auth0', err);
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
      
    });
  }

  marcarComoLidas() {
    this.notificacaoService.marcarLidas().subscribe(() => {
      this.naoLidasCount = 0;
      
      this.notificacoes.forEach(n => n.lida = true);
    });
  }

  ngOnDestroy() {
    if (this.notifSub) this.notifSub.unsubscribe();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('tp-dark-theme', this.isDarkMode);
  }
}