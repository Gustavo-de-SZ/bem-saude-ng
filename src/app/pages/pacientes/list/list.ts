import { Component, inject, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { RegistroStatusTag } from '../../../core/components/registro-status-tag/registro-status-tag';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoFocus } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PacienteCriarRequestModel, PacienteEditarRequestModel, PacienteResponseModel } from '../../../models/paciente.model';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FluidModule } from 'primeng/fluid';
import { PacienteService } from '../../../services/paciente.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-list',
  imports: [ButtonModule, SelectModule, TableModule, RegistroStatusTag, FormsModule, AutoFocus, DialogModule, InputTextModule,
    InputMaskModule, DatePickerModule, TextareaModule, FluidModule, ReactiveFormsModule
  ],
  templateUrl: './list.html',
})
export class List {
  private readonly formBuilder = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  idEditar: string | undefined = undefined;
  filtros = ["Todos", "Ativos", "Inativos"];
  filtroSelecionado: string = "Todos";
  pesquisa: string = "";
  visible: boolean = false;

  pacienteForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    telefone: ['', [Validators.required, Validators.maxLength(15)]],
    cpf: ['', [Validators.required, Validators.maxLength(14)]],
    dataNascimento: ['', [Validators.required]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    endereco: ['', [Validators.maxLength(255)]],
    observacoes: [''],
  });

  pacientes = model<PacienteResponseModel[]>([]);

  constructor() {
    this.carregarPacientes();
  }

  carregarPacientes() {
    this.pacienteService.getAll().subscribe({
      next: (pacientes: PacienteResponseModel[]) => {
        this.pacientes.set(pacientes);
      },
      error: (erro: Error) => {
        console.log(`Erro ao carregar pacientes ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao carregar os pacientes"
        });
      }
    });
  }

  showDialog(): void {
    this.idEditar = undefined;
    this.pacienteForm.reset();
    this.pacienteForm.get('cpf')?.enable();
    this.pacienteForm.get('dataNascimento')?.enable();
    this.visible = true;
  }

  cancelar() {
    this.visible = false;
    this.pacienteForm.reset();
    this.idEditar = undefined;
  }

  salvar() {
    if (this.idEditar === undefined) {
      const form: PacienteCriarRequestModel = {
        nome: this.pacienteForm.getRawValue().nome!,
        cpf: this.pacienteForm.getRawValue().cpf!,
        telefone: this.pacienteForm.getRawValue().telefone!,
        endereco: this.pacienteForm.getRawValue().endereco || '',
        email: this.pacienteForm.getRawValue().email || '',
        data_nascimento: this.formatarData(this.pacienteForm.getRawValue().dataNascimento),
        observacoes: this.pacienteForm.getRawValue().observacoes || '',
      };
      this.cadastrar(form);
    } else {
      const form: PacienteEditarRequestModel = {
        nome: this.pacienteForm.getRawValue().nome!,
        telefone: this.pacienteForm.getRawValue().telefone!,
        endereco: this.pacienteForm.getRawValue().endereco || '',
        email: this.pacienteForm.getRawValue().email || '',
        observacoes: this.pacienteForm.getRawValue().observacoes || '',
      };
      this.editar(form);
    }
  }

  private formatarData(data: any): string {
    if (!data) return '';
    if (data instanceof Date) {
      return data.toISOString().split('T')[0];
    }
    return String(data);
  }

  cadastrar(form: PacienteCriarRequestModel) {
    this.pacienteService.create(form).subscribe({
      next: () => {
        this.visible = false;
        this.pacienteForm.reset();
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente cadastrado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar cadastrar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao cadastrar paciente"
        });
      }
    });
  }

  editar(form: PacienteEditarRequestModel) {
    this.pacienteService.update(this.idEditar!, form).subscribe({
      next: () => {
        this.visible = false;
        this.pacienteForm.reset();
        this.idEditar = undefined;
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente alterado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar alterar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao alterar paciente"
        });
      }
    });
  }

  abrirModalEditar(paciente: PacienteResponseModel) {
    this.idEditar = paciente.id;
    this.pacienteService.getById(paciente.id).subscribe({
      next: (dados) => {
        this.pacienteForm.patchValue({
          nome: dados.nome,
          cpf: dados.cpf,
          telefone: dados.telefone,
          endereco: dados.endereco,
          email: dados.email,
          dataNascimento: dados.data_nascimento,
          observacoes: dados.observacoes,
        });
        this.pacienteForm.get('cpf')?.disable();
        this.pacienteForm.get('dataNascimento')?.disable();
        this.visible = true;
      },
      error: (erro: Error) => {
        console.log(`Erro ao buscar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao buscar dados do paciente"
        });
      }
    });
  }

  confirmarAtivacao(paciente: PacienteResponseModel) {
    this.confirmationService.confirm({
      message: `Deseja ativar o paciente '${paciente.nome}'?`,
      header: 'Cuidado',
      icon: 'fa fa-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Ativar',
        severity: 'success'
      },
      accept: () => {
        this.ativar(paciente);
      }
    });
  }

  confirmarInativar(paciente: PacienteResponseModel) {
    this.confirmationService.confirm({
      message: `Deseja inativar o paciente '${paciente.nome}'?`,
      header: 'Cuidado',
      icon: 'fa fa-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Inativar',
        severity: 'danger'
      },
      accept: () => {
        this.inativar(paciente);
      }
    });
  }

  ativar(paciente: PacienteResponseModel) {
    this.pacienteService.ativar(paciente.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente ativado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar ativar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao ativar paciente"
        });
      }
    });
  }

  inativar(paciente: PacienteResponseModel) {
    this.pacienteService.delete(paciente.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Paciente inativado com sucesso"
        });
        this.carregarPacientes();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar inativar paciente: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao inativar paciente"
        });
      }
    });
  }
}