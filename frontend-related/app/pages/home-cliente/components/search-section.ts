import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-search-section">
      <div class="tcc-input-base" style="width: 100%; max-width: 650px;">
        <i class="pi pi-search"></i>
        <input type="text" placeholder="Buscar por serviço ou especialidade...">
      </div>

      <div class="tcc-categories-row">
        @for (categoria of categorias; track categoria) {
          <button class="tcc-pill-base">
            <i class="pi" [ngClass]="getIconForCategory(categoria)"></i>
            {{ categoria }}
          </button>
        }
      </div>

      <button class="tcc-btn-primary">
        Ver todos os profissionais <i class="pi pi-angle-right"></i>
      </button>
    </div>
  `,
  styles: [`
    .tcc-search-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }

    .tcc-categories-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tcc-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--tcc-primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
      transition: background 0.2s;

      &:hover {
        background-color: #2563eb;
      }
    }
  `]
})
export class SearchSectionComponent {
  @Input() categorias: string[] = [
    'Redes',
    'Hardware',
    'Software',
    'Segurança',
    'Impressoras',
    'Dispositivos'
  ];

  getIconForCategory(categoria: string): string {
    const iconMap: { [key: string]: string } = {
      'Redes': 'pi-wifi',
      'Hardware': 'pi-server',
      'Software': 'pi-desktop',
      'Segurança': 'pi-shield',
      'Impressoras': 'pi-print',
      'Dispositivos': 'pi-mobile'
    };
    return iconMap[categoria] || 'pi-cog';
  }
}
