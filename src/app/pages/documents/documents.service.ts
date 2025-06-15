import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum DocumentStatus {
  PENDING = 'pending',
  INGESTING = 'ingesting',
  INGESTED = 'ingested',
  FAILED = 'failed',
}

export interface Document {
  id: string;
  fileName: string;
  type: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = environment.apiUrl  + '/documents';

  constructor(private http: HttpClient) { }

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl, { withCredentials: true });
  }

  getDocumentUrlById(id: string): Observable<{url: string}> {
    return this.http.get<{url: string}>(`${this.apiUrl}/download/${id}`, { withCredentials: true });
  }

  uploadDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData, { withCredentials: true });
  }

  deleteDocument(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  triggerDocumentIngestion(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/ingest/${id}`, {}, { withCredentials: true });
  }

  getDocumentIngestionStatus(id: string): Observable<{ documentId: string, status: string }> {
    return new Observable(observer => {
      const eventSource = new EventSource(`${this.apiUrl}/ingest/status/${id}/stream`, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (err) {
          observer.error('Failed to parse SSE data: ' + err);
        }
      };

      eventSource.onerror = (err) => {
        observer.error('EventSource error: ' + JSON.stringify(err));
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }  
}
