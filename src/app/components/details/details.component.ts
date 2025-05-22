import { Component, OnInit } from '@angular/core';
import { ImgpediaImagesService } from '../../services/imgpedia-images.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ImgDetailInfo } from '../../models/img-detail-info.model';
import { SimilarInfo } from '../../models/similar-info.model';
import { Binding } from '../../models/imgpedia-image-binding-query.model';
import { Page } from '../../models/wiki-api-image-info.model';
import { Constants } from '../../util/constants.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { DUMMY_BINDINGS, DUMMY_DESCRIPTORS, DUMMY_IMG_DETAIL, DUMMY_SIMILARS_NAMES } from '../../util/dummy-data';
import { ImgpediaService } from '../../services/imgpedia.service';

@Component({
  selector: 'app-details',
  imports: [MatToolbarModule, MatCardModule, MatTabsModule, MatGridListModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {

  detail: ImgDetailInfo = new ImgDetailInfo();

  private similarsNames: string[] = [];

  descriptors: { [id: string]: SimilarInfo[] } = {};

  constructor(private http: ImgpediaImagesService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.descriptors = {};
    this.similarsNames = [];
    this.route.params.subscribe(params => {
      this.detail = new ImgDetailInfo();
      this.detail.fileName = params['filename'].replace(/&/g, '%26');
      this.detail.fileName = decodeURIComponent(this.detail.fileName);
      this.getImg();
      this.getImgInfoAndBindings();
    });
  }

  parseText(text: string) {
    return text
      .replace(/_/g, ' ').replace(/%26/g, '&');
  }

  getDescriptors(): string[] {
    return Object.keys(this.descriptors);
  }

  formatDescriptorName(descUrl: string): string {
    if (!descUrl) {
      return '';
    }
    const s = descUrl.split('#');
    return s[1] ? s[1].toUpperCase() : '';
  }

  associatedWith(): string[] {
    return Array.from(this.detail.associatedWith);
  }

  appearsIn(): string[] {
    return Array.from(this.detail.appearsIn);
  }

  addBinding(binding: Binding): void {
    if (this.getDescriptors().indexOf(binding.desc.value) === -1) {
      this.descriptors[binding.desc.value] = [];
    }
    this.descriptors[binding.desc.value].push(new SimilarInfo(binding.target.value, +binding.dist.value));
    this.similarsNames.push(binding.target.value);
  }

  addBindingUrl(page: Page, key: number): void {
    let i: number;
    const title: string = Constants.IMGPEDIA_URL_RESOURCE + page.title.split(':')[1].replace(/ /g, '_');
    let encodedTitle = this.http.normalizeUri(title);
    for (const desc in this.descriptors) {
      if (this.descriptors.hasOwnProperty(desc)) {
        for (i = 0; i < this.descriptors[desc].length; i++) {
          if (this.descriptors[desc][i].fileNameUrl === encodedTitle) {
            if (key >= 0) {
              this.descriptors[desc][i].thumbUrl = page.imageinfo[0].thumburl;
            } else {
              this.descriptors[desc][i].thumbUrl = Constants.IMG_MISSING_URL;
            }
          }
        }
      }
    }
  }

  getSimilarUrls(similars: string[]): void {
    for (let i = 0, j = similars.length; i < j; i += Constants.MAX_WIKI_REQUEST) {
      this.http.getSimilarImgInfo(similars.slice(i, i + Constants.MAX_WIKI_REQUEST), window.screen.width / 4)
        .subscribe(res => {
          const pages = res.query.pages;
          for (const key in pages) {
            if (pages.hasOwnProperty(key)) {
              this.addBindingUrl(pages[key], +key);
            }
          }
          this.sortSimilarsByDistance();
        },
        );
    }
  }

  sortSimilarsByDistance(): void {
    const compareFunction = function (a: SimilarInfo, b: SimilarInfo): number {
      return a.distance - b.distance;
    };
    for (const key in this.descriptors) {
      if (this.descriptors.hasOwnProperty(key)) {
        this.descriptors[key].sort(compareFunction);
      }
    }
  }

  
  getImg(): void {
    this.http.getImgUrl(this.detail.fileName, 400).subscribe(
      res => {
        const pages = res.query.pages;
        for (const key in pages) {
          if (pages.hasOwnProperty(key)) {
            if (+key >= 0) {
              this.detail.originalUrl = pages[key].imageinfo[0].url;
              this.detail.thumbUrl = pages[key].imageinfo[0].thumburl;
            } else {
              this.detail.thumbUrl = Constants.IMG_MISSING_BIG_URL;
              this.detail.originalUrl = Constants.IMG_MISSING_BIG_URL;
            }
          }
        }
      }
    );

    this.http.getImgInfo(this.detail.fileName).subscribe(
      res => {
        const results = res.results.bindings;
        for (const key in results) {
          if (results.hasOwnProperty(key)) {
            const r = results[key];
            if (r.dbp && r.dbp.value) {
              this.detail.associatedWith.add(r.dbp.value);
            }
            if (r.wiki && r.wiki.value) {
              this.detail.appearsIn.add(r.wiki.value);
            }
          }
        }
      }
    );
  }

  getImgInfoAndBindings(): void {
    this.http.getImgBindings(this.detail.fileName).subscribe(
      res => {
        const bindings = res.results.bindings;
        if (bindings.length > 0) {
          for (const key in bindings) {
            if (bindings.hasOwnProperty(key)) {
              this.addBinding(bindings[key]);
            }
          }
          this.getSimilarUrls(this.similarsNames);
        }
      }
    );
  }
}
