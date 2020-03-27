import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionMessageComponent } from './session-message.component';

describe('SessionMessageComponent', () => {
  let component: SessionMessageComponent;
  let fixture: ComponentFixture<SessionMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
