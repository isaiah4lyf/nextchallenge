import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionLeaderboardsComponent } from './session-leaderboards.component';

describe('SessionLeaderboardsComponent', () => {
  let component: SessionLeaderboardsComponent;
  let fixture: ComponentFixture<SessionLeaderboardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionLeaderboardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionLeaderboardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
