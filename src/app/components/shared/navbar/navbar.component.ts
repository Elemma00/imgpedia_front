import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'navbar',
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;
  resizeListener: any;
  currentUser: any = null;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  ngAfterViewInit() {
    this.resizeListener = () => {
      if (window.innerWidth > 768 && this.menuTrigger?.menuOpen) {
        this.menuTrigger.closeMenu();
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }


  refreshHome(event: Event) {
    event.preventDefault();
    window.location.href = '/';
  }

  logout() {
    this.authService.logout();
  }
}
