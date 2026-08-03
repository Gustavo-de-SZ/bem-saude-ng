import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgendaFilters } from './components/agenda-filters';
import { AgendaSearch } from './components/agenda-search';
import { AgendaList } from './components/agenda-list';
import { Agendamento, StatusAgendamento, TipoAgendamento } from '../../models/agendamento';
import { AgendaService } from '../../services/agenda.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-agenda-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AgendaFilters,
    AgendaSearch,
    AgendaList
  ],
  
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Agenda</h1>
          <p class="tcc-subtitle">Gerencie seus agendamentos</p>
        </div>

        <button class="tcc-btn-main" routerLink="/painel/agenda/novo">
          <i class="pi pi-plus"></i> Novo Agendamento
        </button>
      </header>

      <app-agenda-filters [compromissos]="compromissos" (filterChange)="onFilterChange($event)"></app-agenda-filters>
      <app-agenda-search (searchChange)="onSearchChange($event)" (typeChange)="onTypeChange($event)"></app-agenda-search>
      <app-agenda-list [compromissos]="filteredCompromissos"></app-agenda-list>
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
export class AgendaTecnico {
  compromissos: Agendamento[] = [];
  filteredCompromissos: Agendamento[] = [];
  selectedFilter: string = 'Todos';
  searchTerm: string = '';
  typeFilter: string = '';

  constructor(private agendaService: AgendaService, private messageService: MessageService) {
    this.agendaService.getAgendamentos().subscribe({
      next: (agendamentos) => {
        this.compromissos = agendamentos;
        this.filteredCompromissos = agendamentos;
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos', err);
        this.compromissos = [];
        this.filteredCompromissos = [];
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

  onTypeChange(type: string): void {
    this.typeFilter = type;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.compromissos];

    // Filter by status (selectedFilter)
    if (this.selectedFilter !== 'Todos') {
      result = result.filter(compromisso => compromisso.status === this.selectedFilter);
    }

    // Filter by search term (title or client name)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(compromisso =>
        (compromisso.titulo?.toLowerCase().includes(term) ?? false) ||
        (compromisso.cliente?.toLowerCase().includes(term) ?? false)
      );
    }

    // Filter by type
    if (this.typeFilter) {
      result = result.filter(compromisso => compromisso.tipo === this.typeFilter);
    }

    this.filteredCompromissos = result;
  }
}