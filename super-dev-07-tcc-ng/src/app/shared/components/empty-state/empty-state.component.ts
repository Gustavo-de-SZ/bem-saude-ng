import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-empty-state">
      <i class="pi" [ngClass]="icon"></i>
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'pi-inbox';
  @Input() message: string = 'Nenhum item encontrado.';
}
