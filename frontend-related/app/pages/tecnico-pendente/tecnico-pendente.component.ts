import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tecnico-pendente',
  template: `
    <div class="p-8 text-center mt-20">
       <i class="pi pi-clock text-6xl text-amber-500 mb-4"></i>
       <h1 class="text-3xl font-bold">Conta em Análise</h1>
       <p class="text-gray-500 mt-4">
         Sua conta de técnico foi recebida e está sendo analisada pelos nossos administradores.
         Você receberá um email assim que for aprovado.
       </p>
    
       <button
         pButton
         type="button"
         label="Sair"
         icon="pi-sign-out"
         class="p-mt-6"
         (click)="logout()"
       ></button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .p-8 {
      padding: 2rem !important;
    }

    .text-center {
      text-align: center !important;
    }

    .mt-20 {
      margin-top: 5rem !important;
    }

    .text-6xl {
      font-size: 3.75rem !important;
    }

    .text-3xl {
      font-size: 1.875rem !important;
    }

    .text-amber-500 {
      --tw-text-opacity: 1;
      color: rgb(245 158 11 / var(--tw-text-opacity)) !important;
    }

    .text-gray-500 {
      --tw-text-opacity: 1;
      color: rgb(107 114 128 / var(--tw-text-opacity)) !important;
    }

    .font-bold {
      font-weight: 700 !important;
    }

    .p-mt-6 {
      margin-top: 1.5rem !important;
    }
  `]
})
export class TecnicoPendenteComponent {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}