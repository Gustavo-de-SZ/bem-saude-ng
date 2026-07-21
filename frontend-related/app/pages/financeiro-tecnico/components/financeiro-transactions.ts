import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transacao } from '../../../models/transacao';

@Component({
  selector: 'app-financeiro-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-section-container">
      <h2 class="tcc-section-title">Transações Recentes</h2>
      
      <div class="tcc-transaction-list">
        @for (transacao of transacoes; track transacao.titulo) {
          <div class="tcc-transaction-item">
            <div class="tcc-transaction-info">
              <h3>{{ transacao.titulo }}</h3>
              <p>{{ transacao.cliente }} &bull; {{ transacao.data }}</p>
            </div>
            <div class="tcc-transaction-value-area">
              <span class="tcc-transaction-value">R$ {{ transacao.valor }}</span>
              <span class="tcc-badge" [ngClass]="transacao.status === 'Pago' ? 'badge-success' : 'badge-warning'">
                {{ transacao.status }}
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tcc-section-title { font-size: 18px; font-weight: 600; color: var(--tcc-text-main, #0f172a); margin: 0 0 16px 0; }
    
    .tcc-transaction-list {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
    }

    .tcc-transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);

      &:last-child { border-bottom: none; }
      &:hover { background-color: var(--tcc-bg, #f8fafc); }
    }

    .tcc-transaction-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }
      p { margin: 0; font-size: 13px; color: var(--tcc-text-muted, #64748b); }
    }

    .tcc-transaction-value-area {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .tcc-transaction-value { font-size: 16px; font-weight: 700; color: var(--tcc-text-main, #0f172a); }

    .tcc-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      
      &.badge-success { background-color: #dcfce7; color: #16a34a; }
      &.badge-warning { background-color: #ffedd5; color: #ea580c; }
    }

    .tcc-section-container {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class FinanceiroTransactionsComponent {
  @Input() transacoes: Transacao[] = [];
}
