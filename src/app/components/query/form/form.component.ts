import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'form-query',
  imports: [FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {

  @Input() queryText!: string;
  @Output() resultsEmitter = new EventEmitter();

  format: String = 'json';
  timeout!: number;

  constructor() {
   }


  runQuery(queryForm: NgForm) {
    if (queryForm.valid) {
      console.log(this.queryText);
    }
  }
}
