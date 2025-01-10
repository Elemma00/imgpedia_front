import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SparqlResult } from '../../../../models/SparqlResult';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'visual-results',
  imports: [MatGridListModule, CommonModule],
  templateUrl: './visual-results.component.html',
  styleUrl: './visual-results.component.scss'
})
export class VisualResultsComponent implements OnInit, OnChanges{

  @Input() sparqlResult!: SparqlResult;
  columns!: any;
  colWidth!: string;

  constructor() { }

  ngOnInit(): void {
    console.log("SE INICIO EL COMPONENTE VISUAL RESULTS");
    // this.colWidth = (100 / this.headers.length) + '%';
    // if (this.headers && this.headers.length > 0 && this.sparqlResult && Object.keys(this.sparqlResult).length > 0) {
    //   this.columns = null;
    //   // this.prepareColumns();
    //   // this.parseResult();
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }


  headerLength(): number {
    return this.sparqlResult.head.vars.length;
  }

  // columnsKeys(): string[] {
  //   return Object.keys(this.columns);
  // }
}
