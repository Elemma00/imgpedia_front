import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { catchError, Subject, Subscription, takeUntil, throwError, timeout } from 'rxjs';
import { SparqlQueryDTO } from '../../../models/SparqlQueryDTO';
import { ImgpediaService } from '../../../services/imgpedia.service';
import { DUMMY_SPARQL_RESULT } from '../../../util/dummy-data';

@Component({
  selector: 'form-query',
  imports: [FormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit, OnDestroy {

  @Input() queryText!: string;
  @Input() loading!: boolean;

  @Output() resultsEmitter = new EventEmitter();
  @Output() stopEmitter = new EventEmitter();
  @Output() errorEmitter = new EventEmitter<string>();

  format: string = 'json';
  timeout: number = 0;
  clientQueryId: string = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private querySubscription!: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private imgpediaService: ImgpediaService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.stop();
    this.destroy$.next();
    this.destroy$.complete(); 
  }

  runQuery(queryForm: NgForm) {
    this.loading = true;

    if (queryForm.valid) {
      this.timeout = this.timeout == 0 ? 30 * 60 * 1000 : this.timeout;
      const backendFormat = this.format === 'noformat' ? 'json' : this.format;
      const queryDTO: SparqlQueryDTO = {
        query: this.queryText,
        format: backendFormat,
        timeout: this.timeout,
        clientQueryId: this.clientQueryId
      };
      console.log('Running query:', queryDTO);
      let query$ = this.imgpediaService.runQuery(queryDTO).pipe(
        takeUntil(this.destroy$)
      );

      // Ensure timeout is in milliseconds and positive
      console.log(`Running query with timeout: ${this.timeout} ms`);
      const timeoutMs = Number(this.timeout) > 0 ? Number(this.timeout) : 0;
      if (timeoutMs > 0) {
        console.log(`Setting timeout for query: ${timeoutMs} ms`);
        query$ = query$.pipe(timeout(timeoutMs));
      }

      this.querySubscription = query$
        .pipe(
          catchError(error => {
            console.log('error', error.error);
            if (error.name === 'TimeoutError') {
              console.error('Query timeout:', error);
              this.errorEmitter.emit('Query timeout exceeded.');
              this.stop();
            } else if (error.message && error.message.includes('ERR_CONNECTION_REFUSED')) {
              console.error('Connection error:', error);
              this.errorEmitter.emit('Failed to load resource: net::ERR_CONNECTION_REFUSED');
            } else if (error.error && error.error.includes('The query syntax is invalid')) {
              this.errorEmitter.emit(error.error);
              this.stop();
            } else {
              console.error(error.error || error);
              this.errorEmitter.emit(error.error);
              this.stop();
            }
            this.loading = false;
            return throwError(() => error);
          })
        )
        .subscribe({
          next: response => {
            this.formatHandler(response, this.format);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
    }
  }

  stop() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.loading = false;
      this.imgpediaService.stopQuery(this.clientQueryId).subscribe({
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
    if (format === 'noformat') {
      this.resultsEmitter.emit(response);
    } else if (format === 'json') {
      this.downloadFile(JSON.stringify(response, null, 2), 'json');
    } else {
      this.downloadFile(response, format);
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
