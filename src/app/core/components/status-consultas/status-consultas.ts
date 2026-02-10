import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-registro-status-consulta',
  imports: [TagModule],
  templateUrl: './status-consultas.html',
})
export class StatusConsultas {
  status = input<string>();
}