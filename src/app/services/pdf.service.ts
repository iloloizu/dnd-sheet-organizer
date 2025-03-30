import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SheetData } from '../models/sheet.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}

  async generatePDF(element: HTMLElement, sheetData?: SheetData): Promise<Blob> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Add metadata if sheetData is provided
      if (sheetData) {
        pdf.setProperties({
          title: `${sheetData.characterInfo?.name || 'Character'} Sheet`,
          subject: `Level ${sheetData.characterInfo?.level} ${sheetData.characterInfo?.class}`,
          creator: 'D&D Sheet Organizer'
        });
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
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