import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agendamento } from '../../../shared/models';

@Component({
  selector: 'app-appointments-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-card-base">
      <div class="tcc-panel-header">
        <h3><i class="pi pi-calendar"></i> Próximos Agendamentos</h3>
        <a href="#" class="tcc-link-sm">Ver todos</a>
      </div>

      <div class="tcc-appointments-list">
        @for (agendamento of agendamentos; track agendamento.empresa) {
          <div class="tcc-appointment-item">
            <div class="tcc-appt-time">
              <span class="tcc-appt-day">{{ agendamento.dia }}</span>
              <span class="tcc-appt-hour">{{ agendamento.hora }}</span>
            </div>
            <div class="tcc-appt-info">
              <h4>{{ agendamento.empresa }}</h4>
              <p>{{ agendamento.servico }}</p>
            </div>
            <div class="tcc-appt-status">
              @if (agendamento.status === 'Concluído') {
                <i class="pi pi-check-circle tcc-status-success"></i>
              } @else {
                <i class="pi pi-clock tcc-status-warning"></i>
              }
            </div>
          </div>
        }
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

    .tcc-link-sm {
      font-size: 14px;
      color: var(--tcc-primary);
      text-decoration: none;
      font-weight: 500;

      &:hover { text-decoration: underline; }
    }

    .tcc-appointments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tcc-appointment-item {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px;
      border: 1px solid var(--tcc-border);
      border-radius: 8px;
      background-color: var(--tcc-bg);
      transition: border-color 0.2s ease;

      &:hover { border-color: var(--tcc-primary); }
    }

    .tcc-appt-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #3b82f60d;
      padding: 8px;
      border-radius: 6px;
      min-width: 60px;
    }

    .tcc-appt-day { font-size: 12px; color: var(--tcc-text-muted); font-weight: 600; }
    .tcc-appt-hour { font-size: 16px; color: var(--tcc-primary); font-weight: 700; }

    .tcc-appt-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      h4 { margin: 0; font-size: 15px; color: var(--tcc-text-main); font-weight: 600; }
      p { margin: 0; font-size: 14px; color: var(--tcc-text-muted); }
    }

    .tcc-status-success { color: #10b981; font-size: 19px; }
    .tcc-status-warning { color: #f97316; font-size: 19px; }
  `]
})
export class AppointmentsPanelComponent {
  @Input() agendamentos: Agendamento[] = [];
}
