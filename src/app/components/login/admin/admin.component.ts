import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../enviroments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  userForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  isAdmin: boolean = false;
  currentUserIsSuperAdmin: boolean = false;
  currentUserIsAdmin: boolean = false;

  adminURL: string = environment.IMGPEDIA_API_ADMIN_URL;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
   this.isAdmin = !!user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN'));
this.currentUserIsSuperAdmin = !!user && user.roles && user.roles.includes('ROLE_SUPERADMIN');
    this.currentUserIsAdmin = !!user && user.roles && user.roles.includes('ROLE_ADMIN');
    if (this.isAdmin) {
      this.loadUsers();
      this.userForm = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['USER']
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const token = currentUser?.token || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadUsers() {
    this.loading = true;
    const headers = this.getAuthHeaders();
    this.http.get<any[]>(this.adminURL + '/users', { headers }).subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Error loading users';
        this.loading = false;
      }
    });
  }

  toggleUserStatus(user: any) {
    const enabled = !user.enabled;
    const headers = this.getAuthHeaders();
    
    this.http.patch(this.adminURL + `/users/${user.username}/status`, { enabled }, { headers }).subscribe({
      next: () => {
        this.successMessage = `User ${user.username} ${enabled ? 'enabled' : 'disabled'}`;
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error updating user status';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  deleteUser(user: any) {
    if (!confirm(`Delete user ${user.username}?`)) return;
    const headers = this.getAuthHeaders();
    
    this.http.delete(this.adminURL + `/users/${user.username}`, { headers }).subscribe({
      next: () => {
        this.successMessage = `User ${user.username} deleted`;
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: err => {
        this.errorMessage = err.error?.error || 'Error deleting user';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    const headers = this.getAuthHeaders();
    
    this.http.post(this.adminURL + '/create', this.userForm.value, { headers }).subscribe({
      next: () => {
        this.successMessage = 'User created successfully';
        this.userForm.reset({ role: 'USER' });
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: err => {
        this.errorMessage = err.error?.error || 'Error creating user';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }
}