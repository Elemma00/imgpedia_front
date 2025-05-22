import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../util/constants.model';
import { Observable } from 'rxjs';
import { ImgpediaBindingQueryResult } from '../models/imgpedia-image-binding-query.model';
import { WikiApiConsult } from '../models/wiki-api-image-info.model';
import { ImgpediaDetailQueryResult } from '../models/imgpedia-image-detail-query.model';

@Injectable({
  providedIn: 'root'
})
export class ImgpediaImagesService {

  constructor(private http: HttpClient) {}

   getImgUrl(fileName: string, thumbWidth: number): Observable<WikiApiConsult> {
    return this.http.get<WikiApiConsult>(
      Constants.WIKI_API_IMAGE_INFO
        .replace('%', 'File:' + fileName)
        .replace('iiurlwidth=%', 'iiurlwidth=' + thumbWidth),
      { headers: Constants.CORS_HEADER }
    );
  }

  getImgInfo(fileName: string): Observable<ImgpediaDetailQueryResult> {
    let encodedFilename = this.normalizeUri(fileName);
    return this.getImageDetails(encodedFilename);
  }

  getImgBindings(fileName: string): Observable<ImgpediaBindingQueryResult> {
    let encodedFilename = this.normalizeUri(fileName);
    return this.getRelatedImages(encodedFilename);
  }

  getSimilarImgInfo(similars: string[], thumbWidht: number): Observable<WikiApiConsult> {
    let titles = '';
    for (let i = 0; i < similars.length; i++) {
      const ss = similars[i].split('/');
      const encoded = ss[ss.length - 1];
      let decodedFilename = decodeURIComponent(encoded);
      // titles += 'File:' + encoded.replace(/&/g, '%26') + '|';
      titles += 'File:' + decodedFilename + '|';
    }
    titles = titles.substr(0, titles.length - 1);
    return this.http.get<WikiApiConsult>(
      Constants.WIKI_API_IMAGE_INFO
        .replace('%', titles)
        .replace('iiurlwidth=%', 'iiurlwidth=' + thumbWidht),
      { headers: Constants.CORS_HEADER }
    );
  }

  executeSparqlQuery(query: string): Observable<any> {
    const requestBody = {
      query: query,
      format: Constants.SPARQL_CONFIG.format,
      timeout: Constants.SPARQL_CONFIG.timeout,
      clientQueryId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    console.log('Executing SPARQL query:', requestBody);
    return this.http.post(Constants.IMGPEDIA_SPARQL_ENDPOINT, requestBody, {
      headers: Constants.SPARQL_HEADERS
    });
  }

  getImageDetails(imageId: string): Observable<any> {
    const query = Constants.IMGPEDIA_QUERY_IMAGE_DETAIL.replace('XXXX', imageId);
    return this.executeSparqlQuery(query);
  }
  
  getRelatedImages(imageId: string): Observable<any> {
    const query = Constants.IMGPEDIA_QUERY_IMAGE_BINDINGS.replace('XXXX', imageId);
    return this.executeSparqlQuery(query);
  }
  
  normalizeUri(uri: string): string {
    return uri.replace(/"/g, '%22')
              .replace(/\[/g, '%5B')
              .replace(/\]/g, '%5D')
              .replace(/ /g, '%20')
              .replace(/</g, '%3C')
              .replace(/>/g, '%3E')
              .replace(/{/g, '%7B')
              .replace(/}/g, '%7D')
              .replace(/\|/g, '%7C')
              .replace(/\\/g, '%5C')
              .replace(/\^/g, '%5E')
              .replace(/`/g, '%60')
              .replace(/'/g, '%27')
              .replace(/\n/g, '%0A')
              .replace(/\r/g, '%0D')
              .replace(/\t/g, '%09');
  }
}
