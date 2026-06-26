import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/auctions/comments';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  getByStatus(status: string, page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${API}/${status}`, { params });
  }

  cancel(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/cancel`, {});
  }

  approve(id: number | string): Observable<any> {
    return this.http.post(`${API}/${id}/approve`, {});
  }

  answer(id: number | string, text: string): Observable<any> {
    return this.http.post(`${API}/${id}/answer`, { text });
  }
}
