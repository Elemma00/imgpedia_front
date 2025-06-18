import { Component, OnDestroy, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-details',
  imports: [MatToolbarModule, MatCardModule, MatTabsModule, MatGridListModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit, OnDestroy {

  detail: ImgDetailInfo = new ImgDetailInfo();

  private similarsNames: string[] = [];

  descriptors: { [id: string]: SimilarInfo[] } = {};
  
  appearsInFolded = true;
  appearsInMax = 5;
  associatedWithFolded = true;
  associatedWithMax = 5;

  constructor(private http: ImgpediaImagesService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.detail = new ImgDetailInfo();
      this.descriptors = {};
      this.similarsNames = [];
      this.detail.fileName = params['filename'].replace(/&/g, '%26');
      this.detail.fileName = decodeURIComponent(this.detail.fileName);
      this.getImg();
      setTimeout(() => {
        this.getImgInfoAndBindings();
      }, 500);
    });
  }

  ngOnDestroy() {
    this.detail = new ImgDetailInfo();
    this.descriptors = {};
    this.similarsNames = [];
  }

  parseText(text: string) {
    return text
      .replace(/_/g, ' ').replace(/%26/g, '&');
  }

  getDescriptors(): string[] {
    return Array.from(new Set(Object.keys(this.descriptors)));
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
    if (!this.similarsNames.includes(binding.target.value)) {
      this.similarsNames.push(binding.target.value);
    }
  }

  addBindingUrl(page: Page, key: number): void {
    const title = Constants.IMGPEDIA_URL_RESOURCE + page.title.split(':')[1].replace(/ /g, '_');
    const decodedTitle = decodeURIComponent(title);

    for (const desc in this.descriptors) {
      if (this.descriptors.hasOwnProperty(desc)) {
        
        const similar = this.descriptors[desc].find(
          s => decodeURIComponent(s.fileNameUrl) === decodedTitle
        );

        if (similar) {
          similar.thumbUrl = key >= 0 ? page.imageinfo[0].thumburl : Constants.IMG_MISSING_URL;
        }
      }
    }
  }

  getSimilarUrls(similars: string[]): void {
    for (let i = 0, j = similars.length; i < j; i += Constants.MAX_WIKI_REQUEST) {
      this.http.getSimilarImgInfo(similars.slice(i, i + Constants.MAX_WIKI_REQUEST), window.screen.width / 4)
        .subscribe(res => {
          const pages = res.query.pages;
          // console.log('Retrieved similar image URLs:', pages);
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

    let attempts = 0;
    const maxAttempts = 3;

    const tryRequest = () => {
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
      },
      error => {
        attempts++;
        if (error.status === 200) {
        return;
        }
        if (attempts < maxAttempts) {
        tryRequest();
        } else {
        throw error;
        }
      }
      );
    };

    tryRequest();
  }

  getImgInfoAndBindings(): void {
    let attempts = 0;
    const maxAttempts = 3;

    const tryRequest = () => {
      this.http.getImgBindings(this.detail.fileName).subscribe(
        res => {
          const bindings = res.results.bindings;
          if (bindings.length > 0) {
            for (const key in bindings) {
              if (bindings.hasOwnProperty(key)) {
                this.addBinding(bindings[key]);
              }
            }
            this.similarsNames = [...new Set(this.similarsNames)];
            this.getSimilarUrls(this.similarsNames);
          }
        },
        error => {
          attempts++;
          if (error.status === 200) {
            // Treat as success if status is 200 OK
            return;
          }
          if (attempts < maxAttempts) {
            tryRequest();
          } else {
            // Only throw error after 3 failed attempts and not 200 OK
            throw error;
          }
        }
      );
    };

    tryRequest();
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'img/missing-min.png';
  }

  get appearsInVisible(): string[] {
    const all = this.appearsIn();
    return this.appearsInFolded && all.length > this.appearsInMax
      ? all.slice(0, this.appearsInMax)
      : all;
  }

  get associatedWithVisible(): string[] {
    const all = this.associatedWith();
    return this.associatedWithFolded && all.length > this.associatedWithMax
      ? all.slice(0, this.associatedWithMax)
      : all;
  }

  scrollToLinks() {
  const section = document.querySelector('.links-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
}

