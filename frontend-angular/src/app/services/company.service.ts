import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/companies';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(API);
  }

  getById(id: number | string): Observable<any> {
    return this.http.get(`${API}/${id}`);
  }
}
