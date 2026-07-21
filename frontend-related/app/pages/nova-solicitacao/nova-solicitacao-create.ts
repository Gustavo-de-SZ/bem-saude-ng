import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Modules
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';

// Models e Services


@Component({
  selector: 'app-nova-solicitacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="ns-page-container">
      <header class="ns-page-header">
        <a routerLink="/painel/solicitacoes" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Nova Solicitação</h1>
          <p>Registre uma nova solicitação de serviço</p>
        </div>
      </header>

      <div class="ns-grid-layout" [formGroup]="solicitacaoForm">
        <main class="ns-form-column">
          <form [formGroup]="solicitacaoForm">

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-info-circle text-primary"></i> Dados da Solicitação
              </h2>

              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('titulo')">
                <label for="titulo">Título *</label>
                <input id="titulo" type="text" formControlName="titulo" class="ns-input"
                  placeholder="Ex: Computador não liga" />
                @if (hasError('titulo', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Título é obrigatório</span>
                }
                @else if (hasError('titulo', 'minlength')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Mínimo de 10 caracteres</span>
                }
              </div>

              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('categoriaId')">
                <label for="categoriaId">Categoria *</label>
                <p-select formControlName="categoriaId" [options]="categoriasOptions"
                  optionLabel="label" optionValue="value" placeholder="Selecione a categoria"
                  class="ns-select w-full"></p-select>
                @if (hasError('categoriaId', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Categoria é obrigatória</span>
                }
              </div>

              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('dataCriacao')">
                <label for="dataCriacao">Data de Criação *</label>
                <p-datePicker
                  id="dataCriacao"
                  formControlName="dataCriacao"
                  dateFormat="dd/mm/yy"
                  placeholder="dd/mm/yyyy"
                  [showIcon]="true"
                  iconDisplay="input"
                  appendTo="body"
                  class="ns-datepicker"
                ></p-datePicker>
                @if (hasError('dataCriacao', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Data é obrigatória</span>
                }
              </div>

              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('descricao')">
                <label for="descricao">Descrição do Problema *</label>
                <textarea id="descricao" formControlName="descricao" class="ns-input ns-textarea"
                  rows="4" placeholder="Descreva o problema detalhadamente"></textarea>
                @if (hasError('descricao', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Descrição é obrigatória</span>
                }
                @else if (hasError('descricao', 'minlength')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Mínimo de 10 caracteres</span>
                }
              </div>
            </section>

          </form>
        </main>

        <aside class="ns-summary-column">
          <div class="ns-card ns-summary-card">
            <h3>Resumo da Solicitação</h3>

            <div class="ns-summary-list">
              <div class="ns-summary-item">
                <span class="label">Título</span>
                <span class="value ns-truncate" [title]="solicitacaoForm.get('titulo')?.value">
                  {{ solicitacaoForm.get('titulo')?.value || '—' }}
                </span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Categoria</span>
                <span class="value">{{ getCategoriaLabel() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Descrição</span>
                <span class="value ns-truncate" [title]="solicitacaoForm.get('descricao')?.value">
                  {{ solicitacaoForm.get('descricao')?.value || '—' }}
                </span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Data</span>
                <span class="value">{{ formatarDataExibicao(solicitacaoForm.get('dataCriacao')?.value) }}</span>
              </div>
            </div>

            <div class="ns-summary-actions">
              <button type="button" class="ns-btn-submit" [disabled]="solicitacaoForm.invalid" (click)="criarSolicitacao()">
                Criar Solicitação
              </button>
              <button type="button" class="ns-btn-cancel" (click)="cancelar()">
                Cancelar
              </button>
            </div>
          </div>
        </aside>
      </div>

      <p-toast position="bottom-right"></p-toast>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       1. DEFINIÇÃO DE VARIÁVEIS DO DESIGN SYSTEM (COM SUPORTE A DARK THEME)
       ========================================================================== */
    .ns-page-container {
      --primary: #3b82f6;
      --primary-bg: #eff6ff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --border-input: #94a3b8;
      --bg-main: #f8fafc;
      --bg-card: #ffffff;
      --error: #ef4444;
      --error-bg: #fef2f2;

      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--bg-main);
      min-height: 100vh;
      transition: background-color 0.2s, color 0.2s;
    }

    /* Integração com o seu ThemeService (Modo Escuro) */
    ::ng-deep body.tp-dark-theme .ns-page-container {
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --border: #223047;
      --border-input: #334155;
      --bg-main: #090e17;
      --bg-card: #131c2c;
      --primary-bg: rgba(59, 130, 246, 0.15);
      --error-bg: rgba(239, 68, 68, 0.05);
    }

    /* ==========================================================================
       2. ESTRUTURA E CABEÇALHO
       ========================================================================== */
    .ns-page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .ns-page-header h1 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0; }
    .ns-page-header p { font-size: 14px; color: var(--text-muted); margin: 0; }

    .ns-back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%;
      color: var(--text-muted); text-decoration: none; transition: background 0.2s; margin-top: 2px;
    }
    .ns-back-btn:hover { background: var(--border); color: var(--text-main); }

    .ns-grid-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
    @media (max-width: 1024px) { .ns-grid-layout { grid-template-columns: 1fr; } }
    .ns-form-column { display: flex; flex-direction: column; gap: 20px; }

    /* ==========================================================================
       3. CARDS
       ========================================================================== */
    .ns-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      color: var(--text-main);
      transition: all 0.2s;
    }
    .ns-card-title { font-size: 16px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px; }
    .text-primary { color: var(--primary); }

    /* ==========================================================================
       4. FORMULÁRIOS E INPUTS (RESET PRIMENG APLICADO)
       ========================================================================== */
    .ns-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .ns-form-group.mb-0 { margin-bottom: 0; }
    .ns-form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }

    .ns-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ns-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .ns-form-row-2, .ns-form-row-3 { grid-template-columns: 1fr; } }

    /* Padronização de Inputs Nativos e PrimeNG */
    ::ng-deep .ns-datepicker,
    ::ng-deep .ns-datepicker.p-datepicker {
      width: 100% !important;
      display: inline-flex !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    ::ng-deep .ns-input,
    ::ng-deep .ns-datepicker input,
    ::ng-deep .ns-datepicker .p-inputtext,
    ::ng-deep .ns-select {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      transition: all 0.2s !important;
      box-shadow: none !important;
      font-family: inherit !important;
      background-color: var(--bg-card) !important;
      color: var(--text-main) !important;
      border: 1px solid var(--border-input) !important;
      box-sizing: border-box !important;
    }
    ::ng-deep .ns-select { padding: 0 !important; }
    ::ng-deep .ns-select .p-select-label { color: var(--text-main); padding: 10px 14px; font-family: inherit; font-size: 14px; }
    ::ng-deep .ns-select .p-select-dropdown { color: var(--text-muted); }

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-datepicker input::placeholder,
    ::ng-deep .ns-datepicker .p-inputtext::placeholder {
      color: var(--text-muted) !important;
      opacity: 0.7;
    }
    ::ng-deep .ns-input:focus,
    ::ng-deep .ns-datepicker input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus,
    ::ng-deep .ns-select:not(.p-disabled).p-focus {
      border-color: var(--primary) !important;
      outline: none !important;
      box-shadow: 0 0 0 1px var(--primary) !important;
    }

    .ns-textarea { resize: vertical; min-height: 80px; }

    /* ==========================================================================
       5. ESTADOS DE ERRO (BLINDADO)
       ========================================================================== */
    .ns-error-text { color: var(--error); font-size: 12px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .ns-is-invalid label { color: var(--error) !important; }
    .ns-is-invalid ::ng-deep .ns-input,
    .ns-is-invalid ::ng-deep .ns-datepicker input,
    .ns-is-invalid ::ng-deep .ns-datepicker .p-inputtext,
    .ns-is-invalid ::ng-deep .ns-select {
      border-color: var(--error) !important;
      background-color: var(--error-bg) !important;
    }

    /* ==========================================================================
       6. ASIDE (RESUMO LATERAL E BOTÕES)
       ========================================================================== */
    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px 0; }

    .ns-summary-list { display: flex; flex-direction: column; gap: 14px; }
    .ns-summary-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; gap: 16px; }
    .ns-summary-item .label { color: var(--text-muted); font-weight: 500; white-space: nowrap; }
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--text-main); }
    .ns-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }

    .ns-summary-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }

    .ns-btn-submit {
      width: 100%; background: var(--primary); color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .ns-btn-submit:hover:not(:disabled) { background: #2563eb; }
    .ns-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .ns-btn-cancel { width: 100%; background: transparent; border: none; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; text-align: center; }
    .ns-btn-cancel:hover { color: var(--text-main); text-decoration: underline; }
  `]
})
export class NovaSolicitacao implements OnInit {
  private fb = inject(FormBuilder);
  private solicitacaoService = inject(SolicitacaoService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  solicitacaoForm!: FormGroup;

  // Hardcoded categories - adjust based on actual categories in your system
  categoriasOptions = [
    { label: 'Redes', value: 1 },
    { label: 'Hardware', value: 2 },
    { label: 'Software', value: 3 },
    { label: 'Segurança', value: 4 },
    { label: 'Impressoras', value: 5 },
    { label: 'Outros', value: 6 }
  ];

  ngOnInit(): void {
    this.solicitacaoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      categoriaId: ['', Validators.required],
      dataCriacao: [new Date(), Validators.required]
    });
  }

  // Auxiliares de validação
  isInvalid(controlName: string): boolean {
    const control = this.solicitacaoForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.solicitacaoForm.get(controlName);
    return !! (control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  formatarDataExibicao(data: any): string {
    if (!data) return '—';
    if (data instanceof Date) {
      if (isNaN(data.getTime())) return '—';
      const d = data.getDate().toString().padStart(2, '0');
      const m = (data.getMonth() + 1).toString().padStart(2, '0');
      const y = data.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(data);
    if (str.toLowerCase().includes('invalid')) {
      return '—';
    }
    if (str.includes('/')) {
      return str;
    }
    if (str.includes('-')) {
      const partes = str.split('T')[0].split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
          return `${partes[0]}/${partes[1]}/${partes[2]}`;
        }
      }
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const d = parsed.getDate().toString().padStart(2, '0');
      const m = (parsed.getMonth() + 1).toString().padStart(2, '0');
      const y = parsed.getFullYear();
      return `${d}/${m}/${y}`;
    }
    return str;
  }

  criarSolicitacao(): void {
    if (this.solicitacaoForm.valid) {
      const formValue = this.solicitacaoForm.getRawValue();

      const catId = typeof formValue.categoriaId === 'object' && formValue.categoriaId !== null
        ? formValue.categoriaId.value
        : formValue.categoriaId;

      const solicitacao: Solicitacao = {
        titulo: formValue.titulo,
        descricao_problema: formValue.descricao,
        categoria_id: catId,
        dataCriacao: formValue.dataCriacao instanceof Date
          ? formValue.dataCriacao.toISOString().split('T')[0] // YYYY-MM-DD
          : String(formValue.dataCriacao)
        // status will be set to 'ABERTO' by default in the backend
      };

      this.solicitacaoService.createSolicitacao(solicitacao).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Solicitação criada com sucesso!'
          });
          const todayStr = new Date().toISOString().split('T')[0];
          this.solicitacaoForm.reset({
            dataCriacao: new Date() // reset date to today as Date object
          });
          // Redireciona para a lista de solicitações após 1 segundo
          setTimeout(() => this.router.navigate(['/painel/solicitacoes']), 1000);
        },
        error: (err) => {
          console.error('Erro ao criar solicitação', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao criar a solicitação. Tente novamente.'
          });
        }
      });
    } else {
      this.solicitacaoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente.'
      });
    }
  }

  cancelar(): void {
    this.solicitacaoForm.reset({
      dataCriacao: new Date()
    });
    this.router.navigate(['/painel/solicitacoes']);
  }

  // Helper to get category label for display
  getCategoriaLabel(): string {
    const categoriaId = this.solicitacaoForm.get('categoriaId')?.value;
    const categoria = this.categoriasOptions.find(c => c.value === categoriaId);
    return categoria ? categoria.label : '—';
  }
}