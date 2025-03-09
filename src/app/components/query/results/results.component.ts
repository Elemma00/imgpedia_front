import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SparqlResult } from '../../../models/SparqlResult';
import { VisualResultsComponent } from './visual-results/visual-results.component';

@Component({
  selector: 'results',
  imports: [CommonModule, FormsModule, VisualResultsComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent{
  @Input() sparqlResult!: SparqlResult;
  
  selectedView: string = 'visual'; // Valor predeterminado

  constructor() { }

  setView(view: string) {
    this.selectedView = view;
  }

  verifyArity(): boolean {
    const vars = this.sparqlResult.head.vars;
    const bindings = this.sparqlResult.results.bindings;

    for (const binding of bindings) {
      for (const variable of vars) {
        if (!binding.hasOwnProperty(variable)) {
          return false;
        }
      }
    }
    return true;
  }
}
