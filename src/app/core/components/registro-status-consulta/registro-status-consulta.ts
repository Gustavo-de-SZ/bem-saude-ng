import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-registro-status-consulta',
  imports: [TagModule],
  templateUrl: './registro-status-consulta.html',
})
export class RegistroStatusConsulta {
  status = input<string>();
}
