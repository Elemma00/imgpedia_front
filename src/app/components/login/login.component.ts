import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'login-view',
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
  ) {}

    ngOnInit(): void {
    this.initForm();
    }

    initForm(): void {
      this.loginForm = this.formBuilder.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
     }

    onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    // Simulación de autenticación
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify({ username, role: 'ADMIN' }));
        this.alertMessage = 'Successful sign in';
        this.alertType = 'success';
        setTimeout(() => {
          this.alertMessage = null;
          this.router.navigate(['/']);
        }, 1500);
      } else {
        this.alertMessage = 'Incorrect credentials';
        this.alertType = 'danger';
        setTimeout(() => this.alertMessage = null, 2500);
      }
      this.isLoading = false;
    }, 1000);
  }
}
