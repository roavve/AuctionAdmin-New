import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/auctions';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  constructor(private http: HttpClient) {}

  private toParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(k => {
      if (params[k] != null && params[k] !== '') {
        httpParams = httpParams.set(k, params[k]);
      }
    });
    return httpParams;
  }

  search(params: any): Observable<any> {
    return this.http.get(`${API}`, { params: this.toParams(params) });
  }

  getById(id: number | string): Observable<any> {
    return this.http.get(`${API}/${id}`);
  }

  monitor(type: string, params: any): Observable<any> {
    return this.http.get(`${API}/monitor/${type}`, { params: this.toParams(params) });
  }
}
