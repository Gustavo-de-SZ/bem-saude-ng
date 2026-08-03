import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="tcc-search-toolbar">
      <div class="tcc-search-input">
        <i class="pi pi-search"></i>
        <input type="text" placeholder="Buscar por nome, empresa ou email..." [formControl]="searchControl">
      </div>
    </div>
  `,
  styles: [`
    .tcc-search-toolbar { display: flex; width: 100%; }
    .tcc-search-input {
      display: flex; align-items: center; background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 8px; padding: 0 16px; height: 42px;
      width: 100%;
    }
    .tcc-search-input i { color: var(--tcc-text-muted, #94a3b8); margin-right: 10px; }
    .tcc-search-input input { border: none; background: transparent; width: 100%; height: 100%; outline: none; color: var(--tcc-text-main, #0f172a); }
    .tcc-search-input input::placeholder { color: var(--tcc-text-muted, #94a3b8); }
  `]
})
export class ClientesSearch {
  searchControl = new FormControl('');
  @Output() search = new EventEmitter<string>();

  constructor() {
    this.searchControl.valueChanges.subscribe(value => {
      this.search.emit(value || '');
    });
  }
}