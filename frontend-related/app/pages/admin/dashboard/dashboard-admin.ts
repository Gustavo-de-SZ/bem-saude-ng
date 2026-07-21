import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Visão Geral - Admin</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" *ngIf="!loading; else loadingState">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Técnicos Pendentes</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ estatisticas.pendentes }}</h3>
          </div>
          <div class="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
            <i class="pi pi-user-plus text-amber-500 text-xl"></i>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total de Técnicos</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ estatisticas.totalTecnicos }}</h3>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <i class="pi pi-users text-blue-500 text-xl"></i>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total de Clientes</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ estatisticas.totalClientes }}</h3>
          </div>
          <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
            <i class="pi pi-building text-emerald-500 text-xl"></i>
          </div>
        </div>
      </div>

      <ng-template #loadingState>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
            <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </ng-template>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Ações Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button routerLink="/admin/tecnicos" class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
             <i class="pi pi-check-circle text-blue-500 text-xl"></i>
             <div>
               <p class="font-medium text-gray-900">Aprovar Técnicos</p>
               <p class="text-sm text-gray-500">Analise cadastros pendentes na plataforma</p>
             </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardAdmin implements OnInit {
  estatisticas = {
    pendentes: 0,
    totalTecnicos: 0,
    totalClientes: 0
  };
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getEstatisticasDashboard().subscribe({
      next: (data) => {
        this.estatisticas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas', err);
        this.loading = false;
      }
    });
  }
}
