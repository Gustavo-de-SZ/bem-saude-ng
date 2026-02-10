import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-list',
  imports: [TagModule],
  templateUrl: './list.html',
})
export class  FaturaStatus{
  status = input<string>();
}
