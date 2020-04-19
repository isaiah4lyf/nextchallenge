import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteBuyComponent } from './complete-buy.component';

describe('CompleteBuyComponent', () => {
  let component: CompleteBuyComponent;
  let fixture: ComponentFixture<CompleteBuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteBuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
