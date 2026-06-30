import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = `${environment.apiUrl}/api/auctions`;

@Injectable({ providedIn: 'root' })
export class AuctionService {
  constructor(private http: HttpClient) {}

  private toParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(k => {
      if (params[k] != null && params[k] !== '') httpParams = httpParams.set(k, params[k]);
    });
    return httpParams;
  }

  search(params: any): Observable<any> { return this.http.get(`${API}`, { params: this.toParams(params) }); }
  getById(id: number | string): Observable<any> { return this.http.get(`${API}/${id}`); }
  monitor(type: string, params: any): Observable<any> { return this.http.get(`${API}/monitor/${type}`, { params: this.toParams(params) }); }

  create(data: any): Observable<any> { return this.http.post(`${API}`, data); }
  update(id: number | string, data: any): Observable<any> { return this.http.put(`${API}/${id}`, data); }
  delete(id: number | string): Observable<any> { return this.http.delete(`${API}/${id}`); }

  activate(id: number | string): Observable<any> { return this.http.post(`${API}/${id}/activate`, {}); }
  close(id: number | string): Observable<any> { return this.http.post(`${API}/${id}/close`, {}); }
  cancel(id: number | string): Observable<any> { return this.http.post(`${API}/${id}/cancel`, {}); }

  getBids(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/bids`); }
  cancelBid(bidId: number | string): Observable<any> { return this.http.post(`${API}/bids/${bidId}/cancel`, {}); }

  getInvitations(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/invitations`); }
  cancelInvitation(invId: number | string): Observable<any> { return this.http.post(`${API}/invitations/${invId}/cancel`, {}); }
  closeInvitation(invId: number | string): Observable<any> { return this.http.post(`${API}/invitations/${invId}/close`, {}); }
  inviteCompanies(id: number | string, companyIds: number[]): Observable<any> { return this.http.post(`${API}/${id}/invite-companies`, { companyIds }); }

  getParticipants(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/participants`); }
  setWinner(participantId: number | string): Observable<any> { return this.http.post(`${API}/participants/${participantId}/winner`, {}); }

  getComments(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/comments`); }
  getRevisions(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/revisions`); }

  getFiles(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/files`); }
  uploadFile(id: number | string, fd: FormData): Observable<any> { return this.http.post(`${API}/${id}/files`, fd); }
  deleteFile(fileId: number | string): Observable<any> { return this.http.delete(`${API}/files/${fileId}`); }

  getInternalFiles(id: number | string): Observable<any[]> { return this.http.get<any[]>(`${API}/${id}/internal-files`); }
  uploadInternalFile(id: number | string, fd: FormData): Observable<any> { return this.http.post(`${API}/${id}/internal-files`, fd); }
  deleteInternalFile(fileId: number | string): Observable<any> { return this.http.delete(`${API}/internal-files/${fileId}`); }

  download(url: string): Observable<Blob> { return this.http.get(url, { responseType: 'blob' }); }
}
