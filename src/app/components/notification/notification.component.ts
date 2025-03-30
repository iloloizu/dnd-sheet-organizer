import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container" *ngIf="currentNotification">
      <div class="notification" [class]="currentNotification.type">
        <span class="message">{{ currentNotification.message }}</span>
        <button class="close-button" (click)="close()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .notification {
      display: flex;
      align-items: center;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      margin-bottom: 10px;
      min-width: 300px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    .message {
      flex: 1;
      margin-right: 12px;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 4px;
      color: inherit;
    }

    .success {
      background-color: #4CAF50;
      color: white;
    }

    .error {
      background-color: #f44336;
      color: white;
    }

    .info {
      background-color: #2196F3;
      color: white;
    }

    .warning {
      background-color: #FFC107;
      color: #000;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  currentNotification: Notification | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(notification => {
      this.currentNotification = notification;
    });
  }

  close() {
    this.notificationService.clear();
  }
} 