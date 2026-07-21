import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servico } from '../../../models/servico';

@Component({
  selector: 'app-servicos-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-filters-pills">
      <button class="tcc-pill active">Todos ({{ servicos.length }})</button>
      <button class="tcc-pill">Em Andamento ({{ countStatus('Em Andamento') }})</button>
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

      &:hover { background-color: var(--tcc-bg, #f8fafc); }
      &.active {
        background-color: var(--tcc-primary, #3b82f6);
        color: white;
        border-color: var(--tcc-primary, #3b82f6);
      }
    }
  `]
})
export class ServicosFiltersComponent {
  @Input() servicos: Servico[] = [];

  countStatus(status: string): number {
    return this.servicos.filter(s => s.status === status).length;
  }
}
