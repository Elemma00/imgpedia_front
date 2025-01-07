import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { catchError, throwError } from 'rxjs';
import { SparqlQueryDTO } from '../../../models/SparqlQueryDTO';
import { ImgpediaService } from '../../../services/imgpedia.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-query',
  imports: [FormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit{

  @Input() queryText!: string;
  @Input() loading!: boolean;

  @Output() resultsEmitter = new EventEmitter();
  @Output() stopEmitter = new EventEmitter();


  format: string = 'json';
  timeout: number = 0;

  constructor(private imgpediaService: ImgpediaService) {}

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

      this.imgpediaService.runQuery(queryDTO)
        .pipe(
          catchError(error => {
            console.error('Query error:', error);
            this.loading = false;
            return throwError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          this.resultsEmitter.emit(response);
          this.loading = false;
        });
    }
  }

  stop(){};

  reset(){};
}
