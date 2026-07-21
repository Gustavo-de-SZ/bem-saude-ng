import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeusChamadosService } from '../../services/meus-chamados.service';
import { OnInit } from '@angular/core';

interface Chamado {
  id: number;
  equipamento: string;
  status: string;
  dataCriacao: string;
}

@Component({
  selector: 'app-meus-chamados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header tcc-flex-between tcc-gap tcc-flex-wrap tcc-mb-md">
        <h1 class="tcc-title-lg">Meus Chamados</h1>
        <button class="tcc-btn-main" [routerLink]="['/cliente/solicitacao']">
          <i class="pi pi-plus"></i> Novo Chamado
        </button>
      </header>

      <div class="tcc-chamados-list">
        @for (chamado of chamados; track chamado.id) {
          <div class="tcc-form-card">
            <div class="tcc-chamado-item">
              <div class="tcc-chamado-info">
                <span class="tcc-chamado-id">#{{ chamado.id }}</span>
                <span class="tcc-chamado-equipamento">{{ chamado.equipamento }}</span>
                <span class="tcc-chamado-data">{{ chamado.dataCriacao }}</span>
              </div>
              <div class="tcc-chamado-actions">
                <span class="tcc-badge" [class]="statusBadgeClass(chamado.status)">{{ chamado.status }}</span>
                <a class="tcc-link" [routerLink]="['/cliente/chamado', chamado.id]">Ver Detalhes</a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .tcc-chamados-list { display: flex; flex-direction: column; gap: 16px; }
    .tcc-form-card { background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .tcc-chamado-item { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
    .tcc-chamado-info { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
    .tcc-chamado-id { font-weight: 600; color: var(--tcc-text-main, #0f172a); }
    .tcc-chamado-equipamento { font-weight: 500; color: var(--tcc-text-muted, #64748b); }
    .tcc-chamado-data { font-size: 14px; color: var(--tcc-text-muted, #64748b); }
    .tcc-chamado-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .tcc-badge { padding: 4px 8px; border-radius: 12px; font-size: 13px; font-weight: 500; text-transform: capitalize; }
    .tcc-badge-pendente { background-color: var(--tcc-bg, #f8fafc); color: #64748b; }
    .tcc-badge-em-andamento { background-color: #dbeafe; color: #1d4ed8; }
    .tcc-badge-concluido { background-color: #dcfce7; color: #166534; }
    .tcc-link { color: var(--tcc-primary, #3b82f6); text-decoration: none; font-size: 14px; font-weight: 500; }
    .tcc-link:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      .tcc-chamado-item { flex-direction: column; align-items: flex-start; }
      .tcc-chamado-info { width: 100%; justify-content: space-between; }
      .tcc-chamado-actions { width: 100%; justify-content: flex-end; }
    }
  `]
})
export class MeusChamados implements OnInit {
  chamados: Chamado[] = [];

  constructor(private meusChamadosService: MeusChamadosService) {}

  ngOnInit(): void {
    this.meusChamadosService.getChamados().subscribe({
      next: (data) => {
        this.chamados = data;
      },
      error: (err) => {
        console.error('Erro ao carregar chamados', err);
        // Clear chamados on error - no fallback mock data
        this.chamados = [];
      }
    });
  }

  statusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'tcc-badge tcc-badge-pendente';
      case 'em andamento':
        return 'tcc-badge tcc-badge-em-andamento';
      case 'concluído':
        return 'tcc-badge tcc-badge-concluido';
      default:
        return 'tcc-badge';
    }
  }
}