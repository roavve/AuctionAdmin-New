import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const API = `${environment.apiUrl}/api/companies`;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> { return this.http.get<any[]>(`${API}`); }
  getById(id: number | string): Observable<any> { return this.http.get(`${API}/${id}`); }
  create(data: any): Observable<any> { return this.http.post(`${API}`, data); }
  update(id: number | string, data: any): Observable<any> { return this.http.put(`${API}/${id}`, data); }
  cancel(id: number | string): Observable<any> { return this.http.post(`${API}/${id}/cancel`, {}); }
  invite(id: number | string): Observable<any> { return this.http.post(`${API}/${id}/invite`, {}); }

  getUsers(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/users`); }

  getFiles(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/files`); }
  uploadFile(id: number | string, formData: FormData): Observable<any> { return this.http.post(`${API}/${id}/files`, formData); }
  deleteFile(fileId: number | string): Observable<any> { return this.http.delete(`${API}/files/${fileId}`); }
  download(url: string): Observable<Blob> { return this.http.get(url, { responseType: 'blob' }); }

  getBidHistory(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/bid-history`); }
  getProjectStats(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/project-stats`); }
  getInvitations(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/invitations`); }

  getCategories(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/categories`); }
  addCategory(id: number | string, body: any): Observable<any> { return this.http.post(`${API}/${id}/categories`, body); }
  deleteCategory(companyId: number | string, companyCategoryId: number | string): Observable<any> {
    return this.http.delete(`${API}/${companyId}/categories/${companyCategoryId}`);
  }
}
