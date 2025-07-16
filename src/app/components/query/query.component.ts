import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { autocompletion, CompletionContext, startCompletion } from '@codemirror/autocomplete';
import { indentWithTab } from "@codemirror/commands";
import { lintGutter } from "@codemirror/lint";
import { search } from "@codemirror/search";
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { Constants } from '../../util/constants.model';
import sparqlExamples from '../../util/sparql-examples';
import { sparql, SparqlLanguage } from '../../util/sparqlEditor/codemirror/index';
import { keywordCompletionSource, localCompletionSource } from '../../util/sparqlEditor/extentions/complete';
import { wordHover } from '../../util/sparqlEditor/extentions/tooltip';
import { FormComponent } from './form/form.component';
import { ResultsComponent } from './results/results.component';

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
  exampleQueries: any[] = [];
  selectedExampleDescription: string = '';

  private editorView?: EditorView;

  constructor(private http: HttpClient) {
    this.loading = false;
  }

  async ngOnInit(): Promise<void> {
    const storedQueryText = localStorage.getItem('queryText');
    const storedResults = localStorage.getItem('results');

    this.queryText = storedQueryText ? storedQueryText : Constants.INITIAL_QUERY;

    try {
      this.exampleQueries = sparqlExamples;
      console.log('Example queries loaded:', this.exampleQueries);
    } catch (error) {
      console.error('Error loading example queries:', error);
      this.exampleQueries = [];
    }

    try {
      this.results = storedResults ? JSON.parse(storedResults) : null;
    } catch (e) {
      console.error('Error parsing stored results:', e);
      this.results = null; 
    }
    this.errorMessage = null; 
  }

  setExampleQuery(example: any) {
    this.queryText = example.query;
    localStorage.setItem('queryText', this.queryText);
    this.updateEditorText(example.query);
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
      this.editorView = new EditorView({
        state: EditorState.create({
          doc: this.queryText,
          extensions: [
            basicSetup,
            keymap.of([
                {
                  key: "Ctrl-Space",
                  run: (view) => {
                    startCompletion(view);
                    return true;
                  }
                },
              indentWithTab]),
            search({ top: true }),
            lintGutter(),
            sparql(),
            autocompletion({ override: [this.wikidataCompletionSource.bind(this)] }),
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

  updateEditorText(newText: string) {
    this.queryText = newText;
    localStorage.setItem('queryText', newText);

    // Si el editor ya está inicializado, actualiza el contenido visualmente
    if (this.editorView) {
      this.editorView.dispatch({
        changes: {
          from: 0,
          to: this.editorView.state.doc.length,
          insert: newText
        }
      });
    }
  }

  wikidataCompletionSource(context: CompletionContext) {
    const match = context.matchBefore(/(?:^|\s)(wd:|wdt:)([^\n]*)$/);
    if (!match || (match.from == match.to && !context.explicit)) return null;

    const prefix = match.text.match(/(wd:|wdt:)/)?.[0] || '';
    const searchText = match.text.replace(/^(?:^|\s)(wd:|wdt:)/, '').trim();

    if (!searchText) return null;

    return fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&search=${encodeURIComponent(searchText)}&origin=*`)
      .then(response => response.json())
      .then(data => ({
        from: match.from + match.text.indexOf(prefix) + prefix.length,
        to: context.pos,
        options: (data.search || []).map((item: any) => ({
          label: item.label,
          type: "entity",
          info: item.description,
          apply: item.id
        }))
      }));
  }

  onExampleSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const key = select.value;
    const example = this.exampleQueries.find(e => e.key === key);
    if (example) {
      this.setExampleQuery(example);
      this.selectedExampleDescription = example.description;
    }
  }

  onExampleHover(event: Event) {
    const select = event.target as HTMLSelectElement;
    const key = select.value;
    const example = this.exampleQueries.find(e => e.key === key);
    this.selectedExampleDescription = example ? example.description : '';
  }

  receiveResults($event: any) {
    try {
      this.results = JSON.parse($event);
    } catch (e) {
      console.warn('Received data is not valid JSON, using raw data');
      this.results = $event;
    }
    this.errorMessage = null;
    localStorage.setItem('results', JSON.stringify(this.results));
  }

  handleError(error: string) {
    this.errorMessage = error;
    this.results = null;
    localStorage.removeItem('results');
  }

}


