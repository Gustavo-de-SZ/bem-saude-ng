import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientesStatsComponent } from './components/cliente-tecnico-stats';
import { ClientesSearch } from './components/cliente-tecnico-search';
import { ClientesList } from './components/clientes-tecnico-list';
import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ClientesStatsComponent,
    ClientesSearch,
    ClientesList
  ],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">

      <header class="tcc-page-header">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Clientes</h1>
          <p class="tcc-subtitle">Gerencie sua base de clientes</p>
        </div>

        <button class="tcc-btn-main" routerLink="/painel/clientes/novo">
          <i class="pi pi-plus tcc-mr-sm"></i> Novo Cliente
        </button>
      </header>

      <app-clientes-stats></app-clientes-stats>
      <app-clientes-search (search)="onSearch($event)"></app-clientes-search>
      <app-clientes-list [clientes]="filteredClientes"></app-clientes-list>

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

export class ClientesTecnico {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];

  constructor(private clienteService: ClienteService) {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.filteredClientes = clientes;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.clientes = [];
        this.filteredClientes = [];
      }
    });
  }

  onSearch(term: string) {
    if (!term) {
      this.filteredClientes = this.clientes;
      return;
    }
    const lowerTerm = term.toLowerCase();
    this.filteredClientes = this.clientes.filter(cliente =>
      (cliente.nome?.toLowerCase().includes(lowerTerm)) ||
      (cliente.nome_completo?.toLowerCase().includes(lowerTerm)) ||
      (cliente.email?.toLowerCase().includes(lowerTerm)) ||
      (cliente.empresa?.toLowerCase().includes(lowerTerm))
    );
  }
}