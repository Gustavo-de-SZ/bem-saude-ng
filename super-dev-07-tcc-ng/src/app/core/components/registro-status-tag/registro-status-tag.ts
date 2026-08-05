import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-status-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="badgeClass">{{ status }}</span>
  `,
  styles: [`
    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .badge-ativo {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-inativo {
      background-color: #fef2f2;
      color: #991b1b;
    }
  `]
})
export class RegistroStatusTag {
  @Input() status: string = '';

  get badgeClass(): string {
    return `badge badge-${this.status.toLowerCase()}`;
  }
}