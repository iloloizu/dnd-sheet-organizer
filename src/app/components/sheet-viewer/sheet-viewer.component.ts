import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SheetLayoutComponent } from '../sheet-layout/sheet-layout.component';
import { NotificationComponent } from '../notification/notification.component';
import { SheetService } from '../../services/sheet.service';
import { PdfService } from '../../services/pdf.service';
import { NotificationService } from '../../services/notification.service';
import { SheetData, Ability, Skill, Currency, Abilities, Skills } from '../../models/sheet.model';

interface EditingSection {
  id: string;
  title: string;
  type: 'characterInfo' | 'abilities' | 'skills' | 'spells' | 'inventory';
}

interface EditingAbility {
  name: keyof Abilities;
  score: number;
  modifier: number;
}

interface EditingSkill {
  name: keyof Skills;
  modifier: number;
  proficient: boolean;
}

interface EditingCurrency {
  name: keyof Currency;
  amount: number;
}

@Component({
  selector: 'app-sheet-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, SheetLayoutComponent, NotificationComponent],
  template: `
    <app-notification></app-notification>
    
    <div class="sheet-container" *ngIf="currentSheet">
      <!-- Character Header -->
      <div class="character-header">
        <h2>{{ currentSheet.characterInfo.name || 'Unnamed Character' }}</h2>
        <p class="character-subtitle">
          Level {{ currentSheet.characterInfo.level || 1 }} 
          {{ currentSheet.characterInfo.race || 'Unknown Race' }} 
          {{ currentSheet.characterInfo.class || 'Unknown Class' }}
          <span *ngIf="currentSheet.characterInfo.background">
            ({{ currentSheet.characterInfo.background }})
          </span>
        </p>
      </div>

      <!-- Basic Stats -->
      <div class="basic-stats">
        <div class="stat-box">
          <label>Armor Class</label>
          <div class="value">{{ currentSheet.characterInfo.armorClass || 10 }}</div>
        </div>
        <div class="stat-box">
          <label>Initiative</label>
          <div class="value">{{ currentSheet.characterInfo.initiative || 0 }}</div>
        </div>
        <div class="stat-box">
          <label>Speed</label>
          <div class="value">{{ currentSheet.characterInfo.speed || 30 }}</div>
        </div>
        <div class="stat-box">
          <label>Hit Points</label>
          <div class="value">
            {{ currentSheet.characterInfo.hitPoints?.current || 0 }} / 
            {{ currentSheet.characterInfo.hitPoints?.maximum || 0 }}
          </div>
        </div>
      </div>

      <!-- Abilities Section -->
      <section class="abilities-section">
        <h3>Abilities</h3>
        <div class="abilities-grid">
          <div class="ability-box" *ngFor="let ability of getAbilitiesArray()">
            <label>{{ formatAbilityName(ability.name) }}</label>
            <div class="ability-score">{{ ability.score }}</div>
            <div class="ability-modifier" [class.positive]="ability.modifier >= 0">
              {{ ability.modifier >= 0 ? '+' : '' }}{{ ability.modifier }}
            </div>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="skills-section">
        <h3>Skills</h3>
        <div class="skills-list">
          <div class="skill-item" *ngFor="let skill of getSkillsArray()">
            <div class="skill-name">
              <span class="proficiency-indicator" [class.proficient]="skill.proficient">●</span>
              {{ formatSkillName(skill.name) }}
            </div>
            <div class="skill-modifier" [class.positive]="skill.modifier >= 0">
              {{ skill.modifier >= 0 ? '+' : '' }}{{ skill.modifier }}
            </div>
          </div>
        </div>
      </section>

      <!-- Inventory Section -->
      <section class="inventory-section">
        <h3>Inventory</h3>
        <div class="currency-grid">
          <div class="currency-box" *ngFor="let currency of getCurrencyArray()">
            <label>{{ formatCurrencyName(currency.name) }}</label>
            <div class="value">{{ currency.amount }}</div>
          </div>
        </div>
        <div class="items-list">
          <div class="item" *ngFor="let item of currentSheet.inventory.items">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
            <div class="item-description" *ngIf="item.description">
              {{ item.description }}
            </div>
          </div>
        </div>
      </section>
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
                <input type="text" [(ngModel)]="editingData!.characterInfo.name" />
              </div>
              <div class="form-group">
                <label>Class:</label>
                <input type="text" [(ngModel)]="editingData!.characterInfo.class" />
              </div>
              <div class="form-group">
                <label>Level:</label>
                <input type="number" [(ngModel)]="editingData!.characterInfo.level" />
              </div>
              <div class="form-group">
                <label>Race:</label>
                <input type="text" [(ngModel)]="editingData!.characterInfo.race" />
              </div>
            </div>

            <!-- Abilities Editor -->
            <div *ngSwitchCase="'abilities'" class="abilities-editor">
              <div class="form-group" *ngFor="let ability of editingAbilities">
                <label>{{ formatAbilityName(ability.name) }}:</label>
                <div class="ability-inputs">
                  <input type="number" [(ngModel)]="ability.score" />
                  <span class="modifier">({{ ability.modifier }})</span>
                </div>
              </div>
            </div>

            <!-- Skills Editor -->
            <div *ngSwitchCase="'skills'" class="skills-editor">
              <div class="form-group" *ngFor="let skill of editingSkills">
                <label>{{ formatSkillName(skill.name) }}:</label>
                <div class="skill-inputs">
                  <input type="number" [(ngModel)]="skill.modifier" />
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="skill.proficient" />
                    Proficient
                  </label>
                </div>
              </div>
            </div>

            <!-- Spells Editor -->
            <div *ngSwitchCase="'spells'" class="spells-editor">
              <div class="spell-slots">
                <h4>Spell Slots</h4>
                <div class="form-group" *ngFor="let slot of editingData!.spells.spellSlots">
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
                <div class="form-group" *ngFor="let spell of editingData!.spells.spells">
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
                <div class="form-group" *ngFor="let curr of editingCurrency">
                  <label>{{ formatCurrencyName(curr.name) }}:</label>
                  <input type="number" [(ngModel)]="curr.amount" />
                </div>
              </div>
              <div class="items">
                <h4>Items</h4>
                <div class="form-group" *ngFor="let item of editingData!.inventory.items">
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
    .sheet-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: var(--background-color);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .character-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .character-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .character-subtitle {
      color: var(--text-secondary);
      font-size: 1.2rem;
    }

    .basic-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-box {
      text-align: center;
      padding: 1rem;
      background-color: var(--background-secondary);
      border-radius: 6px;
    }

    .stat-box label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .stat-box .value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--text-color);
    }

    .abilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .ability-box {
      text-align: center;
      padding: 1rem;
      background-color: var(--background-secondary);
      border-radius: 6px;
    }

    .ability-score {
      font-size: 2rem;
      font-weight: bold;
      color: var(--text-color);
    }

    .ability-modifier {
      font-size: 1.2rem;
      color: var(--text-secondary);
    }

    .ability-modifier.positive {
      color: var(--success-color);
    }

    .skills-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background-color: var(--background-secondary);
      border-radius: 4px;
    }

    .proficiency-indicator {
      margin-right: 0.5rem;
      color: var(--text-secondary);
    }

    .proficiency-indicator.proficient {
      color: var(--primary-color);
    }

    .skill-modifier {
      font-weight: bold;
    }

    .skill-modifier.positive {
      color: var(--success-color);
    }

    .currency-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .currency-box {
      text-align: center;
      padding: 0.5rem;
      background-color: var(--background-secondary);
      border-radius: 4px;
    }

    .items-list {
      display: grid;
      gap: 0.5rem;
    }

    .item {
      padding: 0.75rem;
      background-color: var(--background-secondary);
      border-radius: 4px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .item-name {
      font-weight: bold;
      color: var(--text-color);
    }

    .item-quantity {
      color: var(--text-secondary);
    }

    .item-description {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    section {
      margin-bottom: 2rem;
    }

    h3 {
      margin-bottom: 1rem;
      color: var(--text-color);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

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
  editingSection: EditingSection | null = null;
  editingAbilities: EditingAbility[] = [];
  editingSkills: EditingSkill[] = [];
  editingCurrency: EditingCurrency[] = [];
  isDarkMode = false;
  isEditing = false;

  constructor(
    private sheetService: SheetService,
    private pdfService: PdfService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.sheetService.currentSheet$.subscribe(sheet => {
      console.log('Received sheet data:', sheet);
      this.currentSheet = sheet;
    });

    this.sheetService.editSection$.subscribe(section => {
      if (section) {
        this.editSection(section);
      }
    });
  }

  getAbilitiesArray(): EditingAbility[] {
    if (!this.currentSheet?.abilities) return [];
    
    return Object.entries(this.currentSheet.abilities).map(([key, value]) => ({
      name: key as keyof Abilities,
      score: value.score,
      modifier: value.modifier
    }));
  }

  getSkillsArray(): EditingSkill[] {
    if (!this.currentSheet?.skills) return [];
    
    return Object.entries(this.currentSheet.skills).map(([key, value]) => ({
      name: key as keyof Skills,
      modifier: value.modifier,
      proficient: value.proficient
    }));
  }

  getCurrencyArray(): EditingCurrency[] {
    if (!this.currentSheet?.inventory?.currency) return [];
    
    return Object.entries(this.currentSheet.inventory.currency).map(([key, value]) => ({
      name: key as keyof Currency,
      amount: value
    }));
  }

  formatAbilityName(name: keyof Abilities): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  formatSkillName(name: keyof Skills): string {
    return name.replace(/([A-Z])/g, ' $1').trim();
  }

  formatCurrencyName(name: keyof Currency): string {
    return name.toUpperCase();
  }

  async exportToPDF() {
    if (!this.currentSheet || !this.sheetContent) return;
    
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

  editSection(section: EditingSection) {
    if (!this.currentSheet) return;
    
    this.editingSection = section;
    this.editingData = JSON.parse(JSON.stringify(this.currentSheet));
    
    // Initialize editing arrays based on section type
    switch (section.type) {
      case 'abilities':
        this.editingAbilities = this.getAbilitiesArray();
        break;
      case 'skills':
        this.editingSkills = this.getSkillsArray();
        break;
      case 'inventory':
        this.editingCurrency = this.getCurrencyArray();
        break;
    }
    
    this.isEditing = true;
  }

  saveEdit() {
    if (!this.editingSection || !this.editingData) return;
    
    try {
      // Update the editing data based on section type
      switch (this.editingSection.type) {
        case 'abilities':
          this.editingAbilities.forEach(ability => {
            const key = ability.name;
            this.editingData!.abilities[key].score = ability.score;
            this.editingData!.abilities[key].modifier = ability.modifier;
          });
          break;
        case 'skills':
          this.editingSkills.forEach(skill => {
            const key = skill.name;
            this.editingData!.skills[key].modifier = skill.modifier;
            this.editingData!.skills[key].proficient = skill.proficient;
          });
          break;
        case 'inventory':
          this.editingCurrency.forEach(curr => {
            const key = curr.name;
            if (this.editingData!.inventory.currency) {
              this.editingData!.inventory.currency[key] = curr.amount;
            }
          });
          break;
      }

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
    this.editingAbilities = [];
    this.editingSkills = [];
    this.editingCurrency = [];
  }
}
