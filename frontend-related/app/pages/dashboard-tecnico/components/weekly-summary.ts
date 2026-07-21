import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
            <span>Taxa de Conclusão</span>
            <strong>94%</strong>
          </div>
          <div class="tcc-progress-track">
            <div class="tcc-progress-bar tcc-bg-success" style="width: 94%;"></div>
          </div>
        </div>

        <div class="tcc-progress-item">
          <div class="tcc-progress-labels">
            <span>Tempo Médio de Resposta</span>
            <strong>1.2h</strong>
          </div>
          <div class="tcc-progress-track">
            <div class="tcc-progress-bar tcc-bg-primary" style="width: 75%;"></div>
          </div>
        </div>

        <div class="tcc-progress-item">
          <div class="tcc-progress-labels">
            <span>Satisfação do Cliente</span>
            <strong>4.8/5.0</strong>
          </div>
          <div class="tcc-progress-track">
            <div class="tcc-progress-bar tcc-bg-warning" style="width: 96%;"></div>
          </div>
        </div>
      </div>

      <div class="tcc-summary-highlight">
        <h2>32</h2>
        <p>Chamados esta semana</p>
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
export class WeeklySummaryComponent {}
