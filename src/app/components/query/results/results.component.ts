import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'results',
  imports: [CommonModule, FormsModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent {
  selectedView: string = 'table'; // Valor predeterminado
  tableColumns: string[] = ['Column 1', 'Column 2', 'Column 3']; // Ejemplo de columnas
  tableData: any[][] = [
    ['Data 1', 'Data 2', 'Data 3'],
    ['Data 4', 'Data 5', 'Data 6'],
    ['Data 7', 'Data 8', 'Data 9']
  ]; // Ejemplo de datos de tabla

  constructor() { }

  setView(view: string) {
    this.selectedView = view;
  }
}
