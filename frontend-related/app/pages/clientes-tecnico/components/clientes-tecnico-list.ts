import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  template: `
    <div class="tcc-client-list">
      @for (cliente of clientes; track trackByCliente($index, cliente)) {
        <div class="tcc-client-card" (click)="openDetails(cliente)">

          <div class="tcc-client-icon-box">
            <i class="pi pi-users"></i>
          </div>

          <div class="tcc-client-content">
            <div class="tcc-client-header">
              <h3>{{ cliente.nome_completo || cliente.nome }}</h3>
              <span class="tcc-company-badge">{{ cliente.empresa }}</span>
              <span class="tcc-rating">
                <i class="pi pi-star-fill"></i> {{ cliente.avaliacao }}
              </span>
            </div>

            <div class="tcc-client-meta">
              <span class="tcc-meta-item"><i class="pi pi-envelope"></i> {{ cliente.email }}</span>
              <span class="tcc-meta-item"><i class="pi pi-phone"></i> {{ formatPhone(cliente.telefone) }}</span>
              <span class="tcc-meta-item"><i class="pi pi-map-marker"></i> {{ cliente.local }}</span>
            </div>
          </div>

          <div class="tcc-client-stats">
            <div class="tcc-mini-stat">
              <span>Ativos</span>
              <strong>{{ cliente.servicosAtivos }}</strong>
            </div>
            <div class="tcc-mini-stat">
              <span>Concluídos</span>
              <strong>{{ cliente.servicosConcluidos }}</strong>
            </div>
          </div>

          <div class="tcc-client-actions">
            <button class="icon-btn" title="Editar" [routerLink]="['/painel/clientes/', cliente.email || cliente.id || cliente.nome, 'edit']" (click)="$event.stopPropagation();">
              <i class="pi pi-pencil"></i>
            </button>

            <!-- Modify the button to trigger the menu -->
            <button class="tcc-btn-outline small" (click)="menu.toggle($event); setMenuContext(cliente); $event.stopPropagation();">
              Ações <i class="pi pi-chevron-down"></i>
            </button>
          </div>

        </div>
      }
    </div>

    <!-- Add the menu component -->
    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
  `,
  styles: [`
    .tcc-client-list { display: flex; flex-direction: column; gap: 12px; }

    .tcc-client-card {
      background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px; padding: 16px 24px;
      display: flex; align-items: center; gap: 24px; transition: box-shadow 0.2s, border-color 0.2s;
    }
    .tcc-client-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); cursor: pointer; }

    .tcc-client-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 10px;
      background-color: #eff6ff;
      color: var(--tcc-primary, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .tcc-client-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tcc-client-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .tcc-client-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-company-badge {
      background-color: var(--tcc-bg, #f8fafc);
      border: 1px solid var(--tcc-border, #e2e8f0);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #eab308;
    }

    .tcc-rating i {
      font-size: 12px;
    }

    .tcc-client-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tcc-meta-item i {
      font-size: 13px;
      opacity: 0.7;
    }

    .tcc-client-stats {
      display: flex;
      gap: 24px;
      padding: 0 24px;
      border-left: 1px solid var(--tcc-border, #e2e8f0);
      border-right: 1px solid var(--tcc-border, #e2e8f0);
    }

    .tcc-mini-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .tcc-mini-stat span {
      font-size: 11px;
      color: var(--tcc-text-muted, #64748b);
    }

    .tcc-mini-stat strong {
      font-size: 16px;
      color: var(--tcc-text-main, #0f172a);
      font-weight: 700;
    }

    .tcc-client-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-btn-outline.small {
      background-color: transparent;
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-main, #475569);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .tcc-btn-outline.small:hover {
      background-color: var(--tcc-bg, #f8fafc);
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #475569);
    }
    @media (max-width: 768px) {
      .tcc-client-card { flex-direction: column; align-items: flex-start; }
      .tcc-client-stats { border: none; padding: 0; padding-top: 12px; border-top: 1px solid var(--tcc-border, #e2e8f0); width: 100%; justify-content: space-around; }
      .tcc-client-actions { width: 100%; justify-content: flex-end; }
    }
  `]
})
  export class ClientesList {
  @Input() clientes: Cliente[] = [];

  private router = inject(Router);

  menuItems: MenuItem[] = [];
  selectedCliente: Cliente | null = null;

  setMenuContext(cliente: Cliente) {
    this.selectedCliente = cliente;
    this.menuItems = [
      {
        label: 'Ver Detalhes',
        icon: 'pi pi-eye',
        command: () => {
          if (this.selectedCliente) {
            this.openDetails(this.selectedCliente);
          }
        }
      },
      {
        label: 'Editar Cliente',
        icon: 'pi pi-pencil',
        command: () => {
          if (this.selectedCliente) {
            this.router.navigate(['/painel/clientes', this.selectedCliente.email || this.selectedCliente.id || this.selectedCliente.nome, 'edit']);
          }
        }
      }
    ];
  }

  openDetails(cliente: Cliente): void {
    if (cliente && (cliente.email || cliente.nome)) {
      this.router.navigate(['/painel/clientes', cliente.email || cliente.id || cliente.nome, 'edit']);
    }
  }

  /**
   * Track function for clientes to handle cases where email might be empty/null
   * @param index The index of the item
   * @param item The cliente item
   * @returns A unique identifier for tracking
   */
  trackByCliente(index: number, item: Cliente): any {
    // Prefer email if available and not empty, otherwise use index to ensure uniqueness
    return item.email && item.email.trim() !== '' ? item.email : index;
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }
}