import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/environment';

interface User {
  username: string;
  token?: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  username: string;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.IMGPEDIA_API_URL + '/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

   constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          const decoded = this.decodeToken(response.token);
          const user = {
            username: response.username,
            token: response.token,
            roles: decoded?.roles || decoded?.role || []
          };
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
         console.error('Login error:', error);
        
       
        let errorMessage = 'Invalid username or password';
        
        if (error.error && typeof error.error === 'object') {
         
          if (error.error.error) {
            errorMessage = error.error.error.includes('Bad credentials') 
              ? 'Invalid username or password' 
              : error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
        
        return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  private decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}
}
