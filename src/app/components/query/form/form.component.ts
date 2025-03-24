import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { catchError, Subscription, throwError, timeout } from 'rxjs';
import { SparqlQueryDTO } from '../../../models/SparqlQueryDTO';
import { ImgpediaService } from '../../../services/imgpedia.service';
import { DUMMY_SPARQL_RESULT } from '../../../util/dummy-data';

@Component({
  selector: 'form-query',
  imports: [FormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {

  @Input() queryText!: string;
  @Input() loading!: boolean;

  @Output() resultsEmitter = new EventEmitter();
  @Output() stopEmitter = new EventEmitter();
  @Output() errorEmitter = new EventEmitter<string>();


  format: string = 'json';
  timeout: number = 0;
  private querySubscription!: Subscription;


  constructor(private imgpediaService: ImgpediaService) { }

  ngOnInit(): void {
  }

  runQuery(queryForm: NgForm) {
    this.loading = true;

    if (queryForm.valid) {
      const queryDTO: SparqlQueryDTO = {
        query: this.queryText,
        format: this.format,
        timeout: this.timeout
      };

      console.log(queryDTO);
      // let response = DUMMY_SPARQL_RESULT;
      // this.resultsEmitter.emit(response);
      // this.loading = false;
      this.querySubscription = this.imgpediaService.runQuery(queryDTO)
        .pipe(
          this.timeout > 0 ? timeout(this.timeout) : source => source,
          catchError(error => {
            if (error.name === 'TimeoutError') {
              console.error('Query timeout:', error);
              this.stop();
            } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
              console.error('Connection error:', error);
              this.errorEmitter.emit('Failed to load resource: net::ERR_CONNECTION_REFUSED');
            } else {
              console.error(error.error);
              this.errorEmitter.emit(error.error);
            }
            this.loading = false;
            return throwError(() => new Error(error));
          })
        )
        .subscribe(response => {
          this.formatHandler(response, this.format);
          this.loading = false;
        });
    }
  }

  stop() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.loading = false;
      this.imgpediaService.stopQuery().subscribe({
        next: response => console.log(response),
        error: error => console.error('Error stop:', error)
      });
    }
  }

  reset(queryForm: NgForm) {
    this.stop();
    window.location.reload();
  }

  formatHandler(response: any, format: string) {
    switch (format) {
      case 'json':
        this.resultsEmitter.emit(response);
        break;
      case 'xml':
      case 'csv':
      case 'tsv':
        this.downloadFile(response, format);
        break;
      default:
        console.warn('Unknown format:', format);
    }
  }

  downloadFile(data: any, format: string) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
