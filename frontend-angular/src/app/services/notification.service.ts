import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const API = `${environment.apiUrl}/api/notifications`;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  search(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${API}`, { params });
  }
}
