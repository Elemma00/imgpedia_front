import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { createSparqlEditor } from 'sparql-editor';

@Component({
  selector: 'app-query',
  imports: [MatToolbarModule, FormsModule],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent implements AfterViewInit, OnInit {
  queryText!: string;
  format: String = 'table';
  timeout!: number;

  constructor() { }

  ngOnInit(): void {
    this.queryText = `SELECT ?Source ?Target ?Distance 
    WHERE { 
      ?Rel <http://imgpedia.dcc.uchile.cl/ontology#sourceImage> ?Source; 
           <http://imgpedia.dcc.uchile.cl/ontology#targetImage> ?Target; 
           <http://imgpedia.dcc.uchile.cl/ontology#distance> ?Distance .
    } 
    LIMIT 10
  `;
  }

  runQuery(queryForm: NgForm){
    if(queryForm.valid){
      console.log('Query: ', this.queryText);
    }
  }


  ngAfterViewInit() {
    this.initializeEditor();
  }


  initializeEditor() {
    const domElement = document.getElementById('inputSparql');
    if (domElement) {
      const editor = createSparqlEditor({
        parent: domElement,
        onChange: this.onChange,
        value: this.queryText,
      });
    }
  }

  onChange(value: string, codemirrorViewInstance: any) {
    console.log(value);
  }
}


