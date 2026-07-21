import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchSectionComponent } from './components/search-section';
import { ProfessionalCardComponent } from './components/professional-card';
import { Profissional } from '../../shared/models';
import { HomeClienteService } from '../../services/home-cliente.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SearchSectionComponent,
    ProfessionalCardComponent
  ],
  template: `
    <div class="ns-page-wrapper tcc-fade-in">
      <div class="ns-hero-section">
        <div class="ns-hero-content">
          <span class="ns-badge-modern">Bem-vindo(a) de volta!</span>
          <h1 class="ns-hero-title">Encontre o especialista<br/>ideal para o seu <span>problema</span></h1>
          <p class="ns-hero-subtitle">Conectamos você com os melhores técnicos de TI da sua região para suporte rápido e eficiente.</p>
          
          <div class="ns-hero-actions">
            <button class="ns-btn-primary" [routerLink]="['/cliente/solicitacao']">
              <i class="pi pi-bolt"></i> Abrir Chamado Rápido
            </button>
            <button class="ns-btn-secondary" [routerLink]="['/cliente/meus-chamados']">
              Meus Chamados
            </button>
          </div>
        </div>
        <div class="ns-hero-illustration">
          <div class="ns-glass-card">
             <i class="pi pi-check-circle text-green-500 text-3xl mb-2"></i>
             <div class="font-semibold text-gray-800 dark:text-white">Tudo funcionando</div>
             <div class="text-sm text-gray-500">Nenhum chamado pendente</div>
          </div>
        </div>
      </div>

      <div class="ns-content-grid">
        <div class="ns-main-column">
          <app-search-section [categorias]="categorias"></app-search-section>
        </div>

        <div class="ns-side-column">
          <div class="tcc-section-header">
            <h2 class="tcc-section-title">
              <i class="pi pi-star-fill text-yellow-500 mr-2"></i> Técnicos Favoritos
            </h2>
          </div>

          @if (profissionaisFavoritos.length === 0) {
            <div class="ns-empty-state">
              <i class="pi pi-users"></i>
              <p>Nenhum profissional salvo.</p>
            </div>
          } @else {
            <div class="ns-favorites-list">
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
    .ns-page-wrapper {
      padding: 32px 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .ns-hero-section {
      background: linear-gradient(135deg, var(--tcc-primary, #3b82f6) 0%, #1e40af 100%);
      border-radius: 24px;
      padding: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
    }

    .ns-hero-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
    }

    .ns-hero-content {
      max-width: 600px;
      z-index: 1;
    }

    .ns-badge-modern {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: inline-block;
      margin-bottom: 24px;
    }

    .ns-hero-title {
      font-size: 40px;
      font-weight: 800;
      line-height: 1.1;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    
    .ns-hero-title span {
      color: #fbbf24;
    }

    .ns-hero-subtitle {
      font-size: 16px;
      line-height: 1.6;
      opacity: 0.9;
      margin: 0 0 32px 0;
    }

    .ns-hero-actions {
      display: flex;
      gap: 16px;
    }

    .ns-btn-primary {
      background: white;
      color: #1e40af;
      border: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .ns-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .ns-btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.2s;
    }
    
    .ns-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .ns-hero-illustration {
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ns-glass-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transform: rotate(2deg);
    }

    .ns-content-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 40px;
      align-items: start;
    }

    .tcc-section-header {
      margin-bottom: 20px;
    }

    .tcc-section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--tcc-text-main, #0f172a);
      display: flex;
      align-items: center;
      margin: 0;
    }

    .ns-favorites-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ns-empty-state {
      background: var(--tcc-surface, #ffffff);
      border: 1px dashed var(--tcc-border, #e2e8f0);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      color: var(--tcc-text-muted, #64748b);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .ns-empty-state i {
      font-size: 32px;
      opacity: 0.5;
    }

    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .ns-hero-section {
        flex-direction: column;
        text-align: center;
        padding: 40px 24px;
      }
      .ns-hero-illustration {
        display: none;
      }
      .ns-hero-actions {
        justify-content: center;
      }
      .ns-content-grid {
        grid-template-columns: 1fr;
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
