import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface NavItem {
  route: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="tcc-sidebar">
      <div class="tcc-sidebar-brand" *ngIf="brandTitle">
        <div class="tcc-logo-icon" *ngIf="brandIcon">
          <i class="pi" [ngClass]="brandIcon"></i>
        </div>
        <div class="tcc-logo-text">
          <strong>{{ brandTitle }}</strong>
          <span *ngIf="brandSubtitle">{{ brandSubtitle }}</span>
        </div>
      </div>
      
      <nav class="tcc-sidebar-nav">
        <a *ngFor="let item of navItems" [routerLink]="item.route" routerLinkActive="active" class="tcc-nav-item">
          <i class="pi" [ngClass]="item.icon"></i>
          <span>{{ item.label }}</span>
        </a>
      </nav>
      
      <div class="tcc-sidebar-footer">
        <a *ngFor="let item of footerItems" [routerLink]="item.route" class="tcc-nav-item">
          <i class="pi" [ngClass]="item.icon"></i>
          <span>{{ item.label }}</span>
        </a>
        <div class="tcc-nav-separator"></div>
        <a (click)="onLogout()" class="tcc-nav-item tcc-logout" style="cursor: pointer;">
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
    .tcc-sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
      overflow-y: auto;
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
      i { font-size: 18px; }
      &:hover:not(.active) {
        background-color: var(--tcc-bg, #f8fafc);
        color: var(--tcc-text-main, #0f172a);
      }
      &.active {
        background-color: var(--tcc-primary, #3b82f6);
        color: #ffffff;
        box-shadow: 0 4px 12px #3b82f64d;
      }
    }
    .tcc-sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--tcc-border, #e2e8f0);
    }
    .tcc-nav-separator {
      height: 1px;
      background-color: var(--tcc-border, #f1f5f9);
      margin: 8px 0;
    }
    .tcc-logout:hover {
      color: #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.1) !important;
    }
  `]
})
export class SidebarComponent {
  @Input() brandTitle?: string;
  @Input() brandSubtitle?: string;
  @Input() brandIcon?: string;
  @Input() navItems: NavItem[] = [];
  @Input() footerItems: NavItem[] = [];
  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }
}
