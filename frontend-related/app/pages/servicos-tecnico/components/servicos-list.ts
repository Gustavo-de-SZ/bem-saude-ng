import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Servico } from '../../../models/servico';
// PrimeNG imports for menu
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
// Services (we'll need the servico service for status updates if needed, but for print we don't need service)
import { ServicoService } from '../../../services/servico.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-servicos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  template: `
    <div class="tcc-services-list">
      @for (servico of servicos; track servico.titulo) {
        <div class="tcc-service-card" (click)="openDetails(servico)">

          <div class="tcc-service-icon-box">
            <i class="pi" [ngClass]="servico.icone"></i>
          </div>

          <div class="tcc-service-content">
            <div class="tcc-service-header">
              <h3>{{ servico.titulo }}</h3>
              <span class="tcc-status-badge" [ngClass]="getBadgeClass(servico.status)">
                <i class="pi" [ngClass]="getBadgeIcon(servico.status)"></i>
                {{ servico.status }}
              </span>
            </div>

            <div class="tcc-service-details">
              <span><i class="pi pi-user"></i> {{ servico.cliente }}</span>
              <span><i class="pi pi-calendar"></i> {{ formatarData(servico.data) }}</span>
              <span><i class="pi pi-clock"></i> {{ servico.duracao }}</span>
              <span class="price">{{ formatarValor(servico.valor) }}</span>
            </div>
          </div>

          <div class="tcc-service-actions">
            <button class="icon-btn" title="Visualizar" (click)="$event.stopPropagation();"><i class="pi pi-eye"></i></button>
            <button class="icon-btn" title="Editar" [routerLink]="['/painel/servicos/', servico.titulo, 'edit']" (click)="$event.stopPropagation();"><i class="pi pi-pencil"></i></button>


            <button class="tcc-btn-outline small" (click)="menu.toggle($event); setMenuContext(servico); $event.stopPropagation();">
              Ações <i class="pi pi-chevron-down"></i>
            </button>
            <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
          </div>

        </div>
      }

    </div>
    <!-- Hidden Print Container -->
    <div class="print-only">
      <div class="os-container" *ngIf="selectedItem">
        <div class="os-header">
          <h2>Ordem de Serviço</h2>
          <p><strong>Nº:</strong> OS-{{selectedItem.id || '1000'}}{{selectedItem.id}} - <strong>Data:</strong> {{selectedItem.data | date:'dd/MM/yyyy HH:mm'}}</p>
        </div>
        <div class="os-body">
          <p><strong>Cliente:</strong> {{selectedItem.cliente}}</p>
          <p><strong>Serviço:</strong> {{selectedItem.titulo}}</p>
          <p><strong>Status:</strong> {{selectedItem.status}}</p>
          <p><strong>Valor:</strong> {{selectedItem.valor | currency:'BRL'}}</p>
          <div class="os-desc">
            <strong>Descrição:</strong>
            <p>{{selectedItem.descricao || 'Sem descrição.'}}</p>
          </div>
        </div>
        <div class="os-footer">
          <p>Assinatura do Cliente</p>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`

    .print-only { display: none; }
    @media print {
      :host { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 9999; display: block; overflow: visible; padding: 20px; }
      body * { visibility: hidden; }
      .print-only, .print-only * { visibility: visible; display: block; }
      .print-only { position: absolute; left: 0; top: 0; width: 100%; font-family: sans-serif; color: black; background: white; }
      .os-container { border: 1px solid #ccc; padding: 40px; }
      .os-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
      .os-header h2 { margin: 0 0 10px 0; font-size: 24px; }
      .os-body p { margin: 10px 0; font-size: 16px; }
      .os-desc { margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
      .os-footer { margin-top: 80px; text-align: center; }
      .signature-line { width: 300px; border-top: 1px solid #000; margin: 40px auto 0; }
    }

    .tcc-services-list { display: flex; flex-direction: column; gap: 12px; }

    .tcc-service-card {
      background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px; padding: 16px 24px; /* IGUAL A AGENDA */
      display: flex; align-items: center; gap: 24px; transition: box-shadow 0.2s, border-color 0.2s;
    }
    .tcc-service-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); cursor: pointer; }

    .tcc-service-icon-box {
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

    .tcc-service-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tcc-service-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .tcc-service-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--tcc-text-main, #0f172a);
    }

    .tcc-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid;
    }
    .tcc-status-badge i {
      font-size: 10px;
    }

    .status-concluido {
      color: #10b981;
      border-color: #10b981;
      background-color: #ecfdf5;
    }
    .status-andamento {
      color: #3b82f6;
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
    .status-pendente {
      color: #f59e0b;
      border-color: #f59e0b;
      background-color: #fffbeb;
    }
    .status-cancelado {
      color: #ef4444;
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .tcc-service-details {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
      color: var(--tcc-text-muted, #64748b);
    }
    .tcc-service-details span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tcc-service-details i {
      font-size: 13px;
      opacity: 0.7;
    }
    .price {
      color: var(--tcc-primary, #3b82f6);
      font-weight: 600;
    }

    .tcc-service-actions {
      display: flex;
      align-items: center;
      gap: 8px;
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

    @media (max-width: 768px) {
      .tcc-service-card { flex-direction: column; align-items: flex-start; }
      .tcc-service-actions { width: 100%; justify-content: flex-end; }
    }
  `]
})
export class ServicosListComponent {
  @Input() servicos: Servico[] = [];
  menuItems: MenuItem[] = [];
  selectedItem: any = null;

  constructor(
    private servicoService: ServicoService,
    private messageService: MessageService,
    private router: Router
  ) {}

  // Sets the context for the action menu and prepares the menu items
  setMenuContext(servico: any) {
    this.selectedItem = servico;
    // We'll define the menu items here. For now, let's add a print option and maybe status change options.
    this.menuItems = [
      {
        label: 'Imprimir Ordem de Serviço',
        icon: 'pi pi-print',
        command: () => this.printServiceNote(servico)
      },
      // We can add more options here, e.g., change status, etc.
      // For example, changing status to 'Concluído' or 'Cancelado'
      {
        label: 'Marcar como Concluído',
        icon: 'pi pi-check',
        command: () => this.updateStatus(servico, 'Concluído')
      },
      {
        label: 'Cancelar Serviço',
        icon: 'pi pi-times',
        command: () => this.updateStatus(servico, 'Cancelado')
      }
    ];
  }

  // Prints the service note by triggering the browser's print function on a hidden container or the whole page.
  // For simplicity, we'll use window.print() but note that this prints the entire page.
  // Alternatively, we can create a hidden print-friendly element. However, for now, we'll use window.print.
  printServiceNote(servico: any) {
    this.selectedItem = servico;
    setTimeout(() => window.print(), 100);
  }

  openDetails(servico: any): void {
    if (servico.titulo) {
      this.router.navigate(['/painel/servicos/', servico.titulo, 'edit']);
    }
  }

  // Updates the status of a service
  updateStatus(servico: any, newStatus: string) {
    // Create a copy of the service with the new status
    const updatedServico = { ...servico, status: newStatus };
    // Call the service to update the service
    this.servicoService.updateServico(updatedServico).subscribe({
      next: (updated) => {
        // Update the local list
        const index = this.servicos.findIndex(s => s.titulo === servico.titulo);
        if (index !== -1) {
          this.servicos[index] = updated;
        }
        // Show a success message
        this.messageService.add({
          severity: 'success',
          summary: 'Status Atualizado',
          detail: `Status alterado para ${newStatus}`
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível atualizar o status. Tente novamente.'
        });
      }
    });
  }

  formatarData(data: any): string {
    if (!data) return '—';
    if (data instanceof Date) {
      const d = data.getDate().toString().padStart(2, '0');
      const m = (data.getMonth() + 1).toString().padStart(2, '0');
      const y = data.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(data);
    if (str.includes('/')) {
      return str;
    }
    if (str.includes('-')) {
      const partes = str.split('T')[0].split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
          return `${partes[0]}/${partes[1]}/${partes[2]}`;
        }
      }
    }
    return str;
  }

  formatarValor(valor: any): string {
    if (valor === undefined || valor === null) return '—';
    const str = String(valor).trim();
    if (str.startsWith('R$')) {
      return str;
    }
    const num = parseFloat(str.replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (isNaN(num)) {
      return str;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Concluído': return 'status-concluido';
      case 'Em Andamento': return 'status-andamento';
      case 'Pendente': return 'status-pendente';
      case 'Cancelado': return 'status-cancelado';
      default: return '';
    }
  }

  getBadgeIcon(status: string): string {
    switch (status) {
      case 'Concluído': return 'pi-check';
      case 'Em Andamento': return 'pi-circle';
      case 'Pendente': return 'pi-clock';
      case 'Cancelado': return 'pi-times-circle';
      default: return 'pi-info-circle';
    }
  }
}