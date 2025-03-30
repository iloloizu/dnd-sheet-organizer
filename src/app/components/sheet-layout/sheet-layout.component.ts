import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SheetService } from '../../services/sheet.service';
import { SheetData, Section } from '../../models/sheet.model';

@Component({
  selector: 'app-sheet-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sheet-layout" *ngIf="currentSheet">
      <div *ngFor="let section of currentSheet.layout.sections" class="section" [class.collapsed]="section.collapsed">
        <div class="section-header" (click)="toggleSection(section)">
          <h3>{{ section.title }}</h3>
          <button class="toggle-button">{{ section.collapsed ? '+' : '-' }}</button>
        </div>
        
        <div class="section-content" *ngIf="!section.collapsed">
          <!-- Character Info Section -->
          <div *ngIf="section.id === 'characterInfo'" class="character-info">
            <div class="info-row">
              <div class="info-item">
                <label>Name:</label>
                <span>{{ currentSheet.characterInfo?.name || 'Unknown' }}</span>
              </div>
              <div class="info-item">
                <label>Class:</label>
                <span>{{ currentSheet.characterInfo?.class || 'Unknown' }}</span>
              </div>
              <div class="info-item">
                <label>Level:</label>
                <span>{{ currentSheet.characterInfo?.level || 1 }}</span>
              </div>
            </div>
          </div>

          <!-- Abilities Section -->
          <div *ngIf="section.id === 'abilities'" class="abilities">
            <div class="ability-row" *ngFor="let ability of getAbilities()">
              <div class="ability-name">{{ ability.name }}</div>
              <div class="ability-score">{{ ability.score }}</div>
              <div class="ability-modifier">{{ formatModifier(ability.modifier) }}</div>
            </div>
          </div>

          <!-- Skills Section -->
          <div *ngIf="section.id === 'skills'" class="skills">
            <div class="skill-row" *ngFor="let skill of getSkills()">
              <div class="skill-name">
                {{ formatSkillName(skill.name) }}
                <span *ngIf="skill.proficient" class="proficient">•</span>
              </div>
              <div class="skill-modifier">{{ formatModifier(skill.modifier) }}</div>
            </div>
          </div>

          <!-- Spells Section -->
          <div *ngIf="section.id === 'spells'" class="spells">
            <div class="spell-slots" *ngIf="currentSheet.spells.spellSlots.length">
              <h4>Spell Slots</h4>
              <div class="slot-row" *ngFor="let slot of currentSheet.spells.spellSlots">
                <span>Level {{ slot.level }}:</span>
                <span>{{ slot.current }}/{{ slot.maximum }}</span>
              </div>
            </div>
            <div class="spell-list" *ngIf="currentSheet.spells.spells.length">
              <h4>Spells</h4>
              <div class="spell-row" *ngFor="let spell of currentSheet.spells.spells">
                <span class="spell-name">{{ spell.name }}</span>
                <span class="spell-level">Level {{ spell.level }}</span>
              </div>
            </div>
          </div>

          <!-- Inventory Section -->
          <div *ngIf="section.id === 'inventory'" class="inventory">
            <div class="currency">
              <h4>Currency</h4>
              <div class="currency-row">
                <span *ngFor="let currency of getCurrency()" class="currency-item">
                  {{ currency.amount }} {{ currency.name }}
                </span>
              </div>
            </div>
            <div class="items" *ngIf="currentSheet.inventory.items.length">
              <h4>Items</h4>
              <div class="item-row" *ngFor="let item of currentSheet.inventory.items">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sheet-layout {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .section {
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: var(--section-header-background);
      cursor: pointer;
    }

    .section-header h3 {
      margin: 0;
    }

    .toggle-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--text-color);
    }

    .section-content {
      padding: 20px;
      background-color: var(--section-content-background);
    }

    .info-row, .ability-row, .skill-row, .spell-row, .item-row {
      display: flex;
      margin-bottom: 10px;
      padding: 5px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .info-item {
      flex: 1;
    }

    .info-item label {
      font-weight: bold;
      margin-right: 10px;
    }

    .ability-name, .skill-name {
      flex: 2;
    }

    .ability-score, .ability-modifier, .skill-modifier {
      flex: 1;
      text-align: center;
    }

    .proficient {
      color: var(--primary-color);
      margin-left: 5px;
    }

    .currency-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .currency-item {
      flex: 1;
      text-align: center;
    }

    .spell-slots, .spell-list, .currency, .items {
      margin-bottom: 20px;
    }

    h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--text-color);
    }
  `]
})
export class SheetLayoutComponent implements OnInit {
  currentSheet: SheetData | null = null;

  constructor(private sheetService: SheetService) {}

  ngOnInit() {
    this.sheetService.currentSheet$.subscribe(
      sheet => this.currentSheet = sheet
    );
  }

  toggleSection(section: Section) {
    section.collapsed = !section.collapsed;
  }

  getAbilities() {
    if (!this.currentSheet) return [];
    return Object.entries(this.currentSheet.abilities).map(([name, ability]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ...ability
    }));
  }

  getSkills() {
    if (!this.currentSheet) return [];
    return Object.entries(this.currentSheet.skills).map(([name, skill]) => ({
      name,
      ...skill
    }));
  }

  getCurrency() {
    if (!this.currentSheet) return [];
    return Object.entries(this.currentSheet.inventory.currency).map(([name, amount]) => ({
      name: name.toUpperCase(),
      amount
    }));
  }

  formatModifier(modifier: number): string {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }

  formatSkillName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').trim();
  }
} 