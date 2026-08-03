import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agenda-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="tcc-search-toolbar">
      <div class="tcc-search-input">
        <i class="pi pi-search"></i>
        <input type="text" placeholder="Buscar cliente ou serviço..." [formControl]="searchControl">
      </div>

      <select class="tcc-select-input" [formControl]="typeControl">
        <option value="">Todos os tipos</option>
        <option value="Manutenção">Manutenção</option>
        <option value="Instalação">Instalação</option>
        <option value="Visita Técnica">Visita Técnica</option>
      </select>
    </div>
  `,
  styles: [`
    .tcc-search-toolbar {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .tcc-search-input, .tcc-date-input {
      display: flex; align-items: center; background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 0 16px; height: 42px;
    }

    .tcc-search-input { flex: 1; min-width: 250px; }
    .tcc-date-input { flex: none; min-width: 180px; }

    .tcc-search-input i, .tcc-date-input i { color: var(--tcc-text-muted, #94a3b8); margin-right: 10px; }
    .tcc-search-input input, .tcc-date-input input { border: none; background: transparent; width: 100%; height: 100%; outline: none; color: var(--tcc-text-main, #0f172a); }
    .tcc-search-input input::placeholder, .tcc-date-input input::placeholder { color: var(--tcc-text-muted, #94a3b8); }

    .tcc-select-input {
      background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px; padding: 0 16px; height: 42px; color: var(--tcc-text-main, #0f172a);
      outline: none; cursor: pointer; min-width: 180px;
    }
  `]
})
export class AgendaSearch {
  searchControl = new FormControl('');
  typeControl = new FormControl('');

  @Output() searchChange = new EventEmitter<string>();
  @Output() typeChange = new EventEmitter<string>();

  constructor() {
    this.searchControl.valueChanges.subscribe(value => this.searchChange.emit(value || ''));
    this.typeControl.valueChanges.subscribe(value => this.typeChange.emit(value || ''));
  }
}