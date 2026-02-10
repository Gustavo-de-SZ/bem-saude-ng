import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FinanceiroResponseModel } from '../../../models/financeiro.model';
import { RegistroStatusFinanceiro } from "../../../core/components/registro-status-financeiro/registro-status-financeiro";
import { AcoesBotaoFinanceiro } from "../../../core/components/acoes-botao-financeiro/acoes-botao-financeiro";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-list',
  imports: [
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    DialogModule,
    RegistroStatusFinanceiro,
    AcoesBotaoFinanceiro,
    FormsModule
  ],
  templateUrl: './list.html',
})
export class List {
  visible = false;

  filtroStatus: string[] = ["Todos os status", "Paga", "Em Aberto"];

  statusSelecionado: string = "Todos os status";

  clientesFinanceiros: FinanceiroResponseModel[] =
    [
      {
        "id": "#0001",
        "paciente": "João da Silva",
        "data": "2025-01-10",
        "valor": 250.75,
        "status": "PAGA"
      },
      {
        "id": "#0002",
        "paciente": "Maria Oliveira",
        "data": "2025-01-12",
        "valor": 180.00,
        "status": "EM ABERTO"
      },
      {
        "id": "#0003",
        "paciente": "Carlos Santos",
        "data": "2025-01-15",
        "valor": 320.40,
        "status": "EM ABERTO"
      },
      {
        "id": "#0004",
        "paciente": "Ana Pereira",
        "data": "2025-01-18",
        "valor": 95.90,
        "status": "PAGA"
      },
      {
        "id": "#0005",
        "paciente": "Fernanda Costa",
        "data": "2025-01-20",
        "valor": 410.00,
        "status": "EM ABERTO"
      }
    ];

  showDialog() {
    this.visible = true;
  }

  calcularTotal() {
    let valorTotal = this.clientesFinanceiros.reduce((valorTotal, cliente) => valorTotal + cliente.valor, 0);

    return `R$ ${valorTotal.toFixed(2)}`;
  }

  // refatorar depois para somente pagas no mês atual
  calcularPagas() {
    let valorTotal = this.clientesFinanceiros.filter(cliente => cliente.status == "PAGA").reduce((valorTotal, cliente) => valorTotal + cliente.valor, 0);

    return `R$ ${valorTotal.toFixed(2)}`;
  }

  calcularEmAberto() {
    let valorTotal = this.clientesFinanceiros.filter(cliente => cliente.status == "EM ABERTO").reduce((valorTotal, cliente) => valorTotal + cliente.valor, 0);

    return `R$ ${valorTotal.toFixed(2)}`;
  }
}
