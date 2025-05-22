import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImgpediaService {

  constructor(private http: HttpClient) {}

  runQuery(queryDTO: any): Observable<any> {
    return this.http.post(environment.IMGPEDIA_API_QUERY_URL, queryDTO, { responseType: 'text' });
  }

  stopQuery(clientQueryId: string): Observable<any> {
    return this.http.post(`${environment.IMGPEDIA_API_QUERY_URL}/stop`, { clientQueryId });
  }
}
