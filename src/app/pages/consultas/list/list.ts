import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog, DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { RegistroStatusTag } from '../../../core/components/registro-status-tag/registro-status-tag';

@Component({
  selector: 'app-list',
  imports: [
    ButtonModule, 
    SelectModule, 
    FormsModule, 
    AutoFocusModule, 
    DialogModule, 
    TableModule, 
    InputTextModule, 
    InputMaskModule, 
    DatePickerModule, 
    TextareaModule,
    ReactiveFormsModule,
    
  ],
  templateUrl: './list.html',
})
export class List {
  visible = false;
  
  showDialog(){
    this.visible = true;
  }
}
