import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { first, Observable } from 'rxjs';

// Interface for what we receive from GET /tecnicos/me
interface TecnicoResponse {
  nome_fantasia: string;
  email: string;
  cpf?: string;
  telefone?: string;
  descricao_servicos?: string;
  aprovado_pelo_admin?: boolean;
  criado_em?: string;
  usuario_id?: number;
  id?: number;
}

// Interface for what we receive from GET /clientes/me
interface ClienteResponse {
  nomeCompleto: string;
  email: string;
  telefone?: string;
  empresa?: string;
  endereco?: string;
  avaliacao?: number;
  servicos_ativos?: number;
  servicos_concluidos?: number;
  ativo?: boolean;
  criado_em?: string;
  usuario_id?: number;
  id?: number;
}

// Interface for what we send to PUT /tecnicos/me (maps to TecnicoUpdateRequest)
interface TecnicoUpdateRequest {
  nome: string; // maps to nome_fantasia in backend
  telefone?: string;
  cpf?: string;
  descricao_servicos?: string;
}

// Interface for what we send to PUT /clientes/me (maps to ClienteUpdateRequest)
interface ClienteUpdateRequest {
  nome: string; // maps to nome_completo in backend
  telefone?: string;
  empresa?: string;
  local?: string; // maps to endereco in DB
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="tcc-page-wrapper tcc-fade-in">
      <header class="tcc-page-header mb-4">
        <div class="tcc-header-title-group">
          <h1 class="tcc-title-lg">Configurações da Conta</h1>
          <p class="tcc-subtitle">Atualize suas informações de perfil e preferências</p>
        </div>
      </header>

      <div class="tcc-card" style="max-width: 800px; padding: 24px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
        <form [formGroup]="form" (ngSubmit)="salvarConfiguracoes()" class="tcc-form">

          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          
            <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
              <label class="tcc-label">Email (Apenas Leitura)</label>
              <input pInputText formControlName="email" type="text" class="w-full" readonly style="background: #f8fafc;" />
            </div>

            <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
              <label class="tcc-label">Telefone</label>
              <input pInputText formControlName="telefone" type="text" class="w-full" placeholder="(11) 99999-9999" />
            </div>

            @if (userRole === 'tecnico') {
              <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                <label class="tcc-label">Nome Fantasia / Seu Nome</label>
                <input pInputText formControlName="nome_fantasia" type="text" class="w-full" />
              </div>
              <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                <label class="tcc-label">CPF / CNPJ</label>
                <input pInputText formControlName="cpf" type="text" class="w-full" placeholder="000.000.000-00" />
              </div>
              <div class="form-group" style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px;">
                <label class="tcc-label">Descrição dos Serviços</label>
                <textarea pInputText formControlName="descricao_servicos" rows="4" class="w-full" placeholder="Descreva seus serviços especializados..."></textarea>
              </div>
            }

            @if (userRole === 'cliente') {
              <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                <label class="tcc-label">Nome Completo</label>
                <input pInputText formControlName="nome_completo" type="text" class="w-full" placeholder="Seu nome completo" />
              </div>
              <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                <label class="tcc-label">Empresa (Opcional)</label>
                <input pInputText formControlName="empresa" type="text" class="w-full" placeholder="Nome da sua empresa" />
              </div>
              <div class="form-group" style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px;">
                <label class="tcc-label">Endereço Completo</label>
                <input pInputText formControlName="endereco" type="text" class="w-full" placeholder="Rua, número, bairro, cidade - UF" />
              </div>
            }
          </div>

          <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
            <p-button
              label="Cancelar"
              type="button"
              (click)="cancelar()"
              styleClass="tcc-btn-outline"
            ></p-button>
            <p-button
              label="Salvar Alterações"
              type="submit"
              [disabled]="form.invalid || loading"
              [loading]="loading"
              styleClass="tcc-btn-main"
            ></p-button>
          </div>
        </form>
      </div>
    </div>
    <p-toast></p-toast>
  `
})
export class ConfiguracoesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  userRole: 'cliente' | 'tecnico' = 'cliente';
  loading = false;
  isLoadingInitialData = true;

  ngOnInit() {
    this.auth.user$.pipe(first()).subscribe(user => {
      if (user) {
        // Handle the fact that user object might not have strict typing for custom claims
        const roles = (user as any)['https://tcc-ng.com/roles'] || [];
        this.userRole = Array.isArray(roles) && roles.includes('cliente') ? 'cliente' : 'tecnico';
        this.initForm(user.email || '');
        this.carregarDadosPerfil();
      }
    });
  }

  initForm(email: string) {
    if (this.userRole === 'tecnico') {
      this.form = this.fb.group({
        email: [{value: email, disabled: true}],
        telefone: ['', Validators.required],
        nome_fantasia: ['', Validators.required],
        cpf: [''],
        descricao_servicos: ['']
      });
    } else {
      this.form = this.fb.group({
        email: [{value: email, disabled: true}],
        telefone: ['', Validators.required],
        nome_completo: ['', Validators.required],
        empresa: [''],
        endereco: ['']
      });
    }
  }

  carregarDadosPerfil() {
    this.isLoadingInitialData = true;

    const getProfile$: Observable<any> = this.userRole === 'tecnico'
      ? this.profileService.obterPerfilTecnico()
      : this.profileService.obterPerfilCliente();

    getProfile$.pipe(
      first()
    ).subscribe({
      next: (data: any) => {
        if (this.userRole === 'tecnico') {
          this.form.patchValue({
            telefone: data.telefone || '',
            nome_fantasia: data.nome_fantasia || '',
            cpf: data.cpf || '',
            descricao_servicos: data.descricao_servicos || ''
          });
        } else {
          this.form.patchValue({
            telefone: data.telefone || '',
            nome_completo: data.nome_completo || '',
            empresa: data.empresa || '',
            endereco: data.endereco || ''
          });
        }
        this.isLoadingInitialData = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar seus dados. Por favor, tente novamente.'
        });
        this.isLoadingInitialData = false;
      }
    });
  }

salvarConfiguracoes() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.form.getRawValue();

    // Adicione a tipagem : Observable<any> aqui
    const saveProfile$: Observable<any> = this.userRole === 'tecnico'
      ? this.profileService.atualizarPerfilTecnico({
          nome: formData.nome_fantasia,
          telefone: formData.telefone,
          cpf: formData.cpf,
          descricao_servicos: formData.descricao_servicos
        } as TecnicoUpdateRequest)
      : this.profileService.atualizarPerfilCliente({
          nome: formData.nome_completo,
          telefone: formData.telefone,
          empresa: formData.empresa,
          local: formData.endereco 
        } as ClienteUpdateRequest);

    saveProfile$.pipe(
      first()
    ).subscribe({
      next: (_: any) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Configurações atualizadas com sucesso!',
          life: 3000
        });
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Erro ao salvar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao atualizar configurações. Por favor, tente novamente.'
        });
      }
    });
  }

  cancelar() {
    this.form.reset();
  }
}