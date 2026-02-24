import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrogotPasswordComponent } from './frogot-password.component';

describe('FrogotPasswordComponent', () => {
  let component: FrogotPasswordComponent;
  let fixture: ComponentFixture<FrogotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrogotPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrogotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
