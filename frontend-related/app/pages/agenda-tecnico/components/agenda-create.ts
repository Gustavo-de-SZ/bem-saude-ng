import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Modules (Apenas o essencial)
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { AgendaService } from '../../../services/agenda.service';
import { Agendamento } from '../../../models/agendamento';

interface TipoAtendimentoCard {
  label: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    AutoCompleteModule,
    DatePickerModule,
    ToastModule
  ],
  
  template: `
    <div class="ns-page-container">
      
     
      <header class="ns-page-header">
        <a routerLink="/painel/agenda" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Novo Agendamento</h1>
          <p>Preencha os dados para marcar um novo compromisso</p>
        </div>
      </header>

     
      <div class="ns-grid-layout">
     
        <main class="ns-form-column">
          <form [formGroup]="agendamentoForm">
            
         
            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-info-circle text-primary"></i> Informações Básicas
              </h2>
              
              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('titulo')">
                <label for="titulo">Título do Agendamento *</label>
                <input 
                  id="titulo" 
                  type="text" 
                  formControlName="titulo" 
                  class="ns-input" 
                  placeholder="Ex: Manutenção preventiva de servidores" 
                />
                @if (hasError('titulo', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Título é obrigatório</span>
                } @else if (hasError('titulo', 'minlength')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Mínimo de 3 caracteres</span>
                }
              </div>

              <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('cliente')">
                <label>Cliente vinculado *</label>
                <div class="ns-input-icon-wrapper">
                  <i class="pi pi-search ns-icon-left"></i>
                  <p-autoComplete
                    formControlName="cliente"
                    [suggestions]="clientesFiltrados"
                    (completeMethod)="filtrarCliente($event)"
                    optionLabel="nome_exibicao"
                    placeholder="Buscar cliente por nome..."
                    [forceSelection]="true"
                    appendTo="body"
                    class="ns-autocomplete"
                    inputStyleClass="ns-has-icon-left"> 
                      <ng-template let-cliente pTemplate="item">
                        <div class="ns-cliente-suggestion">
                          <div class="ns-cliente-avatar"><i class="pi pi-user"></i></div>
                          <div class="ns-cliente-info">
                            <span class="ns-cliente-nome">{{ cliente.nome_completo || cliente.nome }}</span>
                            <span class="ns-cliente-empresa">{{ cliente.empresa || 'Sem empresa' }}</span>
                          </div>
                        </div>
                      </ng-template>
                  </p-autoComplete>
                </div>
                @if (hasError('cliente', 'required')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Cliente é obrigatório</span>
                }
              </div>
            </section>

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-calendar-clock text-primary"></i> Horário e Data
              </h2>
              
              <div class="ns-form-row-3">
                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('data')">
                  <label for="data">Data *</label>
                  <p-datePicker
                    id="data"
                    formControlName="data"
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/yyyy"
                    [showIcon]="true"
                    iconDisplay="input"
                    appendTo="body"
                    class="ns-datepicker"
                  ></p-datePicker>
                  @if (hasError('data', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>

                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('hora')">
                  <label for="hora">Hora *</label>
                  <div class="ns-input-icon-wrapper">
                    <i class="pi pi-clock ns-icon-left"></i>
                    <input id="hora" type="text" formControlName="hora" class="ns-input ns-has-icon-left" placeholder="00:00" (input)="formatarHora($event)" />
                  </div>
                  @if (hasError('hora', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>

                <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('duracao')">
                  <label for="duracao">Duração Estimada (h:m) *</label>
                  <div class="ns-input-icon-wrapper">
                    <i class="pi pi-clock ns-icon-left"></i>
                    <input 
                      id="duracao" 
                      type="text" 
                      formControlName="duracao" 
                      class="ns-input ns-has-icon-left" 
                      placeholder="Ex: 01:30" 
                      (input)="formatarDuracao($event)"
                    />
                  </div>
                  @if (hasError('duracao', 'required')) {
                    <span class="ns-error-text"><i class="pi pi-info-circle"></i> Obrigatório</span>
                  }
                </div>
              </div>
            </section>

            <section class="ns-card">
              <h2 class="ns-card-title">
                <i class="pi pi-briefcase text-primary"></i> Detalhes do Atendimento
              </h2>
              
              <div class="ns-form-row-2">
                <div class="ns-form-group mb-0">
                  <label>Tipo de Atendimento *</label>
                  <div class="ns-category-grid">
                    @for (tipo of tiposAtendimento; track tipo.value) {
                      <button 
                        type="button" 
                        class="ns-category-card" 
                        [class.ns-active]="agendamentoForm.get('tipoAtendimento')?.value === tipo.value"
                        (click)="selecionarTipo(tipo.value)"
                      >
                        <i [class]="tipo.icon"></i>
                        <span>{{ tipo.label }}</span>
                      </button>
                    }
                  </div>
                </div>

                <div class="ns-form-group mb-0">
                  <label>Status inicial *</label>
                  <p-select 
                    formControlName="statusInicial"
                    [options]="statusInicialOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione..."
                    appendTo="body"
                    class="ns-select w-full"
                  ></p-select>
                </div>
              </div>
            </section>

          
            <section class="ns-card">
              <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('observacoes')">
                <label for="observacoes">Observações adicionais (opcional)</label>
                <textarea 
                  id="observacoes" 
                  formControlName="observacoes" 
                  rows="3" 
                  placeholder="Instruções de acesso, detalhes específicos, etc." 
                  class="ns-input ns-textarea"
                ></textarea>
                @if (hasError('observacoes', 'maxlength')) {
                  <span class="ns-error-text"><i class="pi pi-info-circle"></i> Máximo 255 caracteres</span>
                }
              </div>
            </section>

          </form>
        </main>

        <aside class="ns-summary-column">
          <div class="ns-card ns-summary-card">
            <h3>Resumo do Agendamento</h3>
            
            <div class="ns-summary-list">
              <div class="ns-summary-item">
                <span class="label">Título</span>
                <span class="value ns-truncate" [title]="agendamentoForm.get('titulo')?.value">
                  {{ agendamentoForm.get('titulo')?.value || '—' }}
                </span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Cliente</span>
                <span class="value ns-truncate" [title]="getNomeCliente()">{{ getNomeCliente() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Data</span>
                <span class="value">{{ formatarDataExibicao() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Horário</span>
                <span class="value">{{ agendamentoForm.get('hora')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Duração</span>
                <span class="value">{{ agendamentoForm.get('duracao')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Tipo</span>
                <span class="value">{{ agendamentoForm.get('tipoAtendimento')?.value || '—' }}</span>
              </div>
            </div>

            <div class="ns-summary-divider"></div>

            <div class="ns-summary-status">
              <span>Status inicial</span>
              <span class="ns-badge" 
                    [class.ns-badge-pending]="agendamentoForm.get('statusInicial')?.value === 'Pendente'"
                    [class.ns-badge-success]="agendamentoForm.get('statusInicial')?.value === 'Confirmado'">
                {{ agendamentoForm.get('statusInicial')?.value || 'Pendente' }}
              </span>
            </div>

            <div class="ns-summary-actions">
              <button type="button" class="ns-btn-submit" [disabled]="agendamentoForm.invalid" (click)="salvar()">
                Salvar Agendamento
              </button>
              <button type="button" class="ns-btn-cancel" (click)="cancelar()">
                Cancelar
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
    
  `,
  styles: [`
  
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

    /* Modifica o ícone padrão de calendários nativos em navegadores webkit para modo escuro */
    ::ng-deep body.tp-dark-theme input[type="date"]::-webkit-calendar-picker-indicator,
    ::ng-deep body.tp-dark-theme input[type="time"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
    }

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

    .ns-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .ns-form-group.mb-0 { margin-bottom: 0; }
    .ns-form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
    
    .ns-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ns-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .ns-form-row-2, .ns-form-row-3 { grid-template-columns: 1fr; } }

    /* Estilização central de inputs nativos e componentes PrimeNG */
    ::ng-deep .ns-input, 
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input,
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
    ::ng-deep .ns-select { padding: 0 !important; } /* O select tem o padding interno no label */
    ::ng-deep .ns-select .p-select-label { color: var(--text-main); padding: 10px 14px; font-family: inherit; font-size: 14px; }
    ::ng-deep .ns-select .p-select-dropdown { color: var(--text-muted); }

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-autocomplete input::placeholder,
    ::ng-deep .ns-autocomplete .p-autocomplete-input::placeholder,
    ::ng-deep .ns-datepicker .p-inputtext::placeholder {
      color: var(--text-muted) !important; opacity: 0.7;
    }
    
    ::ng-deep .ns-input:focus, 
    ::ng-deep .ns-autocomplete input:focus,
    ::ng-deep .ns-autocomplete .p-autocomplete-input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus,
    ::ng-deep .ns-select:not(.p-disabled).p-focus {
      border-color: var(--primary) !important; outline: none; box-shadow: 0 0 0 1px var(--primary) !important;
    }
    .ns-textarea { resize: vertical; min-height: 80px; }

    /* Wrappers de ícones dentro do input */
    .ns-input-icon-wrapper { position: relative; width: 100%; display: flex; align-items: center; }
    .ns-icon-left { position: absolute; left: 14px; color: var(--text-muted); z-index: 2; pointer-events: none; }
    ::ng-deep .ns-has-icon-left,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input {
      padding-left: 38px !important;
    }
    ::ng-deep .ns-autocomplete,
    ::ng-deep .ns-autocomplete .p-autocomplete {
      width: 100% !important;
    }
    ::ng-deep .ns-datepicker,
    ::ng-deep .ns-datepicker.p-datepicker {
      width: 100% !important;
      display: inline-flex !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .ns-category-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; height: 100%; }
    .ns-category-card {
      background: var(--bg-card);
      border: 1px solid var(--border-input);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.2s;
      font-family: inherit;
    }
    .ns-category-card i { font-size: 1.2rem; }
    .ns-category-card span { font-size: 14px; font-weight: 500; }
    .ns-category-card:hover {
      background: var(--bg-main);
      border-color: var(--text-muted);
    }
    .ns-category-card.ns-active {
      background: var(--primary-bg) !important;
      border-color: var(--primary) !important;
      color: var(--primary) !important;
    }

    .ns-error-text { color: var(--error); font-size: 12px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .ns-is-invalid label { color: var(--error) !important; }
    .ns-is-invalid ::ng-deep .ns-input, 
    .ns-is-invalid ::ng-deep .ns-autocomplete .p-autocomplete-input,
    .ns-is-invalid ::ng-deep .p-inputtext {
      border-color: var(--error) !important;
      background-color: var(--error-bg) !important;
    }

    /* Força o ícone do datepicker a herdar a cor correta */
    ::ng-deep .ns-datepicker .p-datepicker-dropdown-icon,
    ::ng-deep .ns-datepicker .p-datepicker-input-icon {
      color: var(--text-muted) !important;
    }

    /* Fundo do painel do Datepicker, Select e Autocomplete */
    ::ng-deep body.tp-dark-theme .p-datepicker-panel,
    ::ng-deep body.tp-dark-theme .p-autocomplete-overlay,
    ::ng-deep body.tp-dark-theme .p-autocomplete-panel,
    ::ng-deep body.tp-dark-theme .p-select-panel {
      background-color: var(--bg-card) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-main) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
    }

    /* Cabeçalho e calendário interno do Datepicker no Modo Escuro */
    ::ng-deep body.tp-dark-theme .p-datepicker-header {
      background-color: var(--bg-card) !important;
      border-bottom: 1px solid var(--border) !important;
      color: var(--text-main) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-title,
    ::ng-deep body.tp-dark-theme .p-datepicker-prev-icon,
    ::ng-deep body.tp-dark-theme .p-datepicker-next-icon {
      color: var(--text-main) !important;
    }

    /* Dias da semana e números do mês */
    ::ng-deep body.tp-dark-theme .p-datepicker-weekday {
      color: var(--text-muted) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day {
      color: var(--text-main) !important;
    }

    /* Efeitos de Hover e Seleção nos dias do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-day:not(.p-datepicker-day-selected):hover {
      background-color: #1e293b !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day-selected {
      background-color: var(--primary) !important;
      color: #ffffff !important;
    }

    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px 0; }
    
    .ns-summary-list { display: flex; flex-direction: column; gap: 14px; }
    .ns-summary-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; gap: 16px; }
    .ns-summary-item .label { color: var(--text-muted); font-weight: 500; white-space: nowrap; }
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--text-main); }
    .ns-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
    
    .ns-summary-divider { height: 1px; background-color: var(--border); margin: 20px 0; }
    
    .ns-summary-status { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-muted); }
    .ns-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .ns-badge-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .ns-badge-success { background: rgba(16, 185, 129, 0.15); color: #10b981; }

    .ns-summary-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    .ns-btn-submit {
      width: 100%; background: var(--primary); color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .ns-btn-submit:hover:not(:disabled) { background: #2563eb; }
    .ns-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .ns-btn-cancel { width: 100%; background: transparent; border: none; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; text-align: center; transition: color 0.2s; }
    .ns-btn-cancel:hover { color: var(--text-main); text-decoration: underline; }

  
    ::ng-deep body.tp-dark-theme .p-autocomplete-panel,
    ::ng-deep body.tp-dark-theme .p-select-panel {
      background-color: var(--bg-card) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-main) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
    }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option,
    ::ng-deep body.tp-dark-theme .p-select-option {
      color: var(--text-main) !important;
      background: transparent !important;
    }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option:hover,
    ::ng-deep body.tp-dark-theme .p-autocomplete-option.p-focus,
    ::ng-deep body.tp-dark-theme .p-select-option:hover,
    ::ng-deep body.tp-dark-theme .p-select-option.p-focus {
      background-color: var(--border) !important; /* Cor de hover suave para escuro */
    }

    /* Template suggestion autocomplete */
    .ns-cliente-suggestion { display: flex; align-items: center; gap: 12px; padding: 2px 0; }
    .ns-cliente-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--text-main); }
    .ns-cliente-empresa { font-size: 11px; color: var(--text-muted); }
  `]
})
export class NovoAgendamento implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly agendaService = inject(AgendaService);

  clientes: Cliente[] = [];
  clientesFiltrados: any[] = [];
  clientesLoading = false;

  tiposAtendimento: TipoAtendimentoCard[] = [
    { label: 'Presencial', icon: 'pi pi-building', value: 'Presencial' },
    { label: 'Remoto', icon: 'pi pi-desktop', value: 'Remoto' }
  ];

  statusInicialOptions = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Confirmado', value: 'Confirmado' }
  ];

  agendamentoForm = this.formBuilder.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    cliente: ['', Validators.required],
    data: ['', Validators.required],
    hora: ['', Validators.required],
    duracao: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    tipoAtendimento: ['Presencial', Validators.required],
    statusInicial: ['Pendente', Validators.required],
    observacoes: ['', Validators.maxLength(255)]
  });

  ngOnInit(): void {
    this.carregarClientes();
  }

  // Auxiliares de validação
  isInvalid(controlName: string): boolean {
    const control = this.agendamentoForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.agendamentoForm.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  carregarClientes(): void {
    this.clientesLoading = true;
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => ({
          ...cliente,
          nome_exibicao: `${(cliente as any).nome_completo || cliente.nome}`
        }));
        this.clientesLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.clientesLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar os clientes' });
      }
    });
  }

  filtrarCliente(event: any) {
    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c => 
      (c as any).nome_exibicao.toLowerCase().includes(query)
    );
  }

  formatarHora(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    }
    
    event.target.value = value;
    this.agendamentoForm.get('hora')?.setValue(value);
  }

  formatarDuracao(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    }
    
    event.target.value = value;
    this.agendamentoForm.get('duracao')?.setValue(value);
  }

  selecionarTipo(valor: string) {
    this.agendamentoForm.get('tipoAtendimento')?.setValue(valor);
  }

  getNomeCliente(): string {
    const cliente = this.agendamentoForm.get('cliente')?.value;
    if (!cliente) return '—';
    if (typeof cliente === 'object') {
      return (cliente as any).nome_exibicao || '—';
    }
    return String(cliente);
  }

  formatarDataExibicao(): string {
    const data = this.agendamentoForm.get('data')?.value;
    if (!data) return '—';
    
    if ((data as any) instanceof Date) {
      const dia = String((data as any).getDate()).padStart(2, '0');
      const mes = String((data as any).getMonth() + 1).padStart(2, '0');
      const ano = (data as any).getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    // Converte de yyyy-mm-dd para dd/mm/yyyy
    const partes = String(data).split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return String(data);
  }

  salvar() {
    if (this.agendamentoForm.valid) {
      const formData = this.agendamentoForm.getRawValue();

      // Extrai apenas o nome seguro vindo do Autocomplete (caso seja objeto)
      const nomeDoClienteStr = typeof formData.cliente === 'object' 
        ? (formData.cliente as any).nome 
        : formData.cliente;

      // Extract month and day from the selected date field
      const dataSelecionada = formData.data;
      let diaStr = '15';
      let mesStr = 'Julho';

      if ((dataSelecionada as any) instanceof Date) {
        diaStr = String((dataSelecionada as any).getDate()).padStart(2, '0');
        const meses = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        mesStr = meses[(dataSelecionada as any).getMonth()];
      } else if (dataSelecionada) {
        const partes = String(dataSelecionada).split('-');
        if (partes.length === 3) {
          diaStr = partes[2];
          const mNum = parseInt(partes[1], 10);
          const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          if (mNum >= 1 && mNum <= 12) {
            mesStr = meses[mNum - 1];
          }
        }
      }

      const agendamento: Agendamento = {
        dia: diaStr, 
        mes: mesStr,
        hora: formData.hora!,
        titulo: formData.titulo!,
        cliente: nomeDoClienteStr,
        duracao: formData.duracao!,
        tipo: formData.tipoAtendimento as ('Presencial' | 'Remoto'),
        status: formData.statusInicial as ('Confirmado' | 'Pendente' | 'Concluído' | 'Cancelado')
      };

      this.agendaService.addAgendamento(agendamento).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Show de bola!', detail: 'Agendamento cadastrado com sucesso' });
          this.agendamentoForm.reset();
          
          setTimeout(() => this.router.navigate(['/painel/agenda']), 1000);
        },
        error: (err) => {
          console.error('Erro ao salvar agendamento', err);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao cadastrar o agendamento' });
        }
      });
    } else {
      this.agendamentoForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Aviso', detail: 'Preencha todos os campos obrigatórios corretamente' });
    }
  }

  cancelar() {
    this.agendamentoForm.reset();
    this.router.navigate(['/painel/agenda']);
  }
}