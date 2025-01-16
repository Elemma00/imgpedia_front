import { Component, Inject, Input, OnInit } from '@angular/core';
import { Constants } from '../../../../../util/constants.model';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'null',
  imports: [MatGridListModule],
  templateUrl: './null.component.html',
  styleUrl: './null.component.scss'
})
export class NullComponent implements OnInit{

  cells!: Array<boolean>;
  rowHeight = Constants.QUERY_RESULT_ROW_HEIGHT;

  constructor(
    @Inject('values') public values: any[],
    @Inject('ncolumns') public ncolumns: number
  ) { }

  ngOnInit() {
    this.cells = new Array<boolean>(+this.values[0]);
  }

}
