import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-pendente-aprovacao',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="bg-white max-w-lg w-full rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center p-10">
        <div class="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-blue-50/50">
           <i class="pi pi-clock text-5xl"></i>
        </div>
        <h1 class="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Análise Pendente</h1>
        <p class="text-slate-500 mb-8 text-lg leading-relaxed">
          Seu cadastro como técnico foi recebido e está em nossa fila de aprovação. Nossa equipe de moderação irá avaliar seu perfil em breve.
        </p>
        <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-8 flex items-start gap-4 text-left">
            <i class="pi pi-info-circle text-blue-500 mt-1"></i>
            <p class="text-sm text-slate-600">Você receberá um e-mail com o resultado da aprovação. Fique de olho na sua caixa de entrada e spam.</p>
        </div>
        <button (click)="logout()" class="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all text-lg">
          Sair por enquanto
        </button>
      </div>
    </div>
  `
})
export class PendenteComponent {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}