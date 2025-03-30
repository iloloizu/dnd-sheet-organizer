import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationComponent],
  template: `
    <nav class="navbar">
      <div class="nav-links">
        <a routerLink="/import" routerLinkActive="active">Import Sheet</a>
        <a routerLink="/view" routerLinkActive="active">View Sheet</a>
      </div>
      <button class="theme-toggle" (click)="toggleDarkMode()">
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </nav>

    <main class="main-content">
      <app-notification></app-notification>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--background-secondary);
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .nav-links a {
      color: var(--text-color);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-links a:hover {
      background-color: var(--primary-color);
      color: white;
    }

    .nav-links a.active {
      background-color: var(--primary-color);
      color: white;
    }

    .theme-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .theme-toggle:hover {
      background-color: var(--background-color);
    }

    .main-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  ngOnInit() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      this.applyTheme(true);
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
