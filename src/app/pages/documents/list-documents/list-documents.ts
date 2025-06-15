import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentService, Document, DocumentStatus } from '../documents.service';
import { Subscription } from 'rxjs';
import { catchError, switchMap, tap, filter, take } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-list-documents',
  imports: [CommonModule, RouterModule],
  templateUrl: './list-documents.html',
  styleUrl: './list-documents.scss'
})
export class ListDocuments implements OnInit {
  documents: Document[] = [];
  loading = true;
  error: string | null = null;
  success: string | null = null;
  documentStatusMap: Record<string, DocumentStatus> = {}; // Track each document's status
  private ingestionSubscriptions: Record<string, Subscription> = {}; // Store subscriptions per document

  constructor(
    private documentsService: DocumentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.documentsService.getAllDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load documents';
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.documentsService.uploadDocument(formData).subscribe({
        next: (uploadedDoc) => {
          this.documents.push(uploadedDoc);
          this.success = "Document has been uploaded successfully"
          this.error = null;
        },
        error: (err) => {
          const msg = err?.error?.message;
          this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to upload document';
          this.success = null;
        }
      });
    }
  }

  onDelete(id: string) {
    this.documentsService.deleteDocument(id).subscribe({
      next: (data) => {
        // Remove the deleted document from the list
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.success = data.message || 'Document has been deleted successfully';
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to delete document';
        this.success = null;
      },
    });
  }

  onDownloadDocument(id: string) {
    this.documentsService.getDocumentUrlById(id).subscribe({
      next: (data) => {
        // Download document
        const link = document.createElement('a');
        link.href = data.url;
        link.target = '_blank'; // Optional: opens in a new tab
        link.download = '';     // Let browser handle the filename from response headers
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to download document';
        this.success = null;
      },
    });
  }

  onStartDocumentIngestion(id: string) {
    this.error = null;
    this.success = null;
    this.ingestionSubscriptions[id] = this.documentsService.triggerDocumentIngestion(id).pipe(
      tap((data) => {
        this.documentStatusMap[id] = DocumentStatus.INGESTING;
        const target = this.documents.find(doc => doc.id === id);
        if (target) {
          target.status = DocumentStatus.INGESTING;
          this.success = data.message;
        }
      }),
      switchMap(() =>
        this.documentsService.getDocumentIngestionStatus(id).pipe(
          filter(res => [DocumentStatus.INGESTED, DocumentStatus.FAILED].includes(res.status as DocumentStatus)),
          take(1),
          tap(res => {
            this.documentStatusMap[id] = res.status as DocumentStatus;
            this.ingestionSubscriptions[id]?.unsubscribe();
            delete this.ingestionSubscriptions[id];
            const target = this.documents.find(doc => doc.id === res.documentId);
            if (target) {
              target.status = res.status as DocumentStatus;
              if (res.status as DocumentStatus == DocumentStatus.INGESTED)
                this.success = `Document "${target.fileName}" has been ingested successfully.`;
              else
                this.error = `Document "${target.fileName}" has been failed to ingest.`;

              this.cdr.markForCheck();
            }
          })
        )
      ),
      catchError(error => {
        this.success = null;
        this.error = error.message;
        this.documentStatusMap[id] = DocumentStatus.FAILED;
        return [];
      })
    ).subscribe(); // Subscribe here and store the subscription
  }
}
