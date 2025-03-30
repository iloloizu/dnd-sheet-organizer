import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { SheetData, CharacterInfo, Abilities, Skills, Spells, Inventory, Layout, Item } from '../models/sheet.model';

@Injectable({
  providedIn: 'root'
})
export class SheetService {
  private currentSheetSubject = new BehaviorSubject<SheetData | null>(null);
  currentSheet$ = this.currentSheetSubject.asObservable();

  private editSectionSubject = new BehaviorSubject<any>(null);
  editSection$ = this.editSectionSubject.asObservable();

  // CORS proxy URL - we'll need this to bypass CORS restrictions
  private corsProxy = 'https://corsproxy.io/?';

  constructor(private http: HttpClient) {}

  async importFromDndBeyond(url: string): Promise<void> {
    try {
      console.log('Starting D&D Beyond import process...', url);
      
      // Extract character ID from URL
      const characterId = this.extractCharacterId(url);
      if (!characterId) {
        throw new Error('Invalid D&D Beyond URL');
      }
      console.log('Extracted character ID:', characterId);

      // Fetch the HTML content through the CORS proxy
      const proxyUrl = `${this.corsProxy}${encodeURIComponent(url)}`;
      console.log('Fetching from proxy URL:', proxyUrl);
      
      const response = await this.http.get(proxyUrl, { responseType: 'text' }).toPromise();
      if (!response) {
        throw new Error('Failed to fetch character data');
      }
      console.log('Received HTML response length:', response.length);

      // Create a DOM parser to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(response, 'text/html');

      // Parse the character data from the HTML
      const sheetData = this.parseCharacterDataFromHtml(doc);
      console.log('Parsed sheet data:', sheetData);
      
      this.currentSheetSubject.next(sheetData);
      this.saveToLocalStorage(sheetData);
      console.log('Character data imported and saved successfully');
    } catch (error) {
      console.error('Error importing from D&D Beyond:', error);
      throw new Error(`Failed to import character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseCharacterDataFromHtml(doc: Document): SheetData {
    // Extract character info
    const characterInfo: CharacterInfo = {
      name: this.getTextContent(doc, '.ddbc-character-name'),
      class: this.getTextContent(doc, '.ddbc-character-summary__classes'),
      level: parseInt(this.getTextContent(doc, '.ddbc-character-summary__level') || '1'),
      race: this.getTextContent(doc, '.ddbc-character-summary__race'),
      hitPoints: {
        maximum: parseInt(this.getTextContent(doc, '.ddbc-hit-points__max-hp') || '0'),
        current: parseInt(this.getTextContent(doc, '.ddbc-hit-points__current-hp') || '0'),
        temporary: parseInt(this.getTextContent(doc, '.ddbc-hit-points__temp-hp') || '0')
      },
      armorClass: parseInt(this.getTextContent(doc, '.ddbc-armor-class-box__value') || '10'),
      initiative: parseInt(this.getTextContent(doc, '.ddbc-initiative-box__value') || '0'),
      speed: parseInt(this.getTextContent(doc, '.ddbc-speed-box__value') || '30')
    };

    // Extract abilities
    const abilities: Abilities = {
      strength: this.parseAbilityScore(doc, 'Strength'),
      dexterity: this.parseAbilityScore(doc, 'Dexterity'),
      constitution: this.parseAbilityScore(doc, 'Constitution'),
      intelligence: this.parseAbilityScore(doc, 'Intelligence'),
      wisdom: this.parseAbilityScore(doc, 'Wisdom'),
      charisma: this.parseAbilityScore(doc, 'Charisma')
    };

    // Extract skills
    const skills = this.parseSkills(doc);

    // Extract inventory
    const inventory = this.parseInventory(doc);

    return {
      characterInfo,
      abilities,
      skills,
      spells: {
        spellSlots: [],
        spells: []
      },
      inventory,
      layout: this.getDefaultLayout()
    };
  }

  private getTextContent(doc: Document, selector: string): string {
    const element = doc.querySelector(selector);
    const content = element?.textContent?.trim() || '';
    console.log(`Getting text content for selector "${selector}":`, content);
    return content;
  }

  private parseAbilityScore(doc: Document, abilityName: string): { score: number; modifier: number; savingThrow: boolean } {
    const scoreElement = doc.querySelector(`[data-ability="${abilityName}"] .ddbc-ability-score__value`);
    const modifierElement = doc.querySelector(`[data-ability="${abilityName}"] .ddbc-ability-score__modifier`);
    const savingThrowElement = doc.querySelector(`[data-ability="${abilityName}"] .ddbc-saving-throws-box__proficient`);

    const score = parseInt(scoreElement?.textContent?.trim() || '10');
    const modifier = parseInt(modifierElement?.textContent?.replace(/[^-\d]/g, '') || '0');
    const savingThrow = !!savingThrowElement?.classList.contains('ddbc-saving-throws-box__proficient--active');

    console.log(`Parsed ability score for ${abilityName}:`, { score, modifier, savingThrow });
    return { score, modifier, savingThrow };
  }

  private parseSkills(doc: Document): Skills {
    const defaultSkills: Skills = {
      acrobatics: { proficient: false, expertise: false, modifier: 0 },
      animalHandling: { proficient: false, expertise: false, modifier: 0 },
      arcana: { proficient: false, expertise: false, modifier: 0 },
      athletics: { proficient: false, expertise: false, modifier: 0 },
      deception: { proficient: false, expertise: false, modifier: 0 },
      history: { proficient: false, expertise: false, modifier: 0 },
      insight: { proficient: false, expertise: false, modifier: 0 },
      intimidation: { proficient: false, expertise: false, modifier: 0 },
      investigation: { proficient: false, expertise: false, modifier: 0 },
      medicine: { proficient: false, expertise: false, modifier: 0 },
      nature: { proficient: false, expertise: false, modifier: 0 },
      perception: { proficient: false, expertise: false, modifier: 0 },
      performance: { proficient: false, expertise: false, modifier: 0 },
      persuasion: { proficient: false, expertise: false, modifier: 0 },
      religion: { proficient: false, expertise: false, modifier: 0 },
      sleightOfHand: { proficient: false, expertise: false, modifier: 0 },
      stealth: { proficient: false, expertise: false, modifier: 0 },
      survival: { proficient: false, expertise: false, modifier: 0 }
    };

    const skillElements = doc.querySelectorAll('.ddbc-skill-box');
    skillElements.forEach(element => {
      const skillName = element.querySelector('.ddbc-skill-box__label')?.textContent?.trim().toLowerCase() || '';
      const modifier = parseInt(element.querySelector('.ddbc-skill-box__modifier')?.textContent?.replace(/[^-\d]/g, '') || '0');
      const isProficient = element.querySelector('.ddbc-skill-box__proficient--active') !== null;
      const isExpertise = element.querySelector('.ddbc-skill-box__expertise--active') !== null;

      const skillKey = this.convertToSkillKey(skillName);
      if (skillKey && skillKey in defaultSkills) {
        defaultSkills[skillKey as keyof Skills] = {
          proficient: isProficient,
          expertise: isExpertise,
          modifier
        };
      }
    });

    return defaultSkills;
  }

  private parseInventory(doc: Document): Inventory {
    const items: Item[] = [];
    const itemElements = doc.querySelectorAll('.ddbc-item-box');
    
    itemElements.forEach(element => {
      const name = element.querySelector('.ddbc-item-box__name')?.textContent?.trim() || '';
      const quantity = parseInt(element.querySelector('.ddbc-item-box__quantity')?.textContent?.trim() || '1');
      const description = element.querySelector('.ddbc-item-box__description')?.textContent?.trim() || '';
      const dndBeyondType = element.querySelector('.ddbc-item-box__type')?.textContent?.trim().toLowerCase() || '';
      
      // Map D&D Beyond item types to our model's types
      let type: 'weapon' | 'armor' | 'equipment' | 'consumable' | 'other' = 'other';
      if (dndBeyondType.includes('weapon')) {
        type = 'weapon';
      } else if (dndBeyondType.includes('armor')) {
        type = 'armor';
      } else if (dndBeyondType.includes('potion') || dndBeyondType.includes('scroll')) {
        type = 'consumable';
      } else if (dndBeyondType.includes('gear') || dndBeyondType.includes('tool')) {
        type = 'equipment';
      }
      
      items.push({ name, quantity, description, type });
    });

    return {
      items,
      currency: {
        copper: parseInt(this.getTextContent(doc, '.ddbc-money-box__copper') || '0'),
        silver: parseInt(this.getTextContent(doc, '.ddbc-money-box__silver') || '0'),
        electrum: parseInt(this.getTextContent(doc, '.ddbc-money-box__electrum') || '0'),
        gold: parseInt(this.getTextContent(doc, '.ddbc-money-box__gold') || '0'),
        platinum: parseInt(this.getTextContent(doc, '.ddbc-money-box__platinum') || '0')
      }
    };
  }

  private convertToSkillKey(skillName: string): keyof Skills | null {
    const skillMap: Record<string, keyof Skills> = {
      'acrobatics': 'acrobatics',
      'animal handling': 'animalHandling',
      'arcana': 'arcana',
      'athletics': 'athletics',
      'deception': 'deception',
      'history': 'history',
      'insight': 'insight',
      'intimidation': 'intimidation',
      'investigation': 'investigation',
      'medicine': 'medicine',
      'nature': 'nature',
      'perception': 'perception',
      'performance': 'performance',
      'persuasion': 'persuasion',
      'religion': 'religion',
      'sleight of hand': 'sleightOfHand',
      'stealth': 'stealth',
      'survival': 'survival'
    };

    return skillMap[skillName] || null;
  }

  private extractCharacterId(url: string): string | null {
    const match = url.match(/characters\/(\d+)/);
    console.log('URL match result:', match);
    return match ? match[1] : null;
  }

  private getDefaultLayout(): Layout {
    return {
      sections: [
        { id: 'characterInfo', title: 'Character Info', order: 1, visible: true, collapsed: false },
        { id: 'abilities', title: 'Abilities', order: 2, visible: true, collapsed: false },
        { id: 'skills', title: 'Skills', order: 3, visible: true, collapsed: false },
        { id: 'spells', title: 'Spells', order: 4, visible: true, collapsed: false },
        { id: 'inventory', title: 'Inventory', order: 5, visible: true, collapsed: false }
      ],
      theme: 'light'
    };
  }

  private saveToLocalStorage(data: SheetData): void {
    localStorage.setItem('currentSheet', JSON.stringify(data));
  }

  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('currentSheet');
    if (savedData) {
      this.currentSheetSubject.next(JSON.parse(savedData));
    }
  }

  updateSheetData(data: SheetData): void {
    this.currentSheetSubject.next(data);
    this.saveToLocalStorage(data);
  }

  clearCurrentSheet(): void {
    this.currentSheetSubject.next(null);
    localStorage.removeItem('currentSheet');
  }

  editSection(section: any): void {
    this.editSectionSubject.next(section);
  }
} 