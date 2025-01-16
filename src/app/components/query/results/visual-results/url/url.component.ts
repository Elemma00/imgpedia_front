import { Component, Inject, Input } from '@angular/core';
import { Constants } from '../../../../../util/constants.model';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'url',
  imports: [MatGridListModule],
  templateUrl: './url.component.html',
  styleUrl: './url.component.scss'
})
export class UrlComponent {
  rowHeight = Constants.QUERY_RESULT_ROW_HEIGHT;

  constructor(
    @Inject('values') public values: any[],
    @Inject('ncolumns') public ncolumns: number
  ) {}

}
