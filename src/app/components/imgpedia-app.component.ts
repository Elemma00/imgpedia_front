import { Component } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'imgpedia',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './imgpedia-app.component.html',
  styleUrl: './imgpedia-app.component.scss'
})
export class ImgpediaComponent {

}
