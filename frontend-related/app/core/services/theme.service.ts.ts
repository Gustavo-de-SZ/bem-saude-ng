import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(false);

  toggle() {
    this.isDark.set(!this.isDark());
    const method = this.isDark() ? 'add' : 'remove';
    document.body.classList[method]('tp-dark-theme');
  }
}