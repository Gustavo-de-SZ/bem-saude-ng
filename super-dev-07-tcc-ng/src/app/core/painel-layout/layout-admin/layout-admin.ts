import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { SidebarAdmin } from '../../../shared/components/sidebar-admin/sidebar-admin';
import { TopbarTecnico } from '../../../shared/components/topbar/topbar'; // Reusing Topbar

@Component({
  selector: 'app-painel-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    SidebarAdmin, 
    TopbarTecnico
  ],
  template: `
    <div class="tcc-layout-container">
      
      <div class="tcc-sidebar">
        <div class="tcc-sidebar-brand">
          <h2>Admin Painel</h2>
        </div>
        <app-sidebar-admin></app-sidebar-admin>
      </div>

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
    
    .tcc-sidebar {
      width: 260px;
      height: 100vh;
      background-color: var(--tcc-surface);
      border-right: 1px solid var(--tcc-border);
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .tcc-sidebar-brand {
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0 32px;
      
      h2 {
        font-size: 18px;
        font-weight: 700;
        color: var(--tcc-text-main);
        margin: 0;
      }
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
export class PainelAdminLayout {}
