import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricedPlansComponent } from './priced-plans.component';

describe('PricedPlansComponent', () => {
  let component: PricedPlansComponent;
  let fixture: ComponentFixture<PricedPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricedPlansComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricedPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
