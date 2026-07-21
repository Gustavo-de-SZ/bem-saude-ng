import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, TecnicoAdmin } from '../../../services/admin.service';

@Component({
  selector: 'app-tecnicos-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-2 text-gray-800">Aprovar Técnicos</h1>
      <p class="text-gray-500 mb-6">Gerencie os cadastros de profissionais na plataforma.</p>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h2 class="font-semibold text-gray-700">Pendentes ({{ pendingTecnicos.length }})</h2>
           <div class="flex gap-2">
              <span class="text-sm px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                 <i class="pi pi-filter mr-2 text-gray-400"></i> Filtrar
              </span>
           </div>
        </div>
        
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
              <th class="p-4 font-medium border-b border-gray-100">Profissional</th>
              <th class="p-4 font-medium border-b border-gray-100">Descrição</th>
              <th class="p-4 font-medium border-b border-gray-100">Data de Cadastro</th>
              <th class="p-4 font-medium border-b border-gray-100 text-center">Status</th>
              <th class="p-4 font-medium border-b border-gray-100 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tecnico of pendingTecnicos" class="hover:bg-gray-50/50 transition-colors">
              <td class="p-4 border-b border-gray-50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase">
                    {{ tecnico.nome_fantasia ? tecnico.nome_fantasia.charAt(0) : '?' }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ tecnico.nome_fantasia || 'Nome não informado' }}</p>
                    <p class="text-xs text-gray-500">{{ tecnico.telefone }} - CPF: {{ tecnico.cpf }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 border-b border-gray-50">
                <span class="text-sm text-gray-700 block max-w-xs truncate" [title]="tecnico.descricao_servicos">{{ tecnico.descricao_servicos || 'Nenhuma descrição' }}</span>
              </td>
              <td class="p-4 border-b border-gray-50 text-sm text-gray-600">
                {{ tecnico.criado_em | date:'dd/MM/yyyy' }}
              </td>
              <td class="p-4 border-b border-gray-50 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Pendente
                </span>
              </td>
              <td class="p-4 border-b border-gray-50 text-right">
                <div class="flex justify-end gap-2">
                   <button class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Aprovar" (click)="aprovar(tecnico)">
                     <i class="pi pi-check" *ngIf="!loadingAction[tecnico.id]"></i>
                     <i class="pi pi-spin pi-spinner" *ngIf="loadingAction[tecnico.id] === 'aprovar'"></i>
                   </button>
                   <button class="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors" title="Rejeitar" (click)="rejeitar(tecnico)">
                     <i class="pi pi-times" *ngIf="!loadingAction[tecnico.id]"></i>
                     <i class="pi pi-spin pi-spinner" *ngIf="loadingAction[tecnico.id] === 'rejeitar'"></i>
                   </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="pendingTecnicos.length === 0 && !loading">
               <td colspan="5" class="p-8 text-center text-gray-500">
                  Nenhum técnico pendente de aprovação.
               </td>
            </tr>
            <tr *ngIf="loading">
               <td colspan="5" class="p-8 text-center text-gray-500">
                  <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
                  <p class="mt-2">Carregando...</p>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TecnicosAdmin implements OnInit {
  pendingTecnicos: TecnicoAdmin[] = [];
  loading = true;
  loadingAction: { [key: number]: string } = {};

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.carregarPendentes();
  }

  carregarPendentes() {
    this.loading = true;
    this.adminService.getTecnicosPendentes().subscribe({
      next: (tecnicos) => {
        this.pendingTecnicos = tecnicos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar técnicos', err);
        this.loading = false;
      }
    });
  }

  aprovar(tecnico: TecnicoAdmin) {
    this.loadingAction[tecnico.id] = 'aprovar';
    this.adminService.aprovarTecnico(tecnico.id).subscribe({
      next: () => {
        this.pendingTecnicos = this.pendingTecnicos.filter(t => t.id !== tecnico.id);
        delete this.loadingAction[tecnico.id];
      },
      error: (err) => {
        console.error('Erro ao aprovar', err);
        delete this.loadingAction[tecnico.id];
      }
    });
  }

  rejeitar(tecnico: TecnicoAdmin) {
    this.loadingAction[tecnico.id] = 'rejeitar';
    this.adminService.rejeitarTecnico(tecnico.id).subscribe({
      next: () => {
        this.pendingTecnicos = this.pendingTecnicos.filter(t => t.id !== tecnico.id);
        delete this.loadingAction[tecnico.id];
      },
      error: (err) => {
        console.error('Erro ao rejeitar', err);
        delete this.loadingAction[tecnico.id];
      }
    });
  }
}
