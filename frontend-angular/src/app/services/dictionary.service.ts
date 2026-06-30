import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const API = `${environment.apiUrl}/api/dictionary`;
@Injectable({ providedIn: 'root' })
export class DictionaryService {
  constructor(private http: HttpClient) {}

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/items`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${API}/items`, data);
  }

  update(id: number | string, data: any): Observable<any> {
    return this.http.put(`${API}/items/${id}`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${API}/items/${id}`);
  }
}
