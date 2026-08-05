import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicosFiltersComponent } from './components/servicos-filters';
import { ServicosSearchComponent } from './components/servicos-search';
import { ServicosListComponent } from './components/servicos-list';
import { Servico } from '../../models/servico';
import { ServicoService } from '../../services/servico.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-servicos-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    ServicosFiltersComponent,
    ServicosSearchComponent,
    ServicosListComponent,
    RouterModule
  ],
  
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Serviços</h1>
          <p class="tcc-subtitle">Gerencie os serviços prestados aos seus clientes</p>
        </div>

        <button class="tcc-btn-main" routerLink="/painel/servicos/novo">
          <i class="pi pi-plus"></i> Novo Serviço
        </button>
      </header>

      <app-servicos-filters [servicos]="servicos" (filterChange)="onFilterChange($event)"></app-servicos-filters>
      <app-servicos-search (searchChange)="onSearchChange($event)" (categoryChange)="onCategoryChange($event)"></app-servicos-search>
      <app-servicos-list [servicos]="filteredServicos"></app-servicos-list>
    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }

    .tcc-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .tcc-header-title-group { display: flex; flex-direction: column; }
    .tcc-title-lg { font-size: 28px; font-weight: 700; color: var(--tcc-text-main, #0f172a); margin: 0 0 6px 0; }
    .tcc-subtitle { color: var(--tcc-text-muted, #64748b); font-size: 16px; margin: 0; }

    .tcc-btn-main {
      display: inline-flex; align-items: center; gap: 8px;
      background-color: var(--tcc-primary, #3b82f6); color: white;
      border: none; padding: 12px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 500; cursor: pointer;
      transition: background-color 0.2s; white-space: nowrap;
    }
    .tcc-btn-main:hover { background-color: #2563eb; }

    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ServicosTecnico {
  servicos: Servico[] = [];
  filteredServicos: Servico[] = [];
  searchTerm: string = '';
  categoryFilter: string = '';
  selectedFilter: string = 'Todos';

  constructor(private servicoService: ServicoService, private messageService: MessageService) {
    this.servicoService.getServicos().subscribe({
      next: (servicos) => {
        this.servicos = servicos;
        this.filteredServicos = servicos;
      },
      error: (err) => {
        console.error('Erro ao carregar serviços', err);
        this.servicos = [];
        this.filteredServicos = [];
      }
    });
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.categoryFilter = category;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.servicos];

    // Filter by status (selectedFilter)
    if (this.selectedFilter !== 'Todos') {
      result = result.filter(servico => servico.status === this.selectedFilter);
    }

    // Filter by search term (title or client name)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(servico =>
        servico.titulo.toLowerCase().includes(term) ||
        servico.cliente.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.categoryFilter) {
      result = result.filter(servico => servico.categoria === this.categoryFilter);
    }

    this.filteredServicos = result;
  }
}