import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetViewerComponent } from './sheet-viewer.component';

describe('SheetViewerComponent', () => {
  let component: SheetViewerComponent;
  let fixture: ComponentFixture<SheetViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SheetViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
