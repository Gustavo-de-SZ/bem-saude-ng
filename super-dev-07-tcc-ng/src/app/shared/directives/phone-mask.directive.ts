import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appPhoneMask]'
})
export class PhoneMaskDirective {
  @Input() appPhoneMask: string = 'phone';

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let value = event.target.value;

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    // Limit to 11 digits (max for Brazilian phone)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    // Apply mask based on length
    if (value.length <= 2) {
      // Just area code so far: (XX
      value = value.replace(/^(\d{0,2})/, '($1');
    } else if (value.length <= 3) {
      // Area code plus first digit: (XX) X
      value = value.replace(/^(\d{2})(\d{0,1})/, '($1) $2');
    } else if (value.length <= 7) {
      // Area code plus first 5 digits: (XX) XXXX
      value = value.replace(/^(\d{2})(\d{5})/, '($1) $2');
    } else if (value.length <= 11) {
      // Full number: (XX) XXXX-XXXX or (XX) 9XXXX-XXXX
      // Check if it's mobile (11 digits, third digit after area code is 9)
      if (value.length === 11 && value[2] === '9') {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      }
    }

    // Remove trailing dash or space if incomplete
    if (value.endsWith('-') || value.endsWith(' ')) {
      value = value.slice(0, -1);
    }

    // Remove opening parenthesis if no area code yet
    if (value.startsWith('(') && value.length === 1) {
      value = '';
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
        value = `(${digitsOnly}`;
      } else if (digitsOnly.length <= 3) {
        value = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2)}`;
      } else if (digitsOnly.length <= 7) {
        value = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 6)}`;
      } else {
        // 8+ digits
        if (digitsOnly.length === 11 && digitsOnly[2] === '9') {
          value = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 7)}-${digitsOnly.substring(7, 11)}`;
        } else {
          value = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6, 10)}`;
        }

        // Add any remaining digits
        if (digitsOnly.length > 10) {
          value += digitsOnly.substring(10);
        }
      }
    }

    event.target.value = value;
  }
}