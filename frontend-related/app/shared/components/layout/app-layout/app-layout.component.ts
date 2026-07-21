import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { AuthService } from '../../../../services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shared-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="tcc-layout-container">
      <app-sidebar
        [brandTitle]="brandTitle"
        [brandSubtitle]="brandSubtitle"
        [brandIcon]="brandIcon"
        [navItems]="navItems"
        [footerItems]="footerItems"
        (logout)="onLogout()">
      </app-sidebar>
      
      <div class="tcc-main-wrapper">
        <div class="tcc-topbar-container">
          <app-topbar
            [userName]="userName"
            [userRole]="userRole"
            [userAvatar]="userAvatar"
            [isDarkMode]="isDark"
            [searchPlaceholder]="searchPlaceholder"
            [showMessages]="showMessages"
            [showNotifications]="showNotifications"
            [notificationCount]="notificationCount"
            (toggleTheme)="onToggleTheme()"
            (search)="onSearch($event)">
          </app-topbar>
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
      
      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background-color: var(--tcc-border, #e2e8f0);
        border-radius: 4px;
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  userName = 'Usuário';
  userRole = '';
  userAvatar = '';
  isDark = false;
  
  brandTitle = 'TechConnect';
  brandSubtitle = '';
  brandIcon = 'pi-desktop';
  searchPlaceholder = 'Buscar...';
  showMessages = false;
  showNotifications = true;
  notificationCount = 0;

  navItems: NavItem[] = [];
  footerItems: NavItem[] = [];

  ngOnInit() {
    this.isDark = this.themeService.isDark();
    
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.name || user.given_name || 'Usuário';
        this.userAvatar = user.picture;
        
        const roles = user['https://tcc-ng.com/roles'] || [];
        const role = roles.length > 0 ? roles[0].toLowerCase() : '';
        
        // Initial configuration based on URL
        this.configureLayoutForCurrentRoute(role);
      }
    });

    // Handle role dynamically if routing changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
       this.configureLayoutForCurrentRoute();
    });
  }

  configureLayoutForCurrentRoute(fallbackRole?: string) {
    const url = this.router.url;
    let role = fallbackRole;

    if (url.includes('/admin')) {
      role = 'admin';
    } else if (url.includes('/cliente')) {
      role = 'cliente';
    } else if (url.includes('/painel')) {
      role = 'tecnico';
    }

    if (role === 'admin') {
      this.brandSubtitle = 'Painel Admin';
      this.searchPlaceholder = 'Buscar técnicos, clientes...';
      this.showMessages = false;
      this.userRole = 'Administrador';
      this.navItems = [
        { route: '/admin/dashboard', icon: 'pi-th-large', label: 'Visão Geral' },
        { route: '/admin/tecnicos', icon: 'pi-users', label: 'Aprovar Técnicos' }
      ];
      this.footerItems = [
        { route: '/cliente/configuracoes', icon: 'pi-cog', label: 'Configurações' }
      ];
    } else if (role === 'cliente') {
      this.brandSubtitle = 'Área do Cliente';
      this.searchPlaceholder = 'Buscar profissionais ou serviços...';
      this.showMessages = true;
      this.userRole = 'Cliente';
      this.navItems = [
        { route: '/cliente/inicio', icon: 'pi-home', label: 'Início' },
        { route: '/cliente/buscar', icon: 'pi-search', label: 'Buscar Profissionais' },
        { route: '/cliente/meus-chamados', icon: 'pi-list', label: 'Meus Chamados' },
        { route: '/cliente/agendamentos', icon: 'pi-calendar', label: 'Meus Agendamentos' },
        { route: '/cliente/historico', icon: 'pi-history', label: 'Histórico' }
      ];
      this.footerItems = [
        { route: '/cliente/ajuda', icon: 'pi-question-circle', label: 'Ajuda' },
        { route: '/cliente/configuracoes', icon: 'pi-cog', label: 'Configurações' }
      ];
    } else {
      // Default to tecnico
      this.brandSubtitle = 'Painel do Profissional';
      this.searchPlaceholder = 'Buscar clientes, agendamentos...';
      this.showMessages = true;
      this.userRole = 'Técnico';
      this.navItems = [
        { route: '/painel/dashboard', icon: 'pi-th-large', label: 'Visão Geral' },
        { route: '/painel/clientes', icon: 'pi-users', label: 'Clientes' },
        { route: '/painel/agenda', icon: 'pi-calendar', label: 'Agenda' },
        { route: '/painel/servicos', icon: 'pi-desktop', label: 'Serviços' },
        { route: '/painel/financeiro', icon: 'pi-money-bill', label: 'Financeiro' }
      ];
      this.footerItems = [
        { route: '/cliente/ajuda', icon: 'pi-question-circle', label: 'Ajuda' },
        { route: '/cliente/configuracoes', icon: 'pi-cog', label: 'Configurações' }
      ];
    }
  }

  onToggleTheme() {
    this.themeService.toggle();
    this.isDark = this.themeService.isDark();
  }

  onSearch(value: string) {
    console.log('Pesquisando por:', value);
  }

  onLogout() {
    this.authService.logout();
  }
}
