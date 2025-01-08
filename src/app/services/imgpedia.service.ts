import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImgpediaService {

  constructor(private http: HttpClient) {}

  runQuery(queryDTO: any): Observable<any> {
    return this.http.post(environment.IMGPEDIA_API_QUERY_URL, queryDTO, { responseType: 'text' });
  }

  stopQuery(){
    return this.http.post(`${environment.IMGPEDIA_API_QUERY_URL}/stop`, {});
  }
}
