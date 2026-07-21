import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from '../../../shared/models';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="tcc-grid-auto">
      @for (stat of stats; track stat.titulo) {
        <div class="tcc-card-base">
          <div class="tcc-stat-header">
            <div class="tcc-stat-icon-wrapper" [ngClass]="stat.corClasse">
              <i [class]="stat.icone"></i>
            </div>
            <div class="tcc-stat-trend">
              <i class="pi pi-arrow-up-right"></i>
            </div>
          </div>
          <div class="tcc-stat-content">
            <h2>{{ stat.valor }}</h2>
            <span class="tcc-stat-title">{{ stat.titulo }}</span>
            <span class="tcc-stat-desc">{{ stat.descricao }}</span>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .tcc-stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .tcc-stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .tcc-stat-trend {
      color: #10b981;
      font-size: 14px;
    }

    .tcc-stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      h2 {
        font-size: 28px;
        font-weight: 700;
        color: var(--tcc-text-main);
        margin: 0;
      }
    }

    .tcc-stat-title {
      font-size: 14px;
      color: var(--tcc-text-muted);
    }

    .tcc-stat-desc {
      font-size: 13px;
      color: var(--tcc-text-muted);
      opacity: 0.8;
      margin-top: 8px;
    }

    .tcc-icon-blue { background: #3b82f61a; color: #3b82f6; }
    .tcc-icon-orange { background: #f973161a; color: #f97316; }
    .tcc-icon-yellow { background: #eab3081a; color: #eab308; }
    .tcc-icon-green { background: #10b9811a; color: #10b981; }
  `]
})
export class StatsGridComponent {
  @Input() stats: StatCard[] = [];
}
