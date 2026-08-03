import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Imports do PrimeNG (v18+)
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import { Agendamento } from '../../../models/agendamento';
import { AgendaService } from '../../../services/agenda.service';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-editar-agendamento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AutoCompleteModule,
    DatePickerModule,
    SelectModule,
    ToastModule
  ],
  
  template: `
    <div class="ns-page-container">
    
      <header class="ns-page-header">
        <a routerLink="/painel/agenda" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Editar Agendamento</h1>
          <p>Atualize as informações do agendamento</p>
        </div>
      </header>

      <div class="ns-grid-layout">
        <main class="ns-form-column">
          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-calendar-plus text-primary"></i> Informações do Agendamento
            </h2>

            <form [formGroup]="form" (ngSubmit)="atualizarAgendamento()">

                <div class="ns-form-row">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('titulo')">
                    <label>Título *</label>
                    <input type="text" formControlName="titulo" class="ns-input" placeholder="Digite o título do agendamento">
                    <div *ngIf="isInvalid('titulo')" class="ns-error-message">
                      O título é obrigatório e deve ter pelo menos 4 caracteres
                    </div>
                  </div>

                  <div class="ns-form-group">
                    <label>Tipo *</label>
                    <p-select formControlName="tipo" [options]="tipos" optionLabel="label" placeholder="Selecione o tipo" class="ns-select"></p-select>
                    <div *ngIf="isInvalid('tipo')" class="ns-error-message">
                      O tipo é obrigatório
                    </div>
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('cliente')">
                    <label>Cliente *</label>
                    <p-autoComplete
                      formControlName="cliente"
                      [suggestions]="clientesFiltrados"
                      (completeMethod)="filtrarCliente($event)"
                      field="nome_exibicao"
                      placeholder="Digite para buscar um cliente..."
                      [dropdown]="true"
                      [minLength]="1"
                      appendTo="body"
                      class="ns-autocomplete"
                      inputStyleClass="ns-has-icon-left"
                    >
                      <ng-template let-cliente pTemplate="item">
                        <div class="ns-cliente-suggestion">
                          <div class="ns-cliente-avatar"><i class="pi pi-user"></i></div>
                          <div class="ns-cliente-info">
                            <span class="cliente-nome">{{ cliente.nome_completo || cliente.nome || 'Sem nome' }}</span>
                            <span class="cliente-empresa">{{ cliente.empresa || 'Sem empresa' }}</span>
                          </div>
                        </div>
                      </ng-template>
                    </p-autoComplete>
                    <div *ngIf="isInvalid('cliente')" class="ns-error-message">
                      Seleção de cliente é obrigatória
                    </div>
                  </div>

                  <div class="ns-form-group">
                    <label>Data *</label>
                    <p-datePicker
                      formControlName="data"
                      dateFormat="dd/mm/yy"
                      placeholder="dd/mm/aa"
                      class="ns-datepicker"
                    ></p-datePicker>
                    <div *ngIf="isInvalid('data')" class="ns-error-message">
                      A data é obrigatória
                    </div>
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group">
                    <label>Hora *</label>
                    <input type="time" formControlName="hora" class="ns-input" placeholder="HH:MM">
                    <div *ngIf="isInvalid('hora')" class="ns-error-message">
                      A hora é obrigatória
                    </div>
                  </div>

                  <div class="ns-form-group">
                    <label>Duração</label>
                    <input type="text" formControlName="duracao" class="ns-input" placeholder="Ex: 2h">
                  </div>
                </div>

                <div class="ns-form-row">
                  <div class="ns-form-group">
                    <label>Status</label>
                    <p-select formControlName="status" [options]="statusOptions" optionLabel="label" placeholder="Selecione o status" class="ns-select"></p-select>
                  </div>
                </div>

              </form>
            </section>

          </main>

          <aside class="ns-summary-column">
            <div class="ns-card ns-summary-card">
              <h3>Resumo do Agendamento</h3>

              <div class="ns-summary-list">
                <div class="ns-summary-item">
                  <span class="label">Título</span>
                  <span class="value ns-truncate" [title]="form.get('titulo')?.value">{{ form.get('titulo')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Tipo</span>
                  <span class="value">{{ form.get('tipo')?.value?.label || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Cliente</span>
                  <span class="value ns-truncate" [title]="form.get('cliente')?.value?.nome_exibicao">{{ form.get('cliente')?.value?.nome_exibicao || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Data</span>
                  <span class="value">{{ formatarDataExibicao(form.get('data')?.value) }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Hora</span>
                  <span class="value">{{ form.get('hora')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Duração</span>
                  <span class="value">{{ form.get('duracao')?.value || '—' }}</span>
                </div>
                <div class="ns-summary-item">
                  <span class="label">Status</span>
                  <span class="value">{{ form.get('status')?.value?.label || '—' }}</span>
                </div>
              </div>

              <div class="ns-summary-divider"></div>

              <div class="ns-summary-actions">
                <button type="button" class="ns-btn-submit" [disabled]="form.invalid" (click)="atualizarAgendamento()">
                  Atualizar Agendamento
                </button>
                <button type="button" routerLink="/painel/agenda" class="ns-btn-cancel">
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

    ::ng-deep .ns-input,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input,
    ::ng-deep .ns-datepicker input,
    ::ng-deep .ns-datepicker .p-inputtext,
    ::ng-deep .ns-select .p-inputtext {
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

    ::ng-deep .ns-input::placeholder,
    ::ng-deep .ns-autocomplete input::placeholder,
    ::ng-deep .ns-autocomplete .p-autocomplete-input::placeholder,
    ::ng-deep .ns-datepicker input::placeholder,
    ::ng-deep .ns-datepicker .p-inputtext::placeholder,
    ::ng-deep .ns-select .p-inputtext::placeholder {
      color: var(--tcc-text-muted, #94a3b8) !important;
      opacity: 0.7;
    }

    ::ng-deep .ns-input:focus,
    ::ng-deep .ns-autocomplete input:focus,
    ::ng-deep .ns-autocomplete .p-autocomplete-input:focus,
    ::ng-deep .ns-datepicker input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus,
    ::ng-deep .ns-select .p-inputtext:focus {
      border-color: #3b82f6 !important;
      outline: none !important;
      box-shadow: 0 0 0 1px #3b82f6 !important;
    }

    .ns-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .ns-input-icon-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .ns-icon-left, .ns-prefix-left {
      position: absolute;
      left: 14px;
      color: var(--tcc-text-muted, #64748b);
      z-index: 2;
      pointer-events: none;
    }

    .ns-prefix-left {
      font-size: 14px;
    }

    ::ng-deep .ns-has-icon-left,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input {
      padding-left: 38px !important;
    }
    ::ng-deep .ns-has-prefix-left { padding-left: 38px !important; }
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

    /* P-dropdown styling */
    ::ng-deep .p-dropdown {
      width: 100% !important;
    }

    ::ng-deep .p-dropdown .p-dropdown-label {
      padding: 10px 14px;
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a) !important;
      background-color: var(--tcc-surface, #ffffff) !important;
      border: 1px solid var(--tcc-border, #e2e8f0) !important;
      border-radius: 8px;
    }

    ::ng-deep .p-dropdown .p-dropdown-trigger {
      border-left: 1px solid var(--tcc-border, #e2e8f0);
    }

    ::ng-deep .p-dropdown-panel {
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      box-shadow: var(--tcc-shadow, 0 1px 3px rgba(0,0,0,0.1));
    }

    ::ng-deep .p-dropdown-item {
      padding: 8px 14px;
      font-size: 14px;
      color: var(--tcc-text-main, #0f172a);
    }

    ::ng-deep .p-dropdown-item:hover {
      background-color: var(--tcc-surface-hover, #f1f5f9);
    }

    ::ng-deep .p-dropdown-item.p-highlight {
      background-color: var(--primary-bg, #eff6ff);
      color: var(--tcc-text-main, #0f172a);
    }

    .ns-is-invalid label { color: #ef4444 !important; }
    .ns-is-invalid ::ng-deep .ns-input,
    .ns-is-invalid ::ng-deep .p-autocomplete-input,
    .ns-is-invalid ::ng-deep .p-inputtext,
    .ns-is-invalid ::ng-deep .ns-select .p-inputtext {
      border-color: #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.05) !important;
    }


    /* Fundo do painel do Datepicker e do Autocomplete */
    ::ng-deep body.tp-dark-theme .p-datepicker-panel,
    ::ng-deep body.tp-dark-theme .p-autocomplete-overlay,
    ::ng-deep body.tp-dark-theme .p-autocomplete-panel {
      background-color: var(--bg-card, #131c2c) !important;
      border: 1px solid var(--border, #223047) !important;
      color: var(--text-main, #f1f5f9) !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
    }

    /* Cabeçalho e calendário interno do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-header {
      background-color: var(--bg-card, #131c2c) !important;
      border-bottom: 1px solid var(--border, #223047) !important;
      color: var(--text-main, #f1f5f9) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-title,
    ::ng-deep body.tp-dark-theme .p-datepicker-prev-icon,
    ::ng-deep body.tp-dark-theme .p-datepicker-next-icon {
      color: var(--text-main, #f1f5f9) !important;
    }

    /* Dias da semana e números do mês */
    ::ng-deep body.tp-dark-theme .p-datepicker-weekday {
      color: var(--text-muted, #94a3b8) !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day {
      color: var(--text-main, #f1f5f9) !important;
    }

    /* Efeitos de Hover e Seleção nos dias do Datepicker */
    ::ng-deep body.tp-dark-theme .p-datepicker-day:not(.p-datepicker-day-selected):hover {
      background-color: #1e293b !important;
    }

    ::ng-deep body.tp-dark-theme .p-datepicker-day-selected {
      background-color: var(--primary, #3b82f6) !important;
      color: #ffffff !important;
    }

    /* Itens de sugestão do AutoComplete no Modo Escuro */
    ::ng-deep body.tp-dark-theme .p-autocomplete-option {
      color: var(--text-main, #f1f5f9) !important;
      background: transparent !important;
    }

    ::ng-deep body.tp-dark-theme .p-autocomplete-option:hover,
    ::ng-deep body.tp-dark-theme .p-autocomplete-option.p-focus {
      background-color: #1e293b !important;
    }

    .ns-cliente-suggestion { display: flex; align-items: center; gap: 12px; padding: 2px 0; }
    .ns-cliente-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--primary-bg, #e2e8f0);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted, #64748b);
    }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--text-main, #0f172a); }
    .ns-cliente-empresa { font-size: 11px; color: var(--text-muted, #64748b); }

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
export class EditarAgendamento implements OnInit {
  private fb = inject(FormBuilder);
  private agendaService = inject(AgendaService);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  clientes: Cliente[] = [];
  clientesFiltrados: any[] = [];

  // Para armazenar o agendamento sendo editado
  agendamentoId!: string;
  originalAgendamento: Agendamento | null = null;

  tipos = [
    { label: 'Presencial', value: 'Presencial' },
    { label: 'Remoto', value: 'Remoto' }
  ];

  statusOptions = [
    { label: 'Confirmado', value: 'Confirmado' },
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Concluído', value: 'Concluído' },
    { label: 'Cancelado', value: 'Cancelado' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(4)]],
      tipo: [null, Validators.required],
      cliente: [null, Validators.required],
      data: [null, Validators.required],
      hora: ['', Validators.required],
      duracao: [''],
      status: [null]
    });

    // Load clientes for autocomplete
    this.carregarClientes();

    // Get agendamento ID from route parameters
    this.route.paramMap.subscribe(params => {
      this.agendamentoId = params.get('id') || '';
      if (this.agendamentoId) {
        this.carregarAgendamentoParaEdicao(this.agendamentoId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/painel/agenda']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
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

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar clientes para autocompletar'
          });
      }
    });
  }

  filtrarCliente(event: any): void {
    const query = event.query ? event.query.toLowerCase() : '';

    // Filter by nome_exibicao (same field used for display)
    this.clientesFiltrados = this.clientes.filter(c =>
      ((c as any).nome_exibicao || c.nome || '').toLowerCase().includes(query)
    );
  }

  carregarAgendamentoParaEdicao(id: string): void {
    this.agendaService.getAgendamentos().subscribe({
      next: (agendamentos: Agendamento[]) => {
        const agendamento = agendamentos.find(a => a.id === id);
        if (agendamento) {
          this.originalAgendamento = agendamento;
          // Convert mes and dia to a Date object for the date field
          let dataObj: Date | null = null;
          if (agendamento.dia) {
            if (agendamento.dia.includes('-')) {
              dataObj = new Date(agendamento.dia + 'T12:00:00');
            } else if (agendamento.mes) {
              let mesStr = agendamento.mes;
              if (mesStr.endsWith('.')) {
                mesStr = mesStr.slice(0, -1);
              }
              
              const ptToEn: Record<string, string> = {
                'janeiro': 'January', 'fevereiro': 'February', 'março': 'March', 'abril': 'April',
                'maio': 'May', 'junho': 'June', 'julho': 'July', 'agosto': 'August',
                'setembro': 'September', 'outubro': 'October', 'novembro': 'November', 'dezembro': 'December',
                'jan': 'Jan', 'fev': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'mai': 'May', 'jun': 'Jun',
                'jul': 'Jul', 'ago': 'Aug', 'set': 'Sep', 'out': 'Oct', 'nov': 'Nov', 'dez': 'Dec'
              };
              const enMonth = ptToEn[mesStr.toLowerCase()] || mesStr;
              dataObj = new Date(`${enMonth} ${agendamento.dia}, 2026`);
            }
          }

          this.form.patchValue({
            titulo: agendamento.titulo,
            tipo: this.tipos.find(t => t.value === agendamento.tipo) || null,
            cliente: this.clientes.find(c =>
              ((c as any).nome_exibicao || c.nome || '') === agendamento.cliente
            ) || null,
            data: dataObj,
            hora: agendamento.hora,
            duracao: agendamento.duracao,
            status: this.statusOptions.find(s => s.value === agendamento.status) || null
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Agendamento não encontrado'
          });
          // Redirect to list on error
          setTimeout(() => this.router.navigate(['/painel/agenda']), 1000);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar agendamento para edição', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados do agendamento para edição'
        });
        // Redirect to list on error
        setTimeout(() => this.router.navigate(['/painel/agenda']), 1000);
      }
    });
  }

  atualizarAgendamento(): void {
    if (this.form.valid) {
      // Map form values to Agendamento interface
      const formValue = this.form.value;

      // Extract month and day from the date field
      const data = formValue.data;
      const mes = data ? data.toLocaleString('default', { month: 'short' }) : '';
      const dia = data ? String(data.getDate()).padStart(2, '0') : '';

      const agendamento: Agendamento = {
        ...this.originalAgendamento,
        id: this.agendamentoId,
        titulo: formValue.titulo,
        tipo: formValue.tipo ? formValue.tipo.value : '',
        cliente: formValue.cliente ? (formValue.cliente as any).nome_exibicao || formValue.cliente.nome : '',
        empresa: this.originalAgendamento?.empresa || '',
        servico: this.originalAgendamento?.servico || '',
        mes: mes,
        dia: dia,
        hora: formValue.hora,
        duracao: formValue.duracao,
        status: formValue.status ? formValue.status.value : ''
      };

      // Call the service to update the agendamento
      this.agendaService.updateAgendamento(agendamento).subscribe({
        next: (response) => {
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Agendamento atualizado com sucesso!'
          });
          // Navigate to agendamentos list page
          setTimeout(() => this.router.navigate(['/painel/agenda']), 1000);
        },
        error: (err) => {
          // Log error for debugging (acceptable use of console.error)
          console.error('Erro ao atualizar agendamento', err);
          // Show error message to user
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao atualizar o agendamento. Por favor, tente novamente.'
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