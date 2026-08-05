import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsGridComponent } from './components/stats-grid';
import { AppointmentsPanelComponent } from './components/appointments-panel';
import { WeeklySummaryComponent } from './components/weekly-summary';
import { StatCard, Agendamento } from '../../shared/models';
import { DashboardService } from '../../services/dashboard.service';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    StatsGridComponent,
    AppointmentsPanelComponent,
    WeeklySummaryComponent,
    RouterModule
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
      
      <div class="tcc-dashboard-panels">
        <app-appointments-panel [agendamentos]="agendamentos"></app-appointments-panel>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="tcc-card-base" style="height: 100%;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 200px; text-align: center; color: var(--tcc-text-muted);">
              <i class="pi pi-briefcase" style="font-size: 3rem; margin-bottom: 16px; color: var(--tcc-primary); opacity: 0.8;"></i>
              <h3 style="margin: 0 0 8px 0; color: var(--tcc-text-main);">Gestão de Chamados</h3>
              <p style="margin: 0 0 16px 0; max-width: 250px;">Acesse a aba de Chamados para visualizar tickets pendentes e ativos.</p>
              <button class="tcc-btn-main" routerLink="/painel/chamados">
                 Ir para Chamados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tcc-dashboard-panels {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    @media (min-width: 1024px) {
      .tcc-dashboard-panels {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class DashboardTecnico {
  nomeUsuario = '';
  stats: StatCard[] = [];
  agendamentos: Agendamento[] = [];

  constructor(private dashboardService: DashboardService, private router: Router) {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas', err);
        this.stats = [];
      }
    });
    
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
