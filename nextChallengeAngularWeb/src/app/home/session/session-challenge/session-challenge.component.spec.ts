import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionChallengeComponent } from './session-challenge.component';

describe('SessionChallengeComponent', () => {
  let component: SessionChallengeComponent;
  let fixture: ComponentFixture<SessionChallengeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionChallengeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
