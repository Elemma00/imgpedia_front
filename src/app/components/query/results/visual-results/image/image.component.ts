import { Component, Inject, Input, OnInit } from '@angular/core';
import { FilenameThumbnail } from '../../../../../models/filename-thumbnail.model';
import { ImgpediaImagesService } from '../../../../../services/imgpedia-images.service';
import { Constants } from '../../../../../util/constants.model';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'image',
  imports: [MatGridListModule, MatCardModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
  thumbs: FilenameThumbnail[] = [];
  rowHeight = Constants.QUERY_RESULT_ROW_HEIGHT;
  private isInitialized = false;

  private _fileNames: Array<string> = [];

  constructor(
    private http: ImgpediaImagesService,
    @Inject('values') public values: any[],
    @Inject('ncolumns') public ncolumns: number
  ) { }

  ngOnInit() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.cleanValues();
      this.thumbs = new Array<FilenameThumbnail>(this.values.length);
      for (const v in this.values) {
        if (this.values.hasOwnProperty(v)) {
          const s = this.values[v].split('/');
          const filename = s[s.length - 1];
          let i;
          if ((i = filename.indexOf('File:')) === 0) {
            this._fileNames.push(filename.substr(5));
          } else {
            this._fileNames.push(filename);
          }
        }
      }
      this.getImgsUrls(0);
    }
  }

  cleanValues() {
    for (const v in this.values) {
      if (this.values.hasOwnProperty(v)) {
        const s = this.values[v].split('/');
        let newValue = s[s.length - 1];
        if (newValue.indexOf('File:') > -1) {
          newValue = newValue.substr(5);
        }
        this.values[v] = newValue;
      }
    }
  }

  getImageIndexes(title: string): number[] {
    const r: number[] = [];
    const a_fileNames = Array.from(this._fileNames);
    const t = title.substr(5).replace(/ /g, '_');
    for (let i = 0; i < a_fileNames.length; i++) {
      if (a_fileNames[i].localeCompare(t) === 0) {
        r.push(i);
      }
    }
    return r;
  }

  getImgsUrls(initIndex: number) {
    const a_fileNames = this._fileNames.slice(initIndex, initIndex + Constants.MAX_WIKI_REQUEST);
    this.http.getSimilarImgInfo(a_fileNames, 300).subscribe(res => {
      const pages = res.query.pages;
      for (const key in pages) {
        if (pages.hasOwnProperty(key)) {
          const indexes = this.getImageIndexes(pages[key].title);
          if (+key >= 0) {
            for (const k in indexes) {
              if (indexes[k] < this.values.length) {
                this.thumbs[indexes[k]] = {
                  fileName: pages[key].title.substr(5).replace(/ /g, '_'),
                  thumb: pages[key].imageinfo[0].thumburl
                };
              }
            }
          } else {
            for (const k in indexes) {
              if (indexes[k] < this.values.length) {
                this.thumbs[indexes[k]] = { fileName: pages[key].title.substr(5), thumb: Constants.IMG_MISSING_URL };
              }
            }
          }
        }
      }
      if (initIndex + Constants.MAX_WIKI_REQUEST < this.values.length) {
        this.getImgsUrls(initIndex + Constants.MAX_WIKI_REQUEST);
      }
    });
  }

  getGridCols(): number {
    // Ajusta el número de columnas según el tamaño de pantalla o tus necesidades.
    return window.innerWidth > 768 ? 3 : 1;
  }
}