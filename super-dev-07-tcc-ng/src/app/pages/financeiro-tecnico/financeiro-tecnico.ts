import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceiroStatsComponent } from './components/financeiro-stats';
import { FinanceiroTransactionsComponent } from './components/financeiro-transactions';
import { FinanceiroService } from '../../services/financeiro.service';

interface Transacao {
  titulo: string;
  cliente: string;
  data: string;
  valor: number;
  status: 'Pago' | 'Pendente';
}

@Component({
  selector: 'app-financeiro-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    FinanceiroStatsComponent,
    FinanceiroTransactionsComponent
  ],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div>
          <h1 class="tcc-title-lg">Financeiro</h1>
          <p class="tcc-subtitle">Acompanhe suas receitas e transações</p>
        </div>
      </header>

      <app-financeiro-stats [transacoes]="transacoes"></app-financeiro-stats>
      <app-financeiro-transactions [transacoes]="transacoes"></app-financeiro-transactions>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 0;
    }

    .tcc-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tcc-title-lg {
      font-size: 28px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      margin: 0 0 6px 0;
    }

    .tcc-subtitle {
      color: var(--tcc-text-muted, #64748b);
      font-size: 16px;
      margin: 0;
    }

    .tcc-fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FinanceiroTecnico {
  transacoes: Transacao[] = [];

  constructor(private financeiroService: FinanceiroService) {
    this.financeiroService.getTransacoes().subscribe({
      next: (transacoes) => {
        this.transacoes = transacoes;
      },
      error: (err) => {
        console.error('Erro ao carregar transações', err);
        this.transacoes = [];
      }
    });
  }
}