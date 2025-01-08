import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { createSparqlEditor } from 'sparql-editor';
import { FormComponent } from './form/form.component';
import { SparqlQueryDTO } from '../../models/SparqlQueryDTO';
import { ResultsComponent } from './results/results.component';

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

  constructor() {
    this.loading = false;
  }

  ngOnInit(): void {
    this.queryText ='SELECT ?Source ?Target ?Distance WHERE{ ?Rel <http://imgpedia.dcc.uchile.cl/ontology#sourceImage> ?Source;\n' +
    ' <http://imgpedia.dcc.uchile.cl/ontology#targetImage> ?Target;\n' +
    ' <http://imgpedia.dcc.uchile.cl/ontology#distance> ?Distance .\n' +
    '} LIMIT 10';
    
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
    console.log("se ejecuto la cosita xddd");
    this.results = $event;
  }

}


