import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
   <nav class="tcc-sidebar-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-th-large"></i>
          <span>Visão Geral</span>
        </a>
        <a routerLink="/admin/tecnicos" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-users"></i>
          <span>Aprovar Técnicos</span>
        </a>
        
        <div class="tcc-sidebar-footer">
          <a routerLink="/cliente/configuracoes" class="tcc-nav-item">
            <i class="pi pi-cog"></i>
            <span>Configurações</span>
          </a>
          <div class="tcc-nav-separator"></div>
          <a (click)="logout()" class="tcc-nav-item tcc-logout" style="cursor: pointer;">
            <i class="pi pi-sign-out"></i>
            <span>Sair</span>
          </a>
        </div>
   </nav>
    `,
  styles: [`
    .tcc-sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      overflow-y: auto;
    }
    .tcc-nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      border-radius: 12px;
      color: var(--tcc-text-muted);
      text-decoration: none;
      font-weight: 500;
      font-size: 15px;
      transition: all 0.2s ease;

      i { font-size: 19px; }

      &:hover:not(.active) {
        background-color: var(--tcc-surface-hover);
        color: var(--tcc-text-main);
      }

      &.active {
        background-color: var(--tcc-primary);
        color: #ffffff;
        box-shadow: 0 4px 12px #3b82f64d;
      }
    }
    .tcc-sidebar-footer {
      padding: 16px;
      margin-top: auto;
      border-top: 1px solid var(--tcc-border);
    }
    .tcc-nav-separator {
      height: 1px;
      background-color: var(--tcc-border);
      margin: 8px 0;
    }
    .tcc-logout:hover {
      color: #ef4444 !important;
      background-color: #ef44441a !important;
    }
  `]
})
export class SidebarAdmin {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
