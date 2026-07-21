import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agendamento } from '../../../shared/models';

@Component({
  selector: 'app-agenda-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-filters-pills">
      <button class="tcc-pill active">Todos ({{ total }})</button>
      <button class="tcc-pill">Confirmado ({{ countStatus('Confirmado') }})</button>
      <button class="tcc-pill">Pendente ({{ countStatus('Pendente') }})</button>
      <button class="tcc-pill">Concluído ({{ countStatus('Concluído') }})</button>
      <button class="tcc-pill">Cancelado ({{ countStatus('Cancelado') }})</button>
    </div>
  `,
  styles: [`
    .tcc-filters-pills {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tcc-pill {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      color: var(--tcc-text-muted, #64748b);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .tcc-pill:hover { 
      background-color: var(--tcc-bg, #f8fafc); 
    }
    
    .tcc-pill.active {
      background-color: var(--tcc-primary, #3b82f6);
      color: white;
      border-color: var(--tcc-primary, #3b82f6);
    }
  `]
})
export class AgendaFilters {
  @Input() compromissos: Agendamento[] = [];

  get total(): number { 
    return this.compromissos.length; 
  }

  countStatus(status: string): number { 
    return this.compromissos.filter(c => c.status === status).length; 
  }
}