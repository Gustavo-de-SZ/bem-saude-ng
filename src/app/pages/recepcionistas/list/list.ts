import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { RecepcionistaResponseModel } from '../../../models/recepcionista.model';
import { RegistroStatusTag } from '../../../core/components/registro-status-tag/registro-status-tag';
import { AutoFocusModule } from "primeng/autofocus";
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-list',
  imports: [ButtonModule, InputTextModule, SelectModule, FormsModule, TableModule, RegistroStatusTag, AutoFocusModule, DialogModule, ReactiveFormsModule],
  templateUrl: './list.html',
})
export class List {
  private readonly formBuilder = inject(FormBuilder);

  filtros = ["Todos", "Ativos", "Inativos"];

  filtroSelecionado: string = "Todos";

  pesquisa: string = "";

  visible = false;

  recepcionistaForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
  });

  recepcionistas: RecepcionistaResponseModel[] = [
    {
      id: "019c10ee-b3e2-7a81-aaf6-2222bbe48f56",
      nome: "Ana Paula Silva",
      status: true
    },
    {
      id: "019c10ee-b3e2-7c10-99ce-3e65e8d02c14",
      nome: "Bruno Almeida",
      status: true
    },
    {
      id: "019c10ee-b3e2-7e32-ab3e-1fea45718250",
      nome: "Carla Mendes",
      status: false
    },
    {
      id: "019c10ee-b3e2-7960-b8c8-43ade9b155b8",
      nome: "Daniela Rocha",
      status: true
    },
    {
      id: "019c10ee-b3e2-7f2c-97a6-b296616f128c",
      nome: "Eduardo Santos",
      status: false
    }
  ];
  
  showDialog(){
    this.visible = true;
  }

  cancelar(){
    this.visible = false;
    this.recepcionistaForm.reset();
  }

  salvar(){

  }
}
