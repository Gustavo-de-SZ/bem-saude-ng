import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { SidebarTecnico } from '../../shared/components/sidebar-tecnico/sidebar-tecnico';
import { TopbarTecnico } from '../../shared/components/topbar/topbar';

@Component({
  selector: 'app-painel-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    SidebarTecnico, 
    TopbarTecnico
  ],
  template: `
    <div class="tcc-layout-container">
      
      <app-sidebar-tecnico></app-sidebar-tecnico>

      <div class="tcc-main-wrapper">
        
        <div class="tcc-topbar-container">
          <app-topbar-tecnico></app-topbar-tecnico>
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
      background-color: var(--tcc-bg); 
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
      background-color: var(--tcc-surface); 
      border-bottom: 1px solid var(--tcc-border);
      z-index: 10;
    }

    .tcc-content-area {
      flex: 1;
      padding: 32px;
      overflow-y: auto; 
      
      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background-color: var(--tcc-border);
        border-radius: 4px;
      }
    }
  `]
})
export class PainelLayout {}