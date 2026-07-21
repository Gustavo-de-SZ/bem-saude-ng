import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-novo-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputMaskModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="ns-page-container">
      
      <header class="ns-page-header">
        <a routerLink="/painel/clientes" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Novo Cliente</h1>
          <p>Adicione um novo cliente à sua base de dados</p>
        </div>
      </header>

      <div class="ns-grid-layout">
        
        <main class="ns-form-column">
          <form [formGroup]="clienteForm">

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-user text-primary"></i> Informações Principais
              </h2>
              
              <div class="ns-form-row-2">
                <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('nome')">
                  <label for="nome">Nome Completo *</label>
                  <input id="nome" type="text" formControlName="nome" class="ns-input" placeholder="Ex: João Silva" />
                  @if (hasError('nome', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Nome é obrigatório</span>
                  } @else if (hasError('nome', 'minlength')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Mínimo de 3 caracteres</span>
                  }
                </div>

                <div class="ns-form-group">
                  <label for="empresa">Empresa (Opcional)</label>
                  <input id="empresa" type="text" formControlName="empresa" class="ns-input" placeholder="Ex: Tech Solutions" />
                </div>
              </div>

              <div class="ns-form-row-2">
                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('email')">
                  <label for="email">E-mail</label>
                  <input id="email" type="email" formControlName="email" class="ns-input" placeholder="exemplo@email.com" />
                </div>

                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('telefone')">
                  <label for="telefone">Telefone / WhatsApp *</label>
                  <p-inputmask
                    id="telefone"
                    formControlName="telefone"
                    mask="(99) 99999-9999"
                    placeholder="(99) 99999-9999"
                    class="ns-input"
                  ></p-inputmask>
                  @if (hasError('telefone', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Telefone é obrigatório</span>
                  }
                </div>
              </div>
            </section>

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-map-marker text-primary"></i> Localização / Endereço
              </h2>

              <div class="ns-form-row-3-cep">
                <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('cep')">
                  <label for="cep">CEP *</label>
                  <p-inputmask
                    id="cep"
                    formControlName="cep"
                    mask="99999-999"
                    placeholder="00000-000"
                    class="ns-input"
                  ></p-inputmask>
                  @if (hasError('cep', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> CEP obrigatório</span>
                  } @else if (hasError('cep', 'pattern')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> CEP inválido</span>
                  }
                </div>

                <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('rua')" style="grid-column: span 2;">
                  <label for="rua">Rua / Avenida *</label>
                  <input id="rua" type="text" formControlName="rua" class="ns-input" placeholder="Ex: Av. Central" />
                  @if (hasError('rua', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Rua é obrigatória</span>
                  }
                </div>
              </div>

              <div class="ns-form-row-3">
                <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('numero')">
                  <label for="numero">Número *</label>
                  <input id="numero" type="text" formControlName="numero" class="ns-input" placeholder="Ex: 123" />
                  @if (hasError('numero', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>

                <div class="ns-form-group">
                  <label for="complemento">Complemento</label>
                  <input id="complemento" type="text" formControlName="complemento" class="ns-input" placeholder="Ex: Bloco A" />
                </div>

                <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('bairro')">
                  <label for="bairro">Bairro *</label>
                  <input id="bairro" type="text" formControlName="bairro" class="ns-input" placeholder="Ex: Centro" />
                  @if (hasError('bairro', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>
              </div>

              <div class="ns-form-row-2">
                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('cidade')">
                  <label for="cidade">Cidade *</label>
                  <input id="cidade" type="text" formControlName="cidade" class="ns-input" placeholder="Ex: Gaspar" />
                  @if (hasError('cidade', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Cidade é obrigatória</span>
                  }
                </div>
              </div>
            </section>

            <section class="ns-card">
              <div class="ns-form-group mb-0">
                <label for="observacoes">Observações adicionais (opcional)</label>
                <textarea 
                  id="observacoes" 
                  formControlName="observacoes" 
                  class="ns-input ns-textarea" 
                  rows="4" 
                  placeholder="Restrições de horário, detalhes técnicos do cliente, etc."
                ></textarea>
              </div>
            </section>

          </form>
        </main>

        <aside class="ns-summary-column">
          <div class="ns-card ns-summary-card">
            <h3>Resumo do Cadastro</h3>

            <div class="ns-summary-list">
              <div class="ns-summary-item">
                <span class="label">Nome</span>
                <span class="value ns-truncate" [title]="clienteForm.get('nome')?.value">{{ clienteForm.get('nome')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Empresa</span>
                <span class="value ns-truncate" [title]="clienteForm.get('empresa')?.value">{{ clienteForm.get('empresa')?.value || 'Particular' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">E-mail</span>
                <span class="value ns-truncate" [title]="clienteForm.get('email')?.value">{{ clienteForm.get('email')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Contato</span>
                <span class="value">{{ clienteForm.get('telefone')?.value || '—' }}</span>
              </div>
            </div>

            <div class="ns-summary-divider"></div>

            <div class="ns-summary-address-box">
              <span class="ns-address-title"><i class="pi pi-map"></i> Visualização do Endereço:</span>
              <p class="ns-address-preview">{{ getEnderecoPreview() }}</p>
            </div>

            <div class="ns-summary-actions">
              <button type="button" class="ns-btn-submit" [disabled]="clienteForm.invalid" (click)="cadastrar()">
                Cadastrar Cliente
              </button>
              <button type="button" class="ns-btn-cancel" (click)="cancelar()">
                Cancelar
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
    <p-toast position="bottom-right"></p-toast>
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
    .ns-form-row-3-cep { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
    @media (max-width: 768px) { .ns-form-row-2, .ns-form-row-3, .ns-form-row-3-cep { grid-template-columns: 1fr; } }

    /* Padronização de Inputs Nativos e PrimeNG */
    ::ng-deep .ns-input:not(p-inputmask) {
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
    ::ng-deep p-inputmask.ns-input {
      width: 100% !important;
      display: inline-flex !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
    ::ng-deep p-inputmask.ns-input input,
    ::ng-deep p-inputmask.ns-input .p-inputtext {
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
    ::ng-deep .ns-input::placeholder,
    ::ng-deep p-inputmask.ns-input input::placeholder {
      color: var(--text-muted) !important;
      opacity: 0.7;
    }
    ::ng-deep .ns-input:focus, 
    ::ng-deep p-inputmask.ns-input input:focus {
      border-color: var(--primary) !important;
      outline: none !important;
      box-shadow: 0 0 0 1px var(--primary) !important;
    }
    .ns-textarea { resize: vertical; min-height: 100px; }

    /* ==========================================================================
       5. ESTADOS DE ERRO (BLINDADO)
       ========================================================================== */
    .ns-error-text { color: var(--error); font-size: 12px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .ns-is-invalid label { color: var(--error) !important; }
    .ns-is-invalid ::ng-deep .ns-input:not(p-inputmask), 
    .ns-is-invalid ::ng-deep p-inputmask.ns-input input {
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
    
    .ns-summary-divider { height: 1px; background-color: var(--border); margin: 20px 0; }
    
    .ns-summary-address-box { background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
    .ns-address-title { font-size: 12px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
    .ns-address-preview { font-size: 13px; color: var(--text-main); margin: 0; line-height: 1.4; word-break: break-word; }

    .ns-summary-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    
    .ns-btn-submit {
      width: 100%; background: var(--primary); color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .ns-btn-submit:hover:not(:disabled) { background: #2563eb; }
    .ns-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .ns-btn-cancel { width: 100%; background: transparent; border: none; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; text-align: center; transition: color 0.2s; }
    .ns-btn-cancel:hover { color: var(--text-main); text-decoration: underline; }
  `]
})
export class NovoCliente {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);

  clienteForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    email: ['', ],
    telefone: ['', [Validators.required, Validators.maxLength(15)]],
    empresa: [''],
    rua: ['', [Validators.required, Validators.maxLength(255)]],
    numero: ['', [Validators.required, Validators.maxLength(10)]],
    complemento: [''],
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    cidade: ['', [Validators.required, Validators.maxLength(100)]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    observacoes: ['']
  });

  // Auxiliares de validação de template
  isInvalid(controlName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  getEnderecoPreview(): string {
    const f = this.clienteForm.value;
    if (!f.rua && !f.numero && !f.bairro && !f.cidade) return 'Nenhum endereço informado.';
    
    let endereco = f.rua || '—';
    endereco += `, ${f.numero || 'S/N'}`;
    if (f.complemento) endereco += ` (${f.complemento})`;
    if (f.bairro) endereco += `, ${f.bairro}`;
    if (f.cidade) endereco += ` - ${f.cidade}`;
    if (f.cep) endereco += ` [CEP: ${f.cep}]`;
    
    return endereco;
  }

  cadastrar() {
    if (this.clienteForm.valid) {
      const formData = this.clienteForm.getRawValue();

      const enderecoCompleto = `${formData.rua!}, ${formData.numero!}${formData.complemento ? ` ${formData.complemento}` : ''}, ${formData.bairro!}, ${formData.cidade!} - ${formData.cep!}`;

      const cliente: Cliente = {
        nome: formData.nome!,
        empresa: formData.empresa ?? '',
        avaliacao: 0,
        email: formData.email ?? '',
        telefone: formData.telefone!,
        local: enderecoCompleto,
        servicosAtivos: 0,
        servicosConcluidos: 0,
        tipoCliente: null,
        status: null
      };

      this.clienteService.addClienteTecnico(cliente).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Show de bola!',
            detail: 'Cliente cadastrado com sucesso'
          });

          this.limpar();
          setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
        },
        error: (err) => {
          console.error('Erro ao salvar cliente', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o cliente'
          });
        }
      });
    } else {
      this.clienteForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }

  limpar() {
    this.clienteForm.reset();
  }

  cancelar() {
    this.limpar();
    this.router.navigate(['/painel/clientes']);
  }
}