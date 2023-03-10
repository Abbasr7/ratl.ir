import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPlansComponent } from './show-plans.component';

describe('PlansComponent', () => {
  let component: ShowPlansComponent;
  let fixture: ComponentFixture<ShowPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowPlansComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
