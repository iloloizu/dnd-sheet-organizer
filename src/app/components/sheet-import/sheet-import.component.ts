import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SheetService } from '../../services/sheet.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-sheet-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="import-container">
      <h2>Import Character Sheet</h2>
      <div class="import-form">
        <div class="form-group">
          <label for="url">D&D Beyond Character URL:</label>
          <input 
            type="text" 
            id="url" 
            [(ngModel)]="url" 
            placeholder="https://www.dndbeyond.com/characters/..."
          >
        </div>
        <button (click)="importSheet()" [disabled]="!url">Import</button>
      </div>
      <div class="instructions">
        <h3>How to Import Your Character:</h3>
        <ol>
          <li>Go to your character sheet on <a href="https://www.dndbeyond.com/characters" target="_blank">D&D Beyond</a></li>
          <li>Make sure your character is set to "Public" in the sharing settings</li>
          <li>Copy the URL from your browser's address bar</li>
          <li>Paste it here and click Import</li>
        </ol>
        <div class="example">
          <p>Example URL: https://www.dndbeyond.com/characters/12345678</p>
        </div>
        <div class="note">
          <p>Note: Your character must be publicly accessible on D&D Beyond for the import to work.</p>
          <p>Need help? <a href="https://www.dndbeyond.com/forums/d-d-beyond-general/general-discussion/8569-how-to-share-characters" target="_blank">Learn how to make your character public</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .import-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: var(--background-color);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      margin-bottom: 2rem;
      color: var(--text-color);
    }

    .import-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: bold;
      color: var(--text-color);
    }

    input {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--input-background);
      color: var(--text-color);
    }

    button {
      padding: 0.75rem 1.5rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover:not(:disabled) {
      background-color: var(--primary-color-dark);
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .instructions {
      padding: 1.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .instructions h3 {
      margin-bottom: 1rem;
      color: #4a4a4a;
      font-size: 1.2rem;
    }

    .instructions ol {
      margin-left: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .instructions li {
      margin-bottom: 0.75rem;
      color: #666;
      line-height: 1.4;
    }

    .example {
      margin: 1rem 0;
      padding: 1rem;
      background-color: #fff;
      border-radius: 4px;
      border: 1px dashed #ddd;
    }

    .example p {
      color: #666;
      font-family: monospace;
      margin: 0;
    }

    .note {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }

    .note p {
      color: #666;
      font-style: italic;
      margin-bottom: 0.5rem;
    }

    a {
      color: #7b1fa2;
      text-decoration: none;
      transition: color 0.2s;
    }

    a:hover {
      color: #6a1b9a;
      text-decoration: underline;
    }
  `]
})
export class SheetImportComponent {
  url: string = '';

  constructor(
    private sheetService: SheetService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  async importSheet() {
    if (!this.url) {
      this.notificationService.showError('Please enter a valid D&D Beyond character URL');
      return;
    }

    try {
      await this.sheetService.importFromDndBeyond(this.url);
      this.notificationService.showSuccess('Character imported successfully');
      this.url = '';
      this.router.navigate(['/view']);
    } catch (error) {
      console.error('Error importing character:', error);
      this.notificationService.showError(error instanceof Error ? error.message : 'Failed to import character');
    }
  }
} 