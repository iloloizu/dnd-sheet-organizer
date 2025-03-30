import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetUploaderComponent } from './sheet-uploader.component';

describe('SheetUploaderComponent', () => {
  let component: SheetUploaderComponent;
  let fixture: ComponentFixture<SheetUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SheetUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
