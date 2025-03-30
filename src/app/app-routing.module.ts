import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SheetImportComponent } from './components/sheet-import/sheet-import.component';
import { SheetViewerComponent } from './components/sheet-viewer/sheet-viewer.component';
import { SheetLayoutComponent } from './components/sheet-layout/sheet-layout.component';

const routes: Routes = [
  { path: '', redirectTo: '/import', pathMatch: 'full' },
  { path: 'import', component: SheetImportComponent },
  { path: 'view', component: SheetViewerComponent },
  { path: 'edit', component: SheetLayoutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 