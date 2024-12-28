import { Component } from '@angular/core';
import { ImgpediaComponent } from './components/imgpedia-app.component';


@Component({
  selector: 'app-root',
  imports: [ImgpediaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'imgpedia_front';
}
