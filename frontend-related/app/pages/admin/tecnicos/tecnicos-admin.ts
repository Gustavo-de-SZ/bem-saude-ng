import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, TecnicoAdmin } from '../../../services/admin.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-tecnicos-admin',
  standalone: true,
  imports: [CommonModule, ToastModule],
  template: `
    <div class="tcc-fade-in tcc-p-lg max-w-7xl mx-auto">
      <section class="mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Aprovar Técnicos</h1>
          <p class="text-gray-500 mt-1">Gerencie os cadastros de profissionais na plataforma</p>
        </div>
      </section>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h2 class="text-lg font-semibold text-gray-800 m-0 flex items-center gap-2">
             Pendentes 
             <span class="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-sm">{{ pendingTecnicos.length }}</span>
           </h2>
           <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <i class="pi pi-filter"></i> Filtrar
           </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profissional</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngIf="loading">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
                  <p>Carregando técnicos...</p>
                </td>
              </tr>
              
              <tr *ngIf="!loading && pendingTecnicos.length === 0">
                <td colspan="5" class="px-6 py-16 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <i class="pi pi-check-circle text-3xl text-emerald-500"></i>
                    </div>
                    <p class="text-lg font-medium text-gray-900 mb-1">Tudo em dia!</p>
                    <p class="text-sm">Não há profissionais aguardando aprovação no momento.</p>
                  </div>
                </td>
              </tr>

              <tr *ngFor="let tecnico of pendingTecnicos" class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shadow-sm border border-blue-100">
                      {{ tecnico.nome_fantasia ? tecnico.nome_fantasia.charAt(0) : '?' }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 m-0">{{ tecnico.nome_fantasia || 'Nome não informado' }}</p>
                      <p class="text-sm text-gray-500 m-0 mt-0.5">{{ tecnico.telefone }} - CNPJ: {{ tecnico.cnpj }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 block max-w-[12rem] truncate" [title]="tecnico.descricao_servicos">{{ tecnico.descricao_servicos || 'Nenhuma descrição' }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ tecnico.criado_em | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    Pendente
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                     <button class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none" title="Aprovar" (click)="aprovar(tecnico)">
                       <i class="pi pi-check" *ngIf="!loadingAction[tecnico.id]"></i>
                       <i class="pi pi-spin pi-spinner" *ngIf="loadingAction[tecnico.id] === 'aprovar'"></i>
                     </button>
                     <button class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none" title="Rejeitar" (click)="rejeitar(tecnico)">
                       <i class="pi pi-times" *ngIf="!loadingAction[tecnico.id]"></i>
                       <i class="pi pi-spin pi-spinner" *ngIf="loadingAction[tecnico.id] === 'rejeitar'"></i>
                     </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TecnicosAdmin implements OnInit {
  pendingTecnicos: TecnicoAdmin[] = [];
  loading = true;
  loadingAction: { [key: number]: string } = {};

  constructor(private adminService: AdminService, private messageService: MessageService) {}

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
        this.messageService.add({severity:'success', summary:'Sucesso', detail:'Técnico aprovado com sucesso.'});
      },
      error: (err) => {
        console.error('Erro ao aprovar', err);
        delete this.loadingAction[tecnico.id];
        this.messageService.add({severity:'error', summary:'Erro', detail:'Erro ao aprovar técnico.'});
      }
    });
  }

  rejeitar(tecnico: TecnicoAdmin) {
    this.loadingAction[tecnico.id] = 'rejeitar';
    this.adminService.rejeitarTecnico(tecnico.id).subscribe({
      next: () => {
        this.pendingTecnicos = this.pendingTecnicos.filter(t => t.id !== tecnico.id);
        delete this.loadingAction[tecnico.id];
        this.messageService.add({severity:'success', summary:'Sucesso', detail:'Técnico aprovado com sucesso.'});
      },
      error: (err) => {
        console.error('Erro ao rejeitar', err);
        delete this.loadingAction[tecnico.id];
        this.messageService.add({severity:'error', summary:'Erro', detail:'Erro ao rejeitar técnico.'});
      }
    });
  }
}
