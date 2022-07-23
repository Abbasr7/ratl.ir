import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankFacilitiesComponent } from './bank-facilities.component';

describe('BankFacilitiesComponent', () => {
  let component: BankFacilitiesComponent;
  let fixture: ComponentFixture<BankFacilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankFacilitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankFacilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
