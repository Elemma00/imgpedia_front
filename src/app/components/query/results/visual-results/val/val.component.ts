import { Component, Inject, Input, OnInit } from '@angular/core';
import { Constants } from '../../../../../util/constants.model';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'val',
  imports: [MatGridListModule],
  templateUrl: './val.component.html',
  styleUrl: './val.component.scss'
})
export class ValComponent implements OnInit {

  parsedValues!: string[];
  rowHeight = Constants.QUERY_RESULT_ROW_HEIGHT;

  constructor(
    @Inject('values') public values: any[],
    @Inject('ncolumns') public ncolumns: number
  ) {
    this.parsedValues = [];
  }

  ngOnInit(): void {
    let i;
    for (const v of this.values) {
      let parsed = v;
      for (const uV of Constants.URL_VALUES) {
        if ((i = v.indexOf(uV)) > -1) {
          parsed = v.substr(i + uV.length);
          break;
        }
      }
      this.parsedValues.push(parsed);
    }
  }

  isNumberValue(value: any): boolean {
    return value !== null && value !== undefined && !isNaN(Number(value)) && value.toString().trim() !== '';
  }

  formatNumber(value: any): string {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }

}
