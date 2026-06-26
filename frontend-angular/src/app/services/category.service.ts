import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${API}`);
  }

  getParents(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/parents`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${API}`, data);
  }

  update(id: number | string, data: any): Observable<any> {
    return this.http.put(`${API}/${id}`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${API}/${id}`);
  }
}
