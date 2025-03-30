import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SheetService } from '../../services/sheet.service';

@Component({
  selector: 'app-sheet-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sheet-uploader.component.html',
  styleUrl: './sheet-uploader.component.scss'
})
export class SheetUploaderComponent {
  isDragging = false;
  uploadError: string | null = null;
  isUploading = false;

  constructor(
    private sheetService: SheetService,
    private router: Router
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private async handleFile(file: File): Promise<void> {
    if (!file.type.includes('pdf')) {
      this.uploadError = 'Please upload a PDF file';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;

    try {
      console.log('Starting file upload...');
      await this.sheetService.uploadSheet(file);
      console.log('Upload successful, navigating to view...');
      this.router.navigate(['/view']);
    } catch (error) {
      console.error('Upload error details:', error);
      this.uploadError = error instanceof Error 
        ? `Error uploading file: ${error.message}`
        : 'Error uploading file. Please try again.';
    } finally {
      this.isUploading = false;
    }
  }
}
