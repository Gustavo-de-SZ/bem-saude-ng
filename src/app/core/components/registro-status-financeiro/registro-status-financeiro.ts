import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-registro-status-financeiro',
  imports: [TagModule],
  templateUrl: './registro-status-financeiro.html',
})
export class RegistroStatusFinanceiro {
  status = input<string>();
}
