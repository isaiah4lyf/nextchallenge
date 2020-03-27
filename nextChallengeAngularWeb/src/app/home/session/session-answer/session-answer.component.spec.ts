import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionAnswerComponent } from './session-answer.component';

describe('SessionAnswerComponent', () => {
  let component: SessionAnswerComponent;
  let fixture: ComponentFixture<SessionAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
