import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/users';

@Injectable({ providedIn: 'root' })
export class UserService {
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

  create(data: any): Observable<any> {
    return this.http.post(`${API}`, data);
  }

  update(id: number | string, data: any): Observable<any> {
    return this.http.put(`${API}/${id}`, data);
  }

  lock(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/lock`, {});
  }

  unlock(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/unlock`, {});
  }

  cancel(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/cancel`, {});
  }

  changePassword(id: number | string, password: string): Observable<any> {
    return this.http.post(`${API}/${id}/changePassword`, { password });
  }
}
