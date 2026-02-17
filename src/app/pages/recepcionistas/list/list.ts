import { Component, inject, model } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { RecepcionistaCriarRequestModel, RecepcionistaResponseModel } from '../../../models/recepcionista.model';
import { RegistroStatusTag } from '../../../core/components/registro-status-tag/registro-status-tag';
import { AutoFocusModule } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { RecepcionistaService } from '../../../services/recepcionista.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-list',
  imports: [Button, InputTextModule, SelectModule, FormsModule, TableModule, RegistroStatusTag, AutoFocusModule, DialogModule, ReactiveFormsModule],
  templateUrl: './list.html',
})
export class List {
  private readonly formBuilder = inject(FormBuilder);
  private readonly recepcionistaService = inject(RecepcionistaService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService)

  idEditar: string | undefined = undefined;
  filtros = ["Todos", "Ativos", "Inativos"];
  filtroSelecionado: string = "Todos";
  pesquisa: string = "";
  visible = false;

  recepcionistaForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
  })

  recepcionistas = model<RecepcionistaResponseModel[]>([]);

  constructor() {
    this.carregarRecepcionistas();
  }

  carregarRecepcionistas() {
    // Carregar a lista de recepcionistas (requisição para o back)
    this.recepcionistaService.getAll().subscribe({
      // next é quando a request da certo
      next: (recepcionistas: RecepcionistaResponseModel[]) => {
        this.recepcionistas.set(recepcionistas);
      },
      error: (erro: Error) => {
        console.log(`Erro ao carregar recepcionistas ${erro}`)
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao carregar os recepcionistas"
        })
      }
    })
  }

  showDialog() {
    this.visible = true;
  }

  cancelar() {
    this.visible = false;
    this.recepcionistaForm.reset();
  }

  salvar() {
    const form: RecepcionistaCriarRequestModel = {
      nome: this.recepcionistaForm.getRawValue().nome!
    }

    if (this.idEditar === undefined) {
      this.cadastrar(form);
    } else {
      this.editar(form);
    }
  }

  editar(form: RecepcionistaCriarRequestModel) {
    this.recepcionistaService.update(this.idEditar!, form).subscribe({
      next: () => {
        this.visible = false;
        this.recepcionistaForm.reset();
        this.idEditar = undefined;
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Recepcionista alterada com sucesso"
        });
        this.carregarRecepcionistas();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar alterar recepcionista: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao alterar recepcionista"
        })
      }
    })
  }

  cadastrar(form: RecepcionistaCriarRequestModel) {
    this.recepcionistaService.create(form).subscribe({
      next: () => {
        this.visible = false;
        this.recepcionistaForm.reset();
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Recepcionista cadastrada com sucesso"
        });
        this.carregarRecepcionistas();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar cadastrar recepcionista: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao cadastrar recepcionista"
        })
      }
    })
  }

  confirmarAtivacao(recepcionista: RecepcionistaResponseModel) {
    this.confirmationService.confirm({
      message: `Deseja ativar o recepcionista '${recepcionista.nome}'?`,
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
        severity: 'danger'
      },
      accept: () => {
        this.ativar(recepcionista);
      }
    });
  }

  confirmarInativar(recepcionista: RecepcionistaResponseModel) {
    this.confirmationService.confirm({
      message: `Deseja inativar o recepcionista '${recepcionista.nome}'?`,
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
        this.inativar(recepcionista);
      }
    });
  }

  abrirModalEditar(recepcionista: RecepcionistaResponseModel) {
    this.idEditar = recepcionista.id;
    // Comportamento deveria fazer um request para o back-end buscando os dados 
    // daquela recepcionista
    this.recepcionistaForm.patchValue({
      nome: recepcionista.nome
    })
    this.visible = true;
  }

  ativar(recepcionista: RecepcionistaResponseModel) {
    this.recepcionistaService.ativar(recepcionista.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Recepcionista ativada com sucesso"
        });
        this.carregarRecepcionistas();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar ativar recepcionista: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao ativar recepcionista"
        })
      }
    })
  }

  inativar(recepcionista: RecepcionistaResponseModel) {
    this.recepcionistaService.delete(recepcionista.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Show de bola!",
          detail: "Recepcionista inativada com sucesso"
        });
        this.carregarRecepcionistas();
      },
      error: (erro: Error) => {
        console.log(`Ocorreu um erro ao tentar inativar recepcionista: ${erro}`);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Ocorreu um erro ao inativar recepcionista"
        })
      }
    })
  }
}