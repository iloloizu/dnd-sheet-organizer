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
  private currentSheetSubject = new BehaviorSubject<SheetData | null>(null);
  currentSheet$ = this.currentSheetSubject.asObservable();

  private editSectionSubject = new BehaviorSubject<any>(null);
  editSection$ = this.editSectionSubject.asObservable();

  constructor() {
    try {
      // Try the URL method first
      const workerSrc = new URL('../../assets/pdf.worker.min.mjs', import.meta.url).href;
      console.log('Setting worker source to:', workerSrc);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    } catch (error) {
      // Fallback to direct path
      console.log('Falling back to direct path for worker');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
    }
  }

  getCurrentSheet(): Observable<SheetData | null> {
    return this.currentSheet$;
  }

  async uploadSheet(file: File): Promise<void> {
    try {
      console.log('Starting PDF upload process...');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File must be a PDF');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Try using pure JavaScript FileReader first
      const fileReader = new FileReader();
      
      const readFileAsArrayBuffer = () => new Promise<ArrayBuffer>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
        fileReader.onerror = () => reject(fileReader.error);
        fileReader.readAsArrayBuffer(file);
      });

      console.log('Reading file as ArrayBuffer...');
      const arrayBuffer = await readFileAsArrayBuffer();
      console.log('File read successfully, size:', arrayBuffer.byteLength);

      // Load the PDF document
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully. Number of pages:', pdf.numPages);

      // Extract text from the first page only initially
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const extractedText = textContent.items.map((item: any) => item.str).join(' ');
      
      console.log('Extracted text sample:', extractedText.substring(0, 500));

      // For now, create a minimal sheet data structure
      const sheetData: SheetData = {
        characterInfo: {
          name: 'Unknown',
          class: 'Unknown',
          level: 1
        },
        abilities: {
          strength: { score: 10, modifier: 0, savingThrow: false },
          dexterity: { score: 10, modifier: 0, savingThrow: false },
          constitution: { score: 10, modifier: 0, savingThrow: false },
          intelligence: { score: 10, modifier: 0, savingThrow: false },
          wisdom: { score: 10, modifier: 0, savingThrow: false },
          charisma: { score: 10, modifier: 0, savingThrow: false }
        },
        skills: this.getDefaultSkills(),
        spells: { spellSlots: [], spells: [] },
        inventory: { items: [], currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 } },
        layout: this.getDefaultLayout()
      };

      // Store the extracted text for later processing
      localStorage.setItem('lastExtractedText', extractedText);
      
      // Store the basic sheet data
      this.currentSheetSubject.next(sheetData);
      this.saveToLocalStorage(sheetData);
      
      console.log('Basic sheet data saved. You can now use the extracted text to parse more details.');
    } catch (error) {
      console.error('Error in uploadSheet:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getDefaultSkills(): Skills {
    return {
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
      this.currentSheetSubject.next(JSON.parse(savedData));
    }
  }

  updateSheetData(data: Partial<SheetData>): void {
    const currentData = this.currentSheetSubject.value;
    if (currentData) {
      const updatedData = { ...currentData, ...data };
      this.currentSheetSubject.next(updatedData);
      this.saveToLocalStorage(updatedData);
    }
  }

  clearCurrentSheet(): void {
    this.currentSheetSubject.next(null);
    localStorage.removeItem('currentSheet');
  }

  editSection(section: any): void {
    this.editSectionSubject.next(section);
  }
} 