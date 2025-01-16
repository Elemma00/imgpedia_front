import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValComponent } from './val.component';

describe('ValComponent', () => {
  let component: ValComponent;
  let fixture: ComponentFixture<ValComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
