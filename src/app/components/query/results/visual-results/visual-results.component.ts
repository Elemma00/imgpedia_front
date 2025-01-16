import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { SparqlResult } from '../../../../models/SparqlResult';
import { Constants } from '../../../../util/constants.model';
import { ImageComponent } from './image/image.component';
import { NullComponent } from './null/null.component';
import { UrlComponent } from './url/url.component';
import { ValComponent } from './val/val.component';

@Component({
  selector: 'visual-results',
  imports: [MatGridListModule, CommonModule],
  templateUrl: './visual-results.component.html',
  styleUrl: './visual-results.component.scss'
})
export class VisualResultsComponent implements OnInit, OnChanges {

  @Input() sparqlResult!: SparqlResult;
  columns!: any;
  colWidth!: string;
  headers: string[] = [];

  private componentInstances: { [key: string]: any } = {};

  constructor(private parentInjector: Injector) { }

  ngOnInit(): void {
    if (this.sparqlResult && this.sparqlResult.head && this.sparqlResult.head.vars) {
      this.headers = this.sparqlResult.head.vars;
      this.colWidth = (100 / this.headers.length) + '%';
      if (this.headers.length > 0 && this.sparqlResult.results.bindings.length > 0) {
        this.columns = {};
        this.prepareColumns();
        this.parseResult();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sparqlResult']) {
      this.ngOnInit();
    }
  }

  headerLength(): number {
    return this.headers.length;
  }

  prepareColumns() {
    let i = -1;
    this.columns = {};
    const first = this.sparqlResult.results.bindings[0];
    for (const h of this.headers) {
      if (first.hasOwnProperty(h)) {
        const v = first[h]['value'];

        for (const uV of Constants.URL_VALUES) {
          if ((i = v.indexOf(uV)) > -1) {
            this.columns[h] = { cls: ValComponent, values: [] };
            break;
          }
        }
        if (i > -1) {
          continue;
        }

        if (Constants.IMAGE_FORMATS.indexOf(v.substr(v.lastIndexOf('.') + 1, 3).toLowerCase()) !== -1) {
          this.columns[h] = { cls: ImageComponent, values: [] };
        } else if (first[h]['type'].localeCompare('typed-literal') === 0 || first[h]['type'].localeCompare('literal') === 0) {
          this.columns[h] = { cls: ValComponent, values: [] };
        } else {
          this.columns[h] = { cls: UrlComponent, values: [] };
        }
      } else {
        this.columns[h] = { cls: NullComponent, values: ['' + Object.keys(this.sparqlResult.results.bindings).length] };
      }
    }
  }

  parseResult() {
    for (const binding of this.sparqlResult.results.bindings) {
      for (const key of this.headers) {
        if (binding.hasOwnProperty(key)) {
          this.columns[key].values.push(binding[key].value);
        }
      }
    }
  }

  columnsKeys(): string[] {
    return Object.keys(this.columns);
  }

  createInjector(key: string): Injector {
    if (!this.componentInstances[key]) {
      const providers = [
        { provide: 'values', useValue: this.columns[key].values },
        { provide: 'ncolumns', useValue: this.headerLength() },
      ];
      const injector = Injector.create({ providers, parent: this.parentInjector });
      this.componentInstances[key] = injector;
    }
    return this.componentInstances[key];
  }
}
