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
    fileName = encodeURIComponent(fileName);
    return this.http.get<WikiApiConsult>(
      Constants.WIKI_API_IMAGE_INFO
        .replace('%', 'File:' + fileName)
        .replace('iiurlwidth=%', 'iiurlwidth=' + thumbWidth),
      { headers: Constants.CORS_HEADER }
    );
  }

  getImgInfo(fileName: string): Observable<ImgpediaDetailQueryResult> {
    let encodedFilename = encodeURIComponent(fileName);
    return this.getImageDetails(encodedFilename);
  }

  getImgBindings(fileName: string): Observable<ImgpediaBindingQueryResult> {
    let encodedFilename = encodeURIComponent(fileName);
    return this.getRelatedImages(encodedFilename);
  }

  getSimilarImgInfo(similars: string[], thumbWidht: number): Observable<WikiApiConsult> {
    let titles = '';
    for (let i = 0; i < similars.length; i++) {
      const ss = similars[i].split('/');
      const encoded = ss[ss.length - 1];
      let decodedFilename = decodeURIComponent(encoded);
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
    return this.http.post(Constants.IMGPEDIA_SPARQL_ENDPOINT, requestBody, {
      headers: Constants.SPARQL_HEADERS
    });
  }

  getImageDetails(imageId: string): Observable<any> {
    let encodedImageId = encodeURI(imageId);
    const query = Constants.IMGPEDIA_QUERY_IMAGE_DETAIL.replace('XXXX', encodedImageId);
    return this.executeSparqlQuery(query);
  }
  
  getRelatedImages(imageId: string): Observable<any> {
    let encodedImageId = encodeURI(imageId);
    const query = Constants.IMGPEDIA_QUERY_IMAGE_BINDINGS.replace('XXXX', encodedImageId);
    return this.executeSparqlQuery(query);
  }
  
}
