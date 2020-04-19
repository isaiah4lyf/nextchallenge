import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelBuyComponent } from './cancel-buy.component';

describe('CancelBuyComponent', () => {
  let component: CancelBuyComponent;
  let fixture: ComponentFixture<CancelBuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelBuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
