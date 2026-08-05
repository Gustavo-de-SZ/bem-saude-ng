import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chamados-tecnico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tcc-fade-in tcc-p-lg">
      <section class="tcc-gap-md" style="margin-bottom: 24px;">
        <div>
          <h1 class="tcc-title-lg">Gestão de Chamados</h1>
          <p class="tcc-subtitle">Visualize seus chamados ativos e os disponíveis para aceite.</p>
        </div>
      </section>

      <div class="tcc-dashboard-panels">
        
  
        <div class="tcc-card-base">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--tcc-text-main); display: flex; align-items: center; gap: 8px;">
              <i class="pi pi-comments" style="color: var(--tcc-primary);"></i> Meus Chamados Ativos
            </h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            @for (chamado of meusChamados; track chamado.id) {
              <div style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border: 1px solid var(--tcc-border); border-radius: 8px; background-color: var(--tcc-bg);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="margin: 0; font-size: 16px; color: var(--tcc-text-main); font-weight: 600;">{{ chamado.titulo }}</h4>
                    <span style="font-size: 13px; color: var(--tcc-text-muted);">{{ chamado.dataCriacao || formatData(chamado.data_criacao) }}</span>
                  </div>
                  <span class="tcc-badge" style="background-color: #dbeafe; color: #1e40af;">{{ formatStatus(chamado.status) }}</span>
                </div>
                <div style="font-size: 14px; color: var(--tcc-text-main);">
                  <strong>Cliente:</strong> {{ chamado.cliente_nome && chamado.cliente_nome !== 'Cliente' ? chamado.cliente_nome : 'Cliente não informado' }}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <button class="tcc-btn-outline" (click)="abrirChat(chamado.id)" style="width: 100%; justify-content: center; padding: 10px;">
                    <i class="pi pi-comments" style="margin-right: 8px;"></i> Abrir Chat
                  </button>
                  <button class="tcc-btn-main" style="width: 100%; justify-content: center; padding: 10px; background-color: #10b981; border-color: #10b981;" (click)="concluirChamado(chamado.id)">
                    <i class="pi pi-check-circle" style="margin-right: 8px;"></i> Concluir
                  </button>
                </div>
              </div>
            }
            @if (meusChamados.length === 0) {
              <div style="text-align: center; padding: 32px 0; color: var(--tcc-text-muted);">
                <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.5;"></i>
                <p style="margin: 0;">Nenhum chamado ativo no momento.</p>
              </div>
            }
          </div>
        </div>

  
        <div class="tcc-card-base">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--tcc-text-main); display: flex; align-items: center; gap: 8px;">
              <i class="pi pi-list" style="color: var(--tcc-primary);"></i> Chamados Disponíveis
            </h3>
            <button class="tcc-btn-outline" (click)="carregarChamados()" style="padding: 6px 12px; font-size: 12px;">
              <i class="pi pi-refresh" [class.pi-spin]="carregando"></i>
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            @for (chamado of chamadosAbertos; track chamado.id) {
              <div style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border: 1px solid var(--tcc-border); border-radius: 8px; background-color: var(--tcc-bg);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="margin: 0; font-size: 16px; color: var(--tcc-text-main); font-weight: 600;">{{ chamado.titulo }}</h4>
                    <span style="font-size: 13px; color: var(--tcc-text-muted);">{{ chamado.dataCriacao || formatData(chamado.data_criacao) }}</span>
                  </div>
                  <span class="tcc-badge" style="background-color: #fef08a; color: #854d0e;">Pendente</span>
                </div>
                
                <div style="font-size: 14px; color: var(--tcc-text-main); margin-bottom: 4px;">
                  {{ chamado.descricao_problema }}
                </div>
                
                <div style="font-size: 13px; color: var(--tcc-text-muted);">
                  <strong>Cliente:</strong> {{ chamado.cliente_nome && chamado.cliente_nome !== 'Cliente' ? chamado.cliente_nome : 'Cliente não informado' }}
                </div>
                
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <button class="tcc-btn-main" (click)="aceitarChamado(chamado.id)" style="width: 100%; justify-content: center; padding: 10px;">
                    <i class="pi pi-check" style="margin-right: 8px;"></i> Aceitar Chamado
                  </button>
                </div>
              </div>
            }
            @if (chamadosAbertos.length === 0 && !carregando) {
              <div style="text-align: center; padding: 32px 0; color: var(--tcc-text-muted);">
                <i class="pi pi-check-circle" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.5;"></i>
                <p style="margin: 0;">Nenhum chamado disponível. Você está em dia!</p>
              </div>
            }
            @if (carregando) {
              <div style="text-align: center; padding: 32px 0; color: var(--tcc-text-muted);">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; margin-bottom: 12px;"></i>
                <p style="margin: 0;">Carregando...</p>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .tcc-dashboard-panels {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    @media (min-width: 1024px) {
      .tcc-dashboard-panels {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class ChamadosTecnico {
  formatStatus(status: string): string {
    if (!status) return '';
    if (status === 'EM_ANDAMENTO') return 'Em Andamento';
    if (status === 'PENDENTE') return 'Pendente';
    if (status === 'CONCLUIDO') return 'Concluído';
    if (status === 'CANCELADO') return 'Cancelado';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  chamadosAbertos: any[] = [];
  meusChamados: any[] = [];
  carregando = false;

  constructor(private solicitacaoService: SolicitacaoService, private router: Router) {
    this.carregarTodos();
  }
  
  carregarTodos() {
      this.carregarChamados();
      this.carregarMeusChamados();
  }

  carregarChamados() {
    this.carregando = true;
    this.solicitacaoService.getAbertas().subscribe({
      next: (chamados) => {
        this.chamadosAbertos = chamados;
        this.carregando = false;
      },
      error: () => {
          this.carregando = false;
      }
    });
  }

  carregarMeusChamados() {
    this.solicitacaoService.getMinhas().subscribe({
      next: (chamados) => {
        this.meusChamados = chamados;
      }
    });
  }

  abrirChat(id: string) {
    this.router.navigate(['/painel/chat', id]);
  }
  
  aceitarChamado(id: string) {
    this.solicitacaoService.aceitar(id).subscribe({
      next: (solicitacao) => {
        this.carregarTodos();
        this.router.navigate(['/painel/chat', id]);
      }
    });
  }
  
  concluirChamado(id: string) {
      this.solicitacaoService.concluir(id).subscribe({
          next: () => {
              this.carregarTodos();
          }
      });
  }
  
  formatData(isoStr: string): string {
      if (!isoStr) return '';
      const data = new Date(isoStr);
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
