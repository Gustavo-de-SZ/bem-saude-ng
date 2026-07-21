import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { take, switchMap, tap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PhoneMaskDirective } from '../../shared/directives/phone-mask.directive';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    ToastModule,
    ButtonModule,
    PhoneMaskDirective
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="cd-layout">

      <div class="cd-floating-controls">
        <button
          (click)="theme.toggle()"
          class="tcc-toggle-mode"
          aria-label="Alternar tema"
          id="btnToggleTheme"
        >
          <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button
          (click)="logout()"
          class="tcc-btn-outline cd-btn-logout"
          id="btnLogout"
        >
          <i class="pi pi-sign-out"></i>
          Sair
        </button>
      </div>

      <div class="cd-card">

        <div class="cd-header">
          <div class="cd-header-icon">
            <i class="pi pi-user-plus"></i>
          </div>
          <h1 class="cd-title">Conclua seu Cadastro</h1>
          <p class="cd-subtitle">
            Precisamos de mais algumas informações para personalizar sua experiência e liberar o acesso à plataforma.
          </p>
        </div>

        @if (!isRoleFixed()) {
          <div class="cd-section">
            <label class="cd-label cd-label-center">Como você deseja usar a plataforma?</label>
            <div class="cd-grid-2">

              <div
                (click)="setRole('cliente')"
                class="cd-role-card"
                [class.cd-role-active]="selectedRole === 'cliente'"
                id="cardCliente"
              >
                <div class="cd-role-icon cd-icon-blue">
                  <i class="pi pi-briefcase"></i>
                </div>
                <h3 class="cd-role-title">Cliente / Empresa</h3>
                <p class="cd-role-desc">
                  Preciso de suporte técnico rápido e soluções de TI para o meu negócio.
                </p>
              </div>

              <div
                (click)="setRole('tecnico')"
                class="cd-role-card"
                [class.cd-role-active]="selectedRole === 'tecnico'"
                id="cardTecnico"
              >
                <div class="cd-role-icon cd-icon-emerald">
                  <i class="pi pi-cog"></i>
                </div>
                <h3 class="cd-role-title">Profissional de TI</h3>
                <p class="cd-role-desc">
                  Quero oferecer meus serviços de TI, atender chamados e gerenciar clientes.
                </p>
              </div>

            </div>
          </div>
        } @else {
          <div class="cd-info-box">
            <i class="pi pi-info-circle"></i>
            <span>
              Seu tipo de perfil foi definido como <strong>{{ selectedRole === 'cliente' ? 'Cliente' : 'Profissional de TI' }}</strong> com base nas credenciais de acesso.
            </span>
          </div>
        }

        @if (selectedRole === 'cliente') {
          <form
            [formGroup]="clienteForm"
            (ngSubmit)="submitCliente()"
            class="cd-form"
            id="formCliente"
          >
            <div class="cd-grid-2">

              <div class="cd-field">
                <label for="cliNome" class="cd-label">Nome Completo</label>
                <input
                  id="cliNome"
                  formControlName="nome"
                  type="text"
                  placeholder="Seu nome"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('cliente', 'nome')"
                />
                @if (isFieldInvalid('cliente', 'nome')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Nome é obrigatório (mín. 3 letras)
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="cliEmail" class="cd-label">E-mail</label>
                <input
                  id="cliEmail"
                  formControlName="email"
                  type="email"
                  class="ns-input cd-input-disabled"
                  readonly
                />
              </div>

              <div class="cd-field">
                <label for="cliEmpresa" class="cd-label">Empresa / Negócio</label>
                <input
                  id="cliEmpresa"
                  formControlName="empresa"
                  type="text"
                  placeholder="Ex: Minha Empresa S/A"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('cliente', 'empresa')"
                />
                @if (isFieldInvalid('cliente', 'empresa')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Nome da empresa é obrigatório
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="cliTelefone" class="cd-label">Telefone</label>
                <input
                  id="cliTelefone"
                  formControlName="telefone"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('cliente', 'telefone')"
                  appPhoneMask
                />
                @if (isFieldInvalid('cliente', 'telefone')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i>
                    @if (clienteForm.get('telefone')?.hasError('required')) {
                      Telefone é obrigatório
                    } @else if (clienteForm.get('telefone')?.hasError('invalidPhone')) {
                      Formato inválido. Use (XX) 99999-9999
                    } @else if (clienteForm.get('telefone')?.hasError('invalidPhoneLength')) {
                      Telefone deve ter 10 ou 11 dígitos
                    } @else if (clienteForm.get('telefone')?.hasError('invalidMobileFormat')) {
                      Para celular, o terceiro dígito deve ser 9 (ex: (11) 99999-9999)
                    } @else if (clienteForm.get('telefone')?.hasError('invalidAreaCode')) {
                      DDD inválido. DDDS válidos: 11-99, exceto: 00,01,02,03,05,08,09,10
                    } @else {
                      Formato inválido. Use (XX) 99999-9999
                    }
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="cliLocal" class="cd-label">Localização</label>
                <input
                  id="cliLocal"
                  formControlName="local"
                  type="text"
                  placeholder="Ex: São Paulo - SP"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('cliente', 'local')"
                />
                @if (isFieldInvalid('cliente', 'local')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Localização é obrigatória
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="cliTipo" class="cd-label">Segmento da Empresa</label>
                <p-select
                  id="cliTipo"
                  formControlName="tipoCliente"
                  [options]="tipoClienteOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="ns-select ns-select-inner"
                ></p-select>
              </div>

            </div>

            <div class="cd-form-actions">
              <button
                type="submit"
                class="tcc-btn-main cd-btn-submit"
                [disabled]="loading"
                id="btnSubmitCliente"
              >
                @if (loading) {
                  <i class="pi pi-spin pi-spinner"></i>
                } @else {
                  <i class="pi pi-check"></i>
                }
                Concluir Registro
              </button>
            </div>
          </form>
        }

        @if (selectedRole === 'tecnico') {
          <form
            [formGroup]="tecnicoForm"
            (ngSubmit)="submitTecnico()"
            class="cd-form"
            id="formTecnico"
          >
            <div class="cd-grid-2">

              <div class="cd-field">
                <label for="tecNome" class="cd-label">Nome Completo</label>
                <input
                  id="tecNome"
                  formControlName="nome"
                  type="text"
                  placeholder="Seu nome"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('tecnico', 'nome')"
                />
                @if (isFieldInvalid('tecnico', 'nome')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Nome é obrigatório (mín. 3 letras)
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="tecEmail" class="cd-label">E-mail</label>
                <input
                  id="tecEmail"
                  formControlName="email"
                  type="email"
                  class="ns-input cd-input-disabled"
                  readonly
                />
              </div>

              <div class="cd-field">
                <label for="tecEspec" class="cd-label">Especialidade Principal</label>
                <p-select
                  id="tecEspec"
                  formControlName="especialidadePrincipal"
                  [options]="especialidadeOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="ns-select ns-select-inner"
                ></p-select>
              </div>

              <div class="cd-field">
                <label for="tecTelefone" class="cd-label">Telefone Celular</label>
                <input
                  id="tecTelefone"
                  formControlName="telefone"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('tecnico', 'telefone')"
                  appPhoneMask
                />
                @if (isFieldInvalid('tecnico', 'telefone')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i>
                    @if (tecnicoForm.get('telefone')?.hasError('required')) {
                      Telefone é obrigatório
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidPhone')) {
                      Formato inválido. Use (XX) 99999-9999
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidPhoneLength')) {
                      Telefone deve ter 10 ou 11 dígitos
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidMobileFormat')) {
                      Para celular, o terceiro dígito deve ser 9 (ex: (11) 99999-9999)
                    } @else if (tecnicoForm.get('telefone')?.hasError('invalidAreaCode')) {
                      DDD inválido. DDDS válidos: 11-99, exceto: 00,01,02,03,05,08,09,10
                    } @else {
                      Formato inválido. Use (XX) 99999-9999
                    }
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="tecLocal" class="cd-label">Cidade / Local Atuação</label>
                <input
                  id="tecLocal"
                  formControlName="local"
                  type="text"
                  placeholder="Ex: São Paulo - SP"
                  class="ns-input"
                  [class.ns-input-error]="isFieldInvalid('tecnico', 'local')"
                />
                @if (isFieldInvalid('tecnico', 'local')) {
                  <span class="cd-error">
                    <i class="pi pi-info-circle"></i> Localização é obrigatória
                  </span>
                }
              </div>

              <div class="cd-field">
                <label for="tecTempo" class="cd-label">Tempo Médio Resposta</label>
                <p-select
                  id="tecTempo"
                  formControlName="tempoResposta"
                  [options]="tempoRespostaOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="ns-select ns-select-inner"
                ></p-select>
              </div>

            </div>

            <div class="cd-form-actions">
              <button
                type="submit"
                class="tcc-btn-main cd-btn-submit cd-btn-emerald"
                [disabled]="loading"
                id="btnSubmitTecnico"
              >
                @if (loading) {
                  <i class="pi pi-spin pi-spinner"></i>
                } @else {
                  <i class="pi pi-check"></i>
                }
                Concluir Registro
              </button>
            </div>
          </form>
        }

        @if (!selectedRole) {
          <div class="cd-empty-state">
            Por favor, selecione seu perfil acima para preencher os dados correspondentes.
          </div>
        }

      </div>
    </div>
  `,
  styles: `
    .cd-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: var(--tcc-bg);
      color: var(--tcc-text-main);
      transition: background-color 0.3s ease;
      position: relative;
    }
    .cd-floating-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cd-btn-logout {
      height: 38px !important;
      border-radius: 20px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      font-size: 12px !important;
      padding: 0 16px !important;
    }
    .cd-card {
      width: 100%;
      max-width: 672px;
      background-color: var(--tcc-surface);
      border: 1px solid var(--tcc-border);
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 32px;
      transition: all 0.3s ease;
    }
    @media (min-width: 768px) {
      .cd-card {
        padding: 48px;
      }
    }
    .cd-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .cd-header-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background-color: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
      border-radius: 50%;
      margin-bottom: 16px;
      font-size: 20px;
    }
    .cd-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      margin-top: 0;
    }
    .cd-subtitle {
      color: var(--tcc-text-muted);
      font-size: 14px;
      max-width: 440px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .cd-section {
      margin-bottom: 40px;
    }
    .cd-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      color: var(--tcc-text-muted);
    }
    .cd-label-center {
      text-align: center;
      margin-bottom: 16px;
    }
    .cd-grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    @media (min-width: 768px) {
      .cd-grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .cd-role-card {
      border: 2px solid var(--tcc-border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .cd-role-card:hover {
      border-color: var(--tcc-text-muted);
    }
    .cd-role-active {
      border-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.03);
    }
    .cd-role-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: 20px;
      transition: transform 0.2s ease;
    }
    .cd-role-card:hover .cd-role-icon {
      transform: scale(1.1);
    }
    .cd-icon-blue {
      background-color: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
    }
    .cd-icon-emerald {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .cd-role-title {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 4px;
      margin-top: 0;
    }
    .cd-role-desc {
      font-size: 12px;
      color: var(--tcc-text-muted);
      line-height: 1.6;
      margin: 0;
    }
    .cd-info-box {
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 12px;
      background-color: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cd-info-box i {
      color: #3b82f6;
      font-size: 18px;
    }
    .cd-info-box span {
      font-size: 12px;
      line-height: 1.5;
    }
    .cd-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .cd-field {
      display: flex;
      flex-direction: column;
    }
    .cd-error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cd-form-actions {
      padding-top: 16px;
      margin-top: 8px;
      border-top: 1px solid var(--tcc-border);
      display: flex;
      justify-content: flex-end;
    }
    .cd-btn-submit {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    .cd-btn-emerald {
      background-color: #10b981 !important;
    }
    .cd-btn-emerald:hover {
      background-color: #059669 !important;
    }
    .cd-empty-state {
      text-align: center;
      padding: 24px 0;
      color: var(--tcc-text-muted);
      font-size: 14px;
      font-style: italic;
    }

    ::ng-deep .ns-input {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      padding: 0 16px !important;
      background: var(--tcc-bg) !important;
      color: var(--tcc-text-main) !important;
      border: 1px solid var(--tcc-border) !important;
      box-sizing: border-box !important;
      transition: all 0.2s ease !important;
    }
    ::ng-deep .ns-input:focus {
      outline: none !important;
      border-color: var(--tcc-primary) !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12) !important;
    }
    ::ng-deep .ns-input-error {
      border-color: #ef4444 !important;
    }
    ::ng-deep .cd-input-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--tcc-surface-hover) !important;
    }
    ::ng-deep .ns-select {
      width: 100% !important;
      border-radius: 8px !important;
      box-sizing: border-box !important;
    }
    ::ng-deep .ns-select-inner {
      width: 100% !important;
      height: 44px !important;
      border-radius: 8px !important;
      background: var(--tcc-bg) !important;
      color: var(--tcc-text-main) !important;
      border: 1px solid var(--tcc-border) !important;
      display: flex;
      align-items: center;
    }
  `
})
export class Cadastro implements OnInit {
  auth = inject(AuthService);
  profileService = inject(ProfileService);
  theme = inject(ThemeService);
  router = inject(Router);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);

  user: any = null;
  selectedRole: 'cliente' | 'tecnico' | null = null;
  loading = false;
  hasRoleInToken = false;

  clienteForm!: FormGroup;
  tecnicoForm!: FormGroup;

  tipoClienteOptions = [
    { label: 'PME (Pequena e Média Empresa)', value: 'PME' },
    { label: 'Corporate (Grande Empresa)', value: 'Corporate' },
    { label: 'Individual (Pessoa Física)', value: 'Individual' }
  ];

  especialidadeOptions = [
    { label: 'Suporte Técnico & Help Desk', value: 'Suporte Técnico' },
    { label: 'Redes e Infraestrutura', value: 'Redes' },
    { label: 'Segurança da Informação', value: 'Segurança' },
    { label: 'Desenvolvimento e Sistemas', value: 'Software' },
    { label: 'Manutenção de Hardware e Servidores', value: 'Hardware' },
    { label: 'Outros', value: 'Outros' }
  ];

  tempoRespostaOptions = [
    { label: 'Rápido (Em até 15 minutos)', value: 'Em até 15 min' },
    { label: 'Express (Em até 30 minutos)', value: 'Em até 30 min' },
    { label: 'Padrão (Em até 1 hora)', value: 'Em até 1 hora' },
    { label: 'Flexível (Em até 2 horas)', value: 'Em até 2 horas' }
  ];

  ngOnInit(): void {
    // 1. Initialize forms with validations
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      empresa: ['', [Validators.required, Validators.minLength(2)]],
      telefone: ['', [Validators.required, this.phoneNumberValidator]],
      local: ['', [Validators.required, Validators.minLength(3)]],
      tipoCliente: ['PME', [Validators.required]]
    });

    this.tecnicoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      especialidadePrincipal: ['Suporte Técnico', [Validators.required]],
      local: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, this.phoneNumberValidator]],
      tempoResposta: ['Em até 1 hora', [Validators.required]]
    });

    // 2. Fetch logged in user and prefill forms
    this.auth.user$.subscribe(u => {
      if (u) {
        this.user = u;
        const email = u.email || '';
        const name = u.name || u.given_name || '';

        this.clienteForm.patchValue({ nome: name, email: email });
        this.tecnicoForm.patchValue({ nome: name, email: email });

        // Check if role is pre-defined in token
        const roles = u['https://tcc-ng.com/roles'] || [];
        if (roles.length > 0) {
          const role = roles[0].toLowerCase();
          if (role === 'cliente' || role === 'tecnico') {
            this.selectedRole = role as 'cliente' | 'tecnico';
            this.hasRoleInToken = true;
          }
        }
      }
    });
  }

  isRoleFixed(): boolean {
    return this.hasRoleInToken;
  }

  setRole(role: 'cliente' | 'tecnico'): void {
    if (!this.isRoleFixed()) {
      this.selectedRole = role;
    }
  }

  isFieldInvalid(formType: 'cliente' | 'tecnico', field: string): boolean {
    const form = formType === 'cliente' ? this.clienteForm : this.tecnicoForm;
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  private phoneNumberValidator(control: any): { [key: string]: any } | null {
    const value = control.value;

    // Allow empty values (required validator will handle empty case)
    if (!value) {
      return null;
    }

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Validate digit count: should be 10 or 11 digits
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      return { 'invalidPhoneLength': true };
    }

    // Validate area code (DDD) - should be between 11 and 99 and not in invalid ranges
    const areaCode = parseInt(digitsOnly.substring(0, 2));
    // Invalid area codes in Brazil: 00, 01, 02, 03, 05, 08, 09, 10 and above 99
    const invalidAreaCodes = [0, 1, 2, 3, 5, 8, 9, 10];
    if (areaCode < 11 || areaCode > 99 || invalidAreaCodes.includes(areaCode)) {
      return { 'invalidAreaCode': true };
    }

    // For 11-digit numbers, the third digit (after area code) should be 9 (mobile)
    if (digitsOnly.length === 11 && digitsOnly[2] !== '9') {
      return { 'invalidMobileFormat': true };
    }

    return null;
  }

  private checkProfileExistsAndRedirect(): Observable<boolean> {
    // Check if profile already exists for this user
    return this.profileService.verificarPerfilExistente().pipe(
      tap((result: { exists: boolean; type: 'cliente' | 'tecnico' | 'admin' | null }) => {
        if (result.exists) {
          // Profile already exists, redirect to appropriate dashboard
          if (result.type === 'cliente') {
            this.router.navigate(['/cliente/inicio']);
          } else if (result.type === 'tecnico' || result.type === 'admin') {
            this.router.navigate(['/painel/dashboard']);
          }
        }
      }),
      map((result: { exists: boolean; type: 'cliente' | 'tecnico' | 'admin' | null }) => result.exists)
    );
  }

  submitCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    // Check if profile already exists before submitting
    this.checkProfileExistsAndRedirect().pipe(
      take(1),
      switchMap(exists => {
        if (exists) {
          // Already redirected in tap operator, just return empty observable
          return of(null);
        }

        this.loading = true;
        const formValue = this.clienteForm.getRawValue();
        const email = formValue.email || this.user?.email || 'cliente@tcc-ng.com';
        const clienteData = {
          ...formValue,
          email: email,
          avaliacao: 5.0,
          servicosAtivos: 0,
          servicosConcluidos: 0,
          status: 'Ativo'
        };

        return this.profileService.criarPerfilCliente(clienteData).pipe(
          map(res => ({ res, email })) // Return both result and email for use in subscribe
        );
      })
    ).subscribe({
      next: (result) => {
        if (result) { // Only proceed if we didn't redirect due to existing profile
          // Local persistence and state update
          localStorage.setItem(`tcc_profile_completed_${result.email}`, 'true');
          this.profileService.setPerfilCriado('cliente');
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro Concluído',
            detail: 'Seu perfil de cliente foi criado com sucesso!',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/cliente/inicio']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao criar perfil de cliente. Tente novamente.',
          life: 4000
        });
        console.error(err);
      }
    });
  }

  submitTecnico(): void {
    if (this.tecnicoForm.invalid) {
      this.tecnicoForm.markAllAsTouched();
      return;
    }

    // Check if profile already exists before submitting
    this.checkProfileExistsAndRedirect().pipe(
      take(1),
      switchMap(exists => {
        if (exists) {
          // Already redirected in tap operator, just return empty observable
          return of(null);
        }

        this.loading = true;
        const formValue = this.tecnicoForm.getRawValue();
        const email = formValue.email || this.user?.email || 'tecnico@tcc-ng.com';
        const tecnicoData = {
          nome: formValue.nome,
          email: email,
          especialidadePrincipal: formValue.especialidadePrincipal,
          local: formValue.local,
          telefone: formValue.telefone,
          tempoResposta: formValue.tempoResposta
        };

        return this.profileService.criarPerfilTecnico(tecnicoData).pipe(
          map(res => ({ res, email })) // Return both result and email for use in subscribe
        );
      })
    ).subscribe({
      next: (result) => {
        if (result) { // Only proceed if we didn't redirect due to existing profile
          // Local persistence and state update
          localStorage.setItem(`tcc_profile_completed_${result.email}`, 'true');
          this.profileService.setPerfilCriado('tecnico');
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro Concluído',
            detail: 'Seu perfil de profissional foi criado com sucesso!',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/painel/dashboard']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao criar o perfil de técnico. Tente novamente.',
          life: 4000
        });
        console.error(err);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}