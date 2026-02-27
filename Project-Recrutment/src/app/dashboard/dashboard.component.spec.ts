import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../services/user.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);

    // ✅ default return value so ngOnInit doesn't throw
    userServiceSpy.getUser.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ✅ spy is ready before this runs
  });

  // ── created ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── getUser ────────────────────────────────────────────────────────────────

  it('should get user', () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

    userServiceSpy.getUser.and.returnValue(of(mockUser));

    component.getUser(mockUser.id);
    fixture.detectChanges();

    expect(userServiceSpy.getUser).toHaveBeenCalledWith(mockUser.id);
    expect(component.user).toEqual(mockUser);
  });

  it('should handle null when user is not found', () => {
    userServiceSpy.getUser.and.returnValue(of(null));

    component.getUser(999);
    fixture.detectChanges();

    expect(userServiceSpy.getUser).toHaveBeenCalledWith(999);
    expect(component.user).toBeNull();
  });
});