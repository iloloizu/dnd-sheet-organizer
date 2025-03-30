import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SheetData } from '../models/sheet.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}

  async generatePDF(sheetData: SheetData, element: HTMLElement): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Add title
    pdf.setFontSize(24);
    pdf.text(sheetData.characterInfo?.name || 'Character Sheet', margin, margin + 10);

    // Add character info
    pdf.setFontSize(12);
    const infoY = margin + 20;
    pdf.text(`Level ${sheetData.characterInfo?.level} ${sheetData.characterInfo?.class}`, margin, infoY);
    pdf.text(`Race: ${sheetData.characterInfo?.race}`, margin, infoY + 7);
    pdf.text(`Background: ${sheetData.characterInfo?.background}`, margin, infoY + 14);
    pdf.text(`Alignment: ${sheetData.characterInfo?.alignment}`, margin, infoY + 21);

    // Add abilities
    const abilitiesY = infoY + 35;
    pdf.setFontSize(14);
    pdf.text('Abilities', margin, abilitiesY);
    pdf.setFontSize(12);
    let abilityY = abilitiesY + 10;
    Object.entries(sheetData.abilities || {}).forEach(([ability, data]) => {
      pdf.text(`${ability}: ${data.score} (${data.modifier})`, margin, abilityY);
      abilityY += 7;
    });

    // Add skills
    const skillsY = abilityY + 10;
    pdf.setFontSize(14);
    pdf.text('Skills', margin, skillsY);
    pdf.setFontSize(12);
    let skillY = skillsY + 10;
    Object.entries(sheetData.skills || {}).forEach(([skill, data]) => {
      const proficiency = data.proficient ? '●' : '';
      pdf.text(`${skill}: ${data.modifier} ${proficiency}`, margin, skillY);
      skillY += 7;
    });

    // Add spells
    const spellsY = skillY + 10;
    pdf.setFontSize(14);
    pdf.text('Spells', margin, spellsY);
    pdf.setFontSize(12);
    let spellY = spellsY + 10;
    
    // Add spell slots
    if (sheetData.spells?.spellSlots) {
      const slotsText = sheetData.spells.spellSlots
        .map(slot => `Level ${slot.level}: ${slot.current}/${slot.maximum}`)
        .join(' | ');
      pdf.text(slotsText, margin, spellY);
      spellY += 10;
    }

    // Add spells list
    if (sheetData.spells?.spells) {
      sheetData.spells.spells.forEach(spell => {
        pdf.text(`${spell.name} (Level ${spell.level})`, margin, spellY);
        spellY += 7;
      });
    }

    // Add inventory
    const inventoryY = spellY + 10;
    pdf.setFontSize(14);
    pdf.text('Inventory', margin, inventoryY);
    pdf.setFontSize(12);
    let inventoryItemY = inventoryY + 10;

    // Add currency
    if (sheetData.inventory?.currency) {
      const currencyText = Object.entries(sheetData.inventory.currency)
        .map(([type, amount]) => `${type.toUpperCase()}: ${amount}`)
        .join(' | ');
      pdf.text(currencyText, margin, inventoryItemY);
      inventoryItemY += 10;
    }

    // Add items
    if (sheetData.inventory?.items) {
      sheetData.inventory.items.forEach(item => {
        pdf.text(`${item.name} (${item.quantity})`, margin, inventoryItemY);
        inventoryItemY += 7;
      });
    }

    // Save the PDF
    pdf.save(`${sheetData.characterInfo?.name || 'character'}-sheet.pdf`);
  }

  async captureElementAsImage(element: HTMLElement): Promise<string> {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    return canvas.toDataURL('image/jpeg', 1.0);
  }
} 