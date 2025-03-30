import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SheetLayoutComponent } from '../sheet-layout/sheet-layout.component';
import { NotificationComponent } from '../notification/notification.component';
import { SheetService } from '../../services/sheet.service';
import { PdfService } from '../../services/pdf.service';
import { NotificationService } from '../../services/notification.service';
import { SheetData, Ability, Skill, Currency } from '../../models/sheet.model';

interface EditingAbility {
  key: string;
  value: Ability;
}

interface EditingSkill {
  key: string;
  value: Skill;
}

interface EditingCurrency {
  key: keyof Currency;
  value: number;
}

@Component({
  selector: 'app-sheet-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, SheetLayoutComponent, NotificationComponent],
  template: `
    <app-notification></app-notification>
    
    <div class="viewer-container">
      <div class="toolbar">
        <h1>Character Sheet Viewer</h1>
        <div class="actions">
          <button class="action-button" (click)="exportToPDF()" [disabled]="!currentSheet">
            Export to PDF
          </button>
          <button class="action-button" (click)="exportToJSON()" [disabled]="!currentSheet">
            Export to JSON
          </button>
          <button class="action-button" (click)="toggleDarkMode()">
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </div>
      </div>

      <div class="sheet-info" *ngIf="currentSheet">
        <h2>{{ currentSheet.characterInfo?.name || 'Unnamed Character' }}</h2>
        <p>Level {{ currentSheet.characterInfo?.level }} {{ currentSheet.characterInfo?.class }}</p>
      </div>

      <div #sheetContent>
        <app-sheet-layout></app-sheet-layout>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal" *ngIf="isEditing" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Edit {{ editingSection?.title }}</h3>
        <div class="edit-form">
          <ng-container [ngSwitch]="editingSection?.type">
            <!-- Character Info Editor -->
            <div *ngSwitchCase="'characterInfo'" class="character-info-editor">
              <div class="form-group">
                <label>Name:</label>
                <input type="text" [(ngModel)]="editingData.characterInfo.name" />
              </div>
              <div class="form-group">
                <label>Class:</label>
                <input type="text" [(ngModel)]="editingData.characterInfo.class" />
              </div>
              <div class="form-group">
                <label>Level:</label>
                <input type="number" [(ngModel)]="editingData.characterInfo.level" />
              </div>
              <div class="form-group">
                <label>Race:</label>
                <input type="text" [(ngModel)]="editingData.characterInfo.race" />
              </div>
            </div>

            <!-- Abilities Editor -->
            <div *ngSwitchCase="'abilities'" class="abilities-editor">
              <div class="form-group" *ngFor="let ability of getAbilitiesArray()">
                <label>{{ ability.key | titlecase }}:</label>
                <div class="ability-inputs">
                  <input type="number" [(ngModel)]="ability.value.score" />
                  <span class="modifier">({{ ability.value.modifier }})</span>
                </div>
              </div>
            </div>

            <!-- Skills Editor -->
            <div *ngSwitchCase="'skills'" class="skills-editor">
              <div class="form-group" *ngFor="let skill of getSkillsArray()">
                <label>{{ formatSkillName(skill.key) }}:</label>
                <div class="skill-inputs">
                  <input type="number" [(ngModel)]="skill.value.modifier" />
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="skill.value.proficient" />
                    Proficient
                  </label>
                </div>
              </div>
            </div>

            <!-- Spells Editor -->
            <div *ngSwitchCase="'spells'" class="spells-editor">
              <div class="spell-slots">
                <h4>Spell Slots</h4>
                <div class="form-group" *ngFor="let slot of editingData.spells.spellSlots">
                  <label>Level {{ slot.level }}:</label>
                  <div class="slot-inputs">
                    <input type="number" [(ngModel)]="slot.current" />
                    <span>/</span>
                    <input type="number" [(ngModel)]="slot.maximum" />
                  </div>
                </div>
              </div>
              <div class="spell-list">
                <h4>Spells</h4>
                <div class="form-group" *ngFor="let spell of editingData.spells.spells">
                  <label>{{ spell.name }}</label>
                  <div class="spell-inputs">
                    <input type="number" [(ngModel)]="spell.level" />
                    <label class="checkbox-label">
                      <input type="checkbox" [(ngModel)]="spell.prepared" />
                      Prepared
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inventory Editor -->
            <div *ngSwitchCase="'inventory'" class="inventory-editor">
              <div class="currency">
                <h4>Currency</h4>
                <div class="form-group" *ngFor="let curr of getCurrencyArray()">
                  <label>{{ curr.key | uppercase }}:</label>
                  <input type="number" [(ngModel)]="editingData.inventory.currency[curr.key]" />
                </div>
              </div>
              <div class="items">
                <h4>Items</h4>
                <div class="form-group" *ngFor="let item of editingData.inventory.items">
                  <label>Name:</label>
                  <input type="text" [(ngModel)]="item.name" />
                  <label>Quantity:</label>
                  <input type="number" [(ngModel)]="item.quantity" />
                </div>
              </div>
            </div>
          </ng-container>
        </div>
        <div class="modal-actions">
          <button class="action-button" (click)="saveEdit()">Save</button>
          <button class="action-button cancel" (click)="closeEditModal()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      min-height: 100vh;
      background-color: var(--background-color);
      color: var(--text-color);
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: var(--toolbar-background);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .action-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .action-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .action-button:hover:not(:disabled) {
      background-color: var(--primary-color-dark);
    }

    .sheet-info {
      padding: 1rem 2rem;
      text-align: center;
      background-color: var(--secondary-background);
    }

    .sheet-info h2 {
      margin: 0;
      font-size: 2rem;
    }

    .sheet-info p {
      margin: 0.5rem 0 0;
      font-size: 1.2rem;
      color: var(--secondary-text);
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: var(--background-color);
      padding: 2rem;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .edit-form {
      margin: 1rem 0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    .form-group input[type="text"],
    .form-group input[type="number"] {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--background-color);
      color: var(--text-color);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ability-inputs,
    .skill-inputs,
    .spell-inputs,
    .slot-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modifier {
      color: var(--primary-color);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .action-button.cancel {
      background-color: #f44336;
    }

    .action-button.cancel:hover {
      background-color: #d32f2f;
    }
  `]
})
export class SheetViewerComponent implements OnInit {
  @ViewChild('sheetContent') sheetContent!: ElementRef;
  currentSheet: SheetData | null = null;
  editingData: SheetData | null = null;
  editingSection: { id: string; title: string } | null = null;
  isDarkMode = false;
  isEditing = false;

  constructor(
    private sheetService: SheetService,
    private pdfService: PdfService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.sheetService.currentSheet$.subscribe(sheet => {
      this.currentSheet = sheet;
    });

    this.sheetService.editSection$.subscribe(section => {
      if (section) {
        this.editSection(section);
      }
    });
  }

  getAbilitiesArray(): EditingAbility[] {
    if (!this.editingData?.abilities) return [];
    return Object.entries(this.editingData.abilities).map(([key, value]) => ({
      key,
      value
    }));
  }

  getSkillsArray(): EditingSkill[] {
    if (!this.editingData?.skills) return [];
    return Object.entries(this.editingData.skills).map(([key, value]) => ({
      key,
      value
    }));
  }

  getCurrencyArray(): EditingCurrency[] {
    if (!this.editingData?.inventory?.currency) return [];
    return Object.entries(this.editingData.inventory.currency).map(([key, value]) => ({
      key: key as keyof Currency,
      value
    }));
  }

  formatSkillName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').trim();
  }

  async exportToPDF() {
    if (!this.currentSheet) return;
    
    try {
      const element = this.sheetContent.nativeElement;
      await this.pdfService.generatePDF(element, this.currentSheet);
      this.notificationService.showSuccess('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      this.notificationService.showError('Failed to export PDF. Please try again.');
    }
  }

  exportToJSON() {
    if (!this.currentSheet) return;
    
    try {
      const jsonString = JSON.stringify(this.currentSheet, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.currentSheet.characterInfo?.name || 'character'}-sheet.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      this.notificationService.showSuccess('JSON exported successfully');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      this.notificationService.showError('Failed to export JSON. Please try again.');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }

  editSection(section: any) {
    if (!this.currentSheet) return;
    
    this.editingSection = section;
    this.editingData = JSON.parse(JSON.stringify(this.currentSheet));
    this.isEditing = true;
  }

  saveEdit() {
    if (!this.editingSection || !this.editingData) return;
    
    try {
      this.sheetService.updateSheetData(this.editingData);
      this.closeEditModal();
      this.notificationService.showSuccess('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      this.notificationService.showError('Failed to save changes. Please try again.');
    }
  }

  closeEditModal() {
    this.isEditing = false;
    this.editingSection = null;
    this.editingData = null;
  }
}
