import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-acoes-botao-consultas',
  imports: [ButtonModule],
  templateUrl: './botao-consultas.html',
})
export class BotaoConsultas {
  statusPaciente = input<string>();
}