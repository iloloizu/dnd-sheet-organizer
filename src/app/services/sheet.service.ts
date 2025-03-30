import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  SheetData, 
  CharacterInfo, 
  Abilities, 
  Skills, 
  Spells, 
  Inventory 
} from '../models/sheet.model';

@Injectable({
  providedIn: 'root'
})
export class SheetService {
  private currentSheet = new BehaviorSubject<SheetData | null>(null);
  currentSheet$ = this.currentSheet.asObservable();

  constructor() {
    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
  }

  async uploadSheet(file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      // Extract text from all pages
      const textContent = await this.extractTextFromPDF(pdf);
      
      // Parse the extracted text into structured data
      const sheetData = this.parseSheetData(textContent);
      
      // Store the parsed data
      this.currentSheet.next(sheetData);
      
      // Save to local storage
      this.saveToLocalStorage(sheetData);
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }

  private async extractTextFromPDF(pdf: pdfjsLib.PDFDocumentProxy): Promise<string> {
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }

  private parseSheetData(text: string): SheetData {
    // This is a basic implementation. You'll need to enhance this
    // based on your specific PDF structure and requirements
    return {
      characterInfo: this.extractCharacterInfo(text),
      abilities: this.extractAbilities(text),
      skills: this.extractSkills(text),
      spells: this.extractSpells(text),
      inventory: this.extractInventory(text),
      layout: this.getDefaultLayout()
    };
  }

  private extractCharacterInfo(text: string): CharacterInfo {
    const info: CharacterInfo = {};
    
    // Extract basic character info using regex patterns
    const nameMatch = text.match(/Character Name:\s*([^\n]+)/i);
    const classMatch = text.match(/Class:\s*([^\n]+)/i);
    const levelMatch = text.match(/Level:\s*(\d+)/i);
    const raceMatch = text.match(/Race:\s*([^\n]+)/i);
    const backgroundMatch = text.match(/Background:\s*([^\n]+)/i);
    const alignmentMatch = text.match(/Alignment:\s*([^\n]+)/i);
    const expMatch = text.match(/Experience Points:\s*(\d+)/i);
    const acMatch = text.match(/Armor Class:\s*(\d+)/i);
    const initMatch = text.match(/Initiative:\s*([+-]?\d+)/i);
    const speedMatch = text.match(/Speed:\s*(\d+)/i);
    const hpMatch = text.match(/Hit Points:\s*(\d+)\s*\/\s*(\d+)/i);

    if (nameMatch) info.name = nameMatch[1].trim();
    if (classMatch) info.class = classMatch[1].trim();
    if (levelMatch) info.level = parseInt(levelMatch[1]);
    if (raceMatch) info.race = raceMatch[1].trim();
    if (backgroundMatch) info.background = backgroundMatch[1].trim();
    if (alignmentMatch) info.alignment = alignmentMatch[1].trim();
    if (expMatch) info.experience = parseInt(expMatch[1]);
    if (acMatch) info.armorClass = parseInt(acMatch[1]);
    if (initMatch) info.initiative = parseInt(initMatch[1]);
    if (speedMatch) info.speed = parseInt(speedMatch[1]);
    if (hpMatch) {
      info.hitPoints = {
        current: parseInt(hpMatch[1]),
        maximum: parseInt(hpMatch[2]),
        temporary: 0
      };
    }

    return info;
  }

  private extractAbilities(text: string): Abilities {
    const abilities: Abilities = {
      strength: { score: 10, modifier: 0, savingThrow: false },
      dexterity: { score: 10, modifier: 0, savingThrow: false },
      constitution: { score: 10, modifier: 0, savingThrow: false },
      intelligence: { score: 10, modifier: 0, savingThrow: false },
      wisdom: { score: 10, modifier: 0, savingThrow: false },
      charisma: { score: 10, modifier: 0, savingThrow: false }
    };

    // Extract ability scores and modifiers
    const abilityPattern = /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s*(\d+)\s*\(([+-]?\d+)\)/gi;
    let match;
    while ((match = abilityPattern.exec(text)) !== null) {
      const ability = match[1].toLowerCase() as keyof Abilities;
      abilities[ability].score = parseInt(match[2]);
      abilities[ability].modifier = parseInt(match[3]);
    }

    // Extract saving throw proficiencies
    const savePattern = /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Saving\s+Throw/i;
    const saveMatches = text.matchAll(savePattern);
    for (const match of saveMatches) {
      const ability = match[1].toLowerCase() as keyof Abilities;
      abilities[ability].savingThrow = true;
    }

    return abilities;
  }

  private extractSkills(text: string): Skills {
    const skills: Skills = {
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

    // Extract skill proficiencies and modifiers
    const skillPattern = /(Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival)\s*\(([+-]?\d+)\)/gi;
    let match;
    while ((match = skillPattern.exec(text)) !== null) {
      const skillName = match[1].replace(/\s+/g, '') as keyof Skills;
      skills[skillName].modifier = parseInt(match[2]);
      skills[skillName].proficient = true;
    }

    return skills;
  }

  private extractSpells(text: string): Spells {
    const spells: Spells = {
      spellSlots: [],
      spells: []
    };

    // Extract spellcasting class and ability
    const classMatch = text.match(/Spellcasting Class:\s*([^\n]+)/i);
    const abilityMatch = text.match(/Spellcasting Ability:\s*([^\n]+)/i);
    const dcMatch = text.match(/Spell Save DC:\s*(\d+)/i);
    const attackMatch = text.match(/Spell Attack Bonus:\s*([+-]?\d+)/i);

    if (classMatch) spells.spellcastingClass = classMatch[1].trim();
    if (abilityMatch) spells.spellcastingAbility = abilityMatch[1].trim();
    if (dcMatch) spells.spellSaveDC = parseInt(dcMatch[1]);
    if (attackMatch) spells.spellAttackBonus = parseInt(attackMatch[1]);

    // Extract spell slots
    const slotPattern = /Level\s+(\d+)\s+Slots:\s*(\d+)\s*\/\s*(\d+)/gi;
    let match;
    while ((match = slotPattern.exec(text)) !== null) {
      spells.spellSlots.push({
        level: parseInt(match[1]),
        current: parseInt(match[2]),
        maximum: parseInt(match[3])
      });
    }

    // Extract spells
    const spellPattern = /([A-Za-z\s]+)\s*\((\d+)\s*level\s*([A-Za-z\s]+)\)/gi;
    while ((match = spellPattern.exec(text)) !== null) {
      spells.spells.push({
        name: match[1].trim(),
        level: parseInt(match[2]),
        school: match[3].trim(),
        castingTime: '',
        range: '',
        components: {
          verbal: false,
          somatic: false
        },
        duration: '',
        description: '',
        prepared: true
      });
    }

    return spells;
  }

  private extractInventory(text: string): Inventory {
    const inventory: Inventory = {
      items: [],
      currency: {
        copper: 0,
        silver: 0,
        electrum: 0,
        gold: 0,
        platinum: 0
      }
    };

    // Extract currency
    const currencyPattern = /(CP|SP|EP|GP|PP):\s*(\d+)/gi;
    let match;
    while ((match = currencyPattern.exec(text)) !== null) {
      const amount = parseInt(match[2]);
      switch (match[1]) {
        case 'CP': inventory.currency.copper = amount; break;
        case 'SP': inventory.currency.silver = amount; break;
        case 'EP': inventory.currency.electrum = amount; break;
        case 'GP': inventory.currency.gold = amount; break;
        case 'PP': inventory.currency.platinum = amount; break;
      }
    }

    // Extract items
    const itemPattern = /([A-Za-z\s]+)\s*\((\d+)\)/gi;
    while ((match = itemPattern.exec(text)) !== null) {
      inventory.items.push({
        name: match[1].trim(),
        quantity: parseInt(match[2]),
        type: 'other'
      });
    }

    return inventory;
  }

  private getDefaultLayout(): any {
    // Return default layout configuration
    return {
      sections: [
        { id: 'characterInfo', title: 'Character Info', order: 1 },
        { id: 'abilities', title: 'Abilities', order: 2 },
        { id: 'skills', title: 'Skills', order: 3 },
        { id: 'spells', title: 'Spells', order: 4 },
        { id: 'inventory', title: 'Inventory', order: 5 }
      ]
    };
  }

  private saveToLocalStorage(data: SheetData): void {
    localStorage.setItem('currentSheet', JSON.stringify(data));
  }

  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('currentSheet');
    if (savedData) {
      this.currentSheet.next(JSON.parse(savedData));
    }
  }

  updateSheetData(data: Partial<SheetData>): void {
    const currentData = this.currentSheet.value;
    if (currentData) {
      const updatedData = { ...currentData, ...data };
      this.currentSheet.next(updatedData);
      this.saveToLocalStorage(updatedData);
    }
  }

  clearCurrentSheet(): void {
    this.currentSheet.next(null);
    localStorage.removeItem('currentSheet');
  }
} 