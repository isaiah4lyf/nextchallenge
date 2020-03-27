import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EduWorkComponent } from './edu-work.component';

describe('EduWorkComponent', () => {
  let component: EduWorkComponent;
  let fixture: ComponentFixture<EduWorkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EduWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EduWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
