import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-list',
  imports: [ButtonModule, DialogModule],
  templateUrl: './list.html',
})
export class List {

    visible = false;
  showDialog(): void {
    this.visible = true;
  }
}
