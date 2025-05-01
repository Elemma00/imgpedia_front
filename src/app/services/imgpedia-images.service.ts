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
      Constants.WIKI_API_IMAGE_INFO.replace('%', 'File:' + fileName).replace('iiurlwidth=%', 'iiurlwidth=' + thumbWidth),
      {headers: Constants.CORS_HEADER});
  }

  getImgInfo(fileName: string): Observable<ImgpediaDetailQueryResult> {
    // return this.http.get<ImgpediaDetailQueryResult>(Constants.IMGPEDIA_URL_IMAGE_DETAIL.replace('XXXX', fileName), {headers: Constants.CORS_HEADER});
    return this.getImageDetails(fileName);
  }

  getImgBindings(fileName: string): Observable<ImgpediaBindingQueryResult> {
    // return this.http.get<ImgpediaBindingQueryResult>(Constants.IMGPEDIA_URL_IMAGE_BINDINGS.replace('XXXX',  fileName), {headers: Constants.CORS_HEADER});
    return this.getRelatedImages(fileName);
  }

  getSimilarImgInfo(similars: string[], thumbWidht: number): Observable<WikiApiConsult> {
    let titles = '';
    for (let i = 0; i < similars.length; i++) {
      const ss = similars[i].split('/');
      titles += 'File:' + ss[ss.length - 1].replace(/&/g, '%26') + '|';
    }
    titles = titles.substr(0, titles.length - 1);
    return this.http.get<WikiApiConsult>(Constants.WIKI_API_IMAGE_INFO.replace('%', titles).replace('iiurlwidth=%', 'iiurlwidth=' + thumbWidht),
      {headers: Constants.CORS_HEADER});
  }
  
  executeSparqlQuery(query: string): Observable<any> {
    const requestBody = {
      query: query,
      format: Constants.SPARQL_CONFIG.format,
      timeout: Constants.SPARQL_CONFIG.timeout
    };
    console.log('Executing SPARQL query:', requestBody);
    console.log('SPARQL endpoint:', Constants.IMGPEDIA_SPARQL_ENDPOINT);
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
}
