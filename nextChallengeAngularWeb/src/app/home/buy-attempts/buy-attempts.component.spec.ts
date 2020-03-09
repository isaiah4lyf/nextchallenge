import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyAttemptsComponent } from './buy-attempts.component';

describe('BuyAttemptsComponent', () => {
  let component: BuyAttemptsComponent;
  let fixture: ComponentFixture<BuyAttemptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyAttemptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
