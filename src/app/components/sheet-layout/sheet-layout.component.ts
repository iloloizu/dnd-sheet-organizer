import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SheetService } from '../../services/sheet.service';
import { SheetData } from '../../models/sheet.model';

@Component({
  selector: 'app-sheet-layout',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="sections-container" cdkDropList (cdkDropListDropped)="drop($event)">
      <div *ngFor="let section of sections" 
           class="section-card" 
           cdkDrag 
           [class.dragging]="section.isDragging">
        <div class="section-header">
          <span class="section-title">{{ section.title }}</span>
          <button class="edit-button" (click)="editSection(section)">Edit</button>
        </div>
        <div class="section-content">
          <ng-container [ngSwitch]="section.type">
            <!-- Character Info Section -->
            <div *ngSwitchCase="'characterInfo'" class="character-info">
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">{{ sheetData?.characterInfo?.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">Class:</span>
                <span class="value">{{ sheetData?.characterInfo?.class }}</span>
              </div>
              <div class="info-row">
                <span class="label">Level:</span>
                <span class="value">{{ sheetData?.characterInfo?.level }}</span>
              </div>
              <div class="info-row">
                <span class="label">Race:</span>
                <span class="value">{{ sheetData?.characterInfo?.race }}</span>
              </div>
            </div>

            <!-- Abilities Section -->
            <div *ngSwitchCase="'abilities'" class="abilities">
              <div *ngFor="let ability of sheetData?.abilities | keyvalue" class="ability-row">
                <span class="ability-name">{{ ability.key | titlecase }}:</span>
                <span class="ability-score">{{ ability.value.score }}</span>
                <span class="ability-modifier">({{ ability.value.modifier }})</span>
              </div>
            </div>

            <!-- Skills Section -->
            <div *ngSwitchCase="'skills'" class="skills">
              <div *ngFor="let skill of sheetData?.skills | keyvalue" class="skill-row">
                <span class="skill-name">{{ skill.key | titlecase }}:</span>
                <span class="skill-modifier">{{ skill.value.modifier }}</span>
                <span class="skill-proficiency" *ngIf="skill.value.proficient">●</span>
              </div>
            </div>

            <!-- Spells Section -->
            <div *ngSwitchCase="'spells'" class="spells">
              <div class="spell-slots">
                <div *ngFor="let slot of sheetData?.spells?.spellSlots" class="spell-slot">
                  Level {{ slot.level }}: {{ slot.current }}/{{ slot.maximum }}
                </div>
              </div>
              <div class="spell-list">
                <div *ngFor="let spell of sheetData?.spells?.spells" class="spell-item">
                  {{ spell.name }} (Level {{ spell.level }})
                </div>
              </div>
            </div>

            <!-- Inventory Section -->
            <div *ngSwitchCase="'inventory'" class="inventory">
              <div class="currency">
                <span *ngFor="let currency of sheetData?.inventory?.currency | keyvalue">
                  {{ currency.key | uppercase }}: {{ currency.value }}
                </span>
              </div>
              <div class="items">
                <div *ngFor="let item of sheetData?.inventory?.items" class="item">
                  {{ item.name }} ({{ item.quantity }})
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sections-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .section-card {
      background: var(--background-color);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 16px;
      cursor: move;
      transition: box-shadow 0.2s;
      border: 1px solid var(--border-color);
    }

    .section-card.dragging {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .section-title {
      font-weight: bold;
      font-size: 1.2em;
    }

    .edit-button {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    .section-content {
      font-size: 0.9em;
    }

    .info-row, .ability-row, .skill-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .label {
      font-weight: bold;
      color: var(--secondary-text);
    }

    .ability-modifier, .skill-modifier {
      color: var(--primary-color);
    }

    .skill-proficiency {
      color: #FFC107;
    }

    .spell-slots {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .spell-slot {
      background: var(--secondary-background);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .spell-item {
      padding: 4px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .currency {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item {
      padding: 4px 0;
      border-bottom: 1px solid var(--border-color);
    }
  `]
})
export class SheetLayoutComponent implements OnInit {
  sheetData: SheetData | null = null;
  sections = [
    { id: 'characterInfo', title: 'Character Info', type: 'characterInfo', isDragging: false },
    { id: 'abilities', title: 'Abilities', type: 'abilities', isDragging: false },
    { id: 'skills', title: 'Skills', type: 'skills', isDragging: false },
    { id: 'spells', title: 'Spells', type: 'spells', isDragging: false },
    { id: 'inventory', title: 'Inventory', type: 'inventory', isDragging: false }
  ];

  constructor(private sheetService: SheetService) {}

  ngOnInit() {
    this.sheetService.getCurrentSheet().subscribe(sheet => {
      this.sheetData = sheet;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.saveLayout();
  }

  editSection(section: any) {
    // Emit event to parent component
    this.sheetService.editSection(section);
  }

  private saveLayout() {
    // Save section order to local storage
    localStorage.setItem('sheetLayout', JSON.stringify(this.sections));
  }
} 