import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profissional } from '../../../shared/models';

@Component({
  selector: 'app-professional-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-card-base tcc-professional-card">
      <div class="tcc-card-header">
        <div class="tcc-avatar">
          <i class="pi pi-user"></i>
        </div>
        <div class="tcc-prof-info">
          <h3 class="tcc-prof-name">
            {{ profissional.nome }}
            <span class="tcc-status-dot" [class.online]="profissional.status === 'online'"></span>
          </h3>
          <p class="tcc-prof-specialty">{{ profissional.especialidade }}</p>
        </div>
      </div>

      <div class="tcc-card-stats">
        <span class="tcc-stat-item">⭐ {{ profissional.nota }} ({{ profissional.avaliacoes }})</span>
        <span class="tcc-stat-item"><i class="pi pi-clock"></i> ~{{ profissional.tempoResposta }}</span>
        <span class="tcc-stat-item"><i class="pi pi-map-marker"></i> {{ profissional.local }}</span>
      </div>

      <button class="tcc-btn-secondary-full">
        Ver perfil e contratar
      </button>
    </div>
  `,
  styles: [`
    .tcc-professional-card {
      padding: 24px;
    }

    .tcc-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .tcc-avatar {
      width: 48px;
      height: 48px;
      background-color: #eff6ff;
      color: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .tcc-prof-info {
      flex: 1;
    }

    .tcc-prof-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tcc-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #cbd5e1;

      &.online {
        background-color: #10b981;
      }
    }

    .tcc-prof-specialty {
      margin: 0;
      font-size: 13px;
      color: var(--tcc-text-muted);
    }

    .tcc-card-stats {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 13px;
      color: var(--tcc-text-muted);
      margin-bottom: 16px;
    }

    .tcc-stat-item {
      display: flex;
      align-items: center;
      gap: 4px;

      i {
        font-size: 13px;
        opacity: 0.8;
      }
    }

    .tcc-btn-secondary-full {
      width: 100%;
      background-color: #eff6ff;
      color: #3b82f6;
      border: none;
      padding: 11px 0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #dbeafe;
      }
    }
  `]
})
export class ProfessionalCardComponent {
  @Input() profissional!: Profissional;
}
