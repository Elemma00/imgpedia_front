import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'login-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule, 
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

    ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/upload']);
      return;
    }
    this.initForm();
    }

    initForm(): void {
        this.loginForm = this.formBuilder.group({
          username: ['', [Validators.required]],
          password: ['', [Validators.required]]
        });
     }

    onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.alertMessage = 'Successful sign in';
        this.alertType = 'success';
        setTimeout(() => {
          this.alertMessage = null;
          this.router.navigate(['/upload']);
        }, 500);
      },
      error: (error) => {
        this.alertMessage = error.message || 'Incorrect credentials';
        this.alertType = 'danger';
        this.isLoading = false;
        setTimeout(() => this.alertMessage = null, 2500);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
