import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoService } from '../../../services/solicitacao.service';

@Component({
  selector: 'app-weekly-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-card-base">
      <div class="tcc-panel-header">
        <h3>Resumo Semanal</h3>
      </div>
      <div class="tcc-summary-list">
        <div class="tcc-progress-item">
          <div class="tcc-progress-labels">
            <span>Chamados em Andamento</span>
            <strong>{{ andamento }}</strong>
          </div>
          <div class="tcc-progress-track">
            <div class="tcc-progress-bar tcc-bg-primary" [style.width]="(andamento / (total || 1) * 100) + '%'"></div>
          </div>
        </div>
        <div class="tcc-progress-item">
          <div class="tcc-progress-labels">
            <span>Chamados Concluídos</span>
            <strong>{{ concluidos }}</strong>
          </div>
          <div class="tcc-progress-track">
            <div class="tcc-progress-bar tcc-bg-success" [style.width]="(concluidos / (total || 1) * 100) + '%'"></div>
          </div>
        </div>
        <div class="tcc-progress-item">
          <div class="tcc-progress-labels">
            <span>Taxa de Resolução</span>
            <strong>{{ taxaResolucao }}%</strong>
          </div>
          <div class="tcc-progress-track">
            <div class="tcc-progress-bar tcc-bg-warning" [style.width]="taxaResolucao + '%'"></div>
          </div>
        </div>
      </div>
      <div class="tcc-summary-highlight">
        <h2>{{ total }}</h2>
        <p>Chamados totais</p>
      </div>
    </div>
  `,
  styles: [`
    .tcc-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--tcc-text-main);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        i { color: var(--tcc-primary); }
      }
    }
    .tcc-summary-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .tcc-progress-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tcc-progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      span { color: var(--tcc-text-muted); }
      strong { color: var(--tcc-text-main); font-weight: 600; }
    }
    .tcc-progress-track {
      width: 100%;
      height: 6px;
      background-color: var(--tcc-bg);
      border-radius: 4px;
      overflow: hidden;
    }
    .tcc-progress-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    .tcc-bg-success { background-color: #10b981; }
    .tcc-bg-primary { background-color: var(--tcc-primary); }
    .tcc-bg-warning { background-color: #eab308; }
    .tcc-summary-highlight {
      margin-top: 16px;
      padding: 24px;
      background-color: var(--tcc-bg);
      border-radius: 8px;
      text-align: center;
      h2 {
        font-size: 36px;
        font-weight: 800;
        color: var(--tcc-primary);
        margin: 0 0 8px 0;
      }
      p {
        font-size: 14px;
        color: var(--tcc-text-muted);
        margin: 0;
      }
    }
  `]
})
export class WeeklySummaryComponent implements OnInit {
  private solicitacaoService = inject(SolicitacaoService);
  total = 0;
  andamento = 0;
  concluidos = 0;
  taxaResolucao = 0;

  ngOnInit() {
    this.solicitacaoService.getSolicitacoes().subscribe({
      next: (chamados) => {
        this.total = chamados.length;
        this.andamento = chamados.filter(c => c.status === 'EM_ANDAMENTO').length;
        this.concluidos = chamados.filter(c => c.status === 'CONCLUIDO').length;
        this.taxaResolucao = this.total > 0 ? Math.round((this.concluidos / this.total) * 100) : 0;
      },
      error: (err) => {
        console.error('Erro ao buscar chamados', err);
      }
    });
  }
}
