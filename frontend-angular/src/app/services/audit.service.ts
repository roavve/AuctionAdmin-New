import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = `${environment.apiUrl}/api/audit`;

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  private toParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(k => {
      if (params[k] != null && params[k] !== '') httpParams = httpParams.set(k, params[k]);
    });
    return httpParams;
  }

  search(params: any): Observable<any> { return this.http.get(`${API}`, { params: this.toParams(params) }); }
}
