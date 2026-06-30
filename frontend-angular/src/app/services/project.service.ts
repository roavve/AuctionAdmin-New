import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = `${environment.apiUrl}/api/projects`;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${API}`);
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

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${API}/${id}`);
  }

  inviteCompanies(projectId: number | string, companyIds: number[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auctions/project/${projectId}/invite-companies`, { companyIds });
  }
}
