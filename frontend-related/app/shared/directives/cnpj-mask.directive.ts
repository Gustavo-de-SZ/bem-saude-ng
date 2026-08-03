import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appCnpjMask]'
})
export class CnpjMaskDirective {
  @Input() appCnpjMask: string = 'cnpj';

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let value = event.target.value;

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    // Limit to 14 digits (max for CNPJ)
    if (value.length > 14) {
      value = value.substring(0, 14);
    }

    // Apply mask based on length
    if (value.length <= 2) {
      // Just first 2 digits: XX
      value = value.replace(/^(\d{0,2})/, '$1');
    } else if (value.length <= 5) {
      // First 2 + next 3: XX.XXX
      value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    } else if (value.length <= 8) {
      // First 2 + next 3 + next 3: XX.XXX.XXX
      value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length <= 12) {
      // First 2 + next 3 + next 3 + next 4: XX.XXX.XXX/XXXX
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    } else if (value.length <= 14) {
      // Full CNPJ: XX.XXX.XXX/XXXX-XX
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
    }

    // Remove trailing characters if incomplete
    if (value.endsWith('.') || value.endsWith('/') || value.endsWith('-') || value.endsWith(' ')) {
      value = value.slice(0, -1);
    }

    event.target.value = value;

    // Update the underlying form control value to match the masked value
    const control = this.el.nativeElement.formControl;
    if (control) {
      control.setValue(value, { emitEvent: false });
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any) {
    // Ensure proper format on blur
    let value = event.target.value;

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // If we have digits but no formatting, apply minimal formatting
    if (digitsOnly && !value) {
      if (digitsOnly.length <= 2) {
        value = digitsOnly;
      } else if (digitsOnly.length <= 5) {
        value = `${digitsOnly.substring(0, 2)}.${digitsOnly.substring(2)}`;
      } else if (digitsOnly.length <= 8) {
        value = `${digitsOnly.substring(0, 2)}.${digitsOnly.substring(2, 5)}.${digitsOnly.substring(5, 8)}`;
      } else if (digitsOnly.length <= 12) {
        value = `${digitsOnly.substring(0, 2)}.${digitsOnly.substring(2, 5)}.${digitsOnly.substring(5, 8)}/${digitsOnly.substring(8, 12)}`;
      } else {
        // 13+ digits
        value = `${digitsOnly.substring(0, 2)}.${digitsOnly.substring(2, 5)}.${digitsOnly.substring(5, 8)}/${digitsOnly.substring(8, 12)}-${digitsOnly.substring(12, 14)}`;

        // Add any remaining digits (shouldn't happen as we limit to 14, but just in case)
        if (digitsOnly.length > 14) {
          value += digitsOnly.substring(14);
        }
      }
    }

    event.target.value = value;
  }
}