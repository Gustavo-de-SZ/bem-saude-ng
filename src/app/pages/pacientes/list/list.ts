import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { RegistroStatusTag } from '../../../core/components/registro-status-tag/registro-status-tag';
import { AutoFocusModule } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { PacienteResponseModel } from '../../../models/paciente.model';
import { InputMaskModule } from "primeng/inputmask";
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: 'app-list',
  imports: [
    ButtonModule, 
    SelectModule, 
    FormsModule, 
    RegistroStatusTag, 
    AutoFocusModule, 
    DialogModule, 
    TableModule, 
    InputTextModule, 
    InputMaskModule, 
    DatePickerModule, 
    TextareaModule,
    ReactiveFormsModule
  ],
  templateUrl: './list.html',
})
export class List {
  filtros = ["Todos", "Ativos", "Inativos"];

  filtroSelecionado: string = "Todos";

  pesquisa: string = "";

  visible: boolean = false;

  private readonly formBuilder = inject(FormBuilder);

  pacienteForm = this.formBuilder.group({
    nome: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    telefone: ["", [Validators.required, Validators.maxLength(15)]],
    cpf: ["", [Validators.required, Validators.maxLength(14)]],
    dataNascimento: ["", [Validators.required]],
    email: [null, [Validators.email, Validators.maxLength(60)]],
    endereco: [null, [Validators.maxLength(45)]],
    observacoes: [null],
    tipoSanguineo: ["O+", [Validators.required]]
  });

  tipoSanguineoOpcoes: string[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  pacientes: PacienteResponseModel[] = [
    {
      id: '019d1f2a-8c31-7b4a-8f12-3a9c5d7e1b20',
      nome: 'Ana Paula Ferreira',
      cpf: '38127495016',
      telefone: '(11) 98765-4321',
      status: true
    },
    {
      id: '019d1f2a-8c31-7c10-9a3f-1b6d0e2c4f98',
      nome: 'Bruno Henrique Souza',
      cpf: '90561372840',
      telefone: '(21) 99812-3045',
      status: true
    },
    {
      id: '019d1f2a-8c31-7d2e-8c77-5f1a9e0d3b41',
      nome: 'Carla Mendes Lima',
      cpf: '14785236900',
      telefone: '(31) 99123-7788',
      status: false
    },
    {
      id: '019d1f2a-8c31-7e55-b2c1-0a7d3c9f8e12',
      nome: 'Diego Alves Rocha',
      cpf: '73619028455',
      telefone: '(41) 99220-1100',
      status: true
    },
    {
      id: '019d1f2a-8c31-7f8a-8b0d-9c2e1a4f7d33',
      nome: 'Eduarda Nascimento',
      cpf: '51290837461',
      telefone: '(51) 99555-6677',
      status: true
    },
    {
      id: '019d1f2a-8c31-70c4-a6e9-2d8f1c3b5a90',
      nome: 'Felipe Cardoso',
      cpf: '86420391572',
      telefone: '(61) 99701-2233',
      status: false
    },
    {
      id: '019d1f2a-8c31-71f6-98a2-7e3b9d1c0f44',
      nome: 'Gabriela Ribeiro',
      cpf: '23014587936',
      telefone: '(71) 98888-9900',
      status: true
    },
    {
      id: '019d1f2a-8c31-7239-8d41-4c0b2a9e6f10',
      nome: 'Hugo Martins',
      cpf: '69038127405',
      telefone: '(81) 99660-4455',
      status: false
    },
    {
      id: '019d1f2a-8c31-73a7-b7d0-11a2c3d4e5f6',
      nome: 'Isabela Costa',
      cpf: '41873025964',
      telefone: '(91) 99333-2211',
      status: true
    },
    {
      id: '019d1f2a-8c31-744d-9f8c-6a1b2c3d4e55',
      nome: 'João Pedro Batista',
      cpf: '57294180326',
      telefone: '(85) 99444-5566',
      status: true
    }
  ];
  
  showDialog(): void {
    this.visible = true;
  }

  cancelar() {
    this.visible = false;
    this.pacienteForm.reset();
  }

  salvar() {

  }
}
