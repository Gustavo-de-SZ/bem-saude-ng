import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(false);

  constructor() {
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDark.set(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(prefersDark);
    }
    this.applyTheme();
  }



  toggle() {
    this.isDark.set(!this.isDark());
    this.applyTheme();

    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private applyTheme() {
    const method = this.isDark() ? 'add' : 'remove';
    document.body.classList[method]('tp-dark-theme');
  }
}