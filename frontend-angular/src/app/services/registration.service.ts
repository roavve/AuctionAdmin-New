import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/registrations';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  getByStatus(status: 'new' | 'processed' | 'cancelled', page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${API}/${status}`, { params });
  }
}
