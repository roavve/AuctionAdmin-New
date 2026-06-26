import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/registrations';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  getByStatus(status: string, page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${API}/${status}`, { params });
  }

  createCompany(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/createCompany`, {});
  }

  reject(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/reject`, {});
  }

  acceptPolicy(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/acceptPolicy`, {});
  }

  getFiles(id: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${API}/${id}/files`);
  }

  uploadFile(id: number | string, formData: FormData): Observable<any> {
    return this.http.post(`${API}/${id}/files`, formData);
  }

  deleteFile(fileId: number | string): Observable<any> {
    return this.http.delete(`${API}/files/${fileId}`);
  }

  download(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }
}
