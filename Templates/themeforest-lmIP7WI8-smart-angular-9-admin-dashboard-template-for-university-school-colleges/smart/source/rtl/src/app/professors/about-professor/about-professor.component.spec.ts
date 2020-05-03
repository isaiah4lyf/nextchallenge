import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutProfessorComponent } from './about-professor.component';
describe('ProfessorProfileComponent', () => {
  let component: AboutProfessorComponent;
  let fixture: ComponentFixture<AboutProfessorComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AboutProfessorComponent]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(AboutProfessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
