import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { SidebarCliente } from '../../../shared/components/sidebar-cliente/sidebar-cliente';
import { TopbarCliente } from '../../../shared/components/topbar/topbar-cliente';

@Component({
  selector: 'app-painel-cliente-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarCliente, TopbarCliente],
  template: `
    <div class="tcc-layout-container">
      <app-sidebar-cliente></app-sidebar-cliente>

      <div class="tcc-main-wrapper">
        <div class="tcc-topbar-container">
          <app-topbar-cliente></app-topbar-cliente>
        </div>

        <main class="tcc-content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .tcc-layout-container {
      display: flex;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: var(--tcc-bg, #f8fafc); 
    }

    .tcc-main-wrapper {
      flex: 1; 
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .tcc-topbar-container {
      padding: 0 32px;
      background-color: var(--tcc-surface, #ffffff); 
      border-bottom: 1px solid var(--tcc-border, #e2e8f0);
      z-index: 10;
    }

    .tcc-content-area {
      flex: 1;
      padding: 32px;
      overflow-y: auto; 
      
      &::-webkit-scrollbar { width: 8px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb {
        background-color: var(--tcc-border, #e2e8f0);
        border-radius: 4px;
      }
    }
  `]
})
export class PainelClienteLayout {}