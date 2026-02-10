import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { InputMaskDirective } from "primeng/inputmask";
import { ConsultaResponseModel } from '../../../models/consulta.model';
import { RegistroStatusConsulta } from "../../../core/components/registro-status-consulta/registro-status-consulta";
import { AcoesBotaoConsultas } from "../../../core/components/acoes-botao-consultas/acoes-botao-consultas";
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-list',
  imports: [
    ButtonModule,
    FormsModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    DialogModule,
    RegistroStatusConsulta,
    AcoesBotaoConsultas,
    ReactiveFormsModule,
    TextareaModule,
    AvatarModule,
    InputGroupAddonModule,
    InputGroupModule,
  ],
  templateUrl: './list.html',
})
export class List {
  private readonly formBuilder = inject(FormBuilder);

  consultaForm = this.formBuilder.group({
    paciente: ["Selecione", [Validators.required]],
    profissional: ["Selecione", [Validators.required]],
    data: ["", [Validators.required]],
    horarioPrevisto: ["", [Validators.required]],
    observacoes: [null],
  }
  );

  primeiraLetra: string = "";

  profissionalOpcoes = [
    "Selecione",
    "Dra. Ana Souza",
    "Dr. Carlos Lima",
    "Dra. Juliana Martins",
    "Dr. Bruno Rocha",
  ];

  profissionalSelecionado = "Selecione";

  pacienteOpcoes = [
    "Selecione",
    "Maria Silva",
    "João Pereira",
    "Fernanda Costa",
    "Rafael Almeida",
    "Camila Santos",
    "Diego Fernandes",
    "Patrícia Oliveira",
    "Lucas Ribeiro",
    "Aline Barbosa",
    "Gustavo Nunes",
    "Bruna Carvalho",
    "Eduardo Souza",
  ];

  visible = false;

  consultas: ConsultaResponseModel[] = [
    {
      paciente: 'Maria Silva',
      profissional: 'Dra. Ana Souza',
      status: 'Agendada',
      data: '2026-02-03',
      horarioPrevisto: '08:00'
    },
    {
      paciente: 'João Pereira',
      profissional: 'Dr. Carlos Lima',
      status: 'Confirmada',
      data: '2026-02-03',
      horarioPrevisto: '08:30'
    },
    {
      paciente: 'Fernanda Costa',
      profissional: 'Dra. Juliana Martins',
      status: 'Cancelada',
      data: '2026-02-03',
      horarioPrevisto: '09:00'
    },
    {
      paciente: 'Rafael Almeida',
      profissional: 'Dr. Bruno Rocha',
      status: 'Em Andamento',
      data: '2026-02-03',
      horarioPrevisto: '09:30'
    },
    {
      paciente: 'Camila Santos',
      profissional: 'Dra. Ana Souza',
      status: 'Finalizada',
      data: '2026-02-03',
      horarioPrevisto: '10:00'
    },
    {
      paciente: 'Diego Fernandes',
      profissional: 'Dr. Carlos Lima',
      status: 'Cancelada',
      data: '2026-02-04',
      horarioPrevisto: '08:00'
    },
    {
      paciente: 'Patrícia Oliveira',
      profissional: 'Dra. Juliana Martins',
      status: 'Agendada',
      data: '2026-02-04',
      horarioPrevisto: '08:30'
    },
    {
      paciente: 'Lucas Ribeiro',
      profissional: 'Dr. Bruno Rocha',
      status: 'Confirmada',
      data: '2026-02-04',
      horarioPrevisto: '09:00'
    },
    {
      paciente: 'Aline Barbosa',
      profissional: 'Dra. Ana Souza',
      status: 'Finalizada',
      data: '2026-02-04',
      horarioPrevisto: '09:30'
    },
    {
      paciente: 'Gustavo Nunes',
      profissional: 'Dr. Carlos Lima',
      status: 'Em Andamento',
      data: '2026-02-05',
      horarioPrevisto: '10:00'
    },
    {
      paciente: 'Bruna Carvalho',
      profissional: 'Dra. Juliana Martins',
      status: 'Cancelada',
      data: '2026-02-05',
      horarioPrevisto: '10:30'
    },
    {
      paciente: 'Eduardo Souza',
      profissional: 'Dr. Bruno Rocha',
      status: 'Agendada',
      data: '2026-02-06',
      horarioPrevisto: '08:00'
    }
  ];

  status = ["Todos os status", "Confirmada", "Agendada", "Cancelada", "Em Andamento", "Finalizada"];

  statusSelecionado = "Todos os status";

  showDialog() {
    this.visible = true;
  }

  cancelar() {
    this.visible = false;
    this.consultaForm.reset();
  }

  pegarPrimeiraLetraPaciente(paciente: string) {
    this.primeiraLetra = paciente.substring(0,1);

    return this.primeiraLetra;
  }

  salvar() {

  }
}
