import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HomeClienteService } from '../../services/home-cliente.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-buscar-profissionais',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="tcc-fade-in tcc-page-wrapper">
      
      <div class="tcc-page-header">
        <h1 class="tcc-title-lg">Buscar Profissionais</h1>
        <p class="tcc-subtitle">Encontre especialistas para o seu problema</p>
      </div>

      <div class="tcc-search-controls">
        <div class="tcc-input-wrapper">
          <i class="pi pi-search tcc-input-icon"></i>
          <input type="text" [(ngModel)]="searchTerm" (input)="filterProfissionais()" 
                 placeholder="Buscar por nome ou especialidade..." class="tcc-search-input">
        </div>
      </div>

      @if (loading) {
        <div class="tcc-center-content py-lg">
          <i class="pi pi-spinner pi-spin tcc-spinner"></i>
        </div>
      } @else if (filteredProfissionais.length === 0) {
        <div class="tcc-empty-state">
          <div class="tcc-empty-icon"><i class="pi pi-search"></i></div>
          <h3>Nenhum profissional encontrado</h3>
          <p>Tente buscar com outros termos ou especialidades.</p>
        </div>
      } @else {
        <div class="tcc-prof-grid">
          @for (prof of filteredProfissionais; track prof.id) {
            <div class="tcc-prof-card">
              
              <button (click)="toggleFavorito(prof)" class="tcc-btn-fav" [class.active]="isFavorito(prof.id)">
                 <i class="pi" [ngClass]="isFavorito(prof.id) ? 'pi-star-fill' : 'pi-star'"></i>
              </button>

              <div class="tcc-prof-header">
                <div class="tcc-prof-avatar">
                  <img *ngIf="prof.fotoUrl" [src]="prof.fotoUrl" alt="Avatar">
                  <span *ngIf="!prof.fotoUrl">{{ (prof.nome_fantasia || prof.email || 'P')[0] }}</span>
                </div>
                <div class="tcc-prof-title">
                  <h3>{{ prof.nome_fantasia || prof.email }}</h3>
                  <span class="tcc-badge-sm blue">
                    <i class="pi pi-desktop"></i> Técnico
                  </span>
                </div>
              </div>

              <p class="tcc-prof-desc">
                {{ prof.descricao_servicos || 'Nenhuma descrição fornecida pelo profissional.' }}
              </p>

              <div class="tcc-prof-footer">
                <span class="tcc-status-verified"><i class="pi pi-verified"></i> Aprovado</span>
                <button class="tcc-link-action" [routerLink]="['/cliente/solicitacao']" [queryParams]="{profId: prof.id}">
                  Solicitar <i class="pi pi-arrow-right"></i>
                </button>
              </div>

            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .tcc-page-wrapper { display: flex; flex-direction: column; gap: 24px; padding: 0; }
    .tcc-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    /* Header */
    .tcc-page-header { margin-bottom: 8px; }
    .tcc-title-lg { margin: 0; font-size: 2rem; font-weight: 700; color: var(--tcc-text-main, #0f172a); }
    .tcc-subtitle { margin: 8px 0 0 0; color: var(--tcc-text-muted, #64748b); font-size: 1rem; }
    
    /* Search Bar */
    .tcc-search-controls { background: var(--tcc-surface, #ffffff); padding: 24px; border-radius: 16px; border: 1px solid var(--tcc-border, #e2e8f0); box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
    .tcc-input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
    .tcc-input-icon { position: absolute; left: 16px; color: #94a3b8; font-size: 1.2rem; }
    .tcc-search-input { width: 100%; padding: 14px 16px 14px 48px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 1rem; color: var(--tcc-text-main); transition: all 0.2s; outline: none; background: #f8fafc; }
    .tcc-search-input:focus { border-color: #3b82f6; background: #ffffff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    
    /* Grid de Profissionais */
    .tcc-prof-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .tcc-prof-card { background: var(--tcc-surface, #ffffff); border: 1px solid var(--tcc-border, #e2e8f0); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; position: relative; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .tcc-prof-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-2px); }
    
    .tcc-btn-fav { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 50%; background: #f8fafc; border: 1px solid #e2e8f0; color: #cbd5e1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1.1rem; }
    .tcc-btn-fav:hover { background: #fefce8; border-color: #fef08a; color: #eab308; }
    .tcc-btn-fav.active { background: #fefce8; border-color: #fef08a; color: #eab308; }
    
    .tcc-prof-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .tcc-prof-avatar { width: 64px; height: 64px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; text-transform: uppercase; overflow: hidden; flex-shrink: 0; }
    .tcc-prof-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    .tcc-prof-title h3 { margin: 0 0 6px 0; font-size: 1.125rem; font-weight: 700; color: var(--tcc-text-main); padding-right: 40px; }
    .tcc-badge-sm { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .tcc-badge-sm.blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    
    .tcc-prof-desc { margin: 0 0 24px 0; font-size: 0.875rem; color: var(--tcc-text-muted); line-height: 1.5; min-height: 42px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .tcc-prof-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .tcc-status-verified { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: #64748b; font-weight: 500; }
    .tcc-status-verified i { color: #10b981; }
    
    .tcc-link-action { background: none; border: none; color: #2563eb; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 8px 12px; border-radius: 6px; transition: background 0.2s; }
    .tcc-link-action:hover { background: #eff6ff; }
    
    /* Utilitários */
    .tcc-center-content { display: flex; justify-content: center; align-items: center; }
    .py-lg { padding: 80px 0; }
    .tcc-spinner { font-size: 2.5rem; color: #3b82f6; }
    
    .tcc-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 64px 24px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
    .tcc-empty-icon { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #cbd5e1; margin-bottom: 16px; }
    .tcc-empty-state h3 { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--tcc-text-main); }
    .tcc-empty-state p { margin: 8px 0 0 0; font-size: 1rem; color: var(--tcc-text-muted); }
  `]
})
export class BuscarProfissionais implements OnInit {
  private service = inject(HomeClienteService);
  private messageService = inject(MessageService);
  
  profissionais: any[] = [];
  filteredProfissionais: any[] = [];
  favoritosIds: Set<string | number> = new Set();
  
  searchTerm: string = '';
  loading: boolean = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getProfissionais().subscribe({
      next: (profs) => {
        this.profissionais = profs;
        this.filteredProfissionais = profs;
        this.loadFavoritos();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Falha ao carregar profissionais.'});
      }
    });
  }

  loadFavoritos() {
    this.service.getFavoritos().subscribe({
      next: (favs) => {
        this.favoritosIds = new Set(favs.map(f => f.id));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  filterProfissionais() {
    if (!this.searchTerm.trim()) {
      this.filteredProfissionais = this.profissionais;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredProfissionais = this.profissionais.filter(p => 
      (p.nome_fantasia && p.nome_fantasia.toLowerCase().includes(term)) ||
      (p.descricao_servicos && p.descricao_servicos.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  }

  isFavorito(id: number | string): boolean {
    return this.favoritosIds.has(id);
  }

  toggleFavorito(prof: any) {
    if (this.isFavorito(prof.id)) {
      this.service.desfavoritarProfissional(prof.id).subscribe({
        next: () => {
          this.favoritosIds.delete(prof.id);
          this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Removido dos favoritos'});
        },
        error: () => this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Falha ao remover favorito'})
      });
    } else {
      this.service.favoritarProfissional(prof.id).subscribe({
        next: () => {
          this.favoritosIds.add(prof.id);
          this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Adicionado aos favoritos'});
        },
        error: () => this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar favorito'})
      });
    }
  }
}