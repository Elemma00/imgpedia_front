import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualResultsComponent } from './visual-results.component';

describe('VisualResultsComponent', () => {
  let component: VisualResultsComponent;
  let fixture: ComponentFixture<VisualResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
