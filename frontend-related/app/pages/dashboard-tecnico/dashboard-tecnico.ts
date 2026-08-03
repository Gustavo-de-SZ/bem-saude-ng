import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsGridComponent } from './components/stats-grid';
import { AppointmentsPanelComponent } from './components/appointments-panel';
import { WeeklySummaryComponent } from './components/weekly-summary';
import { StatCard, Agendamento } from '../../shared/models';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    StatsGridComponent,
    AppointmentsPanelComponent,
    WeeklySummaryComponent
  ],
  template: `
    <div class="tcc-fade-in tcc-p-lg">
      <section class="tcc-gap-md">
        <div>
          <h1 class="tcc-title-lg">Bem-vindo de volta!</h1>
          <p class="tcc-subtitle">Aqui está um resumo das suas atividades hoje</p>
        </div>
      </section>

      <app-stats-grid [stats]="stats"></app-stats-grid>

      <app-weekly-summary></app-weekly-summary>

      <div class="tcc-grid-1">
        <app-appointments-panel [agendamentos]="agendamentos"></app-appointments-panel>

      </div>
    </div>
  `,
  styles: []
})
export class DashboardTecnico {
  nomeUsuario = '';
  stats: StatCard[] = [];
  agendamentos: Agendamento[] = [];

  constructor(private dashboardService: DashboardService) {
    // Load stats
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas', err);
        this.stats = [];
      }
    });

    // Load agendamentos
    this.dashboardService.getAgendamentos().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos;
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos', err);
        this.agendamentos = [];
      }
    });
  }
}
