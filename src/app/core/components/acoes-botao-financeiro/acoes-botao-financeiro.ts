import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-acoes-botao-financeiro',
  imports: [ButtonModule],
  templateUrl: './acoes-botao-financeiro.html',
})
export class AcoesBotaoFinanceiro {
  status = input<string>();
}
