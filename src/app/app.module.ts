import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SheetImportComponent } from './components/sheet-import/sheet-import.component';
import { SheetViewerComponent } from './components/sheet-viewer/sheet-viewer.component';
import { SheetLayoutComponent } from './components/sheet-layout/sheet-layout.component';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [
    AppComponent,
    SheetImportComponent,
    SheetViewerComponent,
    SheetLayoutComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 