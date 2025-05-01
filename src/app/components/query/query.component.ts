import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { indentWithTab } from "@codemirror/commands";
import { linter, lintGutter } from "@codemirror/lint";
import { search } from "@codemirror/search";
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { Constants } from '../../util/constants.model';
import { sparql, SparqlLanguage } from '../../util/sparqlEditor/codemirror/index';
import { keywordCompletionSource, localCompletionSource } from '../../util/sparqlEditor/extentions/complete';
import { wordHover } from '../../util/sparqlEditor/extentions/tooltip';
import { FormComponent } from './form/form.component';
import { ResultsComponent } from './results/results.component';
import { sparqlLinter } from '../../util/sparqlEditor/extentions/sparql-linter';


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

  constructor() {
    this.loading = false;
  }

  ngOnInit(): void {
    const storedQueryText = localStorage.getItem('queryText');
    const storedResults = localStorage.getItem('results');

    this.queryText = storedQueryText ? storedQueryText : Constants.INITIAL_QUERY;

    try {
      this.results = storedResults ? JSON.parse(storedResults) : null;
    } catch (e) {
      console.error('Error parsing stored results:', e);
      this.results = null; 
    }
    this.errorMessage = null; 
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
                localStorage.setItem('queryText', this.queryText);
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
    localStorage.setItem('results', JSON.stringify(this.results));
  }

  handleError(error: string) {
    this.errorMessage = error;
    this.results = null;
    localStorage.removeItem('results');
  }

}


