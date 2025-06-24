import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SparqlResult } from '../../../models/SparqlResult';
import { VisualResultsComponent } from './visual-results/visual-results.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'results',
  imports: [CommonModule, FormsModule, MatPaginatorModule, VisualResultsComponent, RouterModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit, OnChanges{
  @Input() sparqlResult!: SparqlResult;
  
  selectedView: string = 'table'; // view por defecto
  pageIndex: number = 0;
  pageSize: number = 50;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  paginatedResults: any[] = [];
  hasVisualResults!: boolean

  private imageExtensions = ['jpg', 'jpeg', 'png'];

  @ViewChild('resultsContainer', { static: true }) resultsContainer!: ElementRef;

  ngOnInit(): void {
    this.setDynamicPageSize();
    this.updatePaginatedResults();
    this.checkForImages();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sparqlResult'] && changes['sparqlResult'].currentValue) {
      this.resetState();
      this.updatePaginatedResults();
      this.checkForImages();
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

  isImgpediaResource(value: string): boolean {
    return typeof value === 'string' && value.startsWith('http://imgpedia.dcc.uchile.cl/resource/');
  }

  getImgpediaResourceName(value: string): string {
    // Devuelve solo el nombre del recurso después de la última barra
    return value.substring(value.lastIndexOf('/') + 1);
  }

  isNumberValue(value: any): boolean {
    return value !== null && value !== undefined && !isNaN(Number(value)) && value.trim() !== '';
  }

  formatNumber(value: any): string {
    // Puedes ajustar los decimales según lo que prefieras
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 6});
  }


  private resetState(): void {
    this.pageIndex = 0;
    this.paginatedResults = [];
    this.selectedView = 'visual';
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

  setDynamicPageSize() {
    const total = this.sparqlResult?.results?.bindings?.length || 0;
    if (total <= 10) {
      this.pageSize = total || 1;
      this.pageSizeOptions = [this.pageSize];
    } else if (total <= 25) {
      this.pageSize = 10;
      this.pageSizeOptions = [10, total];
    } else if (total <= 50) {
      this.pageSize = 25;
      this.pageSizeOptions = [10, 25, total];
    } else if (total <= 100) {
      this.pageSize = 50;
      this.pageSizeOptions = [10, 25, 50, total];
    } else {
      this.pageSize = 50;
      this.pageSizeOptions = [10, 25, 50, 100, total];
    }
  }
  
}
