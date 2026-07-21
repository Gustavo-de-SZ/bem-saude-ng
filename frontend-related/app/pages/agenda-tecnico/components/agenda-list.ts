import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Agendamento } from '../../../shared/models';

@Component({
  selector: 'app-agenda-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tcc-agenda-list">
      @for (item of compromissos; track item.titulo) {
        <div class="tcc-agenda-card">
          <div class="tcc-agenda-datetime-col">
            <span class="tcc-date-month">{{ getDisplayMonth(item) }}</span>
            <span class="tcc-date-day">{{ getDisplayDay(item) }}</span>
            <span class="tcc-date-time">{{ item.hora }}</span>
          </div>

          <div class="tcc-agenda-details">
            <div class="tcc-title-row">
              <h3 class="tcc-agenda-title">{{ item.titulo }}</h3>
              <span class="tcc-status-badge" [ngClass]="getBadgeClass(item.status)">
                <i class="pi" [ngClass]="getBadgeIcon(item.status)"></i>
                {{ item.status }}
              </span>
            </div>

            <div class="tcc-agenda-meta">
              <span class="tcc-meta-item"><i class="pi pi-user"></i> {{ item.cliente }}</span>
              <span class="tcc-meta-item"><i class="pi pi-clock"></i> {{ item.duracao }}</span>
              <span class="tcc-meta-item"><i class="pi pi-map-marker"></i> {{ item.tipo }}</span>
            </div>
          </div>

          <div class="tcc-agenda-actions">
            <button class="icon-btn" title="Editar" [routerLink]="['/painel/agenda/', item.id, 'edit']"><i class="pi pi-pencil"></i></button>
            <button class="tcc-btn-outline small">
              Ações <i class="pi pi-chevron-down"></i>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tcc-agenda-list { display: flex; flex-direction: column; gap: 12px; }

    .tcc-agenda-card {
      background-color: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px; padding: 16px 24px; /* IGUAL A SERVIÇOS */
      display: flex; align-items: center; gap: 24px; transition: box-shadow 0.2s, border-color 0.2s;
    }
    .tcc-agenda-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }

    .tcc-agenda-datetime-col {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      width: 64px; height: 64px; /* IGUAL A SERVIÇOS */
      background-color: #eff6ff; border-radius: 10px; color: var(--tcc-primary, #3b82f6); flex-shrink: 0;
    }

    .tcc-date-month { font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .tcc-date-day { font-size: 20px; font-weight: 800; line-height: 1; }
    .tcc-date-time { font-size: 11px; font-weight: 600; opacity: 0.8; }

    .tcc-agenda-details { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .tcc-title-row { display: flex; align-items: center; justify-content: flex-start; gap: 12px; }
    .tcc-agenda-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--tcc-text-main, #0f172a); }

    .tcc-status-badge {
      display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px;
      border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid;
    }
    .tcc-status-badge i { font-size: 10px; }

    .badge-confirmado { color: #10b981; border-color: #10b981; background-color: #ecfdf5; }
    .badge-concluido { color: #3b82f6; border-color: #3b82f6; background-color: #eff6ff; }
    .badge-pendente { color: #f59e0b; border-color: #f59e0b; background-color: #fffbeb; }
    .badge-cancelado { color: #ef4444; border-color: #ef4444; background-color: #fef2f2; }

    .tcc-agenda-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--tcc-text-muted, #64748b); }
    .tcc-meta-item { display: flex; align-items: center; gap: 6px; }
    .tcc-meta-item i { font-size: 13px; opacity: 0.7; }

    .tcc-agenda-actions { display: flex; align-items: center; gap: 8px; }

    .tcc-btn-outline.small {
      background-color: transparent; border: 1px solid var(--tcc-border, #e2e8f0); color: var(--tcc-text-main, #475569);
      padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: background-color 0.2s;
    }
    .tcc-btn-outline.small:hover { background-color: var(--tcc-bg, #f8fafc); }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--tcc-text-muted, #94a3b8);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background-color: var(--tcc-bg, #f8fafc);
      color: var(--tcc-text-main, #475569);
    }

    @media (max-width: 768px) {
      .tcc-agenda-card { flex-direction: column; align-items: flex-start; }
      .tcc-agenda-actions, .tcc-btn-outline.small { width: 100%; justify-content: center; }
    }
  `]
})
export class AgendaList {
  @Input() compromissos: Agendamento[] = [];

  getDisplayDay(item: Agendamento): string {
    const dia = item.dia || '15';
    if (dia.includes('-')) {
      const partes = dia.split('-');
      if (partes.length === 3) {
        return partes[2]; // Year-Month-Day -> Day
      }
    } else if (dia.includes('/')) {
      const partes = dia.split('/');
      if (partes.length === 3) {
        return partes[0]; // Day/Month/Year -> Day
      }
    }
    return dia;
  }

  getDisplayMonth(item: Agendamento): string {
    const dia = item.dia || '';
    let mes = item.mes || 'Julho';
    
    let monthNum = 0;
    if (dia.includes('-')) {
      const partes = dia.split('-');
      if (partes.length === 3) {
        monthNum = parseInt(partes[1], 10);
      }
    } else if (dia.includes('/')) {
      const partes = dia.split('/');
      if (partes.length === 3) {
        monthNum = parseInt(partes[1], 10);
      }
    }

    if (monthNum >= 1 && monthNum <= 12) {
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      mes = meses[monthNum - 1];
    }

    // Clean any trailing dot
    if (mes.endsWith('.')) {
      mes = mes.slice(0, -1);
    }
    
    // Convert to a neat 3-letter uppercase format so it ALWAYS fits beautifully!
    if (mes.length > 3) {
      return mes.substring(0, 3).toUpperCase();
    }
    return mes.toUpperCase();
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmado': return 'badge-confirmado';
      case 'Concluído': return 'badge-concluido';
      case 'Pendente': return 'badge-pendente';
      case 'Cancelado': return 'badge-cancelado';
      default: return 'badge-pendente';
    }
  }

  getBadgeIcon(status: string): string {
    switch (status) {
      case 'Confirmado': return 'pi-check-circle';
      case 'Concluído': return 'pi-check';
      case 'Pendente': return 'pi-clock';
      case 'Cancelado': return 'pi-times-circle';
      default: return 'pi-info-circle';
    }
  }
}