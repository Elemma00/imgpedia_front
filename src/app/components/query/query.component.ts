import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { createSparqlEditor } from 'sparql-editor';
import { FormComponent } from './form/form.component';
import { SparqlQueryDTO } from '../../models/SparqlQueryDTO';
import { ResultsComponent } from './results/results.component';
import { Constants } from '../../util/constants.model';

@Component({
  selector: 'app-query',
  imports: [MatToolbarModule, FormComponent, ResultsComponent],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent implements AfterViewInit, OnInit {
  
  queryText!: string;
  loading!:boolean;
  results!: any;
  errorMessage: string | null = null;

  @ViewChild('resultsTable') resultsTable!: ElementRef;

  constructor() {
    this.loading = false;
  }

  ngOnInit(): void {
    this.queryText = Constants.INITIAL_QUERY;
  }


  ngAfterViewInit() {
    this.initializeEditor();
  }


  initializeEditor() {
    const domElement = document.getElementById('inputSparql');
    if (domElement) {
      const editor = createSparqlEditor({
        parent: domElement,
        onChange: (value: string, codemirrorViewInstance: any) => {
          this.queryText = value;
        },
        value: this.queryText,
      });
    }
  }

  receiveResults($event: any) {
    // this.results = JSON.parse($event);
    // console.log(this.results);
    // this.errorMessage = null;
    try {
      this.results = JSON.parse($event);
    } catch (e) {
      console.warn('Received data is not valid JSON, using raw data');
      this.results = $event;
    }
    console.log(this.results);
    this.errorMessage = null;
  }

  handleError(error: string) {
    this.errorMessage = error;
    this.results = null; 
  }
}


