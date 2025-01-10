import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { catchError, delay, Subscription, throwError, timeout } from 'rxjs';
import { SparqlQueryDTO } from '../../../models/SparqlQueryDTO';
import { ImgpediaService } from '../../../services/imgpedia.service';
import { CommonModule } from '@angular/common';

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

      this.querySubscription = this.imgpediaService.runQuery(queryDTO)
        .pipe(
          this.timeout > 0 ? timeout(this.timeout) : source => source,
          catchError(error => {
            if(error.name==='TimeoutError'){
              console.error('Query timeout:', error);
              this.stop();
            }else{
              console.error('Error:', error);
            }
            this.loading = false;
            return throwError(() => new Error(error));
          })
        )
        .subscribe(response => {
          this.resultsEmitter.emit(response);
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
}
