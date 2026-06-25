import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/auctions';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  constructor(private http: HttpClient) {}

  search(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(k => {
      if (params[k] != null && params[k] !== '') {
        httpParams = httpParams.set(k, params[k]);
      }
    });
    return this.http.get(`${API}`, { params: httpParams });
  }

  getById(id: number | string): Observable<any> {
    return this.http.get(`${API}/${id}`);
  }
}
