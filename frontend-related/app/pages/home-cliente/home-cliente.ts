import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchSectionComponent } from './components/search-section';
import { ProfessionalCardComponent } from './components/professional-card';
import { Profissional } from '../../models/profissional';
import { HomeClienteService } from '../../services/home-cliente.service';

@Component({
  selector: 'app-home-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchSectionComponent, ProfessionalCardComponent],
  template: `
    <div class="tcc-page-container tcc-fade-in">
      <div class="tcc-hero-header">
        <h1 class="tcc-hero-title">Encontre o especialista ideal para você.</h1>
        <p class="tcc-hero-subtitle">Conectamos você com os melhores técnicos de TI da sua região para suporte rápido e eficiente.</p>
        <div class="tcc-hero-actions">
          <button class="tcc-btn-primary" [routerLink]="['/cliente/solicitacao']">
            Abrir Chamado Rápido
          </button>
          <button class="tcc-btn-outline" [routerLink]="['/cliente/meus-chamados']">
            Meus Chamados
          </button>
        </div>
      </div>
      
      <div class="tcc-home-grid">
        <div class="tcc-main-column">
          <app-search-section [categorias]="categorias"></app-search-section>
        </div>
        
        <div class="tcc-side-column">
          <h2 class="tcc-section-title">
            <i class="pi pi-star-fill text-yellow-500 mr-2"></i> Favoritos
          </h2>
          
          @if (profissionaisFavoritos.length === 0) {
            <div class="tcc-empty-state">
              <i class="pi pi-users"></i>
              <p>Você não possui técnicos favoritos.</p>
            </div>
          } @else {
            <div class="tcc-favorites-list">
              @for (prof of profissionaisFavoritos; track prof.nome) {
                <app-professional-card [profissional]="prof"></app-professional-card>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tcc-page-container {
      padding: 40px 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .tcc-hero-header {
      margin-bottom: 48px;
      max-width: 800px;
    }
    .tcc-hero-title {
      font-size: 36px;
      font-weight: 700;
      color: var(--tcc-text-main);
      margin: 0 0 16px 0;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .tcc-hero-subtitle {
      font-size: 18px;
      color: var(--tcc-text-muted);
      margin: 0 0 32px 0;
      line-height: 1.5;
    }
    .tcc-hero-actions {
      display: flex;
      gap: 16px;
    }
    .tcc-home-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
    }
    .tcc-side-column {
      background-color: var(--tcc-surface);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--tcc-border);
    }
    .tcc-section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--tcc-text-main);
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
    }
    .tcc-empty-state {
      text-align: center;
      padding: 32px 0;
      color: var(--tcc-text-muted);
    }
    .tcc-empty-state i {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .tcc-empty-state p {
      font-size: 14px;
      margin: 0;
    }
    .tcc-favorites-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    @media (max-width: 1024px) {
      .tcc-home-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 768px) {
      .tcc-hero-title {
        font-size: 28px;
      }
      .tcc-hero-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ClienteInicioComponent implements OnInit {
  categorias: string[] = [];
  profissionaisFavoritos: Profissional[] = [];

  constructor(private homeClienteService: HomeClienteService) {}

  ngOnInit(): void {
    this.homeClienteService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
        // Clear categorias on error - no fallback mock data
        this.categorias = [];
      }
    });

    this.homeClienteService.getFavoritos().subscribe({
      next: (data) => {
        this.profissionaisFavoritos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar favoritos', err);
        // Clear profissionaisFavoritos on error - no fallback mock data
        this.profissionaisFavoritos = [];
      }
    });
  }
}
