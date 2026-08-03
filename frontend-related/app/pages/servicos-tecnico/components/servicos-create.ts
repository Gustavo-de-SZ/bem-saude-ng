import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Imports do PrimeNG (v18+)
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { take } from 'rxjs/operators';

// Models e Services
import { Servico } from '../../../models/servico';
import { ServicoService } from '../../../services/servico.service';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { Equipamento } from '../../../models/equipamento';
import { EquipamentoService } from '../../../services/equipamento.service';
import { FinanceiroService } from '../../../services/financeiro.service';

@Component({
  selector: 'app-novo-servico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AutoCompleteModule,
    DatePickerModule,
    DatePickerModule,
    ToastModule,
    InputNumberModule
  ],
  
  template: `
    <div class="ns-page-container">
      <header class="ns-page-header">
        <a routerLink="/painel/servicos" class="ns-back-btn">
          <i class="pi pi-chevron-left"></i>
        </a>
        <div>
          <h1>Novo Serviço</h1>
          <p>Registre um novo serviço para um cliente</p>
        </div>
      </header>

      <div class="ns-grid-layout" [formGroup]="form">

        <main class="ns-form-column">

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-file-edit text-primary"></i> Informação do Serviço
            </h2>

            <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('titulo')">
              <label for="titulo">Título do serviço *</label>
              <input
                id="titulo"
                type="text"
                formControlName="titulo"
                class="ns-input"
                placeholder="Ex: Formatação e reinstalação do Windows"
              />
            </div>

            <div class="ns-form-group">
              <label>Categoria *</label>
              <div class="ns-category-grid">
                @for (cat of categorias; track cat.id) {
                  <button
                    type="button"
                    class="ns-category-card"
                    [class.ns-active]="form.get('categoria')?.value === cat.id"
                    (click)="selecionarCategoria(cat.id)"
                  >
                    <i [class]="cat.icon"></i>
                    <span>{{ cat.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div class="ns-form-group">
              <label for="descricao">Descrição</label>
              <textarea
                id="descricao"
                formControlName="descricao"
                class="ns-input ns-textarea"
                rows="4"
                placeholder="Descreva o serviço a ser realizado, problema identificado..."
              ></textarea>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-user text-primary"></i> Cliente
            </h2>

            <div class="ns-form-group mb-0" [class.ns-is-invalid]="isInvalid('cliente')">
              <div class="ns-input-icon-wrapper">
                <i class="pi pi-search ns-icon-left"></i>
                <p-autoComplete
                    formControlName="cliente"
                    [suggestions]="clientesFiltrados"
                    (completeMethod)="filtrarCliente($event)"
                    (onSelect)="aoSelecionarCliente($event)"
                    optionLabel="nome_exibicao"
                    placeholder="Buscar cliente por nome ou empresa..."
                    [forceSelection]="true"
                    appendTo="body"
                    class="ns-autocomplete"
                    inputStyleClass="ns-has-icon-left">
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
              </div>
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-box text-primary"></i> Equipamento
            </h2>

            <div class="ns-form-group">
              <label>Equipamento Vinculado</label>
              <div style="display: flex; gap: 8px;">

                <select
                  formControlName="equipamentoId"
                  class="ns-input"
                  style="flex: 1;"
                  >
                  <option value="">Selecione um equipamento...</option>
                  @for (eqp of equipamentosDoCliente; track trackByEquipamento($index, eqp)) {
                    <option [value]="eqp.id">
                      {{ eqp.tipo }} - {{ eqp.marca }} {{ eqp.modelo }} (S/N: {{ eqp.numeroSerie || 'N/A' }})
                    </option>
                  }
                </select>

                <button
                  type="button"
                  class="tcc-btn-outline"
                  [disabled]="!form.get('cliente')?.value"
                  (click)="mostrandoModalNovoEquipamento = true">
                  <i class="pi pi-plus"></i> Novo
                </button>
              </div>
              @if (!form.get('cliente')?.value) {
                <small style="color: var(--tcc-text-muted, #64748b); margin-top: 4px; display: block;">
                  Selecione um cliente primeiro para carregar o inventário.
                </small>
              }
            </div>
          </section>

          <section class="ns-card">
            <h2 class="ns-card-title">
              <i class="pi pi-calendar text-primary"></i> Agendamento e Valor
            </h2>

            <div class="ns-form-row">
              <div class="ns-form-group" [class.ns-is-invalid]="isInvalid('data')">
                <label>Data *</label>
                <p-datePicker
                  formControlName="data"
                  dateFormat="dd/mm/yy"
                  placeholder="dd/mm/yyyy"
                  [showIcon]="true"
                  iconDisplay="input"
                  appendTo="body"
                  class="ns-datepicker"
                ></p-datePicker>
              </div>

              <div class="ns-form-group">
                <label for="duracao">Duração estimada (h:m)</label>
                <div class="ns-input-icon-wrapper">
                  <i class="pi pi-clock ns-icon-left"></i>
                  <input
                    id="duracao"
                    type="time"
                    formControlName="duracao"
                    class="ns-input ns-has-icon-left"
                    placeholder="Ex: 02:30"
                    
                  />
                </div>
              </div>

              <div class="ns-form-group">
                <label for="valor">Valor (R$)</label>
                <div class="ns-input-icon-wrapper">
                  <input
                    id="valor"
                    type="number"
                    step="0.01"
                    formControlName="valor"
                    class="ns-input ns-has-icon-left"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside class="ns-summary-column">
          <div class="ns-card ns-summary-card">
            <h3>Resumo</h3>

            <div class="ns-summary-list">
              <div class="ns-summary-item">
                <span class="label">Serviço</span>
                <span class="value">{{ form.get('titulo')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Categoria</span>
                <span class="value">{{ getCategoriaLabel() }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Cliente</span>
                <span class="value">{{ form.get('cliente')?.value?.nome || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Data</span>
                <span class="value">{{ formatarDataExibicao(form.get('data')?.value) }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Duração</span>
                <span class="value">{{ form.get('duracao')?.value || '—' }}</span>
              </div>
              <div class="ns-summary-item">
                <span class="label">Valor</span>
                <span class="value">{{ form.get('valor')?.value ? 'R$ ' + form.get('valor')?.value : '—' }}</span>
              </div>
            </div>

            <div class="ns-summary-status">
              <span>Status inicial</span>
              <span class="ns-badge-pending">Pendente</span>
            </div>

            <button type="button" class="ns-btn-submit" [disabled]="form.invalid" (click)="salvarServico()">
              Criar Serviço
            </button>
            <button type="button" routerLink="/painel/servicos" class="ns-btn-cancel">
              Cancelar
            </button>
          </div>
        </aside>

      </div>
    </div>

    <!-- Modal Novo Equipamento -->
    <div class="tcc-modal-overlay" *ngIf="mostrandoModalNovoEquipamento" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
      <div class="tcc-modal" style="background: white; border-radius: 12px; width: 100%; max-width: 500px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" (click)="$event.stopPropagation()">
        <div class="tcc-modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 600;"><i class="pi pi-box"></i> Novo Equipamento</h3>
          <button class="tcc-close-btn" style="background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: #64748b;" (click)="mostrandoModalNovoEquipamento = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <form [formGroup]="equipamentoForm" (ngSubmit)="salvarNovoEquipamento()">
          <div class="tcc-modal-body" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="tcc-form-group">
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 4px;">Tipo de Equipamento</label>
              <input type="text" formControlName="tipo" class="tcc-input" placeholder="Ex: Ar Condicionado, Computador" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
            </div>
            
            <div class="tcc-form-row" style="display: flex; gap: 16px;">
              <div class="tcc-form-group" style="flex: 1;">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 4px;">Marca</label>
                <input type="text" formControlName="marca" class="tcc-input" placeholder="Ex: Samsung, Dell" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
              </div>
              <div class="tcc-form-group" style="flex: 1;">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 4px;">Modelo</label>
                <input type="text" formControlName="modelo" class="tcc-input" placeholder="Ex: Split 12000 BTUs" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
              </div>
            </div>
            
            <div class="tcc-form-group">
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 4px;">Número de Série</label>
              <input type="text" formControlName="numeroSerie" class="tcc-input" placeholder="Ex: SN123456789" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
            </div>
            
            <div class="tcc-form-group">
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 4px;">Observações</label>
              <textarea formControlName="observacoes" class="tcc-input" rows="3" placeholder="Detalhes adicionais do equipamento" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;"></textarea>
            </div>
          </div>
          
          <div class="tcc-modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <button type="button" class="tcc-btn-secondary" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;" (click)="mostrandoModalNovoEquipamento = false">Cancelar</button>
            <button type="submit" class="tcc-btn-primary" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;" [disabled]="equipamentoForm.invalid">
              <i class="pi pi-save"></i> Salvar
            </button>
          </div>
        </form>
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
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    ::ng-deep .ns-input,
    ::ng-deep .ns-autocomplete input,
    ::ng-deep .ns-autocomplete .p-autocomplete-input,
    ::ng-deep .ns-datepicker input,
    ::ng-deep .ns-datepicker .p-inputtext {
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
    ::ng-deep .ns-datepicker .p-inputtext::placeholder {
      color: var(--tcc-text-muted, #94a3b8) !important;
      opacity: 0.7;
    }

    ::ng-deep .ns-input:focus,
    ::ng-deep .ns-autocomplete input:focus,
    ::ng-deep .ns-autocomplete .p-autocomplete-input:focus,
    ::ng-deep .ns-datepicker input:focus,
    ::ng-deep .ns-datepicker .p-inputtext:focus {
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

    /* Força o ícone nativo do datepicker a herdar a cor correta */
    ::ng-deep .ns-datepicker .p-datepicker-dropdown-icon,
    ::ng-deep .ns-datepicker .p-datepicker-input-icon {
      color: var(--tcc-text-muted) !important;
    }

    .ns-category-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
    }

    .ns-category-card {
      background: var(--tcc-surface, #ffffff);
      border: 1px solid var(--tcc-border, #e2e8f0);
      border-radius: 8px;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--tcc-text-main, #0f172a);
      transition: all 0.2s;
    }

    .ns-category-card i {
      font-size: 18px;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-category-card span { font-size: 12px; font-weight: 500; }

    .ns-category-card:hover {
      background: var(--tcc-surface-hover, #f1f5f9);
      border-color: var(--tcc-text-muted, #94a3b8);
    }

    .ns-category-card.ns-active {
      background: rgba(59, 130, 246, 0.15) !important;
      border-color: #3b82f6 !important;
      color: #3b82f6 !important;
    }

    .ns-category-card.ns-active i { color: #3b82f6 !important; }


    .ns-summary-column { position: sticky; top: 24px; }
    .ns-summary-card h3 { font-size: 16px; font-weight: 600; margin: 0 0 20px 0; }

    .ns-summary-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      padding-bottom: 20px;
    }

    .ns-summary-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 13px; }
    .ns-summary-item .label { color: var(--tcc-text-muted, #64748b); }
    .ns-summary-item .value { font-weight: 500; text-align: right; color: var(--tcc-text-main, #0f172a); }

    .ns-summary-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      margin-bottom: 24px;
      color: var(--tcc-text-muted, #64748b);
    }

    .ns-badge-pending {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .ns-btn-submit {
      width: 100%; background: #3b82f6; color: #ffffff; border: none; padding: 12px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;
    }
    .ns-btn-submit:hover:not(:disabled) { background: #2563eb; }
    .ns-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .ns-btn-cancel { width: 100%; background: transparent; border: none; color: var(--tcc-text-muted, #64748b); font-size: 13px; cursor: pointer; text-align: center; }
    .ns-btn-cancel:hover { color: var(--tcc-text-main, #0f172a); }


    .ns-is-invalid label { color: #ef4444 !important; }
    .ns-is-invalid ::ng-deep .ns-input,
    .ns-is-invalid ::ng-deep .p-autocomplete-input,
    .ns-is-invalid ::ng-deep .p-inputtext {
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
      color: var(--tcc-text-muted, #64748b);
    }
    .ns-cliente-info { display: flex; flex-direction: column; }
    .ns-cliente-nome { font-size: 14px; font-weight: 500; color: var(--text-main, #0f172a); }
    .ns-cliente-empresa { font-size: 11px; color: var(--tcc-text-muted, #64748b); }
  `]
})
export class NovoServico implements OnInit {
  private fb = inject(FormBuilder);
  private servicoService = inject(ServicoService);
  private clienteService = inject(ClienteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private equipamentoService = inject(EquipamentoService);
  private financeiroService = inject(FinanceiroService);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  clientes: Cliente[] = [];
  clientesFiltrados: any[] = [];

  // Equipamento properties
  equipamentosDoCliente: Equipamento[] = [];
  mostrandoModalNovoEquipamento = false;
  equipamentoForm!: FormGroup;

  categorias = [
    { id: 'redes', label: 'Redes', icon: 'pi pi-wifi' },
    { id: 'hardware', label: 'Hardware', icon: 'pi pi-database' },
    { id: 'software', label: 'Software', icon: 'pi pi-desktop' },
    { id: 'seguranca', label: 'Segurança', icon: 'pi pi-shield' },
    { id: 'impressoras', label: 'Impressoras', icon: 'pi pi-print' },
    { id: 'outros', label: 'Outros', icon: 'pi pi-wrench' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.initEquipamentoForm();

    // Load clientes first, then handle query params
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes.map(cliente => {
          const nomeParaExibicao = (cliente as any).nome_completo
            || cliente.nome
            || '';
          return {
            ...cliente,
            nome_exibicao: nomeParaExibicao
          };
        });
        this.handleQueryParams();
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes para autocompletar'
        });
        this.handleQueryParams();
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(4)]],
      categoria: ['redes', Validators.required],
      descricao: [''],
      cliente: [null, Validators.required],
      data: [new Date(), Validators.required],
      duracao: [''],
      valor: [''],
      equipamentoId: [null]
    });
  }

  private initEquipamentoForm(): void {
    this.equipamentoForm = this.fb.group({
      tipo: ['Notebook', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      numeroSerie: [''],
      observacoes: ['']
    });
  }

  private handleQueryParams(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['fromAgendamento']) {
        this.messageService.add({
          severity: 'info',
          summary: 'Agendamento Convertido',
          detail: 'Preencha os detalhes finais (como equipamento e valor) para registrar o serviço.'
        });

        this.form.patchValue({
          titulo: params['titulo'] || '',
        });

        if (params['cliente'] && this.clientes.length > 0) {
          const clientName = params['cliente'];
          const foundClient = this.clientes.find(c => c.nome === clientName);
          if (foundClient) {
            this.form.patchValue({
              cliente: foundClient
            });
            // Trigger the client selection to load equipment
            this.aoSelecionarCliente({ value: foundClient });
          }
        }
      }
    });
  }

  // Rest of the methods remain the same...
  salvarNovoEquipamento(): void {
    if (this.equipamentoForm.valid) {
      const clienteId = this.form.get('cliente')?.value?.id;
      if (!clienteId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Selecione um cliente antes de cadastrar um equipamento.'
        });
        return;
      }

      const equipamento: Equipamento = {
        clienteId: clienteId,
        tipo: this.equipamentoForm.get('tipo')?.value,
        marca: this.equipamentoForm.get('marca')?.value,
        modelo: this.equipamentoForm.get('modelo')?.value,
        numeroSerie: this.equipamentoForm.get('numeroSerie')?.value,
        observacoes: this.equipamentoForm.get('observacoes')?.value
      };

      this.equipamentoService.addEquipamento(equipamento, clienteId).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Equipamento cadastrado com sucesso!'
          });
          this.mostrandoModalNovoEquipamento = false;
          this.equipamentoForm.reset({
            tipo: 'Notebook'
          });

          // Reload equipment list for the selected client
          if (clienteId) {
            this.equipamentoService.getEquipamentosPorCliente(clienteId)
              .subscribe({
                next: (equipamentos) => this.equipamentosDoCliente = equipamentos,
                error: (err) => console.error('Erro ao recarregar equipamentos', err)
              });
          }
        },
        error: (err) => {
          console.error('Erro ao salvar equipamento', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o equipamento. Por favor, tente novamente.'
          });
        }
      });
    } else {
      this.equipamentoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  selecionarCategoria(id: string): void {
    this.form.get('categoria')?.setValue(id);
  }

  getCategoriaLabel(): string {
    const currentId = this.form.get('categoria')?.value;
    const cat = this.categorias.find(c => c.id === currentId);
    return cat ? cat.label : '—';
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

    let str = String(data);
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
        this.clientes = clientes.map(cliente => {
          // Use nome_completo if available, otherwise fall back to nome
          const nomeParaExibicao = (cliente as any).nome_completo
            || cliente.nome
            || '';
          return {
            ...cliente,
            nome_exibicao: nomeParaExibicao
          };
        });
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

    // Filtra pelo nome_exibicao (mesmo campo usado para exibição)
    this.clientesFiltrados = this.clientes.filter(c =>
      (c as any).nome_exibicao.toLowerCase().includes(query)
    );
  }

  formatarDuracao(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    }

    event.target.value = value;
    this.form.get('duracao')?.setValue(value);
  }

  salvarServico(): void {
    if (this.form.valid) {
      // Map form values to Servico interface
      const formValue = this.form.value;

      // Map category ID to the exact string expected by the backend
      const categoriaMap = {
        redes: 'Redes',
        hardware: 'Hardware',
        software: 'Software',
        seguranca: 'Segurança',
        impressoras: 'Impressoras',
        outros: 'Outros'
      } as const;

      // Map category ID to icon
      const iconeMap = {
        redes: 'pi pi-wifi',
        hardware: 'pi pi-database',
        software: 'pi pi-desktop',
        seguranca: 'pi pi-shield',
        impressoras: 'pi pi-print',
        outros: 'pi pi-wrench'
      } as const;

      // Format date as YYYY-MM-DD (ISO format) for the API
      const dataSelecionada = formValue.data;
      const dataFormatada = dataSelecionada instanceof Date
        ? dataSelecionada.toISOString().split('T')[0]
        : String(dataSelecionada);

      const categoriaValue = categoriaMap[formValue.categoria as keyof typeof categoriaMap];

      // Include equipment ID if selected
      const equipamentoId = formValue.equipamentoId || null;

      const servico: Servico = {
        icone: iconeMap[formValue.categoria as keyof typeof iconeMap] || 'pi pi-wrench', // Map to icon
        categoria: categoriaValue, // Properly typed
        titulo: formValue.titulo,
        status: 'Pendente', // Default status for new services
        cliente: formValue.cliente?.nome || '', // Safe access to client name
        data: dataFormatada,
        duracao: formValue.duracao || '',
        valor: formValue.valor || '',
        descricao: formValue.descricao || '',
        // Include equipment ID if selected
        equipamentoId: formValue.equipamentoId || undefined
      };

      // Call the service to save the service
      this.servicoService.addServico(servico).subscribe({
        next: (response) => {
          // Add transaction to financeiro
          const transacao = {
            titulo: `Pagamento: ${servico.titulo}`,
            cliente: servico.cliente,
            data: servico.data,
            valor: parseFloat(servico.valor.toString()) || 0,
            status: servico.status === 'Concluído' ? 'Pago' as const : 'Pendente' as const
          };
          this.financeiroService.addTransacao(transacao).subscribe({
            next: () => console.log('Transação registrada no financeiro'),
            error: (err) => console.error('Erro ao registrar transação', err)
          });

          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Serviço cadastrado com sucesso!'
          });
          // Reset form
          this.form.reset();
          // Set default values if needed (like category and date)
          this.form.patchValue({
            categoria: 'redes',
            data: new Date()
          });
          // Navigate to services list page
          setTimeout(() => this.router.navigate(['/painel/servicos']), 1000);
        },
        error: (err) => {
          // Log error for debugging (acceptable use of console.error)
          console.error('Erro ao salvar serviço', err);
          // Show error message to user
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o serviço. Por favor, tente novamente.'
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

  // Helper method to get icon based on category
  private getCategoriaIcon(): string {
    const categoriaId = this.form.get('categoria')?.value;
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.icon : 'pi pi-wrench'; // Default to wrench icon
  }

  /**
   * Handles client selection from autocomplete
   * @param event The select event from p-autoComplete
   */
  aoSelecionarCliente(event: any): void {
    const clienteSelecionado = event.value;
    if (clienteSelecionado && clienteSelecionado.id) {
      this.equipamentoService.getEquipamentosPorCliente(clienteSelecionado.id)
        .subscribe({
          next: (equipamentos) => this.equipamentosDoCliente = equipamentos,
          error: (err) => console.error('Erro ao buscar equipamentos', err)
        });
    } else {
      this.equipamentosDoCliente = [];
    }
  }

  /**
   * Track function for equipment items to handle cases where id might be empty/null
   * @param index The index of the item
   * @param item The equipment item
   * @returns A unique identifier for tracking
   */
  trackByEquipamento(index: number, item: Equipamento): any {
    // Prefer id if available, otherwise use index to ensure uniqueness
    return item.id || index;
  }
}