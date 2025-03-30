import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  show(notification: Notification) {
    this.notificationSubject.next(notification);
    
    if (notification.duration !== undefined) {
      setTimeout(() => {
        this.clear();
      }, notification.duration);
    }
  }

  showSuccess(message: string, duration = 3000) {
    this.show({ message, type: 'success', duration });
  }

  showError(message: string, duration = 5000) {
    this.show({ message, type: 'error', duration });
  }

  showInfo(message: string, duration = 3000) {
    this.show({ message, type: 'info', duration });
  }

  clear() {
    this.notificationSubject.next(null);
  }
} 