import { Routes } from '@angular/router';
import { SheetViewerComponent } from './components/sheet-viewer/sheet-viewer.component';
import { SheetEditorComponent } from './components/sheet-editor/sheet-editor.component';
import { SheetUploaderComponent } from './components/sheet-uploader/sheet-uploader.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', component: SheetUploaderComponent },
  { path: 'view', component: SheetViewerComponent },
  { path: 'edit', component: SheetEditorComponent }
];
