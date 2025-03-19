import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormComponent } from './form/form.component';
import { ResultsComponent } from './results/results.component';
import { Constants } from '../../util/constants.model';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { indentWithTab } from "@codemirror/commands";
import { basicSetup } from 'codemirror';
import { search } from "@codemirror/search";
import { lintGutter } from "@codemirror/lint";
import { sparql, SparqlLanguage } from '../../util/sparqlEditor/codemirror/index';
import { keywordCompletionSource, localCompletionSource } from '../../util/sparqlEditor/extentions/complete';
import { wordHover } from '../../util/sparqlEditor/extentions/tooltip';


@Component({
  selector: 'app-query',
  imports: [MatToolbarModule, FormComponent, ResultsComponent],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent implements AfterViewInit, OnInit {

  queryText!: string;
  loading!: boolean;
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

    const sparqlKeywordCompletions = SparqlLanguage.data.of({
      autocomplete: keywordCompletionSource
    });
    
    const sparqlLocalCompletions = SparqlLanguage.data.of({
      autocomplete: localCompletionSource
    });

    const domElement = document.getElementById('inputSparql');
    if (domElement) {
      const editor = new EditorView({
        state: EditorState.create({
          doc: this.queryText,
          extensions: [
            basicSetup,
            keymap.of([indentWithTab]),
            search({ top: true }),
            lintGutter(),
            sparql(),
            SparqlLanguage,
            sparqlKeywordCompletions,
            sparqlLocalCompletions,
            wordHover,
            EditorView.updateListener.of(update => {
              if (update.changes) {
                this.queryText = update.state.doc.toString();
              }
            })
          ],
        }),
        parent: domElement,
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


