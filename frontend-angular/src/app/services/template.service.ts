import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const API = `${environment.apiUrl}/api/templates`;
@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${API}`);
  }

  update(id: number | string, data: any): Observable<any> {
    return this.http.put(`${API}/${id}`, data);
  }
}
