import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService, AuthUser } from '../auth.service';
import { DashboardService } from '../service/dashboard.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: any;
  let dashboardServiceSpy: any;

  const mockUser: AuthUser = {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    phonenumber: '1234567890',
    dataOfBirth: '1990-01-01',
    address: '123 Main St',
    countryId: 1,
    stateId: 1,
    city: 'New York',
    roleId: 4,
    role: 'Candidate',
    offerCTC: null,
    totalExperience: 2,
    createdDateTime: '2024-01-01',
    status: 'Active',
    name: 'John Doe'
  };

  beforeEach(async () => {
    authServiceSpy = {
      getUser: jasmine.createSpy().and.returnValue(mockUser),
      authState$: of(mockUser),
      isLoggedIn: jasmine.createSpy().and.returnValue(true),
      logout: jasmine.createSpy()
    };

    dashboardServiceSpy = {
      getCompleteDashboard: jasmine.createSpy().and.returnValue(of({
        education: [],
        skills: [],
        experience: [],
        documents: []
      })),
      getAllUsers: jasmine.createSpy().and.returnValue(of([])),
      deleteEducation: jasmine.createSpy().and.returnValue(of(true)),
      deleteSkill: jasmine.createSpy().and.returnValue(of(true)),
      deleteExperience: jasmine.createSpy().and.returnValue(of(true)),
      deleteDocument: jasmine.createSpy().and.returnValue(of(true)),
      deleteUser: jasmine.createSpy().and.returnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user loaded from auth service', () => {
    expect(component.user).toEqual(mockUser);
  });

  it('should have correct role', () => {
    expect(component.currentRole).toEqual('Candidate');
  });

  it('should have empty lists initially', () => {
    expect(component.educationList).toEqual([]);
    expect(component.skillsList).toEqual([]);
    expect(component.experienceList).toEqual([]);
    expect(component.documentList).toEqual([]);
  });

  it('should call logout', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should return correct initials', () => {
    expect(component.getInitials('John Doe')).toEqual('JD');
    expect(component.getInitials('Alice')).toEqual('A');
    expect(component.getInitials(null)).toEqual('');
  });

  it('should return correct stat counts', () => {
    component.educationList = [{ id: 1, title: 'Test', institution: 'Test', year: '2020' }] as any;
    component.skillsList = [{ id: 1, name: 'Test', level: 'Beginner' }] as any;
    component.experienceList = [{ id: 1, company: 'Test', position: 'Dev', duration: '1 yr' }] as any;
    component.documentList = [{ id: 1, name: 'Test', type: 'PDF', uploadedAt: '2024-01-01' }] as any;

    expect(component.getStatCount('Education')).toEqual(1);
    expect(component.getStatCount('Skills')).toEqual(1);
    expect(component.getStatCount('Experience')).toEqual(1);
    expect(component.getStatCount('Documents')).toEqual(1);
  });

  it('should check if admin or HR', () => {
    component.currentRole = 'Admin';
    expect(component.isAdminOrHR()).toBeTrue();
    
    component.currentRole = 'HR';
    expect(component.isAdminOrHR()).toBeTrue();
    
    component.currentRole = 'Candidate';
    expect(component.isAdminOrHR()).toBeFalse();
  });
});
