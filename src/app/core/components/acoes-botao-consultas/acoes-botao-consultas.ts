import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-acoes-botao-consultas',
  imports: [ButtonModule],
  templateUrl: './acoes-botao-consultas.html',
})
export class AcoesBotaoConsultas {
  statusPaciente = input<string>();
}
