import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="tcc-sidebar">
      <div class="tcc-sidebar-brand">
        <div class="tcc-logo-icon">
          <i class="pi pi-desktop"></i>
        </div>
        <div class="tcc-logo-text">
          <strong>TechConnect</strong>
          <span>Área do Cliente</span>
        </div>
      </div>

      <nav class="tcc-sidebar-nav">
        <a routerLink="/cliente/inicio" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-home"></i>
          <span>Início</span>
        </a>
        <a routerLink="/cliente/buscar" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-search"></i>
          <span>Buscar Profissionais</span>
        </a>
        <a routerLink="/cliente/meus-chamados" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-list"></i>
          <span>Meus Chamados</span>
        </a>
        <a routerLink="/cliente/agendamentos" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-calendar"></i>
          <span>Meus Agendamentos</span>
        </a>
        <a routerLink="/cliente/historico" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi pi-history"></i>
          <span>Histórico</span>
        </a>
      </nav>

      <div class="tcc-sidebar-footer">
        <a routerLink="/cliente/ajuda" class="tcc-nav-item">
          <i class="pi pi-question-circle"></i>
          <span>Ajuda</span>
        </a>
        <a routerLink="/cliente/configuracoes" class="tcc-nav-item">
          <i class="pi pi-cog"></i>
          <span>Configurações</span>
        </a>
        <div class="tcc-nav-separator"></div>
        <a routerLink="/login" class="tcc-nav-item tcc-logout">
          <i class="pi pi-sign-out"></i>
          <span>Sair</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .tcc-sidebar {
      width: 260px;
      height: 100vh;
      background-color: var(--tcc-surface, #ffffff);
      border-right: 1px solid var(--tcc-border, #e2e8f0);
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .tcc-sidebar-brand {
      height: 80px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 24px;
      border-bottom: 1px solid var(--tcc-border, #f1f5f9);
    }

    .tcc-logo-icon {
      width: 36px;
      height: 36px;
      background-color: var(--tcc-primary, #3b82f6);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .tcc-logo-text {
      display: flex;
      flex-direction: column;
      strong { font-size: 16px; color: var(--tcc-text-main, #0f172a); }
      span { font-size: 11px; color: var(--tcc-text-muted, #64748b); font-weight: 500; }
    }

    .tcc-sidebar-nav, .tcc-sidebar-footer {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
    }

    .tcc-sidebar-nav {
      flex: 1;
      overflow-y: auto;
    }

    .tcc-sidebar-footer {
      border-top: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-nav-separator {
      height: 1px;
      background-color: var(--tcc-border, #f1f5f9);
      margin: 8px 0;
    }

    .tcc-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--tcc-text-muted, #64748b);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      cursor: pointer;

      i { font-size: 16px; }

      &:hover:not(.active) {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-text-main, #0f172a);
      }

      &.active {
        background-color: var(--tcc-primary, #3b82f6);
        color: #ffffff;
      }
    }

    .tcc-logout:hover {
      color: #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.1) !important;
    }
  `]
})
export class SidebarCliente {}