import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Imports do PrimeNG (v18+)
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="ns-page-container">
      <div class="ns-back-btn" (click)="goBack()">
        <i class="pi pi-arrow-left"></i>
      </div>

      <main class="ns-main-content">
        <div class="ns-grid-layout">
          <div class="ns-form-column">

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-user-edit text-primary"></i> Editar Cliente
              </h2>

              <form [formGroup]="form" (ngSubmit)="atualizarCliente()">

                <div class="ns-form-row">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('nome')">
                    <label>Nome *</label>
                    <input type="text" formControlName="nome" class="ns-input" placeholder="Digite o nome completo">
                    <div *ngIf="isInvalid('nome')" class="ns-error-message">
                      O nome é obrigatório
                    </div>
                  </div>

                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('email')">
                    <label>E-mail *</label>
                    <input type="email" formControlName="email" class="ns-input" placeholder="Digite o e-mail">
                    <div *ngIf="isInvalid('email')" class="ns-error-message">
                      O e-mail é obrigatório e deve ser válido
                    </div>
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('telefone')">
                    <label>Telefone</label>
                    <input type="tel" formControlName="telefone" class="ns-input" placeholder="(xx) xxxxx-xxxx">
                  </div>

                  <div class="ns-form-group">
                    <label>Empresa</label>
                    <input type="text" formControlName="empresa" class="ns-input" placeholder="Nome da empresa">
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group">
                    <label>Local</label>
                    <input type="text" formControlName="local" class="ns-input" placeholder="Cidade, estado">
                  </div>

                  <div class="ns-form-group">
                    <label>Avaliação</label>
                    <input type="number" formControlName="avaliacao" class="ns-input" min="0" max="5" step="0.1" placeholder="0.0 a 5.0">
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group">
                    <label>Serviços Ativos</label>
                    <input type="number" formControlName="servicosAtivos" class="ns-input" min="0" placeholder="Número de serviços ativos">
                  </div>

                  <div class="ns-form-group">
                    <label>Serviços Concluídos</label>
                    <input type="number" formControlName="servicosConcluidos" class="ns-input" min="0" placeholder="Número de serviços concluídos">
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group">
                    <label>Tipo de Cliente</label>
                    <p-select formControlName="tipoCliente" [options]="tiposCliente" optionLabel="label" placeholder="Selecione o tipo" class="ns-select"></p-select>
                  </div>

                  <div class="ns-form-group">
                    <label>Status</label>
                    <p-select formControlName="status" [options]="statusOptions" optionLabel="label" placeholder="Selecione o status" class="ns-select"></p-select>
                  </div>
                </div>

              </form>
            </section>

          </div>

          <aside class="ns-summary-column">
            <div class="ns-card ns-summary-card">
              <h3>Resumo do Cliente</h3>

              <div class="ns-summary-list">
                <div class="ns-summary-item">
                  <span class="label">Nome</span>
                  <span class="value ns-truncate" [title]="form.get('nome')?.value">{{ form.get('nome')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">E-mail</span>
                  <span class="value ns-truncate" [title]="form.get('email')?.value">{{ form.get('email')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Telefone</span>
                  <span class="value">{{ form.get('telefone')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Empresa</span>
                  <span class="value ns-truncate" [title]="form.get('empresa')?.value">{{ form.get('empresa')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Local</span>
                  <span class="value ns-truncate" [title]="form.get('local')?.value">{{ form.get('local')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Avaliação</span>
                  <span class="value">{{ form.get('avaliacao')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Serviços Ativos</span>
                  <span class="value">{{ form.get('servicosAtivos')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Serviços Concluídos</span>
                  <span class="value">{{ form.get('servicosConcluidos')?.value || '—' }}</span>
                </div>
              </div>

              <div class="ns-summary-divider"></div>

              <div class="ns-summary-actions">
                <button type="button" class="ns-btn-submit" [disabled]="form.invalid" (click)="atualizarCliente()">
                  Atualizar Cliente
                </button>
                <button type="button" routerLink="/painel/clientes" class="ns-btn-cancel">
                  Cancelar
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <p-toast position="bottom-right"></p-toast>
    </div>
  `,
  styles: [`

    .ns-page-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      background-color: var(--bg-main, #f8fafc);
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
      transition: background-color 0.2s, color 0.2s;
    }

    ::ng-deep body.tp-dark-theme .ns-page-container {
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --border: #223047;
      --border-input: #334155;
      --bg-main: #090e17;
      --bg-card: #131c2c;
      --primary-bg: rgba(59, 130, 246, 0.15);
      --error-bg: rgba(239, 68, 68, 0.05);
      /* Override tcc variables for components */
      --tcc-surface: var(--bg-card);
      --tcc-text-main: var(--text-main);
      --tcc-text-muted: var(--text-muted);
      --tcc-border: var(--border);
      --tcc-surface-hover: var(--bg-card);
    }

    .ns-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: var(--tcc-text-muted, #64748b);
      text-decoration: none;
      transition: background 0.2s;
    }

    .ns-back-btn:hover {
      background: var(--tcc-surface-hover, #e2e8f0);
    }

    .ns-grid-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }

    .ns-form-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }


    .ns-card {
      background-color: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--tcc-shadow, 0 1px 3px rgba(0,0,0,0.1));
      color: var(--tcc-text-main, #0f172a);
      transition: background-color 0.2s, border-color 0.2s;
    }

    .ns-card-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--tcc-text-main, #0f172a);
    }

    .text-primary {
      color: #3b82f6;
    }

    .ns-form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .ns-form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    ::ng-deep .ns-input {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      transition: all 0.2s !important;
      box-shadow: none !important;
      font-family: inherit !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      border: 1px solid var(--tcc-border, #e2e8f0) !important;
      box-sizing: border-box !important;
    }

    ::ng-deep .ns-textarea .p-inputtext {
      width: 100% !important;
      border-radius: 8px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      transition: all 0.2s !important;
      box-shadow: none !important;
      font-family: inherit !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      color: var(--tcc-text-main, #0f172a) !important;
      border: 1px solid var(--tcc-border, #e2e8f0) !important;
      box-sizing: border-box !important;
    }

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-textarea .p-inputtext::placeholder {
      color: var(--tcc-text-muted, #94a3b8) !important;
      opacity: 0.7;
    }

    ::ng-deep .ns-input:focus,
    ::ng-deep .ns-textarea .p-inputtext:focus {
      border-color: #3b82f6 !important;
      outline: none;
      box-shadow: 0 0 0 1px #3b82f6 !important;
    }

    /* P-select styling */
    ::ng-deep .p-select {
      width: 100% !important;
    }

    ::ng-deep .p-select .p-dropdown-label {
      padding: 10px 14px;
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a) !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      border: 1px solid var(--tcc-border, #e2e8f0) !important;
      border-radius: 8px;
    }

    ::ng-deep .p-select .p-dropdown-trigger {
      border-left: 1px solid var(--tcc-border, #e2e8f0);
    }

    ::ng-deep .p-select-panel {
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      box-shadow: var(--tcc-shadow, 0 1px 3px rgba(0,0,0,0.1));
    }

    ::ng-deep .p-select-item {
      padding: 8px 14px;
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a);
    }

    ::ng-deep .p-select-item:hover {
      background-color: var(--tcc-surface-hover, #f1f5f9);
    }

    ::ng-deep .p-select-item.p-highlight {
      background-color: var(--primary-bg, #eff6ff);
      color: var(--tcc-text-main, #0f172a);
    }

    .ns-is-invalid label { color: var(--error) !important; }
    .ns-is-invalid ::ng-deep .ns-input,
    .ns-is-invalid ::ng-deep .p-textarea .p-inputtext,
    .ns-is-invalid ::ng-deep .p-select .p-dropdown-label {
      border-color: var(--error) !important;
      background-color: var(--error-bg) !important;
    }

    /* Summary Card Styling */
    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px 0; }
    .ns-summary-list { display: flex; flex-direction: column; gap: 14px; }
    .ns-summary-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; gap: 16px; }
    .ns-summary-item .label { color: var(--text-muted, #64748b); font-weight: 500; white-space: nowrap; }
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--text-main, #0f172a); }
    .ns-summary-divider { height: 1px; background-color: var(--border, #e2e8f0); margin: 20px 0; }
    .ns-summary-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }

    .ns-btn-submit {
      width: 100%; background: #3b82f6; color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .ns-btn-submit:hover:not(:disabled) { background: #2563eb; }
    .ns-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .ns-btn-cancel { width: 100%; background: transparent; border: none; color: var(--tcc-text-muted, #64748b); font-size: 13px; cursor: pointer; text-align: center; }
    .ns-btn-cancel:hover { color: var(--tcc-text-main, #0f172a); }
  `]
})
export class EditarCliente implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;

  // Para armazenar o cliente sendo editado
  clienteEmail!: string;

  tiposCliente = [
    { label: 'Pessoa Física', value: 'fisica' },
    { label: 'Pessoa Jurídica', value: 'juridica' }
  ];

  statusOptions = [
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' },
    { label: 'Pendente', value: 'pendente' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      empresa: [''],
      local: [''],
      avaliacao: [0, [Validators.min(0), Validators.max(5)]],
      servicosAtivos: [0, Validators.min(0)],
      servicosConcluidos: [0, Validators.min(0)],
      tipoCliente: [null],
      status: [null]
    });

    // Get client email from route parameters
    this.route.paramMap.subscribe(params => {
      this.clienteEmail = params.get('email') || '';
      if (this.clienteEmail) {
        this.carregarClienteParaEdicao(this.clienteEmail);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/painel/clientes']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  carregarClienteParaEdicao(email: string): void {
    this.clienteService.getClienteByEmail(email).subscribe({
      next: (cliente: Cliente) => {
        // Preencher o formulário com os dados do cliente
        this.form.patchValue({
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          empresa: cliente.empresa,
          local: cliente.local,
          avaliacao: cliente.avaliacao,
          servicosAtivos: cliente.servicosAtivos,
          servicosConcluidos: cliente.servicosConcluidos,
          tipoCliente: this.tiposCliente.find(t => t.value === cliente.tipoCliente) || null,
          status: this.statusOptions.find(s => s.value === cliente.status) || null
        });
      },
      error: (err) => {
        console.error('Erro ao carregar cliente para edição', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados do cliente para edição'
        });
        // Redirecionar para a lista em caso de erro
        setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
      }
    });
  }

  atualizarCliente(): void {
    if (this.form.valid) {
      // Map form values to Cliente interface
      const formValue = this.form.value;

      const cliente: Cliente = {
        email: this.clienteEmail, // Mantemos o email original (usado como ID)
        nome: formValue.nome,
        empresa: formValue.empresa,
        avaliacao: formValue.avaliacao,
        telefone: formValue.telefone,
        local: formValue.local,
        servicosAtivos: formValue.servicosAtivos,
        servicosConcluidos: formValue.servicosConcluidos,
        tipoCliente: formValue.tipoCliente ? formValue.tipoCliente.value : null,
        status: formValue.status ? formValue.status.value : null
      };

      // Call the service to update the cliente
      this.clienteService.updateCliente(cliente).subscribe({
        next: (response) => {
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente atualizado com sucesso!'
          });
          // Navigate to clientes list page
          setTimeout(() => this.router.navigate(['/painel/clientes']), 1000);
        },
        error: (err) => {
          // Log error for debugging (acceptable use of console.error)
          console.error('Erro ao atualizar cliente', err);
          // Show error message to user
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao atualizar o cliente. Por favor, tente novamente.'
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }
}