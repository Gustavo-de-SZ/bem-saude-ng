import { Component, input } from '@angular/core';
import { TagModule } from "primeng/tag";

@Component({
  selector: 'app-registro-status-tag',
  imports: [TagModule],
  templateUrl: './registro-status-tag.html',
})
export class RegistroStatusTag {
  status = input<boolean>();
}
