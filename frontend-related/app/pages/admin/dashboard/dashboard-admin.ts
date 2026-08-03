import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { StatsGridComponent } from '../../dashboard-tecnico/components/stats-grid';
import { StatCard } from '../../../shared/models';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsGridComponent],
  template: `
    <div class="tcc-fade-in tcc-p-lg max-w-7xl mx-auto">
      <section class="tcc-gap-md mb-8">
        <div>
          <h1 class="tcc-title-lg">Visão Geral - Admin</h1>
          <p class="tcc-subtitle">Resumo das métricas da plataforma</p>
        </div>
      </section>

      <app-stats-grid *ngIf="!loading; else loadingState" [stats]="statsData"></app-stats-grid>

      <ng-template #loadingState>
        <section class="tcc-grid-auto">
          <div *ngFor="let item of [1, 2, 3]" class="tcc-card-base animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </section>
      </ng-template>

      <div class="tcc-card-base mt-8 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-800 m-0">Ações Rápidas</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button routerLink="/admin/tecnicos" class="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left w-full group">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <i class="pi pi-user-plus text-blue-600 text-xl"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 m-0 mb-1 group-hover:text-blue-700 transition-colors">Aprovar Técnicos</p>
              <p class="text-sm text-gray-500 m-0 leading-relaxed">Analise e gerencie cadastros pendentes de profissionais na plataforma.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardAdmin implements OnInit {
  statsData: StatCard[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getEstatisticasDashboard().subscribe({
      next: (data) => {
        this.statsData = [
          {
            titulo: 'Técnicos Pendentes', valor: data.pendentes.toString(),
            descricao: 'Aguardando aprovação', icone: 'pi pi-user-plus', corClasse: 'tcc-icon-orange'
          },
          {
            titulo: 'Total de Técnicos', valor: data.totalTecnicos.toString(),
            descricao: 'Técnicos cadastrados', icone: 'pi pi-users', corClasse: 'tcc-icon-blue'
          },
          {
            titulo: 'Total de Clientes', valor: data.totalClientes.toString(),
            descricao: 'Clientes cadastrados', icone: 'pi pi-building', corClasse: 'tcc-icon-green'
          }
        ];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas', err);
        this.loading = false;
      }
    });
  }
}
