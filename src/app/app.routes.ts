import { Routes } from '@angular/router';
import { SheetUploaderComponent } from './components/sheet-uploader/sheet-uploader.component';
import { SheetViewerComponent } from './components/sheet-viewer/sheet-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', component: SheetUploaderComponent },
  { path: 'view', component: SheetViewerComponent },
  { path: '**', redirectTo: '/upload' }
];
