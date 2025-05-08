import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SparqlResult } from '../../../models/SparqlResult';
import { VisualResultsComponent } from './visual-results/visual-results.component';

@Component({
  selector: 'results',
  imports: [CommonModule, FormsModule, MatPaginatorModule, VisualResultsComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit, OnChanges{
  @Input() sparqlResult!: SparqlResult;
  
  selectedView: string = 'table'; // view por defecto
  pageIndex: number = 0;
  pageSize: number = 50;
  paginatedResults: any[] = [];
  hasVisualResults!: boolean

  private imageExtensions = ['jpg', 'jpeg', 'png'];

  @ViewChild('resultsContainer', { static: true }) resultsContainer!: ElementRef;

  ngOnInit(): void {
    this.updatePaginatedResults();
    this.checkForImages();
    this.scrollToResults();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sparqlResult'] && changes['sparqlResult'].currentValue) {
      this.resetState();
      this.updatePaginatedResults();
      this.checkForImages();
      this.scrollToResults();
    }
  }

  setView(view: string) {
    this.selectedView = view;
  }

  updatePaginatedResults(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedResults = this.sparqlResult.results.bindings.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedResults();
  }

  isUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  private resetState(): void {
    this.pageIndex = 0;
    this.paginatedResults = [];
    this.selectedView = 'visual';
  }

  private scrollToResults(): void {
    setTimeout(() => {
      this.resultsContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  private checkForImages(): void {

    this.hasVisualResults = false;
    
    for (const row of this.sparqlResult.results.bindings) {
      for (const column of this.sparqlResult.head.vars) {
        const cellValue = row[column]?.value;
        if (cellValue && this.isUrl(cellValue)) {
          const extension = cellValue.split('.').pop()?.toLowerCase();
          if (extension && this.imageExtensions.includes(extension)) {
            this.hasVisualResults = true;
            break;
          }
        }
      }
      if (this.hasVisualResults) break; 
    }
    
    this.selectedView = this.hasVisualResults ? 'visual' : 'table';
  }
  
}
